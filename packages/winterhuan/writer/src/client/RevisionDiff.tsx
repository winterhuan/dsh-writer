/** Reuse DSH's bounded diff renderer for draft and review-version comparisons. */
import { DiffBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import { useMemo } from 'react'
import type { zh } from './locales.ts'

/**
 * Render an explicit comparison without changing either version.
 * @param props - source versions and localized chrome.
 * @returns the shared diff, or an unchanged message.
 */
export function RevisionDiff({ path, before, after, t }: {
  readonly path: string
  readonly before: string
  readonly after: string
  readonly t: (key: keyof typeof zh) => string
}) {
  const diffs = useMemo(() => [{ path, oldText: before, newText: after }], [path, before, after])
  if (before === after) return <p className="writer-muted">{t('diffUnchanged')}</p>
  return <DiffBlock diffs={diffs} labels={{
    codeLabel: t('diffTitle'), wrapLabel: t('diffWrap'), unwrapLabel: t('diffUnwrap'),
    copy: t('diffCopy'), copied: t('diffCopied'), collapseAria: t('diffCollapse'), collapse: t('diffCollapse'),
    expandAria: hidden => t('diffExpand').replace('{n}', String(hidden)),
    expand: hidden => t('diffExpand').replace('{n}', String(hidden)),
  }} />
}
