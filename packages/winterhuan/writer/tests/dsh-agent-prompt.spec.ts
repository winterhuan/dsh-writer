import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it, onTestFinished } from 'vitest'
import { buildDshAgentPrompt } from '../skills/story-setup/scripts/build-dsh-agent-prompt.mjs'

it('adapts shipped roles to actual DSH paths without carrying host model or hooks configuration', async () => {
  const project = await mkdtemp(join(tmpdir(), 'writer-dsh-role-'))
  onTestFinished(() => rm(project, { recursive: true, force: true }))
  const setupDir = fileURLToPath(new URL('../skills/story-setup', import.meta.url))
  for (const role of ['story-architect', 'character-designer', 'narrative-writer', 'consistency-checker', 'story-explorer', 'story-researcher', 'chapter-extractor']) {
    const prompt = await buildDshAgentPrompt({ setupDir, role, projectDir: project, task: '只读审查第1章，不改任何文件。' })
    expect(prompt).toContain('只读审查第1章，不改任何文件。')
    expect(prompt).toContain(join(setupDir, 'references', 'agent-references'))
    expect(prompt).not.toContain('.claude/')
    expect(prompt).not.toContain('model: opus')
    expect(prompt).not.toContain('CLAUDE_PROJECT_DIR')
    expect(prompt).not.toContain('{SKILL_DIR}')
    expect(prompt).toContain('不要再派子代理')
  }
  await expect(buildDshAgentPrompt({ setupDir, role: '../narrative-writer', projectDir: project, task: 'write' })).rejects.toThrow('Unknown Writer role')
  await expect(buildDshAgentPrompt({ setupDir, role: 'narrative-writer', projectDir: project, task: '' })).rejects.toThrow('must not be empty')
})
