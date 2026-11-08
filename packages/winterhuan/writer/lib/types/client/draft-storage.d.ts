/** Browser recovery copies share a workspace/file key across writing sessions. */
import type { WriterEol } from './eol.ts';
/** Text and disk baseline needed to recover an unsaved document safely. */
export interface WriterDraft {
    readonly text: string;
    readonly baseText: string;
    readonly baseVersion: string;
    readonly eol: WriterEol;
}
/** A changed copy belongs to another editor; unavailable storage cannot protect a draft. */
export type WriterDraftStorageError = 'unavailable' | 'changed';
/** Browser value retained to avoid replacing a newer recovery copy from another session. */
export interface WriterDraftRead {
    readonly draft?: WriterDraft;
    readonly token: string | null;
    readonly error?: WriterDraftStorageError;
}
/**
 * Read and validate a recovery copy without deleting malformed or inaccessible data.
 * @param cwd - session workspace root.
 * @param path - workspace-relative file.
 * @returns the recovery copy and the browser value it came from, or a storage error.
 */
export declare function readWriterDraft(cwd: string, path: string): WriterDraftRead;
/**
 * Replace only the recovery copy this editor last observed.
 * @param cwd - session workspace root.
 * @param path - workspace-relative file.
 * @param draft - unsaved text, or undefined to remove this editor's recovery copy.
 * @param token - last successfully read or written browser value.
 * @returns the new browser value or the reason recovery could not be updated.
 */
export declare function writeWriterDraft(cwd: string, path: string, draft: WriterDraft | undefined, token: string | null): WriterDraftRead;
/**
 * Restore the workspace's last open document; storage never authorizes an absolute path.
 * @param cwd - session workspace root.
 * @returns a relative file path, or undefined for a missing or invalid preference.
 */
export declare function readWriterSelection(cwd: string): string | undefined;
/**
 * Remember the open file without making document access depend on browser storage.
 * @param cwd - session workspace root.
 * @param path - workspace-relative file, or undefined to clear the selection.
 * @returns whether the preference was saved.
 */
export declare function writeWriterSelection(cwd: string, path: string | undefined): boolean;
//# sourceMappingURL=draft-storage.d.ts.map