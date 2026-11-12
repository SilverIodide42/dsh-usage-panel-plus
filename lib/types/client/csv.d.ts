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
import type { UsageStatsRange } from '../wire.ts';
/** The UTF-8 byte-order mark. Excel only sniffs UTF-8 (and so only renders
 *  non-ASCII titles correctly) when the file starts with this; without it the
 *  CSV opens as mojibake under the default system code page. */
export declare const CSV_BOM = "\uFEFF";
/** Every column, in the order the sheet shows them. The per-scope shapes are
 *  subsets of this list (see the {@link CSV_ROW_FIELDS} table below). */
export declare const CSV_COLUMNS: readonly ["scope", "from", "to", "tokens", "requests", "turns", "sessionCount", "activeDays", "cacheHit", "cacheMiss", "day", "total", "model", "provider", "percent", "session", "title", "lastSeen", "topModel"];
export type CsvColumn = (typeof CSV_COLUMNS)[number];
export type CsvScope = 'summary' | 'day' | 'model' | 'provider' | 'session';
/**
 * Build the CSV text for one aggregate (BOM NOT included — the caller prefixes
 * it at download time; see {@link CSV_BOM}).
 * @param stats - the range aggregate the panel currently renders.
 * @returns the CSV body, rows separated by CRLF (the line ending Excel and
 *   every Windows spreadsheet expects).
 */
export declare function buildCsv(stats: UsageStatsRange): string;
/** The download name for one aggregate: `dsh-usage-<from>_<to>.csv`. The
 *  range is already ISO (`YYYY-MM-DD`), so the name sorts chronologically. */
export declare function csvFileName(stats: Pick<UsageStatsRange, 'from' | 'to'>): string;
/** The MIME type of the exported file. The charset declaration is what makes
 *  the browser hand Excel a UTF-8 document even on a locale-default code page. */
export declare const CSV_MIME = "text/csv;charset=utf-8";
