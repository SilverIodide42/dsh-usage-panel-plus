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

import type { Context } from './context-types.ts'
import type { UsageHttpRequest, UsageHttpResponse, UsageWebRoute } from './context-types.ts'
import { UsageStore } from './store.ts'
import type { UsageDayRow, UsageHourRow } from './store.ts'
import { UsageCollector } from './collector.ts'
import { aggregateSamples, aggregateSessionRows } from './query.ts'
import type { Granularity, UsageSample } from './query.ts'
import { daysInRange, shiftDayKey } from './shared.ts'
import type { BackfillStatus, RangeComparison, UsageStatsRange, UsageStatsRequest } from './wire.ts'
import { MAX_SESSIONS_IN_RESPONSE, UsageError, readJsonBody, writeError, writeJson } from './wire.ts'
import { createTrustFence, type TrustFence, type TrustInputs } from './trust-fence.ts'

export interface RoutesDeps {
  store: UsageStore
  collector: UsageCollector
  /** Resolve the /usage-panel-plus/api trust inputs live: the trusted authorities, this
   *  listener's bind address, and its protocol (see trust-fence TrustInputs). */
  trust: () => TrustInputs
  /** Whether a /reset rebuild pipeline is currently in flight (its scan
   *  makes the collector report running too — callers use this to tell that
   *  benign state apart from a boot scan and COALESCE onto the pipeline
   *  instead of refusing). */
  isRebuilding: () => boolean
  /** Wipe the store at wipe-time live watermarks and re-run the full
   *  backfill (wired by the host half; concurrent calls coalesce into one
   *  rebuild). */
  resetAndRescan: () => Promise<void>
}

/** Parse a strict `YYYY-MM-DD` calendar date (rejects rolled-over shapes
 *  like "2026-13-45" that a regex alone would pass). */
function parseDayKey(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match === null) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? { y, m, d } : null
}

/** Longest custom span accepted (one leap year) — bounds the daily series
 *  size and the response body against a misbehaving trusted client. */
const MAX_CUSTOM_SPAN_DAYS = 366

/** Resolve a request's [from, to] into inclusive local day keys.
 *
 *  `range: 'all'` is the one preset whose start is NOT computed from today: the
 *  window runs from the earliest day the store holds up to today, so the
 *  caller must supply that first day (read through {@link UsageStore.firstDay}).
 *  When the store is empty the window collapses onto today, which renders the
 *  panel's empty state instead of a year-long blank chart. */
export function resolveRange(
  req: UsageStatsRequest,
  now = new Date(),
  firstDay: string | null = null,
): { from: string; to: string } {
  const day = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0)
  switch (req.range) {
    case 'today': {
      return { from: day(toDate), to: day(toDate) }
    }
    case 'all': {
      const today = day(toDate)
      // Guard against a stored day in the future (a clock skew artefact): the
      // window must never start after it ends.
      return { from: firstDay !== null && firstDay !== '' && firstDay <= today ? firstDay : today, to: today }
    }
    case '3': {
      const from = new Date(toDate)
      from.setDate(from.getDate() - 2)
      return { from: day(from), to: day(toDate) }
    }
    case '7':
    case '14':
    case '30':
    case '90': {
      const n = Number(req.range)
      const from = new Date(toDate)
      from.setDate(from.getDate() - (n - 1))
      return { from: day(from), to: day(toDate) }
    }
    case 'custom': {
      if (!req.from || !req.to) {
        throw new UsageError(400, 'usage stats: custom range needs valid from/to dates (YYYY-MM-DD)')
      }
      const from = parseDayKey(req.from)
      const to = parseDayKey(req.to)
      if (from === null || to === null) {
        throw new UsageError(400, 'usage stats: custom range needs valid from/to dates (YYYY-MM-DD)')
      }
      if (req.to < req.from) {
        throw new UsageError(400, 'usage stats: custom to must be >= from')
      }
      // Calendar-day span via UTC noon-free date math: both keys are plain
      // calendar dates, so the millisecond difference is exact whole days.
      const spanDays = (Date.UTC(to.y, to.m - 1, to.d) - Date.UTC(from.y, from.m - 1, from.d)) / 86_400_000 + 1
      if (spanDays > MAX_CUSTOM_SPAN_DAYS) {
        throw new UsageError(400, `usage stats: custom range spans more than ${MAX_CUSTOM_SPAN_DAYS} days`)
      }
      return { from: req.from, to: req.to }
    }
    default: {
      // Unknown/empty range defaults to the last 7 days.
      const from = new Date(toDate)
      from.setDate(from.getDate() - 6)
      return { from: day(from), to: day(toDate) }
    }
  }
}

