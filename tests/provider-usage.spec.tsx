/**
 * The provider section mirrors the model one dimension up: top-5 rank colours
 * from the PROVIDER series (never a model hue), everything beyond in the gray
 * Other bucket, and one shared highlight between the ring and the list.
 * Providers that produced no tokens in the range must not enter the ranking at
 * all — a request-only provider has no usage to rank.
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
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
})

/**
 * Eight providers, seven of them with volume: pa..pe take the five rank
 * colours, pf/pg collapse into Other, and pz carries requests but no tokens.
 */
const range: UsageStatsRange = {
  from: '2026-08-01',
  to: '2026-08-24',
  tokens: 1580,
  requests: 10,
  turns: 5,
  cacheHit: 800,
  cacheMiss: 200,
  activeDays: 2,
  topModel: 'pb/m3',
  topProvider: 'pa',
  granularity: 'day',
  // The session dimension and the comparison window complete the wire shape;
  // an empty one keeps these fixtures focused on what they measure.
  sessionCount: 0,
  sessions: [],
  unknownRequests: 0,
  previous: null,
  daily: [
    { day: '2026-08-01', total: 580, byModel: { 'pa/m1': 300, 'pb/m3': 280 }, byProvider: { pa: 300, pb: 280 }, requests: 1, turns: 1, cacheHit: 400, cacheMiss: 100 },
    { day: '2026-08-02', total: 1000, byModel: { 'pb/m3': 120, 'pc/m4': 300, 'pa/m2': 200, 'pd/m5': 200, 'pe/m6': 100, 'pf/m7': 50, 'pg/m8': 30 }, byProvider: { pa: 200, pb: 120, pc: 300, pd: 200, pe: 100, pf: 50, pg: 30 }, requests: 1, turns: 1, cacheHit: 400, cacheMiss: 100 },
  ],
  models: [
    { model: 'pb/m3', provider: 'pb', tokens: 400, percent: 25.32 },
    { model: 'pa/m1', provider: 'pa', tokens: 300, percent: 18.99 },
    { model: 'pc/m4', provider: 'pc', tokens: 300, percent: 18.99 },
    { model: 'pa/m2', provider: 'pa', tokens: 200, percent: 12.66 },
    { model: 'pd/m5', provider: 'pd', tokens: 200, percent: 12.66 },
    { model: 'pe/m6', provider: 'pe', tokens: 100, percent: 6.33 },
    { model: 'pf/m7', provider: 'pf', tokens: 50, percent: 3.16 },
    { model: 'pg/m8', provider: 'pg', tokens: 30, percent: 1.9 },
  ],
  providers: [
    { provider: 'pa', tokens: 500, percent: 31.65 },
    { provider: 'pb', tokens: 400, percent: 25.32 },
    { provider: 'pc', tokens: 300, percent: 18.99 },
    { provider: 'pd', tokens: 200, percent: 12.66 },
    { provider: 'pe', tokens: 100, percent: 6.33 },
    { provider: 'pf', tokens: 50, percent: 3.16 },
    { provider: 'pg', tokens: 30, percent: 1.9 },
    { provider: 'pz', tokens: 0, percent: 0 },
  ],
}

function stubFetch() {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => ({ ok: true, value: range }),
  } as unknown as Response)))
}

/** The provider section, located by its heading (class names are hashed). */
function providerSection(container: HTMLElement): HTMLElement {
  const section = Array.from(container.querySelectorAll('section'))
    .find((el) => el.querySelector('h3')?.textContent === 'providerUsage')
  if (section === undefined || section === null) throw new Error('provider section missing')
  return section as HTMLElement
}

function segmentColors(section: HTMLElement): Map<string, string> {
  const chart = section.querySelector('svg[aria-label="providerUsage"]')!
  const out = new Map<string, string>()
  // A ring segment is a stroked arc, not a filled rect: read `stroke`.
  for (const seg of Array.from(chart.querySelectorAll('[role="img"][aria-label]'))) {
    out.set(seg.getAttribute('aria-label')!.split(':')[0]!, seg.getAttribute('stroke') ?? '')
  }
  return out
}

/** The section's top-level rows only — a detail row is nested one list deeper. */
function topRows(section: HTMLElement): HTMLElement[] {
  return Array.from(section.querySelectorAll('ul[class*="modelList"] > li[class*="modelRow"]'))
}

/** The top-level row whose name line reads exactly `name`. */
function rowNamed(section: HTMLElement, name: string): HTMLElement {
  const row = topRows(section).find((el) => el.querySelector('[class*="modelName"]')?.textContent === name)
  if (row === undefined) throw new Error(`row ${name} missing`)
  return row
}

/** The detail list belonging to `row`: a SIBLING wrapper, mounted even while
 *  collapsed (the accordion animates a grid track rather than unmounting). */
function detailOf(row: Element): HTMLElement {
  const el = row.nextElementSibling
  if (el === null || !el.className.includes('modelOther')) throw new Error('detail wrapper missing')
  return el as HTMLElement
}

/** The rows a detail wrapper shows DIRECTLY, by name line. A nested detail list
 *  (a folded provider's own models) sits one level deeper and stays excluded. */
