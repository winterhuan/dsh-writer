/** Named Writer delegation through the native subagent policy and lifecycle. */
import type { Context } from '@deepseek-ai/cordis';
/** Preset-scoped role delegation plugin. */
export declare const name = "writer-agents";
/** Role discovery and reads use the calling Agent's services. */
export declare const inject: string[];
/**
 * Register named role delegation in the Writer preset.
 * @param ctx - preset context owning the tool registration.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=writer-agent.d.ts.map