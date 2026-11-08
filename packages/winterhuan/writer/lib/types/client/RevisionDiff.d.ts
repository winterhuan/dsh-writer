import type { zh } from './locales.ts';
/**
 * Render an explicit comparison without changing either version.
 * @param props - source versions and localized chrome.
 * @returns the shared diff, or an unchanged message.
 */
export declare function RevisionDiff({ path, before, after, t }: {
    readonly path: string;
    readonly before: string;
    readonly after: string;
    readonly t: (key: keyof typeof zh) => string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=RevisionDiff.d.ts.map