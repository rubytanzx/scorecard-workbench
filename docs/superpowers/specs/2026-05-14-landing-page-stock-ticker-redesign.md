# Landing Page Stock-Ticker Redesign — Design Spec

**Date:** 2026-05-14
**Owner:** Ruby Tan
**Status:** Approved (pending plan)

## Goal

Reshape the IDA Scorecard landing page to match the reference screenshot supplied by the user. The hero/prompt area, header, AI sidebar, and post-search views (conversation, viewer, workspace) stay untouched. Everything between the search hero and the footer is rebuilt.

The single new mechanic is a **22-indicator stock-ticker marquee** that replaces the existing `ResultsBand`. The rest of the page is a section-by-section refactor matching the reference layout — same data domains we already have, presented in tighter, more scannable formats. No editorial photography.

## Typography rule

All UI text uses `'Open Sans', sans-serif`. **Do not introduce Crimson Pro.** Existing Crimson Pro usage in `FeaturedStoryCard.tsx` and `FlipStoryCard.tsx` is not changed by this work because those components are no longer rendered on the landing page; if they are later surfaced in a flow we touch, convert them then.

## Out of scope

- AI chat sidebar, prompt bar, post-search views.
- `FeaturedStoryCard`, `FlipStoryCard`, `StoryCard` (kept in the codebase, but no longer rendered from `app/page.tsx`).
- `StoryDetailModal`, `story3Notebooks`, `story3PeerBoards`.

---

## Section 1 — Indicators ticker

**Replaces:** `components/ResultsBand.tsx` (kept in the codebase for now; remove import from `page.tsx`).
**New file:** `components/IndicatorTicker.tsx`.

### Layout

Full-width section. Top bar:

- Left: `INDICATORS` (small-caps, 10px, letter-spacing 1, color `#9CA3AF`) + subhead "Real-time pulse of development outcomes" (12px, `#6B7280`).
- Right: "Auto-updating ●" (pulse dot, green `#10B981`) + `View all 22 →` text button.

Beneath the bar: a single-row marquee. Cards ~220px wide × 90px tall, gap 10px, on a `#F8F7F4` background with 12px rounded outer container. Soft fade-out gradients on the left and right edges (24px wide, white → transparent) so cards visually enter and exit instead of getting cropped.

### Marquee mechanics

- The full 22-card list is rendered twice back-to-back (`[…22, …22]`). The track translates left by `-50%` of its width over `120s` linear, then loops. CSS `@keyframes`, no JS interval.
- `:hover` on the track sets `animation-play-state: paused`.
- `prefers-reduced-motion: reduce`: animation is disabled and the strip becomes a horizontally scrollable overflow container (native scroll, no snap).
- Each card is `tabindex=0` and announces its content for screen readers (`aria-label="<name>: <achieved> of <expected>"`).

### Card content

Within each 220×90 card:

- Top row: indicator label, 10px Open Sans 500, color `#6B7280`, two-line clamp.
- Big number: achieved value, 22px Open Sans 600, color `#0D1A2B`. If `achieved` is `"--"`, render `—` in `#9CA3AF`.
- Delta row: arrow glyph (▲ or ▼) + "X% of expected", colored:
  - Green `#10B981` if `achieved/expected >= 0.85`.
  - Amber `#F59E0B` if `0.5–0.85`.
  - Red `#EF4444` if `< 0.5`.
  - Gray `#9CA3AF` if `achieved == "--"` (pending data — also shows "Coming soon" instead of percent).
- Mini sparkline: 60×16 SVG polyline on the right side of the card, 5 points, stroke 1.5, color matches the delta color.

Click anywhere on a card → opens a lightweight **methodology drawer** (right-side panel, 360px wide) showing the indicator's `methodologyNote` + sub-rows when present + link to methodology PDF. This replaces the old hover-flip mechanic. Use a simple controlled-by-state portal (no new dependency); the drawer lives inside `IndicatorTicker.tsx`.

### Data model (changes to `lib/mockData.ts`)

Rewrite the `Indicator` interface and the `indicators` array.

