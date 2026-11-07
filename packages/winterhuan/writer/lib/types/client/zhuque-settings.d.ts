/**
 * Writer settings page (Zhuque + cover keys), browser half. Registers into the
 * Plugins page's `plugins.item` slot while the Host serves the `writer` namespace.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type WriterZhuqueLocaleKey } from './zhuque-locales.ts';
export type { ZhuqueSettingsCardProps } from './ZhuqueSettingsCard.tsx';
export type { WriterZhuqueCardFace, WriterZhuqueCardState, WriterZhuqueKeyControlState, WriterZhuqueSettings, } from './zhuque-settings-controller.ts';
export type { WriterZhuqueLocaleKey } from './zhuque-locales.ts';
export { WRITER_SETTINGS_NS, WriterZhuqueCardController } from './zhuque-settings-controller.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Writer Zhuque settings page copy. */
        'settings.writer': WriterZhuqueLocaleKey;
    }
}
/** Dictionary namespace owned by the Writing settings page. */
export declare const ZHUQUE_NS = "settings.writer";
/** Cordis services the Writing settings page needs beyond the sidebar. */
export declare const zhuqueInject: readonly ["remote.credentials", "configForms"];
/**
 * Mount the Writing settings page while the Host serves the writer namespace.
 * @param ctx - the browser plugin context.
 */
export declare function applyZhuqueSettings(ctx: ClientContext): void;
//# sourceMappingURL=zhuque-settings.d.ts.map