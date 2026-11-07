import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SettingsForm, SettingsSecretField, SettingsValueField } from '@deepseek-ai/dsh-client-ui-primitives';
import { formLabels } from "./zhuque-locales.js";
/**
 * Render the Writer settings page, or its one-liner when the Plugins page asks for a summary.
 * @param props - the view asked for, locale copy, the page snapshot, and its form actions.
 * @returns the one-liner, or the form.
 */
export function ZhuqueSettingsCard(props) {
    const { t } = props;
    const state = props.useWriterZhuqueCard(snapshot => snapshot);
    if (props.view === 'summary')
        return t('description');
    const control = state.key;
    const cover = state.coverKey;
    return (_jsxs(SettingsForm, { labels: formLabels(t), state: state, onSave: props.save, onDiscard: props.discard, children: [_jsx(SettingsSecretField, { id: "plugin-config-writer-makers-key", label: t('makersKeyLabel'), hint: t(control.writable ? 'makersKeyHint' : 'makersKeyReadOnlyHint'), stateLabel: control.configured ? t('keySet') : t('keyUnset'), onEdit: (text) => { props.edit('makersApiKey', text); }, disabled: !control.writable, text: control.draft.text, configured: control.configured }), _jsx(SettingsSecretField, { id: "plugin-config-writer-cover-key", label: t('coverKeyLabel'), hint: t(cover.writable ? 'coverKeyHint' : 'coverKeyReadOnlyHint'), stateLabel: cover.configured ? t('keySet') : t('keyUnset'), onEdit: (text) => { props.edit('gptImageApiKey', text); }, disabled: !cover.writable, text: cover.draft.text, configured: cover.configured }), _jsx(SettingsValueField, { id: "plugin-config-writer-cover-base-url", label: t('gptImageBaseUrlLabel'), hint: t('gptImageBaseUrlHint'), overriddenLabel: t('overridden'), resetLabel: t('reset'), invalidLabel: t('invalidText'), placeholder: t('gptImageBaseUrlPlaceholder'), disabled: !state.writable, ...state.gptImageBaseUrl, onEdit: (text) => { props.edit('gptImageBaseUrl', text); }, onReset: () => { props.resetField('gptImageBaseUrl'); } })] }));
}
//# sourceMappingURL=ZhuqueSettingsCard.js.map