```ts
export interface IndicatorSubRow {
  label: string;
  achieved: string;   // "1.8M" | "--"
  expected: string;   // "14M"
}

export interface Indicator {
  id: string;
  name: string;        // full Active Portfolio Results name
  achieved: string;    // "146.6M" | "--"
  expected: string;    // "192.3M" | "-102.7MtCO2eq/year"
  /** Numeric ratio used for the delta colour. Null when achieved is "--". */
  ratio: number | null;
  sparkline: number[];                  // 5 points, normalised 0–1
  methodologyNote: string;
  methodologyUrl?: string;
  subRows?: IndicatorSubRow[];
  comingSoon?: boolean;                 // true for "More and better-paid jobs"
}
```

Update all 22 entries with the values from the user-supplied Active Portfolio Results screenshot:

| # | Name | Achieved | Expected |
|---|---|---|---|
| 1 | Beneficiaries of social safety net programs | 171.6M | 176.2M |
| 2 | Students supported with better education | 100.8M | 174.7M |
| 3 | People receiving quality health, nutrition, and population services | 225.4M | 268.6M |
| 4 | Countries benefitting from strengthened capacity to prevent, detect, and respond to health emergencies | 14 | 42 |
| 5 | Percentage of countries in or at high risk of debt distress that implemented reforms towards debt sustainability | 76.7% | 83.7% |
| 6 | Countries with tax revenues-to-GDP ratio at or below 15% (including social security contributions) that have increased collections, considering equity | 18 | 26 |
| 7 | Net greenhouse gas emissions (GHG) | -- | -102.7MtCO2eq/year |
| 8 | Beneficiaries with enhanced resilience to climate risks | 104M | 268.1M |
| 9 | Hectares of terrestrial and aquatic areas under enhanced conservation/management | 39.3M | 59.3M |
| 10 | People provided with water, sanitation, and/or hygiene, and the number provided with safely managed services | 41.3M | 90.1M |
| 11 | People with strengthened food and nutrition security | 146.6M | 192.3M |
| 12 | People that benefit from improved access to sustainable transport infrastructure and services | 84.3M | 277.5M |
| 13 | People provided with access to electricity | 86.7M | 205.7M |
| 14 | GW of renewable energy capacity enabled | 4.8GW | 26.64GW |
| 15 | People using broadband internet | 64.8M | 142.1M |
| 16 | People using digitally enabled services | 25M | 76.4M |
| 17 | People benefiting from actions to advance gender equality, and the number benefitting from actions that expand and enable economic opportunities | 191.8M | 307.2M |
| 18 | People and businesses using financial services, including the number of women | 44.4M | 26M |
| 19 | More and better-paid jobs (Coming soon) | -- | -- |
| 20 | Displaced people and people in host communities provided with services and livelihoods | 9.2M | 34.7M |
| 21 | Total private capital enabled | -- | $25.8B |
| 22 | Total private capital mobilized | -- | $17.1B |

Sub-rows:
- #10 WASH: `[{ label: "Total", achieved: "41.3M", expected: "90.1M" }, { label: "Safely managed", achieved: "1.8M", expected: "14M" }]`
- #17 Gender: `[{ label: "Total", achieved: "191.8M", expected: "307.2M" }, { label: "Beneficiaries of actions to expand and enable economic opportunities", achieved: "67.7M", expected: "128.1M" }]`
- #18 Financial services: `[{ label: "Total", achieved: "44.4M", expected: "26M" }, { label: "Female", achieved: "19.2M", expected: "10.6M" }]`

Sparkline arrays are mocked (5 points each); coming-soon entry uses a flat-line array.

---

## Section 2 — Trending Across IDA

**Replaces:** the entire "Topics Trending" section (`FeaturedStoryCard` + `FlipStoryCard`/`StoryCard` grid).
**New file:** `components/TrendingAcrossIDA.tsx`.

### Header

`Trending Across IDA` (16px Open Sans 600, color `#0D1A2B`) on the left. Subhead "AI-synthesized patterns from scorecard data and narratives" (12px `#6B7280`). `View all patterns →` text link on the right (12px, color `#003F6B`).

### Layout

