export function preferredWriterWorkspace(workspaces) {
    return workspaces.find(workspace => /(?:^|[\\/])novels$/iu.test(workspace.path))?.id
        ?? workspaces.find(workspace => /novels|小说/iu.test(workspace.title))?.id;
}
export function writerSessionsInWorkspace(sessions, workspace, memberIds) {
    if (!workspace)
        return [];
    const members = new Set(memberIds);
    return sessions.filter(session => members.has(session.id)
        && session.cwd === workspace.path
        && session.origin !== 'subagent'
        && session.projectionValues?.agentPreset === 'writer');
}
//# sourceMappingURL=workbench-selection.js.map