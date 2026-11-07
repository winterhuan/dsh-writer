/** Locale bundles for the Writer settings page (Zhuque + cover keys). */
import type { SettingsFormLabels } from '@deepseek-ai/dsh-client-ui-primitives';
/** Locale keys the page renders. */
export type WriterZhuqueLocaleKey = 'title' | 'description' | 'keySet' | 'keyUnset' | 'makersKeyLabel' | 'makersKeyHint' | 'makersKeyReadOnlyHint' | 'coverKeyLabel' | 'coverKeyHint' | 'coverKeyReadOnlyHint' | 'gptImageBaseUrlLabel' | 'gptImageBaseUrlHint' | 'gptImageBaseUrlPlaceholder' | 'overridden' | 'reset' | 'invalidText' | 'readOnly' | 'unavailable' | 'save' | 'saving' | 'discard' | 'saveFailed';
/** English copy. */
export declare const en: Record<WriterZhuqueLocaleKey, string>;
/** Simplified Chinese copy. */
export declare const zh: Record<WriterZhuqueLocaleKey, string>;
/**
 * Labels the shared settings form reads from this page's dictionary.
 * @param t - the bound translator.
 * @returns the form chrome labels.
 */
export declare function formLabels(t: (key: WriterZhuqueLocaleKey) => string): SettingsFormLabels;
//# sourceMappingURL=zhuque-locales.d.ts.map