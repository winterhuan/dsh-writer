/** Writing-mode browser entry: sidebar workbench and Writing settings card (Zhuque + cover). */
import type { Context } from '@deepseek-ai/cordis'
import './plugin.css'
import { name } from './sidebar.tsx'
import { applyZhuqueSettings, zhuqueInject } from './zhuque-settings.ts'
import { apply as applyWorkbench, inject as workbenchInject } from './workbench-entry.tsx'

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
]

/**
 * Register the writing sidebar and the Plugins-page Writing credential entry.
 * @param context - browser services.
 */
export function apply(context: Context): void {
  applyWorkbench(context)
  applyZhuqueSettings(context)
}
