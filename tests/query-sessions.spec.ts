/**
 * `aggregateSessionRows` — the pure session aggregation composed onto the
 * model-keyed aggregate.
 *
 * The session dimension is a separate transform on purpose: the day/hour fold
 * stays untouched (its tests did not change), and the per-conversation view is
 * derived from the session table's own rows.
 */
import { describe, expect, it } from 'vitest'
import { aggregateSessionRows } from '../src/query.ts'
import type { SessionUsageRowLike } from '../src/wire.ts'

const WINDOW = { from: '2026-08-01', to: '2026-08-02' }

function row(over: Partial<SessionUsageRowLike> & { session: string; day: string }): SessionUsageRowLike {
  return {
    provider: 'p',
    model: 'p/m',
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    requests: 0,
    turns: 0,
    lastSeen: 0,
    ...over,
  }
}

describe('aggregateSessionRows', () => {
  it('sums a session\'s four token buckets across days and models', () => {
    const rows = [
      row({ session: 's1', day: '2026-08-01', model: 'p/a', inputTokens: 10, outputTokens: 5, cacheReadTokens: 40, cacheWriteTokens: 1, requests: 2, lastSeen: 100 }),
      row({ session: 's1', day: '2026-08-02', model: 'p/b', inputTokens: 20, outputTokens: 7, requests: 3, lastSeen: 200 }),
    ]
    const out = aggregateSessionRows(rows, new Map(), WINDOW)
    expect(out.sessionCount).toBe(1)
    const only = out.sessions[0]!
    expect(only.tokens).toBe(83)
    expect(only.requests).toBe(5)
    expect(only.cacheHit).toBe(40)
    expect(only.cacheMiss).toBe(31)
    expect(only.lastSeen).toBe(200)
  })

  it('ranks sessions by tokens and keeps the per-session model split', () => {
    const rows = [
      row({ session: 'small', day: '2026-08-01', model: 'p/a', inputTokens: 100, lastSeen: 1 }),
      row({ session: 'big', day: '2026-08-01', model: 'p/a', inputTokens: 900, lastSeen: 2 }),
      row({ session: 'big', day: '2026-08-01', model: 'p/b', inputTokens: 100, lastSeen: 3 }),
    ]
    const out = aggregateSessionRows(rows, new Map(), WINDOW)
    expect(out.sessions.map((s) => s.session)).toEqual(['big', 'small'])
    const big = out.sessions[0]!
    expect(big.tokens).toBe(1_000)
    expect(big.models.map((m) => m.model)).toEqual(['p/a', 'p/b'])
    expect(big.models[0]!.percent).toBeCloseTo(90, 5)
  })

  it('drops rows outside the window, and phantom rows with nothing to report', () => {
    const rows = [
      row({ session: 'inside', day: '2026-08-01', inputTokens: 5, lastSeen: 1 }),
      row({ session: 'before', day: '2026-07-31', inputTokens: 5, lastSeen: 1 }),
      row({ session: 'after', day: '2026-08-03', inputTokens: 5, lastSeen: 1 }),
      // A row with neither tokens nor requests must not invent a session.
      row({ session: 'empty', day: '2026-08-01', lastSeen: 1 }),
    ]
    const out = aggregateSessionRows(rows, new Map(), WINDOW)
    expect(out.sessionCount).toBe(1)
    expect(out.sessions[0]!.session).toBe('inside')
  })

  it('counts turn rows from the (turns) pseudo-model, which carries no tokens', () => {
    const rows = [
      row({ session: 's1', day: '2026-08-01', inputTokens: 10, lastSeen: 1 }),
      row({ session: 's1', day: '2026-08-01', model: '(turns)', turns: 3, lastSeen: 2 }),
      // A turns row for a session with no token row still creates it.
      row({ session: 's2', day: '2026-08-01', model: '(turns)', turns: 1, lastSeen: 3 }),
    ]
    const out = aggregateSessionRows(rows, new Map(), WINDOW)
    const byId = new Map(out.sessions.map((s) => [s.session, s]))
    expect(byId.get('s1')!.turns).toBe(3)
    expect(byId.get('s1')!.tokens).toBe(10)
    expect(byId.get('s2')!.turns).toBe(1)
  })

  it('attaches stored titles and leaves unknown ones empty', () => {
    const rows = [
      row({ session: 's1', day: '2026-08-01', inputTokens: 1, lastSeen: 1 }),
      row({ session: 's2', day: '2026-08-01', inputTokens: 2, lastSeen: 2 }),
    ]
    const out = aggregateSessionRows(rows, new Map([['s1', '修复登录']]), WINDOW)
    const byId = new Map(out.sessions.map((s) => [s.session, s]))
    expect(byId.get('s1')!.title).toBe('修复登录')
    expect(byId.get('s2')!.title).toBe('')
  })

  it('reports the request share attributed to (unknown) without dropping the tokens', () => {
    const rows = [
      row({ session: 's1', day: '2026-08-01', model: '(unknown)', provider: 'default', requests: 2, lastSeen: 10 }),
      row({ session: 's1', day: '2026-08-01', model: 'p/m', requests: 3, inputTokens: 7, lastSeen: 20 }),
    ]
    const out = aggregateSessionRows(rows, new Map(), WINDOW)
    expect(out.unknownRequests).toBe(2)
    expect(out.sessions[0]!.requests).toBe(5)
    expect(out.sessions[0]!.tokens).toBe(7)
  })

  it('uses the row-level firstSeen (not the last sample) when present', () => {
    const rows = [
      row({ session: 's1', day: '2026-08-01', inputTokens: 5, firstSeen: 100, lastSeen: 900 }),
      row({ session: 's1', day: '2026-08-02', inputTokens: 5, firstSeen: 1_500, lastSeen: 2_000 }),
    ]
    const out = aggregateSessionRows(rows, new Map(), WINDOW)
    expect(out.sessions[0]!.firstSeen).toBe(100)
    expect(out.sessions[0]!.lastSeen).toBe(2_000)
  })

  it('returns an empty aggregate for an empty window', () => {
    const out = aggregateSessionRows([], new Map(), WINDOW)
    expect(out).toEqual({ sessionCount: 0, sessions: [], unknownRequests: 0 })
  })
})
