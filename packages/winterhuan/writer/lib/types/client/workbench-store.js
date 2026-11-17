/** Viewing preferences shared by the writing sidebar and the full workbench. */
import { defineStore } from '@deepseek-ai/dsh-client-store';
/** @returns registration-owned preferences; manuscripts remain in the existing editor. */
export function createWriterWorkbenchStore() {
    return defineStore({
        init: () => ({ workspaceId: '', sessionId: '', view: 'projects', assistantOpen: true, pane: 'document' }),
        persist: 'dsh.writer.workbench.v2',
        actions: {
            selectWorkspace: (draft, id) => { draft.workspaceId = id; draft.sessionId = ''; },
            selectSession: (draft, id) => { draft.sessionId = id; },
            openFromSidebar: (draft, id) => { draft.workspaceId = ''; draft.sessionId = id; draft.pane = 'document'; },
            selectView: (draft, view) => { draft.view = view; draft.pane = 'document'; },
            toggleAssistant: draft => { draft.assistantOpen = !draft.assistantOpen; },
            selectPane: (draft, pane) => { draft.pane = pane; if (pane === 'assistant')
                draft.assistantOpen = true; },
        },
    });
}
//# sourceMappingURL=workbench-store.js.map