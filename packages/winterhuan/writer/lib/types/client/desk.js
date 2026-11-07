import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { FileTypeIcon, classifyFileType, IconFolderCloseRegular, IconFolderOpenRegular, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import { writerExtension } from "../editable.js";
import { breadcrumbSegments, countLoadedFiles, editorByteSize, fileExtensionLabel, formatBytes, loadedFilesLabel, } from "./editor-shell.js";
import { applyEol, detectEol, eolLabel, normalizeEol } from "./eol.js";
import { WriterLineNumbers } from "./LineNumbers.js";
import { buildLoadedChildren, defaultWriterTreeExpanded, DIRECTORY_PAGE_SIZE, rootToDirectoryNode, scanWriterWorkspace, visibleDirectoryEntries, } from "./library.js";
import { markdownToSafeHtml } from "./markdown.js";
import { listWorkspace, readWorkspaceText, remoteMessage } from "./read.js";
import { saveWriterFile } from "./save.js";
import { MAX_SEARCH_QUERY_LENGTH, SEARCH_DEBOUNCE_MS, searchWriterFilenames, writerSearchTruncationMessage, } from "./search.js";
import { WRITER_RAIL_MAX_WIDTH, WRITER_RAIL_MIN_WIDTH, clampRailWidth, fitRailWidth, readRailChrome, setRailCollapsed, setRailWidth, writeRailChrome, } from "./rail-chrome.js";
import { workspaceShortName, writerScanHealth, } from "./workspace-status.js";
function joinCwd(cwd, relative) {
    const root = cwd.replace(/[/\\]+$/u, '');
    if (relative === '' || relative === '.')
        return root;
    return `${root}/${relative}`;
}
async function readDir(remote, sessionId, cwd, relative, signal) {
    const path = joinCwd(cwd, relative);
    const result = await listWorkspace(remote, sessionId, path, signal);
    if (!result.ok)
        throw new Error(remoteMessage(result.error, 'load'));
    return {
        entries: result.value.entries,
        truncated: result.value.truncated,
    };
}
function updateDirectoryNode(nodes, path, update) {
    return nodes.map((node) => {
        if (node.kind !== 'directory')
            return node;
        if (node.path === path)
            return update(node);
        const isAncestor = node.path === '' ? path !== '' : path.startsWith(`${node.path}/`);
        if (!isAncestor)
            return node;
        return { ...node, children: updateDirectoryNode(node.children, path, update) };
    });
}
function fileStemAndExt(name) {
    const ext = writerExtension(name);
    if (ext === '')
        return { stem: name, ext: '' };
    return { stem: name.slice(0, -ext.length), ext: ext.slice(1) };
}
function countCharacters(content) {
    return [...content.replace(/\s/gu, '')].length;
}
function cursorLineCol(content, caret) {
    const before = content.slice(0, Math.max(0, Math.min(caret, content.length)));
    const lines = before.split('\n');
    const last = lines[lines.length - 1] ?? '';
    return { line: lines.length, col: [...last].length + 1 };
}
function isChatComposerTarget(target) {
    if (!(target instanceof HTMLElement))
        return false;
    if (target.closest('[data-workbench="writer"]') !== null)
        return false;
    const tag = target.tagName;
    if (tag !== 'TEXTAREA' && tag !== 'INPUT' && !target.isContentEditable)
        return false;
    return true;
}
function healthCopy(health, t) {
    if (health === 'loading')
        return t('healthLoading');
    if (health === 'partial')
        return t('healthPartial');
    if (health === 'failed')
        return t('healthFailed');
    return t('healthOk');
}
/**
 * Split a filename stem around the first case-insensitive query occurrence.
 * @param stem - the displayed filename stem.
 * @param query - the active search text.
 * @returns the stem with the matched run wrapped in a mark.
 */
function highlightStem(stem, query) {
    const needle = query.trim().toLowerCase();
    if (needle === '')
        return stem;
    const at = stem.toLowerCase().indexOf(needle);
    if (at < 0)
        return stem;
    return (_jsxs(_Fragment, { children: [stem.slice(0, at), _jsx("mark", { children: stem.slice(at, at + needle.length) }), stem.slice(at + needle.length)] }));
}
/**
 * The parent directory of a hit path, for the inline location hint.
 * @param path - the hit's workspace-relative path.
 * @returns the directory part, or '' for root-level hits.
 */
function searchHitDir(path) {
    const cut = path.lastIndexOf('/');
    return cut <= 0 ? '' : path.slice(0, cut);
}
function TreeNodes({ nodes, depth, expanded, selected, listings, onToggle, onSelect, onLoadMore, onRetry, t, }) {
    return nodes.map((node) => {
        const indent = { '--writer-indent': `${String(depth * 12)}px` };
        const childIndent = { '--writer-indent': `${String((depth + 1) * 12)}px` };
        if (node.kind === 'file') {
            const { stem, ext } = fileStemAndExt(node.name);
            return _jsx("li", { children: _jsxs("button", { type: "button", className: node.editable ? 'writer-tree-file' : 'writer-tree-file writer-tree-file-disabled', style: indent, title: node.editable ? node.path : t('notEditable').replace('{path}', node.path), "aria-label": node.name, "aria-current": node.path === selected ? 'true' : undefined, disabled: !node.editable, onClick: () => { if (node.editable)
                        onSelect(node.path); }, children: [_jsx(FileTypeIcon, { kind: classifyFileType(node.name), size: 16, className: "writer-tree-kind" }), _jsx("span", { className: "writer-tree-label", "aria-hidden": "true", children: stem || node.name }), ext !== '' && ext !== 'md' && _jsx("span", { className: "writer-tree-ext", "aria-hidden": "true", children: ext })] }) }, node.path);
        }
        const key = node.path;
        const open = key in expanded ? expanded[key] === true : defaultWriterTreeExpanded(key, selected);
        const listing = listings[key];
        const total = listing === undefined ? node.children.length : visibleDirectoryEntries(listing.entries).length;
        const hasMore = listing !== undefined && node.shown < total;
        const apiTruncated = (listing?.truncated ?? node.truncated) && node.shown >= total && total > 0;
        const folderName = node.name === '' || node.name === '.' ? t('workspaceBook') : node.name;
        return _jsxs("li", { className: "writer-tree-folder", children: [_jsxs("button", { type: "button", className: "writer-tree-toggle", style: indent, "aria-expanded": open, "aria-label": folderName, onClick: () => { onToggle(key, !open); }, children: [open
                            ? _jsx(IconFolderOpenRegular, { className: "writer-tree-kind", "aria-hidden": "true" })
                            : _jsx(IconFolderCloseRegular, { className: "writer-tree-kind", "aria-hidden": "true" }), _jsx("span", { className: "writer-tree-label", children: folderName })] }), open && _jsxs("ul", { children: [node.loading && _jsx("li", { className: "writer-tree-status", style: childIndent, children: t('loading') }), node.loadError !== undefined && !node.loading && _jsx("li", { children: _jsx("button", { type: "button", className: "writer-tree-status-action", style: childIndent, onClick: () => { onRetry(node.path); }, children: t('loadDirError') }) }), node.loaded && !node.loading && node.children.length === 0 && node.loadError === undefined && (_jsx("li", { className: "writer-tree-status", style: childIndent, children: t('emptyDir') })), TreeNodes({
                            nodes: node.children,
                            depth: depth + 1,
                            expanded,
                            selected,
                            listings,
                            onToggle,
                            onSelect,
                            onLoadMore,
                            onRetry,
                            t,
                        }), hasMore && !node.loading && _jsx("li", { children: _jsx("button", { type: "button", className: "writer-tree-status-action", style: childIndent, onClick: () => { onLoadMore(node.path); }, children: t('loadMore') }) }), apiTruncated && _jsx("li", { className: "writer-tree-status", style: childIndent, children: t('truncated') })] })] }, key === '' ? 'workspace-root' : key);
    });
}
function SearchHits({ hits, query, selected, onSelect, t, }) {
    return _jsx("ul", { className: "writer-tree writer-search-hits", children: hits.map((hit) => {
            const { stem, ext } = fileStemAndExt(hit.name);
            const dir = searchHitDir(hit.path);
            return _jsx("li", { children: _jsxs("button", { type: "button", className: hit.editable ? 'writer-tree-file' : 'writer-tree-file writer-tree-file-disabled', title: hit.editable ? hit.path : t('notEditable').replace('{path}', hit.path), "aria-label": hit.name, "aria-current": hit.path === selected ? 'true' : undefined, disabled: !hit.editable, onClick: () => { if (hit.editable)
                        onSelect(hit.path); }, children: [_jsx(FileTypeIcon, { kind: classifyFileType(hit.name), size: 16, className: "writer-tree-kind" }), _jsx("span", { className: "writer-tree-label", "aria-hidden": "true", children: highlightStem(stem || hit.name, query) }), ext !== '' && ext !== 'md' && _jsx("span", { className: "writer-tree-ext", "aria-hidden": "true", children: ext }), dir !== '' && _jsx("span", { className: "writer-search-dir", "aria-hidden": "true", children: dir })] }) }, hit.path);
        }) });
}
/**
 * The writing sidebar body for one session.
 * @param props - session, workspace root, remote, and copy.
 * @returns the desk.
 */
export function WriterDesk({ sessionId, cwd, remote, t, visible }) {
    const [viewPick, setViewPick] = useState(undefined);
    const [libraries, setLibraries] = useState([]);
    const [projects, setProjects] = useState([]);
    const [listings, setListings] = useState({});
    const [active, setActive] = useState(undefined);
    const [draft, setDraft] = useState('');
    const [saved, setSaved] = useState('');
    const [version, setVersion] = useState(undefined);
    const [eol, setEol] = useState('\n');
    const [notice, setNotice] = useState(undefined);
    const [conflict, setConflict] = useState(false);
    const [conflictOpen, setConflictOpen] = useState(false);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [busy, setBusy] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [expanded, setExpanded] = useState({});
    const [scanErrors, setScanErrors] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [scanHardFailed, setScanHardFailed] = useState(false);
    const [filter, setFilter] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState(undefined);
    const [mode, setMode] = useState('edit');
    const [caret, setCaret] = useState(0);
    const searchRef = useRef(null);
    const editorRef = useRef(null);
    const saveRef = useRef(() => { });
    const searchSeq = useRef(0);
    const [railChrome, setRailChrome] = useState(() => readRailChrome());
    const [deskWidth, setDeskWidth] = useState(0);
    const deskRef = useRef(null);
    const railDrag = useRef(undefined);
    // Prefer libraries when any exist; otherwise projects (both empty → projects).
    // Honor an explicit tab pick even when that side's count is 0 so empty states stay switchable.
    const preferredView = libraries.length > 0 ? 'libraries' : 'projects';
    const view = viewPick ?? preferredView;
    const roots = view === 'libraries' ? libraries : projects;
    const rootPathsKey = roots.map(node => node.path).join('\0');
    const dirty = draft !== saved;
    const query = filter.trim();
    const showSearch = query !== '';
    const patchDirectory = (path, update) => {
        setLibraries(nodes => updateDirectoryNode(nodes, path, update));
        setProjects(nodes => updateDirectoryNode(nodes, path, update));
    };
    useEffect(() => {
        if (!visible)
            return undefined;
        const controller = new AbortController();
        const signal = controller.signal;
        setNotice(undefined);
        setScanning(true);
        setScanHardFailed(false);
        void (async () => {
            try {
                const scan = await scanWriterWorkspace(relative => readDir(remote, sessionId, cwd, relative, signal).then(page => page.entries));
                if (signal.aborted)
                    return;
                setLibraries(scan.libraries.map(rootToDirectoryNode));
                setProjects(scan.projects.map(rootToDirectoryNode));
                setScanErrors(scan.scanErrors);
                setScanHardFailed(false);
                setListings({});
                setExpanded({});
            }
            catch (error) {
                if (signal.aborted)
                    return;
                setLibraries([]);
                setProjects([]);
                setScanErrors([]);
                setScanHardFailed(true);
                setNotice(error instanceof Error && error.message !== 'load' ? error.message : t('loadError'));
            }
            finally {
                if (!signal.aborted)
                    setScanning(false);
            }
        })();
        return () => { controller.abort(); };
    }, [visible, sessionId, cwd, remote, reloadKey, t]);
    const loadDirectory = (path, force = false) => {
        const cached = force ? undefined : listings[path];
        if (cached !== undefined) {
            patchDirectory(path, (node) => {
                const built = buildLoadedChildren(path, cached.entries, Math.max(node.shown, DIRECTORY_PAGE_SIZE), cached.truncated);
                const { loadError: _drop, ...rest } = node;
                return { ...rest, ...built, loaded: true, loading: false };
            });
            return;
        }
        if (force) {
            setListings((current) => {
                const next = { ...current };
                delete next[path];
                return next;
            });
        }
        patchDirectory(path, (node) => {
            const { loadError: _drop, ...rest } = node;
            return { ...rest, loading: true };
        });
        void readDir(remote, sessionId, cwd, path, new AbortController().signal).then((page) => {
            setListings(current => ({ ...current, [path]: { entries: page.entries, truncated: page.truncated } }));
            patchDirectory(path, (node) => {
                const built = buildLoadedChildren(path, page.entries, DIRECTORY_PAGE_SIZE, page.truncated);
                const { loadError: _drop, ...rest } = node;
                return { ...rest, ...built, loaded: true, loading: false };
            });
        }).catch((error) => {
            patchDirectory(path, node => ({
                ...node,
                loading: false,
                loadError: error instanceof Error ? error.message : t('loadError'),
            }));
        });
    };
    // Only the chain holding the open file auto-opens and lazy-loads; respect explicit collapse.
    useEffect(() => {
        if (!visible || showSearch)
            return;
        for (const root of roots) {
            if (root.kind !== 'directory')
                continue;
            const key = root.path;
            const open = key in expanded ? expanded[key] === true : defaultWriterTreeExpanded(key, active);
            if (!open || root.loaded || root.loading || root.loadError !== undefined)
                continue;
            loadDirectory(key);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional narrow deps for root lazy-open
    }, [visible, roots, expanded, active, listings, showSearch]);
    const onToggle = (path, open) => {
        setExpanded(current => ({ ...current, [path]: open }));
        if (open)
            loadDirectory(path);
    };
    const onLoadMore = (path) => {
        const cached = listings[path];
        if (cached === undefined)
            return;
        patchDirectory(path, (node) => {
            const built = buildLoadedChildren(path, cached.entries, node.shown + DIRECTORY_PAGE_SIZE, cached.truncated);
            return { ...node, ...built, loaded: true, loading: false };
        });
    };
    const confirmDiscard = () => !dirty || window.confirm(t('confirmDiscard'));
    const selectFile = (path) => {
        if (path === active)
            return;
        if (!confirmDiscard())
            return;
        setActive(path);
    };
    const rescan = () => {
        if (!confirmDiscard())
            return;
        setActive(undefined);
        setDraft('');
        setSaved('');
        setVersion(undefined);
        setEol('\n');
        setReloadKey(value => value + 1);
    };
    useEffect(() => {
        if (!visible || active === undefined)
            return undefined;
        const controller = new AbortController();
        const path = joinCwd(cwd, active);
        setConflict(false);
        setConflictOpen(false);
        setNotice(undefined);
        void readWorkspaceText(remote, sessionId, path, controller.signal).then((result) => {
            if (controller.signal.aborted)
                return;
            if (!result.ok) {
                setNotice(remoteMessage(result.error, t('loadError')));
                return;
            }
            const detected = detectEol(result.value.text);
            const text = normalizeEol(result.value.text);
            setEol(detected);
            setDraft(text);
            setSaved(text);
            setVersion(result.value.version);
            setCaret(0);
        }).catch((error) => {
            if (!controller.signal.aborted)
                setNotice(error instanceof Error ? error.message : t('loadError'));
        });
        return () => { controller.abort(); };
    }, [visible, active, sessionId, cwd, remote, reloadKey, t]);
    const save = () => {
        if (active === undefined || version === undefined || conflict || draft === saved || busy)
            return;
        const path = active;
        const baseVersion = version;
        const submitted = draft;
        const payloadContent = applyEol(submitted, eol);
        setBusy(true);
        void saveWriterFile(sessionId, path, payloadContent, baseVersion, new AbortController().signal).then(async (response) => {
            const payload = await response.json();
            if (response.status === 412) {
                setConflict(true);
                setConflictOpen(true);
                setNotice(undefined);
                return;
            }
            if (!response.ok) {
                setNotice(payload.error ?? t('saveError'));
                return;
            }
            // Keep dirty if the author typed more while the request was in flight.
            setSaved(submitted);
            setVersion(payload.version);
            setNotice(t('saved'));
            setConflict(false);
        }).catch(() => {
            setNotice(t('saveError'));
        }).finally(() => { setBusy(false); });
    };
    saveRef.current = save;
    // Debounced filename search for the active tab.
    useEffect(() => {
        if (!visible)
            return undefined;
        const trimmed = filter.trim();
        if (trimmed === '') {
            searchSeq.current += 1;
            setSearching(false);
            setSearchResult(undefined);
            return undefined;
        }
        if (trimmed.length > MAX_SEARCH_QUERY_LENGTH) {
            searchSeq.current += 1;
            setSearching(false);
            setSearchResult(undefined);
            setNotice(t('searchQueryTooLong'));
            return undefined;
        }
        setSearching(true);
        const sequence = ++searchSeq.current;
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            const rootPaths = rootPathsKey === ''
                ? []
                : rootPathsKey.split('\0').map(path => (path === '' ? '.' : path));
            void searchWriterFilenames(rootPaths, trimmed, relative => readDir(remote, sessionId, cwd, relative === '.' ? '' : relative, controller.signal), controller.signal).then((result) => {
                if (sequence !== searchSeq.current || controller.signal.aborted)
                    return;
                setSearchResult(result);
                setSearching(false);
            }).catch((error) => {
                if (sequence !== searchSeq.current || controller.signal.aborted)
                    return;
                setSearching(false);
                setSearchResult(undefined);
                setNotice(error instanceof Error ? error.message : t('loadError'));
            });
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [visible, filter, view, rootPathsKey, remote, sessionId, cwd, t]);
    useEffect(() => {
        if (!visible)
            return undefined;
        const onKey = (event) => {
            const modifier = event.metaKey || event.ctrlKey;
            if (!modifier)
                return;
            const key = event.key.toLocaleLowerCase();
            if (key === 's') {
                event.preventDefault();
                saveRef.current();
                return;
            }
            if (key === 'k') {
                if (isChatComposerTarget(event.target))
                    return;
                event.preventDefault();
                const input = searchRef.current;
                if (input === null)
                    return;
                input.focus();
                input.select();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('keydown', onKey); };
    }, [visible]);
    const dirtyState = busy ? 'saving' : dirty ? 'dirty' : 'saved';
    const dirtyText = busy ? t('dirtySaving') : dirty ? t('dirtyPending') : t('dirtySaved');
    const { line, col } = cursorLineCol(draft, caret);
    const truncationText = searchResult === undefined
        ? ''
        : writerSearchTruncationMessage(searchResult.truncation, searchResult.limits, searchResult.scanErrors);
    const shortName = workspaceShortName(cwd);
    const health = writerScanHealth({
        scanning,
        hardFailed: scanHardFailed,
        libraryCount: libraries.length,
        projectCount: projects.length,
        scanErrors,
    });
    const healthText = healthCopy(health, t);
    const loadedFileCount = countLoadedFiles(libraries) + countLoadedFiles(projects);
    const filesText = loadedFilesLabel(loadedFileCount, t('filesOnDemand'), t('filesLoaded'));
    const countsAria = t('countsSummary')
        .replace('{libraries}', String(libraries.length))
        .replace('{projects}', String(projects.length))
        .replace('{files}', filesText);
    const connectionTitle = `${t('localWorkspace')} · ${healthText}`;
    const connectionLabel = health === 'ok' || health === 'loading' ? t('localOnly') : healthText;
    const crumbs = active === undefined ? [] : breadcrumbSegments(active);
    const byteLabel = formatBytes(editorByteSize(draft, eol));
    const extLabel = active === undefined ? '' : fileExtensionLabel(active);
    const encodingText = t('statusEncoding').replace('{eol}', eolLabel(eol));
    const tabPanelId = 'writer-workspace-panel';
    const librariesTabId = 'writer-tab-libraries';
    const projectsTabId = 'writer-tab-projects';
    const railId = 'writer-rail';
    useEffect(() => {
        const node = deskRef.current;
        if (node === null)
            return;
        const apply = (width) => {
            setDeskWidth(current => (current === width ? current : width));
        };
        apply(node.clientWidth);
        if (typeof ResizeObserver === 'undefined')
            return;
        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry === undefined)
                return;
            apply(entry.contentRect.width);
        });
        observer.observe(node);
        return () => { observer.disconnect(); };
    }, []);
    const railCollapsed = railChrome.collapsed;
    const railWidth = railChrome.width;
    const fittedRailWidth = railCollapsed ? railWidth : fitRailWidth(railWidth, deskWidth);
    const persistRail = (next) => {
        setRailChrome(next);
        writeRailChrome(next);
    };
    const toggleRail = () => {
        persistRail(setRailCollapsed(railChrome));
    };
    const onRailResizePointerDown = (event) => {
        if (event.button !== 0 || railCollapsed)
            return;
        event.preventDefault();
        railDrag.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startWidth: railWidth,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onRailResizePointerMove = (event) => {
        const drag = railDrag.current;
        if (drag === undefined || drag.pointerId !== event.pointerId)
            return;
        const delta = event.clientX - drag.startX;
        const nextWidth = clampRailWidth(drag.startWidth + delta);
        setRailChrome(current => setRailWidth(current, nextWidth));
    };
    const endRailResize = (event) => {
        const drag = railDrag.current;
        if (drag === undefined || drag.pointerId !== event.pointerId)
            return;
        railDrag.current = undefined;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setRailChrome((current) => {
            writeRailChrome(current);
            return current;
        });
    };
    const onRailResizeKeyDown = (event) => {
        if (railCollapsed)
            return;
        const step = event.shiftKey ? 32 : 16;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            persistRail(setRailWidth(railChrome, railWidth - step));
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            persistRail(setRailWidth(railChrome, railWidth + step));
        }
        else if (event.key === 'Home') {
            event.preventDefault();
            persistRail(setRailWidth(railChrome, WRITER_RAIL_MIN_WIDTH));
        }
        else if (event.key === 'End') {
            event.preventDefault();
            persistRail(setRailWidth(railChrome, WRITER_RAIL_MAX_WIDTH));
        }
        else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleRail();
        }
    };
    const deskStyle = {
        ['--writer-rail-width']: `${String(fittedRailWidth)}px`,
    };
    return _jsxs("div", { ref: deskRef, className: "writer-desk", "data-workbench": "writer", "data-rail-collapsed": railCollapsed ? 'true' : undefined, style: deskStyle, children: [_jsxs("aside", { id: railId, className: "writer-rail", "aria-label": t('tree'), hidden: railCollapsed || undefined, children: [_jsxs("nav", { className: "writer-tabs", "aria-label": t('workspaceTabs'), role: "tablist", children: [_jsxs("button", { type: "button", id: librariesTabId, role: "tab", className: "writer-tab", "aria-selected": view === 'libraries', "aria-controls": tabPanelId, onClick: () => { setViewPick('libraries'); }, children: [_jsx("span", { children: t('libraries') }), libraries.length > 0 && _jsx("b", { className: "writer-badge", children: libraries.length })] }), _jsxs("button", { type: "button", id: projectsTabId, role: "tab", className: "writer-tab", "aria-selected": view === 'projects', "aria-controls": tabPanelId, onClick: () => { setViewPick('projects'); }, children: [_jsx("span", { children: t('projects') }), projects.length > 0 && _jsx("b", { className: "writer-badge", children: projects.length })] })] }), _jsx("div", { className: "writer-search-slot", role: "search", children: _jsx("input", { ref: searchRef, type: "search", value: filter, placeholder: t('search'), "aria-label": t('searchLabel'), onChange: event => { setFilter(event.target.value); setNotice(undefined); }, onKeyDown: (event) => {
                                if (event.key === 'Escape') {
                                    event.preventDefault();
                                    setFilter('');
                                    setSearchResult(undefined);
                                    setSearching(false);
                                }
                            } }) }), _jsxs("div", { className: "writer-tree-panel", id: tabPanelId, role: "tabpanel", "aria-labelledby": view === 'libraries' ? librariesTabId : projectsTabId, "aria-busy": scanning || undefined, children: [health === 'failed' && !showSearch && _jsxs("div", { className: "writer-scan-banner", role: "alert", children: [_jsx("p", { children: t('scanFailed') }), _jsx("button", { type: "button", onClick: rescan, children: t('retryScan') })] }), health === 'partial' && !showSearch && _jsxs("div", { className: "writer-scan-banner writer-scan-banner-warn", role: "status", children: [_jsx("p", { children: t('scanPartial') }), _jsx("button", { type: "button", onClick: rescan, children: t('retryScan') })] }), scanning && !showSearch ? _jsx("p", { className: "writer-empty", children: t('healthLoading') })
                                : showSearch ? (searching ? _jsx("p", { className: "writer-empty", children: t('searching').replace('{query}', query) })
                                    : searchResult !== undefined && searchResult.results.length === 0 ? _jsxs(_Fragment, { children: [_jsx("p", { className: "writer-empty", children: (searchResult.truncated ? t('searchIncomplete') : t('searchEmpty')).replace('{query}', query) }), truncationText !== '' && _jsx("p", { className: "writer-muted", role: "status", children: truncationText })] })
                                        : searchResult !== undefined ? _jsxs(_Fragment, { children: [_jsx(SearchHits, { hits: searchResult.results, query: query, selected: active, onSelect: selectFile, t: t }), truncationText !== '' && _jsx("p", { className: "writer-muted", role: "status", children: truncationText })] })
                                            : null) : health === 'failed' ? null
                                    : roots.length === 0 ? _jsx("p", { className: "writer-empty", children: view === 'libraries' ? t('emptyLibraries') : t('emptyProjects') }) : _jsx("nav", { "aria-label": t('tree'), children: _jsx("ul", { className: "writer-tree", children: TreeNodes({
                                                nodes: roots,
                                                depth: 0,
                                                expanded,
                                                selected: active,
                                                listings,
                                                onToggle,
                                                onSelect: selectFile,
                                                onLoadMore,
                                                onRetry: path => { loadDirectory(path, true); },
                                                t,
                                            }) }) })] }), _jsxs("footer", { className: "writer-rail-note", children: [_jsx("span", { className: "writer-rail-dot", "data-health": health, "aria-hidden": "true" }), _jsx("p", { title: `${cwd} · ${t('localWorkspace')}`, children: health === 'ok' || health === 'loading' ? t('localWorkspace') : `${healthText} · ${t('localWorkspace')}` })] })] }), _jsx("div", { className: "writer-rail-resize", role: "separator", tabIndex: railCollapsed ? -1 : 0, "aria-orientation": "vertical", "aria-label": t('resizeRail'), "aria-valuemin": WRITER_RAIL_MIN_WIDTH, "aria-valuemax": WRITER_RAIL_MAX_WIDTH, "aria-valuenow": railWidth, "aria-controls": railId, hidden: railCollapsed || undefined, onPointerDown: onRailResizePointerDown, onPointerMove: onRailResizePointerMove, onPointerUp: endRailResize, onPointerCancel: endRailResize, onDoubleClick: (event) => {
                    event.preventDefault();
                    toggleRail();
                }, onKeyDown: onRailResizeKeyDown }), _jsxs("section", { className: "writer-stage", children: [_jsxs("header", { className: "writer-stage-heading", children: [_jsx("button", { type: "button", className: "writer-rail-toggle", "aria-expanded": !railCollapsed, "aria-controls": railId, "aria-label": railCollapsed ? t('expandRail') : t('collapseRail'), title: railCollapsed ? t('expandRail') : t('collapseRail'), onClick: toggleRail, children: railCollapsed ? '›' : '‹' }), _jsxs("div", { className: "writer-masthead", "aria-label": t('masthead'), children: [_jsx("span", { className: "writer-workspace", title: cwd, children: shortName }), _jsxs("div", { className: "writer-masthead-actions", children: [_jsxs("div", { className: "writer-counts", title: t('filesCountHint'), "aria-label": countsAria, children: [_jsxs("span", { className: "writer-count", children: [_jsx("b", { children: libraries.length }), " ", t('countLibraries')] }), _jsxs("span", { className: "writer-count", children: [_jsx("b", { children: projects.length }), " ", t('countProjects')] }), _jsxs("span", { className: "writer-count", children: [_jsx("b", { children: filesText }), " ", t('countFiles')] })] }), _jsxs("span", { className: "writer-connection", "data-health": health, role: "status", title: connectionTitle, children: [_jsx("span", { className: "writer-status-dot", "aria-hidden": "true" }), _jsx("span", { className: "writer-connection-label", children: connectionLabel })] })] })] }), _jsx("button", { type: "button", className: "writer-reload", title: t('reload'), "aria-label": t('reload'), onClick: rescan, children: _jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("path", { d: "M20 6v5h-5" }), _jsx("path", { d: "M18.2 15.7A7 7 0 1 1 19 9.3L20 11" })] }) })] }), _jsxs("main", { className: "writer-editor", children: [active === undefined && notice === undefined && _jsx("p", { className: "writer-empty", children: t('emptyHelp') }), notice !== undefined && _jsx("p", { role: "alert", className: "writer-alert", children: notice }), conflictOpen && _jsx(Modal, { open: true, onClose: () => { setConflictOpen(false); }, title: t('conflictTitle'), description: t('conflictBody'), closeLabel: t('conflictClose'), footer: (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => { setConflictOpen(false); }, children: t('conflictKeep') }), _jsx("button", { type: "button", className: "writer-conflict-reload", onClick: () => {
                                                setConflictOpen(false);
                                                setConflict(false);
                                                setReloadKey(value => value + 1);
                                            }, children: t('conflictReload') })] })) }), active !== undefined && _jsxs(_Fragment, { children: [_jsxs("header", { className: "writer-editor-toolbar", children: [_jsxs("div", { className: "writer-document-identity", children: [_jsx("nav", { className: "writer-breadcrumbs", "aria-label": t('breadcrumbs'), children: crumbs.map((part, index) => (_jsxs("span", { children: [index > 0 && _jsx("i", { "aria-hidden": "true", children: " / " }), _jsx("span", { children: part })] }, `${String(index)}-${part}`))) }), _jsx("h2", { className: "writer-document-title", title: active, children: crumbs[crumbs.length - 1] ?? active })] }), _jsxs("div", { className: "writer-editor-actions", children: [_jsx("span", { className: "writer-dirty", "data-state": dirtyState, children: dirtyText }), _jsx("button", { type: "button", className: "writer-line-numbers-toggle", title: t('toggleLineNumbers'), "aria-label": t('toggleLineNumbers'), "aria-pressed": showLineNumbers, onClick: () => { setShowLineNumbers(value => !value); }, children: "#" }), _jsxs("div", { className: "writer-mode-switch", role: "group", "aria-label": t('editor'), children: [_jsx("button", { type: "button", "aria-pressed": mode === 'edit', onClick: () => { setMode('edit'); }, children: t('modeEdit') }), _jsx("button", { type: "button", "aria-pressed": mode === 'preview', onClick: () => { setMode('preview'); }, children: t('modePreview') })] }), _jsx("button", { type: "button", disabled: busy || conflict || version === undefined || draft === saved, onClick: save, children: t('save') })] })] }), mode === 'edit' ? (_jsxs("div", { className: showLineNumbers ? 'writer-editor-body show-line-numbers' : 'writer-editor-body', children: [_jsx(WriterLineNumbers, { text: draft, caret: caret, show: showLineNumbers, textareaRef: editorRef }), _jsx("textarea", { ref: editorRef, "aria-label": active, value: draft, onChange: (event) => {
                                                    setDraft(event.target.value);
                                                    setCaret(event.target.selectionStart);
                                                    setNotice(undefined);
                                                }, onSelect: event => { setCaret(event.currentTarget.selectionStart); }, onKeyUp: event => { setCaret(event.currentTarget.selectionStart); }, onClick: event => { setCaret(event.currentTarget.selectionStart); } })] })) : (_jsx("article", { className: "writer-preview", "aria-label": `${active} ${t('modePreview')}`, dangerouslySetInnerHTML: { __html: markdownToSafeHtml(draft) } })), _jsxs("footer", { className: "writer-status", children: [_jsx("span", { children: t('statusCursor').replace('{line}', String(line)).replace('{col}', String(col)) }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: "writer-document-meta", children: byteLabel }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { children: t('statusChars').replace('{n}', String(countCharacters(draft))) }), extLabel !== '' && _jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { children: extLabel })] }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { children: encodingText })] })] })] })] })] });
}
//# sourceMappingURL=desk.js.map