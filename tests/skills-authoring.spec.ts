/** Generation must preserve deployable skills and fail without rewriting stale or invalid sources. */
import { execFileSync } from 'node:child_process'
import { chmodSync, cpSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import { parse as parseToml } from 'smol-toml'
import { expect, it, onTestFinished } from 'vitest'
import { renderSkills, runSkills } from '../scripts/skills-authoring.ts'
import { buildDshAgentPrompt, writerRoles } from '../packages/winterhuan/writer/src/role-prompt.ts'

const packageRoot = fileURLToPath(new URL('../packages/winterhuan/writer/', import.meta.url))
const templates = 'skills/story-setup/references/templates/agents/'
const architect = templates + 'story-architect.md'

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'writer-authoring-'))
  onTestFinished(() => { rmSync(root, { recursive: true, force: true }) })
  for (const dir of ['authoring', 'skills']) cpSync(join(packageRoot, dir), join(root, dir), { recursive: true })
  return root
}

function append(root: string, file: string, text: string) {
  writeFileSync(join(root, file), readFileSync(join(root, file), 'utf8') + text)
}

function metadata(text: string) {
  return load(text.split('---')[1]!)
}

it('ships the rendered outputs with the existing host capabilities and conditional resource pointers', () => {
  expect(runSkills(packageRoot, 'check').changed).toEqual([])
  const rendered = renderSkills(packageRoot)
  for (const role of writerRoles) {
    expect(metadata(rendered.get(templates + role + '.md')!)).toMatchObject({ name: role })
    expect(metadata(rendered.get(`skills/story-setup/references/zcode/agents/${role}.md`)!)).toMatchObject({ name: role, model: 'inherit' })
    expect(metadata(rendered.get(`skills/story-setup/references/dsh/agents/${role}.md`)!)).toEqual({
      name: role, description: expect.any(String), writerRoleFormat: 'dsh-v1',
    })
  }
  expect(metadata(rendered.get(templates + 'chapter-extractor.md')!)).toMatchObject({
    tools: ['Read', 'Glob', 'Grep', 'Write', 'Edit'], disallowedTools: ['Bash'], maxTurns: 20,
    hooks: { PreToolUse: [{ matcher: 'Write|Edit', hooks: [{ type: 'command' }] }] },
  })
  expect(metadata(rendered.get('skills/story-setup/references/opencode/agents/chapter-extractor.md')!)).toMatchObject({
    mode: 'subagent', steps: 20, permissions: expect.arrayContaining([
      { action: 'shell', resource: '*', effect: 'deny' },
      { action: 'edit', resource: '_analysis_cache/输入-RAW-*.md', effect: 'allow' },
      { action: 'edit', resource: '*/_analysis_cache/输入-REUSE-*.md', effect: 'allow' },
    ]),
  })
  for (const role of ['story-explorer', 'consistency-checker']) {
    const toml = rendered.get(`skills/story-setup/references/codex/agents/${role}.toml`)!
    expect(toml).toContain('sandbox_mode = "read-only"')
  }
  expect(rendered.get('skills/story-setup/references/codex/agents/chapter-extractor.toml')).not.toContain('sandbox_mode = "read-only"')
})

it('propagates a role change to all hosts without expanding its deferred method reference', async () => {
  const root = fixture()
  const source = 'authoring/roles/story-architect.md'
  append(root, source, '\n仅在修订伏笔时读取 `{{WRITER_METHOD_ROOT}}long-suspense.md`。{书名} {章节} {文件名}\n')
  const result = runSkills(root, 'generate')
  expect(result.changed.sort()).toEqual([
    architect, 'skills/story-setup/references/codex/agents/story-architect.toml',
    'skills/story-setup/references/opencode/agents/story-architect.md',
    'skills/story-setup/references/zcode/agents/story-architect.md',
    'skills/story-setup/references/dsh/agents/story-architect.md',
  ].sort())
  expect(runSkills(root, 'check').changed).toEqual([])
  const reads: string[] = []
  const prompt = await buildDshAgentPrompt({ setupDir: join(root, 'skills/story-setup'), format: 'dsh', role: 'story-architect',
    projectDir: root, task: '本次仅审查伏笔', read: async file => { reads.push(file); return readFileSync(file, 'utf8') } })
  expect(reads).toEqual([join(root, 'skills/story-setup/references/dsh/agents/story-architect.md')])
  expect(prompt).toContain('仅在修订伏笔时读取')
  expect(prompt).toContain('{书名} {章节} {文件名}')
  const method = readFileSync(join(root, 'skills/story-setup/references/agent-references/long-suspense.md'), 'utf8')
  expect(prompt).not.toContain(method.trim())
})

