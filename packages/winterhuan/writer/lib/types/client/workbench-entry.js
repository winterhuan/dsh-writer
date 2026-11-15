import { en, zh } from "./workbench-locales.js";
import { en as deskEn, NS as DESK_NS, zh as deskZh } from "./locales.js";
import { Launcher, Main, NativeConversation, Workbench } from "./workbench.js";
export const inject = ['slots', 'locale', 'layout', 'sessions', 'uiSession', 'uiWorkspace', 'conversation', 'remote', 'remote.workspaceFiles'];
/** @param ctx - native Client services for panel selection, Sessions, and input drafts. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register('writerWorkbench', { en, zh }), 'writer: workbench locale');
    ctx.effect(() => ctx.locale.register(DESK_NS, { en: deskEn, zh: deskZh }), 'writer: document locale');
    const t = ctx.locale.bind('writerWorkbench');
    const deskT = ctx.locale.bind(DESK_NS);
    ctx.effect(() => ctx.slots.inject('main', function* () {
        yield ctx.slots.register({ name: 'main', key: 'writer-workbench', children: { 'writer.workbench': { kind: 'single', scope: 'root' } } }, Main);
        yield ctx.slots.register({
            name: 'writer.workbench', locale: 'writerWorkbench',
            children: { 'writer.workbench.conversation': { kind: 'single', scope: 'session' } },
            inject: () => ({
                retain: (id) => ctx.sessions.retain(id, { source: 'mainView' }),
                action: async (value) => await request('/writer-workbench', value),
                load: async () => validateCatalog(await request('/writer-workbench')),
                openSession: (id) => { ctx.uiWorkspace.openSession(id); },
                initializeDraft: (reference, prompt) => ctx.conversation.input.requestDraftInitialization(reference.binding, { prompt, whenDraftExists: 'append' }),
                remote: ctx.remote,
                deskT: (key) => deskT(key),
            }),
        }, Workbench);
    }), 'writer: workbench panel');
    ctx.effect(() => ctx.slots.inject('writer.workbench.conversation', () => ctx.slots.register({ name: 'writer.workbench.conversation' }, NativeConversation)), 'writer: native conversation');
    ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'writer-workbench', order: 26, label: () => t('title'), locale: 'writerWorkbench' }, Launcher)), 'writer: workbench launcher');
}
async function request(path, value) {
    const response = await fetch(path, value === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });
    const result = await response.json();
    if (!response.ok)
        throw new Error(result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : 'workbenchFailed');
    return result;
}
function validateCatalog(value) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.books) || !Array.isArray(value.workspaces))
        throw new Error('loadFailed');
    return value;
}
//# sourceMappingURL=workbench-entry.js.map