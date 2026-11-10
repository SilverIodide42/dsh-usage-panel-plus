/**
 * The session dimension on the host side: the storage tables + cursors, the
 * coverage-version rebuild, and the range route that composes it onto the
 * model-keyed aggregate.
 *
 * Two rules are load-bearing and pinned here:
 *   1. the session tables carry their OWN cursor pair — sharing the day pair
 *      would make the upgrade pass skip every session;
 *   2. `sessionsCoverage` marks which coverage rules the tables were built
 *      under, so a store written by an older rule rebuilds once.
 */
import { describe, expect, it } from 'vitest'
import {
  SESSION_COVERAGE_VERSION,
  UsageStore,
  sessionRowKey,
  type UsageDayRow,
  type UsageHourRow,
  type UsageSessionMetaRow,
  type UsageSessionRow,
} from '../src/store.ts'
import type { UsageDomain, UsageKvTable, UsageStorageDomain } from '../src/context-types.ts'
import { aggregateRange } from '../src/routes.ts'
import { aggregateSessionRows } from '../src/query.ts'
import { shiftDayKey } from '../src/shared.ts'

interface Cursor {
  backfilledSessions: string[]
  liveFirstSeq?: Record<string, number>
  hoursBackfilledSessions?: string[]
  hoursLiveFirstSeq?: Record<string, number>
  hoursReady?: boolean
  sessionsBackfilledSessions?: string[]
  sessionsLiveFirstSeq?: Record<string, number>
  sessionsReady?: boolean
  sessionsCoverage?: number
}

/** One in-memory table mirroring the real KvTable contract (`update` requires
 *  an existing record, so the store's seed-and-retry path is exercised). */
function memoryTable<V>(records: Map<string, V>): UsageKvTable<string, V> {
  return {
    get: (k) => records.get(k),
    entries: () => records.entries() as IterableIterator<[string, V]>,
    keys: () => records.keys() as IterableIterator<string>,
    get size() { return records.size },
    delete: async (k) => records.delete(k),
    put: async (k, v) => { records.set(k, v) },
    update: async (k, fn) => {
      const cur = records.get(k)
      if (cur === undefined) throw new Error(`no record '${k}' to update`)
      const next = fn(cur)
      records.set(k, next)
      return next
    },
  }
}

interface Harness {
  domain: UsageStorageDomain
  days: Map<string, UsageDayRow>
  hours: Map<string, UsageHourRow>
  sessions: Map<string, UsageSessionRow>
  meta: Map<string, UsageSessionMetaRow>
  cursor: () => Cursor | undefined
}

function harness(start?: Partial<Cursor>): Harness {
  const days = new Map<string, UsageDayRow>()
  const hours = new Map<string, UsageHourRow>()
  const sessions = new Map<string, UsageSessionRow>()
  const meta = new Map<string, UsageSessionMetaRow>()
  const tables: Record<string, UsageKvTable<string, unknown>> = {
    days: memoryTable(days) as unknown as UsageKvTable<string, unknown>,
    hours: memoryTable(hours) as unknown as UsageKvTable<string, unknown>,
    sessions: memoryTable(sessions) as unknown as UsageKvTable<string, unknown>,
    session_meta: memoryTable(meta) as unknown as UsageKvTable<string, unknown>,
  }
  let global: Cursor | undefined = start === undefined
    ? undefined
    : { backfilledSessions: [], ...start }
  const domain: UsageDomain = {
    table: (name: string) => tables[name] ?? (tables.days as UsageKvTable<string, unknown>),
    global: {
      get: () => global as never,
      set: async (value) => { global = value as Cursor },
    },
  }
  return { domain: { open: async () => domain }, days, hours, sessions, meta, cursor: () => global }
}

const SAMPLE = {
  day: '2026-08-01',
  provider: 'p',
  model: 'p/m',
  inputTokens: 10,
  outputTokens: 5,
  cacheReadTokens: 40,
  cacheWriteTokens: 1,
  request: true as const,
  at: 1_000,
}

