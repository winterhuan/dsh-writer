/**
 * The Writer settings page: Zhuque detection key and cover image API key.
 * Keys are written through the credentials domain, never into the settings section.
 */
import { type ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { WriterZhuqueCardFace } from './zhuque-settings-controller.ts';
/** Props the renderer binds for the Writer settings page. */
export type ZhuqueSettingsCardProps = PropsRuntime<'plugins.item'> & PropsLocale<'settings.writer'> & InjectFace<WriterZhuqueCardFace>;
/**
 * Render the Writer settings page, or its one-liner when the Plugins page asks for a summary.
 * @param props - the view asked for, locale copy, the page snapshot, and its form actions.
 * @returns the one-liner, or the form.
 */
export declare function ZhuqueSettingsCard(props: ZhuqueSettingsCardProps): ReactNode;
//# sourceMappingURL=ZhuqueSettingsCard.d.ts.map