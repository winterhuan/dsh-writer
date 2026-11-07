import type { IncomingHttpHeaders } from 'node:http';
interface TrustRequest {
    readonly headers: IncomingHttpHeaders | Headers;
}
/**
 * Reject a trustedHosts entry that is not a bare host or host:port.
 * @param entry - one configured authority.
 */
export declare function assertTrustedWriterAuthority(entry: string): void;
/**
 * Accept loopback and configured authorities, and reject cross-site browser requests.
 * @param request - the incoming request.
 * @param trustedHosts - extra authorities from plugin config.
 * @returns whether the write route may run.
 */
export declare function isTrustedWriterRequest(request: TrustRequest, trustedHosts: readonly string[]): boolean;
export {};
//# sourceMappingURL=request-trust.d.ts.map