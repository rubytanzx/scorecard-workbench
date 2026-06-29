# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a flat indicator results band and CSS flip mechanic to story tiles on the IDA Scorecard landing page.

**Architecture:** Three new/modified layers — (1) `lib/mockData.ts` gets new types and data, (2) two new components (`ResultsBand`, `FlipStoryCard`) encapsulate the UI, (3) `app/page.tsx` wires them in. Existing components (`StoryCard`, `FeaturedStoryCard`) receive a minimal `noImage` prop to strip images from Topics Trending. No JS animation libraries; all flips are CSS 3D transforms driven by React hover/click state.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, inline styles for 3D CSS transforms. No new dependencies.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `lib/mockData.ts` | Add `DrivingIndicator`, `Indicator` types; add `drivingIndicators`/`narrativeUrl` to `Story`; export 15-entry `indicators` array; populate story-2, story-3 |
| Create | `components/ResultsBand.tsx` | Flat 8-col indicator grid with CSS flip cards |
| Create | `components/FlipStoryCard.tsx` | Text-only story card with CSS flip to driving-indicator back face |
| Modify | `components/StoryCard.tsx` | Add `noImage?: boolean` prop to strip image section |
| Modify | `components/FeaturedStoryCard.tsx` | Add `noImage?: boolean` prop to strip image side |
| Modify | `app/page.tsx` | Import `ResultsBand`, render between hero and Topics Trending; use `FlipStoryCard` for mapped stories; pass `noImage` to all Topics Trending cards |

---

## Task 1: Extend `lib/mockData.ts` with types and data

**Files:**
- Modify: `lib/mockData.ts`

### What to add

- `DrivingIndicator` interface (exported)
- `Indicator` interface (exported)
- Two optional fields on `Story`: `drivingIndicators?: DrivingIndicator[]` and `narrativeUrl?: string`
- `indicators` export: 15-entry flat array
- Populate `story-2` and `story-3` entries in `secondaryStories` with their driving indicators and narrative URLs

- [ ] **Step 1: Add `DrivingIndicator` interface after the `ThumbVariant` type (line 17)**

Insert after `export type ThumbVariant = ...`:

```ts
export interface DrivingIndicator {
  label: string;
  achieved: string;
  percentOfTarget: string;
  color: string;
}
```

- [ ] **Step 2: Add optional fields to the `Story` interface**

Add after the `viewerPrompt?: string` field (line 41):

```ts
  drivingIndicators?: DrivingIndicator[];
  narrativeUrl?: string;
```

- [ ] **Step 3: Add `Indicator` interface after the `FeaturedStory` interface (after line 46)**

Insert after `export interface FeaturedStory extends Story { ... }`:

```ts
export interface Indicator {
  id: string;
  label: string;
  achieved: string;
  target: string;
  exceeded?: boolean;
  methodologyNote?: string;
  methodologyUrl?: string;
}
```

- [ ] **Step 4: Populate `story-2` with `drivingIndicators` and `narrativeUrl`**

In `secondaryStories`, `story-2` is the digital connectivity story. Add these fields to its object:

```ts
narrativeUrl: "https://scorecard.worldbank.org/en/narratives/digital-connectivity/results-narrative",
drivingIndicators: [
  { label: "Broadband", achieved: "217M", percentOfTarget: "121%", color: "#00A0DF" },
],
```

- [ ] **Step 5: Populate `story-3` with `drivingIndicators` and `narrativeUrl`**

In `secondaryStories`, `story-3` is the climate resilience story. Add:

```ts
narrativeUrl: "https://scorecard.worldbank.org/en/narratives/green-and-blue-planet/results-narrative",
drivingIndicators: [
  { label: "Hectares conserved", achieved: "93M ha", percentOfTarget: "116%", color: "#2E8B57" },
  { label: "Climate resilience", achieved: "244M", percentOfTarget: "57%", color: "#00A0DF" },
  { label: "GHG reduction", achieved: "185M tCO₂", percentOfTarget: "93%", color: "#6B4FA0" },
],
```

- [ ] **Step 6: Add `indicators` export at the end of `lib/mockData.ts`**

Append after the `scorecardVerticals` export:

