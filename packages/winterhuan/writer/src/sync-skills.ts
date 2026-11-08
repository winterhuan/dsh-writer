import { cp, lstat, mkdir, mkdtemp, readdir, realpath, rename, rm, stat } from 'node:fs/promises'
import { basename, join, relative, resolve, sep } from 'node:path'

/** Outcome of copying Writer skills; replaced directories remain in `backupPath`. */
export interface SyncResult {
  readonly root: string
  readonly destination: string
  readonly copied: readonly string[]
  readonly skipped: readonly string[]
  readonly backupPath?: string
}

/** Outcome of moving Writer skill directories out of discovery into a backup. */
export interface UnsyncResult {
  readonly root: string
  readonly destination: string
  readonly removed: readonly string[]
  readonly missing: readonly string[]
  readonly backupPath?: string
}

/** Restored directories and any displaced current copies. */
export interface RestoreResult {
  readonly destination: string
  readonly restored: readonly string[]
  readonly backupPath?: string
}

/**
 * Nearest ancestor containing `.git`, or the workspace directory itself.
 * @param workspaceDir - session working directory.
 * @returns the root used by filesystem skill discovery.
 */
export async function projectRootFor(workspaceDir: string): Promise<string> {
  let current = resolve(workspaceDir)
  const start = current
  for (;;) {
    try {
      await stat(join(current, '.git'))
      return current
    } catch (error) {
      if (!isMissing(error)) throw error
      const parent = resolve(current, '..')
      if (parent === current) return start
      current = parent
    }
  }
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

async function directory(path: string): Promise<boolean> {
  try {
    const entry = await lstat(path)
    if (entry.isSymbolicLink() || !entry.isDirectory()) throw new Error(`Expected an ordinary directory: ${path}`)
    return true
  } catch (error) {
    if (isMissing(error)) return false
    throw error
  }
}

async function ordinaryTree(path: string): Promise<void> {
  const entry = await lstat(path)
  if (entry.isSymbolicLink()) throw new Error(`Skill operations do not follow symbolic links: ${path}`)
  if (entry.isDirectory()) {
    for (const child of await readdir(path)) await ordinaryTree(join(path, child))
  } else if (!entry.isFile()) {
    throw new Error(`Unsupported skill entry: ${path}`)
  }
}

/**
 * Names of ordinary packaged directories containing `SKILL.md`.
 * @param sourceDir - packaged skills root.
 * @returns sorted skill names; symlink entries are excluded.
 */
export async function packagedSkillNames(sourceDir: string): Promise<readonly string[]> {
  const names: string[] = []
  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    try {
      if ((await lstat(join(sourceDir, entry.name, 'SKILL.md'))).isFile()) names.push(entry.name)
    } catch (error) {
      if (!isMissing(error)) throw error
    }
  }
  return names.sort()
}

const pending = new Map<string, Promise<void>>()

async function serialize<T>(root: string, action: () => Promise<T>): Promise<T> {
  const previous = pending.get(root) ?? Promise.resolve()
  const result = previous.then(action)
  const settled = result.then(() => {}, () => {})
  pending.set(root, settled)
  try {
    return await result
  } finally {
    if (pending.get(root) === settled) pending.delete(root)
  }
}

function overlaps(a: string, b: string): boolean {
  return a === b || a.startsWith(b + sep) || b.startsWith(a + sep)
}

async function destinations(root: string): Promise<{ destination: string; backups: string }> {
  const agents = join(root, '.agents')
  const destination = join(agents, 'skills')
  const backups = join(agents, 'writer-skill-backups')
  for (const path of [agents, destination, backups]) {
    if (!await directory(path)) await mkdir(path)
  }
  return { destination, backups }
}

async function replaceSkill(source: string, target: string, backup: string | undefined): Promise<void> {
  const stage = await mkdtemp(join(resolve(target, '..'), '.writer-stage-'))
  const stagedSkill = join(stage, 'skill')
  try {
    await cp(source, stagedSkill, { recursive: true, errorOnExist: true, force: false, dereference: false })
    await ordinaryTree(stagedSkill)
    if (backup !== undefined) await rename(target, backup)
    try {
      await rename(stagedSkill, target)
    } catch (error) {
      if (backup !== undefined) await rename(backup, target)
      throw error
    }
  } finally {
    await rm(stage, { recursive: true, force: true })
  }
}

/**
 * Copy Writer skills, preserving every replaced directory in a separate backup batch.
 * All source and destination trees are validated before the first replacement.
 * @param options - package source, session directory and explicit replacement choice.
 * @returns copied/skipped names and the backup path when previous copies existed.
 */
