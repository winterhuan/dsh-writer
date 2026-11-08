/** Read-only skill-source diagnosis shared by the session command and setup CLI. */
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { Context } from '@deepseek-ai/cordis';
import SkillRegistry from '@deepseek-ai/dsh-skill';
import * as SkillFileSystem from '@deepseek-ai/dsh-skill-filesystem';
import { packageSkillsDir } from "./skills-dir.js";
import { packagedSkillNames, projectRootFor } from "./sync-skills.js";
async function treeHash(path) {
    const hash = createHash('sha256');
    async function visit(current, name) {
        const entry = await lstat(current);
        if (entry.isSymbolicLink())
            throw new Error(`Symbolic link in skill tree: ${current}`);
        hash.update(name + '\0');
        if (entry.isDirectory()) {
            hash.update('directory\0');
            for (const child of (await readdir(current)).sort()) {
                if (child === '__pycache__' || child.endsWith('.pyc'))
                    continue;
                await visit(join(current, child), name + '/' + child);
            }
        }
        else if (entry.isFile()) {
            hash.update('file\0').update(await readFile(current)).update('\0');
        }
        else
            throw new Error(`Unsupported skill entry: ${current}`);
    }
    await visit(path, '');
    return hash.digest('hex');
}
async function comparison(path, packageHash) {
    try {
        return await treeHash(path) === packageHash ? 'same' : 'different';
    }
    catch {
        return 'unreadable';
    }
}
/**
 * Compare the actual winning catalog entries and project copies with the package.
 * @param options - installed source, workspace, mount and DSH catalog for this session.
 * @returns versions, effective paths and content comparisons without copying files.
 */
export async function inspectWriterSkills(options) {
    const root = await projectRootFor(options.workspaceDir);
    const manifest = JSON.parse(await readFile(join(options.sourceDir, '..', 'package.json'), 'utf8'));
    const upstreamSkillsVersion = (await readFile(join(options.sourceDir, 'story', 'VERSION'), 'utf8')).trim();
    const skills = [];
    for (const name of await packagedSkillNames(options.sourceDir)) {
        const packagedPath = join(options.sourceDir, name, 'SKILL.md');
        const packageHash = await treeHash(dirname(packagedPath));
        const effective = options.catalog.find(skill => skill.name === name);
        const projectCopies = [];
        for (const parent of ['.dsh', '.agents']) {
            const path = join(root, parent, 'skills', name);
            try {
                await lstat(path);
            }
            catch (error) {
                if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
                    continue;
                projectCopies.push({ path, comparison: 'unreadable' });
                continue;
            }
            projectCopies.push({ path, comparison: await comparison(path, packageHash) });
        }
        skills.push({
            name, packagedPath, projectCopies,
            ...(effective?.path === undefined ? {} : { effectivePath: effective.path }),
            ...(effective === undefined ? {} : { effectiveSource: effective.source }),
            comparison: effective === undefined ? 'missing' : effective.path === undefined ? 'unreadable'
                : await comparison(dirname(effective.path), packageHash),
        });
    }
    return { packageVersion: manifest.version, upstreamSkillsVersion, mount: options.mount, root, skills };
}
/**
 * Render compact source diagnostics for authors; paths identify actionable overrides.
 * @param status - inspected package and catalog.
 * @returns command text with effective sources and differing copies.
 */
export function formatWriterSkillsStatus(status) {
    const labels = { same: '与包一致', different: '与包不同', unreadable: '无法比较', missing: '未发现' };
    const lines = [
        `Writer ${status.packageVersion} · oh-story ${status.upstreamSkillsVersion} · ${status.mount}`,
        `项目：${status.root}`,
        ...status.skills.map(skill => `${skill.name}：${skill.effectiveSource ?? '不可用'} · ${labels[skill.comparison]} · ${skill.effectivePath ?? '无文件路径'}`),
    ];
    const overrides = status.skills.flatMap(skill => skill.projectCopies
        .filter(copy => copy.comparison !== 'same')
        .map(copy => `${skill.name}：${copy.path}（${labels[copy.comparison]}）`));
    if (overrides.length > 0)
        lines.push('项目副本差异：', ...overrides);
    lines.push('项目同名技能优先于 bundled。/writer-sync-skills 备份并更新 .agents/skills；.dsh/skills 中的副本需单独处理。');
    return lines.join('\n');
}
async function main() {
    const { values } = parseArgs({ options: {
            workspace: { type: 'string' }, mount: { type: 'string' }, json: { type: 'boolean' },
        } });
    if (values.workspace === undefined)
        throw new Error('Usage: skills-status.js --workspace <directory> [--mount bundled|workspace] [--json]');
    const mount = values.mount ?? process.env.DSH_WRITER_SKILL_MOUNT ?? 'bundled';
    if (mount !== 'bundled' && mount !== 'workspace')
        throw new Error('mount must be bundled or workspace');
    const sourceDir = packageSkillsDir();
    const ctx = new Context();
    try {
        await ctx.plugin(SkillRegistry);
        await ctx.plugin(SkillFileSystem, {
            watch: false,
            ...(mount === 'bundled' ? { bundledSkillDir: sourceDir } : {}),
        });
        const catalog = await ctx.skills.list({ cwd: resolve(values.workspace) });
        const status = await inspectWriterSkills({ sourceDir, workspaceDir: values.workspace, mount, catalog });
        process.stdout.write((values.json ? JSON.stringify(status, null, 2) : formatWriterSkillsStatus(status)) + '\n');
    }
    finally {
        await ctx.fiber.dispose();
    }
}
if (process.argv[1] !== undefined && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    main().catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=skills-status.js.map