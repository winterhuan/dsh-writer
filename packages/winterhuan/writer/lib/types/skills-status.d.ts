import { type SkillSummary } from '@deepseek-ai/dsh-skill';
import type { SkillMount } from './mount.ts';
/** One project copy compared with the package, including unreadable or symlink trees. */
export interface SkillCopyStatus {
    readonly path: string;
    readonly comparison: 'same' | 'different' | 'unreadable';
}
/** Effective discovery result and independently inspected project copies. */
export interface WriterSkillStatus {
    readonly name: string;
    readonly packagedPath: string;
    readonly effectivePath?: string;
    readonly effectiveSource?: string;
    readonly comparison: 'same' | 'different' | 'unreadable' | 'missing';
    readonly projectCopies: readonly SkillCopyStatus[];
}
/** Installed package versions and the current catalog's Writer skill sources. */
export interface WriterSkillsStatus {
    readonly packageVersion: string;
    readonly upstreamSkillsVersion: string;
    readonly mount: SkillMount;
    readonly root: string;
    readonly skills: readonly WriterSkillStatus[];
}
/**
 * Compare the actual winning catalog entries and project copies with the package.
 * @param options - installed source, workspace, mount and DSH catalog for this session.
 * @returns versions, effective paths and content comparisons without copying files.
 */
export declare function inspectWriterSkills(options: {
    readonly sourceDir: string;
    readonly workspaceDir: string;
    readonly mount: SkillMount;
    readonly catalog: readonly SkillSummary[];
}): Promise<WriterSkillsStatus>;
/**
 * Render compact source diagnostics for authors; paths identify actionable overrides.
 * @param status - inspected package and catalog.
 * @returns command text with effective sources and differing copies.
 */
export declare function formatWriterSkillsStatus(status: WriterSkillsStatus): string;
//# sourceMappingURL=skills-status.d.ts.map