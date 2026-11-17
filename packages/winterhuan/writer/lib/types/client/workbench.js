import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { IconEditOutlineRegular, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { zh } from "./workbench-locales.js";
import { WriterDesk } from "./desk.js";
import { writeWriterSelection } from "./draft-storage.js";
import { preferredWriterWorkspace, writerSessionsInWorkspace } from "./workbench-selection.js";
import css from './workbench.module.css';
/** Render the full writing desk in the native main panel. */
export function Main({ renderSlot }) {
    return renderSlot('writer.workbench', {});
}
/** Sidebar navigation icon for the writing desk. */
export function Launcher({ size }) {
    return _jsx(IconEditOutlineRegular, { size: size });
}
/** Render the official Conversation factory under the selected Session provider. */
export function NativeConversation({ useSession, useConversation, renderFactorySlot }) {
    const session = useSession(value => value);
    const conversation = useConversation(value => value);
    const settling = session.openState === 'loading' && conversation.activeTargets.size === 0;
    return renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : 'active', hero: false });
}
/** Browse workspace files without a separate book-registration step. */
export function Workbench({ t, retain, createSession, createBook, openSession, report, renderSlot, SessionProvider, remote, deskT, useSessions, useWorkspaces, useStore, actions }) {
    const catalog = useSessions(state => state);
    const workspaces = useWorkspaces(state => state);
    const preferences = useStore(state => state);
    const [busy, setBusy] = useState(false);
    const [newBook, setNewBook] = useState(false);
    const [revision, setRevision] = useState(0);
    const [error, setError] = useState();
    const checkpoint = useRef(() => true);
    const remembered = workspaces.items.find(item => item.sessionIds.some(id => id === preferences.sessionId));
    const preferred = preferredWriterWorkspace(workspaces.items.map(item => ({ ...item, id: item.workspaceId })));
    const workspace = workspaces.items.find(item => item.workspaceId === preferences.workspaceId)
        ?? remembered ?? workspaces.items.find(item => item.workspaceId === preferred) ?? workspaces.items[0];
    const sessions = writerSessionsInWorkspace(catalog.ids.flatMap(id => catalog.byId[id] ? [catalog.byId[id]] : []), workspace ? { ...workspace, id: workspace.workspaceId } : undefined, workspace?.sessionIds ?? [])
        .filter(session => !session.parentId && !workspaces.archivedSessionIds.includes(session.id))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    const pending = catalog.phase !== 'ready' || workspaces.phase !== 'ready';
    const requested = sessions.find(session => session.id === preferences.sessionId);
    const selectionKey = JSON.stringify([workspace?.workspaceId, preferences.sessionId]);
    const [initialSession, setInitialSession] = useState();
    // A background update may reorder the menu, but must not replace the open conversation.
    if (!pending && (initialSession?.key !== selectionKey || (!initialSession.id && sessions.length))) {
        setInitialSession({ key: selectionKey, id: (requested ?? sessions[0])?.id });
    }
    const selected = requested ?? sessions.find(session => session.id === initialSession?.id);
    const canLeave = () => {
        if (!checkpoint.current()) {
            setError(t('draftCheckpointFailed'));
            return false;
        }
        setError(undefined);
        return true;
    };
    const create = async () => {
        if (!workspace || busy || !canLeave())
            return;
        setBusy(true);
        try {
            const id = await createSession(workspace.workspaceId);
            actions.selectWorkspace(workspace.workspaceId);
            actions.selectSession(id);
            report('createdSession');
        }
        catch {
            report('operationFailed');
        }
        finally {
            setBusy(false);
        }
    };
    return _jsxs("main", { className: css.workbench, "data-workbench": "writer", children: [_jsx("div", { className: css.ambient, "aria-hidden": "true" }), _jsxs("header", { className: css.header, children: [_jsxs("div", { className: css.heading, children: [_jsx(IconEditOutlineRegular, { size: 20 }), _jsx("h1", { children: t('title') })] }), _jsxs("label", { className: css.workspace, children: [t('workspace'), _jsxs("select", { value: workspace?.workspaceId ?? '', disabled: pending || busy, onChange: event => {
                                    const next = workspaces.items.find(item => item.workspaceId === event.target.value);
                                    if (next && canLeave())
                                        actions.selectWorkspace(next.workspaceId);
                                }, children: [!workspace && _jsx("option", { value: "", children: t('chooseWorkspace') }), workspaces.items.map(item => _jsx("option", { value: item.workspaceId, children: item.title }, item.workspaceId))] })] }), _jsx("button", { type: "button", className: css.primary, disabled: pending || busy || !workspace, onClick: () => { if (canLeave())
                            setNewBook(true); }, children: t('createBook') })] }), _jsxs("div", { className: css.toolbar, children: [_jsx("nav", { className: css.nav, "aria-label": t('navigation'), children: ['projects', 'libraries', 'scans'].map(view => _jsx("button", { type: "button", "aria-current": preferences.view === view ? 'page' : undefined, onClick: () => actions.selectView(view), children: t(view) }, view)) }), _jsx("button", { type: "button", className: css.assistantToggle, "aria-pressed": preferences.assistantOpen, onClick: actions.toggleAssistant, children: t(preferences.assistantOpen ? 'collapse' : 'expand') }), _jsxs("nav", { className: css.panes, "aria-label": t('panels'), children: [_jsx("button", { type: "button", "aria-pressed": preferences.pane === 'document', onClick: () => actions.selectPane('document'), children: t('document') }), _jsx("button", { type: "button", "aria-pressed": preferences.pane === 'assistant', onClick: () => actions.selectPane('assistant'), children: t('assistant') })] })] }), _jsxs("div", { className: css.body, "data-assistant-open": preferences.assistantOpen, "data-pane": preferences.pane, children: [_jsxs("section", { className: `writer-wb-document ${css.document}`, "aria-label": t(preferences.view), children: [pending ? _jsx(Loading, {}) : !workspace ? _jsxs("div", { className: css.empty, children: [_jsx("h2", { children: t('welcome') }), _jsx("p", { children: t('workspaceHelp') })] }) : selected
                                ? _jsx(WriterDesk, { sessionId: selected.id, cwd: workspace.path, remote: remote, t: deskT, checkpoint: checkpoint, visible: true, view: preferences.view }, `${workspace.path}:${revision}`)
                                : _jsxs("div", { className: css.empty, children: [_jsx("h2", { children: t('welcome') }), _jsx("p", { children: t('sessionHelp') }), _jsx("button", { type: "button", className: css.primary, disabled: busy, onClick: () => { void create(); }, children: t('newSession') })] }), error && _jsx("p", { role: "alert", className: css.error, children: error })] }), _jsxs("aside", { className: css.assistant, "aria-label": t('assistant'), children: [_jsxs("header", { children: [_jsx("h2", { children: t('assistant') }), _jsx("button", { type: "button", disabled: !selected || busy, onClick: () => { if (selected && canLeave())
                                            openSession(selected.id); }, children: t('openConversation') })] }), _jsxs("div", { className: css.sessionControls, children: [_jsxs("select", { "aria-label": t('writerSession'), value: selected?.id ?? '', disabled: pending || busy || !sessions.length, onChange: event => {
                                            const next = sessions.find(session => session.id === event.target.value);
                                            if (next && canLeave())
                                                actions.selectSession(next.id);
                                        }, children: [!selected && _jsx("option", { value: "", children: t('chooseWriterSession') }), sessions.map(session => _jsx("option", { value: session.id, children: session.displayTitle }, session.id))] }), _jsx("button", { type: "button", disabled: pending || busy || !workspace, onClick: () => { void create(); }, children: t('newSession') })] }), _jsx("div", { className: css.conversation, children: selected ? _jsx(AssistantPanel, { sessionId: selected.id, retain: retain, renderSlot: renderSlot, SessionProvider: SessionProvider, t: t }, selected.id) : _jsx("div", { className: css.empty, children: _jsx("p", { children: t('assistantHelp') }) }) })] })] }), newBook && workspace && _jsx(NewBook, { workspaceId: workspace.workspaceId, createBook: createBook, t: t, close: () => setNewBook(false), onCreated: book => {
                    writeWriterSelection(book.cwd, `${book.path}/${book.form === 'long' ? '设定/创作意图.md' : '设定.md'}`);
                    actions.selectWorkspace(workspace.workspaceId);
                    if (book.sessionId)
                        actions.selectSession(book.sessionId);
                    actions.selectView('projects');
                    setRevision(value => value + 1);
                    setNewBook(false);
                    report('createdBook');
                } })] });
}
function Loading() { return _jsx("div", { className: css.empty, "aria-busy": "true", children: _jsx("span", { className: css.spinner }) }); }
function AssistantPanel({ sessionId, retain, renderSlot, SessionProvider, t }) {
    const [reference, setReference] = useState();
    const [failure, setFailure] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const current = retain(sessionId);
        let alive = true;
        void current.ready.then(() => { if (alive)
            setReference(current); }).catch(() => { if (alive)
            setFailure(true); });
        return () => { alive = false; current.release(); };
    }, [sessionId, retain, retry]);
    if (failure)
        return _jsxs("div", { className: css.empty, children: [_jsx("p", { role: "alert", children: t('sessionUnavailable') }), _jsx("button", { type: "button", onClick: () => { setReference(undefined); setFailure(false); setRetry(value => value + 1); }, children: t('retry') })] });
    return reference ? _jsx(SessionProvider, { session: reference, children: renderSlot('writer.workbench.conversation', {}) }) : _jsx(Loading, {});
}
function NewBook({ workspaceId, createBook, onCreated, close, t }) {
    const [title, setTitle] = useState('');
    const [path, setPath] = useState();
    const [form, setForm] = useState('long');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState();
    return _jsx(Modal, { open: true, title: t('createBook'), closeLabel: t('cancel'), onClose: busy ? () => { } : close, children: _jsxs("form", { className: css.form, onSubmit: event => {
                event.preventDefault();
                if (busy || !title.trim() || !(path ?? title).trim())
                    return;
                setBusy(true);
                setError(undefined);
                void createBook({ action: 'create', workspaceId, title: title.trim(), path: (path ?? title).trim(), form }).then(onCreated).catch((cause) => {
                    const key = cause instanceof Error && cause.message in zh ? cause.message : 'operationFailed';
                    setError(t(key));
                }).finally(() => setBusy(false));
            }, children: [_jsxs("label", { children: [t('bookTitle'), _jsx("input", { autoFocus: true, required: true, value: title, disabled: busy, onChange: event => setTitle(event.target.value) })] }), _jsxs("label", { children: [t('folder'), _jsx("input", { required: true, value: path ?? title, disabled: busy, onChange: event => setPath(event.target.value) })] }), _jsxs("label", { children: [t('form'), _jsxs("select", { value: form, disabled: busy, onChange: event => setForm(event.target.value === 'short' ? 'short' : 'long'), children: [_jsx("option", { value: "long", children: t('longForm') }), _jsx("option", { value: "short", children: t('shortForm') })] })] }), error && _jsx("p", { role: "alert", children: error }), _jsxs("footer", { children: [_jsx("button", { type: "button", disabled: busy, onClick: close, children: t('cancel') }), _jsx("button", { type: "submit", className: css.primary, disabled: busy || !title.trim(), children: t('create') })] })] }) });
}
//# sourceMappingURL=workbench.js.map