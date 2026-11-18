import { join } from 'node:path';
import z from '@deepseek-ai/schemastery';
import { CommandDefinitionId } from '@deepseek-ai/dsh-commands';
import { writerSkillMount } from "./mount.js";
import { assertTrustedWriterAuthority } from "./request-trust.js";
import { packageSkillsDir } from "./skills-dir.js";
import { resolveWriterSyncPreset } from "./sync-gate.js";
import { restoreWriterSkills, syncWriterSkills, unsyncWriterSkills } from "./sync-skills.js";
import { formatWriterSkillsStatus, inspectWriterSkills } from "./skills-status.js";
import { registerWriterRoute } from "./write-route.js";
export { packageSkillsDir } from "./skills-dir.js";
export { skillFilesystemRowDisabled, writerSkillMount } from "./mount.js";
export { resolveWriterSyncPreset } from "./sync-gate.js";
export { restoreWriterSkills, syncWriterSkills, unsyncWriterSkills, packagedSkillNames, projectRootFor } from "./sync-skills.js";
export { inspectWriterSkills, formatWriterSkillsStatus } from "./skills-status.js";
export { registerWriterRoute } from "./write-route.js";
export { classifyWriterPath, isEditableWriterPath } from "./editable.js";
/** Plugin id. The preset id is the same string, registered by the bundle patch. */
export const name = 'writer';
/** Web and command services are optional so a headless host can still copy skills. */
export const inject = [];
/** Schema for the writing plugin. */
export const Config = z.object({
    skillMount: z.union(['workspace', 'bundled']).default('bundled'),
    editorMaxBytes: z.natural().min(65_536).max(8_388_608).default(2_097_152),
    makersApiKeyEnv: z.string().role('credential-ref').default('MAKERS_API_KEY').volatile(),
    gptImageApiKeyEnv: z.string().role('credential-ref').default('GPT_IMAGE_API_KEY').volatile(),
    gptImageBaseUrl: z.string().default('').volatile(),
    trustedHosts: z.array(z.string()).default([]),
});
const MOUNT_ENV = 'DSH_WRITER_SKILL_MOUNT';
function credentialName(value, fallback) {
    if (typeof value === 'string' && value.trim() !== '')
        return value.trim();
    if (value !== undefined && typeof value !== 'string') {
        const current = value.get();
        if (typeof current === 'string' && current.trim() !== '')
            return current.trim();
    }
    return fallback;
}
/** Resolved text of an optional setting: trimmed, empty when absent or blank. */
function optionalText(value) {
    if (typeof value === 'string')
        return value.trim();
    if (value !== undefined && typeof value !== 'string') {
        const current = value.get();
        if (typeof current === 'string')
            return current.trim();
    }
    return '';
}
function restoreEnv(name, previous) {
    if (previous === undefined)
        delete process.env[name];
    else
        process.env[name] = previous;
}
/**
 * Install the mount, optional first-entry copy, the save route, and skill sync/unsync commands.
 * @param context - host context.
 * @param config - plugin configuration after schema defaults.
 */
