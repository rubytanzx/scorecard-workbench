# Landing Page Redesign — Design Spec
_Date: 2026-05-13_

## Overview

Redesign the IDA Scorecard landing page to make the 22 FY25 result indicators front and centre, reduce visual clutter, and connect editorial narrative content to the underlying data through an interactive flip mechanic on story tiles.

The prompt bar and AI exploration flow remain unchanged.

---

## Design Principles

1. **Numbers as the product** — the 22 indicators are the hero, not a supporting section.
2. **Anchor on impact** — every surface (indicator card, narrative tile, narrative flow) leads with what was achieved.
3. **Less visual noise** — remove images from the editorial feed; strip decoration from indicator cards.
4. **Narratives connect to data** — story tiles reveal their driving indicators on flip, not through a separate section.
5. **Prompt stays sovereign** — the AI prompt bar retains its current position and behaviour.

---

## Page Structure (top to bottom)

### 1. Nav — unchanged

### 2. Hero — unchanged
- Centred prompt bar (hero mode)
- Three action pills: "What's surging?", "Stalling indicators", "Biggest movers vs last FY"

### 3. Our Results band
A compact scorecard strip between the hero and the editorial feed.

**Header row:**
- Left: label "OUR RESULTS · FY25" (uppercase, 10px, muted)
- Right: "View all 22 →" link — no-op in this sprint (button rendered but not wired to a destination; navigation target is out of scope)

**Indicator grid:**
- Flat 8-column grid, no group labels or separators
- All 15 indicators from the Figma design displayed (full 22 when real data is wired)
- Each card: white bg, 9px border-radius, 9–10px padding

**Indicator card anatomy (front face):**
```
[label — 9px muted]
[number — 15px Open Sans Light]
[vs-target — 8px muted grey]   OR   [↑ Exceeded — 8px green]
```

**Indicator card flip (back face):**  
On hover/click, card flips (CSS 3D rotateY, 500ms ease) to reveal:
- Methodology note: what counts toward this number, data source, filters applied
- "How this is measured →" link to the PDF methodology note

Card colours: white front, `#1A1A2E` back. No group colour coding on the cards themselves.

**Data source:** Pull from existing mock data in `lib/mockData.ts`; replace with live XLSX data in a follow-up.

---

### 4. Topics Trending — redesigned tiles
Keeps the existing 2fr+1fr+1fr grid layout and section header.

**Changes:**
- Remove images/thumbnails from story cards entirely
- Card is text-only: tag chip + Crimson Pro headline + institution badges + date

**Flip mechanic (the key new interaction):**
- Hover (desktop) or tap (mobile) flips the story card (rotateY, 500ms)
- **Back face** shows:
  - "DRIVING INDICATORS" label
  - 2–4 indicator rows: coloured dot · indicator label · achieved number · % of target
  - "Read full narrative →" CTA (links to `scorecard.worldbank.org/en/narratives/[slug]`)
- Back face background: `#003F6B` for featured card, `#1A1A2E` for secondary cards

**Indicator–narrative mapping** (which indicators appear on which card's back):

| Narrative slug | Driving indicators |
|---|---|
| `healthier-lives` | Health services, Health emergencies, Displaced people |
| `no-learning-poverty` | Students, Gender equality |
| `protection-for-the-poorest` | Safety nets, Food security |
| `green-and-blue-planet` | Hectares conserved, Climate resilience, GHG |
| `sustainable-food-systems` | Food security, WASH |
| `more-private-investments` | Private capital mobilized, Private capital enabled, Financial services |
| `digital-connectivity` | Broadband |
| `gender-equality-and-youth-inclusion` | Gender equality, Students |
| `better-lives-for-people-in-fragility` | Displaced people, Health emergencies |

Mapping lives in a static config object in the component or `lib/mockData.ts`.

---

### 5. What's Changing Right Now — unchanged
Chart cards remain as-is. No flip mechanic here.

### 6. Counter Intuitive Findings — unchanged

### 7. Explore by Patterns — unchanged

### 8. Footer / sidebar — unchanged

---

## New Components

### `ResultsBand`
`components/ResultsBand.tsx`

Props:
```ts
interface ResultsBandProps {
  indicators: Indicator[]        // flat array, no grouping
  onViewAll?: () => void
}

interface Indicator {
  id: string
  label: string
  achieved: string               // display string e.g. "379M"
  target: string                 // display string e.g. "of 466M"
  exceeded?: boolean             // true → show green "↑ Exceeded" instead of target
  methodologyNote?: string       // shown on card back face
  methodologyUrl?: string        // link to PDF
}
```

Behaviour:
- Renders the compact 8-column grid
- Each card is independently flippable (CSS classes, no JS state needed for basic flip)
- Flip triggered by `:hover` on desktop; `onClick` toggle on mobile (touch device detection via pointer media query)

### `FlipStoryCard`
`components/FlipStoryCard.tsx`

Extends the existing `Story` type (from `lib/mockData.ts`) with two new optional fields, added directly to `Story`:
```ts
interface FlipStoryCardProps extends Story {
  drivingIndicators: DrivingIndicator[]
  narrativeUrl: string
}

interface DrivingIndicator {
  label: string
  achieved: string
  percentOfTarget: string
  color: string                  // dot colour from design system
}
```

Replaces `StoryCard` in the Topics Trending section for cards that have a narrative mapping. Cards without a mapping render as plain `StoryCard` (no flip).

---

## Data Changes

### `lib/mockData.ts`
- Add optional `drivingIndicators: DrivingIndicator[]` and `narrativeUrl: string` to the `Story` type
- Populate these fields on the existing `featuredStory` and all entries in `secondaryStories` that map to a known narrative slug (see mapping table above). Stories without a mapping get no flip.
- Add a new `indicators` export: flat array of `Indicator` objects for the Results band (15 entries from the Figma design, with placeholder `methodologyNote` strings)

### `app/page.tsx`
- Import and render `ResultsBand` between the hero section and the Topics Trending section
- Replace `StoryCard` with `FlipStoryCard` in the Topics Trending map where a narrative mapping exists

---

## Animations

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Indicator card flip | `rotateY(180deg)` | 500ms | `cubic-bezier(0.4,0,0.2,1)` |
| Story tile flip | `rotateY(180deg)` | 500ms | `cubic-bezier(0.4,0,0.2,1)` |
| Card hover lift | `translateY(-1px)` + shadow | 150ms | ease |

Both flip animations use CSS `transform-style: preserve-3d` and `backface-visibility: hidden`. No JS animation libraries needed.

---

## Out of Scope

- Wiring live XLSX data to indicator cards (follow-up)
- The narrative detail page / full narrative flow (existing NarrativePanel handles this)
- Mobile-specific layout changes beyond pointer-media flip trigger
- Indicator card back face content (methodology notes) — placeholder text only in this sprint

---

## Success Criteria

1. `ResultsBand` renders all 15 mock indicators in a flat grid above Topics Trending
2. Hovering an indicator card flips it to show the back face
3. Hovering a story tile flips it to show 2–4 driving indicators with numbers
4. "Read full narrative →" on the story tile back face opens the correct `scorecard.worldbank.org` URL
5. No images remain in the Topics Trending section
6. Existing sections (What's Changing, Counter Intuitive, Patterns) are unaffected
7. Prompt bar behaviour is unchanged across all scroll states
