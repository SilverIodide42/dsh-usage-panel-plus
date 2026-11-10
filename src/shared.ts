/**
 * Pure helpers shared by the host aggregation layer and the browser panel.
 * This module MUST stay free of Node.js and DOM types and carry zero
 * imports: both halves import it at runtime (the client bundle-purity gate
 * rejects Node builtins, and a value import of `wire.ts` would drag the
 * host-only HTTP helpers — including `Buffer` — into the browser bundle).
 */

/** Local calendar day key, e.g. "2026-08-02" (no UTC shift). */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Local calendar hour key, e.g. "2026-08-02T07" (no UTC shift). */
export function hourKey(ts: number): string {
  const d = new Date(ts)
  return `${dayKey(ts)}T${String(d.getHours()).padStart(2, '0')}`
}

/** All local-calendar day keys in [from, to], inclusive. Invalid or reversed
 *  bounds yield an empty list. */
export function daysInRange(from: string, to: string): string[] {
  const out: string[] = []
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return out
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${day}`)
  }
  return out
}

/** model refs are "provider/model"; a bare model name has no slash and is
 *  attributed to provider "default". */
export function providerOf(modelRef: string): string {
  const i = modelRef.indexOf('/')
  if (i > 0) return modelRef.slice(0, i)
  return 'default'
}

/** The display name of a model ref: the part after the provider slash
 *  ("deepseek-chat" of "deepseek/deepseek-chat"); a bare name is unchanged. */
export function modelNameOf(modelRef: string): string {
  const i = modelRef.indexOf('/')
  if (i > 0) return modelRef.slice(i + 1)
  return modelRef
}

/** Shift a `YYYY-MM-DD` local calendar day key by whole days (negative =
 *  past). Used to derive the comparison window immediately before a range.
 *  The anchor is local noon so a DST transition (not a concern in the host's
 *  Asia/Shanghai zone, but the helper stays honest elsewhere) can never move
 *  the result onto the neighbouring day. */
export function shiftDayKey(day: string, delta: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (match === null) return day
  const base = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  base.setDate(base.getDate() + delta)
  return dayKey(base.getTime())
}
