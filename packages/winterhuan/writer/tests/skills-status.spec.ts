import { mkdtemp, mkdir, readFile, rm, writeFile, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import * as SkillFileSystem from '@deepseek-ai/dsh-skill-filesystem'
import { expect, it, onTestFinished } from 'vitest'
import { inspectWriterSkills } from '../src/skills-status.ts'
import { syncWriterSkills, unsyncWriterSkills } from '../src/sync-skills.ts'

it('reports actual project precedence over bundled and detects reference-only changes', async () => {
  const temp = await realpath(await mkdtemp(join(tmpdir(), 'writer-status-')))
  onTestFinished(() => rm(temp, { recursive: true, force: true }))
  const project = join(temp, 'project')
  const source = join(temp, 'package', 'skills')
  await mkdir(join(project, '.git'), { recursive: true })
  await mkdir(join(source, 'story'), { recursive: true })
  const skill = '---\nname: story\ndescription: Test story\n---\nStory instructions\n'
  await writeFile(join(source, '..', 'package.json'), '{"version":"0.1.8"}')
  await writeFile(join(source, 'story', 'VERSION'), '1.3.6\n')
  await writeFile(join(source, 'story', 'SKILL.md'), skill)
  await writeFile(join(source, 'story', 'reference.md'), 'package reference')
  const inspect = async () => {
    const ctx = new Context()
    try {
      await ctx.plugin(SkillRegistry)
      await ctx.plugin(SkillFileSystem, {
        watch: false, bundledSkillDir: source,
        dshHome: join(temp, 'home', '.dsh'), agentsHome: join(temp, 'home', '.agents'),
      })
      return await inspectWriterSkills({
        sourceDir: source, workspaceDir: project, mount: 'bundled', catalog: await ctx.skills.list({ cwd: project }),
      })
    } finally {
      await ctx.fiber.dispose()
    }
  }
  expect((await inspect()).skills[0]).toMatchObject({ effectiveSource: 'bundled', comparison: 'same' })
  await syncWriterSkills({ sourceDir: source, workspaceDir: project, force: false })
  const custom = join(project, '.agents', 'skills', 'story')
  await writeFile(join(custom, 'reference.md'), 'author reference')
  const changed = await inspect()
  expect(changed).toMatchObject({ packageVersion: '0.1.8', upstreamSkillsVersion: '1.3.6', mount: 'bundled' })
  expect(changed.skills[0]).toMatchObject({
    effectiveSource: 'project-agents', effectivePath: join(custom, 'SKILL.md'), comparison: 'different',
    projectCopies: [{ path: custom, comparison: 'different' }],
  })
  expect(await readFile(join(custom, 'SKILL.md'), 'utf8')).toBe(skill)
  const higher = join(project, '.dsh', 'skills', 'story')
  await mkdir(higher, { recursive: true })
  await writeFile(join(higher, 'SKILL.md'), skill.replace('Test story', 'Higher priority'))
  expect((await inspect()).skills[0]).toMatchObject({ effectiveSource: 'project-dsh', effectivePath: join(higher, 'SKILL.md') })
  await unsyncWriterSkills({ sourceDir: source, workspaceDir: project })
  expect((await inspect()).skills[0]?.effectiveSource).toBe('project-dsh')
  await rm(join(project, '.dsh'), { recursive: true })
  expect((await inspect()).skills[0]).toMatchObject({ effectiveSource: 'bundled', comparison: 'same' })
})