describe('session tables and cursors', () => {
  it('writes a session row alongside the day row when the sample names one', async () => {
    const h = harness()
    const store = new UsageStore(h.domain)
    await store.record({ ...SAMPLE, session: 's1' })

    expect(h.sessions.size).toBe(1)
    const row = h.sessions.get(sessionRowKey('s1', '2026-08-01', 'p', 'p/m'))!
    expect(row.session).toBe('s1')
    expect(row.inputTokens).toBe(10)
    expect(row.requests).toBe(1)
    // The day row is written by the same call: the session dimension ADDS a
    // view, it does not reroute the existing one.
    expect(h.days.size).toBe(1)
  })

  it('leaves the session dimension alone for a session-less sample', async () => {
    const h = harness()
    const store = new UsageStore(h.domain)
    // Title-generation calls carry no session id by design.
    await store.record({ ...SAMPLE })
    expect(h.days.size).toBe(1)
    expect(h.sessions.size).toBe(0)
  })

  it('keeps firstSeen at the earliest sample and lastSeen at the newest', async () => {
    const h = harness()
    const store = new UsageStore(h.domain)
    await store.record({ ...SAMPLE, session: 's1', inputTokens: 5, at: 2_000 })
    await store.record({ ...SAMPLE, session: 's1', inputTokens: 7, at: 1_000 })
    await store.record({ ...SAMPLE, session: 's1', inputTokens: 3, at: 3_000 })
    const row = (await store.rangeSessionRows('2026-08-01', '2026-08-01'))[0]!
    expect(row.firstSeen).toBe(1_000)
    expect(row.lastSeen).toBe(3_000)
    expect(row.inputTokens).toBe(15)
  })

  it('records a title once and follows a rename', async () => {
    const h = harness()
    const store = new UsageStore(h.domain)
    await store.recordSessionTitle('s1', '修复登录')
    await store.recordSessionTitle('s1', '修复登录')
    expect((await store.sessionTitles()).get('s1')).toBe('修复登录')
    await store.recordSessionTitle('s1', '修复登录流程')
    expect((await store.sessionTitles()).get('s1')).toBe('修复登录流程')
  })

  it('keeps the session cursors independent of the day/hour pairs', async () => {
    const h = harness()
    const store = new UsageStore(h.domain)
    await store.markSessionsLiveSequences(new Map([['s1', 4], ['s2', 7]]))
    expect((await store.sessionsLiveSequences()).get('s1')).toBe(4)
    expect((await store.sessionsLiveSequences()).get('s2')).toBe(7)
    expect(await store.sessionsReady()).toBe(false)
    await store.markSessionsReady()
    expect(await store.sessionsReady()).toBe(true)
    // The day/hour cursors are untouched by the session writes.
    expect((await store.seenSessions()).size).toBe(0)
    expect((await store.hoursSeenSessions()).size).toBe(0)
  })

  it('stamps the coverage version when the dimension is marked ready', async () => {
    const store = new UsageStore(harness().domain)
    expect(await store.sessionsCoverage()).toBe(0)
    await store.markSessionsReady()
    expect(await store.sessionsCoverage()).toBe(SESSION_COVERAGE_VERSION)
  })
})

describe('session rebuild', () => {
  it('resetSessionsForRebuild wipes rows and cursors but keeps titles and day rows', async () => {
    const h = harness()
    const store = new UsageStore(h.domain)
    await store.record({ ...SAMPLE, session: 's1', at: 100 })
    await store.recordSessionTitle('s1', '标题')
    await store.markSessionsSeenSessions(['s1'])
    await store.markSessionsLiveSequences(new Map([['s1', 4]]))
    await store.markSessionsReady()

    await store.resetSessionsForRebuild()

    expect(await store.hasAnySessionRows()).toBe(false)
    // The cursors start over so the next pass replays every log in full; a
    // stale live boundary would cap a live session's replay and re-create the
    // very gap the rebuild heals.
    expect((await store.sessionsSeenSessions()).size).toBe(0)
    expect((await store.sessionsLiveSequences()).size).toBe(0)
    expect(await store.sessionsReady()).toBe(false)
    expect(await store.sessionsCoverage()).toBe(0)
    // Titles are boundary-independent metadata and survive the rebuild.
    expect((await store.sessionTitles()).get('s1')).toBe('标题')
    // Day/hour history is not the sessions pass's surface.
    expect(await store.count()).toBe(1)
  })

  it('reset wipes all four tables and re-arms every cursor', async () => {
    const h = harness()
    const store = new UsageStore(h.domain)
    await store.record({ ...SAMPLE, session: 's1' })
    await store.recordSessionTitle('s1', '标题')
    await store.markSessionsSeenSessions(['s1'])
    await store.markSessionsReady()
    await store.reset(new Map([['s1', 3]]))
    expect(await store.count()).toBe(0)
    expect(await store.hasAnySessionRows()).toBe(false)
    expect((await store.sessionTitles()).size).toBe(0)
    expect((await store.sessionsSeenSessions()).size).toBe(0)
    expect(await store.sessionsReady()).toBe(false)
    expect(await store.sessionsCoverage()).toBe(0)
    expect((await store.sessionsLiveSequences()).get('s1')).toBe(3)
  })
})

