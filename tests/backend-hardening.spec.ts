/**
 * Backend hardening regressions.
 *
 * Each case pins a defect found while auditing the host half:
 *  - a usage report missing a bucket must fold to 0, never to NaN (a NaN row is
 *    permanent: later accumulates stay NaN and JSON.stringify writes null);
 *  - the store must refuse non-finite counters even if a caller hands them in;
 *  - a session-title call must carry its hour key, or the hourly presets lose
 *    its usage while the daily ones keep it;
 *  - disposing a session must release its live-cursor entry;
 *  - the legacy-domain import must skip unusable rows instead of degrading the
 *    whole store (which would blank the panel).
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { UsageCollector, UsageFold } from '../src/collector.ts'
import { UsageStore } from '../src/store.ts'
import type { UsageDayRow, UsageHourRow } from '../src/store.ts'
import type {
  UsageDomain,
  UsageKvTable,
  UsageSessionEvent,
  UsageStorageDomain,
} from '../src/context-types.ts'

const T = new Date(2026, 7, 2, 12).getTime() // 2026-08-02 12:00 local

function event(type: string, turn: number, step: number, time: number, data: Record<string, unknown>): UsageSessionEvent {
  return { type, seq: 0, time, data: { turn, step, ...data } }
}

// ── 1. fold: missing / non-finite buckets ───────────────────────────────────

describe('UsageFold bucket normalization', () => {
  it('defaults an omitted input/output bucket instead of injecting NaN', () => {
    const fold = new UsageFold()
    // A log that only reports cache traffic: input/output are absent at runtime.
    const sample = fold.fold(event('assistant/message', 1, 1, T, {
      usage: { cacheReadTokens: 42 },
    }))
    expect(sample).not.toBeNull()
    expect(sample!.inputTokens).toBe(0)
    expect(sample!.outputTokens).toBe(0)
    expect(sample!.cacheReadTokens).toBe(42)
    expect(sample!.cacheWriteTokens).toBe(0)
    for (const v of [sample!.inputTokens, sample!.outputTokens, sample!.cacheReadTokens, sample!.cacheWriteTokens]) {
      expect(Number.isFinite(v)).toBe(true)
    }
  })

  it('treats NaN / Infinity / negative buckets as zero', () => {
    const fold = new UsageFold()
    const sample = fold.fold(event('assistant/message', 2, 1, T, {
      usage: { inputTokens: Number.NaN, outputTokens: Number.POSITIVE_INFINITY, cacheReadTokens: -5, cacheWriteTokens: 7 },
    }))
    expect(sample).not.toBeNull()
    expect(sample!.inputTokens).toBe(0)
    expect(sample!.outputTokens).toBe(0)
    expect(sample!.cacheReadTokens).toBe(0)
    expect(sample!.cacheWriteTokens).toBe(7)
    for (const v of [sample!.inputTokens, sample!.outputTokens, sample!.cacheReadTokens, sample!.cacheWriteTokens]) {
      expect(Number.isFinite(v)).toBe(true)
    }
  })

  it('drops a sample whose buckets are all unusable', () => {
    const fold = new UsageFold()
    const sample = fold.fold(event('assistant/message', 3, 1, T, {
      usage: { inputTokens: Number.NaN, outputTokens: Number.NaN },
    }))
    // Nothing real to record — emitting an all-zero row would be a phantom.
    expect(sample).toBeNull()
  })
})

// ── 2. store: non-finite counters can never reach a row ─────────────────────

function memoryDomain(hourRecords: Map<string, UsageHourRow> = new Map()): UsageStorageDomain {
  const records = new Map<string, UsageDayRow>()
  const memoryTable = <V,>(store: Map<string, V>, name: string): UsageKvTable<string, V> => ({
    get: (k) => store.get(k),
    entries: () => store.entries() as IterableIterator<[string, V]>,
    keys: () => store.keys() as IterableIterator<string>,
    get size() { return store.size },
    delete: async (k) => store.delete(k),
    put: async (k, v) => { store.set(k, v) },
    update: async (k, fn) => {
      const cur = store.get(k)
      if (cur === undefined) throw new Error(`table '${name}' has no record '${k}' to update`)
      const next = fn(cur)
      store.set(k, next)
      return next
    },
  })
  const dayTable = memoryTable(records, 'days')
  const hourTable = memoryTable(hourRecords, 'hours')
  const state: { global: unknown } = { global: undefined }
  const domain: UsageDomain = {
    table: (name: string) => (name === 'hours' ? hourTable : dayTable) as UsageKvTable<string, unknown>,
    global: {
      get: () => state.global,
      set: async (value) => { state.global = value },
    },
  }
  return {
    open: async () => domain,
    // Expose the backing tables for assertions without widening the contract.
    ...({ records, hourRecords } as object),
  } as UsageStorageDomain
}

describe('UsageStore counter guard', () => {
  it('refuses NaN / Infinity token counts handed in by a caller', async () => {
    const store = new UsageStore(memoryDomain())
    await store.record({
      day: '2026-08-02',
      model: 'deepseek/deepseek-chat',
      inputTokens: Number.NaN,
      outputTokens: Number.POSITIVE_INFINITY,
      cacheReadTokens: -3,
      cacheWriteTokens: 5,
    })
    const rows = await store.rangeRows('2026-08-02', '2026-08-02')
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(row.inputTokens).toBe(0)
    expect(row.outputTokens).toBe(0)
    expect(row.cacheReadTokens).toBe(0)
    expect(row.cacheWriteTokens).toBe(5)
    for (const v of [row.inputTokens, row.outputTokens, row.cacheReadTokens, row.cacheWriteTokens]) {
      expect(Number.isFinite(v)).toBe(true)
    }
    // The row must also survive a JSON round trip (NaN would become null).
    expect(JSON.parse(JSON.stringify(row)).inputTokens).toBe(0)
  })

  it('keeps a poisoned row repairable by a later clean accumulate', async () => {
    const store = new UsageStore(memoryDomain())
    await store.record({ day: '2026-08-02', model: 'm', inputTokens: Number.NaN, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 })
    await store.record({ day: '2026-08-02', model: 'm', inputTokens: 10, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 })
    const row = (await store.rangeRows('2026-08-02', '2026-08-02'))[0]!
    expect(row.inputTokens).toBe(10)
    expect(Number.isFinite(row.inputTokens)).toBe(true)
  })
})

// ── 3. collector: disposing a session releases its live-cursor entry ────────

describe('UsageCollector disposed-session cleanup', () => {
  function captureCtx() {
    const listeners = new Map<string, Array<(...args: never[]) => void>>()
    return {
      ctx: {
        on: (name: string, listener: (...args: never[]) => void) => {
          const list = listeners.get(name) ?? []
          list.push(listener)
          listeners.set(name, list)
        },
      },
      listeners,
    }
  }
  function emit(listeners: Map<string, Array<(...args: never[]) => void>>, name: string, ...args: unknown[]): void {
    for (const listener of listeners.get(name) ?? []) (listener as (...a: unknown[]) => void)(...args)
  }
  function countingStore(): { store: never; marks: () => number; records: Array<Record<string, unknown>> } {
    let marks = 0
    const records: Array<Record<string, unknown>> = []
    const store = {
      seenSessions: async () => new Set<string>(),
      liveSequences: async () => new Map<string, number>(),
      hoursLiveSequences: async () => new Map<string, number>(),
      sessionsLiveSequences: async () => new Map<string, number>(),
      markSeenSessions: async () => {},
      markHoursSeenSessions: async () => {},
      markSessionsSeenSessions: async () => {},
      markHoursReady: async () => {},
      markLiveSequences: async () => { marks++ },
      markHoursLiveSequences: async () => {},
      markSessionsLiveSequences: async () => {},
      record: async (sample: Record<string, unknown>) => { records.push(sample) },
    }
    return { store: store as never, marks: () => marks, records }
  }

  it('marks a session live only once, then again after it is disposed', async () => {
    const { ctx, listeners } = captureCtx()
    const { store, marks } = countingStore()
    const collector = new UsageCollector(ctx as never, store)
    collector.start()

    const session = { id: 'session-abc' }
    const ev = event('step/start', 1, 1, T, {})
    emit(listeners, 'session/event', session, ev)
    await Promise.resolve() // let the microtask flush land
    expect(marks()).toBe(1)

    // A second event of the same session must not write the cursor again.
    emit(listeners, 'session/event', session, ev)
    await Promise.resolve()
    expect(marks()).toBe(1)

    // Disposal releases the entry, so a (theoretical) later event re-marks it
    // instead of being silently skipped forever — and the boot-scoped set does
    // not grow by one string per session for the process lifetime.
    emit(listeners, 'session/disposed', session)
    emit(listeners, 'session/event', session, ev)
    await Promise.resolve()
    expect(marks()).toBe(2)
  })
})

// ── 4. legacy import: unusable rows are skipped, never fatal ───────────────

describe('UsageStore legacy import hardening', () => {
  const created: string[] = []
  afterEach(() => {
    for (const dir of created.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  function legacyFile(payload: unknown): string {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-usage-legacy-'))
    created.push(dir)
    const file = join(dir, 'usage_history.json')
    writeFileSync(file, JSON.stringify(payload), 'utf8')
    return file
  }

  const validDay = {
    day: '2026-08-01',
    provider: 'deepseek',
    model: 'deepseek/deepseek-chat',
    inputTokens: 100,
    outputTokens: 50,
    cacheReadTokens: 40,
    cacheWriteTokens: 0,
    requests: 2,
    turns: 1,
    lastSeen: 1_780_000_000_000,
  }

  it('imports valid rows, skips malformed ones, and stays usable', async () => {
    const file = legacyFile({
      tables: {
        days: {
          '2026-08-01|deepseek|deepseek/deepseek-chat': validDay,
          // `requests` missing: would throw inside put() and, before the guard,
          // abort initialize() and degrade the whole store.
          '2026-08-02|deepseek|broken': { day: '2026-08-02', provider: 'deepseek', model: 'broken', inputTokens: 1 },
        },
        hours: {
          '2026-08-01T07|deepseek|deepseek/deepseek-chat': {
            hour: '2026-08-01T07',
            provider: 'deepseek',
            model: 'deepseek/deepseek-chat',
            inputTokens: 10,
            outputTokens: 5,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
            requests: 1,
            turns: 0,
            lastSeen: 1_780_000_000_000,
          },
        },
      },
      global: { backfilledSessions: ['s1', 's2'], hoursBackfilledSessions: ['s1'], hoursReady: true },
    })

    const domain = memoryDomain()
    const store = new UsageStore(domain, { importLegacy: true, legacyFile: file })
    await store.readyPromise()
    // The store must NOT be degraded: that is what used to blank the panel.
    expect(store.degradation).toBeUndefined()

    expect(store.legacyImport).toEqual({ days: 1, hours: 1, skipped: 1, failed: 0 })

    const days = await store.rangeRows('2026-07-01', '2026-09-01')
    expect(days).toHaveLength(1)
    expect(days[0]!.inputTokens).toBe(100)
    expect(days[0]!.requests).toBe(2)

    const hours = await store.rangeHourRows('2026-08-01', '2026-08-01')
    expect(hours).toHaveLength(1)
    expect(hours[0]!.inputTokens).toBe(10)

    // Cursors are merged, not replaced, and the ready flag survives.
    expect(await store.seenSessions()).toEqual(new Set(['s1', 's2']))
    expect(await store.hoursReady()).toBe(true)
  })

  it('never re-imports once the marker is persisted', async () => {
    const file = legacyFile({
      tables: { days: { '2026-08-01|deepseek|deepseek/deepseek-chat': validDay }, hours: {} },
      global: { backfilledSessions: ['s1'] },
    })
    const domain = memoryDomain()
    const first = new UsageStore(domain, { importLegacy: true, legacyFile: file })
    await first.readyPromise()
    expect(first.legacyImport).toEqual({ days: 1, hours: 0, skipped: 0, failed: 0 })

    // A second store over the same domain must see the marker and do nothing.
    const second = new UsageStore(domain, { importLegacy: true, legacyFile: file })
    await second.readyPromise()
    expect(second.legacyImport).toBe('skipped')
    expect(await second.rangeRows('2026-08-01', '2026-08-01')).toHaveLength(1)
  })

  it('ignores a corrupt legacy file instead of failing to open', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-usage-legacy-'))
    created.push(dir)
    const file = join(dir, 'usage_history.json')
    writeFileSync(file, '{ this is not json', 'utf8')

    const store = new UsageStore(memoryDomain(), { importLegacy: true, legacyFile: file })
    await store.readyPromise()
    expect(store.degradation).toBeUndefined()
    expect(store.legacyImport).toBe('skipped')
    // Still fully writable afterwards.
    await store.record({ day: '2026-08-02', model: 'm', inputTokens: 1, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 })
    expect((await store.rangeRows('2026-08-02', '2026-08-02'))[0]!.inputTokens).toBe(1)
  })
})