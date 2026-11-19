/**
 * Catch-up coverage: DSH traffic created AFTER this process booted.
 *
 * The storage backend has no cross-process lock and rewrites the whole document
 * per writer, so a second DSH profile cannot share the domain — one instance
 * folds the others' sessions from their logs instead. Two rules make that safe:
 *
 *  1. a log another process is still appending to is DEFERRED (folding a
 *     half-written log would mark it seen and strand every later event);
 *  2. a later pass picks up sessions that appeared since boot, instead of
 *     waiting for the next restart.
 */
import { mkdtempSync, mkdirSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UsageCollector } from '../src/collector.ts'
import { apply, _resetSharedStoreForTests } from '../src/index.ts'
import type { UsageSample } from '../src/query.ts'
import type { UsageSessionEvent } from '../src/context-types.ts'
import type { UsageStore } from '../src/store.ts'

const T = new Date(2026, 10, 16, 12).getTime()

/** A usage-bearing event the fold turns into a token sample. */
function usageEvent(seq: number, turn: number): UsageSessionEvent {
  return {
    type: 'assistant/message',
    seq,
    time: T,
    data: {
      turn,
      step: 1,
      usage: { inputTokens: 100, outputTokens: 10, cacheReadTokens: 0, cacheWriteTokens: 0 },
      message: { source: { provider: 'deepseek', model: 'deepseek-chat' } },
    },
  } as UsageSessionEvent
}

interface Harness {
  collector: UsageCollector
  seen: Set<string>
  writes: UsageSample[]
  root: string
}

/** Fake store that records which sessions were marked seen and which samples
 *  landed, so "deferred" and "folded" are observable. */
function fakeStore(seen: Set<string>, writes: UsageSample[]): UsageStore {
  const store = {
    seenSessions: async () => new Set(seen),
    hoursSeenSessions: async () => new Set(seen),
    sessionsSeenSessions: async () => new Set(seen),
    liveSequences: async () => new Map<string, number>(),
    hoursLiveSequences: async () => new Map<string, number>(),
    sessionsLiveSequences: async () => new Map<string, number>(),
    markSeenSessions: async (ids: Iterable<string>) => { for (const id of ids) seen.add(id) },
    markHoursSeenSessions: async (ids: Iterable<string>) => { for (const id of ids) seen.add(id) },
    markSessionsSeenSessions: async (ids: Iterable<string>) => { for (const id of ids) seen.add(id) },
    markHoursReady: async () => {},
    markSessionsReady: async () => {},
    markLiveSequences: async () => {},
    markHoursLiveSequences: async () => {},
    markSessionsLiveSequences: async () => {},
    record: async (sample: UsageSample) => { writes.push(sample) },
    recordHours: async (sample: UsageSample) => { writes.push(sample) },
    recordSession: async (sample: UsageSample) => { writes.push(sample) },
    recordSessionTitle: async () => {},
  }
  return store as unknown as UsageStore
}

/** Persistence double: one page of events, then end of stream. */
function fakePersistence(ids: string[], events: UsageSessionEvent[]) {
  return {
    list: async () => ids.map((id) => ({ id })),
    open: async (id: string) => ({
      id,
      header: { id },
      access: 'read',
      inheritedEventCount: 0,
      read: async (offset: number) => ({ events: offset === 0 ? events : [] }),
      close: async () => {},
    }),
    inspect: async (id: string) => ({ meta: { id }, events, inheritedEventCount: 0 }),
  }
}

/** A session directory the collector's mtime index will find. */
function makeLog(root: string, workspace: string, id: string, ageMs: number): void {
  const dir = join(root, workspace, id)
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'session.v4.jsonl.zstd')
  writeFileSync(file, 'placeholder')
  const when = new Date(Date.now() - ageMs)
  utimesSync(file, when, when)
}

const dirs: string[] = []
function scratchRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'dsh-catchup-'))
  dirs.push(root)
  return root
}

