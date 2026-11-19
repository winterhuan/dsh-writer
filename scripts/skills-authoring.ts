/** Development-only rendering and validation of the independently deployable Writer skills. */
import { execFileSync } from 'node:child_process'
import { chmodSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, posix, resolve } from 'node:path'
import { load } from 'js-yaml'
import { parse as parseToml } from 'smol-toml'
import { fromMarkdown } from 'mdast-util-from-markdown'
import type { Nodes } from 'mdast'
import { writerRoles } from '../packages/winterhuan/writer/src/role-prompt.ts'

const references = 'skills/story-setup/references/'
const roleReferences = `${references}agent-references/`
const hosts = ['claude', 'codex', 'opencode', 'zcode', 'dsh'] as const
const slot = /\{\{WRITER_([A-Z_]+)\}\}/g

function record(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${context}: expected a mapping`)
  return Object.fromEntries(Object.entries(value))
}

function string(value: unknown, context: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${context}: expected a nonempty string`)
  return value
}

function strings(value: unknown, context: string): Record<string, string> {
  return Object.fromEntries(Object.entries(record(value, context)).map(([key, item]) => [key, string(item, `${context}.${key}`)]))
}

function pathIn(root: string, relative: string): string {
  if (!relative || relative.includes('\\') || relative.startsWith('/') || /^[A-Za-z]:/.test(relative)
    || posix.normalize(relative) !== relative || relative.split('/').some(part => part === '..' || part === '.')) {
    throw new Error(`Unsafe authoring path: ${relative}`)
  }
  let current = resolve(root)
  for (const part of relative.split('/')) {
    current = join(current, part)
    try {
      if (lstatSync(current).isSymbolicLink()) throw new Error(`Authoring path must not be a symlink: ${current}`)
    } catch (error) {
      if (!isMissing(error)) throw error
    }
  }
  return current
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

function read(root: string, file: string): string {
  return readFileSync(pathIn(root, file), 'utf8')
}

function substitute(template: string, values: Record<string, string>, context: string): string {
  const result = template.replace(slot, (_, key: string) => {
    const value = values[key]
    if (value === undefined) throw new Error(`${context}: unknown reserved placeholder WRITER_${key}`)
    return value
  })
  if (result.includes('{{WRITER_')) throw new Error(`${context}: unresolved reserved placeholder`)
  return result
}

function parseRole(text: string, role: string) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]+)$/)
  if (!match) throw new Error(`${role}: expected frontmatter and a role body`)
  const metadata = record(load(match[1]!), role)
  if (metadata.name !== role) throw new Error(`${role}: mismatched role name`)
  if (Object.keys(metadata).some(key => key !== 'name' && key !== 'description')) {
    throw new Error(`${role}: host settings belong in authoring/hosts/`)
  }
  const body = match[2]!
  if (!body.trim()) throw new Error(`${role}: empty role body`)
  return { description: string(metadata.description, `${role}.description`).trimEnd(), body }
}

function tomlEscape(text: string): string {
  // TOML multiline basic strings interpret backslashes and quote delimiters.
  return text.replaceAll('\\', '\\\\').replaceAll('"""', '\\"\\"\\"')
}

function validateReferences(root: string, outputs: Map<string, string>, files: Set<string>): void {
  const get = (file: string) => outputs.get(file) ?? read(root, file)
  const requireFile = (file: string) => {
    if (!file.startsWith('skills/')) throw new Error(`Reference is outside packaged skills/: ${file}`)
    pathIn(root, file)
    if (!outputs.has(file)) read(root, file)
    if (file.endsWith('.md')) files.add(file)
    return get(file)
  }
  for (const file of files) {
    const text = get(file)
    const visit = (node: Nodes) => {
      if (node.type === 'link' || node.type === 'definition' || node.type === 'image') {
        const target = node.url.split('#')[0]!
        if (target && !/^[a-z][a-z\d+.-]*:/i.test(target) && !/[{}*]/.test(target)) {
          if (target.startsWith('/') || target.includes('\\')) throw new Error(`Reference must be relative: ${target}`)
          const relative = posix.normalize(posix.join(posix.dirname(file), decodeURIComponent(target)))
          requireFile(relative)
        }
      }
      if ('children' in node) node.children.forEach(visit)
    }
    try {
      visit(fromMarkdown(text))
      // Full role-resource pointers are also used as inline code, not Markdown links.
      for (const match of text.matchAll(/(?:story-setup\/references\/agent-references\/|\{WRITER_REFERENCE_DIR\}\/)([\p{L}\p{N}_/-]+\.md)/gu)) {
        requireFile(roleReferences + match[1]!)
      }
      if (file.startsWith(`${references}templates/agents/`) || file.startsWith(roleReferences)) {
        // A bare filename in a role's reading table refers to the canonical role resource directory.
        for (const line of text.split('\n').filter(line => line.startsWith('|'))) {
          for (const match of line.matchAll(/`([\w/-]+\.md)`/g)) {
            if (!match[1]!.startsWith('story-setup/')) requireFile(roleReferences + match[1]!)
          }
        }
      }
      if (text.includes('{{WRITER_')) throw new Error('unresolved reserved placeholder')
    } catch (error) {
      throw new Error(`${file}: invalid reference or content`, { cause: error })
    }
  }
}

