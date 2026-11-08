/** Browser recovery copies share a workspace/file key across writing sessions. */
import type { WriterEol } from './eol.ts'

/** Text and disk baseline needed to recover an unsaved document safely. */
export interface WriterDraft {
  readonly text: string
  readonly baseText: string
  readonly baseVersion: string
  readonly eol: WriterEol
}

/** A changed copy belongs to another editor; unavailable storage cannot protect a draft. */
export type WriterDraftStorageError = 'unavailable' | 'changed'

/** Browser value retained to avoid replacing a newer recovery copy from another session. */
export interface WriterDraftRead {
  readonly draft?: WriterDraft
  readonly token: string | null
  readonly error?: WriterDraftStorageError
}

function draftKey(cwd: string, path: string): string {
  return `dsh.writer.draft.v1:${JSON.stringify([cwd, path])}`
}

function selectionKey(cwd: string): string {
  return `dsh.writer.selection.v1:${cwd}`
}

function isDraft(value: unknown): value is WriterDraft {
  return typeof value === 'object' && value !== null
    && 'text' in value && typeof value.text === 'string'
    && 'baseText' in value && typeof value.baseText === 'string'
    && 'baseVersion' in value && typeof value.baseVersion === 'string'
    && 'eol' in value && (value.eol === '\n' || value.eol === '\r\n' || value.eol === '\r')
}

/**
 * Read and validate a recovery copy without deleting malformed or inaccessible data.
 * @param cwd - session workspace root.
 * @param path - workspace-relative file.
 * @returns the recovery copy and the browser value it came from, or a storage error.
 */
export function readWriterDraft(cwd: string, path: string): WriterDraftRead {
  let token: string | null = null
  try {
    token = localStorage.getItem(draftKey(cwd, path))
    if (token === null) return { token }
    const value: unknown = JSON.parse(token)
    return isDraft(value) ? { draft: value, token } : { token, error: 'unavailable' }
  } catch {
    // Recovery failure must remain visible while the in-memory document stays editable.
    return { token, error: 'unavailable' }
  }
}

/**
 * Replace only the recovery copy this editor last observed.
 * @param cwd - session workspace root.
 * @param path - workspace-relative file.
 * @param draft - unsaved text, or undefined to remove this editor's recovery copy.
 * @param token - last successfully read or written browser value.
 * @returns the new browser value or the reason recovery could not be updated.
 */
export function writeWriterDraft(cwd: string, path: string, draft: WriterDraft | undefined, token: string | null): WriterDraftRead {
  try {
    const key = draftKey(cwd, path)
    if (localStorage.getItem(key) !== token) return { token, error: 'changed' }
    const next = draft === undefined ? null : JSON.stringify(draft)
    if (next === null) localStorage.removeItem(key)
    else localStorage.setItem(key, next)
    return { token: next }
  } catch {
    // Quota and disabled-storage errors must not discard the current editor text.
    return { token, error: 'unavailable' }
  }
}

/**
 * Restore the workspace's last open document; storage never authorizes an absolute path.
 * @param cwd - session workspace root.
 * @returns a relative file path, or undefined for a missing or invalid preference.
 */
export function readWriterSelection(cwd: string): string | undefined {
  try {
    const path = localStorage.getItem(selectionKey(cwd))
    if (path === null || path === '' || path.includes('\\') || path.split('/').some(part => part === '' || part === '.' || part === '..')) return undefined
    return path
  } catch {
    // Selection is optional; reading the document separately reports recovery availability.
    return undefined
  }
}

/**
 * Remember the open file without making document access depend on browser storage.
 * @param cwd - session workspace root.
 * @param path - workspace-relative file, or undefined to clear the selection.
 * @returns whether the preference was saved.
 */
export function writeWriterSelection(cwd: string, path: string | undefined): boolean {
  try {
    if (path === undefined) localStorage.removeItem(selectionKey(cwd))
    else localStorage.setItem(selectionKey(cwd), path)
    return true
  } catch {
    // The document remains open even when its recovery preference cannot be saved.
    return false
  }
}
