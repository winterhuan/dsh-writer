/** Dual-tab workspace tree, filename search, and the prose editor shell. */
import type { ClientRemote } from '@deepseek-ai/dsh-api-gateway/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { zh } from './locales.ts';
type Copy = (key: keyof typeof zh) => string;
interface DeskProps {
    readonly sessionId: SessionId;
    readonly cwd: string;
    readonly remote: ClientRemote;
    readonly t: Copy;
    readonly visible: boolean;
}
/**
 * The writing sidebar body for one session.
 * @param props - session, workspace root, remote, and copy.
 * @returns the desk.
 */
export declare function WriterDesk({ sessionId, cwd, remote, t, visible }: DeskProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=desk.d.ts.map