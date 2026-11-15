import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Works library, book editor, and the official DSH Conversation surface. */
import { SessionId } from '@deepseek-ai/dsh-session/types';
import { useEffect, useRef, useState } from 'react';
import { IconEditOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { WriterDesk } from "./desk.js";
import { writeWriterSelection } from "./draft-storage.js";
/** Open the main workbench panel. */
export function Main({ renderSlot }) {
    return renderSlot('writer.workbench', {});
}
/** Sidebar launcher for the complete writing workbench. */
export function Launcher({ size }) {
    return _jsx(IconEditOutlineRegular, { size: size });
}
export function NativeConversation({ useSession, useConversation, renderFactorySlot }) {
    const session = useSession(value => value);
    const conversation = useConversation(value => value);
    const settling = session.openState === 'loading' && conversation.activeTargets.size === 0;
    return renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : 'active', hero: false });
}
/** Main works screen and native assistant bindings. */
export function Workbench({ t, retain, action, load, openSession, initializeDraft, renderSlot, SessionProvider, remote, deskT, useSessions }) {
    const [catalog, setCatalog] = useState();
    const [bookId, setBookId] = useState();
    const [selectedSessionId, setSelectedSessionId] = useState();
    const [section, setSection] = useState('works');
    const [error, setError] = useState();
    const [busy, setBusy] = useState(false);
    const [narrow, setNarrow] = useState(false);
    const [smallView, setSmallView] = useState('document');
    const [assistantOpen, setAssistantOpen] = useState(true);
    const [title, setTitle] = useState('');
    const [path, setPath] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');
    const [linkSessionId, setLinkSessionId] = useState('');
    const [form, setForm] = useState('long');
    const root = useRef(null);
    const checkpoint = useRef(() => true);
    const refresh = () => { void load().then(setCatalog).catch(() => setError(t('loadFailed'))); };
    useEffect(() => { refresh(); }, []);
    useEffect(() => {
        const node = root.current;
        if (!node)
            return;
        const observer = new ResizeObserver(entries => setNarrow((entries[0]?.contentRect.width ?? 0) < 920));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    const books = catalog?.books ?? [];
    const active = books.find(book => book.id === bookId);
    const sessions = useSessions(state => state.ids.flatMap(id => {
        const session = state.byId[id];
        return session && session.origin !== 'subagent' && session.projectionValues?.agentPreset === 'writer' ? [session] : [];
    }));
    const sessionId = active && selectedSessionId && active.phases.some(phase => phase.sessionId === selectedSessionId) ? selectedSessionId : active?.sessionId;
    const librarySession = books.find(book => book.sessionId !== null);
    const perform = async (input) => {
        setBusy(true);
        setError(undefined);
        try {
            const book = await action(input);
            if (input && typeof input === 'object' && 'action' in input && input.action === 'create')
                writeWriterSelection(book.cwd, `${book.path}/${book.form === 'long' ? '设定/创作意图.md' : '设定.md'}`);
            setBookId(book.id);
            setSelectedSessionId(book.sessionId ?? undefined);
            setSection('works');
            refresh();
        }
        catch (cause) {
            setError(t(cause instanceof Error ? cause.message : 'operationFailed'));
        }
        finally {
            setBusy(false);
        }
    };
    const canLeaveDocument = () => {
        if (checkpoint.current())
            return true;
        setError(t('draftCheckpointFailed'));
        return false;
    };
    const goBack = () => { if (active && canLeaveDocument()) {
        setBookId(undefined);
        setSelectedSessionId(undefined);
        setSmallView('document');
    } };
    const requestAssistant = (prompt) => {
        if (!sessionId)
            return;
        const reference = retain(sessionId);
        void reference.ready.then(() => { initializeDraft(reference, prompt); openSession(sessionId); }).finally(() => reference.release());
    };
    return _jsxs("main", { ref: root, className: "writer-workbench", "data-workbench": "writer", children: [_jsxs("header", { className: "writer-wb-header", children: [_jsxs("div", { children: [_jsx("h1", { children: t('title') }), active && _jsx("span", { children: active.title })] }), active && _jsx("button", { type: "button", onClick: goBack, children: t('allWorks') })] }), !active ? _jsxs("div", { className: "writer-wb-home", children: [_jsx("nav", { className: "writer-wb-nav", "aria-label": t('navigation'), children: ['works', 'analysis', 'market'].map(key => _jsx("button", { type: "button", "aria-current": section === key ? 'page' : undefined, onClick: () => setSection(key), children: t(key) }, key)) }), section === 'works' ? _jsxs("section", { className: "writer-wb-works", children: [_jsxs("div", { className: "writer-wb-toolbar", children: [_jsx("h2", { children: t('works') }), _jsx("button", { type: "button", onClick: refresh, children: t('refresh') })] }), _jsxs("form", { onSubmit: event => { event.preventDefault(); if (workspaceId && path.trim() && title.trim())
                                    void perform({ action: 'create', workspaceId, path: path.trim(), title: title.trim(), form }); }, children: [_jsxs("select", { "aria-label": t('workspace'), value: workspaceId, onChange: event => setWorkspaceId(event.target.value), children: [_jsx("option", { value: "", children: t('chooseWorkspace') }), catalog?.workspaces.map(workspace => _jsx("option", { value: workspace.id, children: workspace.title }, workspace.id))] }), _jsx("input", { "aria-label": t('bookTitle'), value: title, onChange: event => setTitle(event.target.value), placeholder: t('bookTitle') }), _jsx("input", { "aria-label": t('folder'), value: path, onChange: event => setPath(event.target.value), placeholder: t('folder') }), _jsxs("select", { "aria-label": t('form'), value: form, onChange: event => setForm(event.target.value), children: [_jsx("option", { value: "long", children: t('longForm') }), _jsx("option", { value: "short", children: t('shortForm') })] }), _jsx("button", { type: "submit", disabled: busy, children: t('createBook') })] }), _jsxs("select", { "aria-label": t('writerSession'), value: linkSessionId, onChange: event => setLinkSessionId(event.target.value), children: [_jsx("option", { value: "", children: t('chooseWriterSession') }), sessions.map(session => _jsx("option", { value: session.id, children: session.displayTitle }, session.id))] }), _jsx("button", { type: "button", disabled: busy || !workspaceId || !path.trim() || !title.trim() || !linkSessionId, onClick: () => { void perform({ action: 'register', workspaceId, path: path.trim(), title: title.trim(), form, sessionId: linkSessionId }); }, children: t('registerExisting') }), _jsx("ul", { className: "writer-wb-book-list", children: books.map(book => _jsxs("li", { children: [_jsxs("button", { type: "button", onClick: () => { if (!canLeaveDocument())
                                                return; setBookId(book.id); setSelectedSessionId(book.sessionId ?? undefined); }, children: [_jsx("strong", { children: book.title }), _jsx("span", { children: book.path }), _jsx("small", { children: book.sessionId ? t('sessionBound') : t('sessionNeeded') })] }), _jsx("button", { type: "button", disabled: busy, onClick: () => { if (canLeaveDocument())
                                                void perform({ action: 'open', id: book.id }); }, children: t('open') })] }, book.id)) })] }) : librarySession ? _jsxs("section", { className: "writer-wb-library", children: [_jsxs("header", { children: [_jsx("h2", { children: t(section) }), _jsx("span", { children: librarySession.title })] }), _jsx(WriterDesk, { sessionId: SessionId(librarySession.sessionId), cwd: librarySession.cwd, remote: remote, t: deskT, visible: true, initialView: section === 'analysis' ? 'libraries' : 'scans' }, `${librarySession.id}:${section}`)] }) : _jsxs("section", { className: "writer-wb-placeholder", children: [_jsx("h2", { children: t(section) }), _jsx("p", { children: section === 'analysis' ? t('analysisEmpty') : t('marketEmpty') })] })] }) : _jsxs("div", { className: "writer-wb-book", children: [_jsxs("nav", { className: "writer-wb-book-nav", children: [_jsx("strong", { children: active.title }), _jsx("button", { type: "button", onClick: () => requestAssistant(t('planningTask', { title: active.title, path: active.path })), children: t('startPlanning') }), active.phases.map((phase, index) => _jsxs("button", { type: "button", "aria-current": phase.sessionId === sessionId ? 'page' : undefined, onClick: () => { if (canLeaveDocument())
                                    setSelectedSessionId(phase.sessionId); }, children: [t('phase'), " ", index + 1] }, phase.sessionId)), _jsx("button", { type: "button", disabled: busy, onClick: () => { if (canLeaveDocument())
                                    void perform({ action: 'phase', id: active.id }); }, children: t('newPhase') }), _jsxs("select", { "aria-label": t('chooseWriterSession'), value: linkSessionId, onChange: event => setLinkSessionId(event.target.value), children: [_jsx("option", { value: "", children: t('chooseWriterSession') }), sessions.filter(session => session.cwd === active.cwd).map(session => _jsx("option", { value: session.id, children: session.displayTitle }, session.id))] }), _jsx("button", { type: "button", disabled: busy || !linkSessionId, onClick: () => { if (canLeaveDocument())
                                    void perform({ action: 'bind', id: active.id, sessionId: linkSessionId }); }, children: t('linkSession') })] }), _jsxs("div", { className: "writer-wb-mobile-tabs", children: [_jsx("button", { type: "button", "aria-pressed": smallView === 'document', onClick: () => setSmallView('document'), children: t('document') }), _jsx("button", { type: "button", "aria-pressed": smallView === 'assistant', onClick: () => setSmallView('assistant'), children: t('assistant') })] }), _jsxs("div", { className: "writer-wb-columns", "data-assistant-open": assistantOpen ? 'true' : 'false', "data-narrow": narrow ? 'true' : undefined, "data-small-view": smallView, children: [_jsx("section", { className: "writer-wb-document", children: sessionId ? _jsx(WriterDesk, { sessionId: SessionId(sessionId), cwd: active.cwd, remote: remote, t: deskT, checkpoint: () => checkpoint.current(), visible: true }, active.id) : _jsx("p", { children: t('sessionNeeded') }) }), _jsx("div", { className: "writer-wb-resize", role: "separator", "aria-orientation": "vertical", "aria-valuenow": 66 }), _jsxs("section", { className: "writer-wb-assistant", "aria-label": t('assistant'), children: [_jsxs("header", { children: [_jsx("h2", { children: t('assistant') }), _jsx("button", { type: "button", onClick: () => setAssistantOpen(value => !value), children: assistantOpen ? t('collapse') : t('expand') })] }), sessionId ? _jsx(AssistantPanel, { book: { ...active, sessionId }, retain: retain, renderSlot: renderSlot, SessionProvider: SessionProvider, t: t }, sessionId) : _jsx("p", { children: t('sessionNeeded') })] })] })] }), error && _jsx("p", { role: "alert", className: "writer-wb-error", children: error })] });
}
function AssistantPanel({ book, retain, renderSlot, SessionProvider, t }) {
    const [reference, setReference] = useState();
    const [failure, setFailure] = useState(false);
    useEffect(() => {
        const current = retain(book.sessionId);
        let alive = true;
        setReference(current);
        void current.ready.catch(() => { if (alive)
            setFailure(true); });
        return () => { alive = false; current.release(); };
    }, [book.sessionId, retain]);
    if (!reference || failure)
        return _jsx("p", { role: failure ? 'alert' : 'status', children: t(failure ? 'sessionUnavailable' : 'loading') });
    return _jsx(SessionProvider, { session: reference, children: renderSlot('writer.workbench.conversation', {}) });
}
//# sourceMappingURL=workbench.js.map