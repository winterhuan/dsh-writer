/** One open document owns its reads, saves, and browser recovery copy. */
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import { type WriterDraftStorageError } from './draft-storage.ts';
import { type WriterEol } from './eol.ts';
import type { zh } from './locales.ts';
type Copy = (key: keyof typeof zh) => string;
/** Document state and actions consumed by the writing workbench. */
export interface WriterDocumentController {
    readonly active: string | undefined;
    readonly draft: string;
    readonly saved: string;
    readonly version: string | undefined;
    readonly eol: WriterEol;
    readonly loading: boolean;
    readonly ready: boolean;
    readonly busy: boolean;
    readonly dirty: boolean;
    readonly conflict: boolean;
    readonly notice: string | undefined;
    readonly storageError: WriterDraftStorageError | undefined;
    /** Open a file after the caller obtains any required discard confirmation. */
    readonly open: (path: string) => void;
    /** Clear the editor after the caller obtains any required discard confirmation. */
    readonly close: () => void;
    /** Read the disk again; only a successful read may discard the current draft. */
    readonly reload: (discard?: boolean) => void;
    /** Update an already loaded document and its recovery copy. */
    readonly edit: (text: string) => void;
    /** Save the current document using its own disk version. */
    readonly save: () => void;
}
/**
 * Keep an editor alive while its sidebar is hidden. Mount separately per session/workspace.
 * @param remote - workspace file reader.
 * @param sessionId - session authorizing file access.
 * @param cwd - workspace root used to isolate recovery copies.
 * @param t - localized operation feedback.
 * @returns document state and actions; late replies cannot update another open file.
 */
export declare function useWriterDocument(remote: ClientRemote, sessionId: SessionId, cwd: string, t: Copy): WriterDocumentController;
export {};
//# sourceMappingURL=use-writer-document.d.ts.map