/** Read chapter progress from the book's authoritative files and versioned reports. */
import { safeRelative } from "../editable.js";
function object(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        throw new Error('invalid record');
    return value;
}
function text(value) {
    if (typeof value !== 'string')
        throw new Error('expected text');
    return value;
}
function integer(value) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
        throw new Error('expected non-negative integer');
    return value;
}
function strings(value) {
    if (!Array.isArray(value))
        throw new Error('expected text list');
    return value.map(text);
}
function relative(value) {
    const path = text(value);
    if (!safeRelative(path) || /^[a-z][a-z\d+.-]*:/iu.test(path))
        throw new Error('expected book-relative path');
    return path;
}
function parse(source, path) {
    try {
        return object(JSON.parse(source));
    }
    catch {
        throw new Error(path);
    }
}
/**
 * Compute the raw UTF-8 digest used by the Python chapter and review scripts.
 * @param value - decoded UTF-8 file, preserving its original line endings.
 * @returns lowercase SHA-256.
 */
export async function manuscriptDigest(value) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
/**
 * Resolve a selected manuscript's chapter number; short stories return null.
 * @param path - book-relative selected file.
 * @returns chapter number, null for 正文.md, or undefined for other files.
 */
export function selectedChapter(path) {
    if (path === '正文.md')
        return null;
    if (!path.startsWith('正文/'))
        return undefined;
    const match = /(?:^|\/)第0*(\d+)章[^/]*\.md$/u.exec(path);
    return match === null ? undefined : Number(match[1]);
}
/**
 * Load current progress and the selected chapter's reports. Missing reports are normal;
 * malformed or inaccessible records reject with the owning path rather than imply a pass.
 * @param files - book-scoped reads and directory listings.
 * @param selected - selected chapter; absent selects the next uncommitted chapter.
 * @returns one bounded chapter snapshot, without mutating project files.
 */
export async function readBookStatus(files, selected) {
    const statePath = '追踪/_tracking-state.json';
    const source = await files.read(statePath);
    let title = '';
    let lastChapter;
    let commitments = [];
    if (source !== undefined) {
        try {
            const state = parse(source, statePath);
            if (state.schema_version !== 4)
                throw new Error('unsupported tracking schema');
            title = text(state.book_title);
            lastChapter = integer(state.last_committed_chapter);
            commitments = strings(object(state.context).next_chapter_commitments);
        }
        catch {
            throw new Error(statePath);
        }
    }
    const chapter = selected !== undefined ? selected : lastChapter === undefined ? null : lastChapter + 1;
    const stem = chapter === null ? '正文' : `第${String(chapter).padStart(3, '0')}章`;
    const workDir = `.story/work/${stem}`;
    const [checkSource, reviewSource, workEntries] = await Promise.all([
        chapter === null ? undefined : files.read(`.story/checks/${stem}.json`),
        files.read(`.story/reviews/${stem}.json`),
        files.list(workDir),
    ]);
    let check;
    if (checkSource !== undefined) {
        const path = `.story/checks/${stem}.json`;
        try {
            const record = parse(checkSource, path);
            if (record.schema !== 'story-chapter-check/v1' || record.chapter !== chapter)
                throw new Error('schema');
            const bodyPath = relative(record.body_path);
            const outlinePath = relative(record.outline_path);
            const [body, outline] = await Promise.all([files.read(bodyPath), files.read(outlinePath)]);
            const length = object(record.length);
            const quality = object(record.quality);
            if (!Array.isArray(quality.blocking_findings) || !Array.isArray(quality.tool_errors))
                throw new Error('findings');
            check = {
                path, bodyPath, outlinePath, status: text(record.status), target: integer(length.target), actual: integer(length.actual),
                stale: body === undefined || outline === undefined
                    || await manuscriptDigest(body) !== record.body_sha256 || await manuscriptDigest(outline) !== record.outline_sha256,
                findings: [...quality.blocking_findings, ...quality.tool_errors].map(item => text(object(item).message)),
            };
        }
        catch {
            throw new Error(path);
        }
    }
    let review;
    if (reviewSource !== undefined) {
        const path = `.story/reviews/${stem}.json`;
        try {
            const record = parse(reviewSource, path);
            if (record.schema !== 'story-review/v1' || record.chapter !== chapter || !Array.isArray(record.findings))
                throw new Error('schema');
            const bodyPath = relative(record.body_path);
            const bodyText = text(record.body_text);
            if (await manuscriptDigest(bodyText) !== record.body_sha256)
                throw new Error('snapshot');
            const currentText = await files.read(bodyPath);
            const stale = currentText === undefined || await manuscriptDigest(currentText) !== record.body_sha256;
            const findings = record.findings.map(value => {
                const item = object(value);
                const severity = item.severity;
                if (severity !== 'must' && severity !== 'suggestion' && severity !== 'optional')
                    throw new Error('severity');
                const line = integer(item.line);
                const quote = text(item.quote);
                if (line < 1 || quote === '' || !(bodyText.split(/\r\n|\r|\n/u)[line - 1] ?? '').includes(quote))
                    throw new Error('quote');
                let resolution;
                if (!stale && item.resolution !== null && item.resolution !== undefined) {
                    const resolved = object(item.resolution);
                    if (resolved.body_sha256 !== record.body_sha256 || (resolved.kind !== 'accepted' && resolved.kind !== 'resolved'))
                        throw new Error('resolution');
                    resolution = resolved.kind;
                }
                return { id: text(item.id), severity, line, quote, explanation: text(item.explanation), suggestion: text(item.suggestion), ...(resolution === undefined ? {} : { resolution }) };
            });
            review = { path, stale, summary: text(record.summary), bodyPath, bodyText, currentText: currentText ?? '', findings };
        }
        catch {
            throw new Error(path);
        }
    }
    return {
        title, ...(lastChapter === undefined ? {} : { lastChapter }), chapter, commitments,
        workFiles: workEntries.filter(entry => entry.type === 'file' && safeRelative(entry.name) && !entry.name.includes('/'))
            .slice(0, 20).map(entry => `${workDir}/${entry.name}`),
        ...(check === undefined ? {} : { check }), ...(review === undefined ? {} : { review }),
    };
}
//# sourceMappingURL=book-status.js.map