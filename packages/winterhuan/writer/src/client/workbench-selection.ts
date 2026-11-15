export interface WriterWorkspaceOption {
  readonly id: string
  readonly path: string
  readonly title: string
  readonly sessionIds?: readonly string[]
}

export function preferredWriterWorkspace(workspaces: readonly WriterWorkspaceOption[]): string | undefined {
  return workspaces.find(workspace => /(?:^|[\\/])novels$/iu.test(workspace.path))?.id
    ?? workspaces.find(workspace => /novels|小说/iu.test(workspace.title))?.id
}

export interface WriterSessionOption {
  readonly id: string
  readonly cwd?: string
  readonly origin?: string
  readonly projectionValues?: { readonly agentPreset?: string | null }
}

export function writerSessionsInWorkspace<T extends WriterSessionOption>(
  sessions: readonly T[],
  workspace: WriterWorkspaceOption | undefined,
  memberIds: readonly string[],
): T[] {
  if (!workspace) return []
  const members = new Set(memberIds)
  return sessions.filter(session => members.has(session.id)
    && session.cwd === workspace.path
    && session.origin !== 'subagent'
    && session.projectionValues?.agentPreset === 'writer')
}
