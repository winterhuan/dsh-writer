/** Editor-shell helpers aligned with Dashboard document chrome. */
import type { WriterTreeNode } from './library.ts';
import { type WriterEol } from './eol.ts';
/**
 * Format a byte length the way Dashboard `formatBytes` does.
 * @param bytes - non-negative size.
 * @returns a short human label.
 */
export declare function formatBytes(bytes: number): string;
/**
 * UTF-8 size of editor text as it would be written with the file EOL.
 * @param content - LF editor text.
 * @param eol - style restored on save.
 * @returns byte length.
 */
export declare function editorByteSize(content: string, eol: WriterEol): number;
/**
 * Uppercase extension label for the status bar (no leading dot).
 * @param name - file basename or relative path.
 * @returns e.g. `MD`, or empty when unknown.
 */
export declare function fileExtensionLabel(name: string): string;
/**
 * Split a relative workspace path into breadcrumb segments.
 * @param path - POSIX-style relative path.
 * @returns non-empty parts; empty path yields `[]`.
 */
export declare function breadcrumbSegments(path: string): readonly string[];
/**
 * Count file nodes already present in lazy trees (Dashboard `loadedFileCount`).
 * @param nodes - library and/or project roots.
 * @returns unique-path-safe count of loaded file rows.
 */
export declare function countLoadedFiles(nodes: readonly WriterTreeNode[]): number;
/**
 * Masthead 文稿 label: `按需` until something is expanded, else `N+`.
 * @param count - {@link countLoadedFiles} result.
 * @param onDemand - copy for zero.
 * @param loaded - copy with `{n}` for a positive count.
 * @returns display text.
 */
export declare function loadedFilesLabel(count: number, onDemand: string, loaded: string): string;
//# sourceMappingURL=editor-shell.d.ts.map