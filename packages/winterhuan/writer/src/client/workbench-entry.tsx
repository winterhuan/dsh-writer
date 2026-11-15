/** Main panel and sidebar launcher registration for the Writer workbench. */
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
import { en, zh } from './workbench-locales.ts'
import { en as deskEn, NS as DESK_NS, zh as deskZh } from './locales.ts'
import { Launcher, Main, NativeConversation, Workbench } from './workbench.tsx'

export const inject = ['slots', 'locale', 'layout', 'sessions', 'uiSession', 'uiWorkspace', 'conversation', 'remote', 'remote.workspaceFiles']

/** @param ctx - native Client services for panel selection, Sessions, and input drafts. */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register('writerWorkbench', { en, zh }), 'writer: workbench locale')
  ctx.effect(() => ctx.locale.register(DESK_NS, { en: deskEn, zh: deskZh }), 'writer: document locale')
  const t = ctx.locale.bind('writerWorkbench')
  const deskT = ctx.locale.bind(DESK_NS)
  ctx.effect(() => ctx.slots.inject('main', function* () {
    yield ctx.slots.register({ name: 'main', key: 'writer-workbench', children: { 'writer.workbench': { kind: 'single', scope: 'root' } } }, Main)
    yield ctx.slots.register({
      name: 'writer.workbench', locale: 'writerWorkbench',
      children: { 'writer.workbench.conversation': { kind: 'single', scope: 'session' } },
      inject: () => ({
        retain: (id: string) => ctx.sessions.retain(id as never, { source: 'mainView' }),
        action: async (value: unknown) => await request('/writer-workbench', value) as never,
        load: async () => validateCatalog(await request('/writer-workbench')),
        openSession: (id: string) => { ctx.uiWorkspace.openSession(id as never) },
        initializeDraft: (reference: import('@deepseek-ai/dsh-api-session-controller/client').SessionReference, prompt: string) => ctx.conversation.input.requestDraftInitialization(reference.binding, { prompt, whenDraftExists: 'append' }),
        remote: ctx.remote,
        deskT: (key: string) => deskT(key as keyof typeof import('./locales.ts').zh),
      }),
    }, Workbench)
  }), 'writer: workbench panel')
  ctx.effect(() => ctx.slots.inject('writer.workbench.conversation', () => ctx.slots.register({ name: 'writer.workbench.conversation' }, NativeConversation)), 'writer: native conversation')
  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'writer-workbench', order: 26, label: () => t('title'), locale: 'writerWorkbench' }, Launcher)), 'writer: workbench launcher')
}

async function request(path: string, value?: unknown): Promise<unknown> {
  const response = await fetch(path, value === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) })
  const result: unknown = await response.json()
  if (!response.ok) throw new Error(result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : 'workbenchFailed')
  return result
}
function validateCatalog(value: unknown): import('../workbench-types.ts').WriterCatalog {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { books?: unknown }).books) || !Array.isArray((value as { workspaces?: unknown }).workspaces)) throw new Error('loadFailed')
  return value as import('../workbench-types.ts').WriterCatalog
}
