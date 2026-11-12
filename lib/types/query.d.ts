/**
 * Range aggregation engine — a TS translation of the reasonix stats query
 * (internal/stats/query.go). It folds raw usage records (per call + per turn)
 * into the RangeStats the panel renders: per-day totals broken down by model
 * and provider, range totals, derived active days / cache hit-rate / top
 * model, and the per-model / per-provider ranked splits.
 *
 * The cache hit-rate is derived only from the input side (cacheHit +
 * cacheMiss), while the headline token total is PROVIDER-INCLUSIVE —
 * uncached input + output + cache reads + cache writes. That is the number
 * a provider dashboard reports for the same calls (and reasonix's
 * TotalTokens): DSH's TokenUsage splits DeepSeek's prompt_tokens into
 * disjoint input/cacheRead buckets, so the naive input+output sum would
 * hide the (typically dominant) cached share. The two rate denominators
 * never mix with the total.
 */
import type { SessionTokenUsage, SessionUsageRowLike, UsageStatsAggregate } from './wire.ts';
import { dayKey, daysInRange, hourKey, providerOf } from './shared.ts';
export { dayKey, daysInRange, hourKey, providerOf };
/**
 * One atomic usage sample from a completed model call (or one completed
 * turn). A call sample carries the four token buckets and the model ref; a
 * turn marker carries only the day (the panel's "sessions" metric is one
 * completed turn). The request marker is ORTHOGONAL to the buckets: it counts
 * one provider call, and it rides alone on a call that reported no tokens
 * (`step/start`, a started retry) or alongside the buckets when the call
 * reports its own usage (`compaction/summary` — a call no `step/start`
 * opened).
 */
export interface UsageSample {
    day: string;
    /** Local calendar-hour key ("YYYY-MM-DDTHH"). Live and backfill samples
     *  always carry it; the aggregate's day-mode series ignores it. */
    hour?: string;
    model?: string;
    /** The session this call belongs to. The day/hour tables ignore it; the
     *  session table is the only place it is stored. Absent for calls outside a
     *  conversation (session-title generation). */
    session?: string;
    /** Event time (epoch ms) of the sample. A row's `lastSeen` uses it so a
     *  historical replay still orders sessions by real activity instead of by
     *  replay wall-clock. */
    at?: number;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    turn?: boolean;
    request?: boolean;
}
export interface RangeFilter {
    from: string;
    to: string;
}
/** Data granularity of the trend series: per local day, or per local hour
 *  for the short-range presets. */
export type Granularity = 'day' | 'hour';
/** Aggregate the samples intersecting [from, to]. Missing buckets yield zero
 *  entries so the trend chart shows the full timeline. */
export declare function aggregateSamples(samples: Iterable<UsageSample>, filter: RangeFilter, granularity?: Granularity): UsageStatsAggregate;
/** The session-dimension aggregate: the real conversation count plus one
 *  entry per conversation, ranked by tokens. Unknown-route requests are
 *  surfaced separately so the panel can state that share instead of hiding it
 *  inside a model row. */
export interface SessionAggregate {
    sessionCount: number;
    sessions: SessionTokenUsage[];
    unknownRequests: number;
}
/** Fold session-table rows intersecting [from, to] into per-session
 *  aggregates. Turn markers live on the synthetic "(turns)" model row, so
 *  their counters add turns only; token and request rows add their buckets.
 *  Rows whose model is "(unknown)" still contribute to the session's totals
 *  (the call was real), and their request count is also reported as the
 *  unknown-attribution share. */
export declare function aggregateSessionRows(rows: Iterable<SessionUsageRowLike>, titles: ReadonlyMap<string, string>, filter: RangeFilter): SessionAggregate;
