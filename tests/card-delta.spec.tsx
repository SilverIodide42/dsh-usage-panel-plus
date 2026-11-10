/**
 * The period-over-period badge under a summary card.
 *
 * The rule this pins: a badge carries a NUMBER or it does not render. The `new`
 * direction (the previous window held nothing, so there is no ratio) used to
 * print "+ 新增" / "+ New" — a badge stating no figure. Every card whose prior
 * window was empty wore the same word, so the row of deltas stopped being a
 * column of comparable percentages and became a mix of numbers and prose. The
 * absent badge now says the same thing silently, and the hover title still
 * explains what is being compared.
 *
 * `compareChange` itself is unchanged: `new` is still a real direction the
 * callers compute and filter on (the session card depends on it).
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { clearRangeCache } from '../src/client/api.ts'
import { compareChange } from '../src/client/format.ts'
import { UsageStatsSection, type UsageStatsSectionProps } from '../src/client/index.tsx'
import { en } from '../src/client/locales.ts'
import type { UsageStatsRange } from '../src/wire.ts'

/** The locale source, for asserting the retired key is gone for good. */
const SRC_LOCALES = readFileSync(join(__dirname, '..', 'src', 'client', 'locales.ts'), 'utf8')

const t = ((key: string, params?: Record<string, unknown>) => {
  let text = (en as Record<string, string>)[key] ?? key
  for (const [name, value] of Object.entries(params ?? {})) text = text.split(`{${name}}`).join(String(value))
  return text
}) as unknown as UsageStatsSectionProps['t']

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

/** A range with real volume and NO comparison window: every card that derives a
 *  delta from `previous` must stay silent. */
const NO_PREVIOUS: UsageStatsRange = {
  from: '2026-08-01',
  to: '2026-08-02',
  tokens: 1_000,
  requests: 4,
  turns: 2,
  cacheHit: 600,
  cacheMiss: 400,
  activeDays: 2,
  topModel: 'p1/m1',
  topProvider: 'p1',
  granularity: 'day',
  daily: [
    { day: '2026-08-01', total: 600, byModel: { 'p1/m1': 600 }, byProvider: { p1: 600 }, requests: 2, turns: 1, cacheHit: 400, cacheMiss: 200 },
    { day: '2026-08-02', total: 400, byModel: { 'p1/m1': 400 }, byProvider: { p1: 400 }, requests: 2, turns: 1, cacheHit: 200, cacheMiss: 200 },
  ],
  models: [{ model: 'p1/m1', provider: 'p1', tokens: 1_000, percent: 100, cacheHit: 600, cacheMiss: 400 }],
  providers: [{ provider: 'p1', tokens: 1_000, percent: 100 }],
  sessionCount: 1,
  sessions: [{
    session: 'session-aaaa1111bbbb',
    title: 'Only conversation',
    tokens: 1_000,
    requests: 4,
    turns: 2,
    cacheHit: 600,
    cacheMiss: 400,
    firstSeen: 0,
    lastSeen: 0,
    models: [{ model: 'p1/m1', provider: 'p1', tokens: 1_000, percent: 100 }],
  }],
  unknownRequests: 0,
  previous: null,
}

/** The same range with an all-zero previous window: `compareChange` reports
 *  `new` for every figure (no ratio exists), which is the case that used to
 *  print a word instead of a number. */
const ZERO_PREVIOUS: UsageStatsRange = {
  ...NO_PREVIOUS,
  previous: { tokens: 0, requests: 0, turns: 0, sessions: 0, activeDays: 0, cacheHit: 0, cacheMiss: 0 },
}

const ok = (value: unknown): Response => ({ ok: true, json: async () => ({ ok: true, value }) } as unknown as Response)

async function renderWith(value: UsageStatsRange): Promise<HTMLElement> {
  vi.stubGlobal('fetch', vi.fn(async () => ok(value)))
  const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
  await act(async () => { await new Promise((resolve) => { setTimeout(resolve, 0) }) })
  return container
}

const badges = (container: HTMLElement): Element[] =>
  Array.from(container.querySelectorAll('[class*="cardDelta"]'))

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  clearRangeCache()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('card delta badges', () => {
  it('renders no badge at all when there is no previous window', async () => {
    const container = await renderWith(NO_PREVIOUS)
    expect(badges(container)).toHaveLength(0)
  })

  it('renders no badge when the previous window was empty (the old "+ New")', async () => {
    // This is the exact case that used to render "+ 新增": every figure's
    // comparison is `new`, and none of them may become a word.
    const container = await renderWith(ZERO_PREVIOUS)
    expect(badges(container)).toHaveLength(0)
    // The retired copy is gone from the dictionaries, and nothing in the panel
    // may still print a leading plus.
    const text = container.textContent ?? ''
    expect(SRC_LOCALES).not.toContain('newValue')
    expect(text).not.toContain('+')
  })

  it('still renders a real percentage when a previous window exists', async () => {
    const withPrevious: UsageStatsRange = {
      ...NO_PREVIOUS,
      // Half the current volume: every numeric card reads ↑ 100.0%.
      previous: { tokens: 500, requests: 2, turns: 1, sessions: 1, activeDays: 1, cacheHit: 300, cacheMiss: 200 },
    }
    const container = await renderWith(withPrevious)
    const found = badges(container)
    expect(found.length).toBeGreaterThan(0)
    for (const badge of found) {
      // A number, never prose: every badge ends in a percent sign.
      expect(badge.textContent ?? '').toMatch(/%$/u)
    }
  })

  it('keeps the direction arrows off the "new" path', () => {
    // compareChange is unchanged — `new` is still computed, it is the RENDERING
    // that stays silent. The session card depends on the direction existing.
    expect(compareChange(10, 0)).toEqual({ direction: 'new', percent: 0 })
    expect(compareChange(0, 0)).toBeNull()
  })
})
