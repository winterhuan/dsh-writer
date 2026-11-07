import { type DirEntry } from './library.ts';
/** Align with Dashboard `MAX_SEARCH_RESULTS`. */
export declare const MAX_SEARCH_RESULTS = 100;
/** Align with Dashboard `MAX_SEARCH_NODES`. */
export declare const MAX_SEARCH_NODES = 5000;
/** Align with Dashboard `MAX_SEARCH_DEPTH`. */
export declare const MAX_SEARCH_DEPTH = 20;
/** Align with Dashboard search debounce. */
export declare const SEARCH_DEBOUNCE_MS = 180;
/** Align with Dashboard query length cap. */
export declare const MAX_SEARCH_QUERY_LENGTH = 100;
/** One filename hit under the active tab. */
export interface WriterSearchHit {
    readonly name: string;
    readonly path: string;
    readonly editable: boolean;
    readonly size?: number;
}
/** Why a search stopped early. */
export interface WriterSearchTruncation {
    readonly byResults: boolean;
    readonly byNodes: boolean;
    readonly byDepth: boolean;
    readonly byReadError: boolean;
}
/** Limits echoed for truncation copy. */
export interface WriterSearchLimits {
    readonly maxResults: number;
    readonly maxNodes: number;
    readonly maxDepth: number;
}
/** Result of a scoped filename walk. */
export interface WriterSearchResult {
    readonly query: string;
    readonly results: readonly WriterSearchHit[];
    readonly truncated: boolean;
    readonly truncation: WriterSearchTruncation;
    readonly scanErrors: readonly string[];
    readonly limits: WriterSearchLimits;
}
export type WriterSearchListDir = (path: string) => Promise<{
    readonly entries: readonly DirEntry[];
    readonly truncated: boolean;
}>;
/**
 * Return the final component of a workspace-relative path.
 * @param path - slash-separated path.
 * @returns filename, or the root sentinel unchanged.
 */
declare function basename(path: string): string;
/**
 * Walk tab roots and collect files whose basename contains the query (zh-CN case fold).
 * @param roots - workspace-relative root paths for the active tab.
 * @param queryValue - raw search box text.
 * @param listDir - list one directory (same shape as desk `readDir`).
 * @param signal - optional abort.
 * @returns hits, truncation flags, and soft errors.
 */
export declare function searchWriterFilenames(roots: readonly string[], queryValue: string, listDir: WriterSearchListDir, signal?: AbortSignal): Promise<WriterSearchResult>;
/**
 * Build human truncation hints (Dashboard copy shape).
 * @param truncation - flags from a search.
 * @param limits - numeric caps.
 * @param scanErrors - soft list failures.
 * @param format - number formatter.
 * @returns joined messages, or empty when nothing truncated.
 */
export declare function writerSearchTruncationMessage(truncation: WriterSearchTruncation, limits: WriterSearchLimits, scanErrors: readonly string[], format?: (value: number) => string): string;
export { basename as searchHitBasename };
//# sourceMappingURL=search.d.ts.map