import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconEditOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { useEffect } from 'react';
import { en, NS, zh } from "./locales.js";
import { registerWriterTab } from "./mode.js";
import { WriterDesk } from "./desk.js";
export const name = 'writer';
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs', 'layout', 'remote', 'remote.workspaceFiles'];
const TAB_ID = '@winterhuan/dsh-writer';
function WorkbenchLauncher({ sessionId, t, actions, openWorkbench }) {
    return _jsx("header", { className: "writer-sidebar-heading", children: _jsx("button", { type: "button", onClick: () => { actions.openFromSidebar(sessionId); openWorkbench(); }, children: t('openWorkbench') }) });
}
function Sidebar({ sessionId, useTabInfo, useSessions, t, remote, renderSlot }) {
    const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset);
    const cwd = useSessions(state => state.byId[sessionId]?.cwd);
    const { tab } = useTabInfo();
    useEffect(() => { if (typeof preset === 'string' && preset !== 'writer')
        tab.actions.close(); }, [preset, tab.actions]);
    if (preset !== 'writer')
        return null;
    return _jsxs("div", { className: "writer-sidebar", children: [renderSlot('writer.sidebar.launcher', { sessionId }), cwd === undefined ? _jsx("p", { className: "writer-empty", children: t('noWorkspace') }) : _jsx(WriterDesk, { sessionId: sessionId, cwd: cwd, remote: remote, t: t, visible: tab.visible })] });
}
/**
 * Register the writing tab and its body. The guide entry follows the selected preset.
 * @param context - browser services.
 * @param store - viewing preferences shared with the full workbench.
 */
export function apply(context, store) {
    context.effect(() => context.locale.register(NS, { zh, en }), 'writer: dictionaries');
    const t = context.locale.bind(NS);
    context.effect(() => registerWriterTab(context, {
        id: TAB_ID,
        kind: 'writer',
        title: () => t('title'),
        guide: [{ id: 'writer', order: 22, title: () => t('title'), description: () => t('description'), icon: IconEditOutlineRegular }],
    }), 'writer: sidebar type');
    context.effect(() => context.slots.inject('sidebar.right.pane.tab', () => context.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS, children: { 'writer.sidebar.launcher': { kind: 'single', scope: 'root' } }, inject: () => ({ remote: context.remote }) }, Sidebar)), 'writer: sidebar body');
    context.effect(() => context.slots.inject('writer.sidebar.launcher', () => context.slots.register({ name: 'writer.sidebar.launcher', locale: NS, store, inject: () => ({ openWorkbench: () => context.layout.selectPanel('writer-workbench') }) }, WorkbenchLauncher)), 'writer: sidebar workbench launcher');
}
//# sourceMappingURL=sidebar.js.map