it('detects missing and manually changed outputs without repairing them in check mode', () => {
  const root = fixture()
  append(root, architect, '\nmanual output edit\n')
  const altered = readFileSync(join(root, architect), 'utf8')
  const missing = 'skills/story-review/references/expression.md'
  rmSync(join(root, missing))
  expect(() => runSkills(root, 'check')).toThrow(/Generated skills are stale/)
  expect(readFileSync(join(root, architect), 'utf8')).toBe(altered)
  expect(() => readFileSync(join(root, missing))).toThrow()
  const unmanaged = 'skills/story-review/references/author-custom.md'
  writeFileSync(join(root, unmanaged), 'author copy\n')
  runSkills(root, 'generate')
  expect(readFileSync(join(root, unmanaged), 'utf8')).toBe('author copy\n')
  expect(runSkills(root, 'generate').changed).toEqual([])
})

it.each(['missing-role', 'mismatched-name', 'unknown-slot', 'missing-reference', 'invalid-host-header', 'invalid-antigravity-tool', 'invalid-dsh-format', 'invalid-dsh-binding'])(
  'rejects %s before updating any registered file', problem => {
    const root = fixture()
    append(root, architect, '\nkeep this output untouched on validation failure\n')
    const before = readFileSync(join(root, architect), 'utf8')
    const source = join(root, 'authoring/roles/story-architect.md')
    if (problem === 'missing-role') rmSync(source)
    if (problem === 'mismatched-name') writeFileSync(source, readFileSync(source, 'utf8').replace('name: story-architect', 'name: other'))
    if (problem === 'unknown-slot') append(root, 'authoring/roles/story-architect.md', '{{WRITER_NONEXISTENT}}\n')
    if (problem === 'missing-reference') append(root, 'authoring/roles/story-architect.md', '`story-setup/references/agent-references/missing-method.md`\n')
    if (problem === 'invalid-host-header') {
      const host = join(root, 'authoring/hosts/codex.yaml')
      writeFileSync(host, readFileSync(host, 'utf8').replace('name =', 'name ?'))
    }
    if (problem === 'invalid-antigravity-tool') {
      const host = join(root, 'authoring/hosts/claude.yaml')
      writeFileSync(host, readFileSync(host, 'utf8').replace('[Read, Glob, Grep, Write, Edit]', '[UnsupportedTool]'))
    }
    if (problem === 'invalid-dsh-format') {
      const host = join(root, 'authoring/hosts/dsh.yaml')
      writeFileSync(host, readFileSync(host, 'utf8').replace('dsh-v1', 'dsh-v2'))
    }
    if (problem === 'invalid-dsh-binding') append(root, 'authoring/roles/story-architect.md', '{WRITER_UNRESOLVED}\n')
    expect(() => runSkills(root, 'generate')).toThrow()
    expect(readFileSync(join(root, architect), 'utf8')).toBe(before)
  },
)

it('checks copied references in their destination context before publishing', () => {
  const root = fixture()
  const copies = 'authoring/copies.yaml'
  append(root, copies, '- source: story-deslop/references/expression.md\n  targets:\n    - story-cover/references/expression.md\n')
  expect(() => runSkills(root, 'generate')).toThrow(/invalid reference/)
  expect(() => readFileSync(join(root, 'skills/story-cover/references/expression.md'))).toThrow()
})

it.each(['duplicate', 'escape', 'source-is-output', 'symlink'])('rejects %s destinations', problem => {
  const root = fixture()
  let target = 'story-review/references/expression.md'
  if (problem === 'escape') target = '../../outside.md'
  if (problem === 'source-is-output') target = 'story-deslop/references/expression.md'
  if (problem === 'symlink') {
    target = 'story-cover/references/generated.md'
    rmSync(join(root, 'skills/story-cover/references'), { recursive: true, force: true })
    symlinkSync(join(root, 'skills/story-deslop/references'), join(root, 'skills/story-cover/references'), 'junction')
  }
  append(root, 'authoring/copies.yaml', `- source: story-deslop/references/expression.md\n  targets:\n    - ${target}\n`)
  expect(() => runSkills(root, 'generate')).toThrow()
})