function validateAntigravity(root: string, outputs: Map<string, string>): void {
  const temp = mkdtempSync(join(tmpdir(), 'writer-antigravity-check-'))
  try {
    const source = join(temp, 'source')
    mkdirSync(source)
    for (const role of writerRoles) {
      writeFileSync(join(source, `${role}.md`), outputs.get(`${references}templates/agents/${role}.md`)!)
    }
    execFileSync(process.execPath, [pathIn(root, 'skills/story-setup/scripts/generate-antigravity-agents.mjs'),
      '--source', source, '--dest', join(temp, 'agents')], { encoding: 'utf8', timeout: 10_000, stdio: 'pipe' })
    const agents = new Map(writerRoles.map(role => [
      `${references}antigravity/agents/${role}/agent.md`, readFileSync(join(temp, 'agents', role, 'agent.md'), 'utf8'),
    ]))
    validateReferences(root, new Map([...outputs, ...agents]), new Set(agents.keys()))
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}

function renderPlan(packageRoot: string) {
  const outputs = new Map<string, string>()
  const modes = new Map<string, number>()
  const sources = new Set<string>()
  const checked = new Set<string>()
  const add = (file: string, content: string, mode = 0o644) => {
    if (!file.startsWith('skills/')) throw new Error(`Output must be in skills/: ${file}`)
    pathIn(packageRoot, file)
    if (outputs.has(file)) throw new Error(`Duplicate generated destination: ${file}`)
    if (content.includes('{{WRITER_')) throw new Error(`${file}: unresolved reserved placeholder`)
    outputs.set(file, content)
    modes.set(file, mode)
    if (file.endsWith('.md') || file.endsWith('.toml')) checked.add(file)
  }
  const roleFiles = readdirSync(pathIn(packageRoot, 'authoring/roles')).sort()
  if (roleFiles.join() !== writerRoles.map(role => `${role}.md`).sort().join()) {
    throw new Error('authoring/roles must contain exactly the seven Writer roles')
  }
  for (const host of hosts) {
    const context = `authoring/hosts/${host}.yaml`
    const config = record(load(read(packageRoot, context)), context)
    const format = config.format
    if (format !== 'markdown' && format !== 'toml') throw new Error(`${context}: invalid format`)
    if (config.header !== undefined && config.headers !== undefined) throw new Error(`${context}: use header or headers, not both`)
    const headers = config.header === undefined ? strings(config.headers, `${context}.headers`)
      : Object.fromEntries(writerRoles.map(role => [role, string(config.header, `${context}.header`)]))
    if (Object.keys(headers).sort().join() !== [...writerRoles].sort().join()) throw new Error(`${context}: incomplete role headers`)
    const variables = strings(config.variables, `${context}.variables`)
    const notes = config.roleNotes === undefined ? {} : strings(config.roleNotes, `${context}.roleNotes`)
    for (const role of writerRoles) {
      const { body, description } = parseRole(read(packageRoot, `authoring/roles/${role}.md`), role)
      const values = Object.fromEntries(Object.entries(variables).map(([key, value]) => [key, substitute(value.trimEnd(), { ROLE: role }, context)]))
      values.ROLE = role
      values.DESCRIPTION = description.split('\n').map(line => format === 'toml' ? tomlEscape(line) : `  ${line}`).join('\n')
      values.REFERENCE_RULES = substitute(read(packageRoot, `authoring/hosts/${string(config.referenceRules, context)}`), values, context).trimEnd()
      let rendered = substitute(body, values, `${context}:${role}`).trimEnd() + '\n'
      for (const note of [config.notes, notes[role]]) {
        if (note !== undefined) rendered += '\n' + substitute(read(packageRoot, `authoring/hosts/${string(note, context)}`), values, context)
      }
      const header = substitute(headers[role]!, values, context)
      rendered = format === 'toml'
        ? `${header}developer_instructions = """\n${tomlEscape(rendered)}"""\n`
        : `---\n${header}---\n\n${rendered}`
      const metadata = format === 'toml' ? parseToml(rendered) : record(load(rendered.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''), `${context}:${role}`)
      if (host !== 'opencode' && metadata.name !== role) throw new Error(`${context}:${role}: mismatched output name`)
      if (string(metadata.description, `${context}:${role}.description`).trimEnd() !== description) {
        throw new Error(`${context}:${role}: output description differs from its source`)
      }
      if (host === 'dsh' && (metadata.writerRoleFormat !== 'dsh-v1'
        || Object.keys(metadata).some(key => !['name', 'description', 'writerRoleFormat'].includes(key)))) {
        throw new Error(`${context}:${role}: DSH roles require dsh-v1 metadata without other hosts' settings`)
      }
      if (host === 'dsh' && [...rendered.matchAll(/\{WRITER_[A-Z_]+\}/g)].some(match => match[0] !== '{WRITER_REFERENCE_DIR}')) {
        throw new Error(`${context}:${role}: unknown DSH runtime binding`)
      }
      add(`${references}${string(config.output, context)}/${role}.${format === 'toml' ? 'toml' : 'md'}`, rendered)
    }
  }
  const copies: unknown = load(read(packageRoot, 'authoring/copies.yaml'))
  if (!Array.isArray(copies) || !copies.length) throw new Error('authoring/copies.yaml: expected a nonempty list')
  for (const item of copies) {
    const entry = record(item, 'copy mapping')
    const source = `skills/${string(entry.source, 'copy source')}`
    sources.add(source)
    const content = read(packageRoot, source)
    const mode = lstatSync(pathIn(packageRoot, source)).mode & 0o111 ? 0o755 : 0o644
    if (source.endsWith('.md')) checked.add(source)
    if (!Array.isArray(entry.targets) || !entry.targets.length) throw new Error(`${source}: expected copy targets`)
    for (const target of entry.targets) add(`skills/${string(target, source)}`, content, mode)
  }
  for (const source of sources) if (outputs.has(source)) throw new Error(`A generated destination cannot be a copy source: ${source}`)
  for (const [file, text] of outputs) {
    // Shipped helpers load siblings after a skill is copied into an arbitrary project.
    if (!/\.(?:js|py)$/.test(file)) continue
    const siblings = /(?:require\(['"](\.\/[^'"]+)['"]\)|with_name\(['"]([^'"]+)['"]\))/g
    for (const match of text.matchAll(siblings)) {
      const dependency = posix.normalize(posix.join(posix.dirname(file), match[1] ?? match[2]!))
      if (!outputs.has(dependency)) read(packageRoot, dependency)
    }
  }
  validateReferences(packageRoot, outputs, checked)
  validateAntigravity(packageRoot, outputs)
  return { outputs, modes }
}

/**
 * Render registered outputs and validate their deployed reference contexts without changing the package.
 * @param packageRoot - Writer source package containing authoring/ and skills/.
 * @returns package-relative output paths and complete UTF-8 contents; invalid sources reject before writes.
 */
export function renderSkills(packageRoot: string): Map<string, string> {
  return renderPlan(packageRoot).outputs
}

/**
 * Check or regenerate explicitly registered files, after rendering and validating every source.
 * @param packageRoot - Writer source package; installations need no authoring files or generator.
 * @param mode - check never writes; generate updates changed registered outputs only.
 * @returns total output count and changed paths; check rejects any missing or stale output.
 */
export function runSkills(packageRoot: string, mode: 'check' | 'generate'): { count: number, changed: string[] } {
  const { outputs: rendered, modes } = renderPlan(packageRoot)
  const changed: string[] = []
  for (const [file, content] of rendered) {
    let actual: string | undefined
    try { actual = read(packageRoot, file) } catch (error) { if (!isMissing(error)) throw error }
    if (actual !== content || (process.platform !== 'win32'
      && (lstatSync(pathIn(packageRoot, file)).mode & 0o111) !== (modes.get(file)! & 0o111))) changed.push(file)
  }
  if (mode === 'check' && changed.length) throw new Error(`Generated skills are stale; run pnpm run skills:generate:\n${changed.join('\n')}`)
  if (mode === 'generate') {
    for (const file of changed) {
      const target = pathIn(packageRoot, file)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, rendered.get(file)!, 'utf8')
      if (process.platform !== 'win32') chmodSync(target, modes.get(file)!)
    }
  }
  return { count: rendered.size, changed }
}
