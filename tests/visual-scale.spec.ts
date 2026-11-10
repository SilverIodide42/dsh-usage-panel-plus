/**
 * Source guard for the panel's ONE scale.
 *
 * jsdom runs no layout, so nothing at runtime can notice that the model list
 * and the session list drifted into different row heights, that the same
 * token figure was secondary ink in one list and primary ink in the other, or
 * that a series swatch was 8px in one place and 10px in another. Those were
 * real inconsistencies (fixed by introducing the `--usage-*` scale), and a
 * later edit can silently reintroduce them.
 *
 * The rule these tests enforce: anything that is part of the repeated visual
 * vocabulary — frame radius, row geometry, the three type tiers, series
 * swatches, hairlines and the section head anatomy — comes from a `--usage-*`
 * token, never from a literal. Literals are still fine for genuinely
 * one-of-a-kind things (the donut's centre figure, the switch's 40x22 track,
 * a 3px share bar, the 10px axis labels).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SHEET = join(__dirname, '..', 'src', 'client', 'UsageStatsPanel.module.css')
const raw = readFileSync(SHEET, 'utf8')
/** The sheet without comments: the docs above each rule quote values freely. */
const css = raw.replace(/\/\*[\s\S]*?\*\//gu, '')

/** The declaration block of one simple class selector. */
function block(selector: string): string {
  const matched = new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`, 'u').exec(css)
  expect(matched, `${selector} rule is missing`).not.toBeNull()
  return matched?.[1] ?? ''
}

describe('the shared scale exists', () => {
  it('defines every token the rest of the sheet reads', () => {
    const panel = block('.panel')
    for (const token of [
      '--usage-radius-frame',
      '--usage-radius-inner',
      '--usage-radius-bar',
      '--usage-radius-swatch',
      '--usage-row-height',
      '--usage-row-pad-x',
      '--usage-row-gap',
      '--usage-swatch',
      '--usage-font-body',
      '--usage-font-meta',
      '--usage-font-title',
      '--usage-ink-value',
      '--usage-ink-label',
      '--usage-ink-meta',
      '--usage-hairline',
      '--usage-fill-frame',
      '--usage-fill-inset',
    ]) {
      expect(panel, token).toContain(`${token}:`)
    }
  })

  it('publishes exactly three type tiers, 13/11/15', () => {
    const panel = block('.panel')
    expect(panel).toMatch(/--usage-font-body:\s*13px/u)
    expect(panel).toMatch(/--usage-font-meta:\s*11px/u)
    expect(panel).toMatch(/--usage-font-title:\s*15px/u)
  })
})

describe('framed surfaces share one radius and one hairline', () => {
  // Every "container" surface in the panel. A new one must join this list (and
  // use the tokens) rather than invent a radius.
  // Every "container" surface in the panel. A new one must join this list (and
  // use the tokens) rather than invent a radius. The two list scrollers carry
  // the frame now that both lists scroll inside a capped viewport.
  const FRAMES = ['.card', '.modelScroll', '.group', '.prefGroup', '.errorBanner', '.empty', '.deferredSkeleton', '.sessionScroll']

  it('gives each framed surface the frame tier', () => {
    for (const selector of FRAMES) {
      expect(block(selector), selector).toMatch(/border-radius:\s*var\(--usage-radius-frame\)/u)
    }
  })

  it('keeps the hover tip on the inner tier, below the panel surfaces', () => {
    // A tip is not a panel surface: it is a hover affordance that must not read
    // as a card in its own right, so it takes the inner radius and the tier
    // below the list rows. It is asserted separately (rather than dropped from
    // the guard) so a later edit cannot quietly promote it back to a frame.
    const tip = block('.tip')
    expect(tip).toMatch(/border-radius:\s*var\(--usage-radius-inner\)/u)
    expect(tip).toMatch(/font-size:\s*12px/u)
  })

  it('uses the shared hairline for list frames', () => {
    for (const selector of ['.card', '.modelScroll', '.sessionScroll', '.prefGroup']) {
      expect(block(selector), selector).toMatch(/border:\s*var\(--usage-hairline\)/u)
    }
  })

  it('caps both list viewports instead of letting them grow', () => {
    // The two lists are drill-downs: a 20-model or 40-session range must not push
    // everything after it off the page. Both scroll inside a max-height.
    for (const selector of ['.modelScroll', '.sessionScroll']) {
      const frame = block(selector)
      expect(frame, selector).toMatch(/max-height:\s*\d+px/u)
      expect(frame, selector).toMatch(/overflow-y:\s*auto/u)
      expect(frame, selector).toMatch(/overscroll-behavior:\s*contain/u)
    }
  })
})

describe('list rows are one anatomy', () => {
  it('gives the model row and the session row the same inset and gap', () => {
    const modelRow = block('.modelRow')
    const sessionRow = block('.sessionRow')
    for (const decl of ['var(--usage-row-pad-x)', 'var(--usage-row-gap)', 'var(--usage-font-body)', 'var(--usage-hairline)']) {
      expect(modelRow, `modelRow: ${decl}`).toContain(decl)
      expect(sessionRow, `sessionRow: ${decl}`).toContain(decl)
    }
  })

  it('keeps the session row on one line now that the bar is gone', () => {
    // The bar needed a second grid row; without it the row is a single band, so
    // it must not still reserve a `bar` track.
    expect(block('.sessionRow')).not.toMatch(/bar\s+bar/u)
  })

  it('prints the same token figure in the same ink in both lists', () => {
    // The regression: model tokens were label-secondary while session tokens
    // were label-primary, so one list's numbers looked louder than the other's
    // for the same quantity.
    expect(block('.modelTokens')).toMatch(/color:\s*var\(--usage-ink-value\)/u)
    expect(block('.sessionTokens')).toMatch(/color:\s*var\(--usage-ink-value\)/u)
    expect(block('.modelTokens')).toMatch(/font-size:\s*var\(--usage-font-body\)/u)
    expect(block('.sessionTokens')).toMatch(/font-size:\s*var\(--usage-font-body\)/u)
  })

  it('gives both lists the same hit-rate tier', () => {
    // The share bars are gone and both lists now carry a cache hit rate. It is
    // the values column's third line in each, so it must read identically.
    for (const selector of ['.modelHitRate', '.sessionHitRate']) {
      expect(block(selector), selector).toMatch(/font-size:\s*var\(--usage-font-meta\)/u)
      expect(block(selector), selector).toMatch(/color:\s*var\(--usage-ink-meta\)/u)
      expect(block(selector), selector).toMatch(/font-variant-numeric:\s*tabular-nums/u)
    }
  })

  it('has no share bar left in either list', () => {
    // The bars restated the percentage already printed beside them. A rule
    // reappearing here means the redundancy came back.
    for (const selector of ['.sessionShare', '.sessionShareFill', '.modelShare', '.modelShareFill', '.modelRowBarred']) {
      expect(css.includes(selector), selector).toBe(false)
    }
  })

  it('keeps every percentage on the meta tier', () => {
    for (const selector of ['.modelPct', '.sessionPct']) {
      expect(block(selector), selector).toMatch(/font-size:\s*var\(--usage-font-meta\)/u)
      expect(block(selector), selector).toMatch(/color:\s*var\(--usage-ink-meta\)/u)
    }
  })

  it('indents an expanded session detail row to its parent title, from tokens', () => {
    // Not a magic 44px: the indent is the parent's own text origin, so it stays
    // aligned if the row inset or the swatch ever changes.
    const detail = block('.sessionDetailRow')
    expect(detail).toMatch(/var\(--usage-row-pad-x\)/u)
    expect(detail).toMatch(/var\(--usage-swatch\)/u)
    expect(detail).not.toMatch(/padding:[^;]*\b44px/u)
  })
})

describe('no Other bucket, anywhere', () => {
  const SRC = readFileSync(join(__dirname, '..', 'src', 'client', 'UsageStatsPanel.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//gu, '')

  it('never slices a ranked list down to a top N', () => {
    // The fold was `.slice(0, TOP_MODELS)` / `.slice(0, TOP_PROVIDERS)` plus a
    // synthesized gray row. Both lists render every host-returned row now, so no
    // top-N cap may reappear — that is exactly what "show everything" means.
    expect(SRC).not.toMatch(/TOP_MODELS/u)
    expect(SRC).not.toMatch(/TOP_PROVIDERS/u)
    expect(SRC).not.toMatch(/\.slice\(\s*0\s*,\s*CHART_HUES/u)
  })

  it('has no grouping step that synthesizes an aggregate row', () => {
    // The removed code built `{ model: OTHER_MODEL, items: rest }` and the
    // provider equivalent. Neither may come back.
    expect(SRC).not.toMatch(/items:\s*rest/u)
    expect(SRC).not.toMatch(/folded:\s*/u)
    expect(SRC).not.toMatch(/FoldedProvider/u)
  })
})

describe('one swatch size for series colour', () => {
  it('sizes the legend swatch and the session swatch alike', () => {
    // 10px vs 8px made the same model read as two different hues (a small
    // square loses saturation).
    for (const selector of ['.legendSwatch', '.sessionSwatch']) {
      expect(block(selector), selector).toMatch(/width:\s*var\(--usage-swatch\)/u)
      expect(block(selector), selector).toMatch(/height:\s*var\(--usage-swatch\)/u)
    }
  })
})

describe('every section carries the same head anatomy', () => {
  const SRC_RAW = readFileSync(join(__dirname, '..', 'src', 'client', 'UsageStatsPanel.tsx'), 'utf8')
  const SESSION_RAW = readFileSync(join(__dirname, '..', 'src', 'client', 'SessionUsage.tsx'), 'utf8')
  /** Strip comments: the docs quote `<h3>` shapes when explaining the rule. */
  const strip = (text: string): string => text.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '')
  const SRC = strip(SRC_RAW)
  const SESSION = strip(SESSION_RAW)
  const both = SRC + SESSION

  it('wraps every section title in a sectionHead', () => {
    // A bare `<h3 className={css.sectionTitle}>` is exactly how the model and
    // provider sections lost their rhythm against the sections above them.
    // Each title must be the child of a `sectionHead` div, so the count of
    // heads and titles match one-for-one per section.
    const titles = (both.match(/className=\{css\.sectionTitle\}/gu) ?? []).length
    const heads = (both.match(/className=\{css\.sectionHead\}/gu) ?? []).length
    expect(titles).toBeGreaterThan(0)
    // Four panel sections plus the session section — one head each.
    expect(heads).toBe(titles)
  })

  it('never places a sectionTitle outside a sectionHead', () => {
    // Structural check: strip the heads and their titles together; any title
    // left outside a removed head means one section skipped the wrapper.
    const insideHeads = (both.match(/className=\{css\.sectionHead\}>[\s\S]*?<\/div>/gu) ?? [])
    const wrappedTitles = insideHeads
      .map((chunk) => (chunk.match(/className=\{css\.sectionTitle\}/gu) ?? []).length)
      .reduce((sum, n) => sum + n, 0)
    const allTitles = (both.match(/className=\{css\.sectionTitle\}/gu) ?? []).length
    expect(wrappedTitles).toBe(allTitles)
  })

  it('gives the list sections a note that carries only non-obvious facts', () => {
    expect(SRC).toContain("t('modelUsageHint'")
    expect(SRC).toContain("t('providerUsageHint'")
  })

  it('states the sort order nowhere, in any language', () => {
    // All three section notes used to open with "Ranked by tokens" / "按 token
    // 排序". The ranking is visible in the descending token column, so the claim
    // was a caption for something the reader can already see. Likewise
    // "hover a row to highlight it in the ring" described an affordance the
    // first hover demonstrates. Both are gone; a later edit must not re-add them.
    //
    // Strip comments first: the note above this very text documents the retired
    // copy, and a raw substring search would match its own documentation.
    const locales = readFileSync(join(__dirname, '..', 'src', 'client', 'locales.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//gu, '')
      .replace(/^\s*\/\/.*$/gmu, '')
    for (const retired of [
      'Ranked by tokens',
      'Sorted by tokens',
      '按 token 排序',
      '依 token 排序',
      'hover a row to highlight',
      '悬停可在环图高亮',
      '懸停可在環圖高亮',
    ]) {
      expect(locales, retired).not.toContain(retired)
    }
  })
})

describe('the toolbar holds its shape', () => {
  it('never lets the segmented range picker wrap inside itself', () => {
    // A segmented control broken across two lines reads as two separate groups,
    // and the active chip stops looking adjacent to the one it replaced. The
    // group is one flex ITEM of the toolbar, so it may move to its own line —
    // but it must never split internally.
    expect(block('.group')).toMatch(/flex-wrap:\s*nowrap/u)
  })

  it('keeps every range chip on one shared floor width', () => {
    // "7d" and "14d" differ by one character: without a floor, each click
    // re-measures the row and shifts the chips sideways.
    const chip = block('.segItem')
    expect(chip).toMatch(/min-width:\s*\d+px/u)
    expect(chip).toMatch(/font-variant-numeric:\s*tabular-nums/u)
    expect(chip).toMatch(/text-align:\s*center/u)
  })

  it('lets the custom date inputs wrap rather than clip', () => {
    // The two 150px inputs plus the separator exceed a narrow toolbar; wrapping
    // inside their own container keeps the second one inside the panel.
    expect(css).toMatch(/@media \(max-width: 720px\)[\s\S]*?\.customRange\s*\{[^}]*flex-wrap:\s*wrap/u)
  })
})

describe('cards never overflow their column', () => {
  it('gives the shrinking card children a zero min-width', () => {
    // A flex/grid item defaults to `min-width: auto`, so a long model name makes
    // the column refuse to shrink and the text spills out instead of ellipsising.
    for (const selector of ['.cardModelLines', '.cardLabel']) {
      expect(block(selector), selector).toMatch(/min-width:\s*0/u)
    }
  })
})

describe('no literal escapes the scale', () => {
  it('has no literal border-radius outside the scale tokens', () => {
    // Allowed literal radii are the one-of-a-kind shapes: the heat cell and the
    // "+N" chip (3px), the switch track/pill and its round thumb, the scrollbar
    // thumb, and the 2px series swatch/bar caps that the tokens cover.
    const ALLOWED = new Set(['3px', '4px', '11px', '50%'])
    const offenders: string[] = []
    for (const match of css.matchAll(/border-radius:\s*([^;]+);/gu)) {
      const value = match[1]!.trim()
      if (value.startsWith('var(--usage-')) continue
      if (ALLOWED.has(value)) continue
      offenders.push(value)
    }
    expect(offenders, 'literal border-radius values').toEqual([])
  })

  it('has no literal font-size outside the scale tokens and the chart/donut tiers', () => {
    // Chart axes (10px) and the donut centre (18px) are chart furniture, not
    // panel chrome, plus the settings-row description tier that mirrors the
    // host's own dialog anatomy (12px) and the card's 14px small value.
    const CHART = new Set(['10px', '12px', '14px', '18px'])
    const offenders: string[] = []
    for (const match of css.matchAll(/font-size:\s*([^;]+);/gu)) {
      const value = match[1]!.trim()
      if (value.startsWith('var(--usage-')) continue
      if (CHART.has(value)) continue
      offenders.push(value)
    }
    expect(offenders, 'literal font-size values').toEqual([])
  })
})
