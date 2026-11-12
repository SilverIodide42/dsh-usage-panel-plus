import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
import { z } from "zod";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
//#region src/shared.ts
/**
* Pure helpers shared by the host aggregation layer and the browser panel.
* This module MUST stay free of Node.js and DOM types and carry zero
* imports: both halves import it at runtime (the client bundle-purity gate
* rejects Node builtins, and a value import of `wire.ts` would drag the
* host-only HTTP helpers — including `Buffer` — into the browser bundle).
*/
/** Local calendar day key, e.g. "2026-08-02" (no UTC shift). */
function dayKey(ts) {
	const d = new Date(ts);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** Local calendar hour key, e.g. "2026-08-02T07" (no UTC shift). */
function hourKey(ts) {
	const d = new Date(ts);
	return `${dayKey(ts)}T${String(d.getHours()).padStart(2, "0")}`;
}
/** All local-calendar day keys in [from, to], inclusive. Invalid or reversed
*  bounds yield an empty list. */
function daysInRange(from, to) {
	const out = [];
	const start = /* @__PURE__ */ new Date(`${from}T00:00:00`);
	const end = /* @__PURE__ */ new Date(`${to}T00:00:00`);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return out;
	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		out.push(`${y}-${m}-${day}`);
	}
	return out;
}
/** model refs are "provider/model"; a bare model name has no slash and is
*  attributed to provider "default". */
function providerOf(modelRef) {
	const i = modelRef.indexOf("/");
	if (i > 0) return modelRef.slice(0, i);
	return "default";
}
/** Shift a `YYYY-MM-DD` local calendar day key by whole days (negative =
*  past). Used to derive the comparison window immediately before a range.
*  The anchor is local noon so a DST transition (not a concern in the host's
*  Asia/Shanghai zone, but the helper stays honest elsewhere) can never move
*  the result onto the neighbouring day. */
function shiftDayKey(day, delta) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
	if (match === null) return day;
	const base = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
	base.setDate(base.getDate() + delta);
	return dayKey(base.getTime());
}
//#endregion
//#region src/query.ts
/** The bucket keys covering [from, to]: one per day, or 24 per day in hour
*  mode (empty buckets included, so the chart keeps a full timeline). */
function bucketsInRange(from, to, granularity) {
	const days = daysInRange(from, to);
	if (granularity === "day") return days;
	const out = [];
	for (const day of days) for (let hour = 0; hour < 24; hour++) out.push(`${day}T${String(hour).padStart(2, "0")}`);
	return out;
}
/** The bucket a sample belongs to, or null when it falls outside the window
*  (or carries no hour in hour mode). Hour keys are fixed-width, so plain
*  string comparison is chronological. */
function bucketOf(sample, from, to, granularity) {
	if (granularity === "day") return sample.day >= from && sample.day <= to ? sample.day : null;
	const hour = sample.hour;
	if (hour === void 0) return null;
	return hour >= `${from}T00` && hour <= `${to}T23` ? hour : null;
}
/** Aggregate the samples intersecting [from, to]. Missing buckets yield zero
*  entries so the trend chart shows the full timeline. */
function aggregateSamples(samples, filter, granularity = "day") {
	const from = filter.from;
	const to = filter.to;
	const buckets = bucketsInRange(from, to, granularity);
	const out = {
		from,
		to,
		granularity,
		tokens: 0,
		requests: 0,
		turns: 0,
		cacheHit: 0,
		cacheMiss: 0,
		activeDays: 0,
		topModel: "",
		topProvider: "",
		daily: [],
		models: [],
		providers: []
	};
	const modelTotals = /* @__PURE__ */ new Map();
	const modelCacheHit = /* @__PURE__ */ new Map();
	const modelCacheMiss = /* @__PURE__ */ new Map();
	const providerTotals = /* @__PURE__ */ new Map();
	const active = /* @__PURE__ */ new Set();
	const bucketByModel = /* @__PURE__ */ new Map();
	const bucketTotals = /* @__PURE__ */ new Map();
	const bucketRequests = /* @__PURE__ */ new Map();
	const bucketTurns = /* @__PURE__ */ new Map();
	const bucketCacheHit = /* @__PURE__ */ new Map();
	const bucketCacheMiss = /* @__PURE__ */ new Map();
	for (const sample of samples) {
		const bucket = bucketOf(sample, from, to, granularity);
		if (bucket === null) continue;
		if (sample.turn) {
			out.turns++;
			bucketTurns.set(bucket, (bucketTurns.get(bucket) ?? 0) + 1);
			continue;
		}
		const total = sample.inputTokens + sample.outputTokens + sample.cacheReadTokens + sample.cacheWriteTokens;
		if (sample.request) {
			out.requests++;
			bucketRequests.set(bucket, (bucketRequests.get(bucket) ?? 0) + 1);
			if (total <= 0) continue;
		}
		out.tokens += total;
		out.cacheHit += sample.cacheReadTokens;
		out.cacheMiss += sample.inputTokens + sample.cacheWriteTokens;
		const model = sample.model && sample.model !== "" ? sample.model : "(unknown)";
		modelTotals.set(model, (modelTotals.get(model) ?? 0) + total);
		modelCacheHit.set(model, (modelCacheHit.get(model) ?? 0) + sample.cacheReadTokens);
		modelCacheMiss.set(model, (modelCacheMiss.get(model) ?? 0) + sample.inputTokens + sample.cacheWriteTokens);
		providerTotals.set(providerOf(model), (providerTotals.get(providerOf(model)) ?? 0) + total);
		active.add(bucket.slice(0, 10));
		let byModel = bucketByModel.get(bucket);
		if (!byModel) {
			byModel = /* @__PURE__ */ new Map();
			bucketByModel.set(bucket, byModel);
		}
		byModel.set(model, (byModel.get(model) ?? 0) + total);
		bucketTotals.set(bucket, (bucketTotals.get(bucket) ?? 0) + total);
		bucketCacheHit.set(bucket, (bucketCacheHit.get(bucket) ?? 0) + sample.cacheReadTokens);
		bucketCacheMiss.set(bucket, (bucketCacheMiss.get(bucket) ?? 0) + sample.inputTokens + sample.cacheWriteTokens);
	}
	out.activeDays = active.size;
	for (const bucket of buckets) {
		const byModel = bucketByModel.get(bucket);
		const byModelObj = {};
		if (byModel) for (const [m, v] of byModel) byModelObj[m] = v;
		const byProviderObj = {};
		for (const m of Object.keys(byModelObj)) byProviderObj[providerOf(m)] = (byProviderObj[providerOf(m)] ?? 0) + byModelObj[m];
		out.daily.push({
			day: bucket,
			total: bucketTotals.get(bucket) ?? 0,
			byModel: byModelObj,
			byProvider: byProviderObj,
			requests: bucketRequests.get(bucket) ?? 0,
			turns: bucketTurns.get(bucket) ?? 0,
			cacheHit: bucketCacheHit.get(bucket) ?? 0,
			cacheMiss: bucketCacheMiss.get(bucket) ?? 0
		});
	}
	out.models = modelsSorted(modelTotals, modelCacheHit, modelCacheMiss);
	out.providers = providersSorted(providerTotals);
	const top = out.models[0];
	if (top) {
		out.topModel = top.model;
		out.topProvider = top.provider;
	}
	if (out.tokens > 0) {
		for (const m of out.models) m.percent = m.tokens / out.tokens * 100;
		for (const p of out.providers) p.percent = p.tokens / out.tokens * 100;
	}
	return out;
}
function modelsSorted(totals, cacheHit, cacheMiss) {
	const out = [];
	for (const [model, tokens] of totals) out.push({
		model,
		provider: providerOf(model),
		tokens,
		percent: 0,
		cacheHit: cacheHit.get(model) ?? 0,
		cacheMiss: cacheMiss.get(model) ?? 0
	});
	out.sort((a, b) => b.tokens - a.tokens);
	return out;
}
function providersSorted(totals) {
	const out = [];
	for (const [provider, tokens] of totals) out.push({
		provider,
		tokens,
		percent: 0
	});
	out.sort((a, b) => b.tokens - a.tokens);
	return out;
}
/** Fold session-table rows intersecting [from, to] into per-session
*  aggregates. Turn markers live on the synthetic "(turns)" model row, so
*  their counters add turns only; token and request rows add their buckets.
*  Rows whose model is "(unknown)" still contribute to the session's totals
*  (the call was real), and their request count is also reported as the
*  unknown-attribution share. */
function aggregateSessionRows(rows, titles, filter) {
	const bySession = /* @__PURE__ */ new Map();
	let unknownRequests = 0;
	for (const row of rows) {
		if (row.day < filter.from || row.day > filter.to) continue;
		const tokens = row.inputTokens + row.outputTokens + row.cacheReadTokens + row.cacheWriteTokens;
		const isTurnRow = row.model === "(turns)";
		if (isTurnRow ? row.turns <= 0 : tokens <= 0 && row.requests <= 0) continue;
		let entry = bySession.get(row.session);
		if (entry === void 0) {
			entry = {
				tokens: 0,
				requests: 0,
				turns: 0,
				cacheHit: 0,
				cacheMiss: 0,
				firstSeen: 0,
				lastSeen: 0,
				models: /* @__PURE__ */ new Map()
			};
			bySession.set(row.session, entry);
		}
		if (isTurnRow) entry.turns += row.turns;
		else {
			entry.tokens += tokens;
			entry.requests += row.requests;
			entry.cacheHit += row.cacheReadTokens;
			entry.cacheMiss += row.inputTokens + row.cacheWriteTokens;
			if (tokens > 0) entry.models.set(row.model, (entry.models.get(row.model) ?? 0) + tokens);
			if (row.model === "(unknown)") unknownRequests += row.requests;
		}
		if (row.lastSeen > 0) entry.lastSeen = Math.max(entry.lastSeen, row.lastSeen);
		const rowFirst = row.firstSeen ?? row.lastSeen;
		if (rowFirst > 0) entry.firstSeen = entry.firstSeen === 0 ? rowFirst : Math.min(entry.firstSeen, rowFirst);
	}
	const sessions = [];
	for (const [session, entry] of bySession) {
		const models = [];
		for (const [model, tokens] of entry.models) models.push({
			model,
			provider: providerOf(model),
			tokens,
			percent: entry.tokens > 0 ? tokens / entry.tokens * 100 : 0
		});
		models.sort((a, b) => b.tokens - a.tokens);
		sessions.push({
			session,
			title: titles.get(session) ?? "",
			tokens: entry.tokens,
			requests: entry.requests,
			turns: entry.turns,
			cacheHit: entry.cacheHit,
			cacheMiss: entry.cacheMiss,
			firstSeen: entry.firstSeen,
			lastSeen: entry.lastSeen,
			models
		});
	}
	sessions.sort((a, b) => b.tokens - a.tokens || b.lastSeen - a.lastSeen);
	return {
		sessionCount: sessions.length,
		sessions,
		unknownRequests
	};
}
//#endregion
//#region src/store.ts
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
/** True when a KvTable.update() failure is the "no record to update" miss
*  (the storage-domain error for an absent key) — the retry path seeds the
*  row and re-applies. */
function isMissingRecord(err) {
	return err instanceof Error && /no record .* to update/.test(err.message);
}
const usageDayRowSchema = z.object({
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
	firstSeen: z.number().optional()
});
const usageHourRowSchema = z.object({
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
	firstSeen: z.number().optional()
});
const usageSessionRowSchema = z.object({
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
	firstSeen: z.number().optional()
});
const usageSessionMetaRowSchema = z.object({
	session: z.string(),
	title: z.string(),
	updatedAt: z.number()
});
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
const usageHistoryDomain = defineDomain({
	name: "usage_panel_plus",
	version: 1,
	global: {
		schema: z.object({
			backfilledSessions: z.array(z.string()),
			liveFirstSeq: z.record(z.string(), z.number()).optional(),
			hoursBackfilledSessions: z.array(z.string()).optional(),
			hoursLiveFirstSeq: z.record(z.string(), z.number()).optional(),
			hoursReady: z.boolean().optional(),
			sessionsBackfilledSessions: z.array(z.string()).optional(),
			sessionsLiveFirstSeq: z.record(z.string(), z.number()).optional(),
			sessionsReady: z.boolean().optional(),
			sessionsCoverage: z.number().optional(),
			legacyImported: z.boolean().optional()
		}),
		initial: {
			backfilledSessions: [],
			liveFirstSeq: {},
			hoursBackfilledSessions: [],
			hoursLiveFirstSeq: {}
		}
	},
	tables: {
		days: domainTable(usageDayRowSchema),
		hours: domainTable(usageHourRowSchema),
		sessions: domainTable(usageSessionRowSchema),
		session_meta: domainTable(usageSessionMetaRowSchema)
	}
});
/** key: `day|provider|model`. */
function dayRowKey(day, provider, model) {
	return `${day}|${provider}|${model}`;
}
/** key: `hour|provider|model`. */
function hourRowKey(hour, provider, model) {
	return `${hour}|${provider}|${model}`;
}
/** key: `session|day|provider|model`. */
function sessionRowKey(session, day, provider, model) {
	return `${session}|${day}|${provider}|${model}`;
}
var UsageStore = class {
	table = null;
	hourTable = null;
	sessionTable = null;
	sessionMetaTable = null;
	domainHandle = null;
	ready;
	/** Set when the domain could not be opened (already-open race, corrupted
	*  file, ...). The store then runs DEGRADED: every operation fails
	*  per-call with a clear error and nothing persists, but no rejecting
	*  promise is ever left unobserved — an escaping rejection here used to
	*  be able to take the whole host down. */
	openError;
	/** Serializes read-modify-write cycles on the backfill cursor. The domain
	*  only guarantees single-write ordering on its chain — a global.set is a
	*  whole-value overwrite, so two concurrent markSeenSessions calls would
	*  interleave get→set and lose one caller's ids (lost update). Chaining
	*  through this promise makes every get→set pair atomic within the
	*  process, which is the only concurrency that exists here. */
	markChain = Promise.resolve();
	/** Opt-in: fold the legacy `usage_history` domain in once at open. Only the
	*  host entry passes this; unit tests construct bare stores and must never
	*  read the machine's real ~/.dsh files. */
	importLegacy;
	/** Source file for the one-time legacy import (overridable for tests). */
	legacyFile;
	constructor(ctx, options = {}) {
		this.importLegacy = options.importLegacy === true;
		this.legacyFile = options.legacyFile ?? process.env.DSH_USAGE_LEGACY_FILE ?? join(homedir(), ".dsh", "storages", "usage_history.json");
		this.ready = this.initialize(ctx).catch((err) => {
			this.openError = err;
		});
	}
	async initialize(ctx) {
		const domain = await ctx.open(usageHistoryDomain);
		this.domainHandle = domain;
		this.table = domain.table("days");
		this.hourTable = domain.table("hours");
		this.sessionTable = domain.table("sessions");
		this.sessionMetaTable = domain.table("session_meta");
		if (((domain.global?.get())?.backfilledSessions?.length ?? 0) === 0 && this.table.keys().next().done === false) {
			for (const key of [...this.table.keys()]) await this.table.delete(key);
			for (const key of [...this.hourTable?.keys() ?? []]) await this.hourTable?.delete(key);
			for (const key of [...this.sessionTable?.keys() ?? []]) await this.sessionTable?.delete(key);
			for (const key of [...this.sessionMetaTable?.keys() ?? []]) await this.sessionMetaTable?.delete(key);
		}
		if (this.importLegacy) await this.importLegacyOnce(domain);
	}
	/** Outcome of the one-time legacy import, for diagnostics and tests.
	*  Undefined until {@link importLegacyOnce} has run once. */
	legacyImport;
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
	async importLegacyOnce(domain) {
		const global = domain.global?.get();
		if (global?.legacyImported === true) {
			this.legacyImport = "skipped";
			return;
		}
		const file = this.legacyFile;
		if (!existsSync(file)) {
			this.legacyImport = "skipped";
			return;
		}
		let legacy;
		try {
			legacy = JSON.parse(readFileSync(file, "utf8"));
		} catch {
			this.legacyImport = "skipped";
			return;
		}
		const rawDays = legacy.tables?.days ?? {};
		const rawHours = legacy.tables?.hours ?? {};
		if (Object.keys(rawDays).length === 0 && Object.keys(rawHours).length === 0) {
			this.legacyImport = "skipped";
			return;
		}
		let skipped = 0;
		const dayRows = [];
		const hourRows = [];
		for (const [key, raw] of Object.entries(rawDays)) {
			const parsed = usageDayRowSchema.safeParse(raw);
			if (parsed.success) dayRows.push([key, parsed.data]);
			else skipped++;
		}
		for (const [key, raw] of Object.entries(rawHours)) {
			const parsed = usageHourRowSchema.safeParse(raw);
			if (parsed.success) hourRows.push([key, parsed.data]);
			else skipped++;
		}
		let failed = 0;
		const writeChunk = async (table, rows) => {
			if (table === null) return;
			const CHUNK = 50;
			for (let i = 0; i < rows.length; i += CHUNK) await Promise.all(rows.slice(i, i + CHUNK).map(async ([key, row]) => {
				try {
					await table.put(key, row);
				} catch {
					failed++;
				}
			}));
		};
		await writeChunk(this.table, dayRows);
		await writeChunk(this.hourTable, hourRows);
		this.legacyImport = {
			days: dayRows.length,
			hours: hourRows.length,
			skipped,
			failed
		};
		const lg = legacy.global ?? {};
		const mergedGlobal = { ...global ?? {} };
		const unionArray = (a, b) => [.../* @__PURE__ */ new Set([...Array.isArray(a) ? a : [], ...Array.isArray(b) ? b : []])].sort();
		for (const key of ["backfilledSessions", "hoursBackfilledSessions"]) mergedGlobal[key] = unionArray(lg[key], mergedGlobal[key]);
		const unionMap = (a, b) => {
			const out = { ...b && typeof b === "object" ? b : {} };
			if (a && typeof a === "object") Object.assign(out, a);
			return out;
		};
		for (const key of ["liveFirstSeq", "hoursLiveFirstSeq"]) mergedGlobal[key] = unionMap(lg[key], mergedGlobal[key]);
		if (lg.hoursReady === true) mergedGlobal.hoursReady = true;
		mergedGlobal.legacyImported = true;
		await domain.global.set(mergedGlobal);
	}
	/** The open failure when running degraded, else undefined (diagnostics). */
	get degradation() {
		return this.openError;
	}
	/** Session ids already replayed into the store (the backfill cursor).
	*  A medium without a global (pre-cursor rows) yields an empty set, which
	*  would replay everything once — acceptable only for a fresh install, so
	*  callers pairing this with markSeenSessions still converge after one
	*  pass. */
	async seenSessions() {
		await this.ready;
		const value = this.cursor();
		return new Set(value?.backfilledSessions ?? []);
	}
	/** Per-session seq of the first LIVE-observed event (see the domain's
	*  `liveFirstSeq` doc). -1 = observed with an unknown boundary. */
	async liveSequences() {
		await this.ready;
		const value = this.cursor();
		return new Map(Object.entries(value?.liveFirstSeq ?? {}));
	}
	cursor() {
		return this.domainHandle?.global?.get();
	}
	/** The cursor value for a read-modify-write cycle. Degraded stores fail
	*  here too: the cursor-writing methods must honor the same per-call
	*  failure contract as record() — silently succeeding while persisting
	*  nothing would make callers believe a replay boundary was durable. */
	requireCursor() {
		if (this.openError !== void 0) {
			const detail = this.openError instanceof Error ? this.openError.message : String(this.openError);
			throw new Error(`usage store degraded (domain unavailable: ${detail})`);
		}
		return this.cursor() ?? {};
	}
	/** Persist session ids as replayed (merges into the cursor). Calls are
	*  serialized through {@link markChain} so concurrent workers never lose
	*  each other's ids in a get→set interleaving. */
	async markSeenSessions(ids) {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			const seen = new Set(value.backfilledSessions ?? []);
			for (const id of ids) seen.add(id);
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: [...seen],
				liveFirstSeq: value.liveFirstSeq ?? {}
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Record the first LIVE-observed seq per session (merges; the EARLIEST
	*  boundary wins — it is the safe partition point for prefix replays).
	*  Serialized through {@link markChain} like every other global rewrite. */
	async markLiveSequences(entries) {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			const merged = { ...value.liveFirstSeq ?? {} };
			let changed = false;
			for (const [id, seq] of entries) {
				const prev = merged[id];
				if (prev === void 0 || seq < prev) {
					merged[id] = seq;
					changed = true;
				}
			}
			if (!changed) return;
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				liveFirstSeq: merged
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Session ids already replayed into the HOUR table. The hour table
	*  arrived after the day cursors were populated, so it keeps its own seen
	*  set: sharing the day cursor would make the upgrade pass skip every
	*  session and leave the hour table empty forever. */
	async hoursSeenSessions() {
		await this.ready;
		return new Set(this.cursor()?.hoursBackfilledSessions ?? []);
	}
	/** Per-session seq of the first LIVE-observed event, hour-table share. */
	async hoursLiveSequences() {
		await this.ready;
		return new Map(Object.entries(this.cursor()?.hoursLiveFirstSeq ?? {}));
	}
	/** Persist hour-table replay progress (merges; serialized on the same
	*  chain as every other cursor write). */
	async markHoursSeenSessions(ids) {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			const seen = new Set(value.hoursBackfilledSessions ?? []);
			for (const id of ids) seen.add(id);
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				hoursBackfilledSessions: [...seen]
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Record the hour-table live boundary per session (earliest wins). */
	async markHoursLiveSequences(entries) {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			const merged = { ...value.hoursLiveFirstSeq ?? {} };
			let changed = false;
			for (const [id, seq] of entries) {
				const prev = merged[id];
				if (prev === void 0 || seq < prev) {
					merged[id] = seq;
					changed = true;
				}
			}
			if (!changed) return;
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				hoursLiveFirstSeq: merged
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Whether the hour table covers every replayable session (initial install,
	*  upgrade pass, or a rebuild). */
	async hoursReady() {
		await this.ready;
		return this.cursor()?.hoursReady === true;
	}
	/** Mark the hour history complete; the upgrade pass then never reruns. */
	async markHoursReady() {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				hoursReady: true
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Session ids already replayed into the SESSION table (its own cursor
	*  pair — same reason as the hour table: the older cursors were already
	*  populated when the dimension arrived). */
	async sessionsSeenSessions() {
		await this.ready;
		return new Set(this.cursor()?.sessionsBackfilledSessions ?? []);
	}
	/** Per-session seq of the first LIVE-observed event, session-table share. */
	async sessionsLiveSequences() {
		await this.ready;
		return new Map(Object.entries(this.cursor()?.sessionsLiveFirstSeq ?? {}));
	}
	/** Persist session-table replay progress (merges; serialized on the same
	*  chain as every other cursor write). */
	async markSessionsSeenSessions(ids) {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			const seen = new Set(value.sessionsBackfilledSessions ?? []);
			for (const id of ids) seen.add(id);
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				sessionsBackfilledSessions: [...seen]
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Record the session-table live boundary per session (earliest wins). */
	async markSessionsLiveSequences(entries) {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			const merged = { ...value.sessionsLiveFirstSeq ?? {} };
			let changed = false;
			for (const [id, seq] of entries) {
				const prev = merged[id];
				if (prev === void 0 || seq < prev) {
					merged[id] = seq;
					changed = true;
				}
			}
			if (!changed) return;
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				sessionsLiveFirstSeq: merged
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Whether the session table covers every replayable session. */
	async sessionsReady() {
		await this.ready;
		return this.cursor()?.sessionsReady === true;
	}
	/** Mark the session dimension complete under the CURRENT coverage rules;
	*  the upgrade pass then never reruns. */
	async markSessionsReady() {
		const write = this.markChain.then(async () => {
			await this.ready;
			const value = this.requireCursor();
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				sessionsReady: true,
				sessionsCoverage: 2
			});
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** The coverage-rule version the session tables were built under (0 for a
	*  store predating the marker). */
	async sessionsCoverage() {
		await this.ready;
		return this.cursor()?.sessionsCoverage ?? 0;
	}
	/** Drop the session dimension's rows and cursors so the next sessions pass
	*  replays every persisted log from scratch under the current rules.
	*
	*  Deliberately leaves the day/hour tables and the session TITLES alone:
	*  only the session-keyed counters are being rebuilt, and a title is
	*  independent of any replay boundary. The live-boundary map is cleared
	*  too — a stale prefix boundary from an older boot would otherwise cap a
	*  live session's replay and re-create the very gap this rebuild heals. */
	async resetSessionsForRebuild() {
		const write = this.markChain.then(async () => {
			await this.ready;
			const table = this.requireSessionTable();
			const value = this.requireCursor();
			await this.domainHandle?.global?.set({
				...value,
				backfilledSessions: value.backfilledSessions ?? [],
				sessionsBackfilledSessions: [],
				sessionsLiveFirstSeq: {},
				sessionsReady: false,
				sessionsCoverage: 0
			});
			for (const key of [...table.keys()]) await table.delete(key);
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
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
	async reset(boundaries) {
		const write = this.markChain.then(async () => {
			await this.ready;
			const table = this.requireTable();
			const hourTable = this.requireHourTable();
			const sessionTable = this.requireSessionTable();
			const sessionMetaTable = this.requireSessionMetaTable();
			const liveFirstSeq = {};
			if (boundaries) for (const [id, seq] of boundaries) liveFirstSeq[id] = seq;
			await this.domainHandle?.global?.set({
				backfilledSessions: [],
				liveFirstSeq,
				hoursBackfilledSessions: [],
				hoursLiveFirstSeq: { ...liveFirstSeq },
				hoursReady: false,
				sessionsBackfilledSessions: [],
				sessionsLiveFirstSeq: { ...liveFirstSeq },
				sessionsReady: false,
				sessionsCoverage: 0
			});
			for (const key of [...table.keys()]) await table.delete(key);
			for (const key of [...hourTable.keys()]) await hourTable.delete(key);
			for (const key of [...sessionTable.keys()]) await sessionTable.delete(key);
			for (const key of [...sessionMetaTable.keys()]) await sessionMetaTable.delete(key);
		});
		this.markChain = write.then(() => void 0, () => void 0);
		return write;
	}
	/** Opens the domain (lazily awaited by every operation). */
	async readyPromise() {
		await this.ready;
	}
	requireTable() {
		if (this.openError !== void 0) {
			const detail = this.openError instanceof Error ? this.openError.message : String(this.openError);
			throw new Error(`usage store degraded (domain unavailable: ${detail})`);
		}
		if (!this.table) throw new Error("usage store not ready");
		return this.table;
	}
	requireHourTable() {
		if (this.openError !== void 0) {
			const detail = this.openError instanceof Error ? this.openError.message : String(this.openError);
			throw new Error(`usage store degraded (domain unavailable: ${detail})`);
		}
		if (!this.hourTable) throw new Error("usage store not ready");
		return this.hourTable;
	}
	requireSessionTable() {
		if (this.openError !== void 0) {
			const detail = this.openError instanceof Error ? this.openError.message : String(this.openError);
			throw new Error(`usage store degraded (domain unavailable: ${detail})`);
		}
		if (!this.sessionTable) throw new Error("usage store not ready");
		return this.sessionTable;
	}
	requireSessionMetaTable() {
		if (this.openError !== void 0) {
			const detail = this.openError instanceof Error ? this.openError.message : String(this.openError);
			throw new Error(`usage store degraded (domain unavailable: ${detail})`);
		}
		if (!this.sessionMetaTable) throw new Error("usage store not ready");
		return this.sessionMetaTable;
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
	async record(sample) {
		await this.ready;
		const target = this.targetsOf(sample);
		await this.recordInto(this.requireTable(), dayRowKey(sample.day, target.provider, target.model), emptyDayRow(sample.day, target.provider, target.model), sample);
		if (sample.hour !== void 0) await this.recordHours(sample);
		if (sample.session !== void 0 && sample.session !== "") await this.recordSession(sample);
	}
	/** Fold a sample into the HOUR table only. The upgrade pass uses this: the
	*  day cursors are already advanced, so replaying through `record()` would
	*  double every day row. */
	async recordHours(sample) {
		await this.ready;
		const hour = sample.hour;
		if (hour === void 0) throw new Error("usage store: recordHours needs sample.hour");
		const target = this.targetsOf(sample);
		await this.recordInto(this.requireHourTable(), hourRowKey(hour, target.provider, target.model), emptyHourRow(hour, target.provider, target.model), sample);
	}
	/** Fold a sample into the SESSION table only. The session-dimension upgrade
	*  pass uses this: the older cursors are already advanced, so replaying
	*  through `record()` would double the day and hour rows. */
	async recordSession(sample) {
		await this.ready;
		const session = sample.session;
		if (session === void 0 || session === "") throw new Error("usage store: recordSession needs sample.session");
		const target = this.targetsOf(sample);
		await this.recordInto(this.requireSessionTable(), sessionRowKey(session, sample.day, target.provider, target.model), emptySessionRow(session, sample.day, target.provider, target.model), sample);
	}
	/** Upsert one session's display title (the `session/title` event value).
	*  An unchanged title is a no-op so automatic re-titling does not rewrite
	*  the row on every observation. */
	async recordSessionTitle(session, title) {
		if (session === "" || title === "") return;
		await this.ready;
		const table = this.requireSessionMetaTable();
		const now = Date.now();
		const apply = (cur) => {
			if (cur !== void 0 && cur.title === title) return cur;
			return {
				session,
				title,
				updatedAt: now
			};
		};
		try {
			await table.update(session, apply);
		} catch (err) {
			if (isMissingRecord(err)) {
				await table.put(session, {
					session,
					title,
					updatedAt: now
				});
				return;
			}
			throw err;
		}
	}
	/** Every known session title, keyed by session id. */
	async sessionTitles() {
		await this.ready;
		const out = /* @__PURE__ */ new Map();
		for (const [, row] of this.requireSessionMetaTable().entries()) if (row.title !== "") out.set(row.session, row.title);
		return out;
	}
	/** The row identity a sample lands on: turn markers use the synthetic
	*  (turns) model, unlabelled calls the (unknown) one. */
	targetsOf(sample) {
		return {
			provider: sample.turn ? "default" : providerOf(sample.model && sample.model !== "" ? sample.model : "(unknown)"),
			model: sample.turn ? "(turns)" : sample.model && sample.model !== "" ? sample.model : "(unknown)"
		};
	}
	async recordInto(table, key, seed, sample) {
		const apply = (cur) => accumulate(cur ?? seed, sample);
		try {
			await table.update(key, apply);
		} catch (err) {
			if (isMissingRecord(err)) {
				await table.put(key, seed);
				await table.update(key, apply);
				return;
			}
			throw err;
		}
	}
	/** All rows whose day intersects [from, to] (inclusive). */
	async rangeRows(from, to) {
		await this.ready;
		const table = this.requireTable();
		const out = [];
		for (const [, row] of table.entries()) if (row.day >= from && row.day <= to) out.push(row);
		return out;
	}
	/** All rows whose hour falls inside the inclusive calendar-day window
	*  [from, to]. Hour keys share one fixed-width shape, so plain string
	*  comparison is chronological. */
	async rangeHourRows(from, to) {
		await this.ready;
		const table = this.requireHourTable();
		const lo = `${from}T00`;
		const hi = `${to}T23`;
		const out = [];
		for (const [, row] of table.entries()) if (row.hour >= lo && row.hour <= hi) out.push(row);
		return out;
	}
	/** All session rows whose day intersects [from, to] (inclusive). */
	async rangeSessionRows(from, to) {
		await this.ready;
		const table = this.requireSessionTable();
		const out = [];
		for (const [, row] of table.entries()) if (row.day >= from && row.day <= to) out.push(row);
		return out;
	}
	/** Whether the session table has any row at all (diagnostics/tests). */
	async hasAnySessionRows() {
		await this.ready;
		return this.requireSessionTable().keys().next().done === false;
	}
	/** Whether the day table has any row at all — the upgrade detector that
	*  separates "existing store" from "fresh install". */
	async hasAnyDayRows() {
		await this.ready;
		return this.requireTable().keys().next().done === false;
	}
	/** The earliest day key the store holds, or null when it holds nothing.
	*  Backs the "all time" range preset: that window has no fixed length, so its
	*  start has to be read off the data rather than computed from today. */
	async firstDay() {
		await this.ready;
		const table = this.requireTable();
		let first = null;
		for (const [, row] of table.entries()) if (first === null || row.day < first) first = row.day;
		return first;
	}
	/** Total row count (diagnostics / tests). */
	async count() {
		await this.ready;
		const table = this.requireTable();
		let n = 0;
		for (const _ of table.entries()) n++;
		return n;
	}
};
function emptyDayRow(day, provider, model) {
	return {
		...emptyCounters(provider, model),
		day
	};
}
function emptyHourRow(hour, provider, model) {
	return {
		...emptyCounters(provider, model),
		hour
	};
}
function emptySessionRow(session, day, provider, model) {
	return {
		...emptyCounters(provider, model),
		session,
		day
	};
}
function emptyCounters(provider, model) {
	return {
		provider,
		model,
		inputTokens: 0,
		outputTokens: 0,
		cacheReadTokens: 0,
		cacheWriteTokens: 0,
		requests: 0,
		turns: 0,
		lastSeen: 0,
		firstSeen: void 0
	};
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
function accumulate(base, sample) {
	const at = typeof sample.at === "number" && Number.isFinite(sample.at) ? sample.at : Date.now();
	const firstSeen = base.firstSeen === void 0 ? at : Math.min(base.firstSeen, at);
	if (sample.turn) return {
		...base,
		turns: base.turns + 1,
		lastSeen: Math.max(base.lastSeen, at),
		firstSeen
	};
	return {
		...base,
		requests: base.requests + (sample.request ? 1 : 0),
		inputTokens: base.inputTokens + bucket(sample.inputTokens),
		outputTokens: base.outputTokens + bucket(sample.outputTokens),
		cacheReadTokens: base.cacheReadTokens + bucket(sample.cacheReadTokens),
		cacheWriteTokens: base.cacheWriteTokens + bucket(sample.cacheWriteTokens),
		lastSeen: Math.max(base.lastSeen, at),
		firstSeen
	};
}
/** A token count as a non-negative finite number; anything else is zero. */
function bucket(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}
//#endregion
//#region src/collector.ts
/** How many completed sessions accumulate before one batched cursor write.
*  The backfill cursor is a full read-modify-write global, so batching keeps
*  the rewrite count at N/batch instead of N (and shrinks the window in
*  which a crash loses progress to "at most MARK_BATCH sessions replayed"). */
const MARK_BATCH = 32;
/**
* One in-memory fold state for ONE session: tracks the newest usage sample
* per (turn, step) so a replayed log or a streaming-then-final pair never
* double counts. The store is the durable side; this fold dedupes within a
* single event pass (a session replay).
*/
var UsageFold = class UsageFold {
	seen = /* @__PURE__ */ new Map();
	keyOf(ev) {
		const data = ev.data;
		if (typeof data?.turn !== "number" || typeof data?.step !== "number") return null;
		return `${data.turn}:${data.step}`;
	}
	/** One token bucket as a non-negative finite number. A log that omits a
	*  bucket or carries a bad value must never inject NaN/Infinity into the
	*  durable counters (a NaN row can never be repaired by later accumulates). */
	static tokens(value) {
		return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
	}
	/** Fold one event. Returns the sample to persist, or null when the event
	*  carries no (new) usage or turn marker. */
	fold(ev) {
		if (ev.type === "turn/end") return {
			day: dayKey(ev.time),
			hour: hourKey(ev.time),
			inputTokens: 0,
			outputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0,
			turn: true
		};
		if (ev.type === "step/start" || ev.type === "llm/retry-started") return {
			day: dayKey(ev.time),
			hour: hourKey(ev.time),
			inputTokens: 0,
			outputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0,
			request: true
		};
		if (ev.type === "assistant/chunk") {
			const data = ev.data;
			const usage = data.chunk?.type === "usage" ? data.chunk.usage : void 0;
			return usage ? this.replaceSample(ev, usage) : null;
		}
		if (ev.type === "assistant/message") {
			const data = ev.data;
			return data.usage ? this.replaceSample(ev, data.usage) : null;
		}
		if (ev.type === "compaction/summary") return this.compactionSample(ev);
		return null;
	}
	replaceSample(ev, usage) {
		const usage2 = usage;
		if (!usage2) return null;
		const inputTokens = UsageFold.tokens(usage2.inputTokens);
		const outputTokens = UsageFold.tokens(usage2.outputTokens);
		const cacheReadTokens = UsageFold.tokens(usage2.cacheReadTokens);
		const cacheWriteTokens = UsageFold.tokens(usage2.cacheWriteTokens);
		if (inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens <= 0) return null;
		const key = this.keyOf(ev);
		const sample = {
			day: dayKey(ev.time),
			hour: hourKey(ev.time),
			inputTokens,
			outputTokens,
			cacheReadTokens,
			cacheWriteTokens
		};
		if (key === null) return sample;
		const prev = this.seen.get(key);
		this.seen.set(key, sample);
		if (prev) return null;
		return { ...sample };
	}
	/**
	* Fold one `compaction/summary` — the one place a provider call's usage
	* reaches the log OUTSIDE the agent loop. The summarization call produces no
	* `assistant/message` (its summary enters the surface as a `user/message`,
	* which carries no usage), so this event is the only record of that call and
	* the only source for its tokens. Two consequences:
	*
	* - The sample carries tokens AND the request marker. The marker is not
	*   redundant here: nothing else counts this call as a request, because no
	*   `step/start` opened it. (A plain token sample leaves the marker unset.)
	* - The event names the route that wrote the summary, and that route is
	*   authoritative — there is no step, and often no session route at all, to
	*   attribute the call to. The collector must therefore NOT overwrite this
	*   sample's model with the session's last-known route.
	*
	* A summary with no `usage` still counts as one request (the call happened);
	* dedupe is by `compactionId`, since there is no (turn, step) slot to key by
	* and a replayed log reports the same summary once per replay.
	*/
	compactionSample(ev) {
		const data = ev.data;
		const id = data?.compactionId;
		const key = typeof id === "string" && id !== "" ? `compaction:${id}` : null;
		if (key !== null && this.seen.has(key)) return null;
		const usage = data?.usage;
		const sample = {
			day: dayKey(ev.time),
			hour: hourKey(ev.time),
			inputTokens: usage?.inputTokens ?? 0,
			outputTokens: usage?.outputTokens ?? 0,
			cacheReadTokens: usage?.cacheReadTokens ?? 0,
			cacheWriteTokens: usage?.cacheWriteTokens ?? 0,
			request: true
		};
		const provider = data?.provider;
		const model = data?.model;
		if (typeof provider === "string" && provider !== "" && typeof model === "string" && model !== "") sample.model = `${provider}/${model}`;
		else if (typeof model === "string" && model !== "") sample.model = model;
		if (key !== null) this.seen.set(key, sample);
		return { ...sample };
	}
};
/**
* The collector: subscribes to live events and runs the one-time backfill.
* Samples are folded into the durable store; per-session folds keep
* replayed/duplicate reports from double counting without ever swallowing a
* concurrent session's samples.
*/
var UsageCollector = class UsageCollector {
	ctx;
	store;
	options;
	status = {
		running: false,
		total: 0,
		done: 0,
		scannedSessions: 0,
		lastSessionId: void 0,
		error: void 0,
		recordFailures: 0
	};
	/** One fold bucket per live session id: (turn, step) dedupe keys are
	*  session-scoped, so concurrent sessions never collide. */
	folds = /* @__PURE__ */ new Map();
	/** Per-session last-seen request route ("provider/model" or bare model).
	*  `request/context` only logs on route CHANGES, so each session carries
	*  its own last-known route for attributing subsequent usage samples. */
	routes = /* @__PURE__ */ new Map();
	started = false;
	/** Live session ids already written (or queued) into the backfill cursor
	*  this boot — one entry per session, not per event. */
	liveMarked = /* @__PURE__ */ new Set();
	/** Coalescing buffer for cursor writes: a burst of first events flushes as
	*  one markLiveSequences call instead of one global rewrite per session.
	*  Value = the first observed seq (-1 sentinel when unknown). */
	liveMarkBuffer = /* @__PURE__ */ new Map();
	liveMarkFlushScheduled = false;
	constructor(ctx, store, options = {}) {
		this.ctx = ctx;
		this.store = store;
		this.options = options;
	}
	/** Extract a stable session id from a callback's session argument. */
	static sessionIdOf(session) {
		const id = session?.id;
		return typeof id === "string" && id !== "" ? id : "(unknown-session)";
	}
	/** Canonical "provider/model" (or bare model) ref from a route shape. */
	static refOf(rc) {
		if (!rc) return void 0;
		if (rc.provider && rc.model) return `${rc.provider}/${rc.model}`;
		return rc.model || void 0;
	}
	/** The session's own route fold, read through the live Session object.
	*  `request/context` only lands in the log on route CHANGES, so a session
	*  that predates this collector (host restart, plugin reload) would never
	*  re-announce its route — the authoritative per-session fold is the only
	*  way to attribute such sessions instead of dropping their usage into
	*  "(unknown)". */
	routeFor(sid) {
		const known = this.routes.get(sid);
		if (known !== void 0) return known;
		const rc = this.ctx.sessions?.get?.(sid)?.requestContext?.();
		const ref = UsageCollector.refOf(rc);
		if (ref !== void 0) this.routes.set(sid, ref);
		return ref;
	}
	foldFor(sessionId) {
		let fold = this.folds.get(sessionId);
		if (!fold) {
			fold = new UsageFold();
			this.folds.set(sessionId, fold);
		}
		return fold;
	}
	/** Write a live session into the durable backfill cursor (coalesced per
	*  tick) together with the seq of its FIRST observed event. This is the
	*  restart-safety invariant, upgraded: `SessionStore.list()` only reports
	*  LIVE sessions, and the first-observed seq partitions the persisted log
	*  into [0, firstSeq) — which no live pass ever folded, so the next boot's
	*  backfill replays exactly that prefix to recover pre-attach history —
	*  and [firstSeq, ∞), which the live path owns. The sentinel -1 records
	*  "observed with an unknown boundary" and replays nothing (never risk a
	*  duplicate). */
	markLiveSession(sessionId, firstSeq) {
		if (sessionId === "(unknown-session)" || this.liveMarked.has(sessionId)) return;
		this.liveMarked.add(sessionId);
		this.liveMarkBuffer.set(sessionId, typeof firstSeq === "number" ? firstSeq : -1);
		if (this.liveMarkFlushScheduled) return;
		this.liveMarkFlushScheduled = true;
		queueMicrotask(() => {
			this.liveMarkFlushScheduled = false;
			const batch = [...this.liveMarkBuffer.entries()];
			this.liveMarkBuffer.clear();
			if (batch.length > 0) {
				this.store.markLiveSequences(batch).catch(() => {
					this.status.recordFailures++;
				});
				this.store.markHoursLiveSequences(batch).catch(() => {
					this.status.recordFailures++;
				});
				const sessionLive = this.store.markSessionsLiveSequences;
				if (typeof sessionLive === "function") this.callStore(() => sessionLive.call(this.store, batch));
			}
		});
	}
	/** Invoke an OPTIONAL store hook under the collector's observational
	*  contract: a missing hook (older/test stores) is a no-op, a rejected
	*  write is counted instead of escaping. */
	callStore(fn) {
		try {
			Promise.resolve(fn()).catch(() => {
				this.status.recordFailures++;
			});
		} catch {
			this.status.recordFailures++;
		}
	}
	/** Record one session's display title through the optional store hook. */
	recordSessionTitle(session, title) {
		if (session === "" || title === "") return;
		const record = this.store.recordSessionTitle;
		if (typeof record !== "function") return;
		this.callStore(() => record.call(this.store, session, title));
	}
	/** Advance the session table's replay cursor, tolerating a store double
	*  that predates the dimension (its absence only widens a later replay). */
	async markSessionsSeenSafely(batch) {
		const store = this.store;
		if (typeof store.markSessionsSeenSessions !== "function") return;
		await store.markSessionsSeenSessions.call(this.store, batch);
	}
	/** Claim the session dimension complete, tolerating a store double that
	*  predates it (the flag then stays off and the upgrade retries). */
	async markSessionsReadySafely() {
		const store = this.store;
		if (typeof store.markSessionsReady !== "function") return;
		await store.markSessionsReady.call(this.store);
	}
	/** Attach the live listeners (call once from apply). */
	start() {
		if (this.started) return;
		this.started = true;
		const ctx = this.ctx;
		if (typeof ctx.on !== "function") ctx.logger?.warn("[dsh-usage-panel-plus] live session-event subscription unavailable (ctx.on missing); only the boot backfill will record usage");
		ctx.on?.("session/event", (session, event) => {
			const sid = UsageCollector.sessionIdOf(session);
			this.markLiveSession(sid, typeof event?.seq === "number" ? event.seq : void 0);
			if (event.type === "session/title") {
				const title = event.data?.title;
				if (typeof title === "string" && title !== "") this.recordSessionTitle(sid, title);
			}
			if (event.type === "request/context") {
				const data = event.data;
				if (data.provider && data.model) this.routes.set(sid, `${data.provider}/${data.model}`);
				else if (data.model) this.routes.set(sid, data.model);
			}
			let fromSource;
			if (event.type === "assistant/message") {
				fromSource = UsageCollector.refOf(event.data.message?.source);
				if (fromSource !== void 0) this.routes.set(sid, fromSource);
			}
			const sample = this.foldFor(sid).fold(event);
			if (!sample) return;
			if (!sample.turn && sample.model === void 0) sample.model = fromSource ?? this.routeFor(sid);
			sample.session = sid;
			if (typeof event.time === "number") sample.at = event.time;
			this.store.record(sample).catch(() => {
				this.status.recordFailures++;
			});
		});
		ctx.on?.("session/disposed", (session) => {
			const sid = UsageCollector.sessionIdOf(session);
			this.folds.delete(sid);
			this.routes.delete(sid);
			this.liveMarked.delete(sid);
		});
		ctx.on?.("llm/stream", (options, next) => this.observeAuxiliaryCall(options, next));
	}
	/**
	* Wrap one `llm/stream` call at the waterfall. Every other call — the whole
	* agent loop, compaction — is returned UNWRAPPED (`next()` untouched), so
	* the hot path pays nothing for this subscription; only a `session-title`
	* call gets an observing wrapper.
	*
	* The wrapper's one rule: record what the call actually reported. Whether
	* the stream settles or is abandoned, `next()` has already been invoked, so
	* the call is one provider call — a timeout or a cancelled session does not
	* make it unobserved.
	*/
	observeAuxiliaryCall(options, next) {
		if (options?.purpose !== "session-title") return next();
		const at = Date.now();
		const day = dayKey(at);
		const hour = hourKey(at);
		const model = UsageCollector.refOf({
			provider: options.provider,
			model: options.model
		});
		return this.recordTitleCall(next(), day, hour, model);
	}
	/**
	* Forward a title generation's stream while observing its usage, then
	* record the settled call as ONE sample carrying both its tokens and the
	* request marker.
	*
	* One sample, not two: the store's marker is orthogonal to its buckets, so
	* a single write states "this call happened and reported these tokens" —
	* the same shape the compaction path stores, and one write instead of two
	* against the same row.
	*/
	async *recordTitleCall(stream, day, hour, model) {
		let usage;
		try {
			for await (const chunk of stream) {
				if (chunk?.type === "usage" && chunk.usage !== void 0) usage = chunk.usage;
				yield chunk;
			}
		} finally {
			this.store.record({
				day,
				hour,
				model,
				inputTokens: usage?.inputTokens ?? 0,
				outputTokens: usage?.outputTokens ?? 0,
				cacheReadTokens: usage?.cacheReadTokens ?? 0,
				cacheWriteTokens: usage?.cacheWriteTokens ?? 0,
				request: true
			}).catch(() => {
				this.status.recordFailures++;
			});
		}
	}
	/** Whether a backfill is in progress or was completed. */
	get running() {
		return this.status.running;
	}
	/** Run the one-time backfill: enumerate persisted sessions and replay each
	*  through its own fold. Idempotent — the cursor partitions every session's
	*  log exactly once across boots and live passes:
	*  - a session NOT in backfilledSessions replays up to its cursor boundary:
	*    FULLY when none is recorded (no live pass ever folded this log), only
	*    the PREFIX [0, boundary) when one is — including a STILL-LIVE session,
	*    whose post-boundary events the live path owns (a /reset watermark uses
	*    the same shape: everything below the wipe-time log length must be
	*    rebuilt from the log because the wipe destroyed it);
	*  - whatever the boundary, a fork-inherited prefix reported by the host
	*    (SessionInspection.inheritedEventCount, DSH >= 0.1.2-rc.1) is skipped:
	*    the child copied those events from its parent, whose own backfill
	*    already counted them;
	*  - a session already in backfilledSessions is NEVER replayed again: it
	*    lands there only after a clean replay of its full replayable range,
	*    so re-selecting it would double that range on every later boot;
	*  - a live session without a usable boundary is skipped (its events are
	*    owned by this boot's live pass — or it resumed mid-scan and our
	*    boundary snapshot is stale; stale absence must never widen a replay).
	*  Resolves early (mid-scan) when `signal` aborts — the fiber teardown
	*  path uses this so disposal does not leave a fire-and-forget scan
	*  writing behind it. */
	async backfill(persistence, sessions, signal) {
		await this.scan(persistence, sessions, signal, "all");
	}
	/** The upgrade pass: replay every session the HOUR cursors have not seen,
	*  writing only the hour rows. The day table and its cursors stay
	*  untouched, so a user who upgraded never loses day history because a
	*  session log was pruned. */
	async backfillHours(persistence, sessions, signal) {
		await this.scan(persistence, sessions, signal, "hours");
	}
	/** The session-dimension upgrade pass: replay every session the session
	*  cursors have not seen, writing only the session table and the session
	*  titles. Same shape as the hour upgrade: the day and hour tables and
	*  their cursors stay untouched. */
	async backfillSessions(persistence, sessions, signal) {
		await this.scan(persistence, sessions, signal, "sessions");
	}
	/** Shared replay engine behind {@link backfill}, {@link backfillHours} and
	*  {@link backfillSessions}. `target` selects the cursor pair, the write
	*  function, and the cursor the completed sessions land in. */
	async scan(persistence, sessions, signal, target) {
		if (this.status.running) return;
		if (signal?.aborted) return;
		this.status.running = true;
		this.status.error = void 0;
		try {
			const headers = (typeof persistence.open === "function" ? await persistence.list(signal === void 0 ? void 0 : { signal }) : await persistence.list(signal)).map((item) => {
				const snap = item;
				if (snap !== null && typeof snap === "object" && "header" in snap && snap.header !== null && typeof snap.header === "object" && typeof snap.header.id === "string") return snap.header;
				return item;
			}).filter((h) => typeof h?.id === "string" && h.id !== "");
			const seen = target === "hours" ? await this.store.hoursSeenSessions() : target === "sessions" ? await this.store.sessionsSeenSessions() : await this.store.seenSessions();
			const dayCursorWasEmpty = target === "all" && seen.size === 0;
			const liveSeq = target === "hours" ? await this.store.hoursLiveSequences() : target === "sessions" ? await this.store.sessionsLiveSequences() : await this.store.liveSequences();
			const targets = headers.filter((h) => !seen.has(h.id));
			this.status.total = targets.length;
			this.status.done = 0;
			const concurrency = this.options.backfillConcurrency ?? 4;
			let next = 0;
			const completed = [];
			const allCoversSessions = target === "all" && dayCursorWasEmpty;
			const writeSample = target === "hours" ? (sample) => this.store.recordHours(sample) : target === "sessions" ? (sample) => this.store.recordSession(sample) : allCoversSessions ? (sample) => this.store.record(sample) : (sample) => this.store.record({
				...sample,
				session: void 0
			});
			const flushCompleted = async () => {
				if (completed.length === 0) return;
				const batch = completed.splice(0, completed.length);
				if (target === "hours") {
					await this.store.markHoursSeenSessions(batch);
					return;
				}
				if (target === "sessions") {
					await this.store.markSessionsSeenSessions(batch);
					return;
				}
				await this.store.markSeenSessions(batch);
				await this.store.markHoursSeenSessions(batch);
				if (allCoversSessions) await this.markSessionsSeenSafely(batch);
			};
			const worker = async () => {
				for (;;) {
					if (signal?.aborted) return;
					const i = next++;
					if (i >= targets.length) return;
					const header = targets[i];
					this.status.lastSessionId = header.id;
					const boundary = liveSeq.get(header.id);
					if (sessions.list().some((s) => s.id === header.id) && (boundary === void 0 || boundary < 0)) {
						this.status.done++;
						continue;
					}
					const fromScratch = boundary === void 0;
					const replayNothing = !fromScratch && boundary < 0;
					const skipLiveOwned = (ev) => {
						if (replayNothing) return true;
						if (fromScratch) return false;
						return typeof ev.seq === "number" && ev.seq >= boundary;
					};
					const fold = new UsageFold();
					let route = "";
					try {
						let sessionEvents;
						let inheritedCut;
						if (typeof persistence.open === "function") {
							const handle = await persistence.open(header.id, "read", signal === void 0 ? void 0 : { signal });
							try {
								const cut = handle.inheritedEventCount;
								inheritedCut = typeof cut === "number" && Number.isSafeInteger(cut) && cut >= 0 ? cut : 0;
								const collected = [];
								let offset = 0;
								const PAGE = 500;
								for (;;) {
									if (signal?.aborted) return;
									const slice = await handle.read(offset, PAGE, signal === void 0 ? void 0 : { signal });
									const page = slice && slice.events ? slice.events : [];
									if (page.length === 0) break;
									for (const ev of page) collected.push(ev);
									offset += page.length;
								}
								sessionEvents = collected;
							} finally {
								await handle.close().catch(() => {});
							}
						} else if (typeof persistence.inspect === "function") {
							const inspection = await persistence.inspect(header.id, signal);
							inheritedCut = inspection.inheritedEventCount ?? 0;
							sessionEvents = inspection.events;
						} else throw new Error("no readable persistence seam (need open or inspect)");
						for (const ev of sessionEvents) {
							if (signal?.aborted) return;
							if (skipLiveOwned(ev)) continue;
							if (inheritedCut > 0 && typeof ev.seq === "number" && ev.seq < inheritedCut) continue;
							if (ev.type === "session/title") {
								const title = ev.data?.title;
								if (typeof title === "string" && title !== "") this.recordSessionTitle(header.id, title);
							}
							if (ev.type === "request/context") {
								const data = ev.data;
								if (data.provider && data.model) route = `${data.provider}/${data.model}`;
								else if (data.model) route = data.model;
							} else if (ev.type === "assistant/message") {
								const ref = UsageCollector.refOf(ev.data.message?.source);
								if (ref !== void 0) route = ref;
							}
							const sample = fold.fold(ev);
							if (sample) {
								if (!sample.turn && sample.model === void 0) sample.model = route || void 0;
								sample.session = header.id;
								if (typeof ev.time === "number") sample.at = ev.time;
								await writeSample(sample);
							}
						}
						completed.push(header.id);
						if (completed.length >= MARK_BATCH) await flushCompleted();
						this.status.scannedSessions++;
					} catch (err) {
						this.status.error = `session ${header.id}: ${err instanceof Error ? err.message : String(err)}`;
					} finally {
						this.status.done++;
					}
				}
			};
			await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, targets.length)) }, worker));
			await flushCompleted();
			if (!signal?.aborted && this.status.error === void 0) {
				if (target === "hours" || dayCursorWasEmpty) await this.store.markHoursReady();
				if (target === "sessions" || dayCursorWasEmpty) await this.markSessionsReadySafely();
			}
		} finally {
			this.status.running = false;
		}
	}
};
//#endregion
//#region src/wire.ts
/** Default cap for a JSON request body. The panel posts tiny objects
*  ({ range, from?, to? }); the cap only bounds a misbehaving trusted
*  client, so 64 KiB is generous. */
const MAX_JSON_BODY_BYTES = 65536;
/** One line of an async-iterable request body read as UTF-8 text. */
async function readJsonBody(req, maxBytes = MAX_JSON_BODY_BYTES) {
	let body = "";
	let bytes = 0;
	for await (const chunk of req) {
		bytes += typeof chunk === "string" ? Buffer.byteLength(chunk) : chunk.byteLength;
		if (bytes > maxBytes) throw new UsageError(413, `request body exceeds ${maxBytes} bytes`);
		body += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
	}
	if (body === "") return void 0;
	try {
		return JSON.parse(body);
	} catch {
		throw new UsageError(400, "invalid json body");
	}
}
/** A user-visible error carrying its HTTP status. */
var UsageError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
	}
};
function writeJson(res, value, status = 200) {
	res.statusCode = status;
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(value));
}
function writeError(res, err) {
	const status = err instanceof UsageError ? err.status : 500;
	writeJson(res, {
		ok: false,
		error: {
			code: "usage_api_error",
			message: err instanceof UsageError ? err.message : "internal error"
		}
	}, status);
}
//#endregion
//#region src/trust-fence.ts
/**
* Whether a WHATWG URL hostname names the loopback authority. The input is
* expected in URL hostname form (IPv6 literals keep their brackets), matching
* dsh-client-connection's loopback classification: localhost, [::1], or any
* IPv4 address in 127/8.
*/
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	const parts = hostname.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** The raw Host header value (lowercased), or null when absent. */
function parseHostHeader(req) {
	const header = req.headers.host;
	const value = Array.isArray(header) ? header[0] : header;
	if (!value) return null;
	return value.trim().toLowerCase();
}
/** Normalized URL of a bare authority (hostname lowercased, default port
*  stripped, IPv6 bracketed), or undefined when unparsable. The scheme decides
*  which default port is stripped, matching the official fence. */
function parseAuthority(authority, scheme = "http:") {
	try {
		return new URL(`${scheme}//${authority}`);
	} catch {
		return;
	}
}
/**
* Canonical form of a parsed trustedHosts entry: `hostname` when no port was
* written, else `hostname:port`. The port is judged from URL parses under
* both special schemes (their default ports differ, so `:80` and `:443`
* still count as explicit), never from the raw string.
*/
function canonicalAuthority(entry, entryUrl) {
	const port = entryUrl.port !== "" ? entryUrl.port : new URL(`https://${entry}`).port;
	return port === "" ? entryUrl.hostname : `${entryUrl.hostname}:${port}`;
}
/**
* Whether the request authority matches a `trustedHosts` entry. An entry with
* an explicit port matches that exact authority; a port-less entry matches
* the hostname on any port (the shape the CLI derives for IP-literal LAN
* serving, where the bound port may be OS-assigned).
*/
function isTrustedAuthority(hostUrl, trustedHosts, protocol) {
	return trustedHosts.some((entry) => {
		const entryUrl = parseAuthority(entry, protocol);
		if (entryUrl === void 0) return false;
		return canonicalAuthority(entry, entryUrl) === entryUrl.hostname ? entryUrl.hostname === hostUrl.hostname : entryUrl.host === hostUrl.host;
	});
}
/** Bind spellings that name every interface. The current host line rejects them
*  when its config loads and only ever hands over a concrete literal, but the
*  pre-0.2.1-alpha.2 line can still carry `0.0.0.0`; "every interface" is not
*  the single authority a browser dials, and that line's own trustedHosts list
*  (the sampled LAN literals) covers its real reachability instead. */
const WILDCARD_BIND_ADDRESSES = /* @__PURE__ */ new Set([
	"0.0.0.0",
	"::",
	"::ffff:0.0.0.0"
]);
/**
* Whether the request authority names the listener's own bind address. A browser
* dialing that literal sends it as Host, the literal is no rebinding target, and
* accepting it grants nothing further: the Origin and cross-site checks still
* apply, and it stays outside `trustedHosts`. Matching ignores the port, like a
* port-less entry, and any `%zone` id (an interface selector, not address text).
*/
function isBindAddressAuthority(hostUrl, bindHost) {
	if (bindHost === void 0) return false;
	const zoneAt = bindHost.indexOf("%");
	const address = (zoneAt === -1 ? bindHost : bindHost.slice(0, zoneAt)).toLowerCase();
	if (WILDCARD_BIND_ADDRESSES.has(address)) return false;
	const bindUrl = parseAuthority(address.includes(":") ? `[${address}]` : address);
	return bindUrl !== void 0 && bindUrl.hostname === hostUrl.hostname;
}
/**
* Compare Host under the Origin's HTTP(S) scheme so default ports normalize
* consistently. The transport may remain HTTP behind an HTTPS proxy.
* @param origin - verbatim Origin header value.
* @param host - verbatim Host header value already accepted by the Host fence.
* @returns true only when the Origin is this listener's own `http(s)` authority.
*/
function isSameAuthorityOrigin(origin, host) {
	let originUrl;
	try {
		originUrl = new URL(origin);
	} catch {
		return false;
	}
	const scheme = originUrl.protocol === "https:" ? "https:" : originUrl.protocol === "http:" ? "http:" : void 0;
	if (scheme === void 0) return false;
	const hostUrl = parseAuthority(host, scheme);
	return hostUrl !== void 0 && originUrl.host === hostUrl.host;
}
function createTrustFence(trust) {
	return { isTrusted(req) {
		const { trustedHosts, bindHost, protocol = "http:" } = trust();
		const host = parseHostHeader(req);
		if (host === null) return false;
		const hostUrl = parseAuthority(host, protocol);
		if (hostUrl === void 0) return false;
		if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts, protocol) && !isBindAddressAuthority(hostUrl, bindHost)) return false;
		const site = req.headers["sec-fetch-site"];
		if ((Array.isArray(site) ? site[0] : site) === "cross-site") return false;
		const origin = req.headers.origin;
		const originValue = Array.isArray(origin) ? origin[0] : origin;
		if (originValue === void 0) return true;
		return isSameAuthorityOrigin(originValue, host);
	} };
}
//#endregion
//#region src/routes.ts
/** Parse a strict `YYYY-MM-DD` calendar date (rejects rolled-over shapes
*  like "2026-13-45" that a regex alone would pass). */
function parseDayKey(value) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (match === null) return null;
	const y = Number(match[1]);
	const m = Number(match[2]);
	const d = Number(match[3]);
	const dt = new Date(y, m - 1, d);
	return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? {
		y,
		m,
		d
	} : null;
}
/** Longest custom span accepted (one leap year) — bounds the daily series
*  size and the response body against a misbehaving trusted client. */
const MAX_CUSTOM_SPAN_DAYS = 366;
/** Resolve a request's [from, to] into inclusive local day keys.
*
*  `range: 'all'` is the one preset whose start is NOT computed from today: the
*  window runs from the earliest day the store holds up to today, so the
*  caller must supply that first day (read through {@link UsageStore.firstDay}).
*  When the store is empty the window collapses onto today, which renders the
*  panel's empty state instead of a year-long blank chart. */
function resolveRange(req, now = /* @__PURE__ */ new Date(), firstDay = null) {
	const day = (d) => {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	};
	const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0);
	switch (req.range) {
		case "today": return {
			from: day(toDate),
			to: day(toDate)
		};
		case "all": {
			const today = day(toDate);
			return {
				from: firstDay !== null && firstDay !== "" && firstDay <= today ? firstDay : today,
				to: today
			};
		}
		case "3": {
			const from = new Date(toDate);
			from.setDate(from.getDate() - 2);
			return {
				from: day(from),
				to: day(toDate)
			};
		}
		case "7":
		case "14":
		case "30":
		case "90": {
			const n = Number(req.range);
			const from = new Date(toDate);
			from.setDate(from.getDate() - (n - 1));
			return {
				from: day(from),
				to: day(toDate)
			};
		}
		case "custom": {
			if (!req.from || !req.to) throw new UsageError(400, "usage stats: custom range needs valid from/to dates (YYYY-MM-DD)");
			const from = parseDayKey(req.from);
			const to = parseDayKey(req.to);
			if (from === null || to === null) throw new UsageError(400, "usage stats: custom range needs valid from/to dates (YYYY-MM-DD)");
			if (req.to < req.from) throw new UsageError(400, "usage stats: custom to must be >= from");
			if ((Date.UTC(to.y, to.m - 1, to.d) - Date.UTC(from.y, from.m - 1, from.d)) / 864e5 + 1 > MAX_CUSTOM_SPAN_DAYS) throw new UsageError(400, `usage stats: custom range spans more than ${MAX_CUSTOM_SPAN_DAYS} days`);
			return {
				from: req.from,
				to: req.to
			};
		}
		default: {
			const from = new Date(toDate);
			from.setDate(from.getDate() - 6);
			return {
				from: day(from),
				to: day(toDate)
			};
		}
	}
}
/** The trend granularity a range preset asks for: the two short presets read
*  per hour, everything else (including custom) per day. */
function granularityOf(range) {
	return range === "today" || range === "3" ? "hour" : "day";
}
/** Turn the model-keyed rows of the selected granularity into the shared
*  sample stream. The per-row request and turn counts are yielded lazily as
*  markers, so no intermediate array is materialized regardless of range
*  size. */
function* samplesOfRows(rows) {
	for (const row of rows) {
		const hour = "hour" in row ? row.hour : void 0;
		const day = hour === void 0 ? row.day : hour.slice(0, 10);
		if (row.inputTokens + row.outputTokens + row.cacheReadTokens + row.cacheWriteTokens > 0) yield {
			day,
			hour,
			model: row.model,
			inputTokens: row.inputTokens,
			outputTokens: row.outputTokens,
			cacheReadTokens: row.cacheReadTokens,
			cacheWriteTokens: row.cacheWriteTokens
		};
		for (let i = 0; i < row.requests; i++) yield {
			day,
			hour,
			model: row.model,
			inputTokens: 0,
			outputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0,
			request: true
		};
		for (let i = 0; i < row.turns; i++) yield {
			day,
			hour,
			inputTokens: 0,
			outputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0,
			turn: true
		};
	}
}
/** Build the aggregate for a range from the store rows: the model-keyed
*  bucket aggregate composed with the session dimension and the comparison
*  window. Session rows are keyed by DAY, so the session split is always the
*  [from, to] calendar window even when the trend is per hour. */
async function aggregateRange(store, from, to, granularity = "day") {
	const base = aggregateSamples(samplesOfRows(granularity === "hour" ? await store.rangeHourRows(from, to) : await store.rangeRows(from, to)), {
		from,
		to
	}, granularity);
	const titles = await store.sessionTitles();
	const sessionAgg = aggregateSessionRows(await store.rangeSessionRows(from, to), titles, {
		from,
		to
	});
	const spanDays = daysInRange(from, to).length;
	const prevTo = shiftDayKey(from, -1);
	const prevFrom = shiftDayKey(prevTo, -(Math.max(1, spanDays) - 1));
	const prevBase = aggregateSamples(samplesOfRows(await store.rangeRows(prevFrom, prevTo)), {
		from: prevFrom,
		to: prevTo
	}, "day");
	const prevSessionAgg = aggregateSessionRows(await store.rangeSessionRows(prevFrom, prevTo), /* @__PURE__ */ new Map(), {
		from: prevFrom,
		to: prevTo
	});
	const previous = {
		tokens: prevBase.tokens,
		requests: prevBase.requests,
		turns: prevBase.turns,
		sessions: prevSessionAgg.sessionCount,
		activeDays: prevBase.activeDays,
		cacheHit: prevBase.cacheHit,
		cacheMiss: prevBase.cacheMiss
	};
	return {
		...base,
		sessionCount: sessionAgg.sessionCount,
		sessions: sessionAgg.sessions.slice(0, 200),
		unknownRequests: sessionAgg.unknownRequests,
		previous
	};
}
/** Build the single fenced prefix route serving the /usage-panel-plus/api JSON RPC.
*  The host mounts it via `ctx.webServer.register` (which takes ONE WebRoute,
*  not an array — matching the real dsh-host-webserver contract). */
function buildUsageRoute(ctx, deps) {
	const fence = createTrustFence(deps.trust);
	const handler = async (req, res) => {
		if (!fence.isTrusted(req)) {
			writeJson(res, {
				ok: false,
				error: {
					code: "forbidden",
					message: "untrusted host"
				}
			}, 403);
			return;
		}
		const path = (req.url ?? "").split(/[?#]/, 1)[0];
		const method = req.method ?? "GET";
		try {
			if (method === "POST" && path === "/usage-panel-plus/api/range") {
				const body = await readJsonBody(req);
				const firstDay = body.range === "all" ? await deps.store.firstDay() : null;
				const { from, to } = resolveRange(body, /* @__PURE__ */ new Date(), firstDay);
				writeJson(res, {
					ok: true,
					value: await aggregateRange(deps.store, from, to, granularityOf(body.range))
				});
				return;
			}
			if (method === "POST" && path === "/usage-panel-plus/api/status") {
				writeJson(res, {
					ok: true,
					value: deps.collector.status
				});
				return;
			}
			if (method === "POST" && path === "/usage-panel-plus/api/reset") {
				if (deps.collector.running && !deps.isRebuilding()) throw new UsageError(409, "usage stats: backfill already running");
				await deps.resetAndRescan();
				writeJson(res, {
					ok: true,
					value: deps.collector.status
				});
				return;
			}
			writeJson(res, {
				ok: false,
				error: {
					code: "not_found",
					message: `unknown endpoint ${path}`
				}
			}, 404);
		} catch (err) {
			const logger = ctx.logger;
			if (!(err instanceof UsageError)) logger?.warn(err instanceof Error ? err : new Error(String(err)));
			writeError(res, err);
		}
	};
	return {
		kind: "prefix",
		path: "/usage-panel-plus/api",
		handler
	};
}
//#endregion
//#region src/index.ts
const name = "dsh-usage-panel-plus";
/** Services required before mounting: the webserver routes, the session
*  persistence + live store (backfill + live events), and the storage domain
*  hub (durable rows). */
const inject = [
	"webServer",
	"sessionPersistence",
	"sessions",
	"storageDomain"
];
/**
* The store is a PROCESS-level singleton, keyed on globalThis.
*
* Why: `storageDomain.open()` allows each domain name to be opened exactly
* once per process and offers no close. A hot reload (fiber dispose +
* re-import + fresh `apply()`) therefore constructs a NEW UsageStore whose
* open('usage_panel_plus') hits "DomainError: domain 'usage_panel_plus' is already
* open" — which surfaces as a FATAL host load failure and takes the whole
* backend down (observed twice, 2026-08-22). The module cache is cleared by
* every reload, so module-level state cannot carry the instance across; the
* host's globalThis can. Reusing one store across fibers is safe: the domain
* handle stays valid for the process lifetime, the collector (whose listeners
* ride ctx.effect disposers) is per-fiber, and every other resource this
* plugin mounts is effect-managed.
*/
const STORE_KEY = "__dshUsagePanelPlusStore";
/** Reset the process-level store cache (test seam only). */
function _resetSharedStoreForTests() {
	delete globalThis[STORE_KEY];
}
function sharedStore(storageDomain) {
	const g = globalThis;
	const existing = g[STORE_KEY];
	if (existing) return existing;
	const created = new UsageStore(storageDomain, { importLegacy: process.env.VITEST === void 0 });
	g[STORE_KEY] = created;
	return created;
}
function apply(ctx, config = {}) {
	const store = sharedStore(ctx.storageDomain);
	const collector = new UsageCollector(ctx, store, {
		source: config.source,
		backfillConcurrency: config.backfillConcurrency
	});
	const trust = () => {
		const runtime = ctx.get("webRuntime");
		const startup = ctx.get("webStartup");
		return {
			trustedHosts: runtime?.trustedHosts ?? startup?.trustedHosts ?? [],
			bindHost: ctx.webServer.host,
			protocol: ctx.webServer.protocol ?? "http:"
		};
	};
	let scanController = null;
	const rescan = async () => {
		scanController?.abort();
		const controller = new AbortController();
		scanController = controller;
		await store.readyPromise();
		await collector.backfill(ctx.sessionPersistence, ctx.sessions, controller.signal);
	};
	let resetInFlight = null;
	const isRebuilding = () => resetInFlight !== null;
	const resetAndRescan = () => {
		if (resetInFlight) return resetInFlight;
		resetInFlight = (async () => {
			const previous = await store.liveSequences();
			const boundaries = /* @__PURE__ */ new Map();
			for (const handle of ctx.sessions.list()) {
				const seq = handle.seq;
				if (typeof seq === "number" && Number.isFinite(seq) && seq >= 0) {
					boundaries.set(handle.id, seq);
					continue;
				}
				const old = previous.get(handle.id);
				boundaries.set(handle.id, typeof old === "number" ? old : -1);
			}
			await store.reset(boundaries);
			await rescan();
		})().finally(() => {
			resetInFlight = null;
		});
		return resetInFlight;
	};
	ctx.effect(() => {
		const route = buildUsageRoute(ctx, {
			store,
			collector,
			trust,
			isRebuilding,
			resetAndRescan
		});
		return ctx.webServer.register(route);
	}, "dsh-usage-panel-plus: routes");
	const ensureHourHistory = async () => {
		await store.readyPromise();
		if (await store.hoursReady()) return;
		if (!await store.hasAnyDayRows()) return;
		if (collector.status.error !== void 0) return;
		const previous = await store.hoursLiveSequences();
		const boundaries = /* @__PURE__ */ new Map();
		for (const handle of ctx.sessions.list()) {
			const seq = handle.seq;
			if (typeof seq === "number" && Number.isFinite(seq) && seq >= 0) {
				boundaries.set(handle.id, seq);
				continue;
			}
			const old = previous.get(handle.id);
			boundaries.set(handle.id, typeof old === "number" ? old : -1);
		}
		await store.markHoursLiveSequences(boundaries);
		scanController?.abort();
		const controller = new AbortController();
		scanController = controller;
		await collector.backfillHours(ctx.sessionPersistence, ctx.sessions, controller.signal);
	};
	const ensureSessionHistory = async () => {
		await store.readyPromise();
		if (!await store.hasAnyDayRows()) return;
		if (collector.status.error !== void 0) return;
		const coverage = await store.sessionsCoverage();
		if (coverage >= 2 && await store.sessionsReady()) return;
		if (coverage < 2) await store.resetSessionsForRebuild();
		const previous = await store.sessionsLiveSequences();
		const boundaries = /* @__PURE__ */ new Map();
		for (const handle of ctx.sessions.list()) {
			const seq = handle.seq;
			if (typeof seq === "number" && Number.isFinite(seq) && seq >= 0) {
				boundaries.set(handle.id, seq);
				continue;
			}
			const old = previous.get(handle.id);
			boundaries.set(handle.id, typeof old === "number" ? old : -1);
		}
		await store.markSessionsLiveSequences(boundaries);
		scanController?.abort();
		const controller = new AbortController();
		scanController = controller;
		await collector.backfillSessions(ctx.sessionPersistence, ctx.sessions, controller.signal);
	};
	ctx.effect(() => {
		collector.start();
		(async () => {
			await rescan();
			await ensureHourHistory();
			await ensureSessionHistory();
		})();
		return () => {
			scanController?.abort();
		};
	}, "dsh-usage-panel-plus: collector");
}
//#endregion
export { _resetSharedStoreForTests, apply, inject, name };
