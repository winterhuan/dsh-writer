/** Book registration and durable native Session associations, without a manuscript mirror. */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import type {} from '@deepseek-ai/dsh-sandbox-policy'
import { SessionId } from '@deepseek-ai/dsh-session'
import { WorkspaceId } from '@deepseek-ai/dsh-workspace'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import z from '@deepseek-ai/schemastery'
import { safeRelative } from './editable.ts'
import { isTrustedWriterRequest } from './request-trust.ts'
import type { WriterBook, WriterBookAction, WriterCatalog } from './workbench-types.ts'
import { discoverWriterBooks } from './workbench-discovery.ts'

const bookSchema = z.object({
  id: z.string().required(), title: z.string().required(), form: z.union(['long', 'short']), workspaceId: z.string().required(), cwd: z.string().required(), path: z.string().required(),
  phases: z.array(z.object({ sessionId: z.string().required(), createdAt: z.string().required() })),
  sessionId: z.union([z.string().required(), z.const(null)]), pendingSessionId: z.union([z.string().required(), z.const(null)]),
})
const catalogSchema = z.object({ version: z.const(1), books: z.array(bookSchema) })
const registerSchema = z.object({ action: z.union(['register', 'create']), workspaceId: z.string().required(), path: z.string().required(), title: z.string().required(), form: z.union(['long', 'short']), sessionId: z.string() })
const actionSchema = z.union([
  registerSchema,
  z.object({ action: z.union(['open', 'phase']), id: z.string().required() }),
  z.object({ action: z.const('bind'), id: z.string().required(), sessionId: z.string().required() }),
  z.object({ action: z.const('relink'), id: z.string().required(), workspaceId: z.string().required(), path: z.string().required() }),
])

class WorkbenchError extends Error {
  constructor(readonly code: string) { super(code) }
}
function fail(code: string): never { throw new WorkbenchError(code) }
function bookPath(path: string): string {
  if (path === '.' || path === '') return ''
  if (!safeRelative(path) || isAbsolute(path) || /^[a-z][a-z\d+.-]*:/iu.test(path)) fail('invalidBookPath')
  return path
}
function within(root: string, target: string): boolean {
  const rel = relative(root, target)
  return rel === '' || (rel !== '..' && !rel.startsWith('../') && !isAbsolute(rel))
}

/** A single operation queue plus a file lock also protects two profiles sharing one DSH home. */
export class WriterWorkbench {
  private queue: Promise<unknown> = Promise.resolve()
  /** @param ctx - native Session/workspace services. @param file - catalog location outside manuscripts. */
  constructor(private readonly ctx: Context, private readonly file: string) {}

