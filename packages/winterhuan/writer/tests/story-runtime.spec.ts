/** Execute the shipped Python/Node chapter and review commands against private book directories. */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it, onTestFinished } from 'vitest'

const skills = fileURLToPath(new URL('../skills/', import.meta.url))
const storyctl = join(skills, 'story-long-write/scripts/storyctl.py')
const tracking = join(skills, 'story-long-write/scripts/tracking_commit.py')
const review = join(skills, 'story-review/scripts/review_record.py')
const prompt = join(skills, 'story-long-write/scripts/build_writer_prompt.py')
const bodyPath = '正文/第001章.md'
const outlinePath = '大纲/细纲_第001章.md'
const checkPath = '.story/checks/第001章.json'
const reviewPath = '.story/reviews/第001章.json'

function digest(body: string): string {
  return createHash('sha256').update(body).digest('hex')
}

async function run(script: string, args: string[], executable = 'python3') {
  const child = spawn(executable, [...(executable === 'python3' ? ['-B'] : []), script, ...args], { stdio: ['ignore', 'pipe', 'pipe'] })
  let stdout = ''
  let stderr = ''
  let launchError: Error | undefined
  child.stdout.setEncoding('utf8').on('data', chunk => { stdout += String(chunk) })
  child.stderr.setEncoding('utf8').on('data', chunk => { stderr += String(chunk) })
  child.on('error', error => { launchError = error })
  const completion = new Promise<{ code: number | null, signal: NodeJS.Signals | null }>(resolve => {
    child.on('close', (code, signal) => { resolve({ code, signal }) })
  })
  onTestFinished(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill()
    await completion
  })
  const result = await completion
  expect(launchError).toBeUndefined()
  expect(result.signal).toBeNull()
  return { ...result, stdout, stderr }
}

async function book() {
  const root = await mkdtemp(join(tmpdir(), 'writer-runtime-'))
  onTestFinished(async () => { await rm(root, { recursive: true, force: true }) })
  await mkdir(join(root, '正文'))
  await mkdir(join(root, '大纲'))
  const body = '# 第001章：雨夜\n\n' + [
    '她翻到第1页，在窗边看了半晌。桌上的纸逐渐吸满雨水，她将纸页收进木盒，推开了门。',
    '巷口的灯已经灭了，卖伞老人正把最后一件货物塞回棚底。她递出铜钱，老人却盯着木盒摇头。',
    '盒盖上刻着妹妹的名字。昨夜收到它时，里面只有一张湿透的船票，票上的日期恰好是今天。',
    '河边忽然响起汽笛，她顾不上再问，沿着青石阶向码头跑去。积水溅到裙角，凉得她打了个寒战。',
    '渡船还没有解缆。船夫抬起煤油灯照了照票面，转身搬开挡路的竹筐，露出藏在下面的另一只盒子。',
  ].join('\n') + '\n'
  await writeFile(join(root, bodyPath), body)
  await writeFile(join(root, outlinePath), '# 第001章：雨夜\n\n字数目标：800\n字数口径：visible_chars_v1\n字数范围：100-2000\n\n她雨夜出门寻找失散的妹妹。\n')
  const position = { volume: '第一卷', volume_start_chapter: 1, story_time: '黄昏', scene: '旧屋' }
  const context = { position, long_term_constraints: [], active_character_names: [], continuity_risks: [] }
  const init = {
    schema_version: 1, book_title: '雨夜', last_chapter: 0,
    context: { ...context, recent_chapters: [], next_chapter_commitments: [] },
    character_snapshots: {}, foreshadow: [], timeline_events: [],
  }
  const initial = join(root, 'init.json')
  await writeFile(initial, JSON.stringify(init))
  const initialized = await run(tracking, ['init', '--project', root, '--input', initial])
  expect(initialized.code, initialized.stderr).toBe(0)
  const transaction = {
    schema_version: 1, mode: 'append', chapter: 1, chapter_title: '雨夜', expected_state_revision: 0,
    delta: {
      result: '她带着木盒离开旧屋', character_changes: [], foreshadow_changes: [], timeline_events: [],
      constraints: [], next_chapter_commitments: ['寻找失散的妹妹'], retired_context_items: [], retired_characters: [],
    },
    context: { ...context, position: { ...position, story_time: '入夜', scene: '门外' } },
    character_snapshots: {},
  }
  const input = join(root, 'transaction.json')
  await writeFile(input, JSON.stringify(transaction))
  return { root, body, input, transaction }
}

