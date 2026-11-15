/** Book registration and durable native Session associations, without a manuscript mirror. */
import type { Context } from '@deepseek-ai/cordis';
import type { WriterBook, WriterBookAction, WriterCatalog } from './workbench-types.ts';
/** A single operation queue plus a file lock also protects two profiles sharing one DSH home. */
export declare class WriterWorkbench {
    private readonly ctx;
    private readonly file;
    private queue;
    /** @param ctx - native Session/workspace services. @param file - catalog location outside manuscripts. */
    constructor(ctx: Context, file: string);
    private read;
    private save;
    private run;
    /** @returns saved references and currently registered native workspaces, without opening Sessions. */
    catalog(): Promise<WriterCatalog>;
    private location;
    private agent;
    private bind;
    private open;
    /** @param input - explicit validated author operation. @returns the resulting book; no prompt is submitted. */
    change(input: WriterBookAction): Promise<WriterBook>;
    private createProject;
}
/** @param ctx - complete native Web services. @param trustedHosts - additional trusted authorities. */
export declare function registerWriterWorkbench(ctx: Context, trustedHosts: readonly string[]): void;
//# sourceMappingURL=workbench.d.ts.map