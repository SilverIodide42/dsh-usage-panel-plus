/**
 * The usage-history durable store. Records accumulate into one storage
 * domain (`usage_panel_plus`, single table `days`) keyed
 * `YYYY-MM-DD|provider|model` with the four token buckets plus per-day
 * counters (requests, turns) and the uncached-input cache-miss side. Writes
 * go through `KvTable.update()` (atomic read-modify-write queued per key), so
 * concurrent turns never interleave. The backend persists the domain to
 * `$DSH_HOME/storages/usage_panel_plus.json` (storage-json).
 *
 * The layout mirrors the reasonix daily-JSONL design (one row per day ×
 * model) with the aggregation moved into the storage layer: a query reads
 * the table entries intersecting the range instead of decoding per-day files.
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { UsageStorageDomain, UsageKvTable, UsageDomain } from './context-types.ts'
import type { UsageSample } from './query.ts'
import { providerOf } from './query.ts'
import { z } from 'zod'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** True when a KvTable.update() failure is the "no record to update" miss
 *  (the storage-domain error for an absent key) — the retry path seeds the
 *  row and re-applies. */
function isMissingRecord(err: unknown): boolean {
  return err instanceof Error && /no record .* to update/.test(err.message)
}

/** The counters both tables carry: one model's usage over one bucket. */
export interface UsageCounters {
  provider: string
  model: string // canonical "provider/model"; "(unknown)" for unlabelled
  inputTokens: number // uncached input (the cache-miss side)
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  requests: number // usage events (API calls) in the bucket
  turns: number // completed turns attributed to this model in the bucket
  lastSeen: number // epoch ms of the newest sample
  /** Epoch ms of the OLDEST sample folded into this row. Optional: rows
   *  written before the field existed (and seeds) carry none; the loader's
   *  first accumulate backfills it from the sample's own event time. */
  firstSeen?: number
}

/** One row: a model's usage on one local calendar day. */
export interface UsageDayRow extends UsageCounters {
  day: string // "YYYY-MM-DD"
}

/** One row: a model's usage in one local calendar hour. */
export interface UsageHourRow extends UsageCounters {
  hour: string // "YYYY-MM-DDTHH"
}

export const usageDayRowSchema = z.object({
  day: z.string(),
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cacheReadTokens: z.number(),
  cacheWriteTokens: z.number(),
  requests: z.number(),
  turns: z.number(),
  lastSeen: z.number(),
  firstSeen: z.number().optional(),
})

export const usageHourRowSchema = z.object({
  hour: z.string(),
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cacheReadTokens: z.number(),
  cacheWriteTokens: z.number(),
  requests: z.number(),
  turns: z.number(),
  lastSeen: z.number(),
  firstSeen: z.number().optional(),
})

/** One row: one SESSION's usage of one model on one local calendar day. The
 *  session table is the only place that knows which conversation a call came
 *  from; the day/hour tables stay model-keyed (they predate the dimension and
 *  remain the aggregate source for every existing section). */
export interface UsageSessionRow extends UsageCounters {
  session: string
  day: string // "YYYY-MM-DD"
}

/** One session's metadata row: its display title (from `session/title`) and
 *  when the row last changed. The session id is the key. */
export interface UsageSessionMetaRow {
  session: string
  title: string
  updatedAt: number
}

export const usageSessionRowSchema = z.object({
  session: z.string(),
  day: z.string(),
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cacheReadTokens: z.number(),
  cacheWriteTokens: z.number(),
  requests: z.number(),
  turns: z.number(),
  lastSeen: z.number(),
  firstSeen: z.number().optional(),
})

export const usageSessionMetaRowSchema = z.object({
  session: z.string(),
  title: z.string(),
  updatedAt: z.number(),
})

/** The domain's global singleton: the backfill cursor. Session ids already
 *  replayed into the store live here, so a reboot's backfill only folds
 *  sessions it has never seen (a full replay would double every counter —
 *  the fold's replace semantics only dedupe within one pass).
 *
 *  `liveFirstSeq` records, per session, the EXCLUSIVE END of the range a
 *  backfill may replay: [0, value) is backfill-owned, [value, ∞) is
 *  live-path-owned. It is written at two moments — when the live listener
 *  first observes a session (that first event's seq, or -1 when the boundary
 *  was unknown), and by /reset (the session's wipe-time log length, because
 *  the wipe destroyed everything below it and the rebuild must reconstruct
 *  exactly that span from the log). The next boot's backfill replays exactly
 *  the prefix before the boundary. */
