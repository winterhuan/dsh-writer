import type { Context } from '@deepseek-ai/cordis';
/** Limits and authorities for the write route. */
export interface WriterRouteOptions {
    readonly maxBytes: number;
    readonly trustedHosts: readonly string[];
}
/**
 * Mount the save route. Reads and directory listings stay on `workspaceFiles`.
 * @param context - host context with the web server and session lookup.
 * @param options - size limit and extra trusted authorities.
 */
export declare function registerWriterRoute(context: Context, options: WriterRouteOptions): void;
//# sourceMappingURL=write-route.d.ts.map