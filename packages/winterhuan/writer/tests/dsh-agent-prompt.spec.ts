/** Role assembly binds explicit DSH paths while preserving project-owned legacy templates. */
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it, onTestFinished } from 'vitest'
import { buildDshAgentPrompt, writerRoles } from '../src/role-prompt.ts'

it('loads each native DSH role without reading deferred references or another host template', async () => {
  const project = await mkdtemp(join(tmpdir(), 'writer-dsh-role-'))
  onTestFinished(() => rm(project, { recursive: true, force: true }))
  const setupDir = fileURLToPath(new URL('../skills/story-setup', import.meta.url))
  for (const role of writerRoles) {
    const reads: string[] = []
    const prompt = await buildDshAgentPrompt({ setupDir, format: 'dsh', role, projectDir: project, task: '只读审查第1章，不改任何文件。',
      read: path => { reads.push(path); return readFile(path, 'utf8') } })
    expect(reads).toEqual([join(setupDir, 'references/dsh/agents', `${role}.md`)])
    expect(prompt).toContain('只读审查第1章，不改任何文件。')
    expect(prompt).toContain(join(setupDir, 'references', 'agent-references'))
    expect(prompt).not.toContain('.claude/')
    expect(prompt).not.toContain('model: opus')
    expect(prompt).not.toContain('CLAUDE_PROJECT_DIR')
    expect(prompt).not.toContain('{SKILL_DIR}')
    expect(prompt).not.toContain('{WRITER_REFERENCE_DIR}')
    expect(prompt).not.toContain('writerRoleFormat:')
    expect(prompt).not.toContain('Agent(subagent_type:')
    expect(prompt).toContain('不要再派子代理')
  }
  await expect(buildDshAgentPrompt({ setupDir, format: 'dsh', role: '../narrative-writer', projectDir: project, task: 'write', read: path => readFile(path, 'utf8') })).rejects.toThrow('Unknown Writer role')
  await expect(buildDshAgentPrompt({ setupDir, format: 'dsh', role: 'narrative-writer', projectDir: project, task: '', read: path => readFile(path, 'utf8') })).rejects.toThrow('must not be empty')
})

it('keeps the existing project template path and custom prose while adapting legacy resource pointers', async () => {
  const setupDir = fileURLToPath(new URL('../skills/story-setup', import.meta.url))
  const reads: string[] = []
  const prompt = await buildDshAgentPrompt({ setupDir, format: 'legacy-project', role: 'narrative-writer', projectDir: '/project', task: '只读审查',
    read: async path => { reads.push(path); return await readFile(path, 'utf8') + '\n项目自定规则：保留 {书名} 与 {章节}。\n' } })
  expect(reads).toEqual([join(setupDir, 'references/templates/agents/narrative-writer.md')])
  expect(prompt).toContain('项目自定规则：保留 {书名} 与 {章节}。')
  expect(prompt).toContain(join(setupDir, 'references/agent-references/style-resolution.md'))
  expect(prompt).not.toContain('.claude/')
})

it.each([
  ['wrong name', '---\nname: story-explorer\nwriterRoleFormat: dsh-v1\n---\n正文\n', 'Malformed Writer role'],
  ['unsupported format', '---\nname: narrative-writer\nwriterRoleFormat: dsh-v2\n---\n正文\n', 'Unsupported DSH Writer role format'],
  ['missing format', '---\nname: narrative-writer\n---\n正文\n', 'Unsupported DSH Writer role format'],
  ['empty body', '---\nname: narrative-writer\nwriterRoleFormat: dsh-v1\n---\n\n', 'Empty Writer role'],
  ['unknown binding', '---\nname: narrative-writer\nwriterRoleFormat: dsh-v1\n---\n{WRITER_UNRESOLVED}\n', 'Unknown DSH Writer role binding'],
])('rejects a native role with %s without falling back to a different source', async (_case, source, message) => {
  const reads: string[] = []
  await expect(buildDshAgentPrompt({ setupDir: '/skills/story-setup', format: 'dsh', role: 'narrative-writer', projectDir: '/book', task: '只读',
    read: async path => { reads.push(path); return source } })).rejects.toThrow(message)
  expect(reads).toHaveLength(1)
})

it('reports native read failures instead of loading another role template', async () => {
  const reads: string[] = []
  await expect(buildDshAgentPrompt({ setupDir: '/skills/story-setup', format: 'dsh', role: 'narrative-writer', projectDir: '/book', task: '只读',
    read: async path => { reads.push(path); throw new Error('permission denied') } })).rejects.toThrow('permission denied')
  expect(reads).toHaveLength(1)
})
