import { createRequire } from "node:module";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import z from "@deepseek-ai/schemastery";
import { CommandDefinitionId } from "@deepseek-ai/dsh-commands";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { Context } from "@deepseek-ai/cordis";
import SkillRegistry from "@deepseek-ai/dsh-skill";
import * as SkillFileSystem from "@deepseek-ai/dsh-skill-filesystem";
import { FsError } from "@deepseek-ai/dsh-fs";
import { SessionId } from "@deepseek-ai/dsh-session";
//#region lib/types/mount.js
/**
* Resolve the mount the preset rows read.
* A missing host value falls through to the process environment, then bundled.
* @param hostMount - `writerHost.skillMount` when the service is visible.
* @param envMount - `DSH_WRITER_SKILL_MOUNT` when the service is not visible yet.
* @returns the mount that may copy skills or set `bundledSkillDir`.
*/
function writerSkillMount(hostMount, envMount) {
	return (hostMount ?? envMount ?? "bundled") === "workspace" ? "workspace" : "bundled";
}
/**
* Whether one skill-filesystem preset row stays disabled.
* Workspace enables the default-root row. Bundled enables only the row that sets `bundledSkillDir`.
* @param mount - active mount.
* @param row - which preset row is being considered.
* @returns true when that row must not load.
*/
function skillFilesystemRowDisabled(mount, row) {
	return row === "workspace" ? mount === "bundled" : mount !== "bundled";
}
//#endregion
//#region lib/types/request-trust.js
function header(headers, name) {
	if (headers instanceof Headers) return headers.get(name) ?? void 0;
	const value = headers[name];
	return typeof value === "string" ? value : void 0;
}
function parseAuthority(authority) {
	try {
		return new URL(`http://${authority}`);
	} catch {
		return;
	}
}
function canonicalAuthority(entry, url) {
	const port = url.port !== "" ? url.port : new URL(`https://${entry}`).port;
	return port === "" ? url.hostname : `${url.hostname}:${port}`;
}
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	const parts = hostname.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/u.test(part) && Number(part) <= 255);
}
function isTrustedAuthority(host, trustedHosts) {
	return trustedHosts.some((entry) => {
		const candidate = parseAuthority(entry);
		if (candidate === void 0) return false;
		return canonicalAuthority(entry, candidate) === candidate.hostname ? candidate.hostname === host.hostname : candidate.host === host.host;
	});
}
/**
* Reject a trustedHosts entry that is not a bare host or host:port.
* @param entry - one configured authority.
*/
function assertTrustedWriterAuthority(entry) {
	const url = parseAuthority(entry);
	if (url !== void 0 && canonicalAuthority(entry, url) === entry.toLocaleLowerCase()) return;
	throw new Error(`writer: trustedHosts entry ${JSON.stringify(entry)} is not a bare host[:port] authority`);
}
/**
* Accept loopback and configured authorities, and reject cross-site browser requests.
* @param request - the incoming request.
* @param trustedHosts - extra authorities from plugin config.
* @returns whether the write route may run.
*/
function isTrustedWriterRequest(request, trustedHosts) {
	const authority = header(request.headers, "host");
	if (authority === void 0) return false;
	const host = parseAuthority(authority);
	if (host === void 0) return false;
	if (!isLoopbackHostname(host.hostname) && !isTrustedAuthority(host, trustedHosts)) return false;
	if (header(request.headers, "sec-fetch-site") === "cross-site") return false;
	const origin = header(request.headers, "origin");
	if (origin === void 0) return true;
	try {
		return new URL(origin).host === host.host;
	} catch {
		return false;
	}
}
//#endregion
//#region lib/types/skills-dir.js
/**
* Absolute directory of the skills shipped in this package.
* The preset uses the same resolution: `createRequire(baseUrl).resolve` the package manifest, then join `skills`.
* @param baseUrl - a file URL or path from which this package can be resolved. Defaults to this module.
* @returns the absolute `skills` directory.
*/
function packageSkillsDir(baseUrl = import.meta.url) {
	const manifest = createRequire(baseUrl).resolve("@winterhuan/dsh-writer/package.json");
	return join(dirname(manifest), "skills");
}
//#endregion
//#region lib/types/sync-gate.js
/**
* Which preset should gate the workspace skill copy.
* Prefer an event hint and the live composed preset over the frozen session header.
* @param input - event, live composition, and header preset candidates.
* @returns first available preset, or undefined when none was supplied.
*/
function resolveWriterSyncPreset(input) {
	if (input.eventPreset !== void 0) return input.eventPreset;
	if (input.composedPreset !== void 0) return input.composedPreset;
	return input.headerPreset;
}
//#endregion
//#region lib/types/sync-skills.js
/**
* Nearest ancestor containing `.git`, or the workspace directory itself.
* @param workspaceDir - session working directory.
* @returns the root used by filesystem skill discovery.
*/
async function projectRootFor(workspaceDir) {
	let current = resolve(workspaceDir);
	const start = current;
	for (;;) try {
		await stat(join(current, ".git"));
		return current;
	} catch (error) {
		if (!isMissing(error)) throw error;
		const parent = resolve(current, "..");
		if (parent === current) return start;
		current = parent;
	}
}
function isMissing(error) {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}
async function directory(path) {
	try {
		const entry = await lstat(path);
		if (entry.isSymbolicLink() || !entry.isDirectory()) throw new Error(`Expected an ordinary directory: ${path}`);
		return true;
	} catch (error) {
		if (isMissing(error)) return false;
		throw error;
	}
}
async function ordinaryTree(path) {
	const entry = await lstat(path);
	if (entry.isSymbolicLink()) throw new Error(`Skill operations do not follow symbolic links: ${path}`);
	if (entry.isDirectory()) for (const child of await readdir(path)) await ordinaryTree(join(path, child));
	else if (!entry.isFile()) throw new Error(`Unsupported skill entry: ${path}`);
}
/**
* Names of ordinary packaged directories containing `SKILL.md`.
* @param sourceDir - packaged skills root.
* @returns sorted skill names; symlink entries are excluded.
*/
async function packagedSkillNames(sourceDir) {
	const names = [];
	for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		try {
			if ((await lstat(join(sourceDir, entry.name, "SKILL.md"))).isFile()) names.push(entry.name);
		} catch (error) {
			if (!isMissing(error)) throw error;
		}
	}
	return names.sort();
}
const pending = /* @__PURE__ */ new Map();
async function serialize(root, action) {
	const result = (pending.get(root) ?? Promise.resolve()).then(action);
	const settled = result.then(() => {}, () => {});
	pending.set(root, settled);
	try {
		return await result;
	} finally {
		if (pending.get(root) === settled) pending.delete(root);
	}
}
function overlaps(a, b) {
	return a === b || a.startsWith(b + sep) || b.startsWith(a + sep);
}
async function destinations(root) {
	const agents = join(root, ".agents");
	const destination = join(agents, "skills");
	const backups = join(agents, "writer-skill-backups");
	for (const path of [
		agents,
		destination,
		backups
	]) if (!await directory(path)) await mkdir(path);
	return {
		destination,
		backups
	};
}
async function replaceSkill(source, target, backup) {
	const stage = await mkdtemp(join(resolve(target, ".."), ".writer-stage-"));
	const stagedSkill = join(stage, "skill");
	try {
		await cp(source, stagedSkill, {
			recursive: true,
			errorOnExist: true,
			force: false,
			dereference: false
		});
		await ordinaryTree(stagedSkill);
		if (backup !== void 0) await rename(target, backup);
		try {
			await rename(stagedSkill, target);
		} catch (error) {
			if (backup !== void 0) await rename(backup, target);
			throw error;
		}
	} finally {
		await rm(stage, {
			recursive: true,
			force: true
		});
	}
}
/**
* Copy Writer skills, preserving every replaced directory in a separate backup batch.
* All source and destination trees are validated before the first replacement.
* @param options - package source, session directory and explicit replacement choice.
* @returns copied/skipped names and the backup path when previous copies existed.
*/
async function syncWriterSkills(options) {
	const root = await realpath(await projectRootFor(options.workspaceDir));
	return serialize(root, async () => {
		const source = await realpath(options.sourceDir);
		if (overlaps(source, join(root, ".agents", "skills"))) throw new Error("Packaged and workspace skill directories must not overlap.");
		const { destination, backups } = await destinations(root);
		const names = await packagedSkillNames(source);
		const copied = [];
		const skipped = [];
		const existing = [];
		for (const name of names) {
			await ordinaryTree(join(source, name));
			if (await directory(join(destination, name))) {
				if (!options.force) {
					skipped.push(name);
					continue;
				}
				await ordinaryTree(join(destination, name));
				existing.push(name);
			}
			copied.push(name);
		}
		const backupPath = existing.length > 0 ? await mkdtemp(join(backups, "sync-")) : void 0;
		try {
			for (const name of copied) await replaceSkill(join(source, name), join(destination, name), backupPath !== void 0 && existing.includes(name) ? join(backupPath, name) : void 0);
		} catch (error) {
			throw new Error(`Skill sync stopped. Previous copies remain in place or in ${backupPath ?? destination}.`, { cause: error });
		}
		return {
			root,
			destination,
			copied,
			skipped,
			...backupPath === void 0 ? {} : { backupPath }
		};
	});
}
/**
* Move only package-named workspace skills to a recoverable backup batch.
* @param options - package source for the name allowlist, and session directory.
* @returns moved/missing names and the backup location.
*/
async function unsyncWriterSkills(options) {
	const root = await realpath(await projectRootFor(options.workspaceDir));
	return serialize(root, async () => {
		const source = await realpath(options.sourceDir);
		if (overlaps(source, join(root, ".agents", "skills"))) throw new Error("Packaged and workspace skill directories must not overlap.");
		const { destination, backups } = await destinations(root);
		const removed = [];
		const missing = [];
		for (const name of await packagedSkillNames(source)) {
			if (!await directory(join(destination, name))) {
				missing.push(name);
				continue;
			}
			await ordinaryTree(join(destination, name));
			removed.push(name);
		}
		const backupPath = removed.length > 0 ? await mkdtemp(join(backups, "unsync-")) : void 0;
		if (backupPath !== void 0) try {
			for (const name of removed) await rename(join(destination, name), join(backupPath, name));
		} catch (error) {
			throw new Error(`Skill removal stopped. Previous copies remain in place or in ${backupPath}.`, { cause: error });
		}
		return {
			root,
			destination,
			removed,
			missing,
			...backupPath === void 0 ? {} : { backupPath }
		};
	});
}
/**
* Restore one backup batch; preserve both the batch and displaced current copies.
* @param options - session directory and direct batch name inside writer-skill-backups.
* @returns restored skill names and a backup of any displaced copies.
*/
async function restoreWriterSkills(options) {
	if (options.batch === "" || basename(options.batch) !== options.batch || options.batch === "." || options.batch === "..") throw new Error("Use a direct backup batch name, such as sync-ABC123.");
	const root = await realpath(await projectRootFor(options.workspaceDir));
	return serialize(root, async () => {
		const { destination, backups } = await destinations(root);
		const batch = join(backups, options.batch);
		if (relative(backups, batch).startsWith("..") || !await directory(batch)) throw new Error(`Backup batch not found: ${options.batch}`);
		await ordinaryTree(batch);
		const restored = [];
		const existing = [];
		for (const entry of await readdir(batch, { withFileTypes: true })) {
			if (!entry.isDirectory()) throw new Error(`Invalid backup entry: ${entry.name}`);
			restored.push(entry.name);
			if (await directory(join(destination, entry.name))) {
				await ordinaryTree(join(destination, entry.name));
				existing.push(entry.name);
			}
		}
		const backupPath = existing.length > 0 ? await mkdtemp(join(backups, "restore-")) : void 0;
		try {
			for (const name of restored) await replaceSkill(join(batch, name), join(destination, name), backupPath !== void 0 && existing.includes(name) ? join(backupPath, name) : void 0);
		} catch (error) {
			throw new Error(`Skill restore stopped. The original backup is unchanged at ${batch}; displaced copies remain in ${backupPath ?? destination}.`, { cause: error });
		}
		return {
			destination,
			restored: restored.sort(),
			...backupPath === void 0 ? {} : { backupPath }
		};
	});
}
//#endregion
//#region lib/types/skills-status.js
/** Read-only skill-source diagnosis shared by the session command and setup CLI. */
async function treeHash(path) {
	const hash = createHash("sha256");
	async function visit(current, name) {
		const entry = await lstat(current);
		if (entry.isSymbolicLink()) throw new Error(`Symbolic link in skill tree: ${current}`);
		hash.update(name + "\0");
		if (entry.isDirectory()) {
			hash.update("directory\0");
			for (const child of (await readdir(current)).sort()) {
				if (child === "__pycache__" || child.endsWith(".pyc")) continue;
				await visit(join(current, child), name + "/" + child);
			}
		} else if (entry.isFile()) hash.update("file\0").update(await readFile(current)).update("\0");
		else throw new Error(`Unsupported skill entry: ${current}`);
	}
	await visit(path, "");
	return hash.digest("hex");
}
async function comparison(path, packageHash) {
	try {
		return await treeHash(path) === packageHash ? "same" : "different";
	} catch {
		return "unreadable";
	}
}
/**
* Compare the actual winning catalog entries and project copies with the package.
* @param options - installed source, workspace, mount and DSH catalog for this session.
* @returns versions, effective paths and content comparisons without copying files.
*/
async function inspectWriterSkills(options) {
	const root = await projectRootFor(options.workspaceDir);
	const manifest = JSON.parse(await readFile(join(options.sourceDir, "..", "package.json"), "utf8"));
	const upstreamSkillsVersion = (await readFile(join(options.sourceDir, "story", "VERSION"), "utf8")).trim();
	const skills = [];
	for (const name of await packagedSkillNames(options.sourceDir)) {
		const packagedPath = join(options.sourceDir, name, "SKILL.md");
		const packageHash = await treeHash(dirname(packagedPath));
		const effective = options.catalog.find((skill) => skill.name === name);
		const projectCopies = [];
		for (const parent of [".dsh", ".agents"]) {
			const path = join(root, parent, "skills", name);
			try {
				await lstat(path);
			} catch (error) {
				if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
				projectCopies.push({
					path,
					comparison: "unreadable"
				});
				continue;
			}
			projectCopies.push({
				path,
				comparison: await comparison(path, packageHash)
			});
		}
		skills.push({
			name,
			packagedPath,
			projectCopies,
			...effective?.path === void 0 ? {} : { effectivePath: effective.path },
			...effective === void 0 ? {} : { effectiveSource: effective.source },
			comparison: effective === void 0 ? "missing" : effective.path === void 0 ? "unreadable" : await comparison(dirname(effective.path), packageHash)
		});
	}
	return {
		packageVersion: manifest.version,
		upstreamSkillsVersion,
		mount: options.mount,
		root,
		skills
	};
}
/**
* Render compact source diagnostics for authors; paths identify actionable overrides.
* @param status - inspected package and catalog.
* @returns command text with effective sources and differing copies.
*/
function formatWriterSkillsStatus(status) {
	const labels = {
		same: "与包一致",
		different: "与包不同",
		unreadable: "无法比较",
		missing: "未发现"
	};
	const lines = [
		`Writer ${status.packageVersion} · oh-story ${status.upstreamSkillsVersion} · ${status.mount}`,
		`项目：${status.root}`,
		...status.skills.map((skill) => `${skill.name}：${skill.effectiveSource ?? "不可用"} · ${labels[skill.comparison]} · ${skill.effectivePath ?? "无文件路径"}`)
	];
	const overrides = status.skills.flatMap((skill) => skill.projectCopies.filter((copy) => copy.comparison !== "same").map((copy) => `${skill.name}：${copy.path}（${labels[copy.comparison]}）`));
	if (overrides.length > 0) lines.push("项目副本差异：", ...overrides);
	lines.push("项目同名技能优先于 bundled。/writer-sync-skills 备份并更新 .agents/skills；.dsh/skills 中的副本需单独处理。");
	return lines.join("\n");
}
async function main() {
	const { values } = parseArgs({ options: {
		workspace: { type: "string" },
		mount: { type: "string" },
		json: { type: "boolean" }
	} });
	if (values.workspace === void 0) throw new Error("Usage: skills-status.js --workspace <directory> [--mount bundled|workspace] [--json]");
	const mount = values.mount ?? process.env.DSH_WRITER_SKILL_MOUNT ?? "bundled";
	if (mount !== "bundled" && mount !== "workspace") throw new Error("mount must be bundled or workspace");
	const sourceDir = packageSkillsDir();
	const ctx = new Context();
	try {
		await ctx.plugin(SkillRegistry);
		await ctx.plugin(SkillFileSystem, {
			watch: false,
			...mount === "bundled" ? { bundledSkillDir: sourceDir } : {}
		});
		const catalog = await ctx.skills.list({ cwd: resolve(values.workspace) });
		const status = await inspectWriterSkills({
			sourceDir,
			workspaceDir: values.workspace,
			mount,
			catalog
		});
		process.stdout.write((values.json ? JSON.stringify(status, null, 2) : formatWriterSkillsStatus(status)) + "\n");
	} finally {
		await ctx.fiber.dispose();
	}
}
if (process.argv[1] !== void 0 && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main().catch((error) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
//#endregion
//#region lib/types/editable.js
/** Workspace-relative paths the writing sidebar may save. */
/** File extensions Dashboard and the sidebar treat as editable. */
const EDITABLE_EXTENSIONS = /* @__PURE__ */ new Set([
	".md",
	".txt",
	".json",
	".yaml",
	".yml",
	".toml"
]);
/**
* Lowercase extension of a basename, including the leading dot.
* @param name - file basename or relative path.
* @returns extension such as `.md`, or `''` when none.
*/
function writerExtension(name) {
	const base = name.includes("/") ? name.split("/").pop() ?? name : name;
	const index = base.lastIndexOf(".");
	return index >= 0 ? base.slice(index).toLowerCase() : "";
}
/**
* Whether a basename uses an editable extension.
* @param name - file basename or relative path.
* @returns true for md / txt / json / yaml / yml / toml.
*/
function isEditableWriterName(name) {
	return EDITABLE_EXTENSIONS.has(writerExtension(name));
}
/**
* Classify one workspace-relative markdown path into a book section.
* Kept for callers that still want 设定 / 大纲 / 正文 grouping; the save gate is extension-based.
* @param relativePath - path relative to the session workspace, `/` separated.
* @returns the sidebar section, or undefined when the path is not part of the book markers.
*/
function classifyWriterPath(relativePath) {
	if (!safeRelative(relativePath) || !relativePath.endsWith(".md")) return void 0;
	const parts = relativePath.split("/");
	const file = parts[parts.length - 1] ?? "";
	const dirs = parts.slice(0, -1);
	if (file === "小节大纲.md" || file === "大纲.md" || file === "细纲.md" || file === "总纲.md" || file === "卷纲.md" || dirs.includes("大纲") || dirs.includes("细纲")) return "outline";
	if (file === "设定.md" || dirs.includes("设定")) return "setting";
	if (file === "正文.md" || dirs.includes("正文")) return "chapter";
}
/**
* Accept only a relative path the sidebar is allowed to write.
* @param path - candidate workspace-relative path.
* @returns whether a save may target it.
*/
function isEditableWriterPath(path) {
	return safeRelative(path) && isEditableWriterName(path);
}
/**
* Reject absolute paths, backslashes, and parent segments.
* @param path - candidate path.
* @returns whether every segment stays inside the workspace.
*/
function safeRelative(path) {
	if (path === "" || path.startsWith("/") || path.includes("\\") || path.includes("\0")) return false;
	return path.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..");
}
//#endregion
//#region lib/types/write-route.js
var WriterHttpError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
	}
};
function send(response, status, value) {
	const body = `${JSON.stringify(value)}\n`;
	response.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(body),
		"cache-control": "no-store",
		"x-content-type-options": "nosniff"
	});
	response.end(body);
}
async function jsonBody(request, maxBytes) {
	const chunks = [];
	let size = 0;
	for await (const chunk of request) {
		const value = Buffer.from(chunk);
		size += value.byteLength;
		if (size > maxBytes) throw new WriterHttpError(413, "请求内容过大。");
		chunks.push(value);
	}
	try {
		const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("not an object");
		return value;
	} catch (error) {
		if (error instanceof WriterHttpError) throw error;
		throw new WriterHttpError(400, "请求必须是 JSON 对象。");
	}
}
function mapFsError(error) {
	if (!(error instanceof FsError)) return void 0;
	switch (error.code) {
		case "FS_NOT_FOUND": return new WriterHttpError(404, "文件不存在。");
		case "FS_TOO_LARGE": return new WriterHttpError(413, "文件超过侧栏大小限制。");
		case "FS_NOT_TEXT":
		case "FS_NOT_REGULAR_FILE": return new WriterHttpError(415, "目标不是可编辑的文本文件。");
		case "FS_PERMISSION_DENIED":
		case "FS_SANDBOX_DENIED": return new WriterHttpError(403, "当前权限不允许修改该文件。");
		case "FS_STALE_VERSION":
		case "FS_NOT_OBSERVED": return new WriterHttpError(412, "文件已在磁盘上更新。请处理冲突后再保存。");
		case "FS_ABORTED": return new WriterHttpError(409, "文件操作已取消。");
		default: return new WriterHttpError(500, "文件系统操作失败。");
	}
}
async function sessionAgent(context, rawId) {
	if (rawId === "" || rawId.length > 200) throw new WriterHttpError(400, "缺少会话。");
	const lookup = context.typert.lookups.get("agent");
	if (lookup === void 0) throw new WriterHttpError(503, "会话查找当前不可用。");
	let agent;
	try {
		agent = await lookup.resolve(SessionId(rawId));
	} catch {
		throw new WriterHttpError(404, "会话不可用。");
	}
	if (agent === void 0) throw new WriterHttpError(404, "会话不可用。");
	if (agent.session.header.parentSession !== void 0 || agent.session.header.origin === "subagent") throw new WriterHttpError(404, "请在主会话里保存。");
	if (agent.session.header.cwd === void 0) throw new WriterHttpError(404, "会话没有工作区。");
	return agent;
}
async function handle(context, request, response, options) {
	const url = new URL(request.url ?? "/", "http://127.0.0.1");
	if (!isTrustedWriterRequest(request, options.trustedHosts)) throw new WriterHttpError(403, "请求来源不受信任。");
	if (url.pathname !== "/writer/file" || request.method !== "PUT") throw new WriterHttpError(404, "写作接口不存在。");
	const sessionId = url.searchParams.get("sessionId") ?? "";
	const path = url.searchParams.get("path") ?? "";
	if (!isEditableWriterPath(path)) throw new WriterHttpError(403, "只能保存侧栏允许的文本文件（md/txt/json/yaml/yml/toml）。");
	const input = await jsonBody(request, options.maxBytes * 2 + 1024);
	if (typeof input.content !== "string") throw new WriterHttpError(400, "content 必须是字符串。");
	if (Buffer.byteLength(input.content) > options.maxBytes) throw new WriterHttpError(413, "文件超过侧栏大小限制。");
	if (typeof input.baseVersion !== "string" || input.baseVersion === "") throw new WriterHttpError(400, "baseVersion 必须是有效版本。");
	const agent = await sessionAgent(context, sessionId);
	const filesystem = agent.ctx.get("fs");
	if (filesystem === void 0) throw new WriterHttpError(503, "会话文件系统不可用。");
	const cwd = agent.session.header.cwd;
	if (cwd === void 0) throw new WriterHttpError(404, "会话没有工作区。");
	const root = await filesystem.resolve(cwd);
	const target = await filesystem.resolve(path, { cwd });
	if (!filesystem.contains(root, target)) throw new WriterHttpError(403, "文件不在当前工作区。");
	const policy = agent.ctx.get("sandboxPolicy")?.resolve({ session: agent.session });
	const intent = {
		kind: "replaceIfVersion",
		version: input.baseVersion
	};
	const outcome = policy === void 0 ? await filesystem.writeText(target, input.content, intent) : await filesystem.writeText(target, input.content, intent, void 0, policy);
	send(response, 200, {
		path,
		bytes: Buffer.byteLength(outcome.after),
		version: outcome.version
	});
}
/**
* Mount the save route. Reads and directory listings stay on `workspaceFiles`.
* @param context - host context with the web server and session lookup.
* @param options - size limit and extra trusted authorities.
*/
function registerWriterRoute(context, options) {
	context.effect(() => context.webServer.register({
		kind: "prefix",
		path: "/writer",
		handler: async (request, response) => {
			try {
				await handle(context, request, response, options);
			} catch (error) {
				const mapped = error instanceof WriterHttpError ? error : mapFsError(error);
				if (mapped === void 0) context.logger("writer").error("write route failed", error);
				if (!response.headersSent) send(response, mapped?.status ?? 500, { error: mapped?.message ?? "保存失败。" });
			}
		}
	}), "writer: save route");
}
//#endregion
//#region lib/types/index.js
/** Plugin id. The preset id is the same string, registered by the bundle patch. */
const name = "writer";
/** Web and command services are optional so a headless host can still copy skills. */
const inject = [];
/** Schema for the writing plugin. */
const Config = z.object({
	skillMount: z.union(["workspace", "bundled"]).default("bundled"),
	editorMaxBytes: z.natural().min(65536).max(8388608).default(2097152),
	makersApiKeyEnv: z.string().role("credential-ref").default("MAKERS_API_KEY").volatile(),
	gptImageApiKeyEnv: z.string().role("credential-ref").default("GPT_IMAGE_API_KEY").volatile(),
	gptImageBaseUrl: z.string().default("").volatile(),
	trustedHosts: z.array(z.string()).default([])
});
const MOUNT_ENV = "DSH_WRITER_SKILL_MOUNT";
function credentialName(value, fallback) {
	if (typeof value === "string" && value.trim() !== "") return value.trim();
	if (value !== void 0 && typeof value !== "string") {
		const current = value.get();
		if (typeof current === "string" && current.trim() !== "") return current.trim();
	}
	return fallback;
}
/** Resolved text of an optional setting: trimmed, empty when absent or blank. */
function optionalText(value) {
	if (typeof value === "string") return value.trim();
	if (value !== void 0 && typeof value !== "string") {
		const current = value.get();
		if (typeof current === "string") return current.trim();
	}
	return "";
}
function restoreEnv(name, previous) {
	if (previous === void 0) delete process.env[name];
	else process.env[name] = previous;
}
/**
* Install the mount, optional first-entry copy, the save route, and skill sync/unsync commands.
* @param context - host context.
* @param config - plugin configuration after schema defaults.
*/
function apply(context, config = {}) {
	const skillMount = writerSkillMount(config.skillMount, void 0);
	const trustedHosts = config.trustedHosts ?? [];
	for (const host of trustedHosts) assertTrustedWriterAuthority(host);
	const skillsDir = packageSkillsDir();
	const maxBytes = config.editorMaxBytes ?? 2097152;
	const makersApiKeyEnv = credentialName(config.makersApiKeyEnv, "MAKERS_API_KEY");
	const gptImageApiKeyEnv = credentialName(config.gptImageApiKeyEnv, "GPT_IMAGE_API_KEY");
	const gptImageBaseUrl = optionalText(config.gptImageBaseUrl);
	const previousMount = process.env[MOUNT_ENV];
	const previousStatusScript = process.env.DSH_WRITER_SKILLS_STATUS_SCRIPT;
	const previousKeyEnv = process.env.WRITER_ZHUQUE_KEY_ENV;
	const previousCoverKeyEnv = process.env.WRITER_COVER_KEY_ENV;
	const previousCoverBaseUrl = process.env.GPT_IMAGE_BASE_URL;
	process.env[MOUNT_ENV] = skillMount;
	process.env.DSH_WRITER_SKILLS_STATUS_SCRIPT = join(skillsDir, "..", "lib", "types", "skills-status.js");
	process.env.WRITER_ZHUQUE_KEY_ENV = makersApiKeyEnv;
	process.env.WRITER_COVER_KEY_ENV = gptImageApiKeyEnv;
	if (gptImageBaseUrl !== "") process.env.GPT_IMAGE_BASE_URL = gptImageBaseUrl;
	context.effect(() => () => {
		restoreEnv(MOUNT_ENV, previousMount);
		restoreEnv("DSH_WRITER_SKILLS_STATUS_SCRIPT", previousStatusScript);
		restoreEnv("WRITER_ZHUQUE_KEY_ENV", previousKeyEnv);
		restoreEnv("WRITER_COVER_KEY_ENV", previousCoverKeyEnv);
		restoreEnv("GPT_IMAGE_BASE_URL", previousCoverBaseUrl);
	}, "writer: skill mount");
	const host = {
		skillMount,
		skillsDir,
		makersApiKeyEnv,
		gptImageApiKeyEnv,
		gptImageBaseUrl,
		sync: (workspaceDir, force) => syncWriterSkills({
			sourceDir: skillsDir,
			workspaceDir,
			force
		}),
		unsync: (workspaceDir) => unsyncWriterSkills({
			sourceDir: skillsDir,
			workspaceDir
		})
	};
	context.provide("writerHost", host);
	const copy = (agent, eventPreset) => {
		if (skillMount !== "workspace") return;
		const cwd = agent.session.header.cwd;
		if (cwd === void 0) return;
		const composed = context.get("agentPresets")?.composedPreset(agent.ctx);
		if (resolveWriterSyncPreset({
			...eventPreset !== void 0 ? { eventPreset } : {},
			...composed !== void 0 ? { composedPreset: composed } : {},
			...agent.session.header.agentPreset !== void 0 ? { headerPreset: agent.session.header.agentPreset } : {}
		}) !== "writer") return;
		host.sync(cwd, false).catch((error) => {
			context.logger("writer").warn(`skill copy skipped: ${error instanceof Error ? error.message : String(error)}`);
		});
	};
	context.on("agent/created", ({ agent }) => {
		copy(agent);
	});
	context.on("agent-preset/selected", (sessionId, preset) => {
		if (skillMount !== "workspace") return;
		const agent = context.get("agents")?.get(sessionId);
		if (agent !== void 0) copy(agent, preset);
	});
	context.inject(["webServer", "typert"], (ctx) => {
		registerWriterRoute(ctx, {
			maxBytes,
			trustedHosts
		});
	});
	context.inject(["commands"], (ctx) => {
		ctx.effect(() => ctx.commands.register({
			definitionId: CommandDefinitionId("@winterhuan/dsh-writer/sync-skills"),
			name: "writer-sync-skills",
			description: "备份同名项目副本，再把随包写作技能同步到 .agents/skills",
			handler: (invocation) => syncCommand(ctx, invocation)
		}), "writer: sync command");
		ctx.effect(() => ctx.commands.register({
			definitionId: CommandDefinitionId("@winterhuan/dsh-writer/unsync-skills"),
			name: "writer-unsync-skills",
			description: "把 .agents/skills 中的 Writer 同名目录移到备份，保留其它技能",
			handler: (invocation) => unsyncCommand(ctx, invocation)
		}), "writer: unsync command");
		ctx.effect(() => ctx.commands.register({
			definitionId: CommandDefinitionId("@winterhuan/dsh-writer/skills-status"),
			name: "writer-skills-status",
			description: "检查 Writer 版本、当前技能来源和项目副本差异",
			handler: (invocation) => statusCommand(ctx, invocation)
		}), "writer: status command");
		ctx.effect(() => ctx.commands.register({
			definitionId: CommandDefinitionId("@winterhuan/dsh-writer/restore-skills"),
			name: "writer-restore-skills",
			description: "从指定备份批次恢复项目技能，同时备份现有副本",
			input: { hint: "<备份批次名>" },
			handler: (invocation) => restoreCommand(invocation)
		}), "writer: restore command");
	});
}
async function syncCommand(context, invocation) {
	if (invocation.rawInput.trim() !== "") return {
		kind: "error",
		text: "用法：/writer-sync-skills"
	};
	const host = context.get("writerHost");
	if (host === void 0) return {
		kind: "error",
		text: "写作插件还没有就绪。"
	};
	const cwd = invocation.agent.session.header.cwd;
	if (cwd === void 0) return {
		kind: "error",
		text: "这个会话没有工作区目录。"
	};
	const result = await host.sync(cwd, true);
	const mountNote = host.skillMount === "bundled" ? " 当前是 bundled 挂载，项目同名技能仍优先；用 /writer-skills-status 核对实际来源。" : "";
	return {
		kind: "success",
		text: `已同步 ${String(result.copied.length)} 个技能到 ${result.destination}。${backupNote(result.backupPath)}${mountNote}`
	};
}
async function unsyncCommand(context, invocation) {
	if (invocation.rawInput.trim() !== "") return {
		kind: "error",
		text: "用法：/writer-unsync-skills"
	};
	const host = context.get("writerHost");
	if (host === void 0) return {
		kind: "error",
		text: "写作插件还没有就绪。"
	};
	const cwd = invocation.agent.session.header.cwd;
	if (cwd === void 0) return {
		kind: "error",
		text: "这个会话没有工作区目录。"
	};
	const result = await host.unsync(cwd);
	if (result.removed.length === 0) return {
		kind: "success",
		text: `没有找到可撤销的 Writer 技能目录（已对照包内 skills）。目标：${result.destination}`
	};
	return {
		kind: "success",
		text: `已移出 ${String(result.removed.length)} 个 Writer 技能目录（${result.removed.join("、")}）。${backupNote(result.backupPath)}`
	};
}
function backupNote(path) {
	return path === void 0 ? "" : ` 原副本已备份：${path}。用 /writer-restore-skills ${path.split(/[\\/]/).at(-1)} 恢复。`;
}
async function statusCommand(context, invocation) {
	if (invocation.rawInput.trim() !== "") return {
		kind: "error",
		text: "用法：/writer-skills-status"
	};
	const host = context.get("writerHost");
	if (host === void 0) return {
		kind: "error",
		text: "写作插件还没有就绪。"
	};
	const cwd = invocation.agent.session.header.cwd;
	if (cwd === void 0) return {
		kind: "error",
		text: "这个会话没有工作区目录。"
	};
	const skills = invocation.agent.ctx.get("skills");
	if (skills === void 0) return {
		kind: "error",
		text: "当前会话没有技能发现服务，请先切换到写作模式。"
	};
	const catalog = await skills.list({
		cwd,
		scope: invocation.agent,
		signal: invocation.signal
	});
	return {
		kind: "success",
		text: formatWriterSkillsStatus(await inspectWriterSkills({
			sourceDir: host.skillsDir,
			workspaceDir: cwd,
			mount: host.skillMount,
			catalog
		}))
	};
}
async function restoreCommand(invocation) {
	const batch = invocation.rawInput.trim();
	if (batch === "") return {
		kind: "error",
		text: "用法：/writer-restore-skills <备份批次名>"
	};
	const cwd = invocation.agent.session.header.cwd;
	if (cwd === void 0) return {
		kind: "error",
		text: "这个会话没有工作区目录。"
	};
	const result = await restoreWriterSkills({
		workspaceDir: cwd,
		batch
	});
	return {
		kind: "success",
		text: `已恢复 ${String(result.restored.length)} 个技能到 ${result.destination}。${backupNote(result.backupPath)}`
	};
}
//#endregion
export { Config, apply, classifyWriterPath, formatWriterSkillsStatus, inject, inspectWriterSkills, isEditableWriterPath, name, packageSkillsDir, packagedSkillNames, projectRootFor, registerWriterRoute, resolveWriterSyncPreset, restoreWriterSkills, skillFilesystemRowDisabled, syncWriterSkills, unsyncWriterSkills, writerSkillMount };
