export interface WriterDirectoryEntry {
    readonly name: string;
    readonly type: 'file' | 'directory' | 'other';
}
export interface WriterBookCandidate {
    readonly path: string;
    readonly title: string;
    readonly form: 'long' | 'short';
}
export declare function discoverWriterBooks(list: (path: string) => Promise<readonly WriterDirectoryEntry[]>): Promise<WriterBookCandidate[]>;
//# sourceMappingURL=workbench-discovery.d.ts.map