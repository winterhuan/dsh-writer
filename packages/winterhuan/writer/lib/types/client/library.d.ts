import { type WriterSection } from '../editable.ts';
export type { WriterSection };
export { classifyWriterPath, EDITABLE_EXTENSIONS, isEditableWriterName, isEditableWriterPath, writerExtension, } from '../editable.ts';
/** One directory entry, as `workspaceFiles.list` reports it. */
export interface DirEntry {
    readonly name: string;
    readonly type: 'file' | 'directory' | 'other';
    readonly size?: number;
}
/** Workspace discovery view shown in the writing sidebar. */
export type WriterWorkspaceView = 'libraries' | 'projects' | 'scans';
/** One discovered root shown under a tab. */
export interface WriterWorkspaceRoot {
    readonly path: string;
    readonly name: string;
    readonly view: WriterWorkspaceView;
}
/** Result of discovering writing workspace roots. */
export interface WriterWorkspaceScan {
    readonly libraries: readonly WriterWorkspaceRoot[];
    readonly projects: readonly WriterWorkspaceRoot[];
    readonly scans: readonly WriterWorkspaceRoot[];
    readonly scanErrors: readonly string[];
}
/** Lazy real-tree node under a root. */
export type WriterTreeNode = {
    readonly kind: 'directory';
    readonly name: string;
    readonly path: string;
    readonly children: readonly WriterTreeNode[];
    readonly loaded: boolean;
    readonly loading: boolean;
    readonly shown: number;
    readonly truncated: boolean;
    readonly loadError?: string;
} | {
    readonly kind: 'file';
    readonly name: string;
    readonly path: string;
    readonly editable: boolean;
    readonly size?: number;
};
/** Default page size aligned with Dashboard `DIRECTORY_PAGE_SIZE`. */
export declare const DIRECTORY_PAGE_SIZE = 200;
/** Max file bytes treated as editable in the tree (Dashboard `MAX_FILE_BYTES`). */
export declare const MAX_EDITABLE_FILE_BYTES: number;
/** Directories Dashboard hides from the tree and discovery walks. */
export declare const IGNORED_DIRECTORIES: Set<string>;
/**
 * Natural (numeric) name order for folder and file labels.
 * @param left - one display name.
 * @param right - another display name.
 * @returns negative when left sorts before right.
 */
export declare function compareWriterNames(left: string, right: string): number;
/**
 * Whether a directory name is hidden from discovery and listing.
 * @param name - basename.
 * @returns true when Dashboard would skip it.
 */
export declare function shouldIgnoreDirectory(name: string): boolean;
/**
 * Filter ignored directories / non file-dir entries and sort like Dashboard.
 * @param entries - raw listing.
 * @returns visible entries in tree order.
 */
export declare function visibleDirectoryEntries(entries: readonly DirEntry[]): DirEntry[];
/**
 * One page of a directory listing for lazy tree UI.
 * @param entries - already filtered and sorted children.
 * @param offset - zero-based start index.
 * @param pageSize - page length (default 200).
 * @returns the page slice and the next offset, or null when exhausted.
 */
export declare function pageDirectoryEntries(entries: readonly DirEntry[], offset: number, pageSize?: number): {
    readonly entries: readonly DirEntry[];
    readonly nextOffset: number | null;
};
/**
 * Map a directory entry into a tree node under its parent path.
 * @param parentPath - workspace-relative parent (empty for workspace root).
 * @param entry - one child.
 * @returns directory shell or file node.
 */
export declare function entryToTreeNode(parentPath: string, entry: DirEntry): WriterTreeNode;
/**
 * Build children for one loaded directory page (or first page).
 * @param parentPath - directory path.
 * @param entries - filtered sorted children.
 * @param shown - how many to expose (page size).
 * @param truncated - whether `workspaceFiles.list` dropped entries.
 * @returns directory node fields for children / shown / truncated.
 */
export declare function buildLoadedChildren(parentPath: string, entries: readonly DirEntry[], shown: number, truncated: boolean): {
    readonly children: readonly WriterTreeNode[];
    readonly shown: number;
    readonly truncated: boolean;
};
/**
 * Roots under `拆文库/{书}/` and legacy `拆文库-{书}/`.
 * @param readDir - list one workspace-relative directory (`''` for root).
 * @returns library roots and soft scan errors.
 */
export declare function listLibraryRoots(readDir: (path: string) => Promise<readonly DirEntry[]>): Promise<{
    readonly roots: WriterWorkspaceRoot[];
    readonly scanErrors: string[];
}>;
/**
 * Writing projects deep ≤3 with long/short markers, skipping library paths.
 * @param readDir - list one workspace-relative directory.
 * @param libraryPaths - relative paths of library roots to skip.
 * @param currentPath - path being inspected.
 * @param depth - depth from workspace root.
 * @param projects - accumulator.
 * @param scanErrors - soft errors.
 * @returns project roots.
 */
export declare function findProjectRoots(readDir: (path: string) => Promise<readonly DirEntry[]>, libraryPaths: readonly string[], currentPath?: string, depth?: number, projects?: WriterWorkspaceRoot[], scanErrors?: string[]): Promise<WriterWorkspaceRoot[]>;
/**
 * Discover libraries, writing projects, and dated market scans.
 * @param readDir - list one workspace-relative directory.
 * @returns roots by view and soft scan errors.
 */
export declare function scanWriterWorkspace(readDir: (path: string) => Promise<readonly DirEntry[]>): Promise<WriterWorkspaceScan>;
/**
 * Prefer a scan conclusion, then its aggregate or first readable Markdown file.
 * @param entries - files in one scan record.
 * @returns the preferred report basename, if available.
 */
export declare function preferredScanReport(entries: readonly DirEntry[]): string | undefined;
/**
 * Unloaded directory shell for a discovered root.
 * @param root - discovered workspace root.
 * @returns directory node ready for lazy expand.
 */
export declare function rootToDirectoryNode(root: WriterWorkspaceRoot): Extract<WriterTreeNode, {
    kind: 'directory';
}>;
/**
 * Whether a folder should start expanded when the user has not toggled it yet.
 * Folders start collapsed; only the chain holding the selection opens, so an
 * active file stays locatable. Explicit session toggles still win over this default.
 * @param path - directory path ('' is the workspace root).
 * @param selected - active file path, if any.
 * @returns default open state.
 */
export declare function defaultWriterTreeExpanded(path: string, selected: string | undefined): boolean;
//# sourceMappingURL=library.d.ts.map