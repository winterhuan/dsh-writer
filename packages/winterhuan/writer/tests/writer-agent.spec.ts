/** Real DSH delegation and continuation with a deterministic model boundary. */
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Group from '@deepseek-ai/cordis-plugin-group'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentPresets from '@deepseek-ai/dsh-agent-preset-registry'
import { LlmAdapter, ToolCallId, type GenerateOptions, type StreamChunk } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as Persistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SessionQuery from '@deepseek-ai/dsh-session-query'
import Skills from '@deepseek-ai/dsh-skill'
import * as SkillFilesystem from '@deepseek-ai/dsh-skill-filesystem'
import Subagents from '@deepseek-ai/dsh-subagent'
import * as Spawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import * as SubagentTool from '@deepseek-ai/dsh-tool-subagent'
import * as SubagentControl from '@deepseek-ai/dsh-tool-subagent-control'
import { ToolExecutionPipeline } from '@deepseek-ai/dsh-tools/pipeline'
import { expect, it, onTestFinished } from 'vitest'
import * as WriterAgents from '../src/writer-agent.ts'
import { packageSkillsDir } from '../src/skills-dir.ts'

class Model extends LlmAdapter {
  readonly requests: GenerateOptions[] = []
  async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    options.signal?.throwIfAborted()
    yield { type: 'block-start', index: 0, blockType: 'text' }
    yield { type: 'text-delta', index: 0, text: '检查完成' }
    yield { type: 'block-end', index: 0, block: { type: 'text', text: '检查完成' } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }
}

async function setup(maxDepth = 1) {
  const root = await mkdtemp(join(tmpdir(), 'writer-agent-'))
  const ctx = new Context()
  onTestFinished(async () => { await ctx.fiber.dispose(); await rm(root, { recursive: true, force: true }) })
  const project = join(root, 'book')
  await mkdir(project)
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
  await ctx.plugin(Persistence, { root: join(root, 'sessions'), compression: 'none' })
  await ctx.plugin(SessionQuery)
  await ctx.plugin(Skills)
  await ctx.plugin(SkillFilesystem, { watch: false, bundledSkillDir: packageSkillsDir(), dshHome: join(root, 'dsh'), agentsHome: join(root, 'agents') })
  const harness = await mountAgentLoopTestHarness(ctx)
  await ctx.plugin(Subagents)
  await ctx.plugin(Spawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentTool, { provider: 'spawn', modelSelection: true, maxDepth })
  await ctx.plugin(SubagentControl)
  const plugin = await ctx.plugin(WriterAgents)
  const model = new Model()
  ctx.llm.registerAdapter(['writer-test'], model)
  const parent = await harness.create(SessionId(randomUUID()), { provider: 'writer-test', model: 'writer-test' }, { cwd: project })
  const pipeline = new ToolExecutionPipeline(ctx)
  const call = async (name: string, args: object, agent: Agent = parent, signal = new AbortController().signal) => {
    const prepared = await pipeline.prepare({ callId: ToolCallId(randomUUID()), name, arguments: args, agent, signal })
    const result = await pipeline.complete(prepared.exec, prepared.kind === 'dispatch' ? await pipeline.dispatch(prepared.exec) : prepared)
    return result
  }
  const drain = async () => {
    await ctx.subagents.waitForChildren(parent)
    await parent.whenIdle()
  }
  return { ctx, project, parent, model, plugin, call, drain }
}

const task = { role: 'narrative-writer', description: '写第三章', prompt: '任务标记：只写第三章。' }

it('scopes role delegation to Writer and shares the parent preset with each child', async () => {
  const { ctx, project, plugin, call } = await setup()
  await plugin.dispose()
  await ctx.plugin(Loader)
  ctx.loader.builtins.group = Group
  ctx.loader.builtins.writerAgents = WriterAgents
  await ctx.plugin(AgentPresets, { default: 'writer' })
  await ctx.plugin({
    inject: ['agentPresets'],
    async* apply(owner: Context) {
      yield await owner.agentPresets.register({ id: 'writer', plugins: [{ name: 'cordis:writerAgents' }] })
    },
  })
  expect((await call('writer_agent', task)).isError).toBe(true)
  const { agent: writer } = await ctx.agents.create({
    sessionId: SessionId(randomUUID()), meta: { cwd: project, agentPreset: 'writer' },
    agentOptions: { provider: 'writer-test', model: 'writer-test' },
    setup: async agentCtx => { await ctx.agentPresets.mount(agentCtx, 'writer') },
  })
  const presets: (string | undefined)[] = []
  ctx.on('agent/created', ({ agent }) => {
    if (agent.session.header.origin === 'subagent') presets.push(ctx.agentPresets.composedPreset(agent.ctx))
  })
  for (const role of ['narrative-writer', 'consistency-checker']) {
    const result = await call('writer_agent', { ...task, role }, writer)
    expect(result.isError, JSON.stringify(result)).toBe(false)
    await ctx.subagents.waitForChildren(writer)
    await writer.whenIdle()
  }
  expect(presets).toEqual(['writer', 'writer'])
})

