/** Main panel, native conversation, and persistent operation feedback. */
import type { Context } from '@deepseek-ai/cordis';
import type { createWriterWorkbenchStore } from './workbench-store.ts';
export declare const inject: string[];
/** @param ctx - native Client services. @param store - preferences shared with the sidebar. */
export declare function apply(ctx: Context, store: ReturnType<typeof createWriterWorkbenchStore>): void;
//# sourceMappingURL=workbench-entry.d.ts.map