/** The trend granularity a range preset asks for: the two short presets read
 *  per hour, everything else (including custom) per day. */
export function granularityOf(range: string | undefined): Granularity {
  return range === 'today' || range === '3' ? 'hour' : 'day'
}

/** Turn the model-keyed rows of the selected granularity into the shared
 *  sample stream. The per-row request and turn counts are yielded lazily as
 *  markers, so no intermediate array is materialized regardless of range
 *  size. */
function* samplesOfRows(rows: Iterable<UsageDayRow | UsageHourRow>): Generator<UsageSample> {
  for (const row of rows) {
    const hour = 'hour' in row ? row.hour : undefined
    const day = hour === undefined ? (row as UsageDayRow).day : hour.slice(0, 10)
    // Any real token traffic makes the row a token sample — including a
    // pure-cache call whose uncached input and output are both zero.
    if (row.inputTokens + row.outputTokens + row.cacheReadTokens + row.cacheWriteTokens > 0) {
      yield {
        day,
        hour,
        model: row.model,
        inputTokens: row.inputTokens,
        outputTokens: row.outputTokens,
        cacheReadTokens: row.cacheReadTokens,
        cacheWriteTokens: row.cacheWriteTokens,
      }
    }
    // Requests live on the row as a count (one per provider call, tokens or
    // not); expand them into request markers for the shared aggregator.
    for (let i = 0; i < row.requests; i++) {
      yield { day, hour, model: row.model, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, request: true }
    }
    for (let i = 0; i < row.turns; i++) {
      yield { day, hour, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, turn: true }
    }
  }
}

/** Build the aggregate for a range from the store rows: the model-keyed
 *  bucket aggregate composed with the session dimension and the comparison
 *  window. Session rows are keyed by DAY, so the session split is always the
 *  [from, to] calendar window even when the trend is per hour. */
export async function aggregateRange(
  store: UsageStore,
  from: string,
  to: string,
  granularity: Granularity = 'day',
): Promise<UsageStatsRange> {
  const rows: Array<UsageDayRow | UsageHourRow> = granularity === 'hour'
    ? await store.rangeHourRows(from, to)
    : await store.rangeRows(from, to)
  const base = aggregateSamples(samplesOfRows(rows), { from, to }, granularity)

  // Unknown-route requests are read off the same bucket rows as the headline
  // The unknown-attribution share is reported SESSION-SCOPED: the note renders
  // inside the session block, so it must count only the sessions that block
  // can see. (The day rows also carry unknown requests from conversations
  // whose logs were deleted — that share is invisible here by definition and
  // is already reflected in the total request count.)
  const titles = await store.sessionTitles()
  const sessionRows = await store.rangeSessionRows(from, to)
  const sessionAgg = aggregateSessionRows(sessionRows, titles, { from, to })

  // Comparison window: the same number of calendar days immediately before
  // `from`. All-zero when the store has no history there.
  const spanDays = daysInRange(from, to).length
  const prevTo = shiftDayKey(from, -1)
  const prevFrom = shiftDayKey(prevTo, -(Math.max(1, spanDays) - 1))
  const prevRows = await store.rangeRows(prevFrom, prevTo)
  const prevBase = aggregateSamples(samplesOfRows(prevRows), { from: prevFrom, to: prevTo }, 'day')
  const prevSessionAgg = aggregateSessionRows(
    await store.rangeSessionRows(prevFrom, prevTo),
    new Map(),
    { from: prevFrom, to: prevTo },
  )
  const previous: RangeComparison = {
    tokens: prevBase.tokens,
    requests: prevBase.requests,
    turns: prevBase.turns,
    sessions: prevSessionAgg.sessionCount,
    activeDays: prevBase.activeDays,
    cacheHit: prevBase.cacheHit,
    cacheMiss: prevBase.cacheMiss,
  }

  return {
    ...base,
    sessionCount: sessionAgg.sessionCount,
    sessions: sessionAgg.sessions.slice(0, MAX_SESSIONS_IN_RESPONSE),
    unknownRequests: sessionAgg.unknownRequests,
    previous,
  }
}