it('persists fingerprinted checks and commits tracking once, rejecting stale transactions', async () => {
  const { root, body, input, transaction } = await book()
  const args = ['--project', root, '--chapter', '1']
  const checked = await run(storyctl, ['chapter', 'check', ...args])
  expect(checked.code, checked.stdout + checked.stderr).toBe(0)
  const record = JSON.parse(await readFile(join(root, checkPath), 'utf8'))
  expect(record).toMatchObject({
    schema: 'story-chapter-check/v1', status: 'ready', body_path: bodyPath, body_sha256: digest(body),
    outline_path: outlinePath, record_path: checkPath, tracking_committed: false, state_revision: 0,
  })
  const committed = await run(storyctl, ['chapter', 'commit', ...args, '--input', input])
  expect(committed.code, committed.stdout + committed.stderr).toBe(0)
  const stateFile = join(root, '追踪/_tracking-state.json')
  const state = await readFile(stateFile, 'utf8')
  expect(JSON.parse(state)).toMatchObject({ last_committed_chapter: 1, state_revision: 1 })
  expect(JSON.parse(await readFile(join(root, checkPath), 'utf8'))).toMatchObject({ tracking_committed: true, state_revision: 1 })
  const repeated = await run(storyctl, ['chapter', 'commit', ...args, '--input', input])
  expect(repeated.code).toBe(2)
  expect(await readFile(stateFile, 'utf8')).toBe(state)
  await writeFile(input, JSON.stringify({ ...transaction, mode: 'revision' }))
  const stale = await run(storyctl, ['chapter', 'commit', ...args, '--input', input])
  expect(stale.code).toBe(2)
  expect(stale.stdout).toContain('tracking state changed')
  expect(await readFile(stateFile, 'utf8')).toBe(state)
})

it('refuses a chapter with blocking prose without advancing tracking', async () => {
  const { root, input } = await book()
  const stateFile = join(root, '追踪/_tracking-state.json')
  const before = await readFile(stateFile, 'utf8')
  await writeFile(join(root, bodyPath), '# 第001章：雨夜\n\n' + '桌上的纸逐渐吸满雨水，她将纸页收进木盒，推开了门。\n'.repeat(15))
  const result = await run(storyctl, ['chapter', 'commit', '--project', root, '--chapter', '1', '--input', input])
  expect(result.code, result.stdout).not.toBe(0)
  expect(JSON.parse(result.stdout).error_code).toBe('QUALITY_BLOCKED')
  expect(await readFile(stateFile, 'utf8')).toBe(before)
})

it('does not publish a prompt when the chapter outline is missing', async () => {
  const { root } = await book()
  await rm(join(root, outlinePath))
  const result = await run(prompt, ['--project', root, '--chapter', '1', '--out'])
  expect(result.code).toBe(2)
  expect(result.stderr).toContain('细纲')
  await expect(readFile(join(root, '.story/work/第001章/writer_prompt.md'))).rejects.toMatchObject({ code: 'ENOENT' })
})

it('does not publish a prompt when the continuation state card is missing', async () => {
  const { root } = await book()
  await rm(join(root, '追踪/上下文.md'))
  const result = await run(prompt, ['--project', root, '--chapter', '1', '--out'])
  expect(result.code).toBe(2)
  expect(result.stderr).toContain('上下文.md')
  await expect(readFile(join(root, '.story/work/第001章/writer_prompt.md'))).rejects.toMatchObject({ code: 'ENOENT' })
})

it('reports a display-record write failure without claiming a durable commit failed', async () => {
  const { root, input } = await book()
  await mkdir(join(root, '.story'))
  await writeFile(join(root, '.story/checks'), 'occupied')
  const args = ['--project', root, '--chapter', '1']
  const checked = await run(storyctl, ['chapter', 'check', ...args])
  expect(checked.code).toBe(2)
  const committed = await run(storyctl, ['chapter', 'commit', ...args, '--input', input])
  expect(committed.code, committed.stdout).toBe(0)
  expect(JSON.parse(committed.stdout)).toMatchObject({ tracking_committed: true, record_error: expect.any(String) })
  expect(JSON.parse(await readFile(join(root, '追踪/_tracking-state.json'), 'utf8')))
    .toMatchObject({ last_committed_chapter: 1, state_revision: 1 })
})