function harness(root: string, quietMs = 60_000): Harness {
  const seen = new Set<string>()
  const writes: UsageSample[] = []
  const collector = new UsageCollector({} as never, fakeStore(seen, writes), {
    sessionsRoot: root,
    quietMs,
    backfillConcurrency: 1,
  })
  return { collector, seen, writes, root }
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('catch-up coverage of other DSH processes', () => {
  it('defers a session whose log another process is still writing', async () => {
    const root = scratchRoot()
    const { collector, seen } = harness(root)
    makeLog(root, 'ws', 'busy', 5_000) // touched 5 s ago -> still growing

    await collector.backfill(fakePersistence(['busy'], [usageEvent(1, 1)]), { list: () => [] } as never)

    expect(collector.status.pendingSessions).toBe(1)
    expect(seen.has('busy')).toBe(false) // never marked, so a later pass retries
  })

  it('folds the same session once its log goes quiet', async () => {
    const root = scratchRoot()
    const { collector, seen, writes } = harness(root)
    makeLog(root, 'ws', 'quiet', 10 * 60_000) // untouched for 10 minutes

    await collector.backfill(fakePersistence(['quiet'], [usageEvent(1, 1), usageEvent(2, 2)]), { list: () => [] } as never)

    expect(collector.status.pendingSessions).toBe(0)
    expect(seen.has('quiet')).toBe(true)
    expect(writes.length).toBeGreaterThan(0)
  })

  it('picks up a session created after the first pass (no restart needed)', async () => {
    const root = scratchRoot()
    const { collector, seen, writes } = harness(root)

    // First pass sees nothing: this is the state right after boot.
    await collector.backfill(fakePersistence([], []), { list: () => [] } as never)
    expect(writes).toHaveLength(0)

    // Another profile starts and finishes a session; its log goes quiet.
    makeLog(root, 'ws', 'later', 10 * 60_000)
    await collector.backfill(
      fakePersistence(['later'], [usageEvent(1, 1)]),
      { list: () => [] } as never,
    )

    expect(seen.has('later')).toBe(true)
    expect(writes.length).toBeGreaterThan(0)
  })

  it('does not touch a session this process is live-attached to', async () => {
    const root = scratchRoot()
    const { collector, seen } = harness(root)
    makeLog(root, 'ws', 'live', 10 * 60_000)

    // Live here, and NO boundary: the live listener owns the whole log.
    await collector.backfill(
      fakePersistence(['live'], [usageEvent(1, 1)]),
      { list: () => [{ id: 'live' }] } as never,
    )

    expect(seen.has('live')).toBe(false)
    expect(collector.status.pendingSessions).toBe(0)
  })

  it('treats a session with no readable log as quiet (single-instance behaviour)', async () => {
    const root = scratchRoot()
    const { collector, seen } = harness(root)
    // No directory at all: nothing to stat, so it must not be deferred.
    await collector.backfill(fakePersistence(['ghost'], [usageEvent(1, 1)]), { list: () => [] } as never)
    expect(seen.has('ghost')).toBe(true)
  })
})

describe('host wiring: the catch-up tick re-runs the history cycle', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    _resetSharedStoreForTests()
  })

  it('runs backfill again after boot when the interval elapses', async () => {
    _resetSharedStoreForTests()

    const rows = new Map<string, unknown>([
      ['2026-11-16|deepseek|deepseek-chat', {
        day: '2026-11-16', provider: 'deepseek', model: 'deepseek-chat',
        inputTokens: 1, outputTokens: 1, cacheReadTokens: 0, cacheWriteTokens: 0,
        requests: 1, turns: 0, lastSeen: 1,
      }],
    ])
    const table = () => ({
      get: (k: string) => rows.get(k),
      entries: () => rows.entries(),
      keys: () => rows.keys(),
      size: rows.size,
      put: async (k: string, v: unknown) => { rows.set(k, v) },
      delete: async (k: string) => rows.delete(k),
      update: async (k: string, fn: (cur: unknown) => unknown) => {
        const next = fn(rows.get(k))
        rows.set(k, next)
        return next
      },
    })
    let global: unknown = {
      backfilledSessions: [], liveFirstSeq: {},
      hoursBackfilledSessions: [], hoursLiveFirstSeq: {}, hoursReady: true,
      sessionsBackfilledSessions: [], sessionsLiveFirstSeq: {},
      sessionsReady: true, sessionsCoverage: 2,
    }
    const domain = {
      table,
      global: { get: () => global, set: async (v: unknown) => { global = v } },
    }

    const disposers: Array<() => void> = []
    const ctx = {
      effect: (fn: () => () => void) => { disposers.push(fn()) },
      on: () => {},
      get: () => undefined,
      webServer: { register: () => () => {} },
      sessionPersistence: { list: async () => [], inspect: async () => ({ meta: {}, events: [] }) },
      sessions: { list: () => [], get: () => undefined },
      storageDomain: { open: async () => domain },
    }

    const backfill = vi.spyOn(UsageCollector.prototype, 'backfill').mockResolvedValue(undefined)
    vi.spyOn(UsageCollector.prototype, 'backfillHours').mockResolvedValue(undefined)
    vi.spyOn(UsageCollector.prototype, 'backfillSessions').mockResolvedValue(undefined)

    try {
      apply(ctx as never, { catchUpIntervalMs: 25 })
      // Boot pass, then at least one tick.
      for (let i = 0; i < 40 && backfill.mock.calls.length < 2; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
      expect(backfill.mock.calls.length).toBeGreaterThanOrEqual(2)
    } finally {
      for (const dispose of disposers) dispose()
    }
  })
})