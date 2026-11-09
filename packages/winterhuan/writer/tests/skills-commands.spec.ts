import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import Commands from '@deepseek-ai/dsh-commands'
import { SessionId } from '@deepseek-ai/dsh-session'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import * as SkillFileSystem from '@deepseek-ai/dsh-skill-filesystem'
import { expect, it, onTestFinished } from 'vitest'
import * as Writer from '../src/index.ts'

it('runs source diagnostics in a real agent and unregisters every command on unload', async () => {
  const project = await mkdtemp(join(tmpdir(), 'writer-command-'))
  onTestFinished(() => rm(project, { recursive: true, force: true }))
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await mountAgentLoopTestDependencies(ctx)
  const harness = await mountAgentLoopTestHarness(ctx)
  await ctx.plugin(Commands)
  await ctx.plugin(SkillRegistry)
  const writer = await ctx.plugin(Writer)
  const agent = await harness.create(SessionId('writer-command-test'), {}, { cwd: project })
  await agent.ctx.plugin(SkillFileSystem, {
    watch: false, bundledSkillDir: Writer.packageSkillsDir(), includeDefaultRoots: false,
  })
  const execute = async (input: string) => ctx.commands.execute(agent, input, [], new AbortController().signal)
  const status = await execute('/writer-skills-status')
  expect(status?.result.kind, JSON.stringify(status?.result)).toBe('success')
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  expect(status?.result.text).toContain(`Writer ${manifest.version}`)
  expect(status?.result.text).toContain('story-long-write：bundled')
  expect((await execute('/writer-skills-status unexpected'))?.result.kind).toBe('error')
  expect((await execute('/writer-restore-skills'))?.result.kind).toBe('error')
  const names = ['writer-sync-skills', 'writer-unsync-skills', 'writer-skills-status', 'writer-restore-skills']
  for (const name of names) expect(ctx.commands.find(agent, name)).toBeDefined()
  await writer.dispose()
  for (const name of names) expect(ctx.commands.find(agent, name)).toBeUndefined()
})
