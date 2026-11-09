/** Roles accepted by the Writer delegation tool. */
export declare const writerRoles: readonly ["story-architect", "character-designer", "narrative-writer", "consistency-checker", "story-explorer", "story-researcher", "chapter-extractor"];
/**
 * Compose a role and task using the selected skill's resource directory.
 * @param options - discovered setup directory, role, child directory, task, and authorized reader.
 * @returns a self-contained child prompt; unknown or malformed roles reject before delegation.
 */
export declare function buildDshAgentPrompt(options: {
    setupDir: string;
    role: string;
    projectDir: string;
    task: string;
    read: (path: string) => Promise<string>;
}): Promise<string>;
//# sourceMappingURL=role-prompt.d.ts.map