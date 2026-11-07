/**
 * The Writer settings page's staged form over the `writer` namespace.
 * Key literals never ride a response: they write through the credentials
 * domain under the references `makersApiKeyEnv` and `gptImageApiKeyEnv` name.
 */
import { SettingsFormModel, settingsTextField, } from '@deepseek-ai/dsh-client-ui-primitives';
/** Namespace of the writer plugin. Spelled here so the client half does not import Host values. */
export const WRITER_SETTINGS_NS = 'writer';
const FALLBACK_MAKERS_REF = 'MAKERS_API_KEY';
const FALLBACK_COVER_REF = 'GPT_IMAGE_API_KEY';
/** Bridges the `writer` scope and the credentials domain onto Zhuque and cover keys. */
export class WriterZhuqueCardController {
    scope;
    ctx;
    form;
    store;
    makersState = { ref: '', configured: false, writable: true };
    coverState = { ref: '', configured: false, writable: true };
    /**
     * @param scope - the shared configuration form for the `writer` namespace.
     * @param ctx - the page plugin's context.
     */
    constructor(scope, ctx) {
        this.scope = scope;
        this.ctx = ctx;
        this.form = new SettingsFormModel(scope, [
            settingsTextField('gptImageBaseUrl'),
        ], [
            { field: 'makersApiKey', write: (text) => this.writeKey('makers', text) },
            { field: 'gptImageApiKey', write: (text) => this.writeKey('cover', text) },
        ]);
        this.store = this.form.bind(() => this.projection());
        scope.subscribe(() => { void this.readCredentials(); });
        void this.readCredentials();
    }
    projection() {
        return {
            ...this.form.shell(),
            key: {
                draft: this.form.field('makersApiKey'),
                configured: this.makersState.configured,
                writable: this.makersState.writable,
            },
            coverKey: {
                draft: this.form.field('gptImageApiKey'),
                configured: this.coverState.configured,
                writable: this.coverState.writable,
            },
            gptImageBaseUrl: this.form.field('gptImageBaseUrl'),
        };
    }
    /** Ask the credentials domain about both references the section names. */
    async readCredentials() {
        const snapshot = this.scope.getSnapshot();
        const makersRef = makersRefOf(snapshot);
        const coverRef = coverRefOf(snapshot);
        let projected = false;
        if (makersRef !== this.makersState.ref) {
            this.makersState = { ref: makersRef, configured: false, writable: true };
            projected = true;
        }
        if (coverRef !== this.coverState.ref) {
            this.coverState = { ref: coverRef, configured: false, writable: true };
            projected = true;
        }
        if (projected)
            this.store.set(this.projection());
        const response = await this.ctx.remote.credentials.describe([makersRef, coverRef]);
        if (!response.ok)
            return;
        const latest = this.scope.getSnapshot();
        if (makersRef !== makersRefOf(latest) || coverRef !== coverRefOf(latest))
            return;
        const makersView = response.value[makersRef];
        const coverView = response.value[coverRef];
        const nextMakers = {
            ref: makersRef,
            configured: makersView?.configured ?? false,
            writable: makersView?.writable ?? true,
        };
        const nextCover = {
            ref: coverRef,
            configured: coverView?.configured ?? false,
            writable: coverView?.writable ?? true,
        };
        const makersSame = nextMakers.configured === this.makersState.configured
            && nextMakers.writable === this.makersState.writable
            && nextMakers.ref === this.makersState.ref;
        const coverSame = nextCover.configured === this.coverState.configured
            && nextCover.writable === this.coverState.writable
            && nextCover.ref === this.coverState.ref;
        if (makersSame && coverSame)
            return;
        this.makersState = nextMakers;
        this.coverState = nextCover;
        this.store.set(this.projection());
    }
    /**
     * Re-read after the Host reports a change to a watched reference.
     * @param ref - the reference the Host reports as changed.
     */
    refreshCredential(ref) {
        if (this.makersState.ref !== ref && this.coverState.ref !== ref)
            return;
        void this.readCredentials();
    }
    /**
     * Build the face the page's slot registration injects.
     * @returns the page snapshot and its form actions.
     */
    inject() {
        return {
            hooks: { writerZhuqueCard: this.store },
            ...this.form.actions(),
        };
    }
    /**
     * Write a staged key, then re-read whether the Host now holds one.
     * @param which - Zhuque or cover.
     * @param value - the staged credential literal.
     * @returns whether the Host reports a configured credential afterwards.
     */
    async writeKey(which, value) {
        const snapshot = this.scope.getSnapshot();
        const ref = which === 'makers' ? makersRefOf(snapshot) : coverRefOf(snapshot);
        const response = await this.ctx.remote.credentials.set(ref, value);
        if (!response.ok)
            return false;
        await this.readCredentials();
        return which === 'makers' ? this.makersState.configured : this.coverState.configured;
    }
    /** Release configuration subscriptions. */
    dispose() { this.form.dispose(); }
}
/**
 * The Zhuque credential reference the section names, or MAKERS_API_KEY.
 * @param snapshot - the current scope snapshot.
 * @returns the reference to address.
 */
function makersRefOf(snapshot) {
    const declared = snapshot.value?.makersApiKeyEnv;
    return declared !== undefined && declared.length > 0 ? declared : FALLBACK_MAKERS_REF;
}
/**
 * The cover credential reference the section names, or GPT_IMAGE_API_KEY.
 * @param snapshot - the current scope snapshot.
 * @returns the reference to address.
 */
function coverRefOf(snapshot) {
    const declared = snapshot.value?.gptImageApiKeyEnv;
    return declared !== undefined && declared.length > 0 ? declared : FALLBACK_COVER_REF;
}
//# sourceMappingURL=zhuque-settings-controller.js.map