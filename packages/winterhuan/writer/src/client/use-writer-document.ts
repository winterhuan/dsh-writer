/** One open document owns its reads, saves, and browser recovery copy. */
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { useEffect, useRef, useState } from 'react'
import {
  readWriterDraft, readWriterSelection, writeWriterDraft, writeWriterSelection,
  type WriterDraftStorageError,
} from './draft-storage.ts'
import { applyEol, detectEol, normalizeEol, type WriterEol } from './eol.ts'
import type { zh } from './locales.ts'
import { readWorkspaceText, remoteMessage } from './read.ts'
import { saveWriterFile, type WriterSave } from './save.ts'

type Copy = (key: keyof typeof zh) => string

interface DocumentState {
  readonly owner: object
  readonly path: string
  readonly text: string
  readonly baseText: string
  readonly version: string | undefined
  readonly eol: WriterEol
  readonly status: 'loading' | 'ready' | 'failed'
  readonly busy: boolean
  readonly conflict: boolean
  readonly notice: string | undefined
  readonly storageToken: string | null
}

/** Document state and actions consumed by the writing workbench. */
export interface WriterDocumentController {
  readonly active: string | undefined
  readonly draft: string
  readonly saved: string
  readonly version: string | undefined
  readonly eol: WriterEol
  readonly loading: boolean
  readonly ready: boolean
  readonly busy: boolean
  readonly dirty: boolean
  readonly conflict: boolean
  readonly notice: string | undefined
  readonly storageError: WriterDraftStorageError | undefined
  /** Open a file after the caller obtains any required discard confirmation. */
  readonly open: (path: string) => void
  /** Clear the editor after the caller obtains any required discard confirmation. */
  readonly close: () => void
  /** Read the disk again; only a successful read may discard the current draft. */
  readonly reload: (discard?: boolean) => void
  /** Update an already loaded document and its recovery copy. */
  readonly edit: (text: string) => void
  /** Save the current document using its own disk version. */
  readonly save: () => void
}

/**
 * Keep an editor alive while its sidebar is hidden. Mount separately per session/workspace.
 * @param remote - workspace file reader.
 * @param sessionId - session authorizing file access.
 * @param cwd - workspace root used to isolate recovery copies.
 * @param t - localized operation feedback.
 * @returns document state and actions; late replies cannot update another open file.
 */