it('reports a missing checker and refuses commit without changing tracking', async () => {
  const { root, input } = await book()
  const scripts = join(root, 'scripts')
  await cp(join(skills, 'story-long-write/scripts'), scripts, { recursive: true })
  await rm(join(scripts, 'check-degeneration.js'))
  const before = await readFile(join(root, '追踪/_tracking-state.json'), 'utf8')
  const args = ['--project', root, '--chapter', '1']
  const checked = await run(join(scripts, 'storyctl.py'), ['chapter', 'check', ...args])
  expect(checked.code, checked.stdout + checked.stderr).toBe(3)
  expect(JSON.parse(checked.stdout)).toMatchObject({ status: 'tool_unavailable' })
  expect(JSON.parse(await readFile(join(root, checkPath), 'utf8')).quality.tool_errors)
    .toEqual(expect.arrayContaining([expect.objectContaining({ tool: 'check-degeneration.js' })]))
  const committed = await run(join(scripts, 'storyctl.py'), ['chapter', 'commit', ...args, '--input', input])
  expect(committed.code).toBe(3)
  expect(await readFile(join(root, '追踪/_tracking-state.json'), 'utf8')).toBe(before)
})

it('keeps CommonJS checkers executable after copying into an ESM writing project', async () => {
  const { root } = await book()
  await writeFile(join(root, 'package.json'), JSON.stringify({ type: 'module' }))
  const scripts = join(root, '.agents/skills/story-long-write/scripts')
  await cp(join(skills, 'story-long-write/scripts'), scripts, { recursive: true })
  const result = await run(join(scripts, 'storyctl.py'), ['chapter', 'check', '--project', root, '--chapter', '1'])
  expect(result.code, result.stdout + result.stderr).toBe(0)
  expect(JSON.parse(result.stdout).quality.status).toBe('pass')
})

it.each(['story-long-write', 'story-short-write', 'story-review', 'story-deslop'])(
  'runs the shipped %s checker through Node', async (skill) => {
    const { root } = await book()
    const result = await run(join(skills, skill, 'scripts/check-ai-patterns.js'),
      ['--check', '--json', '--fail-on=blocking', join(root, bodyPath)], process.execPath)
    expect(result.code, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout).findings).toEqual([])
  },
)

it('runs the shipped import outline checker and reports actual missing outline fields', async () => {
  const { root } = await book()
  const result = await run(join(skills, 'story-import/scripts/check-outline-contract.js'),
    ['--json', join(root, outlinePath)], process.execPath)
  expect(result.code, result.stderr).toBe(1)
  expect(JSON.parse(result.stdout).ok).toBe(false)
  expect(result.stderr).not.toContain('require is not defined')
})

it('reports crashed text checkers as unavailable rather than prose findings', async () => {
  const { root } = await book()
  const scripts = join(root, 'scripts')
  await cp(join(skills, 'story-long-write/scripts'), scripts, { recursive: true })
  await writeFile(join(scripts, 'normalize-punctuation.js'), 'throw new Error("controlled normalizer failure")\n')
  await writeFile(join(scripts, 'check-outline-copy.js'), 'throw new Error("controlled outline checker failure")\n')
  const result = await run(join(scripts, 'storyctl.py'), ['chapter', 'check', '--project', root, '--chapter', '1'])
  expect(result.code, result.stdout).toBe(3)
  const quality = JSON.parse(result.stdout).quality
  expect(quality.blocking_findings).toEqual([])
  expect(quality.advisories).toEqual([])
  expect(quality.tool_errors.map((row: { tool: string }) => row.tool)).toEqual([
    'normalize-punctuation.js', 'check-outline-copy.js',
  ])
})

async function reviewInput(root: string, body: string) {
  const input = join(root, 'review-input.json')
  await writeFile(input, JSON.stringify({
    body_sha256: digest(body), mode: 'solo', summary: '开场动作清晰，人物动机需要补足',
    findings: [{ id: 'R1', severity: 'suggestion', line: 3, quote: '她翻到第1页',
      explanation: '尚未交代翻阅目的', suggestion: '补入与妹妹有关的纸页细节' }],
  }))
  return input
}

