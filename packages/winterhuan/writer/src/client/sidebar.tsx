/** Register the writing sidebar: tab type, then the keyed body slot. */
import type { Context } from '@deepseek-ai/cordis'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import { IconEditOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { useEffect } from 'react'
import { en, NS, zh } from './locales.ts'
import { registerWriterTab } from './mode.ts'
import { WriterDesk } from './desk.tsx'
import type { createWriterWorkbenchStore } from './workbench-store.ts'

export const name = 'writer'
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs', 'layout', 'remote', 'remote.workspaceFiles']

const TAB_ID = '@winterhuan/dsh-writer'
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap { 'writer.sidebar.launcher': { kind: 'single'; scope: 'root'; owner: { sessionId: SessionId } } }
}
type Props = PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<typeof NS> & PropsRenderSlots<'writer.sidebar.launcher'> & { readonly remote: ClientRemote }
type LauncherInjected = { readonly openWorkbench: () => void }
type LauncherProps = PropsRuntime<'writer.sidebar.launcher'> & PropsLocale<typeof NS> & PropsStore<ReturnType<typeof createWriterWorkbenchStore>> & InjectFace<LauncherInjected>

function WorkbenchLauncher({ sessionId, t, actions, openWorkbench }: LauncherProps) {
  return <header className="writer-sidebar-heading"><button type="button" onClick={() => { actions.openFromSidebar(sessionId); openWorkbench() }}>{t('openWorkbench')}</button></header>
}

function Sidebar({ sessionId, useTabInfo, useSessions, t, remote, renderSlot }: Props) {
  const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset)
  const cwd = useSessions(state => state.byId[sessionId]?.cwd)
  const { tab } = useTabInfo()
  useEffect(() => { if (typeof preset === 'string' && preset !== 'writer') tab.actions.close() }, [preset, tab.actions])
  if (preset !== 'writer') return null
  return <div className="writer-sidebar">
    {renderSlot('writer.sidebar.launcher', { sessionId })}
    {cwd === undefined ? <p className="writer-empty">{t('noWorkspace')}</p> : <WriterDesk sessionId={sessionId} cwd={cwd} remote={remote} t={t} visible={tab.visible} />}
  </div>
}

/**
 * Register the writing tab and its body. The guide entry follows the selected preset.
 * @param context - browser services.
 * @param store - viewing preferences shared with the full workbench.
 */
export function apply(context: Context, store: ReturnType<typeof createWriterWorkbenchStore>): void {
  context.effect(() => context.locale.register(NS, { zh, en }), 'writer: dictionaries')
  const t = context.locale.bind(NS)
  context.effect(() => registerWriterTab(context, {
    id: TAB_ID,
    kind: 'writer',
    title: () => t('title'),
    guide: [{ id: 'writer', order: 22, title: () => t('title'), description: () => t('description'), icon: IconEditOutlineRegular }],
  }), 'writer: sidebar type')
  context.effect(() => context.slots.inject('sidebar.right.pane.tab', () => context.slots.register(
    { name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS, children: { 'writer.sidebar.launcher': { kind: 'single', scope: 'root' } }, inject: () => ({ remote: context.remote }) },
    Sidebar,
  )), 'writer: sidebar body')
  context.effect(() => context.slots.inject('writer.sidebar.launcher', () => context.slots.register(
    { name: 'writer.sidebar.launcher', locale: NS, store, inject: (): LauncherInjected => ({ openWorkbench: () => context.layout.selectPanel('writer-workbench' as MainPanelId) }) },
    WorkbenchLauncher,
  )), 'writer: sidebar workbench launcher')
}
