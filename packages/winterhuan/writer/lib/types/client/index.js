import './plugin.css';
import { name } from "./sidebar.js";
import { applyZhuqueSettings, zhuqueInject } from "./zhuque-settings.js";
import { apply as applyWorkbench, inject as workbenchInject } from "./workbench-entry.js";
export { name };
export { WRITER_SETTINGS_NS, WriterZhuqueCardController, ZHUQUE_NS } from "./zhuque-settings.js";
/** Services required by the sidebar and the Writing settings page. */
export const inject = [
    ...zhuqueInject,
    ...workbenchInject,
];
/**
 * Register the writing sidebar and the Plugins-page Writing credential entry.
 * @param context - browser services.
 */
export function apply(context) {
    applyWorkbench(context);
    applyZhuqueSettings(context);
}
//# sourceMappingURL=index.js.map