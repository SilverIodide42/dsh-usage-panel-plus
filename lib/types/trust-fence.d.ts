/**
 * Browser-trust fence for the /usage-panel-plus/api routes, mirroring the official /api
 * gateway fence (dsh-client-connection `isTrustedApiRequest`). A route accepts
 * a request only when ALL of these hold:
 *
 * 1. Host fence (DNS-rebinding defense): the Host header names the loopback
 *    interface, a trusted authority, or the listener's own bind address. A
 *    port-less trustedHosts entry matches its hostname on ANY port, an entry
 *    with an explicit port matches that exact host:port; both sides compare
 *    through WHATWG URL normalization, so case and a redundant default port
 *    never decide trust.
 * 2. Cross-site fence: a browser-labeled `sec-fetch-site: cross-site`
 *    request is refused regardless of Origin.
 * 3. Origin fence: when a browser attaches an Origin it must be exactly the
 *    Host authority; the literal "null" (sandboxed iframes, file: pages) is
 *    an opaque origin and refused. Absent Origin is fine — the Host fence
 *    already bound the request.
 *
 * The three trust inputs are read live per request, because the host line
 * decides where each of them lives (see TrustInputs): DSH 0.2.1-alpha.2 moved
 * the explicit authorities onto the `webStartup` provider, deleted the
 * `webRuntime` service whose list also carried the LAN literals sampled at bind
 * time, and began admitting the listener's own bind address independently of
 * that list. The face stays structural (no node:types) so it can live in the
 * shared declaration graph.
 */
import type { UsageHttpRequest } from './context-types.ts';
/**
 * Whether a WHATWG URL hostname names the loopback authority. The input is
 * expected in URL hostname form (IPv6 literals keep their brackets), matching
 * dsh-client-connection's loopback classification: localhost, [::1], or any
 * IPv4 address in 127/8.
 */
export declare function isLoopbackHostname(hostname: string): boolean;
/** The raw Host header value (lowercased), or null when absent. */
export declare function parseHostHeader(req: UsageHttpRequest): string | null;
/**
 * The live trust inputs one fence evaluation reads. Every field is optional in
 * the sense that a host line may not publish it; the fence falls back to the
 * narrower behavior.
 */
export interface TrustInputs {
    /** Authorities this deployment serves, beyond loopback and its own bind
     *  address: `--trusted-host` on DSH >= 0.2.1-alpha.2, that list plus the LAN
     *  literals sampled at bind time before it. */
    trustedHosts: readonly string[];
    /** The listener's configured bind address, admitted on any port. A concrete
     *  IPv4 or IPv6 literal on every host line (`webServer.host`). */
    bindHost?: string;
    /** The listener's protocol, for default-port normalization. Treated as plain
     *  HTTP when the host line does not publish it. */
    protocol?: 'http:' | 'https:';
}
export interface TrustFence {
    /** Accept the request when the Host is ours (loopback, trusted, or this
     *  listener's bind address) and any attached browser markers are same-origin. */
    isTrusted(req: UsageHttpRequest): boolean;
}
export declare function createTrustFence(trust: () => TrustInputs): TrustFence;