```ts
// ─── Results Band Indicators ──────────────────────────────────────────────────

export const indicators: Indicator[] = [
  {
    id: "ind-health-services",
    label: "Health services",
    achieved: "370M",
    target: "of 466M",
    methodologyNote: "People accessing health services through IDA-supported projects. Includes primary care, maternal health, and community health workers.",
  },
  {
    id: "ind-students",
    label: "Students",
    achieved: "325M",
    target: "of 580M",
    methodologyNote: "Students benefiting from WBG education investments across primary, secondary, and tertiary levels in IDA countries.",
  },
  {
    id: "ind-safety-nets",
    label: "Safety nets",
    achieved: "244M",
    target: "of 320M",
    methodologyNote: "People benefiting from social protection programs including cash transfers, food vouchers, and social insurance schemes.",
  },
  {
    id: "ind-climate-resilience",
    label: "Climate resilience",
    achieved: "244M",
    target: "of 425M",
    methodologyNote: "People with strengthened climate resilience through IDA adaptation projects, early warning systems, and climate-smart infrastructure.",
  },
  {
    id: "ind-gender-equality",
    label: "Gender equality",
    achieved: "62M",
    target: "of 80M",
    methodologyNote: "Women and girls benefiting from programs explicitly targeting gender gaps in education, health, finance, and labor markets.",
  },
  {
    id: "ind-health-emergencies",
    label: "Health emergencies",
    achieved: "87M",
    target: "of 95M",
    methodologyNote: "People reached through IDA-financed emergency health response, including disease outbreak containment and health system strengthening in crisis settings.",
  },
  {
    id: "ind-electricity",
    label: "Electricity access",
    achieved: "215M",
    target: "of 576M",
    methodologyNote: "People gaining first-time or improved electricity access through IDA energy projects, including grid and off-grid solutions.",
  },
  {
    id: "ind-private-capital-mobilized",
    label: "Private capital mobilized",
    achieved: "$12B",
    target: "of $18B",
    methodologyNote: "Private capital mobilized by IFC and MIGA in IDA-eligible countries, measured at commitment. Excludes sub-national guarantees.",
  },
  {
    id: "ind-displaced-people",
    label: "Displaced people",
    achieved: "4.2M",
    target: "of 5.8M",
    methodologyNote: "Forcibly displaced people and host communities supported through IDA projects addressing protection, livelihoods, and durable solutions.",
  },
  {
    id: "ind-broadband",
    label: "Broadband",
    achieved: "217M",
    target: "of 180M",
    exceeded: true,
    methodologyNote: "People with improved broadband access through IDA digital infrastructure projects. Includes mobile broadband where fixed broadband is unavailable.",
  },
  {
    id: "ind-hectares",
    label: "Hectares conserved",
    achieved: "93M ha",
    target: "of 80M ha",
    exceeded: true,
    methodologyNote: "Land area brought under improved natural resource management, including forests, wetlands, and protected marine areas.",
  },
  {
    id: "ind-food-security",
    label: "Food security",
    achieved: "180M",
    target: "of 200M",
    methodologyNote: "People with improved food security outcomes through IDA agriculture, nutrition, and resilient food systems investments.",
  },
  {
    id: "ind-ghg",
    label: "GHG reduction",
    achieved: "185M tCO₂",
    target: "of 200M tCO₂",
    methodologyNote: "Greenhouse gas emission reductions attributable to IDA-financed climate mitigation projects, measured over project lifetime.",
  },
  {
    id: "ind-wash",
    label: "WASH",
    achieved: "89M",
    target: "of 120M",
    methodologyNote: "People with access to improved water supply, sanitation, and hygiene through IDA WASH investments.",
  },
  {
    id: "ind-financial-services",
    label: "Financial services",
    achieved: "$28B",
    target: "of $35B",
    methodologyNote: "Volume of financial services accessed by households and firms in IDA countries through IFC and IDA-supported financial sector projects.",
  },
];
```

