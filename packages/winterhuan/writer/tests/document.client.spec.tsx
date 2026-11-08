// @vitest-environment jsdom
/** Document identity, interrupted work, and recovery against independently changing disk files. */
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import type { WorkspaceFileBytes } from '@deepseek-ai/dsh-api-workspace-files/types'
import { SessionId } from '@deepseek-ai/dsh-session'
import { afterEach, expect, it, vi } from 'vitest'
import { WriterDesk } from '../src/client/desk.tsx'
import { readWriterDraft } from '../src/client/draft-storage.ts'
import { zh } from '../src/client/locales.ts'
import { useWriterDocument } from '../src/client/use-writer-document.ts'

const copy = (key: keyof typeof zh): string => zh[key]
const sessionId = SessionId('document-test')
const a = 'novel/a.md'
const b = 'novel/b.md'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
})

function bytes(path: string, text: string, version: string): RemoteResult<WorkspaceFileBytes> {
  return { ok: true, value: {
    absolutePath: path, version, offset: 0, data: new TextEncoder().encode(text), eof: true,
  } } as RemoteResult<WorkspaceFileBytes>
}

function reader() {
  const readBytes = vi.fn(async (_session: string, path: string) => bytes(path, path.endsWith('a.md') ? '甲\r\n原稿' : '乙原稿', path.endsWith('a.md') ? 'a1' : 'b1'))
  const remote = { workspaceFiles: {
    readBytes,
    list: async (_session: string, path: string) => ({ ok: true, value: {
      path, truncated: false,
      entries: path === '/ws' ? [{ name: 'novel', type: 'directory' }]
        : path === '/ws/novel' ? [{ name: '正文', type: 'directory' }, { name: 'a.md', type: 'file' }, { name: 'b.md', type: 'file' }] : [],
    } }),
  } } as ClientRemote
  return { readBytes, remote }
}

async function openDeskFile(name = 'a.md'): Promise<HTMLTextAreaElement> {
  fireEvent.click(await screen.findByRole('button', { name: 'novel' }))
  fireEvent.click(await screen.findByRole('button', { name }))
  const editor = await screen.findByRole('textbox', { name: `novel/${name}` }) as HTMLTextAreaElement
  await waitFor(() => { expect(editor.readOnly).toBe(false) })
  return editor
}

it('keeps an unsaved document when the sidebar is hidden and shown', async () => {
  const { remote, readBytes } = reader()
  const props = { sessionId, cwd: '/ws', remote, t: copy }
  const { rerender } = render(<WriterDesk {...props} visible />)
  const editor = await openDeskFile()
  fireEvent.change(editor, { target: { value: '未保存新稿' } })
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  rerender(<WriterDesk {...props} visible={false} />)
  rerender(<WriterDesk {...props} visible />)
  await waitFor(() => { expect(screen.getByRole('button', { name: 'novel' })).toBeTruthy() })
  expect(editor.value).toBe('未保存新稿')
  expect(readBytes).toHaveBeenCalledTimes(1)
  expect(confirm).not.toHaveBeenCalled()
})

it('prevents editing or saving before a read completes and ignores a previous file response', async () => {
  const { remote, readBytes } = reader()
  const pending = Promise.withResolvers<RemoteResult<WorkspaceFileBytes>>()
  readBytes.mockImplementationOnce(() => pending.promise)
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  const { result } = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  try {
    act(() => { result.current.open(a) })
    expect(result.current.loading).toBe(true)
    act(() => { result.current.edit('输入不得写入未读文稿'); result.current.save() })
    expect(result.current.draft).toBe('')
    expect(fetch).not.toHaveBeenCalled()
    act(() => { result.current.open(b) })
    await waitFor(() => { expect(result.current.ready).toBe(true) })
    await act(async () => { pending.resolve(bytes('/ws/novel/a.md', '甲原稿', 'a1')); await pending.promise })
    expect(result.current.active).toBe(b)
    expect(result.current.draft).toBe('乙原稿')
    expect(result.current.version).toBe('b1')
  } finally {
    await act(async () => { pending.resolve(bytes('/ws/novel/a.md', '甲原稿', 'a1')); await pending.promise })
  }
})

