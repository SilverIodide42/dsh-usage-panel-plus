/**
 * Session-dimension coverage rules (v2).
 *
 * A plain day backfill (`target='all'`) may replay only a PREFIX of a live
 * session's log, so it must not write session rows nor advance the session
 * cursor — the dedicated sessions pass replays every log in full and owns both.
 * Only a fresh install / rebuild (empty day cursor) makes the all-pass a full
 * replay that may fill the session dimension itself.
 *
 * The bug this pins: marking the session cursor from a partial all-pass made
 * every live-at-boot session look "already replayed", so the sessions upgrade
 * pass skipped them forever and their pre-boot usage never reached the session
 * table.
 */
import { describe, expect, it } from 'vitest'
import { UsageCollector } from '../src/collector.ts'
import type { UsageSessionEvent, UsageSessionPersistence } from '../src/context-types.ts'

const T = Date.parse('2026-08-01T10:00:00+08:00')

interface StubState {
  recorded: Array<Record<string, unknown>>
  sessionsMarked: string[][]
  sessionsReady: number
  daySeen: Set<string>
}

function stubStore(daySeen: string[]): { store: unknown; state: StubState } {
  const state: StubState = {
    recorded: [],
    sessionsMarked: [],
    sessionsReady: 0,
    daySeen: new Set(daySeen),
  }
  const store = {
    seenSessions: async () => new Set(state.daySeen),
    liveSequences: async () => new Map<string, number>(),
    markSeenSessions: async (ids: Iterable<string>) => { for (const id of ids) state.daySeen.add(id) },
    markHoursLiveSequences: async () => {},
    markHoursSeenSessions: async () => {},
    markHoursReady: async () => {},
    markLiveSequences: async () => {},
    sessionsSeenSessions: async () => new Set<string>(),
    sessionsLiveSequences: async () => new Map<string, number>(),
    markSessionsSeenSessions: async (ids: Iterable<string>) => { state.sessionsMarked.push([...ids]) },
    markSessionsLiveSequences: async () => {},
    markSessionsReady: async () => { state.sessionsReady++ },
    record: async (sample: Record<string, unknown>) => { state.recorded.push(sample) },
    recordSession: async (sample: Record<string, unknown>) => { state.recorded.push(sample) },
    recordSessionTitle: async () => {},
  }
  return { store, state }
}

function persistence(events: UsageSessionEvent[]): UsageSessionPersistence {
  return {
    list: async () => [{ id: 's1' }],
    inspect: async () => ({ id: 's1', events, inheritedEventCount: 0 }),
  } as unknown as UsageSessionPersistence
}

const events = [
  { type: 'step/start', seq: 0, time: T, data: { turn: 1, step: 1 } },
  { type: 'assistant/message', seq: 1, time: T, data: { turn: 1, step: 1, usage: { inputTokens: 10, outputTokens: 5 } } },
  { type: 'turn/end', seq: 2, time: T, data: { turn: 1 } },
] as UsageSessionEvent[]

describe('session coverage: the all-pass vs the sessions pass', () => {
  it('an UPGRADE all-pass records day/hour only and never touches the session cursor', async () => {
    const { store, state } = stubStore(['already-seen'])
    const collector = new UsageCollector({ on: () => {} } as never, store as never)
    await collector.backfill(persistence(events), { list: () => [] } as never)

    expect(state.recorded).toHaveLength(3)
    // No sample carries a session id: the sessions pass writes that row from a
    // full replay instead.
    expect(state.recorded.every((s) => s.session === undefined)).toBe(true)
    expect(state.sessionsMarked).toEqual([])
    expect(state.sessionsReady).toBe(0)
  })

  it('a FRESH all-pass (empty day cursor) fills the session rows and marks them', async () => {
    const { store, state } = stubStore([])
    const collector = new UsageCollector({ on: () => {} } as never, store as never)
    await collector.backfill(persistence(events), { list: () => [] } as never)

    expect(state.recorded).toHaveLength(3)
    expect(state.recorded.every((s) => s.session === 's1')).toBe(true)
    expect(state.sessionsMarked).toEqual([['s1']])
    expect(state.sessionsReady).toBe(1)
  })

  it('the sessions upgrade pass writes session rows and advances its own cursor', async () => {
    const { store, state } = stubStore(['already-seen'])
    const collector = new UsageCollector({ on: () => {} } as never, store as never)
    await collector.backfillSessions(persistence(events), { list: () => [] } as never)

    expect(state.recorded).toHaveLength(3)
    expect(state.recorded.every((s) => s.session === 's1')).toBe(true)
    expect(state.sessionsMarked).toEqual([['s1']])
    expect(state.sessionsReady).toBe(1)
  })
})

describe('live-at-boot sessions', () => {
  it('skips a live session with no usable boundary WITHOUT marking it seen', async () => {
    const { store, state } = stubStore(['already-seen'])
    // The session is live right now, but no live boundary is recorded for it:
    // its events belong to this boot's live path, so nothing may be replayed.
    const live = { id: 's1', seq: -1 }
    const collector = new UsageCollector({ on: () => {} } as never, store as never)
    await collector.backfillSessions(persistence(events), { list: () => [live] } as never)

    // Nothing replayed…
    expect(state.recorded).toEqual([])
    // …and, crucially, NOT marked: the next boot must replay it from scratch.
    expect(state.sessionsMarked).toEqual([])
  })
})
