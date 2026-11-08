/** Workspace masthead helpers: short cwd name and scan health. */
export type WriterScanHealth = 'loading' | 'ok' | 'partial' | 'failed';
/**
 * Last path segment of a workspace cwd for the masthead.
 * @param cwd - absolute or relative workspace root.
 * @returns a short display name.
 */
export declare function workspaceShortName(cwd: string): string;
/**
 * Derive listing health from scan progress and soft/hard failures.
 * @param input - scanning flag, hard failure, roots, and soft errors.
 * @returns health for the masthead / rail footnote.
 */
export declare function writerScanHealth(input: {
    readonly scanning: boolean;
    readonly hardFailed: boolean;
    readonly libraryCount: number;
    readonly projectCount: number;
    readonly scanCount: number;
    readonly scanErrors: readonly string[];
}): WriterScanHealth;
//# sourceMappingURL=workspace-status.d.ts.map