it('keeps the next file version when the previous save finishes late', async () => {
  const { remote } = reader()
  const pending = Promise.withResolvers<Response>()
  const fetch = vi.fn((_url: string, _init: RequestInit) => pending.promise)
    .mockImplementationOnce(() => pending.promise)
    .mockImplementationOnce(async () => new Response(JSON.stringify({ path: b, bytes: 12, version: 'b2' })))
  vi.stubGlobal('fetch', fetch)
  const { result } = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  try {
    act(() => { result.current.open(a) })
    await waitFor(() => { expect(result.current.ready).toBe(true) })
    act(() => { result.current.edit('甲改稿'); result.current.save() })
    expect(result.current.busy).toBe(true)
    act(() => { result.current.open(b) })
    await waitFor(() => { expect(result.current.ready).toBe(true) })
    await act(async () => { pending.resolve(new Response(JSON.stringify({ path: a, bytes: 9, version: 'a2' }))); await pending.promise })
    expect(result.current.version).toBe('b1')
    expect(result.current.dirty).toBe(false)
    act(() => { result.current.edit('乙改稿'); result.current.save() })
    await waitFor(() => { expect(result.current.busy).toBe(false) })
    const [url, init] = fetch.mock.calls[1]!
    expect(url).toContain('b.md')
    expect(JSON.parse(String(init.body))).toEqual({ content: '乙改稿', baseVersion: 'b1' })
  } finally {
    await act(async () => { pending.resolve(new Response('{}')); await pending.promise })
  }
})

it('restores unsaved text, disk baseline, and EOL after unmount in another session', async () => {
  const { remote } = reader()
  const first = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  act(() => { first.result.current.open(a) })
  await waitFor(() => { expect(first.result.current.ready).toBe(true) })
  act(() => { first.result.current.edit('甲\n恢复稿') })
  first.unmount()
  const fetch = vi.fn(async () => new Response(JSON.stringify({ path: a, bytes: 15, version: 'a2' })))
  vi.stubGlobal('fetch', fetch)
  const next = renderHook(() => useWriterDocument(remote, SessionId('another-session'), '/ws', copy))
  await waitFor(() => { expect(next.result.current.ready).toBe(true) })
  expect(next.result.current).toMatchObject({ active: a, draft: '甲\n恢复稿', saved: '甲\n原稿', version: 'a1', eol: '\r\n', dirty: true, conflict: false })
  act(() => { next.result.current.save() })
  await waitFor(() => { expect(next.result.current.busy).toBe(false) })
  expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body))).toEqual({ content: '甲\r\n恢复稿', baseVersion: 'a1' })
  expect(readWriterDraft('/ws', a).draft).toBeUndefined()
})

it('restores a draft without overwriting a changed disk and keeps it when reload fails', async () => {
  const { remote, readBytes } = reader()
  const first = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  act(() => { first.result.current.open(a) })
  await waitFor(() => { expect(first.result.current.ready).toBe(true) })
  act(() => { first.result.current.edit('浏览器草稿') })
  first.unmount()
  readBytes.mockResolvedValueOnce(bytes('/ws/novel/a.md', '模型写入磁盘的新稿', 'a2'))
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  const next = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  await waitFor(() => { expect(next.result.current.conflict).toBe(true) })
  expect(next.result.current.draft).toBe('浏览器草稿')
  act(() => { next.result.current.save() })
  expect(fetch).not.toHaveBeenCalled()
  readBytes.mockRejectedValueOnce(new Error('offline'))
  act(() => { next.result.current.reload(true) })
  await waitFor(() => { expect(next.result.current.loading).toBe(false) })
  expect(next.result.current.draft).toBe('浏览器草稿')
  expect(readWriterDraft('/ws', a).draft?.text).toBe('浏览器草稿')
  expect(next.result.current.notice).toBe('offline')
})

