/** Outcome of copying Writer skills; replaced directories remain in `backupPath`. */
export interface SyncResult {
    readonly root: string;
    readonly destination: string;
    readonly copied: readonly string[];
    readonly skipped: readonly string[];
    readonly backupPath?: string;
}
/** Outcome of moving Writer skill directories out of discovery into a backup. */
export interface UnsyncResult {
    readonly root: string;
    readonly destination: string;
    readonly removed: readonly string[];
    readonly missing: readonly string[];
    readonly backupPath?: string;
}
/** Restored directories and any displaced current copies. */
export interface RestoreResult {
    readonly destination: string;
    readonly restored: readonly string[];
    readonly backupPath?: string;
}
/**
 * Nearest ancestor containing `.git`, or the workspace directory itself.
 * @param workspaceDir - session working directory.
 * @returns the root used by filesystem skill discovery.
 */
export declare function projectRootFor(workspaceDir: string): Promise<string>;
/**
 * Names of ordinary packaged directories containing `SKILL.md`.
 * @param sourceDir - packaged skills root.
 * @returns sorted skill names; symlink entries are excluded.
 */
export declare function packagedSkillNames(sourceDir: string): Promise<readonly string[]>;
/**
 * Copy Writer skills, preserving every replaced directory in a separate backup batch.
 * All source and destination trees are validated before the first replacement.
 * @param options - package source, session directory and explicit replacement choice.
 * @returns copied/skipped names and the backup path when previous copies existed.
 */
export declare function syncWriterSkills(options: {
    readonly sourceDir: string;
    readonly workspaceDir: string;
    readonly force: boolean;
}): Promise<SyncResult>;
/**
 * Move only package-named workspace skills to a recoverable backup batch.
 * @param options - package source for the name allowlist, and session directory.
 * @returns moved/missing names and the backup location.
 */
export declare function unsyncWriterSkills(options: {
    readonly sourceDir: string;
    readonly workspaceDir: string;
}): Promise<UnsyncResult>;
/**
 * Restore one backup batch; preserve both the batch and displaced current copies.
 * @param options - session directory and direct batch name inside writer-skill-backups.
 * @returns restored skill names and a backup of any displaced copies.
 */
export declare function restoreWriterSkills(options: {
    readonly workspaceDir: string;
    readonly batch: string;
}): Promise<RestoreResult>;
//# sourceMappingURL=sync-skills.d.ts.map