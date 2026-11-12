/**
 * UsageStatsPanel renders the "usage statistics" panel. One component mounts
 * in two places — the Plugins page's own page for this bundle and the panel's
 * standalone main panel — so it reads the aggregate from the host (via the
 * fenced /usage-panel-plus/api route) and draws every chart by hand in SVG — a
 * GitHub-style activity heatmap, a stacked per-day token trend with a cache
 * hit-rate curve, and two ranked sections (models and providers) that each
 * pair a ring with a detail list.
 * No chart library; colours come from a fixed two-series palette
 * (--dsw-chart-1..10 + the gray --dsw-chart-other for models,
 * --dsw-provider-1..5 + the gray --dsw-provider-other for providers, the
 * reasonix usage-stats palette with a lifted dark variant, defined in this
 * plugin's module css).
 *
 * The panel follows the DSH client conventions: component styles are a CSS
 * Module (hashed class map imported as `css`), interactive atoms use the
 * ui-primitives Button/Input, and every visual value rides the --dsw-alias-*
 * semantic tokens. The functionality replicates the reasonix usage stats
 * feature; the implementation is DSH-native.
 */
import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import clsx from 'clsx'
import { Activity, CalendarDays, ChevronDown, ChevronRight, Coins, Cpu, Database, MessageSquare, MessagesSquare } from 'lucide-react'
import { Button, Input, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DailyTokenUsage, ModelTokenUsage, ProviderTokenUsage, UsageStatsRange, UsageStatsRequest } from '../wire.ts'
import { fetchRange, fetchRangeCached, rebuildStats, UsageApiError } from './api.ts'
import { CSV_BOM, CSV_MIME, buildCsv, csvFileName } from './csv.ts'
import { ChartTip } from './ChartTip.tsx'
import { Deferred } from './Deferred.tsx'
import { Donut, useDonutSize, type DonutSegment } from './Donut.tsx'
import { formatTokens, formatCompact, formatPercent, cacheRate, cacheRateText, clockTime, compareChange, compareSessions, daysBetween, localDay, indexOfDay, bucketAxisLabel, bucketTitle, providerOf, modelNameOf, smoothPath, niceTicks, type CompareChange } from './format.ts'
import type { UsageStatsKey } from './locales.ts'
import type { UsageStatsTranslator } from './index.tsx'
import { SessionUsage } from './SessionUsage.tsx'
import { statsLineState } from './stats-line-state.ts'
import css from './UsageStatsPanel.module.css'

type Translator = UsageStatsTranslator

/** The range chips, in ascending order of span. `all` sits last: it is the
 *  widest window and the only one whose length depends on the store's own
 *  earliest day rather than on today. */
const RANGE_PRESETS = ['today', '3', '7', '14', '30', '90', 'all'] as const

/** How long the rebuild button stays armed without a second press. */
const REBUILD_ARM_MS = 5000

/** The auto-refresh cadence. One minute is the interval the host's own stats
 *  surfaces use and the slowest rate at which a live session's numbers still
 *  feel current. */
const AUTO_REFRESH_MS = 60_000

/** Where the auto-refresh preference lives. A panel preference, not a profile
 *  setting: it belongs to this reader's browser, and it must survive the panel
 *  unmounting on every navigation. */
const AUTO_REFRESH_PREF_KEY = 'dsh-usage-panel-plus:autoRefresh'

/** Read the persisted auto-refresh switch. Private-mode browsers throw on the
 *  storage access itself, and the visual-off default is the safe answer there. */
function readAutoRefreshPref(): boolean {
  try {
    return window.localStorage.getItem(AUTO_REFRESH_PREF_KEY) === '1'
  } catch {
    return false
  }
}

/** Persist the auto-refresh switch; a failed write only costs the preference. */
function writeAutoRefreshPref(on: boolean): void {
  try {
    window.localStorage.setItem(AUTO_REFRESH_PREF_KEY, on ? '1' : '0')
  } catch {
    // Storage disabled: the switch still works for this mount.
  }
}

/** The exact session count. The field is absent on a host that predates the
 *  session dimension (and in fixtures written against that wire), so a missing
 *  value reads as zero rather than rendering "undefined" in a card. */
function sessionCountOf(stats: UsageStatsRange): number {
  return typeof stats.sessionCount === 'number' && Number.isFinite(stats.sessionCount) ? stats.sessionCount : 0
}

// The heatmap's DATA WINDOW: one year, fixed regardless of the range preset.
// It is the window, not the number of weeks drawn — the render trims columns
// to the container's width (see heatGeometry), so a narrow pane shows fewer
// weeks without re-fetching. Sized to the Plugins page's 960px content column,
// where 52 weeks land at roughly 15px cells: the density this chart is meant
// to read at.
export const HEAT_WEEKS = 52

/** The trend chart caps its visible window at 180 days (mirrors reasonix). */
const TREND_MAX_DAYS = 180

/** EVERY model keeps its own row and its own rank colour — there is no "Other"
 *  bucket. An earlier revision folded everything past the top ten into one gray
 *  step; the list scrolls now, so the fold only ever hid rows behind an extra
 *  click and made the ring disagree with the list beside it. The chart palette
 *  still has ten hues, so ranks past ten wrap around it (see
 *  {@link chartSlot}). */
const OTHER_MODEL = '\u0000other' // sentinel kept for the wire's "(unknown)" rows
const OTHER_COLOR = 'var(--dsw-chart-other)'
/** How many distinct hues the chart palette defines. */
const CHART_HUES = 10

/** Number of provider hues in the provider palette. */
const PROVIDER_HUES = 5
const OTHER_PROVIDER = '\u0000pother' // sentinel kept for request-only providers
const OTHER_PROVIDER_COLOR = 'var(--dsw-provider-other)'

/** Rank → palette slot. Ranks past the palette's end WRAP instead of all
 *  collapsing onto the last hue: with no Other bucket, rank 11 still needs a
 *  colour of its own, and a wrapped hue repeats a neighbour rather than making
 *  every tail row identical. */
function chartSlot(rank: number, hues: number): number {
  return (rank % hues) + 1
}

/** Shared empty key set: one stable identity for a collapsed expand state. */
const NO_KEYS: ReadonlySet<string> = new Set()

/** Grouped daily rows: every model keeps its own bucket. `otherByModel` is kept
 *  in the shape (always empty now) because the trend tip and the legend read it. */
type GroupedDaily = DailyTokenUsage & { otherByModel: Record<string, number> }
type GroupedModel = ModelTokenUsage
/** One provider row: its own volume plus every model it served, so the hover
 *  tip and the expandable detail list show the breakdown behind the number.
 *  There is no Other bucket to fold further providers into — every provider the
 *  range touched is its own row. */
type GroupedProvider = ProviderTokenUsage & {
  models: ModelTokenUsage[]
}