it('keeps edits typed during a save and stores them against the newly saved version', async () => {
  const { remote } = reader()
  const pending = Promise.withResolvers<Response>()
  vi.stubGlobal('fetch', vi.fn(() => pending.promise))
  const { result } = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  try {
    act(() => { result.current.open(a) })
    await waitFor(() => { expect(result.current.ready).toBe(true) })
    act(() => { result.current.edit('已提交稿'); result.current.save(); result.current.edit('仍在写的新稿') })
    await act(async () => { pending.resolve(new Response(JSON.stringify({ path: a, bytes: 12, version: 'a2' }))); await pending.promise })
    expect(result.current.draft).toBe('仍在写的新稿')
    expect(readWriterDraft('/ws', a).draft).toMatchObject({ text: '仍在写的新稿', baseText: '已提交稿', baseVersion: 'a2' })
  } finally {
    await act(async () => { pending.resolve(new Response('{}')); await pending.promise })
  }
})

it('warns before leaving an unsaved draft and removes the warning after saving', async () => {
  const { remote } = reader()
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ path: a, bytes: 9, version: 'a2' }))))
  const { result } = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  act(() => { result.current.open(a) })
  await waitFor(() => { expect(result.current.ready).toBe(true) })
  act(() => { result.current.edit('待保存') })
  const before = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(before)
  expect(before.defaultPrevented).toBe(true)
  act(() => { result.current.save() })
  await waitFor(() => { expect(result.current.dirty).toBe(false) })
  const after = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(after)
  expect(after.defaultPrevented).toBe(false)
})

it('shows storage failure while preserving the editable draft', async () => {
  const { remote } = reader()
  render(<WriterDesk sessionId={sessionId} cwd="/ws" remote={remote} t={copy} visible />)
  const editor = await openDeskFile()
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota', 'QuotaExceededError') })
  fireEvent.change(editor, { target: { value: '浏览器空间不足也不得丢稿' } })
  expect(editor.value).toBe('浏览器空间不足也不得丢稿')
  expect(screen.getByText(zh.draftStorageError)).toBeTruthy()
  expect((screen.getByRole('button', { name: zh.save }) as HTMLButtonElement).disabled).toBe(false)
})

it('does not replace a recovery copy another session updated', async () => {
  const { remote } = reader()
  const first = renderHook(() => useWriterDocument(remote, sessionId, '/ws', copy))
  const second = renderHook(() => useWriterDocument(remote, SessionId('second'), '/ws', copy))
  act(() => { first.result.current.open(a); second.result.current.open(a) })
  await waitFor(() => { expect(first.result.current.ready && second.result.current.ready).toBe(true) })
  act(() => { first.result.current.edit('会话一稿件') })
  act(() => { second.result.current.edit('会话二稿件') })
  expect(second.result.current.storageError).toBe('changed')
  expect(second.result.current.draft).toBe('会话二稿件')
  expect(readWriterDraft('/ws', a).draft?.text).toBe('会话一稿件')
})

it('isolates workspace switches and restores the original workspace draft on return', async () => {
  const { remote } = reader()
  const { rerender } = render(<WriterDesk sessionId={sessionId} cwd="/ws" remote={remote} t={copy} visible />)
  const editor = await openDeskFile()
  fireEvent.change(editor, { target: { value: '工作区一草稿' } })
  rerender(<WriterDesk sessionId={SessionId('second')} cwd="/other" remote={remote} t={copy} visible />)
  expect(screen.queryByRole('textbox', { name: a })).toBeNull()
  rerender(<WriterDesk sessionId={SessionId('third')} cwd="/ws" remote={remote} t={copy} visible />)
  const restored = await screen.findByRole('textbox', { name: a }) as HTMLTextAreaElement
  await waitFor(() => { expect(restored.readOnly).toBe(false) })
  expect(restored.value).toBe('工作区一草稿')
})