  private async read(): Promise<WriterBook[]> {
    let bytes: string
    try { bytes = await readFile(this.file, 'utf8') }
    catch (error) { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return []; throw error }
    return catalogSchema(JSON.parse(bytes)).books as WriterBook[]
  }
  private save(books: readonly WriterBook[]): Promise<void> {
    return writeFileAtomic(this.file, JSON.stringify({ version: 1, books }, null, 2) + '\n', { mode: 0o600, dirMode: 0o700 })
  }
  private run<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.queue.then(async () => { await mkdir(dirname(this.file), { recursive: true, mode: 0o700 }); return withFileLock(this.file, operation) })
    this.queue = next.catch(() => { /* A failed operation does not poison later author requests. */ })
    return next
  }
  /** @returns saved references and currently registered native workspaces, without opening Sessions. */
  catalog(): Promise<WriterCatalog> {
    return this.run(async () => {
      const books = await this.read()
      const workspaces = await Promise.all(this.ctx.workspaceRegistry.list().map(async workspace => {
        const candidates = await discoverWriterBooks(async path => (await readdir(resolve(workspace.path, path), { withFileTypes: true })).map(entry => ({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' as const : entry.isFile() ? 'file' as const : 'other' as const,
        })))
        const registered = new Set(books.filter(book => book.workspaceId === workspace.id).map(book => book.path))
        return { id: workspace.id, path: workspace.path, title: workspace.title, sessionIds: workspace.sessionIds, candidates: candidates.filter(candidate => !registered.has(candidate.path)) }
      }))
      return { books, workspaces }
    })
  }
  private async location(workspaceId: string, path: string, exists = true): Promise<{ cwd: string; path: string; absolute: string }> {
    const workspace = this.ctx.workspaceRegistry.get(WorkspaceId(workspaceId))
    if (!workspace) fail('workspaceMissing')
    const cwd = await realpath(workspace.path).catch(() => fail('workspaceMissing'))
    const rel = bookPath(path)
    const absolute = resolve(cwd, rel)
    if (!within(cwd, absolute)) fail('invalidBookPath')
    if (exists) {
      const actual = await realpath(absolute).catch(() => fail('bookMissing'))
      if (!within(cwd, actual) || !(await stat(actual)).isDirectory()) fail('invalidBookPath')
    } else {
      if (!rel || rel.includes('/') || /[<>:"|?*]/u.test(rel)) fail('invalidBookPath')
      try { await stat(absolute); fail('bookExists') }
      catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error }
    }
    return { cwd, path: rel, absolute }
  }
  private async agent(book: WriterBook, rawId: string): Promise<Agent> {
    const result = await this.ctx.sessionController.resolveAgent(SessionId(rawId))
    if ('error' in result) fail('sessionMissing')
    const agent = result.agent
    const workspace = this.ctx.workspaceRegistry.get(WorkspaceId(book.workspaceId))
    if (!workspace || !workspace.sessionIds.includes(agent.id) || agent.session.header.cwd !== book.cwd) fail('sessionMismatch')
    if (agent.session.header.parentSession !== undefined || agent.session.header.origin === 'subagent') fail('sessionMismatch')
    const preset = this.ctx.agentPresets.composedPreset(agent.ctx) ?? agent.session.header.agentPreset
    if (preset !== 'writer') fail('writerRequired')
    return agent
  }
  private async bind(books: WriterBook[], book: WriterBook, id: string): Promise<WriterBook> {
    if (books.some(b => b.id !== book.id && (b.sessionId === id || b.phases.some(p => p.sessionId === id)))) fail('sessionInUse')
    await this.agent(book, id)
    const next = { ...book, sessionId: id, pendingSessionId: null, phases: book.phases.some(p => p.sessionId === id) ? book.phases : [...book.phases, { sessionId: id, createdAt: new Date().toISOString() }] }
    books[books.findIndex(b => b.id === book.id)] = next
    await this.save(books)
    return next
  }
  private async open(books: WriterBook[], book: WriterBook, fresh: boolean): Promise<WriterBook> {
    await this.location(book.workspaceId, book.path)
    if (!fresh && book.sessionId !== null) { await this.agent(book, book.sessionId); return book }
    if (book.sessionId !== null) {
      const previous = await this.agent(book, book.sessionId)
      if (previous.status === 'running') fail('sessionBusy')
    }
    if (book.pendingSessionId !== null) fail('bindingNeedsRepair')
    const preset = await this.ctx.agentPresets.resolve('writer')
    if (preset.broken) fail('writerRequired')
    const pending = { ...book, pendingSessionId: randomUUID() }
    books[books.findIndex(b => b.id === book.id)] = pending
    await this.save(books)
    const created = await this.ctx.sessionController.create({ sessionId: SessionId(pending.pendingSessionId), workspaceId: WorkspaceId(book.workspaceId), agentPreset: 'writer' })
    // Preserve the actual identity before resolving or renaming can fail.
    const actual = { ...pending, pendingSessionId: created.sessionId }
    books[books.findIndex(b => b.id === book.id)] = actual
    await this.save(books)
    const agent = await this.agent(actual, created.sessionId)
    await this.ctx.sessionController.rename({ sessionId: created.sessionId, title: book.title })
    if (!await this.ctx.sessions.flush(agent.session)) fail('bindingNeedsRepair')
    return this.bind(books, actual, created.sessionId)
  }
  /** @param input - explicit validated author operation. @returns the resulting book; no prompt is submitted. */
  change(input: WriterBookAction): Promise<WriterBook> {
    return this.run(async () => {
      const books = await this.read()
      if (input.action === 'register' || input.action === 'create') {
        const title = input.title.trim()
        if (!title || title.length > 200) fail('invalidBookTitle')
        const location = await this.location(input.workspaceId, input.path, input.action === 'register')
        const existing = books.find(b => b.cwd === location.cwd && b.path === location.path)
        if (existing) return input.action === 'register' ? existing : fail('bookExists')
        if (input.action === 'create') await mkdir(location.absolute)
        const book: WriterBook = { id: randomUUID(), title, form: input.form, workspaceId: input.workspaceId, cwd: location.cwd, path: location.path, phases: [], sessionId: null, pendingSessionId: null }
        if (input.action === 'create') {
          // A fresh native Session supplies the same sandbox policy as ordinary file tools.
          books.push(book)
          await this.save(books)
          // The directory does not yet exist; bind under the already registered parent workspace.
          const created = await this.createProject(books, book)
          return created
        }
        books.push(book)
        await this.save(books)
        return input.sessionId ? this.bind(books, book, input.sessionId) : book
      }
      const book = books.find(b => b.id === input.id)
      if (!book) fail('bookMissing')
      if (input.action === 'relink') {
        if (book.sessionId && (await this.agent(book, book.sessionId)).status === 'running') fail('sessionBusy')
        const location = await this.location(input.workspaceId, input.path)
        if (books.some(b => b.id !== book.id && b.cwd === location.cwd && b.path === location.path)) fail('bookExists')
        const next = { ...book, workspaceId: input.workspaceId, cwd: location.cwd, path: location.path, sessionId: null, pendingSessionId: null }
        books[books.findIndex(b => b.id === book.id)] = next
        await this.save(books)
        return next
      }
      if (input.action === 'bind') { await this.location(book.workspaceId, book.path); return this.bind(books, book, input.sessionId) }
      return this.open(books, book, input.action === 'phase')
    })
  }
  private async createProject(books: WriterBook[], book: WriterBook): Promise<WriterBook> {
    const preset = await this.ctx.agentPresets.resolve('writer')
    if (preset.broken) fail('writerRequired')
    const pending = { ...book, pendingSessionId: randomUUID() }
    books[books.findIndex(b => b.id === book.id)] = pending
    await this.save(books)
    const created = await this.ctx.sessionController.create({ sessionId: SessionId(pending.pendingSessionId), workspaceId: WorkspaceId(book.workspaceId), agentPreset: 'writer' })
    const actual = { ...pending, pendingSessionId: created.sessionId }
    books[books.findIndex(b => b.id === book.id)] = actual
    await this.save(books)
    const agent = await this.agent(actual, created.sessionId)
    const fs = agent.ctx.get('fs')
    if (!fs) fail('filesUnavailable')
    const target = await fs.resolve(join(book.path, book.form === 'long' ? '设定/创作意图.md' : '设定.md'), { cwd: book.cwd })
    const policy = agent.ctx.get('sandboxPolicy')?.resolve({ session: agent.session })
    await fs.writeText(target, `# ${book.title}\n\n`, { kind: 'createIfAbsent' }, undefined, policy)
    await this.ctx.sessionController.rename({ sessionId: created.sessionId, title: book.title })
    if (!await this.ctx.sessions.flush(agent.session)) fail('bindingNeedsRepair')
    return this.bind(books, actual, created.sessionId)
  }
}

