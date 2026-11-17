/** Full writing desk using the existing editor and native Writer conversations. */
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WriterBook, WriterBookAction } from '../workbench-types.ts'
import { useEffect, useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRenderFactories, PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { IconEditOutlineRegular, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import { zh } from './workbench-locales.ts'
import type { zh as deskZh } from './locales.ts'
import { WriterDesk } from './desk.tsx'
import { writeWriterSelection } from './draft-storage.ts'
import { preferredWriterWorkspace, writerSessionsInWorkspace } from './workbench-selection.ts'
import type { createWriterWorkbenchStore } from './workbench-store.ts'
import css from './workbench.module.css'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap { 'writer.workbench': { kind: 'single'; scope: 'root' } }
  interface SlotMap { 'writer.workbench.conversation': { kind: 'single'; scope: 'session' } }
  interface LocaleNamespaceMap { writerWorkbench: keyof typeof zh }
}

export interface WorkbenchInjected {
  readonly retain: (id: SessionId) => SessionReference
  readonly createSession: (workspaceId: WorkspaceId) => Promise<SessionId>
  readonly createBook: (input: Extract<WriterBookAction, { action: 'create' }>) => Promise<WriterBook>
  readonly openSession: (id: SessionId) => void
  readonly report: (key: 'createdSession' | 'createdBook' | 'operationFailed') => void
  readonly remote: ClientRemote
  readonly deskT: (key: keyof typeof deskZh) => string
}
type Props = PropsRuntime<'writer.workbench'> & PropsRenderFactories & PropsRenderSlots<'writer.workbench.conversation'> & PropsLocale<'writerWorkbench'> & PropsStore<ReturnType<typeof createWriterWorkbenchStore>> & InjectFace<WorkbenchInjected>

/** Render the full writing desk in the native main panel. */
export function Main({ renderSlot }: PropsRuntime<'main'> & PropsRenderSlots<'writer.workbench'>) {
  return renderSlot('writer.workbench', {})
}
/** Sidebar navigation icon for the writing desk. */
export function Launcher({ size }: PropsRuntime<'sidebar.panellist'>) {
  return <IconEditOutlineRegular size={size} />
}
/** Render the official Conversation factory under the selected Session provider. */
export function NativeConversation({ useSession, useConversation, renderFactorySlot }: PropsRuntime<'writer.workbench.conversation'> & PropsRenderFactories) {
  const session = useSession(value => value)
  const conversation = useConversation(value => value)
  const settling = session.openState === 'loading' && conversation.activeTargets.size === 0
  return renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : 'active', hero: false })
}

