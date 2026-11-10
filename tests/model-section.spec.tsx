/**
 * The per-model section's row anatomy and its own expansion. The colour
 * assignment has its own suite; this one pins structure the provider section
 * mirrors one dimension up: ranked rows carry a rank number and Other does
 * not, Other opens the models it folded (ONE level — the provider section is
 * the one with two), and its detail wrapper is a SIBLING of the row it
 * belongs to, so opening it leaves the ring beside it untouched.
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { clearRangeCache } from '../src/client/api.ts'
import { UsageStatsSection, type UsageStatsSectionProps } from '../src/client/index.tsx'
import type { UsageStatsRange } from '../src/wire.ts'

const t = ((key: string) => key) as unknown as UsageStatsSectionProps['t']

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  // Each test's `fetch` stub stands for a different range (one of them adds
  // per-model cache buckets): a range the previous test read must not answer
  // this one from the 20 s TTL cache.
  clearRangeCache()
})

/** Eleven models: the top ten are rank rows, m11 folds into the gray Other. */
const range: UsageStatsRange = {
  from: '2026-08-01',
  to: '2026-08-24',
  tokens: 6600,
  requests: 3,
  turns: 2,
  cacheHit: 100,
  cacheMiss: 50,
  activeDays: 2,
  topModel: 'm01',
  topProvider: 'p1',
  granularity: 'day',
  // The session dimension and the comparison window complete the wire shape;
  // an empty one keeps these fixtures focused on what they measure.
  sessionCount: 0,
  sessions: [],
  unknownRequests: 0,
  previous: null,
  daily: [],
  models: Array.from({ length: 11 }, (_, i) => ({
    model: `m${String(i + 1).padStart(2, '0')}`,
    provider: 'p1',
    tokens: (11 - i) * 100,
    percent: 0,
  })),
  providers: [{ provider: 'p1', tokens: 6600, percent: 100 }],
}

/** The model section, located by its heading (class names are hashed). */
function modelSection(container: HTMLElement): HTMLElement {
  const section = Array.from(container.querySelectorAll('section'))
    .find((el) => el.querySelector('h3')?.textContent === 'modelUsage')
  if (section === undefined || section === null) throw new Error('model section missing')
  return section as HTMLElement
}

/** Direct children of the list only (the provider section nests detail rows one
 *  list deeper, and this helper is shared with nothing else). */
function topRows(section: HTMLElement): HTMLElement[] {
  return Array.from(section.querySelectorAll('ul[class*="modelList"] > li[class*="modelRow"]'))
}

async function renderPanel(value: UsageStatsRange = range) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => ({ ok: true, value }),
  } as unknown as Response)))
  const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
  await waitFor(() => {
    expect(container.querySelector('svg[aria-label="modelUsage"] [role="img"][aria-label]')).not.toBeNull()
  })
  return container
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('model usage section', () => {
  it('gives every model its own numbered row — there is no Other bucket', async () => {
    // The fixture has eleven models. An earlier revision showed ten ranked rows
    // plus a gray "Other" that had to be opened to see the eleventh; now all
    // eleven are rows, numbered straight through, and nothing is called "Other".
    const container = await renderPanel()
    const section = modelSection(container)
    const rows = topRows(section)
    expect(rows.length).toBe(11)

    const ranks = rows.map((row) => row.querySelector('[class*="modelRank"]')?.textContent)
    expect(ranks).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
    // Nothing in the list is labelled "Other", and the last-ranked model is
    // visible without opening anything.
    const names = topRows(section).map((row) => row.querySelector('[class*="modelName"]')?.textContent)
    expect(names).not.toContain('other')
    expect(names).toContain('m11')
  })

  it('has no expandable row at all in the model list', async () => {
    // Every model is already on screen, so there is nothing left to fold open:
    // no toggle buttons, no accordion wrappers.
    const container = await renderPanel()
    const section = modelSection(container)
    expect(section.querySelectorAll('ul[class*="modelList"] button[aria-expanded]').length).toBe(0)
    expect(section.querySelectorAll('ul[class*="modelList"] ul').length).toBe(0)
  })

  it('reports each row\u2019s own cache hit rate where the share bar used to be', async () => {
    // The share bar is GONE: it restated the percentage printed on the same
    // row. Its slot now carries the hit rate, which the row could not state
    // before. No bar may survive in the list.
    const container = await renderPanel()
    const section = modelSection(container)
    const rows = topRows(section)
    expect(section.querySelector('span[class*="modelShare"]')).toBeNull()
    for (const row of rows) {
      const rate = row.querySelector('span[class*="modelHitRate"]')
      expect(rate, row.textContent ?? '').not.toBeNull()
    }
  })

  it('renders "no rate" rather than 0% when the host sends no cache figures', async () => {
    // This fixture's models carry no cacheHit/cacheMiss (the older host shape):
    // a fabricated 0% would claim the cache never served these models, so the
    // row states that it has no rate instead.
    const container = await renderPanel()
    const section = modelSection(container)
    const rates = Array.from(section.querySelectorAll('span[class*="modelHitRate"]'))
      .map((el) => el.textContent ?? '')
    expect(rates.length).toBeGreaterThan(0)
    for (const text of rates) expect(text).toBe('hitRateNone')
  })

  it('renders the rate once the host sends the cache buckets', async () => {
    // Same section, a host that DOES send per-model cache figures: 4000 cached
    // against 6000 uncached is a 40.0% hit rate. This suite's translator
    // returns keys verbatim, so the assertion is on WHICH key rendered — the
    // substituted figure needs a substituting translator and is covered in
    // session-usage.spec.tsx.
    const withCache: UsageStatsRange = {
      ...range,
      models: range.models.map((m, i) => (i === 0 ? { ...m, cacheHit: 4_000, cacheMiss: 6_000 } : m)),
    }
    const container = await renderPanel(withCache)
    const section = modelSection(container)
    const firstRate = topRows(section)[0]!.querySelector('span[class*="modelHitRate"]')
    expect(firstRate?.textContent ?? '').toContain('hitRateShort')
  })

  it('prints the token volume compact, like the session list and the ring centre', async () => {
    // The rows used to print the exact separator-formatted count (e.g.
    // "345,579,781") while the ring's centre and the session rows printed the
    // compact form. One form for one quantity; the exact figure stays in the
    // hover tip.
    const container = await renderPanel()
    const section = modelSection(container)
    const tokens = Array.from(section.querySelectorAll('ul[class*="modelList"] span[class*="modelTokens"]'))
      .map((el) => el.textContent ?? '')
    expect(tokens.length).toBeGreaterThan(0)
    for (const text of tokens) {
      expect(text, text).toMatch(/^[\d.]+[BMK]?$/u)
      expect(text, text).not.toContain(',')
    }
  })

  it('states the ordering rule in the section head', async () => {
    const container = await renderPanel()
    const section = modelSection(container)
    const head = section.querySelector('div[class*="sectionHead"]')
    expect(head).not.toBeNull()
    expect(head!.querySelector('h3')?.textContent).toBe('modelUsage')
    // One muted note beside the title. This fixture's translator returns keys
    // verbatim, so the note is asserted by its key rather than by rendered
    // copy — that the copy interpolates the count is covered in
    // session-usage.spec.tsx, which uses a substituting translator.
    expect(head!.textContent).toContain('modelUsageHint')
  })
})
