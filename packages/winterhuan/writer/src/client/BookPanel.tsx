/** On-demand chapter progress and cited reviews inside the existing writing sidebar. */
import { useEffect, useState } from 'react'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { isEditableWriterPath, safeRelative } from '../editable.ts'
import { readBookStatus, selectedChapter, type BookStatus } from './book-status.ts'
import { readWorkspaceText, remoteMessage } from './read.ts'
import { normalizeEol } from './eol.ts'
import { RevisionDiff } from './RevisionDiff.tsx'
import type { zh } from './locales.ts'

interface Props {
  readonly sessionId: SessionId
  readonly cwd: string
  readonly remote: ClientRemote
  readonly projects: readonly { path: string; name: string }[]
  readonly active: string | undefined
  readonly draft: string
  readonly dirty: boolean
  readonly version: string | undefined
  readonly visible: boolean
  readonly onOpen: (path: string) => void
  readonly t: (key: keyof typeof zh) => string
}

function missing(error: { readonly code: string }): boolean {
  return error.code === 'workspace-file/not-found'
}

const checkLabels = {
  ready: 'checkReady', needs_decision: 'checkDecision', blocked: 'checkBlocked', invalid: 'checkBlocked', tool_unavailable: 'checkUnavailable',
} as const

/**
 * Read a single book's reports when expanded, without running tools or editing tracking files.
 * @param props - workspace identity, current draft, discovered books, and file-selection action.
 * @returns collapsible progress and review details.
 */
