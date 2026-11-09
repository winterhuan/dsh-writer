import { readFile, realpath } from 'node:fs/promises';
import { dirname, join, relative, resolve, isAbsolute, sep } from 'node:path';
import { ToolCallId } from '@deepseek-ai/dsh-llm';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { ToolExecutionPipeline } from '@deepseek-ai/dsh-tools/pipeline';
import { buildDshAgentPrompt, writerRoles } from "./role-prompt.js";
import { packageSkillsDir } from "./skills-dir.js";
/** Preset-scoped role delegation plugin. */
export const name = 'writer-agents';
/** Role discovery and reads use the calling Agent's services. */
export const inject = ['tools', 'skills', 'fs', 'workingDirectory'];
/**
 * Register named role delegation in the Writer preset.
 * @param ctx - preset context owning the tool registration.
 */
export function apply(ctx) {
    const pipeline = new ToolExecutionPipeline(ctx);
    const definition = defineTool({
        name: 'writer_agent',
        description: 'Start a fresh Writer agent for a named role. Loads the effective story-setup role and returns a native subagentId. Use send_message to continue that instance; completion arrives asynchronously. Roles share the current Writer preset. Role read-only instructions do not create a separate sandbox.',
        parameters: {
            role: { type: 'string', required: true, enum: [...writerRoles], description: 'story-architect: world and outlines; character-designer: characters; narrative-writer: prose and revision; consistency-checker: factual consistency; story-explorer: project lookup; story-researcher: external research; chapter-extractor: analysis inputs.' },
            description: { type: 'string', required: true, description: 'Short task label.' },
            prompt: { type: 'string', required: true, description: 'Self-contained task, authorized file scope, reference paths and delivery requirements. Role instructions are loaded automatically. For reviews, explicitly require read-only work.' },
            cwd: { type: 'string', description: 'Book directory; relative to the parent working directory. Omitted inherits it.' },
            provider: { type: 'string', description: 'Optional child LLM provider; supply with model. Subject to native subagent model policy.' },
            model: { type: 'string', description: 'Model within provider; omitted inherits the native subagent defaults.' },
            reasoning_effort: { type: 'string', description: 'Optional model-specific reasoning effort.' },
        },
        output: {
            schema: {
                type: 'object', additionalProperties: false,
                properties: {
                    role: { type: 'string', required: true },
                    subagentId: { type: 'string', required: true },
                },
            },
            render: (_args, value) => [{ type: 'text', text: `started ${value.role}: ${value.subagentId}` }],
        },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
            const agent = exec.agent;
            if (agent === undefined)
                throw new Error('writer_agent requires a calling Agent.');
            const cwd = await ctx.workingDirectory.ensure(agent, exec.signal);
            const projectDir = resolve(cwd, args.cwd ?? '.');
            const skill = await ctx.skills.get('story-setup', { cwd, scope: agent, signal: exec.signal });
            if (skill === undefined || !skill.invocation.modelInvocable)
                throw new Error('Writer role source story-setup is unavailable in this session.');
            const setupDir = skill.resourceBase?.kind === 'directory' ? skill.resourceBase.path
                : skill.path === undefined ? undefined : dirname(skill.path);
            if (setupDir === undefined)
                throw new Error('Writer roles require a filesystem story-setup skill.');
            const bundled = resolve(setupDir) === join(packageSkillsDir(), 'story-setup');
            const prompt = await buildDshAgentPrompt({
                setupDir, role: args.role, projectDir, task: args.prompt,
                read: async (path) => {
                    if (!bundled) {
                        const fs = agent.ctx.get('fs');
                        if (fs === undefined)
                            throw new Error('Writer role reads require the Agent filesystem.');
                        return fs.readText(await fs.resolve(path), exec.signal);
                    }
                    // Only this installed package's resources bypass workspace filesystem roots.
                    const root = await realpath(setupDir);
                    const target = await realpath(path);
                    const rel = relative(root, target);
                    if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel))
                        throw new Error(`Writer role escapes its bundled directory: ${path}`);
                    return readFile(target, { encoding: 'utf8', signal: exec.signal });
                },
            });
            exec.signal.throwIfAborted();
            const { role, ...task } = args;
            const prepared = await pipeline.prepare({
                callId: ToolCallId(`${exec.callId}:subagent`), rootCallId: exec.rootCallId,
                name: 'subagent', arguments: { ...task, prompt, cwd: projectDir, description: `${role}: ${args.description}` },
                agent, signal: exec.signal, parent: exec.token,
                ...(exec.toolSet === undefined ? {} : { toolSet: exec.toolSet }),
            });
            const outcome = prepared.kind === 'dispatch' ? await pipeline.dispatch(prepared.exec) : prepared;
            const result = await pipeline.complete(prepared.exec, outcome);
            for (const context of result.additionalContexts ?? [])
                exec.deferContext(context);
            if (result.isError)
                throw new Error(result.error.message);
            if (result.concludesTurn)
                exec.concludeTurn();
            const value = result.value;
            if (value === null || typeof value !== 'object' || Array.isArray(value) || typeof value.subagentId !== 'string')
                throw new Error('Native subagent did not return a subagentId.');
            return { role, subagentId: value.subagentId };
        },
    });
    ctx.effect(() => ctx.tools.register(definition), 'writer: role delegation');
}
//# sourceMappingURL=writer-agent.js.map