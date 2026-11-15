import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconEditOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { useEffect } from 'react';
import { en, NS, zh } from "./locales.js";
import { registerWriterTab } from "./mode.js";
export const name = 'writer';
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs', 'layout'];
const TAB_ID = '@winterhuan/dsh-writer';
/**
 * Register the writing tab and its body. The guide entry follows the selected preset.
 * @param context - browser services.
 */
export function apply(context) {
    context.effect(() => context.locale.register(NS, { zh, en }), 'writer: dictionaries');
    const t = context.locale.bind(NS);
    context.effect(() => registerWriterTab(context, {
        id: TAB_ID,
        kind: 'writer',
        title: () => t('title'),
        guide: [{ id: 'writer', order: 22, title: () => t('title'), description: () => t('description'), icon: IconEditOutlineRegular }],
    }), 'writer: sidebar type');
    function Sidebar({ sessionId, useTabInfo, useSessions, t: copy, openWorkbench }) {
        const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset);
        const { tab } = useTabInfo();
        useEffect(() => { if (typeof preset === 'string' && preset !== 'writer')
            tab.actions.close(); }, [preset, tab.actions]);
        if (preset !== 'writer')
            return null;
        return _jsxs("div", { className: "writer-sidebar-launcher", children: [_jsx("p", { children: copy('openWorkbenchDescription') }), _jsx("button", { type: "button", onClick: openWorkbench, children: copy('openWorkbench') })] });
    }
    context.effect(() => context.slots.inject('sidebar.right.pane.tab', () => context.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS, inject: () => ({ openWorkbench: () => context.layout.selectPanel('writer-workbench') }) }, Sidebar)), 'writer: sidebar body');
}
//# sourceMappingURL=sidebar.js.map