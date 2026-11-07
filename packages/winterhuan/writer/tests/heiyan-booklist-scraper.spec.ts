import { createRequire } from 'node:module'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const scraperPath = require.resolve('../skills/story-short-scan/scripts/heiyan-booklist-scraper.js')
const transportPath = require.resolve('../skills/browser-cdp/scripts/ego-session.cjs')
const { main, parseLibrary, parseDetail, fetchBookDetail } = require(scraperPath)
const { openRunStore, localDateStamp } = require(transportPath)
const roots: string[] = []
const doms: JSDOM[] = []
function root() {
  const dir = mkdtempSync(path.join(tmpdir(), 'writer-heiyan-'))
  roots.push(dir)
  return dir
}
function document(html: string) {
  const dom = new JSDOM(html)
  doms.push(dom)
  return dom.window.document
}
afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close()
  for (const dir of roots.splice(0)) rmSync(dir, { recursive: true, force: true })
})
const url = 'https://www.heiyan.com/all.html'
const next = 'https://www.heiyan.com/all/-1_-1_-1_-1_0_2.html'
const book = { id: '1', name: '已采集作品', userName: '作者', words: 12345, totalClicks: 0, url: 'https://www.heiyan.com/book/1' }
const first = () => ({ url, rows: [{ ...book }], next })
const last = () => ({ url: next, rows: [{ ...book, id: '2', name: '续采作品', url: 'https://www.heiyan.com/book/2' }], next: null })
function fake(responses: unknown[]) {
  return {
    spaceId: 42, uncertain: false, finished: 0, calls: [] as string[],
    open(url: string) { this.calls.push(url) },
    evalJSON() {
      this.calls.push('evaluate')
      const response = responses.shift()
      if (response instanceof Error) throw response
      return response
    },
    endAndReport() { if (!this.uncertain) this.finished++ },
  }
}
function setup(responses: unknown[]) {
  const dir = root()
  const session = fake(responses)
  const runStore = openRunStore({ root: path.join(dir, 'runs'), runId: 'local-run', params: { source: url, pages: 2, detail: false }, parserRevision: '2-heiyan-public' })
  return { dir, session, runStore, options: { session, runStore, pages: 2, outdir: dir, sleep() {} } }
}
const fixture = readFileSync(new URL('./fixtures/heiyan-library.html', import.meta.url), 'utf8')

describe('Heiyan official public pages', () => {
  it('extracts public book links, mixed lengths and cumulative clicks from recorded HTML', () => {
    const result = parseLibrary(document(fixture), url)
    expect(result.next).toBe(next)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toMatchObject({ id: '161168', name: '阴怜在此，阴戏一唱镇万邪', userName: 'Summer晴空', words: 804173, totalClicks: 1437 })
    expect(result.rows[1].words).toBeLessThan(40000)
    expect(result.rows.every((b: { url: string }) => /^https:\/\/www\.heiyan\.com\/book\/\d+$/.test(b.url))).toBe(true)
    expect(result.rows[0]).not.toHaveProperty('classifyStr')
  })

  it.each([
    fixture.replace('总点击', '月点击'),
    fixture.replace('804173', '不可见'),
    fixture.replace(next, 'https://example.com/'),
    '<h1>请完成验证</h1>',
  ])('rejects changed columns, missing metrics, unexpected pagination or challenge pages', html => {
    expect(() => parseLibrary(document(html), url)).toThrow()
  })

  it('rejects redirects outside the official library', () => {
    expect(() => parseLibrary(document(fixture), 'https://example.com/all.html')).toThrow()
  })

  it('reads public category, completion and description metadata without requiring an account', () => {
    const doc = document(readFileSync(new URL('./fixtures/heiyan-book.html', import.meta.url), 'utf8'))
    const result = parseDetail(doc, 'https://www.heiyan.com/book/156269')
    expect(result).toMatchObject({ typeDesc: '玄奇', status: '已完结', detailOk: true })
    expect(result.description).toContain('夺命的邪咒')
    expect(result.description).not.toContain('下载客户端')
    expect(() => parseDetail(doc, 'https://www.heiyan.com/book/1')).toThrow()
    let expression = ''
    fetchBookDetail({ evalJSON(js: string) { expression = js } }, 156269)
    expect(expression).toContain('https://www.heiyan.com/book/156269')
    expect(expression).not.toMatch(/document.cookie|Authorization|zhangwenpindu/)
  })
})

