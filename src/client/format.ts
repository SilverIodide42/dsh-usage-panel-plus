/**
 * Number/date formatting helpers for the usage panel — a TS translation of
 * reasonix's usageStatsFormat.ts plus the pure chart helpers from the panel
 * component.
 *
 * Pure date/model-ref helpers (`providerOf`, `daysBetween`) are re-exported
 * from the shared zero-dependency module so the host and client halves share
 * one implementation.
 */

// Shared with the host half (src/shared.ts has no Node/DOM types, so the
// client bundle may import it at runtime).
export { providerOf, modelNameOf, daysInRange as daysBetween } from '../shared.ts'

import type { RangeComparison } from '../wire.ts'

/** Exact token counts with thousands separators — no 万/亿/k/M units, the
 *  user reads the precise number (long values shrink to fit via FitText).
 *  Compact units stay on the axis labels and card sub-values only. */
export function formatTokens(n: number): string {
  return n.toLocaleString('en-US')
}

/** English-style compact (B/M/K) for axis labels and card sub-values. */
export function formatCompact(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

export function formatPercent(p: number): string {
  return (Math.round(p * 10) / 10).toFixed(1) + '%'
}

/** Direction of one period-over-period comparison. `new` stands for "the
 *  previous window had nothing to compare against, so this is all new volume".
 *  It is a real state the callers still compute and filter on — the session
 *  card relies on it to stay silent when the previous window had no session
 *  coverage — but the badge renders NOTHING for it: there is no ratio, and a
 *  word in place of a number breaks the column the deltas form. */
export type CompareDirection = 'up' | 'down' | 'flat' | 'new'

/** One card's period-over-period change: a direction plus the change as a
 *  non-negative percentage of the previous window (0 for `new`). */
export interface CompareChange {
  direction: CompareDirection
  percent: number
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
export function compareChange(current: number | null, previous: number | null): CompareChange | null {
  if (current === null || previous === null) return null
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null
  // A previous window of zero has no ratio; anything above zero is new volume.
  if (previous <= 0) {
    if (current <= 0) return null
    return { direction: 'new', percent: 0 }
  }
  const raw = ((current - previous) / previous) * 100
  if (!Number.isFinite(raw)) return null
  const percent = Math.round(Math.abs(raw) * 10) / 10
  // The sign is read off the raw ratio, not the rounded percentage: a 0.02%
  // move still points up even though it renders as 0.0%.
  const direction: CompareDirection = raw > 0 ? 'up' : raw < 0 ? 'down' : 'flat'
  return { direction, percent }
}

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
export function compareSessions(current: number, previous: RangeComparison | null): CompareChange | null {
  if (previous === null) return null
  // Token volume with no session rows = uncovered session dimension.
  if (previous.sessions <= 0 && previous.tokens > 0) return null
  return compareChange(current, previous.sessions)
}

/** Prompt-cache hit ratio as 0..100 from cached/missed input tokens, or null
 *  when there is no usage to judge (0/0). */
export function cacheRate(hit: number, miss: number): number | null {  const total = hit + miss
  if (total <= 0) return null
  return (hit / total) * 100
}

/** Format a hit ratio for display; no data renders as "—". */
export function cacheRateText(hit: number, miss: number): string {
  const r = cacheRate(hit, miss)
  return r === null ? '—' : formatPercent(r)
}

/** Today's local date (plus/minus offsetDays) in "YYYY-MM-DD". */
export function localDay(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 0 = Monday … 6 = Sunday (GitHub-style heatmap rows). */
export function indexOfDay(day: string): number {
  const d = new Date(day + 'T00:00:00')
  return (d.getDay() + 6) % 7
}

export function shortDay(day: string): string {
  const parts = day.split('-')
  const m = parts[1]
  const d = parts[2]
  return `${Number(m)}/${Number(d)}`
}

/** A session id shortened for a row label: the `session-` prefix stays (it is
 *  how the log names the id), the opaque tail collapses to its first four
 *  characters. A bare UUID — the older id shape — keeps its first eight.
 *  The full id always rides the row's `title` attribute. */
export function shortSessionId(session: string): string {
  const prefix = session.startsWith('session-') ? 'session-' : ''
  const rest = session.slice(prefix.length)
  const head = rest.slice(0, prefix === '' ? 8 : 4)
  return rest.length > head.length ? `${prefix}${head}…` : `${prefix}${head}`
}

/** A short local date from epoch milliseconds: `MM-DD` inside the current
 *  calendar year, `YYYY-MM-DD` outside it (the year is redundant noise for a
 *  range this recent). 0 / a non-date renders as an em dash — the "no sample
 *  in range" case. */
export function shortDate(ms: number, now: Date = new Date()): string {
  if (!Number.isFinite(ms) || ms <= 0) return '—'
  const d = new Date(ms)
  const time = d.getTime()
  if (!Number.isFinite(time)) return '—'
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return d.getFullYear() === now.getFullYear() ? `${mm}-${dd}` : `${d.getFullYear()}-${mm}-${dd}`
}

/** A local wall-clock `HH:MM:SS` — the "updated at" stamp under the panel. */
export function clockTime(d: Date): string {
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
}

/** A local `YYYY-MM-DD HH:MM:SS` for CSV rows (readable in Excel); the
 *  same 0 / invalid rule as {@link shortDate}, but an empty cell. */
export function dateTimeText(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return ''
  const d = new Date(ms)
  if (!Number.isFinite(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd} ${clockTime(d)}`
}

/** X-axis label for a trend bucket key. Day mode keeps the short date; hour
 *  mode names the day at 00:00 (so a three-day span keeps its day boundaries
 *  readable) and the hour everywhere else. */
export function bucketAxisLabel(key: string, granularity: 'day' | 'hour'): string {
  if (granularity === 'day') return shortDay(key)
  const hour = key.slice(11, 13)
  return hour === '00' ? shortDay(key.slice(0, 10)) : `${hour}:00`
}

/** Tooltip title for a trend bucket key: the date in day mode, date + hour
 *  in hour mode. */
export function bucketTitle(key: string, granularity: 'day' | 'hour'): string {
  return granularity === 'hour' ? `${key.slice(0, 10)} ${key.slice(11, 13)}:00` : key
}

/** model refs are "provider/model"; a bare model name has no slash.
 *  (Re-exported from ../shared.ts at the top of this file.) */

/** Build a Catmull-Rom spline through the points (converted to cubic
 *  Beziers) so the hit-rate line reads as a smooth curve across data-less
 *  days instead of breaking into segments. */
export function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return ''
  const first = pts[0]!
  if (pts.length === 1) return `M ${first.x} ${first.y}`
  let d = `M ${first.x} ${first.y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

/** Nice axis ticks: 1/2/5 × 10^k steps covering [step, max]. Non-positive
 *  maxima produce no ticks (guards the log10 against 0/NaN and the loop
 *  against a zero step). */
export function niceTicks(max: number, count: number): number[] {
  if (!(max > 0) || !(count > 0) || !Number.isFinite(max)) return []
  const raw = max / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
  if (!(step > 0)) return []
  const out: number[] = []
  for (let v = step; v <= max; v += step) out.push(v)
  return out
}
