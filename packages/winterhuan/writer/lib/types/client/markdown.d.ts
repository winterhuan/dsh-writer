/** Safe Markdown → HTML for the writing preview (Dashboard-aligned, no deps). */
/**
 * Convert Markdown to escaped HTML suitable for `dangerouslySetInnerHTML`.
 * Mirrors oh-story Dashboard `markdownToSafeHtml` (headings, lists, code, hr, quote).
 * @param markdown - editor text (LF).
 * @returns HTML string with no unescaped user markup.
 */
export declare function markdownToSafeHtml(markdown: string): string;
//# sourceMappingURL=markdown.d.ts.map