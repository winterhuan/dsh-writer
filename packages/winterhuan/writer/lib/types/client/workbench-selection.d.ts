export interface WriterWorkspaceOption {
    readonly id: string;
    readonly path: string;
    readonly title: string;
    readonly sessionIds?: readonly string[];
}
export declare function preferredWriterWorkspace(workspaces: readonly WriterWorkspaceOption[]): string | undefined;
export interface WriterSessionOption {
    readonly id: string;
    readonly cwd?: string;
    readonly origin?: string;
    readonly projectionValues?: {
        readonly agentPreset?: string | null;
    };
}
export declare function writerSessionsInWorkspace<T extends WriterSessionOption>(sessions: readonly T[], workspace: WriterWorkspaceOption | undefined, memberIds: readonly string[]): T[];
//# sourceMappingURL=workbench-selection.d.ts.map