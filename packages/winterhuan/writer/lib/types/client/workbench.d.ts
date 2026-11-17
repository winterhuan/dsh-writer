/** Full writing desk using the existing editor and native Writer conversations. */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client';
import type { WriterBook, WriterBookAction } from '../workbench-types.ts';
import type { InjectFace, PropsLocale, PropsRenderFactories, PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client';
import { zh } from './workbench-locales.ts';
import type { zh as deskZh } from './locales.ts';
import type { createWriterWorkbenchStore } from './workbench-store.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'writer.workbench': {
            kind: 'single';
            scope: 'root';
        };
    }
    interface SlotMap {
        'writer.workbench.conversation': {
            kind: 'single';
            scope: 'session';
        };
    }
    interface LocaleNamespaceMap {
        writerWorkbench: keyof typeof zh;
    }
}
export interface WorkbenchInjected {
    readonly retain: (id: SessionId) => SessionReference;
    readonly createSession: (workspaceId: WorkspaceId) => Promise<SessionId>;
    readonly createBook: (input: Extract<WriterBookAction, {
        action: 'create';
    }>) => Promise<WriterBook>;
    readonly openSession: (id: SessionId) => void;
    readonly report: (key: 'createdSession' | 'createdBook' | 'operationFailed') => void;
    readonly remote: ClientRemote;
    readonly deskT: (key: keyof typeof deskZh) => string;
}
type Props = PropsRuntime<'writer.workbench'> & PropsRenderFactories & PropsRenderSlots<'writer.workbench.conversation'> & PropsLocale<'writerWorkbench'> & PropsStore<ReturnType<typeof createWriterWorkbenchStore>> & InjectFace<WorkbenchInjected>;
/** Render the full writing desk in the native main panel. */
export declare function Main({ renderSlot }: PropsRuntime<'main'> & PropsRenderSlots<'writer.workbench'>): import("react").ReactNode;
/** Sidebar navigation icon for the writing desk. */
export declare function Launcher({ size }: PropsRuntime<'sidebar.panellist'>): import("react/jsx-runtime").JSX.Element;
/** Render the official Conversation factory under the selected Session provider. */
export declare function NativeConversation({ useSession, useConversation, renderFactorySlot }: PropsRuntime<'writer.workbench.conversation'> & PropsRenderFactories): import("react").ReactNode;
/** Browse workspace files without a separate book-registration step. */
export declare function Workbench({ t, retain, createSession, createBook, openSession, report, renderSlot, SessionProvider, remote, deskT, useSessions, useWorkspaces, useStore, actions }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=workbench.d.ts.map