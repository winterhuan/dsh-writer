import { createRequire } from 'node:module'
import { createHash, randomUUID } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { BoxSession } = require('../skills/browser-cdp/scripts/box-session.cjs')
const { boxOperation, packResult } = require('../skills/browser-cdp/scripts/box-worker.cjs')
const { selection, createSession, openRunStore } = require('../skills/browser-cdp/scripts/browser-session.cjs')
const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'writer-box-'))
  roots.push(root)
  const calls: string[] = []
  const targets = [{ targetId: 'user-tab', url: 'https://user.example/' }]
  let loader = 'initial'
  const chrome = {
    identity: 'ws://box/browser/one',
    failEvaluation: false,
    readyState: 'complete',
    close() { calls.push('disconnect') },
    async send(method: string, params: Record<string, any> = {}) {
      calls.push(method)
      switch (method) {
        case 'Target.createTarget': targets.push({ targetId: 'writer-tab', url: 'about:blank' }); return { targetId: 'writer-tab' }
        case 'Target.getTargets': return { targetInfos: targets }
        case 'Target.attachToTarget': return { sessionId: 'connection' }
        case 'Target.closeTarget': {
          const index = targets.findIndex(t => t.targetId === params.targetId)
          if (index < 0) return { success: false }
          targets.splice(index, 1)
          return { success: true }
        }
        case 'Page.navigate': loader = 'navigation'; targets[1].url = params.url; return { loaderId: loader }
        case 'Page.getFrameTree': return { frameTree: { frame: { loaderId: loader } } }
        case 'Page.reload': loader = 'reloaded'; return {}
        case 'Runtime.evaluate':
          if (params.expression === 'document.readyState') return { result: { value: chrome.readyState } }
          if (chrome.failEvaluation) return { exceptionDetails: { text: 'Admin-Token=SECRET' } }
          return { result: { value: { url: targets[1].url, title: 'Book list', rows: [1, 2] } } }
        default: return {}
      }
    },
  }
  const dependencies = { root, connect: async () => chrome }
  const run = (action: string, extra = {}) => boxOperation({ id: 42, action, value: 'https://books.example/', ...extra }, dependencies)
  const state = () => JSON.parse(readFileSync(path.join(root, '42.json'), 'utf8'))
  return { root, run, state, chrome, targets, calls, dependencies }
}

it('defaults to Box and honors explicit browser and box choices', () => {
  expect(selection([], {})).toEqual({ browser: 'box', box: 'main', spaceId: null })
  expect(selection(['--browser', 'ego'], { WRITER_BROWSER: 'box' }).browser).toBe('ego')
  expect(selection([], { WRITER_BROWSER: 'ego' }).browser).toBe('ego')
  expect(selection(['--box=second'], { WRITER_BOX: 'first' }).box).toBe('second')
  expect(createSession({ browser: 'ego' }).constructor.name).toBe('EgoSession')
  expect(createSession({ browser: 'box' })).toBeInstanceOf(BoxSession)
})

it.each([['--browser', 'chrome'], ['--browser'], ['--browser='], ['--box='], ['--space='], ['--space', 'abc'], ['--space', '0'], ['--space', '1x'], ['--browser', '--space', '2']])('rejects invalid selection %j', (...args) => {
  expect(() => selection(args, {})).toThrow()
})

it('closes only its own target and rejects a completed session', async () => {
  const f = fixture()
  expect(await f.run('open')).toMatchObject({ title: 'Book list' })
  expect(await f.run('evaluate')).toMatchObject({ rows: [1, 2] })
  expect(await f.run('finish')).toEqual({ finished: true })
  expect(f.targets).toEqual([{ targetId: 'user-tab', url: 'https://user.example/' }])
  await expect(f.run('open')).rejects.toMatchObject({ code: 'SESSION_ENDED' })
})

