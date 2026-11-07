/**
 * Whether the on-screen session uses the writing preset.
 * @param context - browser session services.
 * @param sessionId - session to inspect.
 * @returns true when the projection says `writer`.
 */
export function isWriterSession(context, sessionId) {
    return sessionId !== undefined && context.sessions.list.getSnapshot().byId[sessionId]?.projectionValues?.agentPreset === 'writer';
}
/**
 * Register the tab type, and show its guide entry only for a writing session.
 * @param context - browser session and sidebar services.
 * @param definition - tab type including its guide entry.
 * @returns a disposer for the subscriptions and the current registration.
 */
export function registerWriterTab(context, definition) {
    const current = context.uiSession.adapter.current;
    let visible;
    let release;
    const sync = () => {
        const next = isWriterSession(context, current.getSnapshot().key);
        if (next === visible)
            return;
        visible = next;
        release?.();
        release = context.sidebarRightTabs.register({ ...definition, guide: next ? definition.guide ?? [] : [] });
    };
    const stopCurrent = current.subscribe(sync);
    const stopSessions = context.sessions.list.subscribe(sync);
    sync();
    return () => { stopCurrent(); stopSessions(); release?.(); };
}
//# sourceMappingURL=mode.js.map