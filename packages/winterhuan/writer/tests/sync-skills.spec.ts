import { mkdtemp, readFile, rm, writeFile, mkdir, symlink, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import * as SkillFileSystem from '@deepseek-ai/dsh-skill-filesystem'
import { afterEach, expect, it } from 'vitest'
import { packageSkillsDir } from '../src/skills-dir.ts'
import { restoreWriterSkills, syncWriterSkills, unsyncWriterSkills } from '../src/sync-skills.ts'

const tempDirs: string[] = []
afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

async function tempDir(name: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `dsh-writer-${name}-`))
  tempDirs.push(dir)
  return realpath(dir)
}

it('copies story skills into .agents/skills without overwriting, then a force sync replaces them', async () => {
  const project = await tempDir('project')
  await mkdir(join(project, '.git'))
  const book = join(project, 'book')
  await mkdir(book)
  const source = packageSkillsDir()
  const first = await syncWriterSkills({ sourceDir: source, workspaceDir: book, force: false })
  expect(first.root).toBe(project)
  expect(first.copied).toEqual(expect.arrayContaining(['story', 'story-long-write', 'story-short-write', 'story-deslop', 'story-zhuque', 'story-long-scan', 'story-long-analyze', 'story-short-scan', 'story-short-analyze', 'story-cover', 'browser-cdp']))
  expect(first.skipped).toEqual([])
  const storyFile = join(project, '.agents/skills/story/SKILL.md')
  const original = await readFile(storyFile, 'utf8')
  await writeFile(storyFile, '---\nname: story\ndescription: local edit\n---\n\nlocal\n')
  const second = await syncWriterSkills({ sourceDir: source, workspaceDir: book, force: false })
  expect(second.copied).not.toContain('story')
  expect(second.skipped).toContain('story')
  expect(await readFile(storyFile, 'utf8')).toContain('local edit')
  const forced = await syncWriterSkills({ sourceDir: source, workspaceDir: book, force: true })
  expect(forced.copied).toContain('story')
  expect(await readFile(storyFile, 'utf8')).toBe(original)
  expect(forced.backupPath).toBeDefined()
  expect(await readFile(join(forced.backupPath!, 'story', 'SKILL.md'), 'utf8')).toContain('local edit')
  const restored = await restoreWriterSkills({ workspaceDir: book, batch: basename(forced.backupPath!) })
  expect(await readFile(storyFile, 'utf8')).toContain('local edit')
  expect(await readFile(join(restored.backupPath!, 'story', 'SKILL.md'), 'utf8')).toBe(original)
})

it('discovers story skills from the workspace copy and not from an unused bundled directory', async () => {
  const home = await tempDir('home')
  const project = await tempDir('discover')
  await mkdir(join(project, '.git'))
  await syncWriterSkills({ sourceDir: packageSkillsDir(), workspaceDir: project, force: false })
  const bundled = await tempDir('bundled')
  await mkdir(join(bundled, 'only-bundled'), { recursive: true })
  await writeFile(join(bundled, 'only-bundled/SKILL.md'), '---\nname: only-bundled\ndescription: should stay hidden\n---\n\nno\n')
  const ctx = new Context()
  const bundledCtx = new Context()
  try {
    await ctx.plugin(SkillRegistry)
    await ctx.plugin(SkillFileSystem, {
      dshHome: join(home, '.dsh'),
      agentsHome: join(home, '.agents'),
      watch: false,
    })
    const names = (await ctx.skills.list({ cwd: join(project, 'chapters') })).map(skill => skill.name)
    expect(names).toEqual(expect.arrayContaining(['story', 'story-long-write', 'story-short-write', 'story-deslop', 'story-zhuque', 'story-long-scan', 'story-long-analyze', 'story-short-scan', 'story-short-analyze', 'story-cover', 'browser-cdp']))
    expect(names).not.toContain('only-bundled')
    await bundledCtx.plugin(SkillRegistry)
    await bundledCtx.plugin(SkillFileSystem, {
      dshHome: join(home, '.dsh'),
      agentsHome: join(home, '.agents'),
      watch: false,
      includeDefaultRoots: false,
      bundledSkillDir: packageSkillsDir(),
    })
    const bundledNames = (await bundledCtx.skills.list({ cwd: project })).map(skill => skill.name)
    expect(bundledNames).toContain('story-long-write')
    expect(bundledNames).not.toContain('only-bundled')
  } finally {
    await ctx.fiber.dispose()
    await bundledCtx.fiber.dispose()
  }
})