Two-column flex on `xl`, stacked on smaller. Left column is `flex: 0 0 58%`, right column fills remaining.

### Left card — TOP MOMENTUM

White card, 1px `#E5E7EB` border, radius 12, padding 24.

- `TOP MOMENTUM` tag (green pill, bg `#E6F4EC`, text `#067647`, 10px small-caps, 6px radius).
- Headline: Open Sans 22px / 700 / line-height 1.3, color `#111827`, ~2 lines. (Uses `featuredStory.headline` from existing mock data.)
- Description paragraph: Open Sans 14px / 400, color `#4B5563`, line-height 1.55, ~3 lines. (Uses `featuredStory.description`.)
- 4-column stat row, 18px gap:
  - `18` `Countries improving`
  - `+14.8%` `Job access (YoY)`
  - `+11.2M` `New digital wallets`
  - `+9.1%` `Female labor participation`
  - Numbers: Open Sans 22px / 600, color `#067647` for positive, `#DC2626` for negative.
  - Labels: 11px / 400, color `#6B7280`.
- `Explore this pattern →` link at bottom (12px Open Sans 600, color `#003F6B`).

### Right column — Risk Watch + Emerging Signal (stacked)

Two cards stacked with 12px gap. Each: white bg, 1px border, radius 12, padding 18.

Each card contains:
- Tag pill (top-left): `RISK WATCH` (red, bg `#FEE2E2`, text `#B91C1C`) or `EMERGING SIGNAL` (purple, bg `#EDE9FE`, text `#5B21B6`).
- Headline: Open Sans 15px / 600, line-height 1.4, 2 lines max.
- Description: 12px / 400, color `#6B7280`, line-height 1.5, 2–3 lines.
- Small inline sparkline (60×24, right-aligned, color matches tag).
- Bottom link: `Explore drivers →` or `Explore countries →` (11px, color `#003F6B`).

### Data

New `trendingCards` export in `mockData.ts`:

```ts
export interface TrendingTopCard {
  tag: "TOP MOMENTUM";
  headline: string;
  description: string;
  stats: { value: string; label: string; tone: "positive" | "negative" }[];
  ctaLabel: string;
}

export interface TrendingSideCard {
  id: "risk-watch" | "emerging-signal";
  tag: "RISK WATCH" | "EMERGING SIGNAL";
  headline: string;
  description: string;
  sparkline: number[];
  ctaLabel: string;
}

export const trendingTop: TrendingTopCard = { … }
export const trendingSides: TrendingSideCard[] = [ … ]
```

Seed content (1 top card + 2 side cards) pulled from existing `featuredStory` headline/description plus two new short editorial entries for Risk Watch ("Fragility and fiscal pressure remain key constraints") and Emerging Signal ("Water outcomes improving despite infrastructure delivery challenges"). All written content is mock.

---

## Section 3 — What's Changing Right Now (refactor)

**Replaces:** the `changingCards` `InsightChartCard` grid.
**New file:** `components/MomentumGroups.tsx`.

### Header

`What's Changing Right Now` (same style as section 2). Subhead "Track momentum shifts over time". `View all →` on the right.

### Layout

Three columns, equal width, 16px gap. Each column is a white card, 1px border, radius 12, padding 18, with:

1. Icon circle at top (40×40, tinted bg).
2. Group title (Open Sans 14px / 600).
3. Subtitle (11px / 400, color `#6B7280`).
4. Three rows of "indicator name · delta value" (12px name color `#374151`; value 13px / 600 color matches group).
5. Footer link `See all <group> →`.

Groups:

| Group | Icon | Tint | Value color |
|---|---|---|---|
| Accelerating | ▲ | bg `#E6F4EC`, fg `#067647` | `#067647` |
| Slowing | ⚠ | bg `#FEE2E2`, fg `#B91C1C` | `#B91C1C` |
| Emerging | ○ | bg `#EDE9FE`, fg `#5B21B6` | `#5B21B6` (and text reads `New`) |

### Data