it('accepts the target document DOM while other resources are loading', async () => {
  const f = fixture()
  f.chrome.readyState = 'interactive'
  expect(await f.run('open')).toMatchObject({ title: 'Book list' })
  await f.run('finish')
})

it('persists handoff across invocations and requires explicit takeover', async () => {
  const f = fixture()
  await f.run('open')
  await f.run('handoff')
  expect(f.state().handedOff).toBe(true)
  await expect(f.run('evaluate')).rejects.toMatchObject({ code: 'HANDED_OFF' })
  await expect(f.run('finish')).rejects.toMatchObject({ code: 'HANDED_OFF' })
  expect(await f.run('inspect')).toMatchObject({ ownership: 'user' })
  await f.run('takeover')
  expect(await f.run('evaluate')).toMatchObject({ rows: [1, 2] })
})

it('retains uncertain operations without leaking page errors and reloads only on explicit recovery', async () => {
  const f = fixture()
  await f.run('open')
  f.chrome.failEvaluation = true
  await expect(f.run('evaluate')).rejects.toMatchObject({ code: 'PAGE_SCRIPT' })
  expect(JSON.stringify(f.state())).not.toContain('SECRET')
  expect(f.state().inFlight).toBe(true)
  await expect(f.run('takeover')).rejects.toMatchObject({ code: 'RECOVERY_REQUIRED' })
  await expect(f.run('finish')).rejects.toMatchObject({ code: 'RECOVERY_REQUIRED' })
  expect(f.calls).not.toContain('Page.reload')
  f.chrome.failEvaluation = false
  await f.run('recover')
  expect(f.calls).toContain('Page.reload')
  expect(f.state().inFlight).toBe(false)
  await f.run('finish')
})

it('does not replace missing pages or sessions and refuses a changed browser', async () => {
  const f = fixture()
  await expect(f.run('open', { resume: true })).rejects.toMatchObject({ code: 'NO_SESSION' })
  expect(f.calls).toEqual([])
  await f.run('open')
  f.chrome.identity = 'ws://box/browser/two'
  await expect(f.run('open')).rejects.toMatchObject({ code: 'BROWSER_CHANGED' })
  f.chrome.identity = 'ws://box/browser/one'
  f.targets.splice(1, 1)
  await expect(f.run('evaluate')).rejects.toMatchObject({ code: 'PAGE_CLOSED' })
  expect(f.calls.filter(c => c === 'Target.createTarget')).toHaveLength(1)
})

it('serializes ownership on disk when two invocations overlap', async () => {
  const f = fixture()
  let release!: () => void
  let entered!: () => void
  const pending = new Promise<void>(resolve => { release = resolve })
  const ready = new Promise<void>(resolve => { entered = resolve })
  const first = boxOperation({ id: 42, action: 'open', value: 'https://books.example/' }, {
    root: f.root,
    connect: async () => { entered(); await pending; return f.chrome },
  })
  await ready
  try { await expect(f.run('open')).rejects.toMatchObject({ code: 'SESSION_BUSY' }) }
  finally { release(); await first }
  await f.run('finish')
})

it('records backend identity in checkpoints and rejects another backend on resume', () => {
  const f = fixture()
  const saved = openRunStore({ root: f.root, runId: 'checkpoint', params: { pages: 1 } })
  saved.commit('page-1', { title: 'kept' })
  const manifest = path.join(f.root, 'checkpoint', 'manifest.json')
  const data = JSON.parse(readFileSync(manifest, 'utf8'))
  expect(data.params.browser).toBe(selection().browser)
  data.params.browser = 'other-backend'
  writeFileSync(manifest, JSON.stringify(data))
  expect(() => openRunStore({ root: f.root, resume: 'checkpoint', params: { pages: 1 } })).toThrow('different parameters')
})

