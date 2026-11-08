import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** On-demand chapter progress and cited reviews inside the existing writing sidebar. */
import { useEffect, useState } from 'react';
import { isEditableWriterPath, safeRelative } from "../editable.js";
import { readBookStatus, selectedChapter } from "./book-status.js";
import { readWorkspaceText, remoteMessage } from "./read.js";
import { normalizeEol } from "./eol.js";
import { RevisionDiff } from "./RevisionDiff.js";
function missing(error) {
    return error.code === 'workspace-file/not-found';
}
const checkLabels = {
    ready: 'checkReady', needs_decision: 'checkDecision', blocked: 'checkBlocked', invalid: 'checkBlocked', tool_unavailable: 'checkUnavailable',
};
/**
 * Read a single book's reports when expanded, without running tools or editing tracking files.
 * @param props - workspace identity, current draft, discovered books, and file-selection action.
 * @returns collapsible progress and review details.
 */
export function BookPanel({ sessionId, cwd, remote, projects, active, draft, dirty, version, visible, onOpen, t }) {
    const [open, setOpen] = useState(false);
    const [bookPick, setBookPick] = useState();
    const [activeBook, setActiveBook] = useState();
    const [chapterPick, setChapterPick] = useState();
    const [chapterInput, setChapterInput] = useState();
    const [status, setStatus] = useState();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const bookPaths = projects.map(project => project.path).join('\0');
    const containing = projects.filter(project => project.path === '' || active?.startsWith(`${project.path}/`))
        .sort((left, right) => right.path.length - left.path.length)[0]?.path;
    const book = bookPick !== undefined && projects.some(project => project.path === bookPick) ? bookPick
        : containing ?? (activeBook !== undefined && projects.some(project => project.path === activeBook) ? activeBook : projects.length === 1 ? projects[0]?.path : undefined);
    const withinBook = active === undefined || book === undefined ? undefined
        : book === '' ? active : active.startsWith(`${book}/`) ? active.slice(book.length + 1) : undefined;
    const chapter = chapterPick ?? (withinBook === undefined ? undefined : selectedChapter(withinBook));
    const joinBook = (path) => book === '' ? path : `${book}/${path}`;
    useEffect(() => { setChapterPick(undefined); setChapterInput(undefined); }, [active, book]);
    useEffect(() => {
        if (!open || !visible)
            return;
        const controller = new AbortController();
        void readWorkspaceText(remote, sessionId, `${cwd}/.active-book`, controller.signal).then(result => {
            if (controller.signal.aborted || !result.ok)
                return;
            const path = result.value.text.trim().replace(/\/$/u, '');
            if (path === '.' || safeRelative(path))
                setActiveBook(path === '.' ? '' : path);
        }).catch(() => { });
        return () => { controller.abort(); };
    }, [open, visible, remote, sessionId, cwd, refresh]);
    useEffect(() => {
        if (!open || !visible || book === undefined)
            return;
        const controller = new AbortController();
        const absolute = (path) => `${cwd}/${book === '' ? '' : `${book}/`}${path}`;
        setLoading(true);
        setError(undefined);
        setStatus(undefined);
        void readBookStatus({
            read: async (path) => {
                const result = await readWorkspaceText(remote, sessionId, absolute(path), controller.signal);
                if (result.ok)
                    return result.value.text;
                if (missing(result.error))
                    return undefined;
                throw new Error(`${path}: ${remoteMessage(result.error, t('loadError'))}`);
            },
            list: async (path) => {
                const result = await remote.workspaceFiles.list(sessionId, absolute(path), controller.signal);
                if (result.ok) {
                    if (result.value.truncated)
                        throw new Error(`${path}: ${t('truncated')}`);
                    return result.value.entries;
                }
                if (missing(result.error))
                    return [];
                throw new Error(`${path}: ${remoteMessage(result.error, t('loadError'))}`);
            },
        }, chapter).then(value => {
            if (!controller.signal.aborted)
                setStatus(value);
        }).catch((cause) => {
            if (!controller.signal.aborted)
                setError(cause instanceof Error ? cause.message : t('loadError'));
        }).finally(() => { if (!controller.signal.aborted)
            setLoading(false); });
        return () => { controller.abort(); };
    }, [open, visible, book, chapter, sessionId, cwd, remote, version, refresh, bookPaths, t]);
    if (projects.length === 0)
        return null;
    const check = status?.check;
    const draftAffectsChapter = dirty && withinBook !== undefined && (selectedChapter(withinBook) === status?.chapter
        || withinBook === check?.outlinePath || withinBook === check?.bodyPath);
    const review = status?.review;
    const reviewDraft = review !== undefined && withinBook === review.bodyPath ? draft : undefined;
    const staleReview = review?.stale === true || (review !== undefined && reviewDraft !== undefined && normalizeEol(review.bodyText) !== reviewDraft);
    return _jsxs("details", { className: "writer-book-panel", open: open, onToggle: event => { setOpen(event.currentTarget.open); }, children: [_jsx("summary", { children: t('bookPanelTitle') }), open && _jsxs("div", { className: "writer-book-content", children: [_jsxs("div", { className: "writer-book-controls", children: [_jsxs("label", { children: [t('bookPanelBook'), " ", _jsxs("select", { value: book ?? '__choose__', onChange: event => { setBookPick(event.target.value); }, children: [book === undefined && _jsx("option", { value: "__choose__", children: t('bookChoose') }), projects.map(project => _jsx("option", { value: project.path, children: project.name || t('workspaceBook') }, project.path))] })] }), book !== undefined && chapter !== null && status?.chapter !== null && _jsxs("label", { children: [t('bookPanelChapter'), " ", _jsx("input", { type: "number", min: 1, value: chapterInput ?? chapterPick ?? status?.chapter ?? 1, onChange: event => { setChapterInput(event.target.value); }, onBlur: event => { const value = Number(event.target.value); if (Number.isSafeInteger(value) && value > 0)
                                            setChapterPick(value);
                                        else
                                            setChapterInput(undefined); }, onKeyDown: event => { if (event.key === 'Enter')
                                            event.currentTarget.blur(); } })] }), _jsx("button", { type: "button", disabled: loading, onClick: () => { setRefresh(value => value + 1); }, children: t('bookRefresh') })] }), book === undefined ? _jsx("p", { children: t('bookChoose') }) : loading ? _jsx("p", { role: "status", children: t('loading') }) : error !== undefined ? _jsx("p", { role: "alert", children: t('bookRecordError').replace('{path}', error) }) : status !== undefined && _jsxs(_Fragment, { children: [_jsxs("p", { children: [status.title || projects.find(project => project.path === book)?.name, " \u00B7 ", status.lastChapter === undefined
                                        ? t('bookNoTracking') : t('bookCommitted').replace('{n}', String(status.lastChapter))] }), status.lastChapter !== undefined && _jsx("p", { children: t('bookNext').replace('{n}', String(status.lastChapter + 1)) }), status.commitments.length > 0 && _jsxs("details", { children: [_jsx("summary", { children: t('bookCommitments') }), _jsx("ul", { children: status.commitments.map((item, index) => _jsx("li", { children: item }, index)) })] }), _jsxs("div", { className: "writer-book-report", children: [_jsx("strong", { children: t('bookMechanical') }), _jsx("p", { children: check === undefined ? t('bookUnchecked') : check.stale || draftAffectsChapter ? t('bookStale')
                                            : t(checkLabels[check.status] ?? 'checkUnavailable') }), check !== undefined && _jsxs(_Fragment, { children: [_jsx("p", { children: t('bookWordcount').replace('{actual}', String(check.actual)).replace('{target}', String(check.target)) }), check.findings.length > 0 && _jsx("ul", { children: check.findings.map((finding, index) => _jsx("li", { children: finding }, index)) }), _jsx("button", { type: "button", onClick: () => { onOpen(joinBook(check.path)); }, children: t('bookOpenCheck') })] }), _jsx("p", { className: "writer-muted", children: t('bookCheckHelp') })] }), _jsxs("div", { className: "writer-book-report", children: [_jsx("strong", { children: t('bookSemantic') }), _jsx("p", { children: review === undefined ? t('bookUnreviewed') : staleReview ? t('bookStaleReview') : t('bookReviewCurrent') }), review !== undefined && _jsxs(_Fragment, { children: [_jsx("p", { children: review.summary }), _jsx("ul", { children: review.findings.map(finding => _jsxs("li", { children: [_jsxs("span", { children: [t(finding.severity === 'must' ? 'reviewMust' : finding.severity === 'suggestion' ? 'reviewSuggestion' : 'reviewOptional'), " \u00B7 ", t('reviewLine').replace('{n}', String(finding.line))] }), _jsx("blockquote", { children: finding.quote }), _jsx("p", { children: finding.explanation }), _jsx("p", { children: finding.suggestion }), !staleReview && finding.resolution !== undefined && _jsx("span", { children: t(finding.resolution === 'accepted' ? 'reviewAccepted' : 'reviewResolved') })] }, finding.id)) }), _jsxs("details", { children: [_jsx("summary", { children: t('reviewChanges') }), _jsx(RevisionDiff, { path: review.bodyPath, before: normalizeEol(review.bodyText), after: reviewDraft ?? normalizeEol(review.currentText), t: t })] }), _jsx("button", { type: "button", onClick: () => { onOpen(joinBook(review.path)); }, children: t('bookOpenReview') }), _jsx("p", { className: "writer-muted", children: t('reviewResolveHelp') })] })] }), status.workFiles.length > 0 && _jsxs("div", { className: "writer-book-report", children: [_jsx("strong", { children: t('bookUnfinished') }), _jsx("p", { children: t('bookResumeHelp') }), status.workFiles.filter(isEditableWriterPath).map(path => _jsx("button", { type: "button", onClick: () => { onOpen(joinBook(path)); }, children: path.split('/').pop() }, path))] })] })] })] });
}
//# sourceMappingURL=BookPanel.js.map