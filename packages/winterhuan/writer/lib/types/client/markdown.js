/** Safe Markdown → HTML for the writing preview (Dashboard-aligned, no deps). */
function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
function inlineMarkdown(value) {
    return value
        .replace(/`([^`]+)`/gu, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/gu, '<strong>$1</strong>')
        .replace(/__([^_]+)__/gu, '<strong>$1</strong>')
        .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/gu, '<em>$1</em>');
}
function tableCells(line) {
    const trimmed = line.trim();
    const row = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
    const content = row.endsWith('|') && !row.endsWith('\\|') ? row.slice(0, -1) : row;
    const cells = [''];
    let codeFenceLength = 0;
    for (let i = 0; i < content.length; i += 1) {
        const character = content[i] ?? '';
        if (character === '`') {
            let fenceLength = 1;
            while (content[i + fenceLength] === '`')
                fenceLength += 1;
            if (codeFenceLength === 0)
                codeFenceLength = fenceLength;
            else if (codeFenceLength === fenceLength)
                codeFenceLength = 0;
            cells[cells.length - 1] += '`'.repeat(fenceLength);
            i += fenceLength - 1;
        }
        else if (character === '\\' && content[i + 1] === '|') {
            cells[cells.length - 1] += '|';
            i += 1;
        }
        else if (character === '|' && codeFenceLength === 0) {
            cells.push('');
        }
        else {
            cells[cells.length - 1] += character;
        }
    }
    return cells.map(cell => cell.trim());
}
function hasTablePipe(line) {
    return tableCells(line).length > 1 || line.trim().startsWith('|') || line.trim().endsWith('|');
}
function tableAlignments(line) {
    if (!hasTablePipe(line))
        return null;
    const cells = tableCells(line);
    const alignments = [];
    for (const cell of cells) {
        const separator = /^(:)?(-{3,})(:)?$/u.exec(cell);
        if (separator === null)
            return null;
        alignments.push(separator[1] && separator[3] ? 'center' : separator[1] ? 'left' : separator[3] ? 'right' : undefined);
    }
    return alignments;
}
/**
 * Convert Markdown to escaped HTML suitable for `dangerouslySetInnerHTML`.
 * Supports headings, lists, GFM tables, code, horizontal rules, and quotes.
 * @param markdown - editor text (LF).
 * @returns HTML string with no unescaped user markup.
 */
export function markdownToSafeHtml(markdown) {
    const lines = escapeHtml(markdown).replaceAll('\r\n', '\n').split('\n');
    const output = [];
    let inCode = false;
    const codeLines = [];
    let codeStartLine = 1;
    let listType = null;
    const closeList = () => {
        if (listType !== null)
            output.push(`</${listType}>`);
        listType = null;
    };
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i] ?? '';
        const lineNum = i + 1;
        if (line.trim().startsWith('```')) {
            closeList();
            if (inCode) {
                output.push(`<div class="writer-preview-code" data-line="${String(codeStartLine)}"><pre><code>${codeLines.join('\n')}</code></pre></div>`);
                codeLines.length = 0;
            }
            else {
                codeStartLine = lineNum;
            }
            inCode = !inCode;
            continue;
        }
        if (inCode) {
            codeLines.push(line);
            continue;
        }
        const alignments = lines[i + 1] === undefined ? null : tableAlignments(lines[i + 1] ?? '');
        if (alignments !== null && hasTablePipe(line)) {
            closeList();
            const header = tableCells(line);
            const renderCell = (cell, index, tag) => {
                const alignment = alignments[index];
                const align = alignment === undefined ? '' : ` style="text-align:${alignment}"`;
                const scope = tag === 'th' ? ' scope="col"' : '';
                return `<${tag}${scope}${align}>${inlineMarkdown(cell)}</${tag}>`;
            };
            output.push(`<div class="writer-preview-table" data-line="${String(lineNum)}" tabindex="0"><table><thead><tr data-line="${String(lineNum)}">${alignments.map((_, index) => renderCell(header[index] ?? '', index, 'th')).join('')}</tr></thead><tbody>`);
            let rowIndex = i + 2;
            while (rowIndex < lines.length && (lines[rowIndex] ?? '').trim() !== '' && hasTablePipe(lines[rowIndex] ?? '')) {
                const cells = tableCells(lines[rowIndex] ?? '');
                output.push(`<tr data-line="${String(rowIndex + 1)}">${alignments.map((_, index) => renderCell(cells[index] ?? '', index, 'td')).join('')}</tr>`);
                rowIndex += 1;
            }
            output.push('</tbody></table></div>');
            i = rowIndex - 1;
            continue;
        }
        const heading = /^(#{1,4})\s+(.+)$/u.exec(line);
        const unordered = /^\s*[-*+]\s+(.+)$/u.exec(line);
        const ordered = /^\s*\d+[.)]\s+(.+)$/u.exec(line);
        if (heading !== null) {
            closeList();
            const level = heading[1]?.length ?? 1;
            output.push(`<h${String(level)} data-line="${String(lineNum)}">${inlineMarkdown(heading[2] ?? '')}</h${String(level)}>`);
        }
        else if (unordered !== null || ordered !== null) {
            const nextType = unordered !== null ? 'ul' : 'ol';
            if (listType !== nextType) {
                closeList();
                listType = nextType;
                output.push(`<${listType}>`);
            }
            const body = (unordered ?? ordered)?.[1] ?? '';
            output.push(`<li data-line="${String(lineNum)}">${inlineMarkdown(body)}</li>`);
        }
        else if (/^\s*([-*_])(?:\s*\1){2,}\s*$/u.test(line)) {
            closeList();
            output.push(`<hr data-line="${String(lineNum)}">`);
        }
        else if (line.startsWith('&gt; ')) {
            closeList();
            output.push(`<blockquote data-line="${String(lineNum)}">${inlineMarkdown(line.slice(5))}</blockquote>`);
        }
        else if (line.trim() !== '') {
            closeList();
            output.push(`<p data-line="${String(lineNum)}">${inlineMarkdown(line)}</p>`);
        }
        else {
            closeList();
        }
    }
    if (inCode) {
        output.push(`<div class="writer-preview-code" data-line="${String(codeStartLine)}"><pre><code>${codeLines.join('\n')}</code></pre></div>`);
    }
    closeList();
    return output.join('');
}
//# sourceMappingURL=markdown.js.map