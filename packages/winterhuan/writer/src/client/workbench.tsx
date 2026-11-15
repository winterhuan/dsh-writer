/** Works library, book editor, and the official DSH Conversation surface. */
import { SessionId } from '@deepseek-ai/dsh-session/types'
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WriterBook, WriterCatalog } from '../workbench-types.ts'
import { useEffect, useRef, useState } from 'react'
import type { PropsLocale, PropsRenderFactories, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { IconEditOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import type { zh } from './workbench-locales.ts'
import { WriterDesk } from './desk.tsx'
import { writeWriterSelection } from './draft-storage.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap { 'writer.workbench': { kind: 'single'; scope: 'root' } }
  interface SlotMap { 'writer.workbench.conversation': { kind: 'single'; scope: 'session' } }
  interface LocaleNamespaceMap { writerWorkbench: keyof typeof zh }
}

type Props = PropsRuntime<'writer.workbench'> & PropsRenderFactories & PropsRenderSlots<'writer.workbench.conversation'> & PropsLocale<'writerWorkbench'> & {
  readonly retain: (id: string) => SessionReference
  readonly action: (value: unknown) => Promise<WriterBook>
  readonly load: () => Promise<WriterCatalog>
  readonly openSession: (id: string) => void
  readonly initializeDraft: (reference: SessionReference, prompt: string) => string
  readonly remote: ClientRemote
  readonly deskT: (key: string) => string
}

/** Open the main workbench panel. */
export function Main({ renderSlot }: PropsRuntime<'main'> & PropsRenderSlots<'writer.workbench'>) {
  return renderSlot('writer.workbench', {})
}

/** Sidebar launcher for the complete writing workbench. */
export function Launcher({ size }: PropsRuntime<'sidebar.panellist'>) {
  return <IconEditOutlineRegular size={size} />
}

export function NativeConversation({ useSession, useConversation, renderFactorySlot }: PropsRuntime<'writer.workbench.conversation'> & PropsRenderFactories) {
  const session = useSession(value => value)
  const conversation = useConversation(value => value)
  const settling = session.openState === 'loading' && conversation.activeTargets.size === 0
  return renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : 'active', hero: false })
}

