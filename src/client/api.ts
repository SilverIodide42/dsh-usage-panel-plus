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
import type { BackfillStatus, UsageStatsRange, UsageStatsRequest } from '../wire.ts'

/** One wire failure. */
export class UsageApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

interface WireResponse<T> {
  ok: true
  value: T
}

async function post<T>(method: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`usage-panel-plus/api/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (err) {
    throw new UsageApiError('network', err instanceof Error ? err.message : String(err))
  }
  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new UsageApiError('bad-response', `unexpected response from /usage-panel-plus/api/${method}`)
  }
  const wire = json as WireResponse<T> | { ok: false; error: { code: string; message: string } }
  if (!wire || wire.ok !== true) {
    const failure = wire as { ok: false; error: { code: string; message: string } }
    throw new UsageApiError(failure?.error?.code ?? 'error', failure?.error?.message ?? 'usage api error')
  }
  return wire.value
}

/** Aggregate the usage panel renders for one range. */
export async function fetchRange(req: UsageStatsRequest): Promise<UsageStatsRange> {
  return post<UsageStatsRange>('range', req)
}

/** How long one range response stays reusable. Long enough that switching a
 *  range back and forth (or the heatmap window riding a re-render) does not
 *  re-run the aggregation, short enough that a live session's newest calls
 *  show up on their own — and every deliberate refresh bypasses it anyway. */
export const RANGE_CACHE_TTL_MS = 20_000

interface RangeCacheEntry {
  /** Fetch completion time, epoch ms. */
  at: number
  value: UsageStatsRange
}

/** Module-level response cache. The panel remounts on every panel switch and
 *  re-reads the aggregate on every range flip; the host's aggregation walks
 *  the whole store, so a short TTL removes the worst of that repeat work
 *  without ever serving data the reader would call stale. */
const rangeCache = new Map<string, RangeCacheEntry>()

/** Stable cache key: the request's own fields in a fixed order, so a
 *  `{range, from, to}` posted by two call sites always hits one entry. */
function rangeCacheKey(req: UsageStatsRequest): string {
  return JSON.stringify([req.range, req.from ?? '', req.to ?? ''])
}

export interface FetchRangeOptions {
  /** Skip the cached copy. Every EXPLICIT read (the refresh button, the auto
   *  refresh tick, a post-rebuild reload) must do this — those are the
   *  reader asking for the store as it is right now. */
  noCache?: boolean
}

/** {@link fetchRange} through the short TTL cache. */
export async function fetchRangeCached(
  req: UsageStatsRequest,
  options: FetchRangeOptions = {},
): Promise<UsageStatsRange> {
  const key = rangeCacheKey(req)
  if (options.noCache !== true) {
    const hit = rangeCache.get(key)
    if (hit !== undefined && Date.now() - hit.at < RANGE_CACHE_TTL_MS) return hit.value
  }
  const value = await fetchRange(req)
  rangeCache.set(key, { at: Date.now(), value })
  return value
}

/** Drop every cached range. The rebuild wipes the store and replays the logs,
 *  so every cached aggregate describes data that no longer exists. */
export function clearRangeCache(): void {
  rangeCache.clear()
}

/** Rebuild the statistics from the session logs. The host wipes every row plus
 *  the backfill cursor and replays all persisted sessions under the current
 *  attribution rules, so a drifted store converges back onto the logs; it
 *  refuses (409) only while a boot scan is still running. */
export async function rebuildStats(): Promise<BackfillStatus> {
  const status = await post<BackfillStatus>('reset', {})
  // The host just discarded and rebuilt every row; whatever the cache still
  // holds describes the pre-rebuild store.
  clearRangeCache()
  return status
}