export function UsageStatsPanel({ t }: { t: Translator }): JSX.Element {
  const [range, setRange] = useState<string>('30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  // The rebuild action is destructive (it clears the store and replays the
  // logs), so it takes two presses: the first arms the button, the second
  // runs. Arming cancels itself on blur, on Escape, and on a short timer, so
  // a primed destructive control can never be left behind on the toolbar.
  const [rebuildArmed, setRebuildArmed] = useState(false)
  const [rebuilding, setRebuilding] = useState(false)
  const rebuildTimer = useRef<number | null>(null)
  const [stats, setStats] = useState<UsageStatsRange | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // When the aggregate on screen was read. The foot prints it as HH:MM:SS so
  // an auto-refreshing panel shows that it is in fact refreshing.
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  // Auto refresh: opt-in, remembered in localStorage, default off.
  const [autoRefresh, setAutoRefresh] = useState<boolean>(readAutoRefreshPref)
  const generationRef = useRef(0)
  // The panel bounds the chart tooltips: a tip must never leave the panel
  // even when the hovered cell sits near its edge.
  const panelRef = useRef<HTMLDivElement>(null)

  // Heatmap window: the last HEAT_WEEKS*7 days, fixed regardless of `range`.
  const heatWindow = useMemo(() => {
    const to = localDay(0)
    const from = localDay(-(HEAT_WEEKS * 7 - 1))
    return { from, to }
  }, [])
  const [heatDaily, setHeatDaily] = useState<DailyTokenUsage[]>([])
  const heatGenRef = useRef(0)
  // The calendar day the year window was last read on. The window itself is
  // fixed for the panel's lifetime (52 weeks), so re-reading it on every range
  // switch only re-asks the host for the same aggregation; one read per day is
  // the cache. An explicit refresh or a rebuild still re-reads (noCache).
  const heatLoadedDayRef = useRef<string | null>(null)

  const loadHeat = useCallback(async (options?: { noCache?: boolean }) => {
    const today = localDay(0)
    if (options?.noCache !== true && heatLoadedDayRef.current === today) return
    const generation = ++heatGenRef.current
    try {
      // Deliberately NOT `fetchRangeCached`: the panel-level day cache above
      // already dedupes this read, while the shared TTL cache would let a
      // freshly mounted panel read a stale year window without ever asking the
      // host — the opposite of what a fixed-window chart wants.
      const res = await fetchRange({ range: 'custom', from: heatWindow.from, to: heatWindow.to })
      if (heatGenRef.current !== generation) return
      setHeatDaily(res.daily)
      heatLoadedDayRef.current = today
    } catch (e) {
      // The heatmap is auxiliary and must never block the panel, but it must
      // not fail silently either: its window is fixed, so the first request
      // that dies (a backend still booting, an auth race on mount) used to
      // leave the grid at level-0 for the rest of the session. Log the
      // failure; the next panel load retries the window.
      console.error('[dsh-usage-panel-plus] heatmap window request failed', e)
    }
  }, [heatWindow.from, heatWindow.to])

  const load = useCallback(async (options?: { noCache?: boolean }) => {
    if (range === 'custom' && (!customFrom || !customTo)) return
    const req: UsageStatsRequest =
      range === 'custom'
        ? { range, from: customFrom, to: customTo }
        : { range }
    const generation = ++generationRef.current
    setLoading(true)
    setError('')
    // One trigger chain for both surfaces, started in PARALLEL: the heatmap
    // window does not follow `range`, and serializing two round-trips behind
    // one another was half of the panel's first-paint cost. Binding the window
    // read to this chain (rather than the mount effect alone) is also what
    // keeps a single failed window request from blanking the grid until the
    // user presses refresh: every other section heals on the next range switch.
    void loadHeat({ noCache: options?.noCache })
    try {
      // The explicit paths (refresh button, auto-refresh tick, post-rebuild
      // reload) must read the store as it is right now, so they bypass the
      // short TTL cache; an implicit read (mount, range switch) may reuse it.
      const res = await fetchRangeCached(req, { noCache: options?.noCache })
      if (generationRef.current !== generation) return // stale response
      setStats(res)
      setUpdatedAt(new Date())
    } catch (e) {
      if (generationRef.current !== generation) return
      setError(e instanceof UsageApiError ? e.message : String(e))
    } finally {
      if (generationRef.current === generation) setLoading(false)
    }
  }, [range, customFrom, customTo, loadHeat])

  useEffect(() => {
    void load()
  }, [load])

  // Auto refresh: a plain 60s tick that stays OFF while the page is hidden.
  // A background tab has nobody reading it, and a tick there would only burn
  // CPU and network for numbers the reader will re-request anyway; the first
  // visible tick after the reader returns catches up.
  useEffect(() => {
    if (!autoRefresh) return
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      void load({ noCache: true })
    }, AUTO_REFRESH_MS)
    return () => { window.clearInterval(timer) }
  }, [autoRefresh, load])

  const toggleAutoRefresh = useCallback((next: boolean) => {
    setAutoRefresh(next)
    writeAutoRefreshPref(next)
  }, [])

  // Export the range on screen as one CSV: every section plus the session
  // drill-down, in a single table (see ./csv.ts). A download is a browser
  // facility, not a network call: Blob + a detached anchor with the download
  // attribute, which works in both the Electron shell and a plain tab.
  const exportCsv = useCallback(() => {
    if (stats === null) return
    try {
      // The BOM must be the first thing in the blob, not in buildCsv's text:
      // the builder stays a pure, byte-exact contract for tests and callers.
      const blob = new Blob([CSV_BOM + buildCsv(stats)], { type: CSV_MIME })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = csvFileName(stats)
      // Detached anchors do not fire click() in every engine; appending to the
      // body for the duration of the click keeps it universal.
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Revoking synchronously can cancel the download in some engines; one
      // tick is enough for the navigation to have started.
      window.setTimeout(() => { URL.revokeObjectURL(url) }, 0)
    } catch (e) {
      console.error('[dsh-usage-panel-plus] csv export failed', e)
      setError(`${t('exportFailed')}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [stats, t])

  // The armed rebuild (see the state note above): arm on the first press,
  // run on the second, and disarm from blur, Escape, the timer, or unmount.
  const disarmRebuild = useCallback(() => {
    if (rebuildTimer.current !== null) {
      window.clearTimeout(rebuildTimer.current)
      rebuildTimer.current = null
    }
    setRebuildArmed(false)
  }, [])

  const armRebuild = useCallback(() => {
    disarmRebuild()
    setRebuildArmed(true)
    rebuildTimer.current = window.setTimeout(() => {
      rebuildTimer.current = null
      setRebuildArmed(false)
    }, REBUILD_ARM_MS)
  }, [disarmRebuild])

  const runRebuild = useCallback(async () => {
    disarmRebuild()
    setRebuilding(true)
    setError('')
    try {
      await rebuildStats()
      // The host wiped the rows and replayed the logs, so both surfaces the
      // panel draws have to be read again, and the read must not be served
      // from the client's TTL cache.
      await load({ noCache: true })
    } catch (e) {
      setError(e instanceof UsageApiError ? e.message : String(e))
    } finally {
      setRebuilding(false)
    }
  }, [disarmRebuild, load])

  useEffect(() => disarmRebuild, [disarmRebuild])

  // A model's colour is its TOKEN rank (the host returns `models` sorted by
  // token volume), matching reasonix: rank 1..10 take --dsw-chart-1..10 and the
  // aggregated tail is the gray --dsw-chart-other. First-seen order would
  // scramble the rank colours (the top model could lose its blue, and a
  // top-10 model could fall into the gray bucket), so the rank is looked up in
  // `stats.models`, never in the daily walk.
  //
  // The lookup is a Map built ONCE per aggregate: the old `findIndex` walked
  // the model list for every SVG segment, bar and legend swatch, which is the
  // chart's hottest inner loop on a long range.
  const modelColorMap = useMemo(() => {
    const map = new Map<string, string>()
    ;(stats?.models ?? []).forEach((m, slot) => {
      map.set(m.model, `var(--dsw-chart-${chartSlot(slot, CHART_HUES)})`)
    })
    return map
  }, [stats])

  const colorForModel = useCallback((model: string): string => {
    if (model === OTHER_MODEL) return OTHER_COLOR
    return modelColorMap.get(model) ?? 'var(--dsw-chart-1)'
  }, [modelColorMap])

  // NO grouping: every model the host returned becomes its own row, and the
  // daily series keeps every model key. The list and the ring therefore rank the
  // same set — before this, the ring showed ten models plus a gray "Other" while
  // the list could be opened to reveal the rest, so the two disagreed about what
  // the section was showing. `GroupedModel` keeps its optional `items` field for
  // the wire shape's sake, but nothing populates it now.
  const groupedStats = useMemo<{ models: GroupedModel[]; daily: GroupedDaily[] } | null>(() => {
    if (!stats) return null
    const models: GroupedModel[] = [...stats.models]
    // The trend stack still needs an `otherByModel` record on every bucket (the
    // hover tip and the legend read it); with no fold it is always empty, but
    // the field stays so the chart's shape is unchanged.
    const daily: GroupedDaily[] = stats.daily.map((d) => ({ ...d, otherByModel: {} }))
    return { models, daily }
  }, [stats])

  // Provider colours are the provider's own rank — a palette separate from the
  // model series, so a provider never wears a model's hue. Same one-map-per-
  // aggregate approach as the model palette above.
  const providerColorMap = useMemo(() => {
    const ranked = (stats?.providers ?? []).filter((p) => p.tokens > 0)
    const map = new Map<string, string>()
    ranked.forEach((p, slot) => { map.set(p.provider, `var(--dsw-provider-${chartSlot(slot, PROVIDER_HUES)})`) })
    return map
  }, [stats])

  const colorForProvider = useCallback((provider: string): string => {
    if (provider === OTHER_PROVIDER) return OTHER_PROVIDER_COLOR
    return providerColorMap.get(provider) ?? 'var(--dsw-provider-1)'
  }, [providerColorMap])

  // NO grouping at this dimension either: every provider with usage gets its own
  // row (a request-only provider — calls that produced nothing — has no usage to
  // rank and is dropped). Each row still carries the models it served, so its
  // expandable detail list is unchanged; there is simply no Other bucket above
  // them any more.
  const groupedProviders = useMemo<GroupedProvider[] | null>(() => {
    if (!stats) return null
    const modelsOf = new Map<string, ModelTokenUsage[]>()
    for (const m of stats.models) {
      const list = modelsOf.get(m.provider)
      if (list === undefined) modelsOf.set(m.provider, [m])
      else list.push(m)
    }
    return stats.providers
      .filter((p) => p.tokens > 0)
      .map((p) => ({ ...p, models: modelsOf.get(p.provider) ?? [] }))
  }, [stats])

  const trendDaily = groupedStats?.daily ?? []
  const trendModels = groupedStats?.models ?? []

  // The rebuild button's label: its idle name, the armed confirm, or the
  // in-flight state (the ellipsis is glued on here, the way the loading
  // indicator does it, so no dictionary carries punctuation).
  const rebuildLabel = rebuilding
    ? `${t('rebuilding')}…`
    : rebuildArmed ? t('rebuildConfirm') : t('rebuild')

  return (
    <div className={css.panel} data-dsh-usage-panel-plus-glass="panel" aria-busy={loading} ref={panelRef}>
      <div className={css.toolbar}>
        <div className={css.group} data-dsh-usage-panel-plus-glass="group" role="group" aria-label={t('range')}>
          {RANGE_PRESETS.map((r) => (
            <Button
              key={r}
              size="sm"
              variant="ghost"
              className={clsx(css.segItem, range === r && css.segActive)}
              aria-pressed={range === r}
              onClick={() => setRange(r)}
            >
              {t(`rangePreset.${r}` as UsageStatsKey)}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className={clsx(css.segItem, range === 'custom' && css.segActive)}
            aria-pressed={range === 'custom'}
            onClick={() => setRange('custom')}
          >
            {t('rangeCustom')}
          </Button>
        </div>
        {range === 'custom' && (
          <div className={css.customRange}>
            <Input
              type="date"
              className={css.dateInput}
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => setCustomFrom(e.target.value)}
              aria-label={t('from')}
            />
            <span className={css.customSep}>–</span>
            <Input
              type="date"
              className={css.dateInput}
              value={customTo}
              min={customFrom || undefined}
              max={localDay(0)}
              onChange={(e) => setCustomTo(e.target.value)}
              aria-label={t('to')}
            />
          </div>
        )}
        {/* The toolbar actions are one flex item, not four: the toolbar
            wraps, and actions that wrapped apart would strand the rebuild
            button on a line of its own. The container owns the trailing auto
            margin, so the group rides the right edge together. */}
        <div className={css.actions}>
          <Button
            size="sm"
            variant="outline"
            className={css.refresh}
            onClick={() => { void load({ noCache: true }) }}
            disabled={loading}
          >
            {t('refresh')}
          </Button>
          <Tooltip label={t('exportHint')} side="top" portal maxWidth={260}>
            <Button
              size="sm"
              variant="outline"
              className={css.exportCsv}
              disabled={stats === null}
              onClick={exportCsv}
            >
              {t('export')}
            </Button>
          </Tooltip>
          <Tooltip label={t('autoRefreshHint')} side="top" portal maxWidth={260}>
            <Button
              size="sm"
              variant="outline"
              className={clsx(css.autoToggle, autoRefresh && css.autoToggleOn)}
              aria-pressed={autoRefresh}
              onClick={() => { toggleAutoRefresh(!autoRefresh) }}
            >
              {t('autoRefresh')}
            </Button>
          </Tooltip>
          <Tooltip label={t('rebuildHint')} side="top" portal maxWidth={260}>
            <Button
              size="sm"
              variant="outline"
              className={clsx(css.rebuild, rebuildArmed && css.rebuildArmed)}
              aria-pressed={rebuildArmed}
              disabled={rebuilding}
              onClick={() => { if (rebuildArmed) void runRebuild(); else armRebuild() }}
              onBlur={disarmRebuild}
              onKeyDown={(e) => { if (e.key === 'Escape') disarmRebuild() }}
            >
              {rebuildLabel}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* The custom preset applies nothing until BOTH dates are set (`load`
          returns early on an incomplete pair) and the panel keeps showing the
          previous range meanwhile. Say so on its own line: inside the toolbar
          the note made the whole row taller and left the action buttons
          vertically stranded against it. */}
      {range === 'custom' && (!customFrom || !customTo) && (
        <div className={css.customHint}>{t('customIncomplete')}</div>
      )}

      {/* A read is in flight while content is ALREADY on screen: a range
          switch, a manual refresh, an auto-refresh tick. A thin indeterminate
          bar says so without blanking the data area — the spinner below is
          reserved for the first load for exactly that reason. */}
      {loading && stats !== null && <div className={css.progressBar} role="presentation" />}

      {error && (
        <div className={css.errorBanner} role="alert">
          <div className={css.errorBannerRow}>
            <span className={css.errorBannerText}>{error}</span>
            {/* Recovery in place: without this the only way out of a failed
                read was the toolbar's Refresh, which is easy to miss and
                disabled while the failed request is still settling. */}
            <Button
              size="sm"
              variant="ghost"
              className={css.errorRetry}
              onClick={() => { void load({ noCache: true }) }}
            >
              {t('retry')}
            </Button>
          </div>
        </div>
      )}
      {loading && !stats && <div className={css.loading}>{t('loading')}…</div>}
      {/* Content stays mounted across refreshes (stats keeps its last value):
          only the FIRST load shows the spinner, so a range switch or a manual
          refresh never blanks the whole data area. */}
      {stats && (
        <>
          <StatCards stats={stats} t={t} />
          <Heatmap daily={heatDaily} from={heatWindow.from} to={heatWindow.to} t={t} panelRef={panelRef} />
          {/* Everything below the first screenful mounts only once the reader
              is about to reach it (see Deferred.tsx): the trend SVG, the
              session rows and both rings in one synchronous commit was the
              panel's largest first-paint cost.

              `placeholderHeight` has to approximate the REAL content, or the
              swap is a visible jump: the four sections below (trend 220px chart
              + model ring/list + provider ring/list + the session scroller, each
              with its head and the column gap) come to roughly 1300px. It used
              to say 560 — less than half — so arriving at the anchor shoved the
              page and reshuffled the scrollbar. */}
          <Deferred placeholderHeight={1320} rootMarginPx={240}>
            <DailyTrend models={trendModels} daily={trendDaily} granularity={stats?.granularity ?? 'day'} t={t} colorForModel={colorForModel} panelRef={panelRef} />
            <ModelUsage models={trendModels} t={t} colorForModel={colorForModel} panelRef={panelRef} />
            <ProviderUsage providers={groupedProviders ?? []} t={t} colorForProvider={colorForProvider} panelRef={panelRef} />
            {/* The session section CLOSES the panel: it is the deepest
                drill-down (range → conversation → the models inside it), so it
                reads as the last step instead of interrupting the model and
                provider summaries above it. */}
            <SessionUsage
              sessions={stats.sessions ?? []}
              sessionCount={sessionCountOf(stats)}
              tokens={stats.tokens}
              unknownRequests={stats.unknownRequests ?? 0}
              t={t}
              colorForModel={colorForModel}
            />
          </Deferred>
          {stats.to && (
            <div className={css.foot}>
              {t('asOf')} {stats.to}
              {updatedAt !== null && <> · {t('updatedAt')} {clockTime(updatedAt)}</>}
            </div>
          )}
        </>
      )}
      {!error && stats && isEmptyRange(stats) && (
        <div className={css.empty}>{t('empty')}</div>
      )}
      <div className={css.prefGroup} data-dsh-usage-panel-plus-glass="pref">
        <StatsLineOptions t={t} />
      </div>
    </div>
  )
}

// ── Section 2+3: numeric cards ────────────────────────────────────────────

/** A range is empty only when NOTHING was recorded in it: a pure-cache day
 *  (zero input/output but real cache hits) or a failed-call day (requests
 *  but no tokens) both carry real usage and must not read as "no data". */
function isEmptyRange(stats: UsageStatsRange): boolean {
  return stats.tokens === 0 && stats.cacheHit === 0 && stats.requests === 0 && stats.turns === 0
}

// ── Bottom-bar preference rows ────────────────────────────────────────────

/**
 * One framed preference row: title + subtitle on the left, the switch on the
 * right. The switch mirrors the official DSH switch (role=switch, track +
 * thumb); the shared store keeps each row and its consumer in sync
 * instantly because both run in the same client bundle.
 */
function SettingToggle({ title, desc, checked, ariaLabel, onChange }: {
  title: string
  desc: string
  checked: boolean
  ariaLabel: string
  onChange: (next: boolean) => void
}) {
  // One description id per row; the switch names it so a screen reader
  // announces the explanation alongside the title.
  const descId = useId()
  return (
    <div className={css.prefRow}>
      <div className={css.entryOptionText}>
        <div className={css.entryOptionTitle}>{title}</div>
        <div className={css.entryOptionDesc} id={descId}>{desc}</div>
      </div>
      <button
        type="button"
        className={css.switch}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-describedby={descId}
        onClick={() => { onChange(!checked) }}
      >
        <span className={css.switchTrack} data-on={checked || undefined} aria-hidden="true">
          <span className={css.switchThumb} />
        </span>
      </button>
    </div>
  )
}

/**
 * The three bottom-bar enhancement preferences:
 * "Precise cache hit rate" (two decimals on the usage pill and dialog),
 * "Session token breakdown" (an extra cache-miss row in the usage dialog) and
 * "Streaming throughput" (a live decode-speed estimate while a step streams,
 * replaced by the exact session figure the moment it settles).
 */
function StatsLineOptions({ t }: { t: Translator }) {
  const [cachePrecision, setCachePrecision] = useState(statsLineState.cachePrecision)
  const [tokenDetail, setTokenDetail] = useState(statsLineState.tokenDetail)
  const [streamThroughput, setStreamThroughput] = useState(statsLineState.streamThroughput)
  useEffect(() => statsLineState.subscribe(() => {
    setCachePrecision(statsLineState.cachePrecision)
    setTokenDetail(statsLineState.tokenDetail)
    setStreamThroughput(statsLineState.streamThroughput)
  }), [])
  return (
    <>
      <SettingToggle
        title={t('cachePrecision')}
        desc={t('cachePrecisionDesc')}
        checked={cachePrecision}
        ariaLabel={t('cachePrecision')}
        onChange={(next) => { statsLineState.setCachePrecision(next) }}
      />
      <SettingToggle
        title={t('tokenDetail')}
        desc={t('tokenDetailDesc')}
        checked={tokenDetail}
        ariaLabel={t('tokenDetail')}
        onChange={(next) => { statsLineState.setTokenDetail(next) }}
      />
      <SettingToggle
        title={t('streamThroughput')}
        desc={t('streamThroughputDesc')}
        checked={streamThroughput}
        ariaLabel={t('streamThroughput')}
        onChange={(next) => { statsLineState.setStreamThroughput(next) }}
      />
    </>
  )
}

function StatCards({ stats, t }: { stats: UsageStatsRange; t: Translator }) {
  // The preceding window of the same length, or null on a host/fixture without
  // the comparison (an older wire). Every card's delta is derived from it and
  // simply does not render when there is nothing to compare against.
  const previous = stats.previous ?? null
  const sessionCount = sessionCountOf(stats)
  const cards: Array<{ icon: typeof Coins; label: string; value: string; sm?: boolean; wrap?: boolean; hint?: string; modelRef?: boolean; sub?: string; delta?: CompareChange | null }> = [
    // The headline is provider-inclusive (uncached input + output + cached
    // tokens) — the number a provider dashboard reports for the same calls.
    // The headline is the compact K/M/B form (the number a provider dashboard
    // shows); the exact, separator-formatted count stays underneath so the
    // precise figure is still readable at a glance.
    { icon: Coins, label: t('tokens'), value: formatCompact(stats.tokens), hint: t('tokensHint'), sub: `${formatTokens(stats.tokens)} ${t('tokensUnit')}`, delta: compareChange(stats.tokens, previous?.tokens ?? null) },
    // The card is the REAL session count (distinct conversations with usage in
    // range), not the completed-turn count it used to show; the turn total now
    // rides underneath as the card's subtitle, where it is still readable but
    // no longer masquerades as a session count.
    {
      icon: MessageSquare,
      label: t('sessions'),
      value: String(sessionCount),
      hint: sessionCount === 0 ? t('noSessions') : t('sessionsHint'),
      sub: t('turnsShort', { n: stats.turns }),
      // The session dimension only covers conversations whose logs still
      // exist; compareSessions hides the badge when the previous window's
      // session coverage is missing instead of claiming "all new".
      delta: compareSessions(sessionCount, previous),
    },
    { icon: MessagesSquare, label: t('requests'), value: String(stats.requests), delta: compareChange(stats.requests, previous?.requests ?? null) },
    {
      icon: Activity,
      label: t('cacheRate'),
      value: cacheRateText(stats.cacheHit, stats.cacheMiss),
      hint: t('cacheRateHint'),
      // The absolute cached volume lives under the percentage: the rate
      // alone hides how many tokens the cache actually served.
      sub: `${formatCompact(stats.cacheHit)} ${t('cachedTokens')}`,
      // A rate compares against a rate: derive both sides from their own
      // hit/miss volumes so a range with no input tokens yields no badge
      // instead of a division by zero.
      delta: compareChange(
        cacheRate(stats.cacheHit, stats.cacheMiss),
        previous === null ? null : cacheRate(previous.cacheHit, previous.cacheMiss),
      ),
    },
    { icon: CalendarDays, label: t('activeDays'), value: String(stats.activeDays), delta: compareChange(stats.activeDays, previous?.activeDays ?? null) },
    // The two long-valued cards bookend the row: total tokens leads it and the
    // top model closes it, each on a wider track than the four short numerics
    // between them. The model sits last because it carries the longest text —
    // the model name over its provider — and the row's end is where that has
    // the most room before FitText would have to shrink it. No delta here: a
    // model name has no period-over-period percentage.
    { icon: Cpu, label: t('topModel'), value: stats.topModel || '—', hint: t('topModelHint'), modelRef: true },
  ]
  return (
    <div className={css.cards}>
      {cards.map((c) => {
        const hasDelta = c.delta !== undefined && c.delta !== null
        return (
          <div className={css.card} data-dsh-usage-panel-plus-glass="card" key={c.label} title={c.hint}>
            <div className={css.cardHead}>
              <c.icon className={css.cardIcon} size={14} strokeWidth={2} aria-hidden="true" />
              <span className={css.cardLabel}>{c.label}</span>
            </div>
            {c.modelRef ? (
              // The model card mirrors the per-model list rows: model name on
              // line one, provider on line two in the muted small style — not
              // the raw "provider/model" ref.
              <div className={clsx(css.cardValue, css.cardValueSm, css.cardModelLines)}>
                {stats.topModel ? (
                  <>
                    <span className={css.modelName}>{modelNameOf(stats.topModel)}</span>
                    <span className={css.modelProvider}>{providerOf(stats.topModel)}</span>
                  </>
                ) : '—'}
              </div>
            ) : c.wrap ? (
              <div className={clsx(css.cardValue, css.cardValueSm, css.cardValueWrap)}>{c.value}</div>
            ) : (
              <FitText text={c.value} className={clsx(css.cardValue, c.sm && css.cardValueSm)} maxSize={c.sm ? 14 : 22} />
            )}
            {/* ONE footer line per card, always: the sub-value on the left, the
                period-over-period badge on the right. Before this, a card with
                both stacked them on two lines while a card with only a badge had
                one, so the six cards' feet never lined up and the badges sat at
                three different heights across the row. */}
            {(c.sub !== undefined || hasDelta) && (
              <div className={css.cardFoot}>
                <span className={css.cardSub}>{c.sub ?? ''}</span>
                {hasDelta && <CompareDelta change={c.delta as CompareChange} t={t} />}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** The period-over-period badge under a card value: an arrow plus the change.
 *  Colours stay neutral — usage going up is neither good nor bad, so the badge
 *  must not editorialize the direction.
 *
 *  A `new` comparison (the previous window held nothing, so there is no ratio to
 *  show) renders NOTHING. It used to print "+ 新增" / "+ New", which is a badge
 *  that states no number: every card whose prior window was empty wore the same
 *  word, so the row of deltas stopped being a column of comparable figures and
 *  became a mix of percentages and prose. The absence of a badge already says
 *  "nothing to compare against", and the hover title still explains it. */
function CompareDelta({ change, t }: { change: CompareChange; t: Translator }) {
  if (change.direction === 'new') return null
  const glyph = change.direction === 'up' ? '↑' : change.direction === 'down' ? '↓' : '→'
  return (
    <div className={css.cardDelta} data-kind={change.direction} title={t('comparePrev')}>
      <span aria-hidden="true">{glyph}</span>
      {' '}
      {formatPercent(change.percent)}
    </div>
  )
}

// FitText renders `text` on a single line, shrinking the font until it fits
// the card width (long token numbers never overflow or wrap).
function FitText({ text, className, maxSize }: { text: string; className?: string; maxSize: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(maxSize)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      let s = maxSize
      el.style.fontSize = `${s}px`
      while (el.scrollWidth > el.clientWidth + 1 && s > 11) {
        s -= 0.5
        el.style.fontSize = `${s}px`
      }
      setSize(s)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, maxSize])

  return (
    <div ref={ref} className={className} style={{ fontSize: size }}>
      {text}
    </div>
  )
}

// ── Section 4: GitHub-style activity heatmap ──────────────────────────────

// Cell/gap ratio follows reasonix (base 13 / gap 3): a 1px gap against a
// ~20px grown cell read as tiles touching edge to edge. The gap also equals
// the legend's own 3px swatch spacing, and the fixed rx matches the legend
// swatch border-radius, so the key renders at exactly the chart's geometry.
const HEAT_BASE = 14 // cell size at which column trimming starts
const HEAT_GAP = 3 // breathing gap between cells; mirrors the legend swatch gap
const HEAT_RX = 3 // cell corner radius; matches the legend swatch (css .heatCell)

/** One heatmap frame's geometry. */
export interface HeatGeometry {
  /** Cell edge in px. */
  size: number
  /** Weeks drawn. */
  cols: number
  /** Columns actually laid out, including the partial first week. */
  totalWeeks: number
}

/**
 * Solve the heatmap's geometry for an available width.
 *
 * Two rules, in this order: spend spare width on MORE WEEKS (up to the data
 * window), and only then grow the cells to close the remaining gap. When the
 * window does not fit at the base cell size, trim the earliest weeks and keep
 * the base size.
 *
 * Two off-by-one traps are handled explicitly, because both produce a real
 * overflow at the page's ~900px content width:
 *  - "does it fit" is tested against `totalWeeks` (the laid-out column count,
 *    one more than `cols` when the first week is partial), not `HEAT_WEEKS`;
 *  - the fitting test reserves the trailing gap, so `baseCols` is derived from
 *    `avail - HEAT_GAP` and the rendered width `cols*(size+GAP)+GAP` can never
 *    exceed `avail`.
 *
 * The growth branch runs only when the solved cell size is still at or above
 * the base size; otherwise the window does not truly fit and the trim branch
 * runs. A `max(BASE, size)` fallback would silently render one column too many.
 * @param avail - available width in px.
 * @param startOffset - leading empty cells of the first week (0..6).
 * @returns the cell size, the week count, and the laid-out column count.
 */
export function heatGeometry(avail: number, startOffset: number): HeatGeometry {
  const totalWeeks = Math.ceil((HEAT_WEEKS * 7 + startOffset) / 7)
  const baseCols = Math.max(1, Math.floor((avail - HEAT_GAP) / (HEAT_BASE + HEAT_GAP)))
  if (baseCols >= totalWeeks) {
    const size = (avail - HEAT_GAP) / totalWeeks - HEAT_GAP
    if (size >= HEAT_BASE) return { size, cols: HEAT_WEEKS, totalWeeks }
  }
  // `cols * 7` days behind a leading partial week occupy one MORE track than
  // `cols`, and the SVG viewport is sized from the track count — so a `cols`
  // that only fits `cols` tracks leaves the newest column outside the viewBox,
  // clipped to a sliver at the right edge. Drop the OLDEST week in that case:
  // one fewer week reads far better than a half-drawn newest one, and the
  // remaining cells grow to fill the width exactly. `cols` was derived from
  // `avail - GAP`, so the solved size stays at or above the base size; the
  // floor only guards absurd widths.
  const tracksFor = (c: number): number => Math.max(c, Math.ceil((c * 7 + startOffset) / 7))
  let cols = Math.max(1, Math.min(baseCols, HEAT_WEEKS))
  while (cols > 1 && tracksFor(cols) > baseCols) cols -= 1
  const totalCols = tracksFor(cols)
  const size = (avail - HEAT_GAP) / totalCols - HEAT_GAP
  return { size: Math.max(HEAT_BASE, size), cols, totalWeeks: totalCols }
}

function Heatmap({ daily, from, to, t, panelRef }: { daily: DailyTokenUsage[]; from: string; to: string; t: Translator; panelRef: RefObject<HTMLDivElement | null> }) {
  // Memoized so a hover/tip state change re-renders without rebuilding the
  // per-day lookup (the daily array is stable between fetches).
  const byDay = useMemo(() => {
    const map = new Map<string, DailyTokenUsage>()
    for (const d of daily) map.set(d.day, d)
    return map
  }, [daily])
  const [tip, setTip] = useState<{ day: string; tokens: number; requests: number; cacheHit: number; cacheMiss: number; anchor: Element } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [geom, setGeom] = useState<HeatGeometry>(() => heatGeometry(HEAT_BASE * HEAT_WEEKS, 0))

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const avail = Math.max(1, el.clientWidth - 2)
      const next = heatGeometry(avail, (indexOfDay(from) + 1) % 7)
      // Only commit when the geometry actually changed — the heatmap SVG
      // width follows `geom.size`, and committing an identical value on
      // every ResizeObserver callback would feed a render loop and jitter.
      setGeom((prev) => (prev.size === next.size && prev.cols === next.cols ? prev : next))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [from])

  const allDays = daysBetween(from, to)
  if (allDays.length === 0) return null
  const days = allDays.slice(-Math.min(geom.cols * 7, allDays.length))
  const max = Math.max(1, ...days.map((d) => byDay.get(d)?.total ?? 0))

  const rows = 7
  const startOffset = days[0] ? (indexOfDay(days[0]) + 1) % 7 : 0
  // The solver already knows how many columns the layout has, including the
  // partial first week, so the SVG width follows it directly.
  const weeks = geom.totalWeeks

  return (
    <section className={css.section}>
      <div className={css.sectionHead}>
        <h3 className={css.sectionTitle}>{t('heatmap')}</h3>
        <div className={css.heatLegend}>
          <span>{t('heatLess')}</span>
          <i className={clsx(css.heatCell, css.heatLevel1)} style={{ width: geom.size, height: geom.size }} />
          <i className={clsx(css.heatCell, css.heatLevel2)} style={{ width: geom.size, height: geom.size }} />
          <i className={clsx(css.heatCell, css.heatLevel3)} style={{ width: geom.size, height: geom.size }} />
          <i className={clsx(css.heatCell, css.heatLevel4)} style={{ width: geom.size, height: geom.size }} />
          <i className={clsx(css.heatCell, css.heatLevel5)} style={{ width: geom.size, height: geom.size }} />
          <span>{t('heatMore')}</span>
        </div>
      </div>
      <div className={css.heatWrap} ref={wrapRef}>
        <svg className={css.heatmap} width={weeks * (geom.size + HEAT_GAP) + HEAT_GAP} height={rows * (geom.size + HEAT_GAP) + HEAT_GAP} role="img" aria-label={t('heatmap')}>
          {days.map((day, i) => {
            const col = Math.floor((i + startOffset) / 7)
            const row = (i + startOffset) % 7
            const rec = byDay.get(day)
            const tokens = rec?.total ?? 0
            const level = tokens === 0 ? 0 : 1 + Math.floor((tokens / max) * 4)
            const x = HEAT_GAP + col * (geom.size + HEAT_GAP)
            const y = HEAT_GAP + row * (geom.size + HEAT_GAP)
            return (
              <rect
                key={day}
                className={clsx(css.heatCell, level === 0 && css.heatLevel0, level === 1 && css.heatLevel1, level === 2 && css.heatLevel2, level === 3 && css.heatLevel3, level === 4 && css.heatLevel4, level === 5 && css.heatLevel5)}
                x={x}
                y={y}
                width={geom.size}
                height={geom.size}
                rx={HEAT_RX}
                onMouseEnter={(e) => {
                  // The tip anchors to the hovered cell's viewport rect, so it
                  // can escape the wrap's overflow clipping and follow scroll.
                  setTip({ day, tokens, requests: rec?.requests ?? 0, cacheHit: rec?.cacheHit ?? 0, cacheMiss: rec?.cacheMiss ?? 0, anchor: e.currentTarget })
                }}
                onMouseLeave={() => setTip(null)}
              />
            )
          })}
        </svg>
        {tip && (
          <ChartTip anchor={tip.anchor} panelRef={panelRef}>
            <div className={css.tipTitle}>{tip.day}</div>
            <div>{t('tokens')}: {formatTokens(tip.tokens)}</div>
            <div>{t('requests')}: {tip.requests}</div>
            <div>{t('cacheHitRate')}: {cacheRateText(tip.cacheHit, tip.cacheMiss)}</div>
          </ChartTip>
        )}
      </div>
    </section>
  )
}

// ── Section 5: stacked daily token trend ──────────────────────────────────

function DailyTrend({ models, daily, granularity, t, colorForModel, panelRef }: { models: GroupedModel[]; daily: GroupedDaily[]; granularity: 'day' | 'hour'; t: Translator; colorForModel: (m: string) => string; panelRef: RefObject<HTMLDivElement | null> }) {
  const [tip, setTip] = useState<{ day: string; total: number; byModel: Record<string, number>; otherByModel?: Record<string, number>; cacheHit: number; cacheMiss: number; anchor: Element } | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const W = 720
  const H = 220
  const padL = 46
  const padR = 65
  const padB = 26
  const padT = 10
  const plotH = H - padT - padB
  // The smallest column pitch that still reads as separate bars; below it
  // (very long custom ranges on a narrow pane) the oldest days drop off.
  const MIN_PITCH = 4

  const [view, setView] = useState<{ avail: number; trimN: number }>({ avail: W, trimN: TREND_MAX_DAYS })

  useEffect(() => {
    const el = wrapRef.current
    if (!el || daily.length === 0) return
    const update = () => {
      const avail = Math.max(1, el.clientWidth)
      const maxN = Math.floor((avail - padL - padR) / MIN_PITCH) + 1
      const trimN = Math.max(1, Math.min(daily.length, TREND_MAX_DAYS, maxN))
      setView((prev) => (prev.avail === avail && prev.trimN === trimN ? prev : { avail, trimN }))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [daily.length])

  if (daily.length === 0) return null

  const visible = daily.slice(-view.trimN)
  // The note is honest about whatever window actually rendered (the 180-day
  // cap, or a narrower pane's minimum-pitch trim).
  const trendCapped = daily.length > view.trimN
  const n = visible.length
  // Columns always spread over the full plot width: pinning a minimum pitch
  // for the step itself letterboxes the chart (the viewBox, narrower than
  // the svg box, centres with empty flanks) when few days are in range —
  // 7/14-day presets used to huddle in the middle. The pitch floor above
  // only caps how many days show.
  const step =
    n > 1
      ? (view.avail - padL - padR) / (n - 1)
      : Math.max(1, view.avail - padL - padR)
  const barW = Math.max(3, Math.min(30, step * 0.62))
  const barHalf = barW / 2
  const plotWUsed = view.avail
  const maxTotal = Math.max(1, ...visible.map((d) => d.total))
  const ticks = niceTicks(maxTotal, 4)
  // X labels keep at least ~46px between their columns — a fixed "every Nth
  // day" count collided when few days stretched across the whole plot
  // (7/14-day presets labelled every bar).
  const labelEvery = Math.max(1, Math.ceil(46 / step))

  const trendPoints: Array<{ x: number; y: number }> = []
  const trendPointByDay = new Map<string, { x: number; y: number }>()
  visible.forEach((d, i) => {
    const rate = cacheRate(d.cacheHit, d.cacheMiss)
    if (rate === null) return
    const pt = { x: padL + barHalf + i * step, y: padT + plotH - (rate / 100) * plotH }
    trendPoints.push(pt)
    trendPointByDay.set(d.day, pt)
  })
  const trendPath = smoothPath(trendPoints)
  const trendTipPt = tip ? trendPointByDay.get(tip.day) : undefined
  const rateTicks = [0, 25, 50, 75, 100]

  // Legend and bar stacks follow the overall usage ranking (not the per-day
  // leader), so a model's colour stays in the same position every day and the
  // aggregated "Other" step always sits on top.
  const legendAgg = aggregateByModel(daily)
  const legendModels = modelOrderOf(models, legendAgg)

  return (
    <section className={css.section}>
      <div className={css.sectionHead}>
        <h3 className={css.sectionTitle}>{t(granularity === 'hour' ? 'hourlyTrend' : 'dailyTrend')}</h3>
        {trendCapped && <span className={css.trendNote}>{t('trendLimited').replace('{n}', String(view.trimN))}</span>}
      </div>
      <div className={css.chartWrap} ref={wrapRef}>
        <svg className={css.chart} width="100%" height={H} viewBox={`0 0 ${plotWUsed} ${H}`} onMouseLeave={() => { setTip(null); setHover(null) }}>
          {ticks.map((tk) => {
            const y = padT + plotH - (tk / maxTotal) * plotH
            return (
              <g key={tk}>
                <line className={css.grid} x1={padL} y1={y} x2={padL + (n - 1) * step + barW} y2={y} />
                <text className={css.axis} x={padL - 6} y={y + 3} textAnchor="end">{formatCompact(tk)}</text>
              </g>
            )
          })}
          {visible.map((d, i) => {
            const x = padL + barHalf + i * step - barW / 2
            const dayOrder = legendModels.filter((m) => d.byModel[m] !== undefined)
            let yBottom = padT + plotH
            const bars = dayOrder.map((model) => {
              const tokens = d.byModel[model]!
              const h = (tokens / maxTotal) * plotH
              const y = yBottom - h
              yBottom = y
              return { model, tokens, x, y, h, color: colorForModel(model), dimmed: hover !== null && hover !== model }
            })
            const hovered = tip?.day === d.day
            return (
              <g key={d.day}>
                {bars.map((b) => (
                  <rect
                    key={`${d.day}-${b.model}`}
                    className={clsx(css.bar, b.dimmed && css.barDim)}
                    x={b.x}
                    y={b.y}
                    width={barW}
                    height={b.h}
                    fill={b.color}
                    style={hovered ? { transform: `scaleX(${(barW + 3) / barW})` } : undefined}
                  />
                ))}
                <rect
                  className={css.barHit}
                  x={x}
                  y={padT}
                  width={barW}
                  height={plotH}
                  onMouseEnter={(e) => {
                    // The tip anchors to the hovered day column's viewport
                    // rect, so it can escape wrap clipping and follow scroll.
                    setTip({ day: d.day, total: d.total, byModel: d.byModel, otherByModel: d.otherByModel, cacheHit: d.cacheHit, cacheMiss: d.cacheMiss, anchor: e.currentTarget })
                  }}
                  onMouseLeave={() => setTip(null)}
                />
                {(i % labelEvery === 0 || i === n - 1) && (
                  <text className={css.axis} x={padL + barHalf + i * step} y={H - 8} textAnchor="middle">{bucketAxisLabel(d.day, granularity)}</text>
                )}
              </g>
            )
          })}
          <path className={css.trend} d={trendPath} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {trendTipPt && (
            <circle className={css.trendDot} cx={trendTipPt.x} cy={trendTipPt.y} r={4} />
          )}
          {rateTicks.map((p) => {
            const y = padT + plotH - (p / 100) * plotH
            return (
              <g key={`rate-${p}`}>
                <text className={clsx(css.axis, css.axisRate)} x={padL + (n - 1) * step + barW + 8} y={y + 3}>{p}%</text>
              </g>
            )
          })}
        </svg>
        {tip && (
          <ChartTip anchor={tip.anchor} panelRef={panelRef}>
            <div className={css.tipTitle}>{bucketTitle(tip.day, granularity)}</div>
            <div>{t('total')}: {formatTokens(tip.total)}</div>
            {legendModels.filter((m) => tip.byModel[m] !== undefined).map((m) => (
              <div key={m} className={css.tipRow}><i className={css.legendSwatch} style={{ background: colorForModel(m) }} />{m}: {formatTokens(tip.byModel[m]!)}</div>
            ))}
            {tip.otherByModel && Object.entries(tip.otherByModel).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
              <div key={m} className={clsx(css.tipRow, css.tipRowOther)}><i className={css.legendSwatch} style={{ background: OTHER_COLOR }} />{m}: {formatTokens(v)}</div>
            ))}
            <div>{t('cacheHitRate')}: {cacheRateText(tip.cacheHit, tip.cacheMiss)}</div>
          </ChartTip>
        )}
        <div className={css.legend}>
          {legendModels.map((model) => (
            <span key={model} className={css.legendItem} onMouseEnter={() => setHover(model)} onMouseLeave={() => setHover(null)}>
              <i className={css.legendSwatch} style={{ background: colorForModel(model) }} />
              {model}
            </span>
          ))}
          <span className={css.legendItem} aria-hidden="true">
            <i className={clsx(css.legendSwatch, css.legendTrend)} />
            {t('hitRateLegend')}
          </span>
        </div>
      </div>
    </section>
  )
}

// ── Section 6: per-model ring + list ────────────────────────────────────

function ModelUsage({ models, t, colorForModel, panelRef }: { models: GroupedModel[]; t: Translator; colorForModel: (m: string) => string; panelRef: RefObject<HTMLDivElement | null> }) {
  const [tip, setTip] = useState<{ model: string; tokens: number; percent: number; anchor: Element } | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  // The ring's diameter follows the row's width, so the list keeps its own
  // share of the space and the scroller never stretches the chart.
  const rowRef = useRef<HTMLDivElement>(null)
  const size = useDonutSize(rowRef)

  if (models.length === 0) return null

  // Ring order is the host's rank order, running clockwise from twelve
  // o'clock to match the list beside it. Every model is a segment of its own:
  // there is no aggregated tail, so the ring and the list rank the same set.
  const segments: DonutSegment[] = models.map((m) => ({
    key: m.model,
    tokens: m.tokens,
    color: colorForModel(m.model),
    label: `${m.model}: ${formatTokens(m.tokens)} (${formatPercent(m.percent)})`,
  }))
  const total = models.reduce((sum, m) => sum + m.tokens, 0)

  // A ring segment and its list row drive the same highlight; only the
  // segment carries an anchor, so only it raises the tooltip.
  const highlight = (key: string | null, anchor?: Element): void => {
    setHover(key)
    const m = key === null ? undefined : models.find((x) => x.model === key)
    setTip(m !== undefined && anchor !== undefined
      ? { model: m.model, tokens: m.tokens, percent: m.percent, anchor }
      : null)
  }

  return (
    <section className={css.section}>
      {/* Every section carries the same head anatomy: the title on the left,
          one muted note on the right. The model and provider sections used to
          render a bare <h3>, which left them with no rhythm against the two
          sections above and no statement of how their rows are ordered. */}
      <div className={css.sectionHead}>
        <h3 className={css.sectionTitle}>{t('modelUsage')}</h3>
        <span className={css.trendNote}>
          {t('modelUsageHint', { n: models.length })}
        </span>
      </div>
      <div className={css.models} ref={rowRef}>
        <div className={css.donutWrap}>
          <Donut
            segments={segments}
            size={size}
            ariaLabel={t('modelUsage')}
            centerValue={formatCompact(total)}
            centerCaption={t('tokens')}
            hovered={hover}
            onHover={highlight}
          />
          {tip && (
            <ChartTip anchor={tip.anchor} panelRef={panelRef}>
              <div className={css.tipTitle}>{tip.model}</div>
              <div>{t('total')}: {formatTokens(tip.tokens)}</div>
              <div>{t('percent')}: {formatPercent(tip.percent)}</div>
            </ChartTip>
          )}
        </div>
        {/* The model list is a fixed-height scroller, like the session list
            below it: the section is a drill-down, and a range with twenty
            models used to push everything after it off the screen. The ring
            beside it stays put; only the rows scroll. */}
        <div className={css.modelScroll} data-dsh-usage-panel-plus-glass="list">
        <ul className={css.modelList}>
          {models.map((m, rank) => {
            const accent = colorForModel(m.model)
            // The row's share has to be measured against EVERY token in the
            // range, not against the visible rows: `percent` from the host is
            // already that share, so it reads on the same scale as the ring
            // behind it.
            const percent = Math.min(100, Math.max(0, m.percent))
            const rate = m.cacheHit === undefined || m.cacheMiss === undefined
              ? null
              : cacheRateText(m.cacheHit, m.cacheMiss)
            return (
              <li
                key={m.model}
                className={css.modelRow}
                onMouseEnter={() => highlight(m.model)}
                onMouseLeave={() => highlight(null)}
              >
                <span className={css.modelRank} aria-hidden="true">{rank + 1}</span>
                <i className={css.legendSwatch} style={{ background: accent }} />
                <div className={css.modelId}>
                  <span className={css.modelName}>{modelNameOf(m.model)}</span>
                  {/* The second line: provider, then the row's OWN cache hit
                      rate. The rate is a single figure introduced by a small
                      cache glyph rather than the words "cache hit rate": the
                      columns to its right already carry two numbers, so a
                      spelled-out label would cost more width than the value it
                      introduces. The glyph is `aria-label`ed and the whole cell
                      keeps the tooltip, so nothing is lost for a screen reader
                      or a first-time reader. */}
                  <span className={css.modelMeta}>
                    <span className={css.modelProvider}>{providerOf(m.model)}</span>
                    {rate !== null && <span className={css.modelDot} aria-hidden="true">·</span>}
                    <span
                      className={css.modelHitRate}
                      title={`${t('hitRateLabel')}: ${t('cacheRateHint')}`}
                      aria-label={rate === null ? t('hitRateLabel') : `${t('hitRateLabel')} ${rate}`}
                    >
                      <Database size={9} aria-hidden="true" />
                      {rate === null ? t('hitRateNone') : t('hitRateShort', { rate })}
                    </span>
                  </span>
                </div>
                <div className={css.modelValues}>
                  {/* Compact like the session list and the ring's centre: the
                      exact separator-formatted figure was an outlier here and
                      it is still one hover away in the tooltip. */}
                  <span className={css.modelTokens}>{formatCompact(m.tokens)}</span>
                  <span className={css.modelPct}>{formatPercent(percent)}</span>
                </div>
              </li>
            )
          })}
        </ul>
        </div>
      </div>
    </section>
  )
}

// ── Section 7: per-provider ring + list ─────────────────────────────────
//
// The same anatomy as the model section one dimension up: the ring on the
// left, the ranked list on the right, and one shared highlight so
// hovering either side lights the other. Every row opens a detail list of its
// own — a ranked provider opens the models it served, the Other bucket opens
// the providers it folded, and each of those opens ITS models (two levels).
// The hover tip carries the same breakdown for the bar's segments.

function ProviderUsage({ providers, t, colorForProvider, panelRef }: { providers: GroupedProvider[]; t: Translator; colorForProvider: (p: string) => string; panelRef: RefObject<HTMLDivElement | null> }) {
  const [tip, setTip] = useState<{ provider: string; tokens: number; percent: number; anchor: Element; models: ModelTokenUsage[] } | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  // Two independent expand sets: `openRanked` holds ranked providers — and the
  // Other bucket — opening their own detail list, `openFolded` holds providers
  // One expand set now that there is no Other bucket to nest a second level
  // inside: every row opens the models it served, one level.
  const [open, setOpen] = useState<ReadonlySet<string>>(NO_KEYS)
  // The ring's diameter follows the row's width, so the list keeps its own
  // share of the space and expanding a row never stretches it.
  const rowRef = useRef<HTMLDivElement>(null)
  const size = useDonutSize(rowRef)

  if (providers.length === 0) return null

  const flip = (key: string): void => { setOpen((prev) => toggleIn(prev, key)) }

  const segments: DonutSegment[] = providers.map((p) => ({
    key: p.provider,
    tokens: p.tokens,
    color: colorForProvider(p.provider),
    label: `${p.provider}: ${formatTokens(p.tokens)} (${formatPercent(p.percent)})`,
  }))
  const total = providers.reduce((sum, p) => sum + p.tokens, 0)

  const highlight = (key: string | null, anchor?: Element): void => {
    setHover(key)
    const p = key === null ? undefined : providers.find((x) => x.provider === key)
    setTip(p !== undefined && anchor !== undefined
      ? { provider: p.provider, tokens: p.tokens, percent: p.percent, anchor, models: p.models }
      : null)
  }

  return (
    <section className={css.section}>
      <div className={css.sectionHead}>
        <h3 className={css.sectionTitle}>{t('providerUsage')}</h3>
        <span className={css.trendNote}>
          {t('providerUsageHint', { n: providers.length })}
        </span>
      </div>
      <div className={css.models} ref={rowRef}>
        <div className={css.donutWrap}>
          <Donut
            segments={segments}
            size={size}
            ariaLabel={t('providerUsage')}
            centerValue={formatCompact(total)}
            centerCaption={t('tokens')}
            hovered={hover}
            onHover={highlight}
          />
          {tip && (
            <ChartTip anchor={tip.anchor} panelRef={panelRef}>
              <div className={css.tipTitle}>{tip.provider}</div>
              <div>{t('total')}: {formatTokens(tip.tokens)}</div>
              <div>{t('percent')}: {formatPercent(tip.percent)}</div>
              {tip.models.length > 0 && (
                <div className={css.tipBreakdown}>
                  {tip.models.map((m) => (
                    <div key={m.model} className={clsx(css.tipRow, css.tipRowOther)}>
                      <i className={css.legendSwatch} style={{ background: colorForProvider(tip.provider) }} />
                      {modelNameOf(m.model)}: {formatTokens(m.tokens)}
                    </div>
                  ))}
                </div>
              )}
            </ChartTip>
          )}
        </div>
        {/* Same capped scroller as the model list above: every provider gets a
            row, and the section keeps a predictable footprint however many
            providers the range touched. */}
        <div className={css.modelScroll} data-dsh-usage-panel-plus-glass="list">
        <ul className={css.modelList}>
          {providers.map((p, rank) => {
            const isOpen = open.has(p.provider)
            return (
              <Fragment key={p.provider}>
                {/* The row: mouse convenience only. The keyboard path is the
                    real toggle button inside (aria-expanded + Enter/Space), so
                    the row carries no role/tabIndex — a role=button li would
                    nest two interactive elements. */}
                <li
                  className={clsx(css.modelRow, css.modelRowExpandable)}
                  onMouseEnter={() => highlight(p.provider)}
                  onMouseLeave={() => highlight(null)}
                  onClick={() => flip(p.provider)}
                >
                  <span className={css.modelRank} aria-hidden="true">{rank + 1}</span>
                  <i className={css.legendSwatch} style={{ background: colorForProvider(p.provider) }} />
                  <div className={css.modelId}>
                    <span className={css.modelName}>
                      <button
                        type="button"
                        className={css.modelToggle}
                        onClick={(e) => { e.stopPropagation(); flip(p.provider) }}
                        aria-expanded={isOpen}
                        aria-label={p.provider}
                      >
                        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      {p.provider}
                    </span>
                    <span className={css.modelProvider}>{t('providerModels', { n: p.models.length })}</span>
                  </div>
                  <div className={css.modelValues}>
                    <span className={css.modelTokens}>{formatCompact(p.tokens)}</span>
                    <span className={css.modelPct}>{formatPercent(p.percent)}</span>
                  </div>
                </li>
                {/* The detail list is a SIBLING of the row and never carries a
                    row class. The ring's diameter is solved from the ROW's own
                    width, never from the list's height, so opening a detail
                    list cannot resize the chart. It stays mounted (the
                    accordion animates a grid track) and is simply skipped when
                    the row has nothing to show. A provider opens the models it
                    served, each wearing that provider's own hue so the row
                    group reads as one block. */}
                {p.models.length > 0 && (
                  <li className={clsx(css.modelOtherWrap, isOpen && css.modelOtherOpen)}>
                    <ul className={css.modelOtherList}>
                      {p.models.map((m) => (
                        <li key={m.model} className={clsx(css.modelRow, css.modelRowSub)}>
                          <i className={css.legendSwatch} style={{ background: colorForProvider(p.provider) }} />
                          <div className={css.modelId}>
                            <span className={css.modelName}>{modelNameOf(m.model)}</span>
                          </div>
                          <div className={css.modelValues}>
                            <span className={css.modelTokens}>{formatCompact(m.tokens)}</span>
                            <span className={css.modelPct}>{formatPercent(m.percent)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </Fragment>
            )
          })}
        </ul>
        </div>
      </div>
    </section>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────

/** Toggle one key in an immutable string set (a fresh Set every call, so React
 *  sees a state change and unrelated keys keep their state). */
function toggleIn(set: ReadonlySet<string>, key: string): ReadonlySet<string> {
  const next = new Set(set)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

function aggregateByModel(daily: Array<{ byModel: Record<string, number> }>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const d of daily) {
    for (const [m, v] of Object.entries(d.byModel)) out[m] = (out[m] ?? 0) + v
  }
  return out
}

/** The legend model order is the overall usage ranking — every model, no
 *  pinned tail, because every model is a legend entry of its own now. */
function modelOrderOf(models: GroupedModel[], dailyAgg: Record<string, number>): string[] {
  return models
    .filter((m) => dailyAgg[m.model] !== undefined)
    .map((m) => m.model)
}
