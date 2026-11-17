/** Writing-mode browser entry: sidebar workbench and Writing settings card (Zhuque + cover). */
import type { Context } from '@deepseek-ai/cordis'
import './plugin.css'
import { apply as applySidebar, inject as sidebarInject, name } from './sidebar.tsx'
import { applyZhuqueSettings, zhuqueInject } from './zhuque-settings.ts'
import { apply as applyWorkbench, inject as workbenchInject } from './workbench-entry.tsx'
import { createWriterWorkbenchStore } from './workbench-store.ts'

export { name }
export type {
  ZhuqueSettingsCardProps, WriterZhuqueCardFace, WriterZhuqueCardState,
  WriterZhuqueKeyControlState, WriterZhuqueLocaleKey, WriterZhuqueSettings,
} from './zhuque-settings.ts'
export { WRITER_SETTINGS_NS, WriterZhuqueCardController, ZHUQUE_NS } from './zhuque-settings.ts'

/** Services required by the sidebar and the Writing settings page. */
export const inject = [
  ...zhuqueInject,
  ...workbenchInject,
  ...sidebarInject,
]

/**
 * Register the writing sidebar and the Plugins-page Writing credential entry.
 * @param context - browser services.
 */
export function apply(context: Context): void {
  const workbenchStore = createWriterWorkbenchStore()
  applySidebar(context, workbenchStore)
  applyWorkbench(context, workbenchStore)
  applyZhuqueSettings(context)
}