it('starts distinct native children and continues a completed role instance through send_message', async () => {
  const { ctx, parent, model, call, drain } = await setup()
  const children: Agent[] = []
  ctx.on('agent/created', ({ agent }) => { if (agent.session.header.origin === 'subagent') children.push(agent) })
  const result = await call('writer_agent', task)
  expect(result.isError, JSON.stringify(result)).toBe(false)
  if (result.isError) throw new Error(result.error.message)
  const value = result.value as { role: string; subagentId: string }
  expect(value.role).toBe(task.role)
  await drain()
  expect(children).toHaveLength(1)
  expect(children[0]?.id).toBe(value.subagentId)
  expect(children[0]?.session.header.parentSession).toBe(parent.id)
  expect(children[0]?.options.model).toBe('writer-test')
  const initial = children[0]?.session.snapshotEvents().find(event => event.type === 'user/message' && JSON.stringify(event).includes('任务标记'))
  expect(JSON.stringify(initial)).toContain('Narrative Writer')
  expect(JSON.stringify(initial)).toContain(task.prompt)
  expect(JSON.stringify(initial)).not.toContain('.claude/')
  expect(JSON.stringify(initial)).not.toContain('model: opus')
  expect(ctx.agents.get(SessionId(value.subagentId))).toBeUndefined()

  const continued = await call('send_message', { agent_id: value.subagentId, message: '续接标记：修订第三章结尾。' })
  expect(continued.isError, JSON.stringify(continued)).toBe(false)
  await drain()
  expect(children).toHaveLength(2)
  expect(children[1]?.id).toBe(value.subagentId)
  expect(JSON.stringify(model.requests)).toContain('续接标记')
  expect(JSON.stringify(children[1]?.session.snapshotEvents())).toContain('任务标记')

  const another = await call('writer_agent', task)
  expect(another.isError, JSON.stringify(another)).toBe(false)
  if (another.isError) throw new Error(another.error.message)
  expect((another.value as { subagentId: string }).subagentId).not.toBe(value.subagentId)
  await drain()
})

it('loads the effective project role and refuses its missing or malformed template', async () => {
  const { ctx, project, call, drain } = await setup()
  const skillDir = join(project, '.agents/skills/story-setup')
  const rolePath = join(skillDir, 'references/templates/agents/narrative-writer.md')
  await mkdir(join(skillDir, 'references/templates/agents'), { recursive: true })
  await writeFile(rolePath, '---\nname: narrative-writer\n---\n项目定制写手标记\n')
  await writeFile(join(skillDir, 'SKILL.md'), '---\nname: story-setup\ndescription: Project setup\n---\nProject setup\n')
  const children: Agent[] = []
  ctx.on('agent/created', ({ agent }) => { if (agent.session.header.origin === 'subagent') children.push(agent) })
  const result = await call('writer_agent', task)
  expect(result.isError, JSON.stringify(result)).toBe(false)
  await drain()
  expect(JSON.stringify(children[0]?.session.snapshotEvents())).toContain('项目定制写手标记')
  await writeFile(rolePath, '---\nname: wrong-role\n---\nwrong\n')
  const malformed = await call('writer_agent', task)
  expect(malformed.isError).toBe(true)
  expect(JSON.stringify(malformed)).toContain('Malformed Writer role')
  await rm(rolePath)
  expect((await call('writer_agent', task)).isError).toBe(true)
  expect(children).toHaveLength(1)
})

it('preserves native model policy, delegation depth, restrictions, cancellation and unload', async () => {
  const { ctx, parent, plugin, call } = await setup(0)
  const children: Agent[] = []
  ctx.on('agent/created', ({ agent }) => { if (agent.session.header.origin === 'subagent') children.push(agent) })
  const modelDenied = await call('writer_agent', { ...task, provider: 'other-provider', model: 'other-model' })
  expect(modelDenied.isError).toBe(true)
  expect(JSON.stringify(modelDenied)).toContain('model')
  const abort = new AbortController()
  abort.abort()
  expect((await call('writer_agent', task, parent, abort.signal)).isError).toBe(true)
  expect((await call('writer_agent', { ...task, role: '../narrative-writer' })).isError).toBe(true)
  expect((await call('writer_agent', { ...task, prompt: '' })).isError).toBe(true)
  const depthDenied = await call('writer_agent', task)
  expect(depthDenied.isError).toBe(true)
  expect(JSON.stringify(depthDenied)).toContain('depth')
  const unrestrict = parent.ctx.get('tools')!.restrict({ deny: ['subagent'] })
  const restricted = await call('writer_agent', task)
  expect(restricted.isError).toBe(true)
  expect(JSON.stringify(restricted)).toContain('subagent')
  unrestrict()
  expect(children).toHaveLength(0)
  await plugin.dispose()
  expect((await call('writer_agent', task)).isError).toBe(true)
})
