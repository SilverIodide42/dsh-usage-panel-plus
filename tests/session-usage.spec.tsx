/**
 * The session dimension and the panel features added on top of 0.3.4.
 *
 * The session section is the panel's per-conversation view, so its structure is
 * pinned here (title fallback to a short id, dominant-model accent, the bottom
 * share bar, folded tail) together with its PLACE on the page: it CLOSES the
 * panel, after the model and provider summaries — the deepest drill-down comes
 * last.
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { clearRangeCache } from '../src/client/api.ts'
import { compareSessions, shortDate, shortSessionId } from '../src/client/format.ts'
import { UsageStatsSection, type UsageStatsSectionProps } from '../src/client/index.tsx'
import { en } from '../src/client/locales.ts'
import type { SessionTokenUsage, UsageStatsRange } from '../src/wire.ts'

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

const DAY_ONE = new Date(2026, 7, 23, 9, 0, 0).getTime()
const DAY_TWO = new Date(2026, 7, 24, 10, 30, 0).getTime()

function session(overrides: Partial<SessionTokenUsage> & Pick<SessionTokenUsage, 'session' | 'tokens'>): SessionTokenUsage {
  return {
    title: '',
    requests: 1,
    turns: 1,
    cacheHit: 0,
    cacheMiss: 0,
    firstSeen: DAY_ONE,
    lastSeen: DAY_TWO,
    models: [],
    ...overrides,
  }
}

const RANGE: UsageStatsRange = {
  from: '2026-08-01',
  to: '2026-08-26',
  tokens: 10_000,
  requests: 20,
  turns: 7,
  cacheHit: 4_000,
  cacheMiss: 6_000,
  activeDays: 3,
  topModel: 'p1/m1',
  topProvider: 'p1',
  granularity: 'day',
  daily: [
    { day: '2026-08-23', total: 6_000, byModel: { 'p1/m1': 5_000, 'p2/m2': 1_000 }, byProvider: { p1: 5_000, p2: 1_000 }, requests: 12, turns: 4, cacheHit: 2_500, cacheMiss: 3_500 },
    { day: '2026-08-24', total: 4_000, byModel: { 'p1/m1': 3_000, 'p2/m2': 1_000 }, byProvider: { p1: 3_000, p2: 1_000 }, requests: 8, turns: 3, cacheHit: 1_500, cacheMiss: 2_500 },
  ],
  models: [
    { model: 'p1/m1', provider: 'p1', tokens: 8_000, percent: 80 },
    { model: 'p2/m2', provider: 'p2', tokens: 2_000, percent: 20 },
  ],
  providers: [
    { provider: 'p1', tokens: 8_000, percent: 80 },
    { provider: 'p2', tokens: 2_000, percent: 20 },
  ],
  sessionCount: 3,
  sessions: [
    session({
      session: 'session-aaaa1111bbbb',
      title: 'Fix the parser, "quoted"',
      tokens: 5_000,
      requests: 10,
      turns: 4,
      lastSeen: DAY_TWO,
      cacheHit: 4_000,
      cacheMiss: 6_000,
      models: [
        { model: 'p1/m1', provider: 'p1', tokens: 4_000, percent: 80 },
        { model: 'p2/m2', provider: 'p2', tokens: 1_000, percent: 20 },
      ],
    }),
    session({
      session: 'session-bbbb2222cccc',
      tokens: 3_000,
      requests: 6,
      turns: 2,
      lastSeen: DAY_ONE,
      models: [{ model: 'p1/m1', provider: 'p1', tokens: 3_000, percent: 100 }],
    }),
    session({ session: 'session-cccc3333dddd', title: 'Refactor the store', tokens: 2_000, requests: 4, turns: 1, lastSeen: 0 }),
  ],
  unknownRequests: 2,
  previous: { tokens: 8_000, requests: 16, turns: 6, sessions: 2, activeDays: 2, cacheHit: 2_000, cacheMiss: 4_000 },
}

const ok = (value: unknown): Response => ({ ok: true, json: async () => ({ ok: true, value }) } as unknown as Response)

function stubFetch(value: UsageStatsRange = RANGE): { calls: string[] } {
  const calls: string[] = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const body = init?.body === undefined ? undefined : JSON.parse(String(init.body)) as { range?: string }
    calls.push(`${url}|${body?.range ?? ''}`)
    return ok(value)
  }))
  return { calls }
}

const settle = async (): Promise<void> => {
  await act(async () => { await new Promise((resolve) => { setTimeout(resolve, 0) }) })
}

function sessionSection(container: HTMLElement): HTMLElement {
  const section = Array.from(container.querySelectorAll('section'))
    .find((el) => el.querySelector('h3')?.textContent === 'Session usage')
  if (section === undefined || section === null) throw new Error('session usage section missing')
  return section as HTMLElement
}

function sessionRows(section: HTMLElement): HTMLButtonElement[] {
  return Array.from(section.querySelectorAll('ul[class*="sessionList"] button[class*="sessionRow"]')) as HTMLButtonElement[]
}

/** The fixed-height viewport the rows scroll inside. */
function scroller(container: HTMLElement): HTMLElement | null {
  return container.querySelector('div[class*="sessionScroll"]') as HTMLElement | null
}

