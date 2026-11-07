/** Writing-mode browser entry: sidebar workbench and Writing settings card (Zhuque + cover). */
import type { Context } from '@deepseek-ai/cordis';
import './plugin.css';
import { name } from './sidebar.tsx';
export { name };
export type { ZhuqueSettingsCardProps, WriterZhuqueCardFace, WriterZhuqueCardState, WriterZhuqueKeyControlState, WriterZhuqueLocaleKey, WriterZhuqueSettings, } from './zhuque-settings.ts';
export { WRITER_SETTINGS_NS, WriterZhuqueCardController, ZHUQUE_NS } from './zhuque-settings.ts';
/** Services required by the sidebar and the Writing settings page. */
export declare const inject: string[];
/**
 * Register the writing sidebar and the Plugins-page Writing credential entry.
 * @param context - browser services.
 */
export declare function apply(context: Context): void;
//# sourceMappingURL=index.d.ts.map