export const usageHistoryDomain = defineDomain({
  name: 'usage_panel_plus',
  version: 1,
  global: {
    schema: z.object({
      backfilledSessions: z.array(z.string()),
      liveFirstSeq: z.record(z.string(), z.number()).optional(),
      // The hour table has its own pair of cursors: the day cursors were
      // already populated when the hour table arrived, so sharing them would
      // make the upgrade pass skip every session. `hoursReady` records that
      // the hour history covers every replayable session.
      hoursBackfilledSessions: z.array(z.string()).optional(),
      hoursLiveFirstSeq: z.record(z.string(), z.number()).optional(),
      hoursReady: z.boolean().optional(),
      // The session table arrived last and keeps its own cursor pair for the
      // same reason (`sessionsReady` = every replayable session was folded
      // into it). An install that predates it upgrades once, writing only the
      // session rows.
      sessionsBackfilledSessions: z.array(z.string()).optional(),
      sessionsLiveFirstSeq: z.record(z.string(), z.number()).optional(),
      sessionsReady: z.boolean().optional(),
      // Bumped whenever the session-dimension coverage RULES change (v2: the
      // day backfill no longer marks the session cursor, live-at-boot
      // sessions replay their whole pre-boot log). A store whose marker is
      // older than the code force-rebuilds the session tables once.
      sessionsCoverage: z.number().optional(),
      // Set once the legacy `usage_history` domain has been folded into this
      // one. Without a persisted marker the import would repeat on every boot.
      legacyImported: z.boolean().optional(),
    }),
    initial: {
      backfilledSessions: [] as string[],
      liveFirstSeq: {},
      hoursBackfilledSessions: [] as string[],
      hoursLiveFirstSeq: {},
    },
  },
  // Four tables, one domain version: storage-domain builds an empty map for a
  // declared table the medium does not carry yet, so adding `hours` (or the
  // session tables) needs no version bump (and a bump would reject every
  // existing store outright — the domain format has no migration path).
  tables: {
    days: domainTable<string, UsageDayRow>(usageDayRowSchema),
    hours: domainTable<string, UsageHourRow>(usageHourRowSchema),
    sessions: domainTable<string, UsageSessionRow>(usageSessionRowSchema),
    session_meta: domainTable<string, UsageSessionMetaRow>(usageSessionMetaRowSchema),
  },
})

/** key: `day|provider|model`. */
export function dayRowKey(day: string, provider: string, model: string): string {
  return `${day}|${provider}|${model}`
}

/** key: `hour|provider|model`. */
export function hourRowKey(hour: string, provider: string, model: string): string {
  return `${hour}|${provider}|${model}`
}

/** key: `session|day|provider|model`. */
export function sessionRowKey(session: string, day: string, provider: string, model: string): string {
  return `${session}|${day}|${provider}|${model}`
}

/** The domain global's value: the backfill cursor (see the
 *  `usageHistoryDomain` doc for the field semantics). */
interface UsageCursor {
  backfilledSessions?: string[]
  liveFirstSeq?: Record<string, number>
  hoursBackfilledSessions?: string[]
  hoursLiveFirstSeq?: Record<string, number>
  hoursReady?: boolean
  sessionsBackfilledSessions?: string[]
  sessionsLiveFirstSeq?: Record<string, number>
  sessionsReady?: boolean
  sessionsCoverage?: number
}

/** The session-dimension coverage rule version (see the cursor field). Bump
 *  when the rules for which span a session replay covers change; older
 *  stores then rebuild the session tables once on the next boot. */
export const SESSION_COVERAGE_VERSION = 2

export class UsageStore {
  private table: UsageKvTable<string, UsageDayRow> | null = null
  private hourTable: UsageKvTable<string, UsageHourRow> | null = null
  private sessionTable: UsageKvTable<string, UsageSessionRow> | null = null
  private sessionMetaTable: UsageKvTable<string, UsageSessionMetaRow> | null = null
  private domainHandle: UsageDomain | null = null
  private ready: Promise<void>
  /** Set when the domain could not be opened (already-open race, corrupted
   *  file, ...). The store then runs DEGRADED: every operation fails
   *  per-call with a clear error and nothing persists, but no rejecting
   *  promise is ever left unobserved — an escaping rejection here used to
   *  be able to take the whole host down. */
  private openError?: unknown
  /** Serializes read-modify-write cycles on the backfill cursor. The domain
   *  only guarantees single-write ordering on its chain — a global.set is a
   *  whole-value overwrite, so two concurrent markSeenSessions calls would
   *  interleave get→set and lose one caller's ids (lost update). Chaining
   *  through this promise makes every get→set pair atomic within the
   *  process, which is the only concurrency that exists here. */
  private markChain: Promise<void> = Promise.resolve()
  /** Opt-in: fold the legacy `usage_history` domain in once at open. Only the
   *  host entry passes this; unit tests construct bare stores and must never
   *  read the machine's real ~/.dsh files. */
  private readonly importLegacy: boolean
  /** Source file for the one-time legacy import (overridable for tests). */
  private readonly legacyFile: string

