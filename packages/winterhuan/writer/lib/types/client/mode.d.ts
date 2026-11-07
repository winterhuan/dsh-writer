/** Keep the writing guide entry on the session that selected the writer preset. */
import type { Context } from '@deepseek-ai/cordis';
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/**
 * Whether the on-screen session uses the writing preset.
 * @param context - browser session services.
 * @param sessionId - session to inspect.
 * @returns true when the projection says `writer`.
 */
export declare function isWriterSession(context: Context, sessionId: SessionId | undefined): boolean;
/**
 * Register the tab type, and show its guide entry only for a writing session.
 * @param context - browser session and sidebar services.
 * @param definition - tab type including its guide entry.
 * @returns a disposer for the subscriptions and the current registration.
 */
export declare function registerWriterTab(context: Context, definition: SidebarRightTabDefinition): () => void;
//# sourceMappingURL=mode.d.ts.map