export function BookPanel({ sessionId, cwd, remote, projects, active, draft, dirty, version, visible, onOpen, t }: Props) {
  const [open, setOpen] = useState(false)
  const [bookPick, setBookPick] = useState<string | undefined>()
  const [activeBook, setActiveBook] = useState<string | undefined>()
  const [chapterPick, setChapterPick] = useState<number | undefined>()
  const [chapterInput, setChapterInput] = useState<string | undefined>()
  const [status, setStatus] = useState<BookStatus | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const bookPaths = projects.map(project => project.path).join('\0')
  const containing = projects.filter(project => project.path === '' || active?.startsWith(`${project.path}/`))
    .sort((left, right) => right.path.length - left.path.length)[0]?.path
  const book = bookPick !== undefined && projects.some(project => project.path === bookPick) ? bookPick
    : containing ?? (activeBook !== undefined && projects.some(project => project.path === activeBook) ? activeBook : projects.length === 1 ? projects[0]?.path : undefined)
  const withinBook = active === undefined || book === undefined ? undefined
    : book === '' ? active : active.startsWith(`${book}/`) ? active.slice(book.length + 1) : undefined
  const chapter = chapterPick ?? (withinBook === undefined ? undefined : selectedChapter(withinBook))
  const joinBook = (path: string): string => book === '' ? path : `${book}/${path}`

  useEffect(() => { setChapterPick(undefined); setChapterInput(undefined) }, [active, book])
  useEffect(() => {
    if (!open || !visible) return
    const controller = new AbortController()
    void readWorkspaceText(remote, sessionId, `${cwd}/.active-book`, controller.signal).then(result => {
      if (controller.signal.aborted || !result.ok) return
      const path = result.value.text.trim().replace(/\/$/u, '')
      if (path === '.' || safeRelative(path)) setActiveBook(path === '.' ? '' : path)
    }).catch(() => { /* This optional preference does not determine report validity. */ })
    return () => { controller.abort() }
  }, [open, visible, remote, sessionId, cwd, refresh])

  useEffect(() => {
    if (!open || !visible || book === undefined) return
    const controller = new AbortController()
    const absolute = (path: string): string => `${cwd}/${book === '' ? '' : `${book}/`}${path}`
    setLoading(true)
    setError(undefined)
    setStatus(undefined)
    void readBookStatus({
      read: async path => {
        const result = await readWorkspaceText(remote, sessionId, absolute(path), controller.signal)
        if (result.ok) return result.value.text
        if (missing(result.error)) return undefined
        throw new Error(`${path}: ${remoteMessage(result.error, t('loadError'))}`)
      },
      list: async path => {
        const result = await remote.workspaceFiles.list(sessionId, absolute(path), controller.signal)
        if (result.ok) {
          if (result.value.truncated) throw new Error(`${path}: ${t('truncated')}`)
          return result.value.entries
        }
        if (missing(result.error)) return []
        throw new Error(`${path}: ${remoteMessage(result.error, t('loadError'))}`)
      },
    }, chapter).then(value => {
      if (!controller.signal.aborted) setStatus(value)
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : t('loadError'))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { controller.abort() }
  }, [open, visible, book, chapter, sessionId, cwd, remote, version, refresh, bookPaths, t])

  if (projects.length === 0) return null
  const check = status?.check
  const draftAffectsChapter = dirty && withinBook !== undefined && (selectedChapter(withinBook) === status?.chapter
    || withinBook === check?.outlinePath || withinBook === check?.bodyPath)
  const review = status?.review
  const reviewDraft = review !== undefined && withinBook === review.bodyPath ? draft : undefined
  const staleReview = review?.stale === true || (review !== undefined && reviewDraft !== undefined && normalizeEol(review.bodyText) !== reviewDraft)
  return <details className="writer-book-panel" open={open} onToggle={event => { setOpen(event.currentTarget.open) }}>
    <summary>{t('bookPanelTitle')}</summary>
    {open && <div className="writer-book-content">
      <div className="writer-book-controls">
        <label>{t('bookPanelBook')} <select value={book ?? '__choose__'} onChange={event => { setBookPick(event.target.value) }}>
          {book === undefined && <option value="__choose__">{t('bookChoose')}</option>}
          {projects.map(project => <option key={project.path} value={project.path}>{project.name || t('workspaceBook')}</option>)}
        </select></label>
        {book !== undefined && chapter !== null && status?.chapter !== null && <label>{t('bookPanelChapter')} <input
          type="number" min={1} value={chapterInput ?? chapterPick ?? status?.chapter ?? 1}
          onChange={event => { setChapterInput(event.target.value) }}
          onBlur={event => { const value = Number(event.target.value); if (Number.isSafeInteger(value) && value > 0) setChapterPick(value); else setChapterInput(undefined) }}
          onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}
        /></label>}
        <button type="button" disabled={loading} onClick={() => { setRefresh(value => value + 1) }}>{t('bookRefresh')}</button>
      </div>
      {book === undefined ? <p>{t('bookChoose')}</p> : loading ? <p role="status">{t('loading')}</p> : error !== undefined ? <p role="alert">{t('bookRecordError').replace('{path}', error)}</p> : status !== undefined && <>
        <p>{status.title || projects.find(project => project.path === book)?.name} · {status.lastChapter === undefined
          ? t('bookNoTracking') : t('bookCommitted').replace('{n}', String(status.lastChapter))}</p>
        {status.lastChapter !== undefined && <p>{t('bookNext').replace('{n}', String(status.lastChapter + 1))}</p>}
        {status.commitments.length > 0 && <details><summary>{t('bookCommitments')}</summary><ul>{status.commitments.map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
        <div className="writer-book-report">
          <strong>{t('bookMechanical')}</strong>
          <p>{check === undefined ? t('bookUnchecked') : check.stale || draftAffectsChapter ? t('bookStale')
            : t(checkLabels[check.status as keyof typeof checkLabels] ?? 'checkUnavailable')}</p>
          {check !== undefined && <>
            <p>{t('bookWordcount').replace('{actual}', String(check.actual)).replace('{target}', String(check.target))}</p>
            {check.findings.length > 0 && <ul>{check.findings.map((finding, index) => <li key={index}>{finding}</li>)}</ul>}
            <button type="button" onClick={() => { onOpen(joinBook(check.path)) }}>{t('bookOpenCheck')}</button>
          </>}
          <p className="writer-muted">{t('bookCheckHelp')}</p>
        </div>
        <div className="writer-book-report">
          <strong>{t('bookSemantic')}</strong>
          <p>{review === undefined ? t('bookUnreviewed') : staleReview ? t('bookStaleReview') : t('bookReviewCurrent')}</p>
          {review !== undefined && <>
            <p>{review.summary}</p>
            <ul>{review.findings.map(finding => <li key={finding.id}>
              <span>{t(finding.severity === 'must' ? 'reviewMust' : finding.severity === 'suggestion' ? 'reviewSuggestion' : 'reviewOptional')} · {t('reviewLine').replace('{n}', String(finding.line))}</span>
              <blockquote>{finding.quote}</blockquote>
              <p>{finding.explanation}</p><p>{finding.suggestion}</p>
              {!staleReview && finding.resolution !== undefined && <span>{t(finding.resolution === 'accepted' ? 'reviewAccepted' : 'reviewResolved')}</span>}
            </li>)}</ul>
            <details><summary>{t('reviewChanges')}</summary><RevisionDiff path={review.bodyPath} before={normalizeEol(review.bodyText)} after={reviewDraft ?? normalizeEol(review.currentText)} t={t} /></details>
            <button type="button" onClick={() => { onOpen(joinBook(review.path)) }}>{t('bookOpenReview')}</button>
            <p className="writer-muted">{t('reviewResolveHelp')}</p>
          </>}
        </div>
        {status.workFiles.length > 0 && <div className="writer-book-report"><strong>{t('bookUnfinished')}</strong>
          <p>{t('bookResumeHelp')}</p>
          {status.workFiles.filter(isEditableWriterPath).map(path => <button key={path} type="button" onClick={() => { onOpen(joinBook(path)) }}>{path.split('/').pop()}</button>)}
        </div>}
      </>}
    </div>}
  </details>
}