  constructor(ctx: UsageStorageDomain, options: { importLegacy?: boolean; legacyFile?: string } = {}) {
    this.importLegacy = options.importLegacy === true
    this.legacyFile = options.legacyFile
      ?? process.env.DSH_USAGE_LEGACY_FILE
      ?? join(homedir(), '.dsh', 'storages', 'usage_history.json')
    // initialize() absorbs EVERY failure (sync throw surfaced through an
    // async boundary included): this.ready must always resolve, so awaiting
    // it can never itself become the unhandled rejection that kills the
    // process. Callers observe degradation per operation via requireTable().
    this.ready = this.initialize(ctx)
      .catch((err) => { this.openError = err })
  }

  private async initialize(ctx: UsageStorageDomain): Promise<void> {
    const domain = await ctx.open(usageHistoryDomain)
    this.domainHandle = domain
    this.table = domain.table('days') as UsageKvTable<string, UsageDayRow>
    this.hourTable = domain.table('hours') as UsageKvTable<string, UsageHourRow>
    this.sessionTable = domain.table('sessions') as UsageKvTable<string, UsageSessionRow>
    this.sessionMetaTable = domain.table('session_meta') as UsageKvTable<string, UsageSessionMetaRow>
    // One-time rebuild of pre-cursor rows (≤0.1.1 wrote the old request
    // semantics and no turns at all): rows paired with a completely empty
    // cursor cannot be told apart from a half-written new-world store, and
    // both recover by dropping the rows and letting the backfill replay
    // from scratch. The same path also heals a reset() torn by a crash
    // mid-wipe: reset() writes its empty cursor first, so leftover rows
    // always meet an empty cursor here. Running inside ready() means every
    // later record, mark, or cursor read — including the live listener's
    // first writes — lands after the decision, so no ordering race exists.
    const value = domain.global?.get() as { backfilledSessions?: string[]; legacyImported?: boolean } | undefined
    const cursorEmpty = (value?.backfilledSessions?.length ?? 0) === 0
    if (cursorEmpty && this.table.keys().next().done === false) {
      for (const key of [...this.table.keys()]) await this.table.delete(key)
      for (const key of [...(this.hourTable?.keys() ?? [])]) await this.hourTable?.delete(key)
      for (const key of [...(this.sessionTable?.keys() ?? [])]) await this.sessionTable?.delete(key)
      for (const key of [...(this.sessionMetaTable?.keys() ?? [])]) await this.sessionMetaTable?.delete(key)
    }
    // Import the legacy `usage_history` domain once. This plugin ships under a
    // NEW domain name, so a fresh install rebuilds only the sessions whose logs
    // are still on disk; older usage (days / hours / cursors) stays behind in
    // the upstream domain file. Editing that JSON directly never sticks: the
    // host keeps the domain open in memory and rewrites the whole file on every
    // KvTable.update(). Going through domain.put()/global.set() instead puts
    // the values INTO the live domain, so every later flush carries them.
    if (this.importLegacy) await this.importLegacyOnce(domain)
  }

  /** Outcome of the one-time legacy import, for diagnostics and tests.
   *  Undefined until {@link importLegacyOnce} has run once. */
  legacyImport?: { days: number; hours: number; skipped: number; failed: number } | 'skipped'

