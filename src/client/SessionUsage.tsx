/**
 * SessionUsage — the per-session drill-down section of the usage panel: one
 * ranked row per conversation, sized by its token share of the range, opening
 * into that session's own model split.
 *
 * The dimension answers the question the summary cards cannot: WHICH
 * conversation the traffic came from. The host aggregates it server-side (the
 * store keeps a per-session table) and returns up to {@link
 * MAX_SESSIONS_IN_RESPONSE} rows sorted by tokens.
 *
 * LAYOUT: the rows live in a fixed-height scroller, not in a list that grows
 * with the number of conversations. A range with thirty sessions used to push
 * the foot of the panel a full screen down for a section that is a drill-down,
 * not a headline — so the list gets a capped viewport of about six rows and
 * scrolls inside it, exactly like a log pane. Every returned row is rendered
 * (no "other N" fold row): scrolling already reaches them, and folding on top
 * of a scroller would hide rows behind two different gestures.
 *
 * The section CLOSES the panel: it is the deepest drill-down (range →
 * conversation → the models inside it), so it reads as the last step instead of
 * interrupting the model and provider summaries above it.
 *
 * An empty range renders NOTHING — not an empty frame: a section that only
 * ever says "no rows" is noise.
 */
import { useId, useState } from 'react'
import clsx from 'clsx'
import { ChevronDown, ChevronRight, Database } from 'lucide-react'
import type { SessionTokenUsage } from '../wire.ts'
import { formatCompact, cacheRateText, formatPercent, modelNameOf, providerOf, shortDate, shortSessionId } from './format.ts'
import type { UsageStatsTranslator } from './index.tsx'
import css from './UsageStatsPanel.module.css'

export interface SessionUsageProps {
  /** The range's session rows, sorted by tokens desc (host order, trusted). */
  sessions: readonly SessionTokenUsage[]
  /** Exact number of distinct sessions in the range (may exceed `sessions`,
   *  but the delta is disclosed rather than silently dropped). */
  sessionCount: number
  /** Range total tokens — the denominator of every row's share bar. */
  tokens: number
  /** Requests the host could not attribute to a model; disclosed next to the
   *  section title rather than silently dropped. */
  unknownRequests?: number
  t: UsageStatsTranslator
  /** Rank colour of a model ref (the panel's shared model palette), so a row's
   *  accent and its expanded model list agree with the model section. */
  colorForModel?: (model: string) => string
}

/** Toggle one key in an immutable string set — a fresh Set every call, so
 *  React sees a change and unrelated rows keep their own state. */
