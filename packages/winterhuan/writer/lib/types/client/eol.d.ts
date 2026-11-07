export type WriterEol = '\n' | '\r\n' | '\r';
/**
 * Detect the dominant line ending in file text.
 * @param content - raw file bytes decoded as text.
 * @returns CRLF when it outnumbers LF; else LF when present; else CR; else LF.
 */
export declare function detectEol(content: string): WriterEol;
/**
 * Normalize disk text to LF for the editor.
 * @param content - raw text.
 * @returns LF-only text.
 */
export declare function normalizeEol(content: string): string;
/**
 * Restore the original EOL before writing to disk.
 * @param content - LF editor text.
 * @param eol - style from {@link detectEol}.
 * @returns text ready to save.
 */
export declare function applyEol(content: string, eol: WriterEol): string;
/**
 * Short label for the status bar.
 * @param eol - detected style.
 * @returns `LF` / `CRLF` / `CR`.
 */
export declare function eolLabel(eol: WriterEol): string;
//# sourceMappingURL=eol.d.ts.map