  /** One-way, one-time import of the upstream usage domain's day/hour rows and
   *  backfill cursors. Legacy wins on collisions; the current session tables
   *  and their cursors are never touched.
   *
   *  Rows are validated before they are written: this method runs INSIDE
   *  initialize(), so a single malformed legacy row that threw would mark the
   *  whole store degraded and leave the panel permanently empty. Bad rows are
   *  skipped and counted instead. Writes are chunked because a real legacy
   *  domain holds hundreds of rows and one awaited write per row made first
   *  boot noticeably slower. */
  private async importLegacyOnce(domain: UsageDomain): Promise<void> {
    const global = domain.global?.get() as Record<string, unknown> | undefined
    if (global?.legacyImported === true) {
      this.legacyImport = 'skipped'
      return
    }

    const file = this.legacyFile
    if (!existsSync(file)) {
      this.legacyImport = 'skipped'
      return
    }
    let legacy: {
      tables?: { days?: Record<string, unknown>; hours?: Record<string, unknown> }
      global?: Record<string, unknown>
    }
    try {
      legacy = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      this.legacyImport = 'skipped' // a corrupt legacy file must never take the host down
      return
    }

    const rawDays = legacy.tables?.days ?? {}
    const rawHours = legacy.tables?.hours ?? {}
    if (Object.keys(rawDays).length === 0 && Object.keys(rawHours).length === 0) {
      this.legacyImport = 'skipped'
      return
    }

    let skipped = 0
    const dayRows: Array<[string, UsageDayRow]> = []
    const hourRows: Array<[string, UsageHourRow]> = []
    for (const [key, raw] of Object.entries(rawDays)) {
      const parsed = usageDayRowSchema.safeParse(raw)
      if (parsed.success) dayRows.push([key, parsed.data])
      else skipped++
    }
    for (const [key, raw] of Object.entries(rawHours)) {
      const parsed = usageHourRowSchema.safeParse(raw)
      if (parsed.success) hourRows.push([key, parsed.data])
      else skipped++
    }

    let failed = 0
    const writeChunk = async <T>(
      table: UsageKvTable<string, T> | null,
      rows: Array<[string, T]>,
    ): Promise<void> => {
      if (table === null) return
      const CHUNK = 50
      for (let i = 0; i < rows.length; i += CHUNK) {
        await Promise.all(rows.slice(i, i + CHUNK).map(async ([key, row]) => {
          try {
            await table.put(key, row)
          } catch {
            failed++ // one unwritable row must not abort the import
          }
        }))
      }
    }
    await writeChunk(this.table, dayRows)
    await writeChunk(this.hourTable, hourRows)
    this.legacyImport = { days: dayRows.length, hours: hourRows.length, skipped, failed }

    const lg = legacy.global ?? {}
    const mergedGlobal: Record<string, unknown> = { ...(global ?? {}) }
    const unionArray = (a: unknown, b: unknown): string[] =>
      [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])].sort()
    for (const key of ['backfilledSessions', 'hoursBackfilledSessions']) {
      mergedGlobal[key] = unionArray(lg[key], mergedGlobal[key])
    }
    const unionMap = (a: unknown, b: unknown): Record<string, unknown> => {
      const out: Record<string, unknown> = { ...((b && typeof b === 'object' ? b : {}) as Record<string, unknown>) }
      if (a && typeof a === 'object') Object.assign(out, a)
      return out
    }
    for (const key of ['liveFirstSeq', 'hoursLiveFirstSeq']) {
      mergedGlobal[key] = unionMap(lg[key], mergedGlobal[key])
    }
    if (lg.hoursReady === true) mergedGlobal.hoursReady = true
    mergedGlobal.legacyImported = true
    // If this write fails the marker is absent, so the next boot re-imports:
    // the import is idempotent (legacy wins), so a retry is harmless.
    await domain.global.set(mergedGlobal)
  }

  /** The open failure when running degraded, else undefined (diagnostics). */
  get degradation(): unknown {
    return this.openError
  }

  /** Session ids already replayed into the store (the backfill cursor).
   *  A medium without a global (pre-cursor rows) yields an empty set, which
   *  would replay everything once — acceptable only for a fresh install, so
   *  callers pairing this with markSeenSessions still converge after one
   *  pass. */
  async seenSessions(): Promise<Set<string>> {
    await this.ready
    const value = this.cursor()
    return new Set(value?.backfilledSessions ?? [])
  }

  /** Per-session seq of the first LIVE-observed event (see the domain's
   *  `liveFirstSeq` doc). -1 = observed with an unknown boundary. */
  async liveSequences(): Promise<Map<string, number>> {
    await this.ready
    const value = this.cursor()
    return new Map(Object.entries(value?.liveFirstSeq ?? {}))
  }

  private cursor(): UsageCursor | undefined {
    return this.domainHandle?.global?.get() as UsageCursor | undefined
  }

  /** The cursor value for a read-modify-write cycle. Degraded stores fail
   *  here too: the cursor-writing methods must honor the same per-call
   *  failure contract as record() — silently succeeding while persisting
   *  nothing would make callers believe a replay boundary was durable. */
  private requireCursor(): UsageCursor {
    if (this.openError !== undefined) {
      const detail = this.openError instanceof Error ? this.openError.message : String(this.openError)
      throw new Error(`usage store degraded (domain unavailable: ${detail})`)
    }
    return this.cursor() ?? {}
  }

  /** Persist session ids as replayed (merges into the cursor). Calls are
   *  serialized through {@link markChain} so concurrent workers never lose
   *  each other's ids in a get→set interleaving. */
  async markSeenSessions(ids: Iterable<string>): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      const seen = new Set(value.backfilledSessions ?? [])
      for (const id of ids) seen.add(id)
      // Spread the whole cursor: the hour cursors live in the same global, so
      // a day-cursor write that rebuilt the object field-by-field would erase
      // the upgrade pass's progress and rerun it on every boot.
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: [...seen],
        liveFirstSeq: value.liveFirstSeq ?? {},
      })
    })
    // Keep the chain alive regardless of failure: one rejected write must
    // not poison every later mark (the caller observes the rejection).
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Record the first LIVE-observed seq per session (merges; the EARLIEST
   *  boundary wins — it is the safe partition point for prefix replays).
   *  Serialized through {@link markChain} like every other global rewrite. */
  async markLiveSequences(entries: Iterable<readonly [string, number]>): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      const merged: Record<string, number> = { ...(value.liveFirstSeq ?? {}) }
      let changed = false
      for (const [id, seq] of entries) {
        const prev = merged[id]
        if (prev === undefined || seq < prev) {
          merged[id] = seq
          changed = true
        }
      }
      if (!changed) return
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        liveFirstSeq: merged,
      })
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Session ids already replayed into the HOUR table. The hour table
   *  arrived after the day cursors were populated, so it keeps its own seen
   *  set: sharing the day cursor would make the upgrade pass skip every
   *  session and leave the hour table empty forever. */
  async hoursSeenSessions(): Promise<Set<string>> {
    await this.ready
    return new Set(this.cursor()?.hoursBackfilledSessions ?? [])
  }

  /** Per-session seq of the first LIVE-observed event, hour-table share. */
  async hoursLiveSequences(): Promise<Map<string, number>> {
    await this.ready
    return new Map(Object.entries(this.cursor()?.hoursLiveFirstSeq ?? {}))
  }

  /** Persist hour-table replay progress (merges; serialized on the same
   *  chain as every other cursor write). */
  async markHoursSeenSessions(ids: Iterable<string>): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      const seen = new Set(value.hoursBackfilledSessions ?? [])
      for (const id of ids) seen.add(id)
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        hoursBackfilledSessions: [...seen],
      })
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Record the hour-table live boundary per session (earliest wins). */
  async markHoursLiveSequences(entries: Iterable<readonly [string, number]>): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      const merged: Record<string, number> = { ...(value.hoursLiveFirstSeq ?? {}) }
      let changed = false
      for (const [id, seq] of entries) {
        const prev = merged[id]
        if (prev === undefined || seq < prev) {
          merged[id] = seq
          changed = true
        }
      }
      if (!changed) return
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        hoursLiveFirstSeq: merged,
      })
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Whether the hour table covers every replayable session (initial install,
   *  upgrade pass, or a rebuild). */
  async hoursReady(): Promise<boolean> {
    await this.ready
    return this.cursor()?.hoursReady === true
  }

  /** Mark the hour history complete; the upgrade pass then never reruns. */
  async markHoursReady(): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        hoursReady: true,
      })
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Session ids already replayed into the SESSION table (its own cursor
   *  pair — same reason as the hour table: the older cursors were already
   *  populated when the dimension arrived). */
  async sessionsSeenSessions(): Promise<Set<string>> {
    await this.ready
    return new Set(this.cursor()?.sessionsBackfilledSessions ?? [])
  }

  /** Per-session seq of the first LIVE-observed event, session-table share. */
  async sessionsLiveSequences(): Promise<Map<string, number>> {
    await this.ready
    return new Map(Object.entries(this.cursor()?.sessionsLiveFirstSeq ?? {}))
  }

  /** Persist session-table replay progress (merges; serialized on the same
   *  chain as every other cursor write). */
  async markSessionsSeenSessions(ids: Iterable<string>): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      const seen = new Set(value.sessionsBackfilledSessions ?? [])
      for (const id of ids) seen.add(id)
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        sessionsBackfilledSessions: [...seen],
      })
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Record the session-table live boundary per session (earliest wins). */
  async markSessionsLiveSequences(entries: Iterable<readonly [string, number]>): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      const merged: Record<string, number> = { ...(value.sessionsLiveFirstSeq ?? {}) }
      let changed = false
      for (const [id, seq] of entries) {
        const prev = merged[id]
        if (prev === undefined || seq < prev) {
          merged[id] = seq
          changed = true
        }
      }
      if (!changed) return
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        sessionsLiveFirstSeq: merged,
      })
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Whether the session table covers every replayable session. */
  async sessionsReady(): Promise<boolean> {
    await this.ready
    return this.cursor()?.sessionsReady === true
  }

  /** Mark the session dimension complete under the CURRENT coverage rules;
   *  the upgrade pass then never reruns. */
  async markSessionsReady(): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const value = this.requireCursor()
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        sessionsReady: true,
        sessionsCoverage: SESSION_COVERAGE_VERSION,
      })
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** The coverage-rule version the session tables were built under (0 for a
   *  store predating the marker). */
  async sessionsCoverage(): Promise<number> {
    await this.ready
    return this.cursor()?.sessionsCoverage ?? 0
  }

  /** Drop the session dimension's rows and cursors so the next sessions pass
   *  replays every persisted log from scratch under the current rules.
   *
   *  Deliberately leaves the day/hour tables and the session TITLES alone:
   *  only the session-keyed counters are being rebuilt, and a title is
   *  independent of any replay boundary. The live-boundary map is cleared
   *  too — a stale prefix boundary from an older boot would otherwise cap a
   *  live session's replay and re-create the very gap this rebuild heals. */
  async resetSessionsForRebuild(): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const table = this.requireSessionTable()
      const value = this.requireCursor()
      // Cursor first (crash-safe ordering, same as reset()): a crash mid-wipe
      // leaves rows behind an empty cursor and the next boot wipes them again.
      await this.domainHandle?.global?.set({
        ...value,
        backfilledSessions: value.backfilledSessions ?? [],
        sessionsBackfilledSessions: [],
        sessionsLiveFirstSeq: {},
        sessionsReady: false,
        sessionsCoverage: 0,
      })
      for (const key of [...table.keys()]) await table.delete(key)
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Drop every row and the whole cursor, re-bounding each named session at
   *  its WIPE-TIME WATERMARK (the store-rebuild escape hatch for corrupted
   *  history or attribution-logic upgrades).
   *
   *  The watermark matters because the wipe destroys the live path's already-
   *  recorded samples too: a still-open session's post-attach usage exists in
   *  no log-replay-free zone — it MUST be reconstructed from the persisted
   *  log like everything else. Bounding that session at its old attach
   *  boundary would make the follow-up backfill replay only the pre-attach
   *  prefix and strand the live-recorded span forever; bounding it at the
   *  log length captured at wipe time makes the backfill rebuild exactly the
   *  destroyed range [0, watermark) once, while events from the watermark on
   *  stay exclusive to the still-running live path. Sessions without a
   *  usable watermark carry the -1 sentinel (replay nothing — never risk a
   *  duplicate). */
  async reset(boundaries?: ReadonlyMap<string, number>): Promise<void> {
    const write = this.markChain.then(async () => {
      await this.ready
      const table = this.requireTable()
      const hourTable = this.requireHourTable()
      const sessionTable = this.requireSessionTable()
      const sessionMetaTable = this.requireSessionMetaTable()
      const liveFirstSeq: Record<string, number> = {}
      if (boundaries) {
        for (const [id, seq] of boundaries) liveFirstSeq[id] = seq
      }
      // Crash-safe order: the cursor lands BEFORE the row wipe. A crash in
      // between then leaves rows behind an EMPTY cursor, which the
      // open-time rebuild drops before any replay; the reverse order would
      // leave an empty store behind an old "already seen" cursor, so the
      // next boot's backfill would skip every session (silent loss).
      //
      // All four tables and all three cursor pairs reset together: the rebuild
      // that follows replays every session through `record()`, which writes
      // the day, hour and session rows in one pass, so the derived tables
      // must start empty and their boundaries must equal the day boundary.
      await this.domainHandle?.global?.set({
        backfilledSessions: [],
        liveFirstSeq,
        hoursBackfilledSessions: [],
        hoursLiveFirstSeq: { ...liveFirstSeq },
        hoursReady: false,
        sessionsBackfilledSessions: [],
        sessionsLiveFirstSeq: { ...liveFirstSeq },
        sessionsReady: false,
        sessionsCoverage: 0,
      })
      for (const key of [...table.keys()]) await table.delete(key)
      for (const key of [...hourTable.keys()]) await hourTable.delete(key)
      for (const key of [...sessionTable.keys()]) await sessionTable.delete(key)
      for (const key of [...sessionMetaTable.keys()]) await sessionMetaTable.delete(key)
    })
    this.markChain = write.then(
      () => undefined,
      () => undefined,
    )
    return write
  }

  /** Opens the domain (lazily awaited by every operation). */
  async readyPromise(): Promise<void> {
    await this.ready
  }

  private requireTable(): UsageKvTable<string, UsageDayRow> {
    if (this.openError !== undefined) {
      const detail = this.openError instanceof Error ? this.openError.message : String(this.openError)
      throw new Error(`usage store degraded (domain unavailable: ${detail})`)
    }
    if (!this.table) throw new Error('usage store not ready')
    return this.table
  }

  private requireHourTable(): UsageKvTable<string, UsageHourRow> {
    if (this.openError !== undefined) {
      const detail = this.openError instanceof Error ? this.openError.message : String(this.openError)
      throw new Error(`usage store degraded (domain unavailable: ${detail})`)
    }
    if (!this.hourTable) throw new Error('usage store not ready')
    return this.hourTable
  }

  private requireSessionTable(): UsageKvTable<string, UsageSessionRow> {
    if (this.openError !== undefined) {
      const detail = this.openError instanceof Error ? this.openError.message : String(this.openError)
      throw new Error(`usage store degraded (domain unavailable: ${detail})`)
    }
    if (!this.sessionTable) throw new Error('usage store not ready')
    return this.sessionTable
  }

  private requireSessionMetaTable(): UsageKvTable<string, UsageSessionMetaRow> {
    if (this.openError !== undefined) {
      const detail = this.openError instanceof Error ? this.openError.message : String(this.openError)
      throw new Error(`usage store degraded (domain unavailable: ${detail})`)
    }
    if (!this.sessionMetaTable) throw new Error('usage store not ready')
    return this.sessionMetaTable
  }

  /** Fold one atomic usage sample (a completed call or a turn marker) into
   *  the day's row, and into the matching hour row when the sample carries an
   *  hour key. Turn markers carry no model attribution (reasonix records them
   *  per source, not per model).
   *
   *  KvTable.update() requires an existing key ("no record to update"
   *  otherwise), so a miss is retried once after seeding the row with put().
   *  The put/update pair is not atomic against a concurrent writer for the
   *  same key, but the collector's fold dedupes by (turn, step) and the live
   *  listener + backfill never write the same key twice concurrently; the
   *  retry covers the first-writer race. The two writes are NOT transactional:
   *  a day row that lands while its hour row fails only shortens the hourly
   *  view, which is derived data. */
  async record(sample: UsageSample): Promise<void> {
    await this.ready
    const target = this.targetsOf(sample)
    await this.recordInto(
      this.requireTable(),
      dayRowKey(sample.day, target.provider, target.model),
      emptyDayRow(sample.day, target.provider, target.model),
      sample,
    )
    if (sample.hour !== undefined) await this.recordHours(sample)
    // The session row is the only place the conversation dimension is kept.
    // A sample without a session id (title calls stay session-less by design,
    // exactly like reasonix) contributes to the day/hour aggregate only.
    if (sample.session !== undefined && sample.session !== '') await this.recordSession(sample)
  }

  /** Fold a sample into the HOUR table only. The upgrade pass uses this: the
   *  day cursors are already advanced, so replaying through `record()` would
   *  double every day row. */
  async recordHours(sample: UsageSample): Promise<void> {
    await this.ready
    const hour = sample.hour
    if (hour === undefined) throw new Error('usage store: recordHours needs sample.hour')
    const target = this.targetsOf(sample)
    await this.recordInto(
      this.requireHourTable(),
      hourRowKey(hour, target.provider, target.model),
      emptyHourRow(hour, target.provider, target.model),
      sample,
    )
  }

  /** Fold a sample into the SESSION table only. The session-dimension upgrade
   *  pass uses this: the older cursors are already advanced, so replaying
   *  through `record()` would double the day and hour rows. */
  async recordSession(sample: UsageSample): Promise<void> {
    await this.ready
    const session = sample.session
    if (session === undefined || session === '') throw new Error('usage store: recordSession needs sample.session')
    const target = this.targetsOf(sample)
    await this.recordInto(
      this.requireSessionTable(),
      sessionRowKey(session, sample.day, target.provider, target.model),
      emptySessionRow(session, sample.day, target.provider, target.model),
      sample,
    )
  }

  /** Upsert one session's display title (the `session/title` event value).
   *  An unchanged title is a no-op so automatic re-titling does not rewrite
   *  the row on every observation. */
  async recordSessionTitle(session: string, title: string): Promise<void> {
    if (session === '' || title === '') return
    await this.ready
    const table = this.requireSessionMetaTable()
    const now = Date.now()
    const apply = (cur: UsageSessionMetaRow | undefined): UsageSessionMetaRow => {
      if (cur !== undefined && cur.title === title) return cur
      return { session, title, updatedAt: now }
    }
    try {
      await table.update(session, apply)
    } catch (err) {
      if (isMissingRecord(err)) {
        await table.put(session, { session, title, updatedAt: now })
        return
      }
      throw err
    }
  }

  /** Every known session title, keyed by session id. */
  async sessionTitles(): Promise<Map<string, string>> {
    await this.ready
    const out = new Map<string, string>()
    for (const [, row] of this.requireSessionMetaTable().entries()) {
      if (row.title !== '') out.set(row.session, row.title)
    }
    return out
  }

  /** The row identity a sample lands on: turn markers use the synthetic
   *  (turns) model, unlabelled calls the (unknown) one. */
  private targetsOf(sample: UsageSample): { provider: string; model: string } {
    return {
      provider: sample.turn ? 'default' : providerOf(sample.model && sample.model !== '' ? sample.model : '(unknown)'),
      model: sample.turn ? '(turns)' : sample.model && sample.model !== '' ? sample.model : '(unknown)',
    }
  }

  private async recordInto<T extends UsageCounters>(
    table: UsageKvTable<string, T>,
    key: string,
    seed: T,
    sample: UsageSample,
  ): Promise<void> {
    const apply = (cur: T | undefined): T => accumulate(cur ?? seed, sample)
    try {
      await table.update(key, apply)
    } catch (err) {
      if (isMissingRecord(err)) {
        await table.put(key, seed)
        await table.update(key, apply)
        return
      }
      throw err
    }
  }

  /** All rows whose day intersects [from, to] (inclusive). */
  async rangeRows(from: string, to: string): Promise<UsageDayRow[]> {
    await this.ready
    const table = this.requireTable()
    const out: UsageDayRow[] = []
    for (const [, row] of table.entries()) {
      if (row.day >= from && row.day <= to) out.push(row)
    }
    return out
  }

  /** All rows whose hour falls inside the inclusive calendar-day window
   *  [from, to]. Hour keys share one fixed-width shape, so plain string
   *  comparison is chronological. */
  async rangeHourRows(from: string, to: string): Promise<UsageHourRow[]> {
    await this.ready
    const table = this.requireHourTable()
    const lo = `${from}T00`
    const hi = `${to}T23`
    const out: UsageHourRow[] = []
    for (const [, row] of table.entries()) {
      if (row.hour >= lo && row.hour <= hi) out.push(row)
    }
    return out
  }

  /** All session rows whose day intersects [from, to] (inclusive). */
  async rangeSessionRows(from: string, to: string): Promise<UsageSessionRow[]> {
    await this.ready
    const table = this.requireSessionTable()
    const out: UsageSessionRow[] = []
    for (const [, row] of table.entries()) {
      if (row.day >= from && row.day <= to) out.push(row)
    }
    return out
  }

  /** Whether the session table has any row at all (diagnostics/tests). */
  async hasAnySessionRows(): Promise<boolean> {
    await this.ready
    return this.requireSessionTable().keys().next().done === false
  }

  /** Whether the day table has any row at all — the upgrade detector that
   *  separates "existing store" from "fresh install". */
  async hasAnyDayRows(): Promise<boolean> {
    await this.ready
    return this.requireTable().keys().next().done === false
  }

  /** The earliest day key the store holds, or null when it holds nothing.
   *  Backs the "all time" range preset: that window has no fixed length, so its
   *  start has to be read off the data rather than computed from today. */
  async firstDay(): Promise<string | null> {
    await this.ready
    const table = this.requireTable()
    let first: string | null = null
    for (const [, row] of table.entries()) {
      if (first === null || row.day < first) first = row.day
    }
    return first
  }

  /** Total row count (diagnostics / tests). */
  async count(): Promise<number> {
    await this.ready
    const table = this.requireTable()
    let n = 0
    for (const _ of table.entries()) n++
    return n
  }
}

