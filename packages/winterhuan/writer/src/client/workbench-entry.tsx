/** Main panel, native conversation, and persistent operation feedback. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-workspace-files/remote'
import type {} from '@deepseek-ai/dsh-api-workspace-files/types'
import { createSnapshotStore, type ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import { Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { WriterBook } from '../workbench-types.ts'
import { en, zh } from './workbench-locales.ts'
import { NS as DESK_NS } from './locales.ts'
import { Launcher, Main, NativeConversation, Workbench, type WorkbenchInjected } from './workbench.tsx'
import type { createWriterWorkbenchStore } from './workbench-store.ts'

export const inject = ['slots', 'locale', 'layout', 'sessions', 'uiSession', 'uiWorkspace', 'conversation', 'remote', 'remote.workspaceFiles']
type Notice = { key: 'createdSession' | 'createdBook' | 'operationFailed'; sequence: number }
type NoticeInjected = { hooks: { notice: ObservableSnapshot<Notice | null> }; dismiss: () => void }
function WorkbenchNotice({ useNotice, dismiss, t }: InjectFace<NoticeInjected> & PropsLocale<'writerWorkbench'>) {
  const notice = useNotice(value => value)
  return notice ? <Toast key={notice.sequence} text={t(notice.key)} {...(notice.key !== 'operationFailed' ? { tone: 'success' as const } : {})} onDone={dismiss} /> : null
}

/** @param ctx - native Client services. @param store - preferences shared with the sidebar. */
export function apply(ctx: Context, store: ReturnType<typeof createWriterWorkbenchStore>): void {
  ctx.effect(() => ctx.locale.register('writerWorkbench', { en, zh }), 'writer: workbench locale')
  const t = ctx.locale.bind('writerWorkbench')
  const deskT = ctx.locale.bind(DESK_NS)
  const notice = createSnapshotStore<Notice | null>(null)
  let sequence = 0
  ctx.effect(() => ctx.slots.inject('main', function* () {
    yield ctx.slots.register({ name: 'main', key: 'writer-workbench', children: { 'writer.workbench': { kind: 'single', scope: 'root' } } }, Main)
    yield ctx.slots.register({
      name: 'writer.workbench', locale: 'writerWorkbench', store,
      children: { 'writer.workbench.conversation': { kind: 'single', scope: 'session' } },
      inject: (): WorkbenchInjected => ({
        retain: id => ctx.sessions.retain(id, { source: 'mainView' }),
        createSession: workspaceId => ctx.sessions.create({ workspaceId, agentPreset: 'writer' }),
        createBook: async input => await request(input),
        openSession: id => { ctx.uiWorkspace.openSession(id) },
        report: key => { notice.set({ key, sequence: ++sequence }) },
        remote: ctx.remote,
        deskT: key => deskT(key),
      }),
    }, Workbench)
  }), 'writer: workbench panel')
  ctx.effect(() => ctx.slots.inject('writer.workbench.conversation', () => ctx.slots.register({ name: 'writer.workbench.conversation' }, NativeConversation)), 'writer: native conversation')
  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'writer-workbench', order: 26, label: () => t('title'), locale: 'writerWorkbench' }, Launcher)), 'writer: workbench launcher')
  ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay', id: 'writer.workbench.notice', locale: 'writerWorkbench',
    inject: (): NoticeInjected => ({ hooks: { notice }, dismiss: () => { notice.set(null) } }),
  }, WorkbenchNotice)), 'writer: workbench feedback')
}

async function request(value: Parameters<WorkbenchInjected['createBook']>[0]): Promise<WriterBook> {
  const response = await fetch('/writer-workbench', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) })
  const result: unknown = await response.json()
  if (!response.ok) throw new Error(result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : 'workbenchFailed')
  return result as WriterBook
}