/** Browse workspace files without a separate book-registration step. */
export function Workbench({ t, retain, createSession, createBook, openSession, report, renderSlot, SessionProvider, remote, deskT, useSessions, useWorkspaces, useStore, actions }: Props) {
  const catalog = useSessions(state => state)
  const workspaces = useWorkspaces(state => state)
  const preferences = useStore(state => state)
  const [busy, setBusy] = useState(false)
  const [newBook, setNewBook] = useState(false)
  const [revision, setRevision] = useState(0)
  const [error, setError] = useState<string>()
  const checkpoint = useRef<() => boolean>(() => true)
  const remembered = workspaces.items.find(item => item.sessionIds.some(id => id === preferences.sessionId))
  const preferred = preferredWriterWorkspace(workspaces.items.map(item => ({ ...item, id: item.workspaceId })))
  const workspace = workspaces.items.find(item => item.workspaceId === preferences.workspaceId)
    ?? remembered ?? workspaces.items.find(item => item.workspaceId === preferred) ?? workspaces.items[0]
  const sessions = writerSessionsInWorkspace(catalog.ids.flatMap(id => catalog.byId[id] ? [catalog.byId[id]!] : []),
    workspace ? { ...workspace, id: workspace.workspaceId } : undefined, workspace?.sessionIds ?? [])
    .filter(session => !session.parentId && !workspaces.archivedSessionIds.includes(session.id))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  const pending = catalog.phase !== 'ready' || workspaces.phase !== 'ready'
  const requested = sessions.find(session => session.id === preferences.sessionId)
  const selectionKey = JSON.stringify([workspace?.workspaceId, preferences.sessionId])
  const [initialSession, setInitialSession] = useState<{ key: string; id: SessionId | undefined }>()
  // A background update may reorder the menu, but must not replace the open conversation.
  if (!pending && (initialSession?.key !== selectionKey || (!initialSession.id && sessions.length))) {
    setInitialSession({ key: selectionKey, id: (requested ?? sessions[0])?.id })
  }
  const selected = requested ?? sessions.find(session => session.id === initialSession?.id)
  const canLeave = (): boolean => {
    if (!checkpoint.current()) { setError(t('draftCheckpointFailed')); return false }
    setError(undefined)
    return true
  }
  const create = async (): Promise<void> => {
    if (!workspace || busy || !canLeave()) return
    setBusy(true)
    try {
      const id = await createSession(workspace.workspaceId)
      actions.selectWorkspace(workspace.workspaceId)
      actions.selectSession(id)
      report('createdSession')
    } catch { report('operationFailed') }
    finally { setBusy(false) }
  }
  return <main className={css.workbench} data-workbench="writer">
    <div className={css.ambient} aria-hidden="true" />
    <header className={css.header}>
      <div className={css.heading}><IconEditOutlineRegular size={20} /><h1>{t('title')}</h1></div>
      <label className={css.workspace}>{t('workspace')}<select value={workspace?.workspaceId ?? ''} disabled={pending || busy} onChange={event => {
        const next = workspaces.items.find(item => item.workspaceId === event.target.value)
        if (next && canLeave()) actions.selectWorkspace(next.workspaceId)
      }}>{!workspace && <option value="">{t('chooseWorkspace')}</option>}{workspaces.items.map(item => <option key={item.workspaceId} value={item.workspaceId}>{item.title}</option>)}</select></label>
      <button type="button" className={css.primary} disabled={pending || busy || !workspace} onClick={() => { if (canLeave()) setNewBook(true) }}>{t('createBook')}</button>
    </header>
    <div className={css.toolbar}>
      <nav className={css.nav} aria-label={t('navigation')}>
        {(['projects', 'libraries', 'scans'] as const).map(view => <button type="button" key={view} aria-current={preferences.view === view ? 'page' : undefined} onClick={() => actions.selectView(view)}>{t(view)}</button>)}
      </nav>
      <button type="button" className={css.assistantToggle} aria-pressed={preferences.assistantOpen} onClick={actions.toggleAssistant}>{t(preferences.assistantOpen ? 'collapse' : 'expand')}</button>
      <nav className={css.panes} aria-label={t('panels')}>
        <button type="button" aria-pressed={preferences.pane === 'document'} onClick={() => actions.selectPane('document')}>{t('document')}</button>
        <button type="button" aria-pressed={preferences.pane === 'assistant'} onClick={() => actions.selectPane('assistant')}>{t('assistant')}</button>
      </nav>
    </div>
    <div className={css.body} data-assistant-open={preferences.assistantOpen} data-pane={preferences.pane}>
      <section className={`writer-wb-document ${css.document}`} aria-label={t(preferences.view)}>
        {pending ? <Loading /> : !workspace ? <div className={css.empty}><h2>{t('welcome')}</h2><p>{t('workspaceHelp')}</p></div> : selected
          ? <WriterDesk key={`${workspace.path}:${revision}`} sessionId={selected.id} cwd={workspace.path} remote={remote} t={deskT} checkpoint={checkpoint} visible view={preferences.view} />
          : <div className={css.empty}><h2>{t('welcome')}</h2><p>{t('sessionHelp')}</p><button type="button" className={css.primary} disabled={busy} onClick={() => { void create() }}>{t('newSession')}</button></div>}
        {error && <p role="alert" className={css.error}>{error}</p>}
      </section>
      <aside className={css.assistant} aria-label={t('assistant')}>
        <header><h2>{t('assistant')}</h2><button type="button" disabled={!selected || busy} onClick={() => { if (selected && canLeave()) openSession(selected.id) }}>{t('openConversation')}</button></header>
        <div className={css.sessionControls}>
          <select aria-label={t('writerSession')} value={selected?.id ?? ''} disabled={pending || busy || !sessions.length} onChange={event => {
            const next = sessions.find(session => session.id === event.target.value)
            if (next && canLeave()) actions.selectSession(next.id)
          }}>{!selected && <option value="">{t('chooseWriterSession')}</option>}{sessions.map(session => <option key={session.id} value={session.id}>{session.displayTitle}</option>)}</select>
          <button type="button" disabled={pending || busy || !workspace} onClick={() => { void create() }}>{t('newSession')}</button>
        </div>
        <div className={css.conversation}>{selected ? <AssistantPanel key={selected.id} sessionId={selected.id} retain={retain} renderSlot={renderSlot} SessionProvider={SessionProvider} t={t} /> : <div className={css.empty}><p>{t('assistantHelp')}</p></div>}</div>
      </aside>
    </div>
    {newBook && workspace && <NewBook workspaceId={workspace.workspaceId} createBook={createBook} t={t} close={() => setNewBook(false)} onCreated={book => {
      writeWriterSelection(book.cwd, `${book.path}/${book.form === 'long' ? '设定/创作意图.md' : '设定.md'}`)
      actions.selectWorkspace(workspace.workspaceId)
      if (book.sessionId) actions.selectSession(book.sessionId as SessionId)
      actions.selectView('projects')
      setRevision(value => value + 1)
      setNewBook(false)
      report('createdBook')
    }} />}
  </main>
}
function Loading() { return <div className={css.empty} aria-busy="true"><span className={css.spinner} /></div> }
function AssistantPanel({ sessionId, retain, renderSlot, SessionProvider, t }: Pick<Props, 'retain' | 'renderSlot' | 'SessionProvider' | 't'> & { sessionId: SessionId }) {
  const [reference, setReference] = useState<SessionReference>()
  const [failure, setFailure] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const current = retain(sessionId)
    let alive = true
    void current.ready.then(() => { if (alive) setReference(current) }).catch(() => { if (alive) setFailure(true) })
    return () => { alive = false; current.release() }
  }, [sessionId, retain, retry])
  if (failure) return <div className={css.empty}><p role="alert">{t('sessionUnavailable')}</p><button type="button" onClick={() => { setReference(undefined); setFailure(false); setRetry(value => value + 1) }}>{t('retry')}</button></div>
  return reference ? <SessionProvider session={reference}>{renderSlot('writer.workbench.conversation', {})}</SessionProvider> : <Loading />
}
function NewBook({ workspaceId, createBook, onCreated, close, t }: Pick<Props, 'createBook' | 't'> & { workspaceId: WorkspaceId; onCreated: (book: WriterBook) => void; close: () => void }) {
  const [title, setTitle] = useState('')
  const [path, setPath] = useState<string>()
  const [form, setForm] = useState<'long' | 'short'>('long')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  return <Modal open title={t('createBook')} closeLabel={t('cancel')} onClose={busy ? () => {} : close}>
    <form className={css.form} onSubmit={event => {
      event.preventDefault()
      if (busy || !title.trim() || !(path ?? title).trim()) return
      setBusy(true); setError(undefined)
      void createBook({ action: 'create', workspaceId, title: title.trim(), path: (path ?? title).trim(), form }).then(onCreated).catch((cause: unknown) => {
        const key = cause instanceof Error && cause.message in zh ? cause.message as keyof typeof zh : 'operationFailed'
        setError(t(key))
      }).finally(() => setBusy(false))
    }}>
      <label>{t('bookTitle')}<input autoFocus required value={title} disabled={busy} onChange={event => setTitle(event.target.value)} /></label>
      <label>{t('folder')}<input required value={path ?? title} disabled={busy} onChange={event => setPath(event.target.value)} /></label>
      <label>{t('form')}<select value={form} disabled={busy} onChange={event => setForm(event.target.value === 'short' ? 'short' : 'long')}><option value="long">{t('longForm')}</option><option value="short">{t('shortForm')}</option></select></label>
      {error && <p role="alert">{error}</p>}
      <footer><button type="button" disabled={busy} onClick={close}>{t('cancel')}</button><button type="submit" className={css.primary} disabled={busy || !title.trim()}>{t('create')}</button></footer>
    </form>
  </Modal>
}
