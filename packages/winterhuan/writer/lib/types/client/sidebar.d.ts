/** Register the writing sidebar: tab type, then the keyed body slot. */
import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { createWriterWorkbenchStore } from './workbench-store.ts';
export declare const name = "writer";
export declare const inject: string[];
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'writer.sidebar.launcher': {
            kind: 'single';
            scope: 'root';
            owner: {
                sessionId: SessionId;
            };
        };
    }
}
/**
 * Register the writing tab and its body. The guide entry follows the selected preset.
 * @param context - browser services.
 * @param store - viewing preferences shared with the full workbench.
 */
export declare function apply(context: Context, store: ReturnType<typeof createWriterWorkbenchStore>): void;
//# sourceMappingURL=sidebar.d.ts.map