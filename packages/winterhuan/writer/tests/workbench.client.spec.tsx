// @vitest-environment jsdom
import { useSyncExternalStore, type ComponentProps, type ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SessionId } from '@deepseek-ai/dsh-session'
import { WorkspaceId } from '@deepseek-ai/dsh-workspace'
import type { SessionListState, SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceSnapshot } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import { Workbench } from '../src/client/workbench.tsx'
import { createWriterWorkbenchStore } from '../src/client/workbench-store.ts'
import { zh } from '../src/client/workbench-locales.ts'
import { zh as deskZh } from '../src/client/locales.ts'

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear() })

function fixture() {
  const store = createWriterWorkbenchStore().create()
  const catalog: SessionListState = { ids: [], byId: {}, phase: 'ready', projectionsBySession: {} }
  function add(value: string, preset = 'writer', parentId?: SessionId, cwd = '/novels') {
    const id = SessionId(value)
    catalog.ids.push(id)
    catalog.byId[id] = { id, displayTitle: value, cwd, running: false, retainedBy: {}, blank: false, updatedAt: 0, projectionValues: { agentPreset: preset }, ...(parentId ? { parentId } : {}) }
  }
  add('first'); add('second'); add('archived'); add('standard', 'standard'); add('child', 'writer', SessionId('first')); add('wrong-folder', 'writer', undefined, '/other')
  const workspaces: WorkspaceSnapshot = {
    items: [
      { workspaceId: WorkspaceId('novels'), title: '小说', path: '/novels', sessionIds: [...catalog.ids], createdAt: '', updatedAt: '' },
      { workspaceId: WorkspaceId('other'), title: '其他', path: '/other', sessionIds: [], createdAt: '', updatedAt: '' },
    ],
    archivedSessionIds: [SessionId('archived')], pinnedSessionIds: [], state: 'idle', phase: 'ready', error: null,
  }
  const tree: Record<string, { name: string; type: 'file' | 'directory' }[]> = {
    '/novels': [{ name: '已有小说', type: 'directory' }, { name: '拆文库', type: 'directory' }, { name: '扫榜', type: 'directory' }],
    '/novels/已有小说': [{ name: '正文', type: 'directory' }, { name: '设定', type: 'directory' }],
    '/novels/已有小说/正文': [{ name: '第001章.md', type: 'file' }],
    '/novels/拆文库': [{ name: '样文', type: 'directory' }],
    '/novels/拆文库/样文': [{ name: '分析.md', type: 'file' }],
    '/novels/扫榜': [{ name: '20261117', type: 'directory' }],
    '/novels/扫榜/20261117': [{ name: '选题决策.md', type: 'file' }],
  }
  const remote = { workspaceFiles: {
    list: vi.fn(async (_id: string, path: string) => ({ ok: true, value: { path, entries: tree[path] ?? [], truncated: false } })),
    readBytes: vi.fn(async (_id: string, absolutePath: string) => ({ ok: true, value: { absolutePath, version: 'v1', offset: 0, data: new TextEncoder().encode('已有正文'), eof: true } })),
  } } as ClientRemote
  const references: { id: SessionId; release: ReturnType<typeof vi.fn>; settle: () => void }[] = []
  const retain = vi.fn((id: SessionId) => {
    let settle!: () => void
    const ready = new Promise<SessionReference['binding']>(resolve => { settle = () => resolve({} as SessionReference['binding']) })
    const reference = { id, sessionId: id, ready, release: vi.fn(), settle }
    references.push(reference)
    return reference as SessionReference
  })
  const createSession = vi.fn(async () => SessionId('new'))
  const createBook = vi.fn()
  const openSession = vi.fn()
  const report = vi.fn()
  const props = {
    useSessions: (selector: (state: SessionListState) => unknown) => selector(catalog),
    useWorkspaces: (selector: (state: WorkspaceSnapshot) => unknown) => selector(workspaces),
    useStore: (selector: (state: ReturnType<typeof store.store.getSnapshot>) => unknown) => selector(useSyncExternalStore(store.store.subscribe, store.store.getSnapshot)),
    actions: store.actions, retain, createSession, createBook, openSession, report, remote,
    renderSlot: () => <textarea aria-label="native-draft" defaultValue="" />,
    SessionProvider: ({ session, children }: { session: SessionReference; children: ReactNode }) => <div data-testid="session" data-session={session.sessionId}>{children}</div>,
    t: (key: keyof typeof zh) => zh[key],
    deskT: (key: keyof typeof deskZh) => deskZh[key],
  } as ComponentProps<typeof Workbench>
  return { store, catalog, workspaces, references, props, retain, createSession, createBook, openSession, report }
}

async function openManuscript() {
  const rail = within(screen.getByRole('complementary', { name: deskZh.tree }))
  fireEvent.click(await rail.findByRole('button', { name: '已有小说' }))
  fireEvent.click(await rail.findByRole('button', { name: '正文' }))
  fireEvent.click(await rail.findByRole('button', { name: '第001章.md' }))
  const editor = await screen.findByRole('textbox', { name: '已有小说/正文/第001章.md' })
  await waitFor(() => expect(editor).toHaveProperty('value', '已有正文'))
  return editor
}