/** Build the single fenced prefix route serving the /usage-panel-plus/api JSON RPC.
 *  The host mounts it via `ctx.webServer.register` (which takes ONE WebRoute,
 *  not an array — matching the real dsh-host-webserver contract). */
export function buildUsageRoute(ctx: Context, deps: RoutesDeps): UsageWebRoute {
  const fence: TrustFence = createTrustFence(deps.trust)
  const handler = async (req: UsageHttpRequest, res: UsageHttpResponse): Promise<void> => {
    if (!fence.isTrusted(req)) {
      writeJson(res, { ok: false, error: { code: 'forbidden', message: 'untrusted host' } }, 403)
      return
    }
    // Match on the request PATH only: the route is registered as a /usage-panel-plus/api
    // prefix, so a raw `endsWith` would also swallow deeper paths like
    // /usage-panel-plus/api/x/range, and a query string would break the comparison and
    // 404 a legitimate endpoint. Strip ?/# and compare exactly.
    const url = req.url ?? ''
    const path = url.split(/[?#]/, 1)[0]!
    const method = req.method ?? 'GET'
    try {
      if (method === 'POST' && path === '/usage-panel-plus/api/range') {
        const body = (await readJsonBody(req)) as Partial<UsageStatsRequest>
        // 'all' starts at the store's own earliest day; every other preset
        // computes its window from today and ignores this read.
        const firstDay = body.range === 'all' ? await deps.store.firstDay() : null
        const { from, to } = resolveRange(body as UsageStatsRequest, new Date(), firstDay)
        const stats = await aggregateRange(deps.store, from, to, granularityOf(body.range))
        writeJson(res, { ok: true, value: stats })
        return
      }
      if (method === 'POST' && path === '/usage-panel-plus/api/status') {
        writeJson(res, { ok: true, value: deps.collector.status })
        return
      }
      if (method === 'POST' && path === '/usage-panel-plus/api/reset') {
        // Rebuild escape hatch: wipe rows + cursor, then replay every
        // persisted session under the CURRENT attribution rules. Refuse only
        // while a BOOT scan (not started by a reset) is in flight; an
        // overlapping reset rides the coalescing pipeline instead — one
        // wipe+rebuild, every caller gets its outcome. Live sessions are
        // re-bounded at their wipe-time log length so the rebuild also
        // reconstructs what the live path had recorded before the wipe.
        if (deps.collector.running && !deps.isRebuilding()) {
          throw new UsageError(409, 'usage stats: backfill already running')
        }
        await deps.resetAndRescan()
        writeJson(res, { ok: true, value: deps.collector.status })
        return
      }
      writeJson(res, { ok: false, error: { code: 'not_found', message: `unknown endpoint ${path}` } }, 404)
    } catch (err) {
      // Log the real failure server-side (the fence keeps untrusted callers
      // out, so this is a trusted client or an internal fault); writeError
      // only returns a generic 500 body for non-UsageError failures.
      const logger = (ctx as unknown as { logger?: { warn(message: unknown): void } }).logger
      if (!(err instanceof UsageError)) logger?.warn(err instanceof Error ? err : new Error(String(err)))
      writeError(res, err)
    }
  }
  return { kind: 'prefix', path: '/usage-panel-plus/api', handler }
}

export type { BackfillStatus, UsageStatsRange, UsageStatsRequest }
