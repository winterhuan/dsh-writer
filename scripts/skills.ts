/** Maintainer CLI; installed plugins consume committed skill artifacts directly. */
import { fileURLToPath } from 'node:url'
import { runSkills } from './skills-authoring.ts'

const mode = process.argv[2]
if (process.argv.length !== 3 || (mode !== 'check' && mode !== 'generate')) {
  throw new Error('Usage: tsx scripts/skills.ts check|generate')
}
try {
  const result = runSkills(fileURLToPath(new URL('../packages/winterhuan/writer/', import.meta.url)), mode)
  process.stdout.write(`Writer skills: ${result.count} outputs ${mode === 'check' ? 'checked' : `rendered, ${result.changed.length} updated`}.\n`)
} catch (error) {
  for (let current: unknown = error; current instanceof Error; current = current.cause) process.stderr.write(`${current.message}\n`)
  process.exitCode = 1
}
