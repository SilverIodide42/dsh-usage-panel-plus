/**
 * Number/date formatting helpers for the usage panel — a TS translation of
 * reasonix's usageStatsFormat.ts plus the pure chart helpers from the panel
 * component.
 *
 * Pure date/model-ref helpers (`providerOf`, `daysBetween`) are re-exported
 * from the shared zero-dependency module so the host and client halves share
 * one implementation.
 */
export { providerOf, modelNameOf, daysInRange as daysBetween } from '../shared.ts';
import type { RangeComparison } from '../wire.ts';
/** Exact token counts with thousands separators — no 万/亿/k/M units, the
 *  user reads the precise number (long values shrink to fit via FitText).
 *  Compact units stay on the axis labels and card sub-values only. */
export declare function formatTokens(n: number): string;
/** English-style compact (B/M/K) for axis labels and card sub-values. */
export declare function formatCompact(n: number): string;
export declare function formatPercent(p: number): string;
/** Direction of one period-over-period comparison. `new` stands for "the
 *  previous window had nothing to compare against, so this is all new volume".
 *  It is a real state the callers still compute and filter on — the session
 *  card relies on it to stay silent when the previous window had no session
 *  coverage — but the badge renders NOTHING for it: there is no ratio, and a
 *  word in place of a number breaks the column the deltas form. */
export type CompareDirection = 'up' | 'down' | 'flat' | 'new';
/** One card's period-over-period change: a direction plus the change as a
 *  non-negative percentage of the previous window (0 for `new`). */
export interface CompareChange {
    direction: CompareDirection;
    percent: number;
}
/**
 * Compare two aggregates for the cards' delta badge.
 *
 * Every way the arithmetic can fail is folded into `null` (render no badge)
 * rather than leaking `NaN` / `Infinity` into the UI: a missing side (an old
 * host without `previous`, a rate with no input tokens at all) has nothing to
 * compare, and a previous window of 0 can only report "all new" — dividing by
 * it would print `Infinity%`.
 * @param current - this window's value, or null when it is undefined (a 0/0 rate).
 * @param previous - the preceding window's value, or null likewise.
 * @returns the change to render, or null when there is nothing honest to show.
 */
export declare function compareChange(current: number | null, previous: number | null): CompareChange | null;
/** Period-over-period change for the SESSION-COUNT card.
 *
 *  The session dimension is reconstructed from session logs, so it only
 *  covers conversations whose logs still exist. A previous window that
 *  carries real token volume but zero session rows therefore means "the
 *  session dimension cannot be reconstructed there" (the old logs were
 *  deleted) — claiming everything is "new" would be a lie, so no badge is
 *  rendered for that window.
 * @param current - this window's session count.
 * @param previous - the preceding window's comparison aggregate, or null.
 * @returns the change to render, or null when the comparison is not honest.
 */
export declare function compareSessions(current: number, previous: RangeComparison | null): CompareChange | null;
/** Prompt-cache hit ratio as 0..100 from cached/missed input tokens, or null
 *  when there is no usage to judge (0/0). */
export declare function cacheRate(hit: number, miss: number): number | null;
/** Format a hit ratio for display; no data renders as "—". */
export declare function cacheRateText(hit: number, miss: number): string;
/** Today's local date (plus/minus offsetDays) in "YYYY-MM-DD". */
export declare function localDay(offsetDays: number): string;
/** 0 = Monday … 6 = Sunday (GitHub-style heatmap rows). */
export declare function indexOfDay(day: string): number;
export declare function shortDay(day: string): string;
/** A session id shortened for a row label: the `session-` prefix stays (it is
 *  how the log names the id), the opaque tail collapses to its first four
 *  characters. A bare UUID — the older id shape — keeps its first eight.
 *  The full id always rides the row's `title` attribute. */
export declare function shortSessionId(session: string): string;
/** A short local date from epoch milliseconds: `MM-DD` inside the current
 *  calendar year, `YYYY-MM-DD` outside it (the year is redundant noise for a
 *  range this recent). 0 / a non-date renders as an em dash — the "no sample
 *  in range" case. */
export declare function shortDate(ms: number, now?: Date): string;
/** A local wall-clock `HH:MM:SS` — the "updated at" stamp under the panel. */
export declare function clockTime(d: Date): string;
/** A local `YYYY-MM-DD HH:MM:SS` for CSV rows (readable in Excel); the
 *  same 0 / invalid rule as {@link shortDate}, but an empty cell. */
export declare function dateTimeText(ms: number): string;
/** X-axis label for a trend bucket key. Day mode keeps the short date; hour
 *  mode names the day at 00:00 (so a three-day span keeps its day boundaries
 *  readable) and the hour everywhere else. */
export declare function bucketAxisLabel(key: string, granularity: 'day' | 'hour'): string;
/** Tooltip title for a trend bucket key: the date in day mode, date + hour
 *  in hour mode. */
export declare function bucketTitle(key: string, granularity: 'day' | 'hour'): string;
/** model refs are "provider/model"; a bare model name has no slash.
 *  (Re-exported from ../shared.ts at the top of this file.) */
/** Build a Catmull-Rom spline through the points (converted to cubic
 *  Beziers) so the hit-rate line reads as a smooth curve across data-less
 *  days instead of breaking into segments. */
export declare function smoothPath(pts: Array<{
    x: number;
    y: number;
}>): string;
/** Nice axis ticks: 1/2/5 × 10^k steps covering [step, max]. Non-positive
 *  maxima produce no ticks (guards the log10 against 0/NaN and the loop
 *  against a zero step). */
export declare function niceTicks(max: number, count: number): number[];