- [ ] **Step 7: TypeScript check**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit
```

Expected: no errors related to `mockData.ts`.

- [ ] **Step 8: Commit**

```bash
git add lib/mockData.ts
git commit -m "feat: add Indicator/DrivingIndicator types and mock data for results band"
```

---

## Task 2: Create `components/ResultsBand.tsx`

**Files:**
- Create: `components/ResultsBand.tsx`

Each indicator card flips on hover (desktop: `onMouseEnter`/`onMouseLeave`; mobile: `onClick`). The flip is a CSS 3D `rotateY(180deg)` on the inner element using `transform-style: preserve-3d`. Both faces use `backface-visibility: hidden` and `position: absolute` within a fixed-height container.

- [ ] **Step 1: Create `components/ResultsBand.tsx`**

```tsx
"use client";

import { useState } from "react";
import { type Indicator } from "@/lib/mockData";

interface ResultsBandProps {
  indicators: Indicator[];
  onViewAll?: () => void;
}

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    // On touch devices (no hover), onClick toggles the flip.
    if (!window.matchMedia("(hover: hover)").matches) {
      setFlipped((v) => !v);
    }
  };

  return (
    <div
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={handleClick}
      style={{ perspective: 600, cursor: "pointer" }}
      aria-label={`${indicator.label}: ${indicator.achieved}`}
    >
      {/* Flipper */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "none",
          position: "relative",
          minHeight: 84,
        }}
      >
        {/* Front face */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "#FFFFFF",
            borderRadius: 9,
            padding: "9px 10px",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "#6B7280",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.3,
            }}
          >
            {indicator.label}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#0D1A2B",
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            {indicator.achieved}
          </div>
          {indicator.exceeded ? (
            <div
              style={{
                fontSize: 8,
                color: "#07ab50",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ↑ Exceeded
            </div>
          ) : (
            <div
              style={{
                fontSize: 8,
                color: "#9CA3AF",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {indicator.target}
            </div>
          )}
        </div>

        {/* Back face */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#1A1A2E",
            borderRadius: 9,
            padding: "9px 10px",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <p
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.5,
              overflow: "hidden",
              margin: 0,
            }}
          >
            {indicator.methodologyNote ?? "Methodology note coming soon."}
          </p>
          {indicator.methodologyUrl ? (
            <a
              href={indicator.methodologyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 8,
                color: "#00A0DF",
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: "none",
                flexShrink: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              How this is measured →
            </a>
          ) : (
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              Methodology PDF coming soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsBand({ indicators, onViewAll }: ResultsBandProps) {
  return (
    <section aria-label="Our Results FY25" style={{ marginBottom: 32 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "#9CA3AF",
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          Our Results · FY25
        </span>
        <button
          onClick={onViewAll}
          style={{
            fontSize: 12,
            color: "#003F6B",
            fontFamily: "'DM Sans', sans-serif",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          View all 22 →
        </button>
      </div>

      {/* Indicator grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 8,
          background: "#F8F7F4",
          borderRadius: 12,
          padding: 12,
        }}
      >
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ResultsBand.tsx
git commit -m "feat: add ResultsBand component with CSS flip indicator cards"
```

---

## Task 3: Create `components/FlipStoryCard.tsx`

**Files:**
- Create: `components/FlipStoryCard.tsx`

Front face: text-only (no image) — tag badge + Crimson Pro headline + institution logos + date. Back face: dark bg (`#003F6B` for featured, `#1A1A2E` for secondary) + "DRIVING INDICATORS" label + indicator rows (dot · label · number · %) + "Read full narrative →" CTA.

The front face is in normal document flow (sets the height). The back face is `position: absolute` filling the same bounding box. Hover flips on desktop; click-toggle on touch devices.

- [ ] **Step 1: Create `components/FlipStoryCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { type Story } from "@/lib/mockData";
import StoryTagBadge from "./StoryTagBadge";
import InstitutionLogos from "./InstitutionLogos";

interface FlipStoryCardProps {
  story: Story & {
    drivingIndicators: NonNullable<Story["drivingIndicators"]>;
    narrativeUrl: string;
  };
  featured?: boolean;
}

export default function FlipStoryCard({ story, featured = false }: FlipStoryCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    if (!window.matchMedia("(hover: hover)").matches) {
      setFlipped((v) => !v);
    }
  };

  const backBg = featured ? "#003F6B" : "#1A1A2E";

  return (
    <div
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={handleClick}
      style={{ perspective: 1000, cursor: "pointer" }}
    >
      {/* Flipper */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "none",
          position: "relative",
        }}
      >
        {/* Front face — normal flow, sets height */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            background: "#FFFFFF",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 200,
          }}
        >
          <StoryTagBadge tag={story.tag} />
          <h3
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 15,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.4,
              flex: 1,
              margin: 0,
            }}
          >
            {story.headline}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 10,
              borderTop: "1px solid #F3F4F6",
              marginTop: "auto",
            }}
          >
            <InstitutionLogos institutions={story.institutions} />
            {story.lastUpdated && (
              <span
                style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {story.lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Back face — absolute, fills front dimensions */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 12,
            background: backBg,
            padding: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* "DRIVING INDICATORS" label */}
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            Driving Indicators
          </div>

          {/* Indicator rows */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {story.drivingIndicators.map((ind) => (
              <div
                key={ind.label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: ind.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "'DM Sans', sans-serif",
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {ind.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#FFFFFF",
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {ind.achieved}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Mono', monospace",
                    flexShrink: 0,
                    minWidth: 32,
                    textAlign: "right",
                  }}
                >
                  {ind.percentOfTarget}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={story.narrativeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 14,
              fontSize: 11,
              fontWeight: 600,
              color: "#00A0DF",
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Read full narrative →
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/FlipStoryCard.tsx
git commit -m "feat: add FlipStoryCard component with CSS flip to driving indicators"
```

---

## Task 4: Add `noImage` prop to `StoryCard`

**Files:**
- Modify: `components/StoryCard.tsx:12-15` (Props interface) and `components/StoryCard.tsx:20` (function signature) and `components/StoryCard.tsx:86-99` (image rendering block)

- [ ] **Step 1: Add `noImage` to Props interface**

Current code at line 12:
```ts
interface Props {
  story: Story;
  overlay?: boolean;
}
```

Replace with:
```ts
interface Props {
  story: Story;
  overlay?: boolean;
  noImage?: boolean;
}
```

- [ ] **Step 2: Add `noImage` to function signature**

Current at line 20:
```ts
export default function StoryCard({ story, overlay }: Props) {
```

Replace with:
```ts
export default function StoryCard({ story, overlay, noImage }: Props) {
```

- [ ] **Step 3: Wrap the image block (non-overlay path) in a `!noImage` guard**

In the non-overlay branch, the image section is currently:
```tsx
      {/* Image / Thumbnail */}
      {story.thumbVariant ? (
        <StoryThumbnail variant={story.thumbVariant} className="h-[168px]" />
      ) : story.imageSrc ? (
        <div className="relative h-[168px] overflow-hidden bg-gray-100">
          <Image
            src={story.imageSrc}
            alt={story.imageAlt ?? ""}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-[168px] bg-gradient-to-br from-slate-100 to-slate-200" />
      )}
```

Replace with:
```tsx
      {/* Image / Thumbnail */}
      {!noImage && (story.thumbVariant ? (
        <StoryThumbnail variant={story.thumbVariant} className="h-[168px]" />
      ) : story.imageSrc ? (
        <div className="relative h-[168px] overflow-hidden bg-gray-100">
          <Image
            src={story.imageSrc}
            alt={story.imageAlt ?? ""}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-[168px] bg-gradient-to-br from-slate-100 to-slate-200" />
      ))}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/StoryCard.tsx
git commit -m "feat: add noImage prop to StoryCard"
```

---

## Task 5: Add `noImage` prop to `FeaturedStoryCard`

**Files:**
- Modify: `components/FeaturedStoryCard.tsx:7-8` (Props) and `components/FeaturedStoryCard.tsx:14` (signature) and `components/FeaturedStoryCard.tsx:50-64` (image side)

- [ ] **Step 1: Add `noImage` to Props and function signature**

Current Props and signature:
```ts
interface Props {
  story: FeaturedStory;
}

export default function FeaturedStoryCard({ story }: Props) {
```

Replace with:
```ts
interface Props {
  story: FeaturedStory;
  noImage?: boolean;
}

export default function FeaturedStoryCard({ story, noImage }: Props) {
```

- [ ] **Step 2: Wrap the image side in a `!noImage` guard**

The image side is currently:
```tsx
      {/* Image / Thumbnail side */}
      {story.thumbVariant ? (
        <StoryThumbnail
          variant={story.thumbVariant}
          className="hidden sm:block w-[280px] lg:w-[320px] shrink-0"
        />
      ) : story.imageSrc ? (
        <div className="hidden sm:block relative w-[280px] lg:w-[320px] shrink-0 overflow-hidden">
          <Image
            src={story.imageSrc}
            alt={story.imageAlt ?? ""}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      ) : null}
```

Replace with:
```tsx
      {/* Image / Thumbnail side */}
      {!noImage && (story.thumbVariant ? (
        <StoryThumbnail
          variant={story.thumbVariant}
          className="hidden sm:block w-[280px] lg:w-[320px] shrink-0"
        />
      ) : story.imageSrc ? (
        <div className="hidden sm:block relative w-[280px] lg:w-[320px] shrink-0 overflow-hidden">
          <Image
            src={story.imageSrc}
            alt={story.imageAlt ?? ""}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      ) : null)}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/FeaturedStoryCard.tsx
git commit -m "feat: add noImage prop to FeaturedStoryCard"
```

---

## Task 6: Wire everything into `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

Three changes:
1. Import `ResultsBand`, `FlipStoryCard`, and `indicators` from their respective modules.
2. Render `<ResultsBand>` between `<SearchHero>` and the 2-column flex layout.
3. In Topics Trending, replace `StoryCard` with `FlipStoryCard` for stories that have `drivingIndicators` and `narrativeUrl`, pass `noImage` to `FeaturedStoryCard` and any remaining `StoryCard` renders.

- [ ] **Step 1: Add imports**

Current import block (lines 14–35) includes component and data imports. Add these two lines after the existing component imports (after the `PromptBar` import):

```ts
import ResultsBand from "@/components/ResultsBand";
import FlipStoryCard from "@/components/FlipStoryCard";
```

And in the data import block, add `indicators` to the destructured import from `@/lib/mockData`:

```ts
import {
  featuredStory,
  secondaryStories,
  changingCards,
  counterIntuitiveCards,
  patternCards,
  indicators,
} from "@/lib/mockData";
```

- [ ] **Step 2: Add `ResultsBand` between `SearchHero` and the 2-col layout**

Current code around line 563:
```tsx
        <SearchHero onPillClick={setPromptValue} />

        {/* Main 2-col layout */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
```

Replace with:
```tsx
        <SearchHero onPillClick={setPromptValue} />

        <FadeIn delay={25}>
          <ResultsBand indicators={indicators} />
        </FadeIn>

        {/* Main 2-col layout */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
```

- [ ] **Step 3: Update the Topics Trending section**

The current Topics Trending section renders `FeaturedStoryCard` (no changes to the component call, just add `noImage`) and a `secondaryStories.map` that picks `StoryCard`.

**3a. Add `noImage` to `FeaturedStoryCard`:**

Current:
```tsx
              <FadeIn delay={100}>
                <FeaturedStoryCard story={featuredStory} />
              </FadeIn>
```

Replace with:
```tsx
              <FadeIn delay={100}>
                <FeaturedStoryCard story={featuredStory} noImage />
              </FadeIn>
```

**3b. Replace the `secondaryStories.map` render logic:**

Current map (lines 581–608):
```tsx
              <FadeIn delay={150}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {secondaryStories.map((story) => {
                    if (story.viewerPrompt) {
                      return (
                        <div
                          key={story.id}
                          className="cursor-pointer"
                          onClick={() => handleOpenViewer(story.viewerPrompt!, story.headline)}
                        >
                          <StoryCard story={{ ...story, href: undefined }} />
                        </div>
                      );
                    }
                    if (story.id === "story-3") {
                      return (
                        <div
                          key={story.id}
                          className="cursor-pointer"
                          onClick={() => setModalStory(story)}
                        >
                          <StoryCard story={{ ...story, href: undefined }} />
                        </div>
                      );
                    }
                    return <StoryCard key={story.id} story={story} />;
                  })}
                </div>
              </FadeIn>
```

Replace with:
```tsx
              <FadeIn delay={150}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {secondaryStories.map((story) => {
                    // Stories with narrative mapping use FlipStoryCard.
                    if (story.drivingIndicators && story.narrativeUrl) {
                      return (
                        <FlipStoryCard
                          key={story.id}
                          story={
                            story as Story & {
                              drivingIndicators: NonNullable<Story["drivingIndicators"]>;
                              narrativeUrl: string;
                            }
                          }
                        />
                      );
                    }
                    // Stories that open the viewer.
                    if (story.viewerPrompt) {
                      return (
                        <div
                          key={story.id}
                          className="cursor-pointer"
                          onClick={() => handleOpenViewer(story.viewerPrompt!, story.headline)}
                        >
                          <StoryCard story={{ ...story, href: undefined }} noImage />
                        </div>
                      );
                    }
                    // story-3 opens the detail modal (handled below by FlipStoryCard
                    // once it has a mapping; for now it would already be covered above).
                    if (story.id === "story-3") {
                      return (
                        <div
                          key={story.id}
                          className="cursor-pointer"
                          onClick={() => setModalStory(story)}
                        >
                          <StoryCard story={{ ...story, href: undefined }} noImage />
                        </div>
                      );
                    }
                    return <StoryCard key={story.id} story={story} noImage />;
                  })}
                </div>
              </FadeIn>
```

Note: story-3 has `drivingIndicators` (green-and-blue-planet mapping) so it will be rendered by `FlipStoryCard` and the `story.id === "story-3"` branch is dead code after Task 1. The `story as ...` cast is safe because the `drivingIndicators && narrativeUrl` guard has already confirmed those fields are set.

You'll also need to add `Story` to the named imports from `@/lib/mockData`:

```ts
import {
  type Story,
  featuredStory,
  secondaryStories,
  changingCards,
  counterIntuitiveCards,
  patternCards,
  indicators,
} from "@/lib/mockData";
```

(The `Story` type may already be imported implicitly via component props; add it explicitly as a type import to use in the cast.)

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Start dev server and visual verification**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npm run dev
```

Open `http://localhost:3000`. Verify:

1. **Results band** appears between the SearchHero and Topics Trending — compact strip, 8-column grid, "OUR RESULTS · FY25" header.
2. **Hover an indicator card** — it flips 180° over 500ms to reveal the dark back face with methodology note.
3. **Exceeded cards** (Broadband, Hectares conserved) show "↑ Exceeded" in green on the front face.
4. **Story cards in Topics Trending** have no images — text-only front face with tag chip, headline, institutions, date.
5. **story-2 and story-3 hover** — card flips to reveal "DRIVING INDICATORS" label, indicator rows with coloured dots and numbers, and "Read full narrative →" link.
6. **story-1** (viewer-prompt story) renders as plain `StoryCard` with no image.
7. **FeaturedStoryCard** renders text-only (no right-side image).
8. **What's Changing, Counter Intuitive, Patterns** sections are unaffected.
9. **Prompt bar** behaviour is unchanged across all scroll states.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: integrate ResultsBand and FlipStoryCard into landing page"
```

---

## Self-Review Against Spec

| Spec requirement | Task that covers it |
|---|---|
| `ResultsBand` renders 15 mock indicators | Task 1 (data) + Task 2 (component) |
| Hovering indicator card flips to back face | Task 2 |
| Hovering story tile flips to driving indicators | Task 3 |
| "Read full narrative →" opens correct URL | Task 1 (data) + Task 3 (link) |
| No images in Topics Trending | Tasks 4, 5, 6 |
| `FlatGrid` 8-column, no group labels | Task 2 |
| `#1A1A2E` back on indicator cards | Task 2 |
| `#003F6B` featured / `#1A1A2E` secondary back on story tiles | Task 3 (`featured` prop) |
| Exceeded shows green "↑ Exceeded" | Task 1 (data flag) + Task 2 (render) |
| "View all 22 →" no-op button | Task 2 (button with no handler) |
| Existing sections unaffected | Task 6 (only Topics Trending modified) |
| Prompt bar unchanged | Task 6 (no touch to PromptBar) |
| CSS flip: `rotateY(180deg)`, 500ms, cubic-bezier | Tasks 2, 3 |
| `transform-style: preserve-3d` + `backface-visibility: hidden` | Tasks 2, 3 |
