/** Roles accepted by the Writer delegation tool. */
export declare const writerRoles: readonly ["story-architect", "character-designer", "narrative-writer", "consistency-checker", "story-explorer", "story-researcher", "chapter-extractor"];
/**
 * Compose a role and task using the selected skill's resource directory.
 * @param options - effective setup directory, explicit source format, role, task scope, and authorized reader.
 * @returns a child prompt with deferred resource paths; unknown, missing or malformed roles reject before delegation.
 */
export declare function buildDshAgentPrompt(options: {
    setupDir: string;
    format: 'dsh' | 'legacy-project';
    role: string;
    projectDir: string;
    task: string;
    read: (path: string) => Promise<string>;
}): Promise<string>;
//# sourceMappingURL=role-prompt.d.ts.map