export function apply(context, config = {}) {
    const skillMount = writerSkillMount(config.skillMount, undefined);
    const trustedHosts = config.trustedHosts ?? [];
    for (const host of trustedHosts)
        assertTrustedWriterAuthority(host);
    const skillsDir = packageSkillsDir();
    const maxBytes = config.editorMaxBytes ?? 2_097_152;
    const makersApiKeyEnv = credentialName(config.makersApiKeyEnv, 'MAKERS_API_KEY');
    const gptImageApiKeyEnv = credentialName(config.gptImageApiKeyEnv, 'GPT_IMAGE_API_KEY');
    const gptImageBaseUrl = optionalText(config.gptImageBaseUrl);
    const previousMount = process.env[MOUNT_ENV];
    const previousStatusScript = process.env.DSH_WRITER_SKILLS_STATUS_SCRIPT;
    const previousKeyEnv = process.env.WRITER_ZHUQUE_KEY_ENV;
    const previousCoverKeyEnv = process.env.WRITER_COVER_KEY_ENV;
    const previousCoverBaseUrl = process.env.GPT_IMAGE_BASE_URL;
    process.env[MOUNT_ENV] = skillMount;
    process.env.DSH_WRITER_SKILLS_STATUS_SCRIPT = join(skillsDir, '..', 'lib', 'types', 'skills-status.js');
    process.env.WRITER_ZHUQUE_KEY_ENV = makersApiKeyEnv;
    process.env.WRITER_COVER_KEY_ENV = gptImageApiKeyEnv;
    // A blank setting leaves the variable alone, so a shell-exported test value keeps working.
    if (gptImageBaseUrl !== '')
        process.env.GPT_IMAGE_BASE_URL = gptImageBaseUrl;
    context.effect(() => () => {
        restoreEnv(MOUNT_ENV, previousMount);
        restoreEnv('DSH_WRITER_SKILLS_STATUS_SCRIPT', previousStatusScript);
        restoreEnv('WRITER_ZHUQUE_KEY_ENV', previousKeyEnv);
        restoreEnv('WRITER_COVER_KEY_ENV', previousCoverKeyEnv);
        restoreEnv('GPT_IMAGE_BASE_URL', previousCoverBaseUrl);
    }, 'writer: skill mount');
    const host = {
        skillMount,
        skillsDir,
        makersApiKeyEnv,
        gptImageApiKeyEnv,
        gptImageBaseUrl,
        sync: (workspaceDir, force) => syncWriterSkills({ sourceDir: skillsDir, workspaceDir, force }),
        unsync: workspaceDir => unsyncWriterSkills({ sourceDir: skillsDir, workspaceDir }),
    };
    context.provide('writerHost', host);
    const copy = (agent, eventPreset) => {
        if (skillMount !== 'workspace')
            return;
        const cwd = agent.session.header.cwd;
        if (cwd === undefined)
            return;
        const composed = context.get('agentPresets')?.composedPreset(agent.ctx);
        const selected = resolveWriterSyncPreset({
            ...(eventPreset !== undefined ? { eventPreset } : {}),
            ...(composed !== undefined ? { composedPreset: composed } : {}),
            ...(agent.session.header.agentPreset !== undefined
                ? { headerPreset: agent.session.header.agentPreset }
                : {}),
        });
        if (selected !== 'writer')
            return;
        void host.sync(cwd, false).catch((error) => {
            context.logger('writer').warn(`skill copy skipped: ${error instanceof Error ? error.message : String(error)}`);
        });
    };
    context.on('agent/created', ({ agent }) => { copy(agent); });
    context.on('agent-preset/selected', (sessionId, preset) => {
        if (skillMount !== 'workspace')
            return;
        const agent = context.get('agents')?.get(sessionId);
        if (agent !== undefined)
            copy(agent, preset);
    });
    context.inject(['webServer', 'typert'], ctx => {
        registerWriterRoute(ctx, { maxBytes, trustedHosts });
    });
    context.inject(['commands'], ctx => {
        ctx.effect(() => ctx.commands.register({
            definitionId: CommandDefinitionId('@winterhuan/dsh-writer/sync-skills'),
            name: 'writer-sync-skills',
            description: '备份同名项目副本，再把随包写作技能同步到 .agents/skills',
            handler: invocation => syncCommand(ctx, invocation),
        }), 'writer: sync command');
        ctx.effect(() => ctx.commands.register({
            definitionId: CommandDefinitionId('@winterhuan/dsh-writer/unsync-skills'),
            name: 'writer-unsync-skills',
            description: '把 .agents/skills 中的 Writer 同名目录移到备份，保留其它技能',
            handler: invocation => unsyncCommand(ctx, invocation),
        }), 'writer: unsync command');
        ctx.effect(() => ctx.commands.register({
            definitionId: CommandDefinitionId('@winterhuan/dsh-writer/skills-status'),
            name: 'writer-skills-status',
            description: '检查 Writer 版本、当前技能来源和项目副本差异',
            handler: invocation => statusCommand(ctx, invocation),
        }), 'writer: status command');
        ctx.effect(() => ctx.commands.register({
            definitionId: CommandDefinitionId('@winterhuan/dsh-writer/restore-skills'),
            name: 'writer-restore-skills',
            description: '从指定备份批次恢复项目技能，同时备份现有副本',
            input: { hint: '<备份批次名>' },
            handler: invocation => restoreCommand(invocation),
        }), 'writer: restore command');
    });
}
async function syncCommand(context, invocation) {
    if (invocation.rawInput.trim() !== '')
        return { kind: 'error', text: '用法：/writer-sync-skills' };
    const host = context.get('writerHost');
    if (host === undefined)
        return { kind: 'error', text: '写作插件还没有就绪。' };
    const cwd = invocation.agent.session.header.cwd;
    if (cwd === undefined)
        return { kind: 'error', text: '这个会话没有工作区目录。' };
    const result = await host.sync(cwd, true);
    const mountNote = host.skillMount === 'bundled'
        ? ' 当前是 bundled 挂载，项目同名技能仍优先；用 /writer-skills-status 核对实际来源。'
        : '';
    return { kind: 'success', text: `已同步 ${String(result.copied.length)} 个技能到 ${result.destination}。${backupNote(result.backupPath)}${mountNote}` };
}
async function unsyncCommand(context, invocation) {
    if (invocation.rawInput.trim() !== '')
        return { kind: 'error', text: '用法：/writer-unsync-skills' };
    const host = context.get('writerHost');
    if (host === undefined)
        return { kind: 'error', text: '写作插件还没有就绪。' };
    const cwd = invocation.agent.session.header.cwd;
    if (cwd === undefined)
        return { kind: 'error', text: '这个会话没有工作区目录。' };
    const result = await host.unsync(cwd);
    if (result.removed.length === 0) {
        return { kind: 'success', text: `没有找到可撤销的 Writer 技能目录（已对照包内 skills）。目标：${result.destination}` };
    }
    return {
        kind: 'success',
        text: `已移出 ${String(result.removed.length)} 个 Writer 技能目录（${result.removed.join('、')}）。${backupNote(result.backupPath)}`,
    };
}
function backupNote(path) {
    return path === undefined ? '' : ` 原副本已备份：${path}。用 /writer-restore-skills ${path.split(/[\\/]/).at(-1)} 恢复。`;
}
async function statusCommand(context, invocation) {
    if (invocation.rawInput.trim() !== '')
        return { kind: 'error', text: '用法：/writer-skills-status' };
    const host = context.get('writerHost');
    if (host === undefined)
        return { kind: 'error', text: '写作插件还没有就绪。' };
    const cwd = invocation.agent.session.header.cwd;
    if (cwd === undefined)
        return { kind: 'error', text: '这个会话没有工作区目录。' };
    const skills = invocation.agent.ctx.get('skills');
    if (skills === undefined)
        return { kind: 'error', text: '当前会话没有技能发现服务，请先切换到写作模式。' };
    const catalog = await skills.list({ cwd, scope: invocation.agent, signal: invocation.signal });
    const status = await inspectWriterSkills({ sourceDir: host.skillsDir, workspaceDir: cwd, mount: host.skillMount, catalog });
    return { kind: 'success', text: formatWriterSkillsStatus(status) };
}
async function restoreCommand(invocation) {
    const batch = invocation.rawInput.trim();
    if (batch === '')
        return { kind: 'error', text: '用法：/writer-restore-skills <备份批次名>' };
    const cwd = invocation.agent.session.header.cwd;
    if (cwd === undefined)
        return { kind: 'error', text: '这个会话没有工作区目录。' };
    const result = await restoreWriterSkills({ workspaceDir: cwd, batch });
    return { kind: 'success', text: `已恢复 ${String(result.restored.length)} 个技能到 ${result.destination}。${backupNote(result.backupPath)}` };
}
//# sourceMappingURL=index.js.map