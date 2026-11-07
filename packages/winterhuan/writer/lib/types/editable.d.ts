/** Workspace-relative paths the writing sidebar may save. */
/** File extensions Dashboard and the sidebar treat as editable. */
export declare const EDITABLE_EXTENSIONS: ReadonlySet<string>;
export type WriterSection = 'setting' | 'outline' | 'chapter';
/**
 * Lowercase extension of a basename, including the leading dot.
 * @param name - file basename or relative path.
 * @returns extension such as `.md`, or `''` when none.
 */
export declare function writerExtension(name: string): string;
/**
 * Whether a basename uses an editable extension.
 * @param name - file basename or relative path.
 * @returns true for md / txt / json / yaml / yml / toml.
 */
export declare function isEditableWriterName(name: string): boolean;
/**
 * Classify one workspace-relative markdown path into a book section.
 * Kept for callers that still want 设定 / 大纲 / 正文 grouping; the save gate is extension-based.
 * @param relativePath - path relative to the session workspace, `/` separated.
 * @returns the sidebar section, or undefined when the path is not part of the book markers.
 */
export declare function classifyWriterPath(relativePath: string): WriterSection | undefined;
/**
 * Accept only a relative path the sidebar is allowed to write.
 * @param path - candidate workspace-relative path.
 * @returns whether a save may target it.
 */
export declare function isEditableWriterPath(path: string): boolean;
/**
 * Reject absolute paths, backslashes, and parent segments.
 * @param path - candidate path.
 * @returns whether every segment stays inside the workspace.
 */
export declare function safeRelative(path: string): boolean;
//# sourceMappingURL=editable.d.ts.map