import './plugin.css';
import { apply as applySidebar, inject as sidebarInject, name } from "./sidebar.js";
import { applyZhuqueSettings, zhuqueInject } from "./zhuque-settings.js";
export { name };
export { WRITER_SETTINGS_NS, WriterZhuqueCardController, ZHUQUE_NS } from "./zhuque-settings.js";
/** Services required by the sidebar and the Writing settings page. */
export const inject = [
    ...sidebarInject,
    ...zhuqueInject,
];
/**
 * Register the writing sidebar and the Plugins-page Writing credential entry.
 * @param context - browser services.
 */
export function apply(context) {
    applySidebar(context);
    applyZhuqueSettings(context);
}
//# sourceMappingURL=index.js.map