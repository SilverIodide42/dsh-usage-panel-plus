/**
 * CSV export of one range aggregate.
 *
 * The panel shows four sections plus the session drill-down; the export keeps
 * them in ONE table so a spreadsheet can filter or pivot the whole range
 * without stitching files: a `scope` column says which shape each row is
 * (`summary` / `day` / `model` / `provider` / `session`), and the remaining
 * columns are the union of those shapes — a cell that does not apply to a row
 * is simply empty.
 *
 * Everything here is pure: the panel owns the Blob/anchor download, this
 * module owns the bytes. Column names stay English and stable (they are a
 * machine contract, not UI copy); only cell VALUES carry user data.
 */
import type { UsageStatsRange } from '../wire.ts'
import { dateTimeText } from './format.ts'

/** The UTF-8 byte-order mark. Excel only sniffs UTF-8 (and so only renders
 *  non-ASCII titles correctly) when the file starts with this; without it the
 *  CSV opens as mojibake under the default system code page. */
export const CSV_BOM = '\ufeff'

/** Every column, in the order the sheet shows them. The per-scope shapes are
 *  subsets of this list (see the {@link CSV_ROW_FIELDS} table below). */
export const CSV_COLUMNS = [
  // Which shape this row is.
  'scope',
  // summary
  'from',
  'to',
  'tokens',
  'requests',
  'turns',
  'sessionCount',
  'activeDays',
  'cacheHit',
  'cacheMiss',
  // day
  'day',
  'total',
  // model / provider / session
  'model',
  'provider',
  'percent',
  'session',
  'title',
  'lastSeen',
  'topModel',
] as const

export type CsvColumn = (typeof CSV_COLUMNS)[number]
export type CsvScope = 'summary' | 'day' | 'model' | 'provider' | 'session'

/** The columns each scope fills. Kept as data (not code) so the export and
 *  the tests read the same contract. */
const CSV_ROW_FIELDS: Record<CsvScope, readonly CsvColumn[]> = {
  summary: ['from', 'to', 'tokens', 'requests', 'turns', 'sessionCount', 'activeDays', 'cacheHit', 'cacheMiss'],
  day: ['day', 'total', 'requests', 'turns', 'cacheHit', 'cacheMiss'],
  model: ['model', 'provider', 'tokens', 'percent'],
  provider: ['provider', 'tokens', 'percent'],
  session: ['session', 'title', 'tokens', 'requests', 'turns', 'lastSeen', 'topModel'],
}

/** One row's cell values; a missing column renders as an empty cell. */
type RowValues = Partial<Record<CsvColumn, string | number | null | undefined>>

/** Render one cell, quoting it when it carries a delimiter, a quote or a line
 *  break — Excel's own CSV dialect (RFC 4180): double the quotes, wrap the
 *  cell. Titles routinely carry commas and quotes, so this is not optional. */
function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** One data row: the scope, then every column in {@link CSV_COLUMNS} order.
 *  A value the scope does not own is dropped even if the caller passed it, so
 *  a shape mistake can never widen a row. */
function row(scope: CsvScope, values: RowValues): string {
  const owned = new Set<CsvColumn>(CSV_ROW_FIELDS[scope])
  return CSV_COLUMNS
    .map((column) => (column === 'scope' ? scope : owned.has(column) ? values[column] : undefined))
    .map(cell)
    .join(',')
}

/** A percentage rounded to one decimal: the same precision the UI shows,
 *  kept numeric so a spreadsheet can average the column. */
function percentValue(percent: number): string {
  if (!Number.isFinite(percent)) return ''
  return String(Math.round(percent * 10) / 10)
}

/**
 * Build the CSV text for one aggregate (BOM NOT included — the caller prefixes
 * it at download time; see {@link CSV_BOM}).
 * @param stats - the range aggregate the panel currently renders.
 * @returns the CSV body, rows separated by CRLF (the line ending Excel and
 *   every Windows spreadsheet expects).
 */
export function buildCsv(stats: UsageStatsRange): string {
  const lines: string[] = [CSV_COLUMNS.join(',')]

  // The totals row comes first: a spreadsheet's first data row should answer
  // "what is this file about" before the detail rows start.
  lines.push(row('summary', {
    from: stats.from,
    to: stats.to,
    tokens: stats.tokens,
    requests: stats.requests,
    turns: stats.turns,
    sessionCount: stats.sessionCount,
    activeDays: stats.activeDays,
    cacheHit: stats.cacheHit,
    cacheMiss: stats.cacheMiss,
  }))

  for (const bucket of stats.daily) {
    lines.push(row('day', {
      day: bucket.day,
      total: bucket.total,
      requests: bucket.requests,
      turns: bucket.turns,
      cacheHit: bucket.cacheHit,
      cacheMiss: bucket.cacheMiss,
    }))
  }

  for (const model of stats.models) {
    lines.push(row('model', {
      model: model.model,
      provider: model.provider,
      tokens: model.tokens,
      percent: percentValue(model.percent),
    }))
  }

  for (const provider of stats.providers) {
    lines.push(row('provider', {
      provider: provider.provider,
      tokens: provider.tokens,
      percent: percentValue(provider.percent),
    }))
  }

  for (const session of stats.sessions ?? []) {
    lines.push(row('session', {
      session: session.session,
      title: session.title,
      tokens: session.tokens,
      requests: session.requests,
      turns: session.turns,
      lastSeen: dateTimeText(session.lastSeen),
      topModel: session.models[0]?.model ?? '',
    }))
  }

  return lines.join('\r\n')
}

/** The download name for one aggregate: `dsh-usage-<from>_<to>.csv`. The
 *  range is already ISO (`YYYY-MM-DD`), so the name sorts chronologically. */
export function csvFileName(stats: Pick<UsageStatsRange, 'from' | 'to'>): string {
  return `dsh-usage-${stats.from}_${stats.to}.csv`
}

/** The MIME type of the exported file. The charset declaration is what makes
 *  the browser hand Excel a UTF-8 document even on a locale-default code page. */
export const CSV_MIME = 'text/csv;charset=utf-8'
