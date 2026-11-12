/**
 * Wire contract shared by the host aggregation layer and the browser panel,
 * plus the JSON request/response helpers for the /usage-panel-plus/api route handlers.
 * These types mirror the reasonix stats wire (internal/stats/query.go +
 * desktop/stats_app.go): the aggregate response the panel renders maps 1:1
 * to the panel sections (totals, derived stats, daily trend, per-model
 * split). No Node or DOM types leak into the shared declarations — the HTTP
 * helpers are host-only and import the node faces explicitly.
 */
import type { UsageHttpRequest, UsageHttpResponse } from './context-types.ts';
/** One bucket's token usage and turn count in a trend series. The `day`
 *  field is the bucket key: "YYYY-MM-DD" in day mode, "YYYY-MM-DDTHH" in
 *  hour mode (see {@link UsageStatsRange.granularity}). */
export interface DailyTokenUsage {
    day: string;
    total: number;
    byModel: Record<string, number>;
    byProvider: Record<string, number>;
    requests: number;
    turns: number;
    cacheHit: number;
    cacheMiss: number;
}
/** One model's aggregate within the range. */
export interface ModelTokenUsage {
    model: string;
    provider: string;
    tokens: number;
    percent: number;
    /** Cached input tokens this model served in the range. Optional: an older
     *  host does not send it, and the row then shows no hit rate rather than a
     *  fabricated 0%. */
    cacheHit?: number;
    /** Uncached input tokens (input + cache writes) — the hit rate's
     *  denominator together with `cacheHit`. */
    cacheMiss?: number;
}
/** One provider's aggregate within the range (each provider may serve several models). */
export interface ProviderTokenUsage {
    provider: string;
    tokens: number;
    percent: number;
}
/** One session's aggregate within the range (the session dimension).
 *
 *  A session is the DSH conversation the calls were made from; the store's
 *  session table carries the id on every sample. `title` is the session's own
 *  `session/title` value when its log carries one, else ''. The times are
 *  epoch milliseconds of the earliest/latest sample INSIDE the range (0 when
 *  the row carries none). */
export interface SessionTokenUsage {
    session: string;
    title: string;
    tokens: number;
    requests: number;
    turns: number;
    cacheHit: number;
    cacheMiss: number;
    firstSeen: number;
    lastSeen: number;
    /** This session's model split, sorted by tokens desc; percent is relative
     *  to THIS session's tokens (0 when it has no token traffic). */
    models: ModelTokenUsage[];
}
/** Structural shape of one session-table row the aggregation reads. Kept in
 *  the wire layer (not imported from store.ts) so the query engine stays a
 *  pure data transform with no storage import. */
export interface SessionUsageRowLike {
    session: string;
    day: string;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    requests: number;
    turns: number;
    lastSeen: number;
    /** Earliest sample folded into the row; absent on rows written before the
     *  field existed (their lastSeen is the fallback). */
    firstSeen?: number;
}
/** Totals of the immediately preceding window of the same length — the
 *  comparison baseline the summary cards show as a delta. */
export interface RangeComparison {
    tokens: number;
    requests: number;
    turns: number;
    sessions: number;
    activeDays: number;
    cacheHit: number;
    cacheMiss: number;
}
/** The aggregate the shared sample fold produces: totals, derived stats and
 *  the per-bucket series. The session dimension and the comparison window are
 *  composed onto it by the host's range builder (they are not derivable from
 *  the model-keyed bucket rows). */
export interface UsageStatsAggregate {
    from: string;
    to: string;
    tokens: number;
    requests: number;
    turns: number;
    cacheHit: number;
    cacheMiss: number;
    activeDays: number;
    topModel: string;
    topProvider: string;
    /** Bucket size of `daily`: day presets and custom ranges group per day;
     *  the "today" / "last 3 days" presets group per local hour. */
    granularity: 'day' | 'hour';
    daily: DailyTokenUsage[];
    models: ModelTokenUsage[];
    providers: ProviderTokenUsage[];
}
/** The full aggregate the panel renders for one time range. */
export interface UsageStatsRange extends UsageStatsAggregate {
    /** Distinct sessions with any usage (tokens, requests or turns) in range. */
    sessionCount: number;
    /** Per-session aggregates, sorted by tokens desc. Capped at
     *  {@link MAX_SESSIONS_IN_RESPONSE}; `sessionCount` stays exact. */
    sessions: SessionTokenUsage[];
    /** Requests whose model attribution could not be resolved (the
     *  first-request-of-a-session case). They are inside `requests` already;
     *  this is the honest accounting of that share. */
    unknownRequests: number;
    /** Same-length window immediately before `from` (all-zero when there is no
     *  history there). `null` when a host predates the comparison: the cards then
     *  render without badges rather than lying about a change. */
    previous: RangeComparison | null;
}
/** Response cap for the per-session list. The session dimension is a
 *  drill-down, not a bulk export; the count stays exact. */
export declare const MAX_SESSIONS_IN_RESPONSE = 200;
/** The usage statistics panel aggregate request. */
export interface UsageStatsRequest {
    /** "today" | "3" | "7" | "14" | "30" | "90" | "all" | "custom".
     *  `all` runs from the store's earliest day up to today (see resolveRange). */
    range: string;
    from?: string;
    to?: string;
}
/** The backfill (historical session scan) progress state. */
export interface BackfillStatus {
    running: boolean;
    total: number;
    done: number;
    scannedSessions: number;
    lastSessionId?: string;
    error?: string;
}
/** One line of an async-iterable request body read as UTF-8 text. */
export declare function readJsonBody(req: UsageHttpRequest, maxBytes?: number): Promise<unknown>;
/** A user-visible error carrying its HTTP status. */
export declare class UsageError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
export declare function writeJson(res: UsageHttpResponse, value: unknown, status?: number): void;
export declare function writeError(res: UsageHttpResponse, err: unknown): void;
