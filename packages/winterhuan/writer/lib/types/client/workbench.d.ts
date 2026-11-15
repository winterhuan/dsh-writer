import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client';
import type { WriterBook, WriterCatalog } from '../workbench-types.ts';
import type { PropsLocale, PropsRenderFactories, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client';
import type { zh } from './workbench-locales.ts';
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
type Props = PropsRuntime<'writer.workbench'> & PropsRenderFactories & PropsRenderSlots<'writer.workbench.conversation'> & PropsLocale<'writerWorkbench'> & {
    readonly retain: (id: string) => SessionReference;
    readonly action: (value: unknown) => Promise<WriterBook>;
    readonly load: () => Promise<WriterCatalog>;
    readonly openSession: (id: string) => void;
    readonly initializeDraft: (reference: SessionReference, prompt: string) => string;
    readonly remote: ClientRemote;
    readonly deskT: (key: string) => string;
};
/** Open the main workbench panel. */
export declare function Main({ renderSlot }: PropsRuntime<'main'> & PropsRenderSlots<'writer.workbench'>): import("react").ReactNode;
/** Sidebar launcher for the complete writing workbench. */
export declare function Launcher({ size }: PropsRuntime<'sidebar.panellist'>): import("react/jsx-runtime").JSX.Element;
export declare function NativeConversation({ useSession, useConversation, renderFactorySlot }: PropsRuntime<'writer.workbench.conversation'> & PropsRenderFactories): import("react").ReactNode;
/** Main works screen and native assistant bindings. */
export declare function Workbench({ t, retain, action, load, openSession, initializeDraft, renderSlot, SessionProvider, remote, deskT, useSessions }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=workbench.d.ts.map