/** Main works screen and native assistant bindings. */
export function Workbench({ t, retain, action, load, openSession, initializeDraft, renderSlot, SessionProvider, remote, deskT, useSessions }: Props) {
  const [catalog, setCatalog] = useState<WriterCatalog>()
  const [bookId, setBookId] = useState<string>()
  const [selectedSessionId, setSelectedSessionId] = useState<string>()
  const [section, setSection] = useState<'works' | 'analysis' | 'market'>('works')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [smallView, setSmallView] = useState<'document' | 'assistant'>('document')
  const [assistantOpen, setAssistantOpen] = useState(true)
  const [title, setTitle] = useState('')
  const [path, setPath] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [linkSessionId, setLinkSessionId] = useState('')
  const [form, setForm] = useState<'long' | 'short'>('long')
  const root = useRef<HTMLElement>(null)
  const checkpoint = useRef<() => boolean>(() => true)
  const refresh = (): void => { void load().then(setCatalog).catch(() => setError(t('loadFailed'))) }
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    const node = root.current
    if (!node) return
    const observer = new ResizeObserver(entries => setNarrow((entries[0]?.contentRect.width ?? 0) < 920))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const books = catalog?.books ?? []
  const active = books.find(book => book.id === bookId)
  const sessions = useSessions(state => state.ids.flatMap(id => {
    const session = state.byId[id]
    return session && session.origin !== 'subagent' && session.projectionValues?.agentPreset === 'writer' ? [session] : []
  }))
  const sessionId = active && selectedSessionId && active.phases.some(phase => phase.sessionId === selectedSessionId) ? selectedSessionId : active?.sessionId
  const librarySession = books.find(book => book.sessionId !== null)
  const perform = async (input: unknown): Promise<void> => {
    setBusy(true); setError(undefined)
    try {
      const book = await action(input)
      if (input && typeof input === 'object' && 'action' in input && input.action === 'create') writeWriterSelection(book.cwd, `${book.path}/${book.form === 'long' ? '设定/创作意图.md' : '设定.md'}`)
      setBookId(book.id); setSelectedSessionId(book.sessionId ?? undefined); setSection('works'); refresh()
    }
    catch (cause) { setError(t(cause instanceof Error ? cause.message as keyof typeof zh : 'operationFailed')) }
    finally { setBusy(false) }
  }
  const canLeaveDocument = (): boolean => {
    if (checkpoint.current()) return true
    setError(t('draftCheckpointFailed'))
    return false
  }
  const goBack = (): void => { if (active && canLeaveDocument()) { setBookId(undefined); setSelectedSessionId(undefined); setSmallView('document') } }
  const requestAssistant = (prompt: string): void => {
    if (!sessionId) return
    const reference = retain(sessionId)
    void reference.ready.then(() => { initializeDraft(reference, prompt); openSession(sessionId) }).finally(() => reference.release())
  }
  return <main ref={root} className="writer-workbench" data-workbench="writer">
    <header className="writer-wb-header"><div><h1>{t('title')}</h1>{active && <span>{active.title}</span>}</div>{active && <button type="button" onClick={goBack}>{t('allWorks')}</button>}</header>
    {!active ? <div className="writer-wb-home">
      <nav className="writer-wb-nav" aria-label={t('navigation')}>
        {(['works', 'analysis', 'market'] as const).map(key => <button type="button" key={key} aria-current={section === key ? 'page' : undefined} onClick={() => setSection(key)}>{t(key)}</button>)}
      </nav>
      {section === 'works' ? <section className="writer-wb-works"><div className="writer-wb-toolbar"><h2>{t('works')}</h2><button type="button" onClick={refresh}>{t('refresh')}</button></div>
        <form onSubmit={event => { event.preventDefault(); if (workspaceId && path.trim() && title.trim()) void perform({ action: 'create', workspaceId, path: path.trim(), title: title.trim(), form }) }}>
          <select aria-label={t('workspace')} value={workspaceId} onChange={event => setWorkspaceId(event.target.value)}><option value="">{t('chooseWorkspace')}</option>{catalog?.workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.title}</option>)}</select>
          <input aria-label={t('bookTitle')} value={title} onChange={event => setTitle(event.target.value)} placeholder={t('bookTitle')} />
          <input aria-label={t('folder')} value={path} onChange={event => setPath(event.target.value)} placeholder={t('folder')} />
          <select aria-label={t('form')} value={form} onChange={event => setForm(event.target.value as 'long' | 'short')}><option value="long">{t('longForm')}</option><option value="short">{t('shortForm')}</option></select>
          <button type="submit" disabled={busy}>{t('createBook')}</button>
        </form>
        <select aria-label={t('writerSession')} value={linkSessionId} onChange={event => setLinkSessionId(event.target.value)}><option value="">{t('chooseWriterSession')}</option>{sessions.map(session => <option key={session.id} value={session.id}>{session.displayTitle}</option>)}</select>
        <button type="button" disabled={busy || !workspaceId || !path.trim() || !title.trim() || !linkSessionId} onClick={() => { void perform({ action: 'register', workspaceId, path: path.trim(), title: title.trim(), form, sessionId: linkSessionId }) }}>{t('registerExisting')}</button>
        <ul className="writer-wb-book-list">{books.map(book => <li key={book.id}><button type="button" onClick={() => { if (!canLeaveDocument()) return; setBookId(book.id); setSelectedSessionId(book.sessionId ?? undefined) }}><strong>{book.title}</strong><span>{book.path}</span><small>{book.sessionId ? t('sessionBound') : t('sessionNeeded')}</small></button><button type="button" disabled={busy} onClick={() => { if (canLeaveDocument()) void perform({ action: 'open', id: book.id }) }}>{t('open')}</button></li>)}</ul>
      </section> : librarySession ? <section className="writer-wb-library"><header><h2>{t(section)}</h2><span>{librarySession.title}</span></header><WriterDesk key={`${librarySession.id}:${section}`} sessionId={SessionId(librarySession.sessionId!)} cwd={librarySession.cwd} remote={remote} t={deskT} visible initialView={section === 'analysis' ? 'libraries' : 'scans'} /></section> : <section className="writer-wb-placeholder"><h2>{t(section)}</h2><p>{section === 'analysis' ? t('analysisEmpty') : t('marketEmpty')}</p></section>}
    </div> : <div className="writer-wb-book">
      <nav className="writer-wb-book-nav"><strong>{active.title}</strong><button type="button" onClick={() => requestAssistant(t('planningTask', { title: active.title, path: active.path }))}>{t('startPlanning')}</button>{active.phases.map((phase, index) => <button key={phase.sessionId} type="button" aria-current={phase.sessionId === sessionId ? 'page' : undefined} onClick={() => { if (canLeaveDocument()) setSelectedSessionId(phase.sessionId) }}>{t('phase')} {index + 1}</button>)}<button type="button" disabled={busy} onClick={() => { if (canLeaveDocument()) void perform({ action: 'phase', id: active.id }) }}>{t('newPhase')}</button><select aria-label={t('chooseWriterSession')} value={linkSessionId} onChange={event => setLinkSessionId(event.target.value)}><option value="">{t('chooseWriterSession')}</option>{sessions.filter(session => session.cwd === active.cwd).map(session => <option key={session.id} value={session.id}>{session.displayTitle}</option>)}</select><button type="button" disabled={busy || !linkSessionId} onClick={() => { if (canLeaveDocument()) void perform({ action: 'bind', id: active.id, sessionId: linkSessionId }) }}>{t('linkSession')}</button></nav>
      <div className="writer-wb-mobile-tabs"><button type="button" aria-pressed={smallView === 'document'} onClick={() => setSmallView('document')}>{t('document')}</button><button type="button" aria-pressed={smallView === 'assistant'} onClick={() => setSmallView('assistant')}>{t('assistant')}</button></div>
      <div className="writer-wb-columns" data-assistant-open={assistantOpen ? 'true' : 'false'} data-narrow={narrow ? 'true' : undefined} data-small-view={smallView}>
        <section className="writer-wb-document">{sessionId ? <WriterDesk key={active.id} sessionId={SessionId(sessionId)} cwd={active.cwd} remote={remote} t={deskT} checkpoint={() => checkpoint.current()} visible /> : <p>{t('sessionNeeded')}</p>}</section>
        <div className="writer-wb-resize" role="separator" aria-orientation="vertical" aria-valuenow={66} />
        <section className="writer-wb-assistant" aria-label={t('assistant')}><header><h2>{t('assistant')}</h2><button type="button" onClick={() => setAssistantOpen(value => !value)}>{assistantOpen ? t('collapse') : t('expand')}</button></header>
          {sessionId ? <AssistantPanel key={sessionId} book={{ ...active, sessionId }} retain={retain} renderSlot={renderSlot} SessionProvider={SessionProvider} t={t} /> : <p>{t('sessionNeeded')}</p>}
        </section>
      </div>
    </div>}
    {error && <p role="alert" className="writer-wb-error">{error}</p>}
  </main>
}

function AssistantPanel({ book, retain, renderSlot, SessionProvider, t }: Pick<Props, 'retain' | 'renderSlot' | 'SessionProvider' | 't'> & { book: WriterBook }) {
  const [reference, setReference] = useState<SessionReference>()
  const [failure, setFailure] = useState(false)
  useEffect(() => {
    const current = retain(book.sessionId!)
    let alive = true
    setReference(current)
    void current.ready.catch(() => { if (alive) setFailure(true) })
    return () => { alive = false; current.release() }
  }, [book.sessionId, retain])
  if (!reference || failure) return <p role={failure ? 'alert' : 'status'}>{t(failure ? 'sessionUnavailable' : 'loading')}</p>
  return <SessionProvider session={reference}>{renderSlot('writer.workbench.conversation', {})}</SessionProvider>
}
