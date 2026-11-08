/** Filesystem operations scoped to one book; absent files return undefined. */
export interface BookFiles {
    read(path: string): Promise<string | undefined>;
    list(path: string): Promise<readonly {
        name: string;
        type: string;
    }[]>;
}
/** One cited semantic finding, independent of mechanical chapter checks. */
export interface ReviewFinding {
    readonly id: string;
    readonly severity: 'must' | 'suggestion' | 'optional';
    readonly line: number;
    readonly quote: string;
    readonly explanation: string;
    readonly suggestion: string;
    readonly resolution?: 'accepted' | 'resolved';
}
/** Snapshot for the selected chapter. Freshness is checked against current disk content. */
export interface BookStatus {
    readonly title: string;
    readonly lastChapter?: number;
    readonly chapter: number | null;
    readonly commitments: readonly string[];
    readonly workFiles: readonly string[];
    readonly check?: {
        status: string;
        stale: boolean;
        target: number;
        actual: number;
        findings: readonly string[];
        path: string;
        bodyPath: string;
        outlinePath: string;
    };
    readonly review?: {
        stale: boolean;
        summary: string;
        bodyPath: string;
        bodyText: string;
        currentText: string;
        findings: readonly ReviewFinding[];
        path: string;
    };
}
/**
 * Compute the raw UTF-8 digest used by the Python chapter and review scripts.
 * @param value - decoded UTF-8 file, preserving its original line endings.
 * @returns lowercase SHA-256.
 */
export declare function manuscriptDigest(value: string): Promise<string>;
/**
 * Resolve a selected manuscript's chapter number; short stories return null.
 * @param path - book-relative selected file.
 * @returns chapter number, null for 正文.md, or undefined for other files.
 */
export declare function selectedChapter(path: string): number | null | undefined;
/**
 * Load current progress and the selected chapter's reports. Missing reports are normal;
 * malformed or inaccessible records reject with the owning path rather than imply a pass.
 * @param files - book-scoped reads and directory listings.
 * @param selected - selected chapter; absent selects the next uncommitted chapter.
 * @returns one bounded chapter snapshot, without mutating project files.
 */
export declare function readBookStatus(files: BookFiles, selected?: number | null): Promise<BookStatus>;
//# sourceMappingURL=book-status.d.ts.map