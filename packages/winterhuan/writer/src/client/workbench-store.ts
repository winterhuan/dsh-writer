/** Viewing preferences shared by the writing sidebar and the full workbench. */
import { defineStore } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { WriterWorkspaceView } from './library.ts'

interface WorkbenchState {
  workspaceId: string
  sessionId: string
  view: WriterWorkspaceView
  assistantOpen: boolean
  pane: 'document' | 'assistant'
}

/** @returns registration-owned preferences; manuscripts remain in the existing editor. */
export function createWriterWorkbenchStore() {
  return defineStore({
    init: (): WorkbenchState => ({ workspaceId: '', sessionId: '', view: 'projects', assistantOpen: true, pane: 'document' }),
    persist: 'dsh.writer.workbench.v2',
    actions: {
      selectWorkspace: (draft, id: WorkspaceId) => { draft.workspaceId = id; draft.sessionId = '' },
      selectSession: (draft, id: SessionId) => { draft.sessionId = id },
      openFromSidebar: (draft, id: SessionId) => { draft.workspaceId = ''; draft.sessionId = id; draft.pane = 'document' },
      selectView: (draft, view: WriterWorkspaceView) => { draft.view = view; draft.pane = 'document' },
      toggleAssistant: draft => { draft.assistantOpen = !draft.assistantOpen },
      selectPane: (draft, pane: 'document' | 'assistant') => { draft.pane = pane; if (pane === 'assistant') draft.assistantOpen = true },
    },
  })
}
