import { jsx as _jsx } from "react/jsx-runtime";
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store';
import { Toast } from '@deepseek-ai/dsh-client-ui-primitives';
import { en, zh } from "./workbench-locales.js";
import { NS as DESK_NS } from "./locales.js";
import { Launcher, Main, NativeConversation, Workbench } from "./workbench.js";
export const inject = ['slots', 'locale', 'layout', 'sessions', 'uiSession', 'uiWorkspace', 'conversation', 'remote', 'remote.workspaceFiles'];
function WorkbenchNotice({ useNotice, dismiss, t }) {
    const notice = useNotice(value => value);
    return notice ? _jsx(Toast, { text: t(notice.key), ...(notice.key !== 'operationFailed' ? { tone: 'success' } : {}), onDone: dismiss }, notice.sequence) : null;
}
/** @param ctx - native Client services. @param store - preferences shared with the sidebar. */
export function apply(ctx, store) {
    ctx.effect(() => ctx.locale.register('writerWorkbench', { en, zh }), 'writer: workbench locale');
    const t = ctx.locale.bind('writerWorkbench');
    const deskT = ctx.locale.bind(DESK_NS);
    const notice = createSnapshotStore(null);
    let sequence = 0;
    ctx.effect(() => ctx.slots.inject('main', function* () {
        yield ctx.slots.register({ name: 'main', key: 'writer-workbench', children: { 'writer.workbench': { kind: 'single', scope: 'root' } } }, Main);
        yield ctx.slots.register({
            name: 'writer.workbench', locale: 'writerWorkbench', store,
            children: { 'writer.workbench.conversation': { kind: 'single', scope: 'session' } },
            inject: () => ({
                retain: id => ctx.sessions.retain(id, { source: 'mainView' }),
                createSession: workspaceId => ctx.sessions.create({ workspaceId, agentPreset: 'writer' }),
                createBook: async (input) => await request(input),
                openSession: id => { ctx.uiWorkspace.openSession(id); },
                report: key => { notice.set({ key, sequence: ++sequence }); },
                remote: ctx.remote,
                deskT: key => deskT(key),
            }),
        }, Workbench);
    }), 'writer: workbench panel');
    ctx.effect(() => ctx.slots.inject('writer.workbench.conversation', () => ctx.slots.register({ name: 'writer.workbench.conversation' }, NativeConversation)), 'writer: native conversation');
    ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'writer-workbench', order: 26, label: () => t('title'), locale: 'writerWorkbench' }, Launcher)), 'writer: workbench launcher');
    ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay', id: 'writer.workbench.notice', locale: 'writerWorkbench',
        inject: () => ({ hooks: { notice }, dismiss: () => { notice.set(null); } }),
    }, WorkbenchNotice)), 'writer: workbench feedback');
}
async function request(value) {
    const response = await fetch('/writer-workbench', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });
    const result = await response.json();
    if (!response.ok)
        throw new Error(result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : 'workbenchFailed');
    return result;
}
//# sourceMappingURL=workbench-entry.js.map