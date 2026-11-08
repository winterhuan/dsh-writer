import { expect, it } from 'vitest'
import { manuscriptDigest, readBookStatus, selectedChapter, type BookFiles } from '../src/client/book-status.ts'

async function fixture() {
  const body = '# 第一章\r\n她推开了门。\r\n'
  const digest = await manuscriptDigest(body)
  const outline = '字数目标：2000'
  const files: Record<string, string> = {
    '追踪/_tracking-state.json': JSON.stringify({ schema_version: 4, book_title: '开门', last_committed_chapter: 0, context: { next_chapter_commitments: ['确认来客身份'] } }),
    '正文/第001章.md': body,
    '大纲/细纲_第001章.md': outline,
    '.story/checks/第001章.json': JSON.stringify({
      schema: 'story-chapter-check/v1', chapter: 1, status: 'needs_decision',
      body_path: '正文/第001章.md', body_sha256: digest,
      outline_path: '大纲/细纲_第001章.md', outline_sha256: await manuscriptDigest(outline),
      length: { target: 2000, actual: 8 }, quality: { blocking_findings: [], tool_errors: [] },
    }),
    '.story/reviews/第001章.json': JSON.stringify({
      schema: 'story-review/v1', chapter: 1, body_path: '正文/第001章.md', body_sha256: digest,
      body_text: body, summary: '开门动作缺少动机', findings: [{
        id: 'F1', severity: 'suggestion', line: 2, quote: '她推开了门。', explanation: '来客身份未知', suggestion: '补充可见的动机',
        resolution: { kind: 'accepted', reason: '悬念需要', body_sha256: digest },
      }],
    }),
  }
  const io: BookFiles = { read: async path => files[path], list: async () => [{ name: 'tracking.json', type: 'file' }] }
  return { files, io }
}

it('shows current chapter checks separately from cited review decisions and unfinished work', async () => {
  const { io } = await fixture()
  const status = await readBookStatus(io)
  expect(status.chapter).toBe(1)
  expect(status.commitments).toEqual(['确认来客身份'])
  expect(status.check).toMatchObject({ stale: false, status: 'needs_decision', target: 2000 })
  expect(status.review).toMatchObject({ stale: false, findings: [{ resolution: 'accepted', line: 2 }] })
  expect(status.workFiles).toEqual(['.story/work/第001章/tracking.json'])
})

it('expires both reports and accepted findings when the manuscript changes', async () => {
  const { files, io } = await fixture()
  files['正文/第001章.md'] = '# 第一章\n她反锁了门。\n'
  const status = await readBookStatus(io, 1)
  expect(status.check?.stale).toBe(true)
  expect(status.review?.stale).toBe(true)
  expect(status.review?.findings[0]?.resolution).toBeUndefined()
  expect(status.review?.bodyText).toContain('推开')
  expect(status.review?.currentText).toContain('反锁')
})

it('expires mechanical results when only the outline changes', async () => {
  const { files, io } = await fixture()
  files['大纲/细纲_第001章.md'] = '字数目标：3000'
  const status = await readBookStatus(io, 1)
  expect(status.check?.stale).toBe(true)
  expect(status.review?.stale).toBe(false)
})

it('reports a malformed or forged review rather than displaying it as current', async () => {
  const { files, io } = await fixture()
  const path = '.story/reviews/第001章.json'
  const record = JSON.parse(files[path]!)
  record.findings[0].quote = '不存在的原文'
  files[path] = JSON.stringify(record)
  await expect(readBookStatus(io, 1)).rejects.toThrow(path)
  record.body_path = '../other-book/正文.md'
  files[path] = JSON.stringify(record)
  await expect(readBookStatus(io, 1)).rejects.toThrow(path)
})

it('keeps missing tracking and reports distinct from successful checks', async () => {
  const result = await readBookStatus({ read: async () => undefined, list: async () => [] }, null)
  expect(result.lastChapter).toBeUndefined()
  expect(result.check).toBeUndefined()
  expect(result.review).toBeUndefined()
  expect(result.chapter).toBeNull()
})

it('recognizes nested chapter manuscripts without treating outlines as prose', () => {
  expect(selectedChapter('正文/第一卷/第012章_来客.md')).toBe(12)
  expect(selectedChapter('大纲/第012章.md')).toBeUndefined()
  expect(selectedChapter('正文.md')).toBeNull()
})