function rowNamed(section: HTMLElement, text: string): HTMLButtonElement {
  const row = sessionRows(section).find((el) => (el.textContent ?? '').includes(text))
  if (row === undefined) throw new Error(`session row ${text} missing`)
  return row
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  clearRangeCache()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('session usage section', () => {
  it('renders one row per session with the titled/short-id anatomy and shares', async () => {
    stubFetch()
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()

    const section = sessionSection(container)
    const rows = sessionRows(section)
    expect(rows).toHaveLength(3)

    const first = rows[0]!
    expect(first.textContent).toContain('1')
    expect(first.textContent).toContain('Fix the parser, "quoted"')
    expect(first.textContent).toContain('m1 · p1')
    expect(first.textContent).toContain('5.0K')
    expect(first.textContent).toContain('50.0%')
    // The share bar is gone (it only restated the percentage above it); the
    // row's own cache hit rate took its place, as a bare percentage introduced
    // by a cache glyph — the label lives in the tooltip and the aria-label.
    // This fixture's first session carries cacheHit 4000 / cacheMiss 6000,
    // i.e. a 40.0% hit rate.
    expect(first.querySelector('span[class*="sessionShare"]')).toBeNull()
    const rate = first.querySelector('span[class*="sessionHitRate"]')
    expect(rate).not.toBeNull()
    expect(rate!.textContent).toBe('40.0%')
    expect(rate!.getAttribute('aria-label')).toContain('40.0%')
    expect(rate!.querySelector('svg')).not.toBeNull()
    // Requests, turns and the last-seen day ride the same row.
    expect(first.textContent).toContain('Requests 10')
    expect(first.textContent).toContain('4 turns')
    expect(first.textContent).toContain(`Last active ${shortDate(DAY_TWO)}`)

    // No title: the short session id stands in, and the full id is the tooltip.
    const untitled = rows[1]!
    expect(untitled.textContent).toContain(shortSessionId('session-bbbb2222cccc'))
    expect(untitled.getAttribute('title')).toBe('session-bbbb2222cccc')

    // No sample in range: the em dash, never NaN/Invalid Date.
    expect(rows[2]!.textContent).toContain('Last active —')

    // The section head states the exact total, the coverage caveat and the
    // unattributed share. It deliberately does NOT claim how the rows are
    // ordered: the descending token column already shows that.
    expect(section.textContent).toContain('3 sessions · only conversations whose logs still exist')
    expect(section.textContent).not.toContain('Sorted by tokens')
    expect(section.textContent).toContain('2 requests without model attribution')
  })

  it('signals a session with more models than the one it names', async () => {
    stubFetch()
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()
    const rows = sessionRows(sessionSection(container))
    // The first session splits across two models; the other two name one each,
    // so only the first carries the "+N" badge.
    expect(rows[0]!.textContent).toContain('+1')
    expect(rows[1]!.textContent).not.toContain('+1')
  })

  it('closes the panel, after the model and provider summaries', async () => {
    stubFetch()
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()
    const titles = Array.from(container.querySelectorAll('h3')).map((el) => el.textContent)
    expect(titles).toEqual([
      'Activity heatmap',
      'Daily token trend',
      'Model usage',
      'Provider usage',
      'Session usage',
    ])
    // The session section is the LAST section on the page.
    const sections = Array.from(container.querySelectorAll('section'))
    const last = sections[sections.length - 1]!
    expect(last.querySelector('h3')?.textContent).toBe('Session usage')
  })

  it('expands a session into its own model split, and collapses again', async () => {
    stubFetch()
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()

    const first = rowNamed(sessionSection(container), 'Fix the parser')
    expect(first.getAttribute('aria-expanded')).toBe('false')
    expect(sessionSection(container).textContent).not.toContain('80.0%')

    fireEvent.click(first)
    expect(first.getAttribute('aria-expanded')).toBe('true')
    const detailId = first.getAttribute('aria-controls')
    expect(detailId).not.toBeNull()
    const detail = container.querySelector('ul[class*="sessionDetail"]') as HTMLElement | null
    expect(detail).not.toBeNull()
    expect(detail!.id).toBe(detailId)
    expect(detail!.textContent).toContain('m1')
    expect(detail!.textContent).toContain('p1')
    expect(detail!.textContent).toContain('80.0%')
    expect(detail!.textContent).toContain('20.0%')

    fireEvent.click(first)
    expect(first.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('ul[class*="sessionDetail"]')).toBeNull()
  })

  it('renders every returned row inside a fixed-height scroller, with no fold row', async () => {
    // The section no longer caps itself: the scroller is the cap, so a long
    // range must render ALL rows and let the viewport do the hiding. A fold row
    // on top of a scroller would hide rows behind two different gestures.
    const many: SessionTokenUsage[] = Array.from({ length: 25 }, (_, i) => session({
      session: `session-${String(i).padStart(4, '0')}ffff`,
      title: `Conversation ${i + 1}`,
      tokens: 100,
      lastSeen: DAY_TWO,
    }))
    stubFetch({ ...RANGE, sessionCount: 25, sessions: many, tokens: 2_500, unknownRequests: 0 })
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()

    const section = sessionSection(container)
    expect(sessionRows(section)).toHaveLength(25)
    const viewport = scroller(container)
    expect(viewport).not.toBeNull()
    // The frame and the viewport are one box, and the list sits inside it.
    expect(viewport!.contains(section.querySelector('ul[class*="sessionList"]'))).toBe(true)
    // No "other N sessions" control anywhere: scrolling reaches the tail.
    expect(screen.queryByRole('button', { name: /Other .* sessions/ })).toBeNull()
    // Nothing was truncated, so no disclosure row either.
    expect(container.querySelector('[class*="sessionTruncated"]')).toBeNull()
  })

  it('discloses the host cap when the response returns fewer rows than the count', async () => {
    // The host caps at 200 rows; `sessionCount` stays exact. The section must
    // say so rather than present a truncated list as complete.
    const many: SessionTokenUsage[] = Array.from({ length: 20 }, (_, i) => session({
      session: `session-${String(i).padStart(4, '0')}ffff`,
      title: `Conversation ${i + 1}`,
      tokens: 100,
      lastSeen: DAY_TWO,
    }))
    stubFetch({ ...RANGE, sessionCount: 220, sessions: many, tokens: 2_000, unknownRequests: 0 })
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()

    expect(sessionRows(sessionSection(container))).toHaveLength(20)
    const note = container.querySelector('[class*="sessionTruncated"]') as HTMLElement | null
    expect(note).not.toBeNull()
    expect(note!.textContent).toBe('Showing the top 20 of 220 sessions')
    // The honest total still leads the section head.
    expect(sessionSection(container).textContent).toContain('220 sessions')
  })

  it('renders no section at all for a range without sessions', async () => {
    stubFetch({ ...RANGE, sessionCount: 0, sessions: [], unknownRequests: 0 })
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()
    expect(container.querySelector('ul[class*="sessionList"]')).toBeNull()
    expect(Array.from(container.querySelectorAll('h3')).map((el) => el.textContent)).not.toContain('Session usage')
  })
})

describe('sessions card', () => {
  it('shows the real session count with the turn total as its subtitle', async () => {
    stubFetch()
    const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
    await settle()
    const label = Array.from(container.querySelectorAll('[class*="cardLabel"]')).find((el) => el.textContent === 'Sessions')
    const card = label?.closest('[data-dsh-usage-panel-plus-glass="card"]') as HTMLElement
    expect(card.textContent).toContain('3')
    expect(card.textContent).toContain('7 turns')
  })
})

describe('compareSessions', () => {
  const prev = (over: Partial<NonNullable<UsageStatsRange['previous']>>) => ({
    tokens: 0,
    requests: 0,
    turns: 0,
    sessions: 0,
    activeDays: 0,
    cacheHit: 0,
    cacheMiss: 0,
    ...over,
  })

  it('compares normally when the previous window has session rows', () => {
    expect(compareSessions(10, prev({ tokens: 100, sessions: 5 }))).toEqual({ direction: 'up', percent: 100 })
  })

  it('renders no badge when the previous window has volume but no session rows', () => {
    // The session dimension could not be reconstructed there (logs deleted):
    // "new" would be a lie, so the card shows no delta at all.
    expect(compareSessions(32, prev({ tokens: 29_210_412, sessions: 0 }))).toBeNull()
  })

  it('still reports new when the previous window was genuinely empty', () => {
    expect(compareSessions(3, prev({ tokens: 0, sessions: 0 }))).toEqual({ direction: 'new', percent: 0 })
  })

  it('renders nothing without a comparison window', () => {
    expect(compareSessions(3, null)).toBeNull()
  })
})