export async function syncWriterSkills(options: {
  readonly sourceDir: string
  readonly workspaceDir: string
  readonly force: boolean
}): Promise<SyncResult> {
  const root = await realpath(await projectRootFor(options.workspaceDir))
  return serialize(root, async () => {
    const source = await realpath(options.sourceDir)
    const destinationPath = join(root, '.agents', 'skills')
    if (overlaps(source, destinationPath)) throw new Error('Packaged and workspace skill directories must not overlap.')
    const { destination, backups } = await destinations(root)
    const names = await packagedSkillNames(source)
    const copied: string[] = []
    const skipped: string[] = []
    const existing: string[] = []
    for (const name of names) {
      await ordinaryTree(join(source, name))
      if (await directory(join(destination, name))) {
        if (!options.force) { skipped.push(name); continue }
        await ordinaryTree(join(destination, name))
        existing.push(name)
      }
      copied.push(name)
    }
    const backupPath = existing.length > 0 ? await mkdtemp(join(backups, 'sync-')) : undefined
    try {
      for (const name of copied) {
        await replaceSkill(join(source, name), join(destination, name),
          backupPath !== undefined && existing.includes(name) ? join(backupPath, name) : undefined)
      }
    } catch (error) {
      throw new Error(`Skill sync stopped. Previous copies remain in place or in ${backupPath ?? destination}.`, { cause: error })
    }
    return { root, destination, copied, skipped, ...(backupPath === undefined ? {} : { backupPath }) }
  })
}

/**
 * Move only package-named workspace skills to a recoverable backup batch.
 * @param options - package source for the name allowlist, and session directory.
 * @returns moved/missing names and the backup location.
 */
export async function unsyncWriterSkills(options: {
  readonly sourceDir: string
  readonly workspaceDir: string
}): Promise<UnsyncResult> {
  const root = await realpath(await projectRootFor(options.workspaceDir))
  return serialize(root, async () => {
    const source = await realpath(options.sourceDir)
    if (overlaps(source, join(root, '.agents', 'skills'))) throw new Error('Packaged and workspace skill directories must not overlap.')
    const { destination, backups } = await destinations(root)
    const removed: string[] = []
    const missing: string[] = []
    for (const name of await packagedSkillNames(source)) {
      if (!await directory(join(destination, name))) { missing.push(name); continue }
      await ordinaryTree(join(destination, name))
      removed.push(name)
    }
    const backupPath = removed.length > 0 ? await mkdtemp(join(backups, 'unsync-')) : undefined
    if (backupPath !== undefined) {
      try {
        for (const name of removed) await rename(join(destination, name), join(backupPath, name))
      } catch (error) {
        throw new Error(`Skill removal stopped. Previous copies remain in place or in ${backupPath}.`, { cause: error })
      }
    }
    return { root, destination, removed, missing, ...(backupPath === undefined ? {} : { backupPath }) }
  })
}

/**
 * Restore one backup batch; preserve both the batch and displaced current copies.
 * @param options - session directory and direct batch name inside writer-skill-backups.
 * @returns restored skill names and a backup of any displaced copies.
 */
export async function restoreWriterSkills(options: {
  readonly workspaceDir: string
  readonly batch: string
}): Promise<RestoreResult> {
  if (options.batch === '' || basename(options.batch) !== options.batch || options.batch === '.' || options.batch === '..') {
    throw new Error('Use a direct backup batch name, such as sync-ABC123.')
  }
  const root = await realpath(await projectRootFor(options.workspaceDir))
  return serialize(root, async () => {
    const { destination, backups } = await destinations(root)
    const batch = join(backups, options.batch)
    if (relative(backups, batch).startsWith('..') || !await directory(batch)) throw new Error(`Backup batch not found: ${options.batch}`)
    await ordinaryTree(batch)
    const restored: string[] = []
    const existing: string[] = []
    for (const entry of await readdir(batch, { withFileTypes: true })) {
      if (!entry.isDirectory()) throw new Error(`Invalid backup entry: ${entry.name}`)
      restored.push(entry.name)
      if (await directory(join(destination, entry.name))) {
        await ordinaryTree(join(destination, entry.name))
        existing.push(entry.name)
      }
    }
    const backupPath = existing.length > 0 ? await mkdtemp(join(backups, 'restore-')) : undefined
    try {
      for (const name of restored) {
        await replaceSkill(join(batch, name), join(destination, name),
          backupPath !== undefined && existing.includes(name) ? join(backupPath, name) : undefined)
      }
    } catch (error) {
      throw new Error(`Skill restore stopped. The original backup is unchanged at ${batch}; displaced copies remain in ${backupPath ?? destination}.`, { cause: error })
    }
    return { destination, restored: restored.sort(), ...(backupPath === undefined ? {} : { backupPath }) }
  })
}
