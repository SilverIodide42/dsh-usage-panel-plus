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
import type { UsageStorageDomain } from './context-types.ts';
import type { UsageSample } from './query.ts';
import { z } from 'zod';
/** The counters both tables carry: one model's usage over one bucket. */
export interface UsageCounters {
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    requests: number;
    turns: number;
    lastSeen: number;
    /** Epoch ms of the OLDEST sample folded into this row. Optional: rows
     *  written before the field existed (and seeds) carry none; the loader's
     *  first accumulate backfills it from the sample's own event time. */
    firstSeen?: number;
}
/** One row: a model's usage on one local calendar day. */
export interface UsageDayRow extends UsageCounters {
    day: string;
}
/** One row: a model's usage in one local calendar hour. */
export interface UsageHourRow extends UsageCounters {
    hour: string;
}
export declare const usageDayRowSchema: z.ZodObject<{
    day: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    cacheReadTokens: z.ZodNumber;
    cacheWriteTokens: z.ZodNumber;
    requests: z.ZodNumber;
    turns: z.ZodNumber;
    lastSeen: z.ZodNumber;
    firstSeen: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const usageHourRowSchema: z.ZodObject<{
    hour: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    cacheReadTokens: z.ZodNumber;
    cacheWriteTokens: z.ZodNumber;
    requests: z.ZodNumber;
    turns: z.ZodNumber;
    lastSeen: z.ZodNumber;
    firstSeen: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/** One row: one SESSION's usage of one model on one local calendar day. The
 *  session table is the only place that knows which conversation a call came
 *  from; the day/hour tables stay model-keyed (they predate the dimension and
 *  remain the aggregate source for every existing section). */
export interface UsageSessionRow extends UsageCounters {
    session: string;
    day: string;
}
/** One session's metadata row: its display title (from `session/title`) and
 *  when the row last changed. The session id is the key. */
export interface UsageSessionMetaRow {
    session: string;
    title: string;
    updatedAt: number;
}
export declare const usageSessionRowSchema: z.ZodObject<{
    session: z.ZodString;
    day: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
    cacheReadTokens: z.ZodNumber;
    cacheWriteTokens: z.ZodNumber;
    requests: z.ZodNumber;
    turns: z.ZodNumber;
    lastSeen: z.ZodNumber;
    firstSeen: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const usageSessionMetaRowSchema: z.ZodObject<{
    session: z.ZodString;
    title: z.ZodString;
    updatedAt: z.ZodNumber;
}, z.core.$strip>;
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
export declare const usageHistoryDomain: {
    name: string;
    version: number;
    global: {
        schema: z.ZodObject<{
            backfilledSessions: z.ZodArray<z.ZodString>;
            liveFirstSeq: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            hoursBackfilledSessions: z.ZodOptional<z.ZodArray<z.ZodString>>;
            hoursLiveFirstSeq: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            hoursReady: z.ZodOptional<z.ZodBoolean>;
            sessionsBackfilledSessions: z.ZodOptional<z.ZodArray<z.ZodString>>;
            sessionsLiveFirstSeq: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            sessionsReady: z.ZodOptional<z.ZodBoolean>;
            sessionsCoverage: z.ZodOptional<z.ZodNumber>;
            legacyImported: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        initial: {
            backfilledSessions: string[];
            liveFirstSeq: {};
            hoursBackfilledSessions: string[];
            hoursLiveFirstSeq: {};
        };
    };
    tables: {
        days: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, UsageDayRow>;
        hours: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, UsageHourRow>;
        sessions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, UsageSessionRow>;
        session_meta: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, UsageSessionMetaRow>;
    };
};
/** key: `day|provider|model`. */
export declare function dayRowKey(day: string, provider: string, model: string): string;
/** key: `hour|provider|model`. */
export declare function hourRowKey(hour: string, provider: string, model: string): string;
/** key: `session|day|provider|model`. */
export declare function sessionRowKey(session: string, day: string, provider: string, model: string): string;
/** The session-dimension coverage rule version (see the cursor field). Bump
 *  when the rules for which span a session replay covers change; older
 *  stores then rebuild the session tables once on the next boot. */
export declare const SESSION_COVERAGE_VERSION = 2;
export declare class UsageStore {
    private table;
    private hourTable;
    private sessionTable;
    private sessionMetaTable;
    private domainHandle;
    private ready;
    /** Set when the domain could not be opened (already-open race, corrupted
     *  file, ...). The store then runs DEGRADED: every operation fails
     *  per-call with a clear error and nothing persists, but no rejecting
     *  promise is ever left unobserved — an escaping rejection here used to
     *  be able to take the whole host down. */
    private openError?;
    /** Serializes read-modify-write cycles on the backfill cursor. The domain
     *  only guarantees single-write ordering on its chain — a global.set is a
     *  whole-value overwrite, so two concurrent markSeenSessions calls would
     *  interleave get→set and lose one caller's ids (lost update). Chaining
     *  through this promise makes every get→set pair atomic within the
     *  process, which is the only concurrency that exists here. */
    private markChain;
    /** Opt-in: fold the legacy `usage_history` domain in once at open. Only the
     *  host entry passes this; unit tests construct bare stores and must never
     *  read the machine's real ~/.dsh files. */
    private readonly importLegacy;
    /** Source file for the one-time legacy import (overridable for tests). */
    private readonly legacyFile;
    constructor(ctx: UsageStorageDomain, options?: {
        importLegacy?: boolean;
        legacyFile?: string;
    });
    private initialize;
    /** Outcome of the one-time legacy import, for diagnostics and tests.
     *  Undefined until {@link importLegacyOnce} has run once. */
    legacyImport?: {
        days: number;
        hours: number;
        skipped: number;
        failed: number;
    } | 'skipped';
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
    private importLegacyOnce;
    /** The open failure when running degraded, else undefined (diagnostics). */
    get degradation(): unknown;
    /** Session ids already replayed into the store (the backfill cursor).
     *  A medium without a global (pre-cursor rows) yields an empty set, which
     *  would replay everything once — acceptable only for a fresh install, so
     *  callers pairing this with markSeenSessions still converge after one
     *  pass. */
    seenSessions(): Promise<Set<string>>;
    /** Per-session seq of the first LIVE-observed event (see the domain's
     *  `liveFirstSeq` doc). -1 = observed with an unknown boundary. */
    liveSequences(): Promise<Map<string, number>>;
    private cursor;
    /** The cursor value for a read-modify-write cycle. Degraded stores fail
     *  here too: the cursor-writing methods must honor the same per-call
     *  failure contract as record() — silently succeeding while persisting
     *  nothing would make callers believe a replay boundary was durable. */
    private requireCursor;
    /** Persist session ids as replayed (merges into the cursor). Calls are
     *  serialized through {@link markChain} so concurrent workers never lose
     *  each other's ids in a get→set interleaving. */
    markSeenSessions(ids: Iterable<string>): Promise<void>;
    /** Record the first LIVE-observed seq per session (merges; the EARLIEST
     *  boundary wins — it is the safe partition point for prefix replays).
     *  Serialized through {@link markChain} like every other global rewrite. */
    markLiveSequences(entries: Iterable<readonly [string, number]>): Promise<void>;
    /** Session ids already replayed into the HOUR table. The hour table
     *  arrived after the day cursors were populated, so it keeps its own seen
     *  set: sharing the day cursor would make the upgrade pass skip every
     *  session and leave the hour table empty forever. */
    hoursSeenSessions(): Promise<Set<string>>;
    /** Per-session seq of the first LIVE-observed event, hour-table share. */
    hoursLiveSequences(): Promise<Map<string, number>>;
    /** Persist hour-table replay progress (merges; serialized on the same
     *  chain as every other cursor write). */
    markHoursSeenSessions(ids: Iterable<string>): Promise<void>;
    /** Record the hour-table live boundary per session (earliest wins). */
    markHoursLiveSequences(entries: Iterable<readonly [string, number]>): Promise<void>;
    /** Whether the hour table covers every replayable session (initial install,
     *  upgrade pass, or a rebuild). */
    hoursReady(): Promise<boolean>;
    /** Mark the hour history complete; the upgrade pass then never reruns. */
    markHoursReady(): Promise<void>;
    /** Session ids already replayed into the SESSION table (its own cursor
     *  pair — same reason as the hour table: the older cursors were already
     *  populated when the dimension arrived). */
    sessionsSeenSessions(): Promise<Set<string>>;
    /** Per-session seq of the first LIVE-observed event, session-table share. */
    sessionsLiveSequences(): Promise<Map<string, number>>;
    /** Persist session-table replay progress (merges; serialized on the same
     *  chain as every other cursor write). */
    markSessionsSeenSessions(ids: Iterable<string>): Promise<void>;
    /** Record the session-table live boundary per session (earliest wins). */
    markSessionsLiveSequences(entries: Iterable<readonly [string, number]>): Promise<void>;
    /** Whether the session table covers every replayable session. */
    sessionsReady(): Promise<boolean>;
    /** Mark the session dimension complete under the CURRENT coverage rules;
     *  the upgrade pass then never reruns. */
    markSessionsReady(): Promise<void>;
    /** The coverage-rule version the session tables were built under (0 for a
     *  store predating the marker). */
    sessionsCoverage(): Promise<number>;
    /** Drop the session dimension's rows and cursors so the next sessions pass
     *  replays every persisted log from scratch under the current rules.
     *
     *  Deliberately leaves the day/hour tables and the session TITLES alone:
     *  only the session-keyed counters are being rebuilt, and a title is
     *  independent of any replay boundary. The live-boundary map is cleared
     *  too — a stale prefix boundary from an older boot would otherwise cap a
     *  live session's replay and re-create the very gap this rebuild heals. */
    resetSessionsForRebuild(): Promise<void>;
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
    reset(boundaries?: ReadonlyMap<string, number>): Promise<void>;
    /** Opens the domain (lazily awaited by every operation). */
    readyPromise(): Promise<void>;
    private requireTable;
    private requireHourTable;
    private requireSessionTable;
    private requireSessionMetaTable;
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
    record(sample: UsageSample): Promise<void>;
    /** Fold a sample into the HOUR table only. The upgrade pass uses this: the
     *  day cursors are already advanced, so replaying through `record()` would
     *  double every day row. */
    recordHours(sample: UsageSample): Promise<void>;
    /** Fold a sample into the SESSION table only. The session-dimension upgrade
     *  pass uses this: the older cursors are already advanced, so replaying
     *  through `record()` would double the day and hour rows. */
    recordSession(sample: UsageSample): Promise<void>;
    /** Upsert one session's display title (the `session/title` event value).
     *  An unchanged title is a no-op so automatic re-titling does not rewrite
     *  the row on every observation. */
    recordSessionTitle(session: string, title: string): Promise<void>;
    /** Every known session title, keyed by session id. */
    sessionTitles(): Promise<Map<string, string>>;
    /** The row identity a sample lands on: turn markers use the synthetic
     *  (turns) model, unlabelled calls the (unknown) one. */
    private targetsOf;
    private recordInto;
    /** All rows whose day intersects [from, to] (inclusive). */
    rangeRows(from: string, to: string): Promise<UsageDayRow[]>;
    /** All rows whose hour falls inside the inclusive calendar-day window
     *  [from, to]. Hour keys share one fixed-width shape, so plain string
     *  comparison is chronological. */
    rangeHourRows(from: string, to: string): Promise<UsageHourRow[]>;
    /** All session rows whose day intersects [from, to] (inclusive). */
    rangeSessionRows(from: string, to: string): Promise<UsageSessionRow[]>;
    /** Whether the session table has any row at all (diagnostics/tests). */
    hasAnySessionRows(): Promise<boolean>;
    /** Whether the day table has any row at all — the upgrade detector that
     *  separates "existing store" from "fresh install". */
    hasAnyDayRows(): Promise<boolean>;
    /** The earliest day key the store holds, or null when it holds nothing.
     *  Backs the "all time" range preset: that window has no fixed length, so its
     *  start has to be read off the data rather than computed from today. */
    firstDay(): Promise<string | null>;
    /** Total row count (diagnostics / tests). */
    count(): Promise<number>;
}
