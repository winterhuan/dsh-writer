const LONG_MARKERS = new Set(['正文', '大纲', '设定', '追踪']);
const SHORT_COMPANIONS = new Set(['小节大纲.md', '设定.md']);
const IGNORED = new Set(['拆文库', '扫榜', '.git', '.agents', '.writer', 'node_modules']);
export async function discoverWriterBooks(list) {
    const candidates = [];
    async function walk(path, depth) {
        if (depth > 3)
            return;
        let entries;
        try {
            entries = await list(path);
        }
        catch {
            return;
        }
        const directories = new Set(entries.filter(entry => entry.type === 'directory').map(entry => entry.name));
        const files = new Set(entries.filter(entry => entry.type === 'file').map(entry => entry.name));
        if ([...LONG_MARKERS].some(name => directories.has(name))) {
            const title = path.split('/').pop() ?? path;
            candidates.push({ path, title, form: 'long' });
            return;
        }
        if (files.has('正文.md') && [...SHORT_COMPANIONS].some(name => files.has(name))) {
            const title = path.split('/').pop() ?? path;
            candidates.push({ path, title, form: 'short' });
            return;
        }
        if (depth === 3)
            return;
        for (const entry of entries) {
            if (entry.type !== 'directory' || IGNORED.has(entry.name) || entry.name.startsWith('.'))
                continue;
            await walk(path ? `${path}/${entry.name}` : entry.name, depth + 1);
        }
    }
    await walk('', 0);
    return candidates;
}
//# sourceMappingURL=workbench-discovery.js.map