describe('aggregateRange: session composition', () => {
  function storeWith(over: {
    days?: UsageDayRow[]
    hours?: UsageHourRow[]
    sessions?: UsageSessionRow[]
    titles?: Array<[string, string]>
  }): Parameters<typeof aggregateRange>[0] {
    return {
      async rangeRows(from: string, to: string) {
        return (over.days ?? []).filter((r) => r.day >= from && r.day <= to)
      },
      async rangeHourRows(from: string, to: string) {
        return (over.hours ?? []).filter((r) => r.hour >= `${from}T00` && r.hour <= `${to}T23`)
      },
      async rangeSessionRows(from: string, to: string) {
        return (over.sessions ?? []).filter((r) => r.day >= from && r.day <= to)
      },
      async sessionTitles() {
        return new Map(over.titles ?? [])
      },
    } as unknown as Parameters<typeof aggregateRange>[0]
  }

  const dayRow = (over: Partial<UsageDayRow> & { day: string }): UsageDayRow => ({
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
  })

  const sessRow = (over: Partial<UsageSessionRow> & { session: string; day: string }): UsageSessionRow => ({
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
  })

  it('exposes the real session count, ranked sessions and the session-scoped unknown share', async () => {
    const store = storeWith({
      days: [dayRow({ day: '2026-08-01', inputTokens: 100, requests: 3, turns: 1 })],
      sessions: [
        sessRow({ session: 's1', day: '2026-08-01', inputTokens: 70, requests: 2, lastSeen: 2_000 }),
        sessRow({ session: 's2', day: '2026-08-01', inputTokens: 30, requests: 1, lastSeen: 1_000 }),
        // A request nobody could attribute: reported, never dropped.
        sessRow({ session: 's2', day: '2026-08-01', model: '(unknown)', provider: 'default', requests: 3 }),
      ],
      titles: [['s1', '修复登录']],
    })
    const out = await aggregateRange(store, '2026-08-01', '2026-08-01')
    expect(out.sessionCount).toBe(2)
    expect(out.sessions.map((s) => s.session)).toEqual(['s1', 's2'])
    expect(out.sessions[0]!.title).toBe('修复登录')
    expect(out.sessions[1]!.title).toBe('')
    // Session-scoped: the day rows' own unknown share is a different number.
    expect(out.unknownRequests).toBe(3)
    // The model-keyed aggregate is untouched by the session composition.
    expect(out.tokens).toBe(100)
    expect(out.requests).toBe(3)
    expect(out.turns).toBe(1)
  })

  it('keeps the session window day-keyed in hour mode', async () => {
    const store = storeWith({
      hours: [{ hour: '2026-08-02T03', provider: 'p', model: 'p/m', inputTokens: 10, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, requests: 1, turns: 0, lastSeen: 0 }],
      sessions: [
        sessRow({ session: 's1', day: '2026-08-02', inputTokens: 1 }),
        sessRow({ session: 's2', day: '2026-08-02', inputTokens: 2 }),
      ],
    })
    const out = await aggregateRange(store, '2026-08-02', '2026-08-02', 'hour')
    expect(out.granularity).toBe('hour')
    expect(out.daily).toHaveLength(24)
    expect(out.sessionCount).toBe(2)
  })

  it('caps the returned session rows but keeps the count exact', async () => {
    const many = Array.from({ length: 205 }, (_, i) => sessRow({ session: `s${i}`, day: '2026-08-01', inputTokens: 1 }))
    const out = await aggregateRange(storeWith({ days: [dayRow({ day: '2026-08-01', inputTokens: 205 })], sessions: many }), '2026-08-01', '2026-08-01')
    expect(out.sessionCount).toBe(205)
    expect(out.sessions).toHaveLength(200)
  })

  it('compares against the equal-length window immediately before the range', async () => {
    const store = storeWith({
      days: [
        dayRow({ day: '2026-08-01', inputTokens: 100, requests: 2, turns: 1 }),
        dayRow({ day: '2026-07-30', inputTokens: 50, requests: 1, turns: 1 }),
        dayRow({ day: '2026-07-31', inputTokens: 25, requests: 1, turns: 0 }),
      ],
      sessions: [
        sessRow({ session: 's1', day: '2026-08-01', inputTokens: 100 }),
        sessRow({ session: 's0', day: '2026-07-30', inputTokens: 50 }),
      ],
    })
    const out = await aggregateRange(store, '2026-08-01', '2026-08-02')
    // 08-01..08-02 has 2 days, so the previous window is 07-30..07-31.
    expect(out.previous).toMatchObject({ tokens: 75, requests: 2, turns: 1, sessions: 1 })
  })

  it('returns an all-zero comparison for a window with no history before it', async () => {
    const out = await aggregateRange(storeWith({ days: [], sessions: [] }), '2026-08-01', '2026-08-02')
    expect(out.sessionCount).toBe(0)
    expect(out.sessions).toEqual([])
    expect(out.unknownRequests).toBe(0)
    expect(out.previous).toEqual({
      tokens: 0, requests: 0, turns: 0, sessions: 0, activeDays: 0, cacheHit: 0, cacheMiss: 0,
    })
  })
})

describe('shiftDayKey', () => {
  it('walks calendar days in both directions, across a month boundary', () => {
    expect(shiftDayKey('2026-08-01', -1)).toBe('2026-07-31')
    expect(shiftDayKey('2026-08-31', 1)).toBe('2026-09-01')
    expect(shiftDayKey('2026-01-01', -1)).toBe('2025-12-31')
    expect(shiftDayKey('2026-08-15', 0)).toBe('2026-08-15')
  })
})

describe('aggregateSessionRows stays a pure transform', () => {
  it('does not require the store to have any session history', () => {
    expect(aggregateSessionRows([], new Map(), { from: '2026-08-01', to: '2026-08-01' }))
      .toEqual({ sessionCount: 0, sessions: [], unknownRequests: 0 })
  })
})
