// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import { SessionId } from '@deepseek-ai/dsh-session'
import { afterEach, expect, it, vi } from 'vitest'
import { BookPanel } from '../src/client/BookPanel.tsx'
import { manuscriptDigest } from '../src/client/book-status.ts'
import { zh, en } from '../src/client/locales.ts'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

async function fixture() {
  vi.stubGlobal('crypto', webcrypto)
  const body = '# 雨夜\n她打开门。\n'
  const hash = await manuscriptDigest(body)
  const files: Record<string, string> = {
    '/ws/novel/追踪/_tracking-state.json': JSON.stringify({ schema_version: 4, book_title: '雨夜', last_committed_chapter: 0, context: { next_chapter_commitments: ['找到妹妹'] } }),
    '/ws/novel/正文/第001章.md': body,
    '/ws/novel/.story/reviews/第001章.json': JSON.stringify({
      schema: 'story-review/v1', chapter: 1, body_path: '正文/第001章.md', body_sha256: hash, body_text: body,
      summary: '需要交代开门动机', findings: [{ id: 'F1', severity: 'must', line: 2, quote: '她打开门。', explanation: '缺少动机', suggestion: '交代她听到了什么', resolution: null }],
    }),
  }
  const readBytes = vi.fn(async (_session: string, path: string) => files[path] === undefined
    ? { ok: false as const, error: { code: 'workspace-file/not-found', message: 'absent' } }
    : { ok: true as const, value: { data: new TextEncoder().encode(files[path]), version: 'v1', offset: 0, eof: true } })
  const remote = { workspaceFiles: {
    readBytes,
    list: async () => ({ ok: true as const, value: { entries: [{ name: 'tracking.json', type: 'file' }], truncated: false } }),
  } } as ClientRemote
  return { files, readBytes, remote, body }
}

it.each([zh, en])('loads cited reviews on expansion and marks an unsaved revision stale', async copy => {
  const { remote, body, readBytes } = await fixture()
  const onOpen = vi.fn()
  const props = { sessionId: SessionId('panel'), cwd: '/ws', remote, projects: [{ path: 'novel', name: 'novel' }], active: 'novel/正文/第001章.md', draft: body.replace(/\n$/u, '\n'), dirty: false, version: 'v1', visible: true, onOpen, t: (key: keyof typeof zh) => copy[key] }
  const { container, rerender } = render(<BookPanel {...props} />)
  expect(readBytes).not.toHaveBeenCalled()
  const details = container.querySelector('details')!
  await act(async () => { details.open = true; fireEvent(details, new Event('toggle')) })
  expect(await screen.findByText(copy.bookReviewCurrent)).toBeTruthy()
  expect(screen.getByText('她打开门。')).toBeTruthy()
  expect(screen.getByText(copy.reviewMust + ' · ' + copy.reviewLine.replace('{n}', '2'))).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'tracking.json' }))
  expect(onOpen).toHaveBeenCalledWith('novel/.story/work/第001章/tracking.json')
  rerender(<BookPanel {...props} dirty draft="# 雨夜\n她锁上门。\n" />)
  expect(await screen.findByText(copy.bookStaleReview)).toBeTruthy()
  expect(screen.queryByText(copy.bookReviewCurrent)).toBeNull()
})

it('reports unreadable records and recovers with refresh without editing the manuscript', async () => {
  const { remote, files } = await fixture()
  const path = '/ws/novel/追踪/_tracking-state.json'
  const saved = files[path]!
  files[path] = '{broken'
  const { container } = render(<BookPanel sessionId={SessionId('failure')} cwd="/ws" remote={remote}
    projects={[{ path: 'novel', name: 'novel' }]} active={undefined} draft="" dirty={false} version={undefined} visible onOpen={vi.fn()} t={key => zh[key]} />)
  await act(async () => { const details = container.querySelector('details')!; details.open = true; fireEvent(details, new Event('toggle')) })
  expect(await screen.findByRole('alert')).toBeTruthy()
  files[path] = saved
  fireEvent.click(screen.getByRole('button', { name: zh.bookRefresh }))
  await waitFor(() => { expect(screen.queryByRole('alert')).toBeNull() })
  expect(await screen.findByText(zh.bookReviewCurrent)).toBeTruthy()
})

it('keeps chapter input focused until a multi-digit chapter is submitted', async () => {
  const { remote, body, readBytes } = await fixture()
  const { container } = render(<BookPanel sessionId={SessionId('chapter')} cwd="/ws" remote={remote}
    projects={[{ path: 'novel', name: 'novel' }]} active="novel/正文/第001章.md" draft={body} dirty={false}
    version="v1" visible onOpen={vi.fn()} t={key => zh[key]} />)
  await act(async () => { const details = container.querySelector('details')!; details.open = true; fireEvent(details, new Event('toggle')) })
  expect(await screen.findByText(zh.bookReviewCurrent)).toBeTruthy()
  const input = screen.getByRole('spinbutton')
  input.focus()
  const reads = readBytes.mock.calls.length
  fireEvent.change(input, { target: { value: '12' } })
  expect(document.activeElement).toBe(input)
  expect(readBytes.mock.calls.length).toBe(reads)
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(await screen.findByText(zh.bookUnreviewed)).toBeTruthy()
  expect(screen.getByRole('spinbutton')).toBe(input)
  expect(readBytes.mock.calls.some(([, path]) => path.endsWith('/.story/reviews/第012章.json'))).toBe(true)
})