it('retrieves a stored UTF-8 result in bounded chunks without opening another browser', async () => {
  const f = fixture()
  const data = { text: '中文正文'.repeat(90000) }
  const packed = packResult({ id: 42, token: randomUUID() }, data, f.root)
  const ref = packed.dataFile
  const chunks = []
  let offset = 0
  while (offset < ref.bytes) {
    const part = await f.run('result-read', { value: { token: ref.token, offset } })
    expect(part.offset).toBe(offset)
    const chunk = Buffer.from(part.chunk, 'base64')
    expect(chunk.length).toBeLessThanOrEqual(128 * 1024)
    chunks.push(chunk)
    offset += chunk.length
  }
  const bytes = Buffer.concat(chunks)
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(ref.sha256)
  expect(JSON.parse(bytes.toString('utf8'))).toEqual(data)
  expect(f.calls).toEqual([])
  await f.run('result-delete', { value: { token: ref.token } })
  await expect(f.run('result-read', { value: { token: ref.token, offset: 0 } })).rejects.toMatchObject({ code: 'ENOENT' })
})

it('rejects a result reference outside its owned session file', async () => {
  const f = fixture()
  await expect(f.run('result-read', { value: { token: '../credentials.json', offset: 0 } })).rejects.toMatchObject({ code: 'BAD_RESULT' })
})

it('validates a large local result and does not replay the page on a checksum failure', () => {
  const data = Buffer.from(JSON.stringify({ text: 'book'.repeat(100000) }))
  let evaluationCalls = 0
  const session = new BoxSession({ launch: (_binary: string, _args: string[], options: any) => {
    const marker = JSON.parse(options.input.match(/marker:("[^"]+")/)[1])
    const input = JSON.parse(options.input.match(/\nboxOperation\((\{.*\})\)\.then/)[1])
    if (input.action === 'evaluate') {
      evaluationCalls++
      return { status: 0, stdout: JSON.stringify({ marker, ok: true, dataFile: { token: marker, bytes: data.length, sha256: 'wrong' } }) }
    }
    const offset = input.value.offset
    return { status: 0, stdout: JSON.stringify({ marker, ok: true, data: { offset, chunk: data.subarray(offset, offset + 128 * 1024).toString('base64') } }) }
  } })
  expect(() => session.evaluate('readBooks()')).toThrow('校验失败')
  expect(evaluationCalls).toBe(1)
  expect(session.end()).toMatchObject({ retained: true })
})

it('sends code on stdin without shell interpolation and keeps results local', () => {
  let request: any
  const session = new BoxSession({ launch: (binary: string, args: string[], options: any) => {
    request = { binary, args, options }
    const marker = JSON.parse(options.input.match(/marker:("[^"]+")/)[1])
    return { status: 0, signal: null, stdout: JSON.stringify({ marker, ok: true, data: { rows: [1] } }) }
  } })
  expect(session.evalJSON('"`$(do-not-execute)`"')).toEqual({ rows: [1] })
  expect(request.args).toEqual(['-y', '@simular-ai/box@0.2.0', 'rsh', '--box', 'main', 'node'])
  expect(request.options.shell).toBeUndefined()
  expect(request.args.join(' ')).not.toContain('do-not-execute')
  expect(request.options.input).toContain('do-not-execute')
})

it.each(['timeout', 'missing', 'duplicate', 'exit'])('retains state after %s and never falls back to Ego', (kind) => {
  let calls = 0
  const session = new BoxSession({ launch: (_binary: string, _args: string[], options: any) => {
    calls++
    const marker = JSON.parse(options.input.match(/marker:("[^"]+")/)[1])
    const envelope = JSON.stringify({ marker, ok: true, data: {} })
    return { status: kind === 'exit' ? 1 : 0, signal: null, error: kind === 'timeout' ? new Error('timeout') : undefined,
      stdout: kind === 'missing' ? '' : kind === 'duplicate' ? envelope + '\n' + envelope : envelope }
  } })
  expect(() => session.open('https://books.example/')).toThrow()
  expect(session.end()).toMatchObject({ retained: true, reason: 'uncertain' })
  expect(calls).toBe(1)
})
