/**
 * Writing-mode host: skill mount, workspace copy, and the sidebar save route.
 * Skills are discovered by skill-filesystem. This entry does not register a skill provider.
 */
import type { Context, Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type SkillMount } from './mount.ts';
import { type SyncResult, type UnsyncResult } from './sync-skills.ts';
export { packageSkillsDir } from './skills-dir.ts';
export { skillFilesystemRowDisabled, writerSkillMount } from './mount.ts';
export { resolveWriterSyncPreset } from './sync-gate.ts';
export { syncWriterSkills, unsyncWriterSkills, packagedSkillNames, projectRootFor } from './sync-skills.ts';
export { registerWriterRoute } from './write-route.ts';
export { classifyWriterPath, isEditableWriterPath } from './editable.ts';
/** Plugin id. The preset id is the same string, registered by the bundle patch. */
export declare const name = "writer";
/** Web and command services are optional so a headless host can still copy skills. */
export declare const inject: string[];
/** Host configuration. `skillMount` is not volatile: changing it takes a restart. */
export interface Config {
    readonly skillMount?: SkillMount;
    readonly editorMaxBytes?: number;
    readonly trustedHosts?: string[];
    readonly makersApiKeyEnv?: Volatile<string>;
    readonly gptImageApiKeyEnv?: Volatile<string>;
    readonly gptImageBaseUrl?: Volatile<string>;
}
/** Schema for the writing plugin. */
export declare const Config: z<Config>;
/** Service the preset rows and the sync command read. */
export interface WriterHost {
    readonly skillMount: SkillMount;
    readonly skillsDir: string;
    /** Credential environment name for Zhuque. The host does not read the secret. */
    readonly makersApiKeyEnv: string;
    /** Credential environment name for cover image API. The host does not read the secret. */
    readonly gptImageApiKeyEnv: string;
    /** Cover image API base URL the host injects into GPT_IMAGE_BASE_URL; empty leaves the shell value. */
    readonly gptImageBaseUrl: string;
    sync(workspaceDir: string, force: boolean): Promise<SyncResult>;
    unsync(workspaceDir: string): Promise<UnsyncResult>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Writing-mode host state for the current process. */
        writerHost: WriterHost;
    }
}
/**
 * Install the mount, optional first-entry copy, the save route, and skill sync/unsync commands.
 * @param context - host context.
 * @param config - plugin configuration after schema defaults.
 */
export declare function apply(context: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map