```ts
export interface MomentumRow { label: string; delta: string; }
export interface MomentumGroup {
  id: "accelerating" | "slowing" | "emerging";
  title: string;
  subtitle: string;
  rows: MomentumRow[];
}
export const momentumGroups: MomentumGroup[] = [ … ]
```

Three rows each (9 rows total). Seed with realistic IDA-context names like "Digital financial inclusion", "Climate adaptation financing", "Green jobs creation".

The existing `changingCards` array stays in the file because `mockInteraction` may reference it elsewhere — verify with a grep during implementation.

---

## Section 4 — Counter Intuitive Findings (refactor)

**Replaces:** the existing `CounterIntuitiveCard` grid (3 cards with charts).
**Update:** `components/CounterIntuitiveCard.tsx` to a text-only icon card (drop chart code paths). OR create a new `CounterIntuitiveTextCard.tsx` and leave the old one untouched. Recommendation: **create a new component** so we don't risk breaking other call sites.

### Layout

Four columns, equal width, 16px gap. Each card: white bg, 1px border, radius 12, padding 18.

Card content (top → bottom):
- Tinted icon circle (40×40).
- Headline (14px / 600 Open Sans, line-height 1.4, 2 lines).
- Description (12px / 400, color `#6B7280`, line-height 1.5, 3 lines).
- `Explore insight →` link (11px, color `#003F6B`).

Icons (one per card, themed): chart, water-drop, female, dollar. Tints follow same palette family as section 3.

### Data

Add `icon` and remove chart-related fields from a new `counterIntuitiveTextCards` export. Keep the old `counterIntuitiveCards` export untouched to avoid breaking any other consumers (verify via grep).

```ts
export interface CounterIntuitiveTextCard {
  id: string;
  icon: "chart" | "water" | "female" | "dollar";
  tone: "green" | "blue" | "purple" | "amber";
  headline: string;
  description: string;
}
```

Four entries, seeded with mock content roughly matching the screenshot copy (mobile-money / water outcomes / transport-and-women / debt-but-fiscal-space).

---

## Section 5 — Explore by System Pattern (refactor)

**Replaces:** `PatternCard` 3-column grid.
**Update:** `components/PatternCard.tsx` is modified (or replaced by `SystemPatternTile.tsx`). Pick the new-file route again for safety.

### Header

`Explore by System Pattern` + subhead "Dive deeper using cross-sector lenses". `View all patterns →` on right.

### Layout

Six columns on `xl`, three on `lg`, two on `sm`, one on mobile. Tile: bg `#FFFFFF`, 1px border, radius 12, padding 16, min-height 132.

Tile content:
- Tinted icon circle (32×32) at top.
- Name (Open Sans 13px / 600).
- Description (11px / 400, color `#6B7280`, 2-line clamp).
- Footnote: `X narratives · Y indicators` (10px, color `#9CA3AF`) at bottom.

Six pattern tiles:

| Name | Icon | Tint |
|---|---|---|
| Economic Mobility | ▲ | green |
| Digital Transformation | ◎ | blue |
| Human Capital | 👥 | teal |
| Climate Resilience | 🌿 | green |
| Inclusive Participation | 👥 | purple |
| Fragility & Institutions | 🛡 | orange |

(Use SVG-based icon glyphs, not emoji.)

### Data

```ts
export interface SystemPattern {
  id: string;
  name: string;
  description: string;
  icon: "trend" | "digital" | "human" | "climate" | "inclusion" | "fragility";
  tint: "green" | "blue" | "teal" | "purple" | "orange";
  narrativeCount: number;
  indicatorCount: number;
}
export const systemPatterns: SystemPattern[] = [ … 6 entries … ]
```

Keep old `patternCards` export untouched.

---

## File map