function emptyDayRow(day: string, provider: string, model: string): UsageDayRow {
  return { ...emptyCounters(provider, model), day }
}

function emptyHourRow(hour: string, provider: string, model: string): UsageHourRow {
  return { ...emptyCounters(provider, model), hour }
}

function emptySessionRow(session: string, day: string, provider: string, model: string): UsageSessionRow {
  return { ...emptyCounters(provider, model), session, day }
}

function emptyCounters(provider: string, model: string): UsageCounters {
  return {
    provider,
    model,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    requests: 0,
    turns: 0,
    // 0 (not `Date.now()`): the first accumulate takes the sample's own event
    // time, so a row's lastSeen never carries the seed's wall clock.
    lastSeen: 0,
    firstSeen: undefined,
  }
}

/** Fold one sample into a row. The request marker and the token buckets are
 *  ORTHOGONAL: a marker counts one provider call whether or not that call
 *  reported tokens. `step/start` and started retries carry none (reasonix
 *  counts failed calls too); a `compaction/summary` reports usage for the very
 *  call it counts, so it sets both. A plain token sample leaves the marker
 *  unset — its call was already counted by its own step/start, and bumping
 *  requests here too would double every successful call.
 *
 *  `lastSeen`/`firstSeen` prefer the sample's own event time: during a
 *  historical replay every write happens "now", so a wall-clock stamp would
 *  collapse a range's ordering and make the session list's activity stamps
 *  meaningless. */
function accumulate<T extends UsageCounters>(base: T, sample: UsageSample): T {
  const at = typeof sample.at === 'number' && Number.isFinite(sample.at) ? sample.at : Date.now()
  const firstSeen = base.firstSeen === undefined ? at : Math.min(base.firstSeen, at)
  if (sample.turn) {
    return { ...base, turns: base.turns + 1, lastSeen: Math.max(base.lastSeen, at), firstSeen }
  }
  // Every bucket passes through `bucket()`: a NaN or negative can never enter a
  // durable row. NaN would be permanent (NaN + x stays NaN) and JSON.stringify
  // would serialize it as null, corrupting the panel's totals for that row
  // forever.
  return {
    ...base,
    requests: base.requests + (sample.request ? 1 : 0),
    inputTokens: base.inputTokens + bucket(sample.inputTokens),
    outputTokens: base.outputTokens + bucket(sample.outputTokens),
    cacheReadTokens: base.cacheReadTokens + bucket(sample.cacheReadTokens),
    cacheWriteTokens: base.cacheWriteTokens + bucket(sample.cacheWriteTokens),
    lastSeen: Math.max(base.lastSeen, at),
    firstSeen,
  }
}

/** A token count as a non-negative finite number; anything else is zero. */
function bucket(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}