it('unsync removes only packaged Writer skill directories and leaves other project skills', async () => {
  const project = await tempDir('unsync')
  await mkdir(join(project, '.git'))
  const source = packageSkillsDir()
  await syncWriterSkills({ sourceDir: source, workspaceDir: project, force: false })
  const custom = join(project, '.agents/skills/my-custom-skill')
  await mkdir(custom, { recursive: true })
  await writeFile(join(custom, 'SKILL.md'), '---\nname: my-custom-skill\ndescription: keep me\n---\n\nkeep\n')
  const storyFile = join(project, '.agents/skills/story/SKILL.md')
  expect(await readFile(storyFile, 'utf8')).toContain('name: story')
  const result = await unsyncWriterSkills({ sourceDir: source, workspaceDir: project })
  expect(result.removed).toEqual(expect.arrayContaining(['story', 'story-long-write', 'story-cover']))
  expect(result.removed).not.toContain('my-custom-skill')
  expect(await readFile(join(result.backupPath!, 'story', 'SKILL.md'), 'utf8')).toContain('name: story')
  await expect(readFile(storyFile, 'utf8')).rejects.toThrow()
  expect(await readFile(join(custom, 'SKILL.md'), 'utf8')).toContain('keep me')
  const again = await unsyncWriterSkills({ sourceDir: source, workspaceDir: project })
  expect(again.removed).toEqual([])
  expect(again.missing).toEqual(expect.arrayContaining(['story', 'story-long-write']))
})

it('sync can still force-write packaged skills after default mounts as bundled', async () => {
  const project = await tempDir('sync-after-bundled')
  await mkdir(join(project, '.git'))
  const source = packageSkillsDir()
  const forced = await syncWriterSkills({ sourceDir: source, workspaceDir: project, force: true })
  expect(forced.copied).toEqual(expect.arrayContaining(['story', 'story-zhuque']))
  expect(await readFile(join(project, '.agents/skills/story/SKILL.md'), 'utf8')).toContain('name: story')
})

async function smallSource(): Promise<string> {
  const source = await tempDir('small-source')
  await mkdir(join(source, 'story'))
  await writeFile(join(source, 'story', 'SKILL.md'), '---\nname: story\ndescription: source\n---\nbody\n')
  return source
}

it('restores an unsynced project copy while preserving the original backup', async () => {
  const project = await tempDir('restore')
  const source = await smallSource()
  await syncWriterSkills({ sourceDir: source, workspaceDir: project, force: false })
  const file = join(project, '.agents/skills/story/SKILL.md')
  await writeFile(file, 'author custom skill')
  const moved = await unsyncWriterSkills({ sourceDir: source, workspaceDir: project })
  const result = await restoreWriterSkills({ workspaceDir: project, batch: basename(moved.backupPath!) })
  expect(result.restored).toEqual(['story'])
  expect(result.backupPath).toBeUndefined()
  expect(await readFile(file, 'utf8')).toBe('author custom skill')
  expect(await readFile(join(moved.backupPath!, 'story/SKILL.md'), 'utf8')).toBe('author custom skill')
})

it('rejects linked destinations and self-copy without touching author files', async () => {
  const project = await tempDir('linked')
  const outside = await tempDir('outside')
  const source = await smallSource()
  await writeFile(join(outside, 'sentinel'), 'untouched')
  await symlink(outside, join(project, '.agents'), 'dir')
  await expect(syncWriterSkills({ sourceDir: source, workspaceDir: project, force: true })).rejects.toThrow('ordinary directory')
  await expect(unsyncWriterSkills({ sourceDir: source, workspaceDir: project })).rejects.toThrow('ordinary directory')
  expect(await readFile(join(outside, 'sentinel'), 'utf8')).toBe('untouched')
  await rm(join(project, '.agents'))
  await syncWriterSkills({ sourceDir: source, workspaceDir: project, force: false })
  const destination = join(project, '.agents/skills')
  await expect(syncWriterSkills({ sourceDir: destination, workspaceDir: project, force: true })).rejects.toThrow('overlap')
  await expect(unsyncWriterSkills({ sourceDir: destination, workspaceDir: project })).rejects.toThrow('overlap')
  expect(await readFile(join(destination, 'story/SKILL.md'), 'utf8')).toContain('body')
})

it('validates every tree before replacement and rejects backup path traversal', async () => {
  const project = await tempDir('failed-sync')
  const source = await smallSource()
  await syncWriterSkills({ sourceDir: source, workspaceDir: project, force: false })
  const file = join(project, '.agents/skills/story/SKILL.md')
  await writeFile(file, 'author changes')
  const outside = await tempDir('linked-source')
  await symlink(outside, join(source, 'story', 'linked'), 'dir')
  await expect(syncWriterSkills({ sourceDir: source, workspaceDir: project, force: true })).rejects.toThrow('symbolic links')
  expect(await readFile(file, 'utf8')).toBe('author changes')
  await expect(restoreWriterSkills({ workspaceDir: project, batch: '../skills' })).rejects.toThrow('batch name')
  await symlink(outside, join(project, '.agents/writer-skill-backups/linked'), 'dir')
  await expect(restoreWriterSkills({ workspaceDir: project, batch: 'linked' })).rejects.toThrow('ordinary directory')
})

it('serializes simultaneous initial copies and preserves the existing copy on later sync', async () => {
  const project = await tempDir('concurrent')
  const source = await smallSource()
  const options = { sourceDir: source, workspaceDir: project, force: false }
  const results = await Promise.all([syncWriterSkills(options), syncWriterSkills(options)])
  expect(results.map(result => result.copied.length).sort()).toEqual([0, 1])
  expect(results.flatMap(result => result.skipped)).toEqual(['story'])
})
