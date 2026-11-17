import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { WriterWorkspaceView } from './library.ts';
interface WorkbenchState {
    workspaceId: string;
    sessionId: string;
    view: WriterWorkspaceView;
    assistantOpen: boolean;
    pane: 'document' | 'assistant';
}
/** @returns registration-owned preferences; manuscripts remain in the existing editor. */
export declare function createWriterWorkbenchStore(): import("@deepseek-ai/dsh-client-store").EngineStoreHandle<WorkbenchState, {
    selectWorkspace: (draft: WorkbenchState, id: WorkspaceId) => void;
    selectSession: (draft: WorkbenchState, id: SessionId) => void;
    openFromSidebar: (draft: WorkbenchState, id: SessionId) => void;
    selectView: (draft: WorkbenchState, view: WriterWorkspaceView) => void;
    toggleAssistant: (draft: WorkbenchState) => void;
    selectPane: (draft: WorkbenchState, pane: "document" | "assistant") => void;
}>;
export {};
//# sourceMappingURL=workbench-store.d.ts.map