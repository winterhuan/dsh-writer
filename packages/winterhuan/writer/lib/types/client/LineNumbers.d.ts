/** Toggleable line-number gutter synced to the prose textarea (Dashboard-aligned). */
import { type ReactNode, type RefObject } from 'react';
export interface WriterLineNumbersProps {
    readonly text: string;
    readonly caret: number;
    readonly show: boolean;
    readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
}
/**
 * Render a scroll-synced gutter with wrap-aware row heights and an active line.
 * @param props - editor text, caret, visibility, and the paired textarea.
 * @returns the gutter, or null when hidden.
 */
export declare function WriterLineNumbers({ text, caret, show, textareaRef, }: WriterLineNumbersProps): ReactNode;
//# sourceMappingURL=LineNumbers.d.ts.map