it('counts review citation lines using the same physical newlines as the editor', async () => {
  const { root } = await book()
  const body = '# 雨夜\n\n她翻到第1页\u2028看见了信。\n门开了。\n'
  await writeFile(join(root, bodyPath), body)
  const input = await reviewInput(root, body)
  const payload = JSON.parse(await readFile(input, 'utf8'))
  payload.findings[0].line = 4
  payload.findings[0].quote = '门开了。'
  await writeFile(input, JSON.stringify(payload))
  const result = await run(review, ['record', '--project', root, '--file', bodyPath, '--chapter', '1', '--input', input])
  expect(result.code, result.stdout).toBe(0)
  expect(JSON.parse(await readFile(join(root, reviewPath), 'utf8')).findings[0].line).toBe(4)
})

it('records cited reviews and version-bound decisions, then marks changed prose stale', async () => {
  const { root, body } = await book()
  const input = await reviewInput(root, body)
  const args = ['--project', root, '--file', bodyPath, '--chapter', '1']
  const recorded = await run(review, ['record', ...args, '--input', input])
  expect(recorded.code, recorded.stdout + recorded.stderr).toBe(0)
  expect(JSON.parse(recorded.stdout)).toMatchObject({ status: 'current', record_path: reviewPath, unresolved: 1 })
  expect(JSON.parse(await readFile(join(root, reviewPath), 'utf8')).body_text).toBe(body)
  const resolved = await run(review, ['resolve', ...args, '--id', 'R1', '--resolution', 'accepted',
    '--reason', '作者选择在下一章揭示', '--body-sha256', digest(body)])
  expect(resolved.code, resolved.stdout).toBe(0)
  expect(JSON.parse(resolved.stdout).unresolved).toBe(0)
  const before = await readFile(join(root, reviewPath), 'utf8')
  await writeFile(join(root, bodyPath), body + '雨声停了。\n')
  const status = await run(review, ['status', ...args])
  expect(JSON.parse(status.stdout)).toMatchObject({ status: 'stale', body_sha256: digest(body) })
  const stale = await run(review, ['resolve', ...args, '--id', 'R1', '--resolution', 'resolved',
    '--reason', '已修改', '--body-sha256', digest(body)])
  expect(stale.code).toBe(2)
  expect(await readFile(join(root, reviewPath), 'utf8')).toBe(before)
})

it('rejects invented citations and reviews computed from an old manuscript', async () => {
  const { root, body } = await book()
  const input = await reviewInput(root, body)
  const args = ['record', '--project', root, '--file', bodyPath, '--chapter', '1', '--input', input]
  const payload = JSON.parse(await readFile(input, 'utf8'))
  payload.findings[0].quote = '正文没有这句话'
  await writeFile(input, JSON.stringify(payload))
  const invalid = await run(review, args)
  expect(invalid.code).toBe(2)
  expect(invalid.stdout).toContain('quote is absent')
  await expect(readFile(join(root, reviewPath))).rejects.toMatchObject({ code: 'ENOENT' })
  await reviewInput(root, body)
  await writeFile(join(root, bodyPath), body + '新版。\n')
  const old = await run(review, args)
  expect(old.code).toBe(2)
  expect(old.stdout).toContain('changed since review started')
})

it('records short-story reviews without a chapter number', async () => {
  const { root, body } = await book()
  await writeFile(join(root, '正文.md'), body)
  const input = await reviewInput(root, body)
  const result = await run(review, ['record', '--project', root, '--file', '正文.md', '--input', input])
  expect(result.code, result.stdout).toBe(0)
  expect(JSON.parse(result.stdout).record_path).toBe('.story/reviews/正文.json')
  expect(JSON.parse(await readFile(join(root, '.story/reviews/正文.json'), 'utf8')))
    .toMatchObject({ chapter: null, body_path: '正文.md', body_sha256: digest(body) })
})

it.skipIf(process.platform === 'win32')('rejects review output symlinks that leave the book', async () => {
  const { root, body } = await book()
  const outside = await mkdtemp(join(tmpdir(), 'writer-review-outside-'))
  onTestFinished(async () => { await rm(outside, { recursive: true, force: true }) })
  await mkdir(join(root, '.story'))
  await symlink(outside, join(root, '.story/reviews'))
  const input = await reviewInput(root, body)
  const result = await run(review, ['record', '--project', root, '--file', bodyPath, '--chapter', '1', '--input', input])
  expect(result.code).toBe(2)
  expect(result.stdout).toContain('escapes the book')
  await expect(readFile(join(outside, '第001章.json'))).rejects.toMatchObject({ code: 'ENOENT' })
})
