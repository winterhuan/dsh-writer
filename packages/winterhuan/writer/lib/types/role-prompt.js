/** Packaged Writer roles adapted to DSH task prompts. */
import { dirname, join } from 'node:path';
/** Roles accepted by the Writer delegation tool. */
export const writerRoles = ['story-architect', 'character-designer', 'narrative-writer', 'consistency-checker', 'story-explorer', 'story-researcher', 'chapter-extractor'];
/**
 * Compose a role and task using the selected skill's resource directory.
 * @param options - discovered setup directory, role, child directory, task, and authorized reader.
 * @returns a self-contained child prompt; unknown or malformed roles reject before delegation.
 */
export async function buildDshAgentPrompt(options) {
    const { setupDir, role, projectDir, task, read } = options;
    if (!writerRoles.some(name => name === role))
        throw new Error(`Unknown Writer role: ${role}`);
    if (!task.trim())
        throw new Error('The delegated task must not be empty.');
    const references = join(setupDir, 'references', 'agent-references');
    const rolePath = join(setupDir, 'references', 'templates', 'agents', `${role}.md`);
    const source = await read(rolePath);
    const frontmatter = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (!frontmatter || !new RegExp(`^name: ${role}\\r?$`, 'm').test(frontmatter[0]))
        throw new Error(`Malformed Writer role: ${rolePath}`);
    let body = source.slice(frontmatter[0].length);
    if (!body.trim())
        throw new Error(`Empty Writer role: ${rolePath}`);
    body = body.replace(/读取参考文件时，直接 Read 当前 Claude 部署的 canonical 路径，禁止先用 Glob\/Grep 搜索：[\s\S]*?禁止只读裸文件名、禁止跳级、禁止跨 skill 读其他 skill 的 references。/, `读取方法资料时使用 ${references}/ 下的对应文件。缺文件则报告准确路径和未完成的检查，不扫描其他宿主目录。`);
    body = body.replace(/\{项目根\}\/\.claude\/skills\/story-setup\/references\/agent-references\/|story-setup\/references\/agent-references\//g, `${references}/`);
    body = body.replaceAll('{SKILL_DIR}', dirname(setupDir));
    return [
        '你在 DeepSeek Harness 的独立子会话中执行 Writer 任务。',
        `工作项目：${projectDir}`,
        `角色：${role}；角色正文来自 ${rolePath}`,
        `资料目录：${references}`,
        '角色名是本次职责，不是注册的 agent preset。使用当前实际可用工具；模板的 Read/Grep/Write 等名称按工具能力对应，不能调用不存在的工具。',
        '本次任务规定的文件范围与只读要求优先于角色通用能力。不要再派子代理；无法读取必要文件或缺工具时报告限制，不能声称完成。',
        '以下是角色方法：', body.trim(),
        '以下是本次任务与交付要求：', task.trim(),
    ].join('\n\n') + '\n';
}
//# sourceMappingURL=role-prompt.js.map