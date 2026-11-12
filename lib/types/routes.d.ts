/**
 * The /usage-panel-plus/api route table: a small JSON RPC over the fenced web route.
 * Methods:
 *   - range  { range, from?, to?, source? } -> UsageStatsRange
 *   - status {} -> BackfillStatus
 *   - reset  {} -> drop every row + cursor, then rescan all persisted
 *              sessions (the store-rebuild escape hatch)
 * The prefix route /usage-panel-plus/api is registered on the webserver; each request
 * passes the browser-trust fence (Host-header loopback, a trusted authority, or
 * this listener's own bind address).
 */
import type { Context } from './context-types.ts';
import type { UsageWebRoute } from './context-types.ts';
import { UsageStore } from './store.ts';
import { UsageCollector } from './collector.ts';
import type { Granularity } from './query.ts';
import type { BackfillStatus, UsageStatsRange, UsageStatsRequest } from './wire.ts';
import { type TrustInputs } from './trust-fence.ts';
export interface RoutesDeps {
    store: UsageStore;
    collector: UsageCollector;
    /** Resolve the /usage-panel-plus/api trust inputs live: the trusted authorities, this
     *  listener's bind address, and its protocol (see trust-fence TrustInputs). */
    trust: () => TrustInputs;
    /** Whether a /reset rebuild pipeline is currently in flight (its scan
     *  makes the collector report running too — callers use this to tell that
     *  benign state apart from a boot scan and COALESCE onto the pipeline
     *  instead of refusing). */
    isRebuilding: () => boolean;
    /** Wipe the store at wipe-time live watermarks and re-run the full
     *  backfill (wired by the host half; concurrent calls coalesce into one
     *  rebuild). */
    resetAndRescan: () => Promise<void>;
}
/** Resolve a request's [from, to] into inclusive local day keys.
 *
 *  `range: 'all'` is the one preset whose start is NOT computed from today: the
 *  window runs from the earliest day the store holds up to today, so the
 *  caller must supply that first day (read through {@link UsageStore.firstDay}).
 *  When the store is empty the window collapses onto today, which renders the
 *  panel's empty state instead of a year-long blank chart. */
export declare function resolveRange(req: UsageStatsRequest, now?: Date, firstDay?: string | null): {
    from: string;
    to: string;
};
/** The trend granularity a range preset asks for: the two short presets read
 *  per hour, everything else (including custom) per day. */
export declare function granularityOf(range: string | undefined): Granularity;
/** Build the aggregate for a range from the store rows: the model-keyed
 *  bucket aggregate composed with the session dimension and the comparison
 *  window. Session rows are keyed by DAY, so the session split is always the
 *  [from, to] calendar window even when the trend is per hour. */
export declare function aggregateRange(store: UsageStore, from: string, to: string, granularity?: Granularity): Promise<UsageStatsRange>;
/** Build the single fenced prefix route serving the /usage-panel-plus/api JSON RPC.
 *  The host mounts it via `ctx.webServer.register` (which takes ONE WebRoute,
 *  not an array — matching the real dsh-host-webserver contract). */
export declare function buildUsageRoute(ctx: Context, deps: RoutesDeps): UsageWebRoute;
export type { BackfillStatus, UsageStatsRange, UsageStatsRequest };
