import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { zh } from './locales.ts';
interface Props {
    readonly sessionId: SessionId;
    readonly cwd: string;
    readonly remote: ClientRemote;
    readonly projects: readonly {
        path: string;
        name: string;
    }[];
    readonly active: string | undefined;
    readonly draft: string;
    readonly dirty: boolean;
    readonly version: string | undefined;
    readonly visible: boolean;
    readonly onOpen: (path: string) => void;
    readonly t: (key: keyof typeof zh) => string;
}
/**
 * Read a single book's reports when expanded, without running tools or editing tracking files.
 * @param props - workspace identity, current draft, discovered books, and file-selection action.
 * @returns collapsible progress and review details.
 */
export declare function BookPanel({ sessionId, cwd, remote, projects, active, draft, dirty, version, visible, onOpen, t }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=BookPanel.d.ts.map