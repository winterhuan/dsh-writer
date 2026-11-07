/**
 * Failure text from a Remote result.
 * @param error - the failed result's error.
 * @param fallback - copy when the error has no message.
 * @returns a short message.
 */
export function remoteMessage(error, fallback) {
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string')
        return error.message;
    return fallback;
}
/**
 * List one workspace directory.
 * @param remote - client remote that carries `workspaceFiles`.
 * @param sessionId - session whose workspace is listed.
 * @param path - absolute or workspace-relative directory.
 * @param signal - cancellation.
 * @returns the listing, or a failed remote result.
 */
export function listWorkspace(remote, sessionId, path, signal) {
    return remote.workspaceFiles.list(sessionId, path, signal);
}
/**
 * Read a whole text file through `workspaceFiles.readBytes`.
 * @param remote - client remote that carries `workspaceFiles`.
 * @param sessionId - session whose workspace owns the file.
 * @param path - absolute or workspace-relative file.
 * @param signal - cancellation.
 * @returns decoded text and the file version.
 */
export async function readWorkspaceText(remote, sessionId, path, signal) {
    const result = await remote.workspaceFiles.readBytes(sessionId, path, {}, signal);
    if (!result.ok)
        return result;
    const text = new TextDecoder('utf-8', { fatal: false }).decode(result.value.data);
    return { ok: true, value: { text, version: result.value.version } };
}
//# sourceMappingURL=read.js.map