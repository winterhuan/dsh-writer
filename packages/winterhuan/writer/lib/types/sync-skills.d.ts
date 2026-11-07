/** Outcome of one copy into `.agents/skills`. */
export interface SyncResult {
    /** Project root that owns `.agents/skills`. */
    readonly root: string;
    /** Destination skill root. */
    readonly destination: string;
    /** Skill directory names written by this call. */
    readonly copied: readonly string[];
    /** Skill directory names left untouched because they already existed. */
    readonly skipped: readonly string[];
}
/** Outcome of removing packaged skill directories from `.agents/skills`. */
export interface UnsyncResult {
    /** Project root that owns `.agents/skills`. */
    readonly root: string;
    /** Destination skill root. */
    readonly destination: string;
    /** Skill directory names removed by this call. */
    readonly removed: readonly string[];
    /** Packaged skill names that were not present under `.agents/skills`. */
    readonly missing: readonly string[];
}
/**
 * Nearest ancestor containing `.git`, or the workspace directory itself.
 * Matches skill-filesystem's project root so the copy lands where discovery looks.
 * @param workspaceDir - session working directory.
 * @returns the project root.
 */
export declare function projectRootFor(workspaceDir: string): Promise<string>;
/**
 * Directory names under the packaged `skills/` tree that contain `SKILL.md`.
 * Used by sync and unsync so only Writer-owned skill folders are touched.
 * @param sourceDir - packaged skills directory.
 * @returns sorted skill directory names.
 */
export declare function packagedSkillNames(sourceDir: string): Promise<readonly string[]>;
/**
 * Copy packaged skill directories into `<project>/.agents/skills/<name>`.
 * An existing destination is left in place unless `force` is set.
 * @param options - source tree, workspace directory, and whether to replace existing skills.
 * @returns which skill names were copied or skipped.
 */
export declare function syncWriterSkills(options: {
    readonly sourceDir: string;
    readonly workspaceDir: string;
    readonly force: boolean;
}): Promise<SyncResult>;
/**
 * Remove packaged Writer skill directories from `<project>/.agents/skills/<name>`.
 * Only deletes names that exist under the packaged `skills/` tree; other project skills stay.
 * @param options - source tree (for the name allowlist) and workspace directory.
 * @returns which skill names were removed or already missing.
 */
export declare function unsyncWriterSkills(options: {
    readonly sourceDir: string;
    readonly workspaceDir: string;
}): Promise<UnsyncResult>;
//# sourceMappingURL=sync-skills.d.ts.map