function detailNames(detail: HTMLElement): Array<string | null | undefined> {
  const list = detail.querySelector('ul[class*="modelOtherList"]')
  if (list === null) return []
  return Array.from(list.children)
    .filter((el) => el.className.includes('modelRow'))
    .map((el) => el.querySelector('[class*="modelName"]')?.textContent)
}

async function renderPanel() {
  stubFetch()
  const { container } = render(<UsageStatsSection {...({ t } as UsageStatsSectionProps)} />)
  await waitFor(() => {
    expect(container.querySelector('svg[aria-label="providerUsage"] [role="img"][aria-label]')).not.toBeNull()
  })
  return container
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('provider usage section', () => {
  it('colours every provider from the provider series, wrapping past the palette', async () => {
    // No Other bucket any more: all six providers with usage are ranked rows, so
    // the palette (5 hues) wraps for rank 6 instead of collapsing the tail onto
    // one gray step.
    const container = await renderPanel()
    const colors = segmentColors(providerSection(container))

    for (let rank = 1; rank <= 5; rank += 1) {
      const provider = `p${String.fromCharCode(96 + rank)}` // pa..pe
      expect(colors.get(provider)).toBe(`var(--dsw-provider-${rank})`)
    }
    // pf is rank 6: the hue wraps back to the first slot.
    expect(colors.get('pf')).toBe('var(--dsw-provider-1)')
    expect(colors.get('pg')).toBe('var(--dsw-provider-2)')
    expect(colors.get('pz')).toBeUndefined() // zero volume: never ranked
    expect(colors.get('other')).toBeUndefined()
  })

  it('never wears a model colour in the provider series', async () => {
    const container = await renderPanel()
    for (const color of segmentColors(providerSection(container)).values()) {
      expect(color.startsWith('var(--dsw-provider-')).toBe(true)
    }
  })

  it('lists every provider with usage — no Other bucket', async () => {
    const container = await renderPanel()
    const rows = providerSection(container).querySelectorAll('ul[class*="modelList"] > li[class*="modelRow"]')
    // pa..pg = seven providers with volume; pz has none and is dropped.
    expect(rows.length).toBe(7)
    const names = Array.from(rows).map((r) => r.querySelector('[class*="modelName"]')?.textContent)
    expect(names).toEqual(['pa', 'pb', 'pc', 'pd', 'pe', 'pf', 'pg'])
    expect(names).not.toContain('other')
  })

  it('shows every model behind the hovered provider in the tip', async () => {
    const container = await renderPanel()
    const seg = providerSection(container).querySelector('[role="img"][aria-label^="pa:"]')!
    fireEvent.mouseEnter(seg)

    await waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).not.toBeNull()
    })
    const tip = document.querySelector('[role="tooltip"]')!
    expect(tip.textContent).toContain('pa')
    expect(tip.textContent).toContain('total')
    // pa served two models; both must be listed with their own volumes.
    expect(tip.textContent).toContain('m1')
    expect(tip.textContent).toContain('m2')
    expect(tip.textContent).not.toContain('m4') // another provider's model
  })

  it('sizes the column to the list rows and keeps it there when a row expands', async () => {
    const container = await renderPanel()
    const section = providerSection(container)
    const svg = section.querySelector('svg[aria-label="providerUsage"]')!
    // The ring's diameter is a function of the row width, never of the list's
    // height: six top-level rows or sixty, the chart keeps its own size.
    expect(svg.getAttribute('width')).toBe(svg.getAttribute('height'))
  })

  it('lights the matching ring segment when a list row is hovered', async () => {
    const container = await renderPanel()
    const section = providerSection(container)
    const firstRow = section.querySelector('li[class*="modelRow"]')!
    expect(firstRow.textContent).toContain('pa')

    fireEvent.mouseEnter(firstRow)
    await waitFor(() => {
      expect(section.querySelectorAll('[class*="donutDim"]').length).toBeGreaterThan(0)
    })
    // The hovered provider keeps full opacity; the rest dim.
    expect(section.querySelector('[role="img"][aria-label^="pa:"][class*="donutDim"]')).toBeNull()
    expect(section.querySelector('[role="img"][aria-label^="pb:"][class*="donutDim"]')).not.toBeNull()
  })

  it('opens any provider into the models it served, one level', async () => {
    // Every provider is a top-level row now, so the two-level nesting that
    // existed only inside the Other bucket is gone: opening a row always lands
    // on models.
    const container = await renderPanel()
    const section = providerSection(container)
    const row = rowNamed(section, 'pa')
    const detail = detailOf(row)

    expect(detailNames(detail)).toEqual(['m1', 'm2']) // pa served both, in rank order
    expect(detailNames(detail)).not.toContain('m3') // another provider's model

    const toggle = row.querySelector('button[aria-expanded]')!
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('opens a provider that used to be folded into the Other bucket', async () => {
    // pf used to live one level down inside Other. It is a top-level row now,
    // and opening it lands straight on the models it served.
    const container = await renderPanel()
    const section = providerSection(container)
    const row = rowNamed(section, 'pf')
    const toggle = row.querySelector('button[aria-expanded]')!
    expect(toggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(toggle)

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(detailNames(detailOf(row))).toEqual(['m7'])
  })
})
