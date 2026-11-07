/**
 * The Writer settings page's staged form over the `writer` namespace.
 * Key literals never ride a response: they write through the credentials
 * domain under the references `makersApiKeyEnv` and `gptImageApiKeyEnv` name.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import { type SettingsFieldState, type SettingsFormActions, type SettingsFormScope, type SettingsFormShell } from '@deepseek-ai/dsh-client-ui-primitives';
/** Namespace of the writer plugin. Spelled here so the client half does not import Host values. */
export declare const WRITER_SETTINGS_NS = "writer";
/** Section fields this page reads for credential reference names and cover API endpoints. */
export interface WriterZhuqueSettings {
    /** Credential reference naming the EdgeOne Makers key. Defaults to MAKERS_API_KEY. */
    makersApiKeyEnv?: string;
    /** Credential reference naming the cover image API key. Defaults to GPT_IMAGE_API_KEY. */
    gptImageApiKeyEnv?: string;
    /** Cover image API base URL; the host injects it into GPT_IMAGE_BASE_URL when set. */
    gptImageBaseUrl?: string;
}
/** One credential control as the page renders it. */
export interface WriterZhuqueKeyControlState {
    /** The staged credential, which starts blank on every load. */
    draft: SettingsFieldState;
    /** Whether the Host reports a credential configured for the referenced key. */
    configured: boolean;
    /** Whether the credentials domain accepts a write. */
    writable: boolean;
}
/** What the Writer settings page renders. */
export interface WriterZhuqueCardState extends SettingsFormShell {
    /** The Zhuque key control. */
    key: WriterZhuqueKeyControlState;
    /** The cover image API key control. */
    coverKey: WriterZhuqueKeyControlState;
    /** The cover image API base URL draft. */
    gptImageBaseUrl: SettingsFieldState;
}
/** The registration-side face the page's slot entry injects. */
export interface WriterZhuqueCardFace extends SettingsFormActions {
    hooks: {
        /** Page snapshot bound by the renderer as useWriterZhuqueCard. */
        writerZhuqueCard: SnapshotStore<WriterZhuqueCardState>;
    };
}
/** Bridges the `writer` scope and the credentials domain onto Zhuque and cover keys. */
export declare class WriterZhuqueCardController {
    private readonly scope;
    private readonly ctx;
    private readonly form;
    private readonly store;
    private makersState;
    private coverState;
    /**
     * @param scope - the shared configuration form for the `writer` namespace.
     * @param ctx - the page plugin's context.
     */
    constructor(scope: SettingsFormScope<WriterZhuqueSettings>, ctx: ClientContext);
    private projection;
    /** Ask the credentials domain about both references the section names. */
    private readCredentials;
    /**
     * Re-read after the Host reports a change to a watched reference.
     * @param ref - the reference the Host reports as changed.
     */
    refreshCredential(ref: string): void;
    /**
     * Build the face the page's slot registration injects.
     * @returns the page snapshot and its form actions.
     */
    inject(): WriterZhuqueCardFace;
    /**
     * Write a staged key, then re-read whether the Host now holds one.
     * @param which - Zhuque or cover.
     * @param value - the staged credential literal.
     * @returns whether the Host reports a configured credential afterwards.
     */
    private writeKey;
    /** Release configuration subscriptions. */
    dispose(): void;
}
//# sourceMappingURL=zhuque-settings-controller.d.ts.map