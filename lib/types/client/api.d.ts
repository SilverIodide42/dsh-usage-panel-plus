/**
 * Typed fetch wrapper over the usage JSON API. Every call posts to
 * `usage-panel-plus/api/<method>` — DOCUMENT-RELATIVE, never root-absolute — with a JSON
 * body; the host resolves the range and returns the aggregate (or the backfill
 * status). Failures surface as {@link UsageApiError} with the wire code.
 *
 * Relative is the dsh 0.1.7 contract: the served index carries `<base
 * href="./">` (packages/host/frontend-static), so browser references resolve
 * under whatever mount served the page. A root-absolute `/usage-panel-plus/api/...` only
 * works when the shell sits at the origin root and 404s behind a
 * prefix-stripping proxy; the host's own route key stays absolute
 * (`/usage-panel-plus/api` in src/routes.ts), because only the browser half is relative.
 */
import type { BackfillStatus, UsageStatsRange, UsageStatsRequest } from '../wire.ts';
/** One wire failure. */
export declare class UsageApiError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
/** Aggregate the usage panel renders for one range. */
export declare function fetchRange(req: UsageStatsRequest): Promise<UsageStatsRange>;
/** How long one range response stays reusable. Long enough that switching a
 *  range back and forth (or the heatmap window riding a re-render) does not
 *  re-run the aggregation, short enough that a live session's newest calls
 *  show up on their own — and every deliberate refresh bypasses it anyway. */
export declare const RANGE_CACHE_TTL_MS = 20000;
export interface FetchRangeOptions {
    /** Skip the cached copy. Every EXPLICIT read (the refresh button, the auto
     *  refresh tick, a post-rebuild reload) must do this — those are the
     *  reader asking for the store as it is right now. */
    noCache?: boolean;
}
/** {@link fetchRange} through the short TTL cache. */
export declare function fetchRangeCached(req: UsageStatsRequest, options?: FetchRangeOptions): Promise<UsageStatsRange>;
/** Drop every cached range. The rebuild wipes the store and replays the logs,
 *  so every cached aggregate describes data that no longer exists. */
export declare function clearRangeCache(): void;
/** Rebuild the statistics from the session logs. The host wipes every row plus
 *  the backfill cursor and replays all persisted sessions under the current
 *  attribution rules, so a drifted store converges back onto the logs; it
 *  refuses (409) only while a boot scan is still running. */
export declare function rebuildStats(): Promise<BackfillStatus>;
