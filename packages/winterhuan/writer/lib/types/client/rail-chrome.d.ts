/** Chrome prefs for the writing left rail: width and collapsed (localStorage only). */
export declare const WRITER_RAIL_STORAGE_KEY = "writer.rail.chrome";
export declare const WRITER_RAIL_MIN_WIDTH = 180;
export declare const WRITER_RAIL_MAX_WIDTH = 480;
export declare const WRITER_RAIL_DEFAULT_WIDTH = 220;
/** Resize handle column width (must match plugin.css). */
export declare const WRITER_RAIL_HANDLE_WIDTH = 5;
/** Minimum stage column so the editor is still usable beside the rail. */
export declare const WRITER_STAGE_MIN_WIDTH = 160;
export interface WriterRailChrome {
    width: number;
    collapsed: boolean;
}
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
/**
 * Clamp a proposed rail width into the usable range.
 * @param width - raw pixel width from drag or storage.
 * @returns integer px within min/max (or the default when not finite).
 */
export declare function clampRailWidth(width: number): number;
/**
 * Cap a preferred rail width so rail + handle (+ stage min when possible) fit
 * inside the desk. The CSS rail track is a *fixed* `var(--writer-rail-width)`
 * (not minmax(0, …)) with `overflow:hidden` on the desk — if the track is
 * wider than the visible desk, the right side of the rail is clipped while
 * the left Tab (`拆文库`) keeps its full layout width (looks like it "won't
 * shrink" while `写作项目` is covered). So this may drop *below*
 * {@link WRITER_RAIL_MIN_WIDTH} on a narrow host: equal Tab columns then
 * ellipsis together instead of mid-glyph clipping. Manual drag still clamps
 * to min via {@link clampRailWidth}.
 * @param preferred - stored or dragged width (will be clamped first).
 * @param deskWidth - `.writer-desk` clientWidth in CSS px.
 * @returns width to apply as `--writer-rail-width` (≤ desk − handle when desk > 0).
 */
export declare function fitRailWidth(preferred: number, deskWidth: number): number;
/**
 * Default chrome when nothing is stored or storage is unusable.
 * @returns default width and expanded rail.
 */
export declare function defaultRailChrome(): WriterRailChrome;
/**
 * Read persisted rail chrome; invalid or missing values fall back to defaults.
 * @param storage - optional storage (tests); defaults to `localStorage`.
 * @returns clamped width and collapsed flag.
 */
export declare function readRailChrome(storage?: StorageLike | undefined): WriterRailChrome;
/**
 * Persist rail chrome (width always clamped).
 * @param chrome - next prefs.
 * @param storage - optional storage (tests); defaults to `localStorage`.
 */
export declare function writeRailChrome(chrome: WriterRailChrome, storage?: StorageLike | undefined): void;
/**
 * Apply a new width while keeping the collapsed flag.
 * @param chrome - current prefs.
 * @param width - proposed width.
 * @returns updated chrome with clamped width.
 */
export declare function setRailWidth(chrome: WriterRailChrome, width: number): WriterRailChrome;
/**
 * Toggle or set collapsed without changing width.
 * @param chrome - current prefs.
 * @param collapsed - next collapsed flag; omit to flip.
 * @returns updated chrome.
 */
export declare function setRailCollapsed(chrome: WriterRailChrome, collapsed?: boolean): WriterRailChrome;
export {};
//# sourceMappingURL=rail-chrome.d.ts.map