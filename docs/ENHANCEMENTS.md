# Enhancements over upstream v0.3.4

This document describes what this repository changes relative to
[upstream `dsh-usage-statistics-panel@0.3.4`](https://github.com/HaoyueQin/dsh-usage-statistics-panel).
See [NOTICE.md](../NOTICE.md) for the fork and licensing statement.

All changes are covered by the test suite (`433 tests / 37 files`) and were
verified against a live DSH instance. A full quality-assurance report is in
[QA.md](QA.md) (that report predates the standalone rebrand, so its identifiers
refer to the upstream names).

## Standalone identity (new in 0.1.0)

Before 0.1.0 this tree shipped under the upstream package name and version.
For the standalone release every runtime identifier was renamed so the plugin
can coexist with upstream without a route or storage collision:

| | standalone 0.1.0 | upstream 0.3.4 |
|---|---|---|
| npm name | `dsh-usage-panel-plus` | `dsh-usage-statistics-panel` |
| version | `0.1.0` (first release of this project) | `0.3.4` |
| plugin / bundle id | `dsh-external/dsh-usage-panel-plus` | `dsh-external/dsh-usage-statistics-panel` |
| cordis fiber id | `usage-panel-plus` | `usage-stats` |
| web route prefix | `/usage-panel-plus/api` | `/usage/api` |
| storage domain / file | `usage_panel_plus` / `usage_panel_plus.json` | `usage_history` / `usage_history.json` |
| locale namespace | `usagePanelPlus` | `usageStats` |
| main panel id | `usage-panel-plus` | `usage-stats` |
| localStorage / CSS keys | `dsh-usage-panel-plus:*`, `data-dsh-usage-panel-plus-glass` | upstream-prefixed |

Because the storage domain is distinct, the standalone plugin builds its own
history from the local session logs on first enable; it does not read or
overwrite the upstream panel's data.

## Data model and host half

- **`sessions` and `session_meta` storage tables.** Every usage sample carries
  its session id and event time; titles are captured from `session/title`
  events. This adds a per-conversation dimension without touching the existing
  `days` / `hours` aggregates.
- **Independent cursors.** The session dimension has its own
  `sessionsBackfilledSessions` / `sessionsLiveFirstSeq` / `sessionsReady` / 
  `sessionsCoverage` cursor set, so an upgrade rescan cannot be skipped by an
  older day/hour cursor. Adding a table needs no storage-domain version bump;
  new global fields are optional.
- **Coverage version + self-healing rebuild.** `SESSION_COVERAGE_VERSION = 2`.
  A store written by older coverage rules is detected at boot and rebuilt via
  `resetSessionsForRebuild()` (session rows and cursors cleared, titles and
  day/hour history preserved), then replayed from the session logs.
- **`firstSeen` is the row's earliest sample** (not the last one), and
  **`unknownRequests` is session-scoped** so it matches the section that
  discloses it.
- **Per-model cache accounting.** `ModelTokenUsage` gains optional
  `cacheHit` / `cacheMiss`, folded per model in `aggregateSamples()`.

## API (`POST /usage-panel-plus/api/range`)

The response extends the upstream aggregate with:

| Field | Meaning |
|---|---|
| `sessionCount` | Exact number of distinct conversations with usage in the range |
| `sessions[]` | Ranked per-conversation rows with per-model split, hit/miss, first/last seen |
| `unknownRequests` | Requests that could not be attributed to a model |
| `previous` | Equal-length window immediately before `from`, for period-over-period badges |

`aggregateSamples()` keeps its original field set (`UsageStatsAggregate`);
session aggregation is a separate pure function `aggregateSessionRows()`, so
upstream day/hour behavior is unchanged.

## Range presets

`today`, `3`, `7`, `14`, `30`, `90`, **`all`**, and `custom`.

`all` starts at the earliest day present in the store (read via
`UsageStore.firstDay()`), not at a fixed offset from today. On an empty store
it collapses onto today. Custom ranges are validated for calendar validity,
ordering, and a 366-day cap.

## Client

- **Summary cards**: the "Sessions" card now shows the real session count
  (upstream showed completed turns), with the turn total as its subtitle.
  Period-over-period badges use arrows plus a percentage; when there is no
  previous window the badge renders nothing rather than prose.
- **Session usage section** at the bottom of the panel (the deepest
  drill-down: range → conversation → models inside it). Fixed-height internal
  scroller, per-row cache hit rate, expandable model breakdown, and a sticky
  disclosure when the host returns fewer rows than the exact count.
- **Model and provider sections**: no "Other" bucket — every model and every
  provider gets its own ranked row and its own ring segment. Palette hues wrap
  past the tenth (models) / fifth (provider) rank. Both lists scroll inside a
  capped viewport. Rows show their own cache hit rate as a compact
  glyph + percentage.
- **Toolbar**: compact range chips (`3d`, `7d`, … `All`), CSV export
  (summary / day / model / provider / session scopes, UTF-8 BOM + CRLF),
  60-second auto refresh that pauses while the page is hidden, two-press
  rebuild with Escape/blur/timer disarm.
- **Charts**: hit-rate curve, activity heatmap, stacked daily trend, and two
  donut rings remain hand-drawn SVG. A shared `--usage-*` scale in
  `src/client/UsageStatsPanel.module.css` keeps frame radii, row geometry,
  type tiers and ink consistent across every section.
- **Tooltips** are compact fixed-position portals with clamped placement and
  flip-above behavior.
- **Performance**: `tsdown` resolves dependencies via `module` before `main`,
  so lucide-react tree-shakes from ~1500 icons to the nine actually imported
  (`client.js` 750 KB → ~207 KB). `colorForModel` uses a memoized Map, heavy
  sections mount lazily via `IntersectionObserver`, and range reads have a
  20-second TTL cache (explicit refresh / auto refresh / rebuild bypass it).

## Known design boundaries (not bugs)

1. **A session that is live at boot is skipped by the rescan** when no reliable
   seq boundary exists. It is deliberately **not** marked seen, so the next
   restart replays it from scratch and the gap self-heals.
2. **The session dimension only covers conversations whose logs still exist.**
   `sessionCount` is therefore systematically lower than the true historical
   session count. Tokens from deleted sessions still count in day/hour totals
   but cannot be attributed to a conversation. The UI discloses this.
3. **The trend chart caps its visible window at 180 days.** Beyond that the
   chart shows the latest 180 days with an explicit note, while the cards and
   lists still cover the full selected range.

## Verification

- `pnpm install --frozen-lockfile` (with `unrun` pinned as a devDependency;
  `prepare` was removed so an install does not trigger a build on Node 20)
- `pnpm typecheck` → 0 errors (`strict` + `noUncheckedIndexedAccess`)
- `pnpm test` → 433 tests / 37 files
- Build reproduces `lib/index.js`, `lib/client.js`, `lib/client-registry.js`
- Live API probes across all presets; independent store-vs-API reconciliation
  reports zero difference on totals, models, and daily buckets
- `served-bundle-check` proves the GUI serves the built client bundle

See [QA.md](QA.md) for the full report, including two open low/medium issues.