function toggleIn(set: ReadonlySet<string>, key: string): ReadonlySet<string> {
  const next = new Set(set)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

export function SessionUsage({
  sessions,
  sessionCount,
  tokens,
  unknownRequests = 0,
  t,
  colorForModel,
}: SessionUsageProps): JSX.Element | null {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set<string>())
  // One id names the "model breakdown" list a row expands, so the toggle's
  // aria-controls points at a real element.
  const detailIdBase = useId()

  if (sessions.length === 0) return null

  // The host caps the response, so a very wide range can report more sessions
  // than it returns. That cap is disclosed on a sticky footer row: it stays at
  // the foot of the scroller, where it cannot be scrolled out of sight, and it
  // is the one place that says the list is not the whole story.
  const notReturned = Math.max(0, sessionCount - sessions.length)
  const share = (value: number): number => (tokens > 0 ? Math.min(100, (value / tokens) * 100) : 0)

  return (
    <section className={css.section}>
      <div className={css.sectionHead}>
        <h3 className={css.sectionTitle}>{t('sessionUsage')}</h3>
        <span className={css.trendNote}>
          {t('sessionUsageHint', { n: sessionCount })}
          {unknownRequests > 0 && (
            <>
              {' · '}
              {t('unknownRequests', { n: unknownRequests })}
            </>
          )}
        </span>
      </div>
      {/* The scroller owns the frame (border, radius, height): the list inside
          it is unbounded, so the border has to sit on the fixed box or it would
          scroll away with the rows. */}
      <div className={css.sessionScroll} data-dsh-usage-panel-plus-glass="list">
        <ul className={css.sessionList}>
          {sessions.map((session, rank) => {
            const isOpen = open.has(session.session)
            const detailId = `${detailIdBase}-${rank}`
            const percent = share(session.tokens)
            const topModel = session.models[0]
            const name = session.title || shortSessionId(session.session)
            // The row's accent is its dominant model's colour: the same hue the
            // model ring gives that model, so a glance ties the conversation to
            // the series it belongs to.
            const accent = topModel === undefined || colorForModel === undefined
              ? undefined
              : colorForModel(topModel.model)
            return (
              <li key={session.session} className={css.sessionItem}>
                {/* One row-sized button: the whole line is the toggle, and the
                    native button gives Enter/Space for free. The full session id
                    rides `title`, the shortened one is what the row shows when
                    the log carries no title. */}
                <button
                  type="button"
                  className={clsx(css.sessionRow, isOpen && css.sessionRowOpen)}
                  title={session.session}
                  aria-expanded={isOpen}
                  // Only while the list exists: aria-controls must not name a
                  // node that the collapsed state has not rendered.
                  aria-controls={isOpen && session.models.length > 0 ? detailId : undefined}
                  onClick={() => { setOpen((prev) => toggleIn(prev, session.session)) }}
                >
                  <span className={css.modelRank} aria-hidden="true">{rank + 1}</span>
                  <i
                    className={css.sessionSwatch}
                    style={accent === undefined ? undefined : { background: accent }}
                    aria-hidden="true"
                  />
                  <span className={css.sessionMain}>
                    <span className={css.sessionTitle}>{name}</span>
                    {/* The second line carries how the row is ranked and when it
                        last ran; the model name leads it because that is what the
                        expandable detail breaks down. */}
                    <span className={css.sessionSub}>
                      <span className={css.sessionModel}>
                        {topModel === undefined
                          ? '—'
                          : `${modelNameOf(topModel.model)} · ${providerOf(topModel.model)}`}
                      </span>
                      {session.models.length > 1 && (
                        <span className={css.sessionMoreModels}>+{session.models.length - 1}</span>
                      )}
                      <span className={css.sessionDot} aria-hidden="true">·</span>
                      <span>{t('requestsShort')} {session.requests}</span>
                      <span className={css.sessionDot} aria-hidden="true">·</span>
                      <span>{t('turnsShort', { n: session.turns })}</span>
                      <span className={css.sessionDot} aria-hidden="true">·</span>
                      <span>{t('lastActive')} {shortDate(session.lastSeen)}</span>
                    </span>
                  </span>
                  <span className={css.sessionValues}>
                    <span className={css.sessionTokens}>{formatCompact(session.tokens)}</span>
                    {/* ONE meta line instead of two stacked ones: the share
                        percentage and the cache hit rate share a line, both in
                        the meta tier, separated by a middot. Stacked, three
                        numeric lines made every session row as tall as a
                        two-line block for figures that fit side by side. */}
                    <span className={css.sessionMeta}>
                      <span className={css.sessionPct}>{formatPercent(percent)}</span>
                      <span className={css.sessionDot} aria-hidden="true">·</span>
                      <span
                        className={css.sessionHitRate}
                        title={`${t('hitRateLabel')}: ${t('cacheRateHint')}`}
                        aria-label={`${t('hitRateLabel')} ${cacheRateText(session.cacheHit, session.cacheMiss)}`}
                      >
                        <Database size={9} aria-hidden="true" />
                        {t('hitRateShort', { rate: cacheRateText(session.cacheHit, session.cacheMiss) })}
                      </span>
                    </span>
                  </span>
                  <span className={css.sessionChevron} aria-hidden="true">
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </span>
                </button>
                {isOpen && session.models.length > 0 && (
                  <ul className={css.sessionDetail} id={detailId} aria-label={t('sessionTopModels')}>
                    {session.models.map((model) => (
                      <li key={model.model} className={css.sessionDetailRow}>
                        <i
                          className={css.legendSwatch}
                          style={colorForModel === undefined ? undefined : { background: colorForModel(model.model) }}
                        />
                        <span className={css.sessionDetailId}>
                          <span className={css.modelName}>{modelNameOf(model.model)}</span>
                          <span className={css.modelProvider}>{providerOf(model.model)}</span>
                        </span>
                        <span className={css.modelValues}>
                          <span className={css.modelTokens}>{formatCompact(model.tokens)}</span>
                          <span className={css.modelPct}>{formatPercent(model.percent)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
          {notReturned > 0 && (
            <li className={css.sessionTruncated}>
              {t('sessionTruncated', { shown: sessions.length, total: sessionCount })}
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}