export function useWriterDocument(remote: ClientRemote, sessionId: SessionId, cwd: string, t: Copy): WriterDocumentController {
  const [documentState, setDocumentState] = useState<DocumentState | undefined>()
  const [storageError, setStorageError] = useState<WriterDraftStorageError | undefined>()
  const current = useRef<DocumentState | undefined>(undefined)
  const mounted = useRef(true)
  const readController = useRef<AbortController | undefined>(undefined)
  const copy = useRef(t)
  copy.current = t

  const publish = (next: DocumentState | undefined): void => {
    current.current = next
    if (mounted.current) setDocumentState(next)
  }

  const update = (owner: object, change: (value: DocumentState) => DocumentState): void => {
    const value = current.current
    if (!mounted.current || value?.owner !== owner) return
    publish(change(value))
  }

  const persist = (value: DocumentState): DocumentState => {
    if (value.version === undefined) return value
    const draft = value.text === value.baseText ? undefined : {
      text: value.text, baseText: value.baseText, baseVersion: value.version, eol: value.eol,
    }
    const result = writeWriterDraft(cwd, value.path, draft, value.storageToken)
    setStorageError(result.error)
    return { ...value, storageToken: result.token }
  }

  const discard = (): void => {
    const value = current.current
    if (value === undefined) return
    const result = writeWriterDraft(cwd, value.path, undefined, value.storageToken)
    if (result.error !== undefined) setStorageError(result.error)
  }

  const load = (path: string, discardOnSuccess = false): void => {
    readController.current?.abort()
    const controller = new AbortController()
    readController.current = controller
    const previous = current.current?.path === path ? current.current : undefined
    const recovery = previous === undefined ? readWriterDraft(cwd, path) : undefined
    if (recovery?.error !== undefined) setStorageError(recovery.error)
    const draft = recovery?.draft
    const owner = {}
    publish({
      owner, path,
      text: previous?.text ?? draft?.text ?? '',
      baseText: previous?.baseText ?? draft?.baseText ?? '',
      version: previous?.version ?? draft?.baseVersion,
      eol: previous?.eol ?? draft?.eol ?? '\n',
      status: 'loading', busy: false, conflict: previous?.conflict ?? false,
      notice: undefined, storageToken: previous?.storageToken ?? recovery?.token ?? null,
    })
    const absolute = `${cwd.replace(/[/\\]+$/u, '')}/${path}`
    void readWorkspaceText(remote, sessionId, absolute, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      update(owner, (value) => {
        if (!result.ok) return { ...value, status: 'failed', notice: remoteMessage(result.error, copy.current('loadError')) }
        const diskText = normalizeEol(result.value.text)
        const unsaved = value.version !== undefined && value.text !== value.baseText
        if (!discardOnSuccess && unsaved && value.text !== diskText) {
          return {
            ...value, status: 'ready', conflict: value.version !== result.value.version,
            notice: draft === undefined ? undefined : copy.current('draftRecovered'),
          }
        }
        return persist({
          ...value, text: diskText, baseText: diskText, version: result.value.version,
          eol: detectEol(result.value.text), status: 'ready', conflict: false, notice: undefined,
        })
      })
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      update(owner, value => ({ ...value, status: 'failed', notice: error instanceof Error ? error.message : copy.current('loadError') }))
    })
  }

  useEffect(() => {
    mounted.current = true
    const path = readWriterSelection(cwd)
    if (path !== undefined) load(path)
    return () => {
      mounted.current = false
      readController.current?.abort()
    }
    // Session/workspace identity is the keyed WriterDesk mount, not sidebar visibility.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dirty = documentState !== undefined && documentState.text !== documentState.baseText
  useEffect(() => {
    if (!dirty) return undefined
    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => { window.removeEventListener('beforeunload', warn) }
  }, [dirty])

  const save = (): void => {
    const value = current.current
    if (value === undefined || value.version === undefined || value.status !== 'ready'
      || value.conflict || value.busy || value.text === value.baseText) return
    const { owner, path, text, version, eol } = value
    publish({ ...value, busy: true, notice: undefined })
    void saveWriterFile(sessionId, path, applyEol(text, eol), version, new AbortController().signal).then(async (response) => {
      const payload = await response.json() as WriterSave & { error?: string }
      update(owner, (latest) => {
        if (response.status === 412) return { ...latest, busy: false, conflict: true, notice: undefined }
        if (!response.ok) return { ...latest, busy: false, notice: payload.error ?? copy.current('saveError') }
        return persist({ ...latest, busy: false, baseText: text, version: payload.version, notice: copy.current('saved') })
      })
    }).catch(() => {
      update(owner, latest => ({ ...latest, busy: false, notice: copy.current('saveError') }))
    })
  }

  return {
    active: documentState?.path,
    draft: documentState?.text ?? '',
    saved: documentState?.baseText ?? '',
    version: documentState?.version,
    eol: documentState?.eol ?? '\n',
    loading: documentState?.status === 'loading',
    ready: documentState?.status === 'ready',
    busy: documentState?.busy ?? false,
    dirty, conflict: documentState?.conflict ?? false,
    notice: documentState?.notice, storageError,
    open: (path) => {
      if (path === current.current?.path) return
      discard()
      publish(undefined)
      if (!writeWriterSelection(cwd, path)) setStorageError('unavailable')
      load(path)
    },
    close: () => {
      readController.current?.abort()
      discard()
      publish(undefined)
      if (!writeWriterSelection(cwd, undefined)) setStorageError('unavailable')
    },
    reload: (discardOnSuccess = false) => {
      if (current.current !== undefined && !current.current.busy) load(current.current.path, discardOnSuccess)
    },
    edit: (text) => {
      const value = current.current
      if (value?.status !== 'ready') return
      publish(persist({ ...value, text, notice: undefined }))
    },
    save,
  }
}