it('preserves TOML escapes and dispatch syntax through parsing, including triple quotes', () => {
  const root = fixture()
  append(root, 'authoring/roles/story-explorer.md', '\nLiteral: """ and \\n and \\* and {书名}.\n')
  runSkills(root, 'generate')
  const file = join(root, 'skills/story-setup/references/codex/agents/story-explorer.toml')
  const body = parseToml(readFileSync(file, 'utf8')).developer_instructions
  expect(body).toContain('Literal: """ and \\n and \\* and {书名}.')
  expect(body).toContain('`Agent(agent_type: "story-explorer")`')
})

it('keeps generated scripts runnable as a standalone skill inside an ESM project', () => {
  const root = fixture()
  const source = 'skills/story-deslop/scripts/style-whitelist.js'
  append(root, source, '\n// updated shared helper\n')
  const checker = 'skills/story-review/scripts/check-ai-patterns.js'
  rmSync(join(root, checker))
  runSkills(root, 'generate')
  if (process.platform !== 'win32') {
    expect(lstatSync(join(root, checker)).mode & 0o111).toBe(0o111)
    chmodSync(join(root, checker), 0o644)
    expect(() => runSkills(root, 'check')).toThrow(/Generated skills are stale/)
    runSkills(root, 'generate')
  }
  const project = join(root, 'project')
  mkdirSync(project)
  writeFileSync(join(project, 'package.json'), '{"type":"module"}\n')
  const dest = join(project, '.agents/skills/story-review/scripts')
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(join(root, 'skills/story-review/scripts'), dest, { recursive: true })
  const manuscript = join(project, '正文.md')
  writeFileSync(manuscript, '她打开门，把雨伞靠在墙角。\n')
  const result = execFileSync(process.execPath, [join(dest, 'check-ai-patterns.js'), '--check', '--json', '--fail-on=blocking', manuscript], { cwd: project, encoding: 'utf8' })
  expect(JSON.parse(result).findings).toEqual([])
  expect(readFileSync(join(dest, 'style-whitelist.js'), 'utf8')).toContain('updated shared helper')
})

it('packs standalone skills with executable scripts and blocks a stale release without rewriting it', () => {
  const root = mkdtempSync(join(tmpdir(), 'writer-pack-'))
  onTestFinished(() => { rmSync(root, { recursive: true, force: true }) })
  const repo = fileURLToPath(new URL('../', import.meta.url))
  const pkg = join(root, 'packages/winterhuan/writer')
  mkdirSync(join(pkg, 'src'), { recursive: true })
  mkdirSync(join(root, 'scripts'))
  for (const dir of ['skills', 'authoring']) cpSync(join(packageRoot, dir), join(pkg, dir), { recursive: true })
  for (const script of ['skills.ts', 'skills-authoring.ts']) cpSync(join(repo, 'scripts', script), join(root, 'scripts', script))
  cpSync(join(packageRoot, 'src/role-prompt.ts'), join(pkg, 'src/role-prompt.ts'))
  cpSync(join(repo, 'package.json'), join(root, 'package.json'))
  cpSync(join(packageRoot, 'package.json'), join(pkg, 'package.json'))
  symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'), 'junction')
  const destination = join(root, 'packed')
  mkdirSync(destination)
  // Reuse this checkout's installed tools without letting pnpm reinstall the private fixture.
  const options = { cwd: root, encoding: 'utf8' as const, env: { ...process.env, pnpm_config_verify_deps_before_run: 'false' }, stdio: 'pipe' as const, timeout: 20_000 }
  const args = ['run', 'pack:writer', '--json', '--pack-destination', destination]
  const stdout = execFileSync('pnpm', args, options)
  const packed: { filename: string, files: { path: string, mode: number }[] }[] = JSON.parse(stdout.slice(stdout.indexOf('[\n')))
  const archive = packed[0]!
  expect(archive.files.some(file => file.path.startsWith('authoring/'))).toBe(false)
  expect(archive.files.find(file => file.path === 'skills/story-review/scripts/package.json')).toBeDefined()
  const checker = archive.files.find(file => file.path === 'skills/story-review/scripts/check-ai-patterns.js')!
  expect(checker).toBeDefined()
  if (process.platform !== 'win32') expect(checker.mode & 0o111).toBe(0o111)
  const before = readFileSync(join(destination, archive.filename))
  append(pkg, architect, '\nmanual release edit\n')
  expect(() => execFileSync('pnpm', args, options)).toThrow(/Generated skills are stale/)
  expect(readFileSync(join(destination, archive.filename))).toEqual(before)
})
