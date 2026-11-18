/** Register the writing sidebar: tab type, then the keyed body slot. */
import type { Context } from '@deepseek-ai/cordis'
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { IconEditOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { useEffect } from 'react'
import { en, NS, zh } from './locales.ts'
import { registerWriterTab } from './mode.ts'
import { WriterDesk } from './desk.tsx'

export const name = 'writer'
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs', 'remote', 'remote.workspaceFiles']

const TAB_ID = '@winterhuan/dsh-writer'
type Props = PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<typeof NS> & { readonly remote: ClientRemote }

function Sidebar({ sessionId, useTabInfo, useSessions, t, remote }: Props) {
  const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset)
  const cwd = useSessions(state => state.byId[sessionId]?.cwd)
  const running = useSessions(state => state.byId[sessionId]?.running ?? false)
  const { tab } = useTabInfo()
  useEffect(() => { if (typeof preset === 'string' && preset !== 'writer') tab.actions.close() }, [preset, tab.actions])
  if (preset !== 'writer') return null
  return <div className="writer-sidebar">
    {cwd === undefined ? <p className="writer-empty">{t('noWorkspace')}</p> : <WriterDesk sessionId={sessionId} cwd={cwd} running={running} remote={remote} t={t} visible={tab.visible} />}
  </div>
}

/**
 * Register the writing tab and its body. The guide entry follows the selected preset.
 * @param context - browser services.
 */
export function apply(context: Context): void {
  context.effect(() => context.locale.register(NS, { zh, en }), 'writer: dictionaries')
  const t = context.locale.bind(NS)
  context.effect(() => registerWriterTab(context, {
    id: TAB_ID,
    kind: 'writer',
    title: () => t('title'),
    guide: [{ id: 'writer', order: 22, title: () => t('title'), description: () => t('description'), icon: IconEditOutlineRegular }],
  }), 'writer: sidebar type')
  context.effect(() => context.slots.inject('sidebar.right.pane.tab', () => context.slots.register(
    { name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS, inject: () => ({ remote: context.remote }) },
    Sidebar,
  )), 'writer: sidebar body')
}
