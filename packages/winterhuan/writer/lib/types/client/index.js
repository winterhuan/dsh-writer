import './plugin.css';
import { apply as applySidebar, inject as sidebarInject, name } from "./sidebar.js";
import { applyZhuqueSettings, zhuqueInject } from "./zhuque-settings.js";
import { apply as applyWorkbench, inject as workbenchInject } from "./workbench-entry.js";
import { createWriterWorkbenchStore } from "./workbench-store.js";
export { name };
export { WRITER_SETTINGS_NS, WriterZhuqueCardController, ZHUQUE_NS } from "./zhuque-settings.js";
/** Services required by the sidebar and the Writing settings page. */
export const inject = [
    ...zhuqueInject,
    ...workbenchInject,
    ...sidebarInject,
];
/**
 * Register the writing sidebar and the Plugins-page Writing credential entry.
 * @param context - browser services.
 */
export function apply(context) {
    const workbenchStore = createWriterWorkbenchStore();
    applySidebar(context, workbenchStore);
    applyWorkbench(context, workbenchStore);
    applyZhuqueSettings(context);
}
//# sourceMappingURL=index.js.map