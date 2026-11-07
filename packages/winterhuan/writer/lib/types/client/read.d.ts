import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { WorkspaceDirectoryListing } from '@deepseek-ai/dsh-api-workspace-files/types';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Text the sidebar loaded, plus the version a later save must send back. */
export interface WriterText {
    readonly text: string;
    readonly version: string;
}
/**
 * Failure text from a Remote result.
 * @param error - the failed result's error.
 * @param fallback - copy when the error has no message.
 * @returns a short message.
 */
export declare function remoteMessage(error: unknown, fallback: string): string;
/**
 * List one workspace directory.
 * @param remote - client remote that carries `workspaceFiles`.
 * @param sessionId - session whose workspace is listed.
 * @param path - absolute or workspace-relative directory.
 * @param signal - cancellation.
 * @returns the listing, or a failed remote result.
 */
export declare function listWorkspace(remote: ClientRemote, sessionId: SessionId, path: string, signal: AbortSignal): Promise<RemoteResult<WorkspaceDirectoryListing>>;
/**
 * Read a whole text file through `workspaceFiles.readBytes`.
 * @param remote - client remote that carries `workspaceFiles`.
 * @param sessionId - session whose workspace owns the file.
 * @param path - absolute or workspace-relative file.
 * @param signal - cancellation.
 * @returns decoded text and the file version.
 */
export declare function readWorkspaceText(remote: ClientRemote, sessionId: SessionId, path: string, signal: AbortSignal): Promise<RemoteResult<WriterText>>;
//# sourceMappingURL=read.d.ts.map