it('opens existing workspace manuscripts directly and filters unrelated conversations', async () => {
  const f = fixture()
  render(<Workbench {...f.props} />)
  expect(await openManuscript()).toHaveProperty('value', '已有正文')
  expect(f.createBook).not.toHaveBeenCalled()
  expect(f.createSession).not.toHaveBeenCalled()
  expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['小说', '其他', 'first', 'second'])
})

it('keeps manuscript and native input drafts across sections and assistant visibility', async () => {
  const f = fixture()
  render(<Workbench {...f.props} />)
  await act(async () => f.references[0]!.settle())
  const editor = await openManuscript()
  fireEvent.change(editor, { target: { value: '未保存的正文' } })
  fireEvent.change(screen.getByLabelText('native-draft'), { target: { value: '未发送的创作要求' } })
  fireEvent.click(screen.getByRole('button', { name: zh.libraries, exact: true }))
  expect(await screen.findByRole('button', { name: '样文' })).toBeTruthy()
  expect(screen.getByRole('textbox', { name: '已有小说/正文/第001章.md' })).toBe(editor)
  fireEvent.click(screen.getByRole('button', { name: zh.scans, exact: true }))
  expect(await screen.findByRole('button', { name: '20261117' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: zh.collapse }))
  fireEvent.click(screen.getByRole('button', { name: zh.expand }))
  expect(editor).toHaveProperty('value', '未保存的正文')
  expect(screen.getByLabelText('native-draft')).toHaveProperty('value', '未发送的创作要求')
  expect(f.retain).toHaveBeenCalledOnce()
})

it('blocks workspace and conversation changes when recovery storage cannot protect the draft', async () => {
  const f = fixture()
  render(<Workbench {...f.props} />)
  const editor = await openManuscript()
  fireEvent.change(editor, { target: { value: '不能丢失的草稿' } })
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage unavailable') })
  fireEvent.change(screen.getByLabelText(zh.workspace), { target: { value: 'other' } })
  expect(screen.getByText(zh.draftCheckpointFailed)).toBeTruthy()
  expect(screen.getByLabelText(zh.workspace)).toHaveProperty('value', 'novels')
  fireEvent.change(screen.getByLabelText(zh.writerSession), { target: { value: 'second' } })
  expect(screen.getByLabelText(zh.writerSession)).toHaveProperty('value', 'first')
  expect(editor).toHaveProperty('value', '不能丢失的草稿')
})

it('releases replaced native bindings and ignores their late readiness', async () => {
  const f = fixture()
  const view = render(<Workbench {...f.props} />)
  fireEvent.change(screen.getByLabelText(zh.writerSession), { target: { value: 'second' } })
  expect(f.references[0]!.release).toHaveBeenCalledOnce()
  await act(async () => f.references[0]!.settle())
  expect(screen.queryByTestId('session')).toBeNull()
  await act(async () => f.references[1]!.settle())
  expect(screen.getByTestId('session').getAttribute('data-session')).toBe('second')
  view.unmount()
  expect(f.references[1]!.release).toHaveBeenCalledOnce()
})

it('uses the sidebar session when entering the workbench', async () => {
  const f = fixture()
  f.store.actions.openFromSidebar(SessionId('second'))
  render(<Workbench {...f.props} />)
  expect(screen.getByLabelText(zh.writerSession)).toHaveProperty('value', 'second')
  await openManuscript()
  expect(f.retain).toHaveBeenCalledWith('second')
})

it('keeps the active conversation and its draft when a background conversation updates', async () => {
  const f = fixture()
  const view = render(<Workbench {...f.props} />)
  await act(async () => f.references[0]!.settle())
  const input = screen.getByLabelText('native-draft')
  fireEvent.change(input, { target: { value: '只属于当前对话的要求' } })
  f.catalog.byId[SessionId('second')]!.updatedAt = 100
  view.rerender(<Workbench {...f.props} />)
  expect(screen.getByLabelText(zh.writerSession)).toHaveProperty('value', 'first')
  expect(screen.getByLabelText('native-draft')).toBe(input)
  expect(input).toHaveProperty('value', '只属于当前对话的要求')
  expect(f.references[0]!.release).not.toHaveBeenCalled()
  expect(f.retain).toHaveBeenCalledOnce()
  fireEvent.change(screen.getByLabelText(zh.writerSession), { target: { value: 'second' } })
  expect(screen.getByLabelText(zh.writerSession)).toHaveProperty('value', 'second')
  expect(f.references[0]!.release).toHaveBeenCalledOnce()
  expect(f.retain).toHaveBeenLastCalledWith('second')
})

it('creates a Writer conversation only after an explicit request and keeps failure retryable', async () => {
  const f = fixture()
  render(<Workbench {...f.props} />)
  f.createSession.mockRejectedValueOnce(new Error('unavailable'))
  fireEvent.click(screen.getByRole('button', { name: zh.newSession }))
  await waitFor(() => expect(f.report).toHaveBeenCalledWith('operationFailed'))
  expect(screen.getByLabelText(zh.writerSession)).toHaveProperty('value', 'first')
  fireEvent.click(screen.getByRole('button', { name: zh.newSession }))
  await waitFor(() => expect(f.report).toHaveBeenCalledWith('createdSession'))
  expect(f.createSession).toHaveBeenCalledWith('novels')
  expect(f.store.store.getSnapshot().sessionId).toBe('new')
})