| Action | File | Purpose |
|---|---|---|
| Create | `components/IndicatorTicker.tsx` | Stock-ticker marquee + methodology drawer |
| Create | `components/IndicatorSparkline.tsx` | SVG polyline; accepts `width`, `height`, `color`, `points: number[]` props. Used at 60×16 in the ticker and 60×24 in Trending side cards. |
| Create | `components/TrendingAcrossIDA.tsx` | Top momentum + risk/emerging cards |
| Create | `components/MomentumGroups.tsx` | What's Changing Right Now 3-column |
| Create | `components/CounterIntuitiveTextCard.tsx` | Icon + headline + description card |
| Create | `components/SystemPatternTile.tsx` | 6-col tile |
| Modify | `lib/mockData.ts` | Rewrite `Indicator` interface + `indicators` array (22 entries from screenshot). Add `trendingTop`, `trendingSides`, `momentumGroups`, `counterIntuitiveTextCards`, `systemPatterns` exports. |
| Modify | `app/page.tsx` | Remove `ResultsBand`, `FeaturedStoryCard`, `FlipStoryCard`, `StoryCard`, `InsightChartCard`, `CounterIntuitiveCard`, `PatternCard` imports. Render the five new sections in order. Drop the 2-column main layout — page becomes a single column of sections. |
| Keep | `components/ResultsBand.tsx`, `components/FlipStoryCard.tsx`, `components/FeaturedStoryCard.tsx`, `components/StoryCard.tsx`, `components/InsightChartCard.tsx`, `components/CounterIntuitiveCard.tsx`, `components/PatternCard.tsx` | Not deleted (may be referenced elsewhere — verify with grep during implementation; cleanup is a separate task). |

---

## Page flow after redesign

```
AppHeader
SearchHero (no pills change — existing 4 pills underneath are fine)
IndicatorTicker (22-card marquee)
TrendingAcrossIDA (2-col: Top Momentum + Risk/Emerging stack)
MomentumGroups (3-col Accelerating/Slowing/Emerging)
CounterIntuitiveFindings (4-col text+icon cards)
SystemPatternGrid (6-col tiles)
AppFooter
```

The current 2-column flex layout (`xl:flex-row gap-8`) is removed — the landing page is one wide column of sections, max-width 1440, side padding identical to today's.

## Animation & motion

- Section fade-in on scroll: keep the existing `<FadeIn>` wrapper, one per section, with 50ms-stepped delays.
- Ticker marquee: 120s linear loop, pauses on hover, disabled under `prefers-reduced-motion`.
- No card hover transforms beyond a subtle 50ms `background-color` change on `#FAFAFA`.

## Accessibility

- Each ticker card is a focusable `<button>` (keyboard `Enter` opens methodology drawer).
- Methodology drawer has `role="dialog"`, focus-trap inside the panel, `Esc` closes.
- Reduced-motion users get a horizontally scrollable static strip.
- Color is never the sole signal: every delta has an arrow glyph and a written number alongside its color.
- Section headings are real `<h2>` elements; subheads are `<p>`. Card headlines are `<h3>`.

## Verification

After implementation, dev server check at `http://localhost:3000`:

1. Ticker renders 22 cards, loops without flicker, pauses on hover.
2. Click ticker card → drawer opens with methodology note and sub-rows (where applicable).
3. WASH, Gender, Financial Services cards each show a "More breakdown ↓" hint and surface sub-rows in the drawer.
4. "More and better-paid jobs" shows "Coming soon" and gray styling.
5. Trending Across IDA renders left big card + right stack on `xl`, stacks on smaller.
6. Three What's-Changing groups render with correct icon tints and `+`/`-`/`New` styling.
7. Counter Intuitive Findings: 4 cards, no charts, icons only.
8. System Pattern grid: 6 tiles on `xl`, responsive collapse correctly.
9. No editorial photography anywhere on the landing page.
10. Search hero, prompt bar, AI sidebar, and all post-search flows unchanged.

## Open questions / risks

- **Counted indicator name length.** Several names are very long (e.g. #6 tax-revenues-to-GDP). The 220px ticker card may have to two-line-clamp aggressively. If the truncated text is unreadable, we may need a 240–260px card or a shorter display name field on the indicator type.
- **Sparkline data is fake.** No historical data is wired in; the polylines are mocked arrays. Replace with real history when the data pipeline exists.
- **Mock editorial content** in Trending Across IDA, Counter Intuitive Findings, and System Patterns has placeholder text. Replace before any external review.

## Next step

Hand off to `superpowers:writing-plans` to produce a step-by-step implementation plan.