describe('Heiyan collection and partial report safety', () => {
  it.each([null, new Error('Authorization: Bearer SECRET'), { url: next, rows: {} }, { ...last(), rows: [book] }])('preserves first page and an existing report after a bad later page', response => {
    const f = setup([first(), response])
    const original = path.join(f.dir, `黑岩书库列表_all_${localDateStamp()}.md`)
    writeFileSync(original, 'existing complete report')
    const result = main(f.options)
    expect(result).toMatchObject({ written: 1, failed: 1, partial: true })
    expect(result.partialReasons.join()).toContain('第2页采集异常')
    expect(JSON.stringify(result)).not.toContain('SECRET')
    expect(f.runStore.get('page-1').rows).toEqual([book])
    expect(f.runStore.get('page-2')).toBeUndefined()
    expect(readFileSync(original, 'utf8')).toBe('existing complete report')
    const partial = readFileSync(original.replace(/\.md$/, '.partial.md'), 'utf8')
    expect(partial).toContain(book.name)
    expect(partial).toContain('采集未完成')
    expect(partial).not.toContain('SECRET')
    expect(f.session.finished).toBe(0)
  })

  it('writes no report on first-page failure and retains the scene', () => {
    const f = setup([null])
    expect(main(f.options)).toMatchObject({ written: 0, failed: 1, partial: false })
    expect(readdirSync(f.dir).filter(n => n.endsWith('.md'))).toEqual([])
    expect(f.session.finished).toBe(0)
  })

  it('stops at the observed last page and preserves zero clicks and public links', () => {
    const f = setup([{ ...first(), next: null }])
    expect(main(f.options)).toMatchObject({ written: 1, failed: 0, partial: false })
    expect(f.session.calls).toEqual([url, 'evaluate'])
    expect(f.session.finished).toBe(1)
    const report = readFileSync(path.join(f.dir, `黑岩书库列表_all_${localDateStamp()}.md`), 'utf8')
    expect(report).toContain('**总点击：0**')
    expect(report).toContain(`[作品页](${book.url})`)
    expect(report).toContain('包含长短篇')
    expect(report).not.toContain('男频短篇')
  })

  it.each(['story-short-scan', 'story-long-scan'])('preserves cumulative clicks and mixed word lengths in %s aggregation', skill => {
    const page = parseLibrary(document(fixture), url)
    const f = setup([{ ...page, next: null }])
    expect(main(f.options).failed).toBe(0)
    const { parseRankFile, aggregate, renderMarkdown } = require(`../skills/${skill}/scripts/aggregate-rank.js`)
    const parsed = parseRankFile(path.join(f.dir, `黑岩书库列表_all_${localDateStamp()}.md`))
    expect(parsed.entries[0].metrics).toEqual({ 总点击: 1437 })
    const result = aggregate([parsed], { top: 3, desc: 30 })
    expect(result.platforms[0]).toMatchObject({ scale: 'long', metric: '总点击', bookCount: 2 })
    expect(renderMarkdown(result)).toContain('累计点击中位')
    expect(renderMarkdown(result)).toContain('官网书库包含长短篇')
  })

  it('resumes committed pages without navigating or requesting them again', () => {
    const f = setup([first(), null])
    expect(main(f.options).partial).toBe(true)
    const nextSession = fake([last()])
    expect(main({ ...f.options, session: nextSession })).toMatchObject({ written: 1, failed: 0, partial: false })
    expect(nextSession.calls).toEqual([next, 'evaluate'])
  })

  it('preserves list data and commits only successful details for resume', () => {
    const f = setup([{ url, rows: [book, last().rows[0]], next: null }, { detailOk: true, typeDesc: '玄奇' }, new Error('SECRET')])
    expect(main({ ...f.options, detail: true })).toMatchObject({ written: 1, failed: 1, partial: true })
    expect(f.runStore.get('detail-1')).toMatchObject({ detailOk: true })
    expect(f.runStore.get('detail-2')).toBeUndefined()
    const resumed = fake([{ detailOk: true, typeDesc: '现代' }])
    expect(main({ ...f.options, detail: true, session: resumed })).toMatchObject({ written: 1, partial: false })
    expect(resumed.calls).toEqual([url, 'evaluate'])
  })

  it('writes a partial report when the detail origin cannot be opened after cached lists', () => {
    const f = setup([])
    f.runStore.commit('page-1', { ...first(), next: null })
    f.session.open = () => { throw new Error('SECRET') }
    const result = main({ ...f.options, detail: true })
    expect(result).toMatchObject({ written: 1, failed: 1, partial: true })
    const { parseRankFile, aggregate } = require('../skills/story-short-scan/scripts/aggregate-rank.js')
    const parsed = parseRankFile(path.join(f.dir, `黑岩书库列表_all_${localDateStamp()}.partial.md`))
    expect(aggregate([parsed], { top: 3, desc: 30 }).files[0]).toMatchObject({ quality: '[部分采集]', problems: ['详情页面打开失败，保留已采集书目'] })
    expect(JSON.stringify(result)).not.toContain('SECRET')
  })

  it('invalidates management portal checkpoints before any browser operation', () => {
    const dir = root()
    openRunStore({ root: dir, runId: 'old', params: { source: url, pages: 2, detail: false }, parserRevision: '1' })
    expect(() => openRunStore({ root: dir, resume: 'old', params: { source: url, pages: 2, detail: false }, parserRevision: '2-heiyan-public' })).toThrow()
  })

  it.each([{ channel: 'male' }, { channel: 'female' }, { pages: 0 }, { pages: 1.5 }])('rejects unsupported selection before browsing', options => {
    const f = setup([])
    expect(() => main({ ...f.options, ...options })).toThrow()
    expect(f.session.calls).toEqual([])
  })

  it.each([['partial', 2], ['failed', 1], ['success', 0]])('runCli uses exit %s', (kind, exit) => {
    const dir = root()
    const program = `
      const { cliMain } = require(${JSON.stringify(scraperPath)});
      const { runCli, openRunStore } = require(${JSON.stringify(transportPath)});
      const responses = ${JSON.stringify(kind === 'success' ? [first(), last()] : kind === 'partial' ? [first(), null] : [null])};
      const session = { open(){}, evalJSON(){return responses.shift()}, endAndReport(){ if(this.uncertain) console.log('RETAINED'); } };
      const runStore = openRunStore({root:${JSON.stringify(path.join(dir, 'runs'))}, runId:'local', params:{}, parserRevision:'2-heiyan-public'});
      runCli(() => cliMain({session, runStore, pages:2, outdir:${JSON.stringify(dir)}, sleep(){}}), 'heiyan');
    `
    const child = spawnSync(process.execPath, ['-e', program], { encoding: 'utf8', timeout: 20_000 })
    expect(child.error).toBeUndefined()
    expect(child.signal).toBeNull()
    expect(child.status).toBe(exit)
    if (kind !== 'success') expect(child.stdout).toContain('RETAINED')
  })
})