/** @param ctx - complete native Web services. @param trustedHosts - additional trusted authorities. */
export function registerWriterWorkbench(ctx: Context, trustedHosts: readonly string[]): void {
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const service = new WriterWorkbench(ctx, join(home, 'writer', 'books.json'))
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/writer-workbench', handler: async (request, response) => {
      try {
        if (!isTrustedWriterRequest(request, trustedHosts)) fail('untrustedRequest')
        let value: WriterCatalog | WriterBook
        if (request.method === 'GET') value = await service.catalog()
        else if (request.method === 'POST') {
          const chunks: Buffer[] = []
          let size = 0
          for await (const chunk of request) {
            size += chunk.length
            if (size > 16_384) fail('requestTooLarge')
            chunks.push(Buffer.from(chunk))
          }
          const input = actionSchema(JSON.parse(Buffer.concat(chunks).toString('utf8'))) as WriterBookAction
          value = await service.change(input)
        } else fail('invalidRequest')
        response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
        response.end(JSON.stringify(value))
      } catch (error) {
        const code = error instanceof WorkbenchError ? error.code : 'workbenchFailed'
        ctx.logger('writer').warn('workbench operation failed', error)
        if (!response.headersSent) response.writeHead(code === 'untrustedRequest' ? 403 : 409, { 'content-type': 'application/json', 'cache-control': 'no-store' })
        response.end(JSON.stringify({ error: code }))
      }
    },
  }), 'writer: workbench')
}
