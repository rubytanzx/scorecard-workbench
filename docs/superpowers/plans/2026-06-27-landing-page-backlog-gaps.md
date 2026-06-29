# Landing Page Backlog Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the three landing-page gaps identified against the product backlog: action pill dropdowns (US014), Trending Insights enhancements (US042), and Indicator Movements directional arrows + timestamps (US041).

**Architecture:** All changes are pure UI — no new API routes or data fetching. New golden-prompt data goes in a static constant file. InsightCard type gains two optional fields; the JSON mock data is updated inline. MomentumGroup row rendering gains directional colour and arrow logic driven by the existing `delta` string already in the data.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS, Open Sans font, `@tabler/icons-react`

## Global Constraints

- Font family: `'Open Sans', sans-serif` everywhere — no Crimson Pro
- Background palette base: `#112531`; cards stay white/glass on top
- Section headings: 36px / weight 300 / line-height 48px / letter-spacing -1.89px / `rgba(0,13,26,0.96)` — but on the dark landing page these are already `rgba(255,255,255,0.95)` at ~26–28px/300 — keep consistent with existing headings in the file
- No new dependencies — use tabler icons already installed
- `dev` server must remain healthy (`curl localhost:3000` returns 200) after every task

---

## File Map

| File | Change |
|---|---|
| `components/SearchHero.tsx` | Replace flat pills with 5 labelled action options; first 3 get dropdown menus |
| `data/goldenPrompts.ts` | **New** — static golden-prompt lists for Explore / Analyse / Explain Contributions |
| `lib/insightSynth.ts` | Add `insight_type` and `engagement_count` fields to `InsightCard` interface |
| `data/insights.json` | Add `insight_type` and `engagement_count` to each of the 3 seeded cards |
| `components/SynthesizedInsights.tsx` | Render insight-type pill + engagement count + "Updated" timestamp |
| `components/MomentumGroups.tsx` | Render directional arrow + colour-coded achieved value + "Updated" timestamp |

---

## Task 1: Golden Prompts Data File

**Files:**
- Create: `data/goldenPrompts.ts`

### What to build
A static typed export of the three dropdown menus. Each entry has a `label` (shown in the dropdown) and `prompt` (pre-filled into the prompt bar on click).

- [ ] **Create `data/goldenPrompts.ts`**

```ts
export interface GoldenPrompt {
  label: string;
  prompt: string;
}

export interface ActionMenu {
  id: string;
  label: string;
  prompts: GoldenPrompt[];
}

export const ACTION_MENUS: ActionMenu[] = [
  {
    id: "explore",
    label: "Explore the Scorecard",
    prompts: [
      { label: "What does the scorecard measure?",                prompt: "What does the WBG Scorecard measure and how is it structured?" },
      { label: "Which outcome areas have the most indicators?",   prompt: "Which outcome areas have the most indicators in the scorecard?" },
      { label: "How are FY25 results reported?",                  prompt: "How are FY25 results reported and what is the reporting timeline?" },
      { label: "What is IDA's role in the scorecard?",            prompt: "What is IDA's role in the WBG Corporate Scorecard?" },
    ],
  },
  {
    id: "analyse",
    label: "Analyse",
    prompts: [
      { label: "Compare electricity access across regions",        prompt: "Compare electricity access results across regions in FY25" },
      { label: "Which indicators are furthest behind target?",     prompt: "Which scorecard indicators are furthest behind their FY25 targets?" },
      { label: "Show me education outcomes by country",            prompt: "Show education outcomes by country for IDA clients in FY25" },
      { label: "How has health coverage trended since FY23?",      prompt: "How has health service coverage trended from FY23 to FY25?" },
    ],
  },
  {
    id: "explain",
    label: "Explain Contributions",
    prompts: [
      { label: "Why did broadband access surge?",                  prompt: "Why did broadband internet access surge beyond its FY25 target?" },
      { label: "What drove the renewable energy results?",         prompt: "What contributed most to renewable energy results in FY25?" },
      { label: "Which countries drove health improvements?",       prompt: "Which countries contributed most to health service improvements?" },
      { label: "What's behind the safety nets progress?",         prompt: "What factors are behind progress in social safety net beneficiaries?" },
    ],
  },
];
```

- [ ] **Verify dev server still healthy**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expected: 200
```

---

## Task 2: Action Pills → Dropdown Menus (US014)

**Files:**
- Modify: `components/SearchHero.tsx`
- Consumes: `data/goldenPrompts.ts` → `ACTION_MENUS`, `ActionMenu`, `GoldenPrompt`

### What to build
Replace the 4 flat ACTION_PILLS with a row of 5 action options:
- Options 1–3 (Explore / Analyse / Explain Contributions): clicking toggles a dropdown of golden prompts below the row. Clicking a prompt calls `onPillClick(prompt)` and closes the dropdown.
- Option 4 (Build a Narrative): calls `onCreateNarrative()` — keep existing gleam button style.
- Option 5 (Build a Results Narrative): calls `onCreateResultsNarrative()` — keep existing teal gleam style.

Only one dropdown is open at a time. Clicking outside or pressing Escape closes it. The dropdown renders below the pill row, not inline.

- [ ] **Replace the content of `components/SearchHero.tsx`** with the following:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconSearch,
  IconChartBar,
  IconSitemap,
  IconNotebook,
  IconBook2,
  IconChevronDown,
} from "@tabler/icons-react";
import ScorecardStats from "./ScorecardStats";
import { ACTION_MENUS } from "@/data/goldenPrompts";

const F = "'Open Sans', sans-serif";

interface Props {
  onPillClick: (prompt: string) => void;
  onCreateNarrative: () => void;
  onCreateResultsNarrative: () => void;
}

const MENU_ICONS = {
  explore: IconSearch,
  analyse: IconChartBar,
  explain: IconSitemap,
} as const;

export default function SearchHero({ onPillClick, onCreateNarrative, onCreateResultsNarrative }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openMenu]);

  // Close on Escape
  useEffect(() => {
    if (!openMenu) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenMenu(null); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [openMenu]);

  const handlePromptClick = (prompt: string) => {
    onPillClick(prompt);
    setOpenMenu(null);
  };

  return (
    <section
      className="relative w-full flex flex-col items-center"
      style={{ paddingTop: 88 }}
    >
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: F,
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.88)",
            margin: 0,
            lineHeight: 1.18,
            letterSpacing: "-0.03em",
          }}
        >
          The World Bank Group
        </h1>
        <h1
          style={{
            fontFamily: F,
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.96)",
            margin: 0,
            lineHeight: 1.18,
            letterSpacing: "-0.03em",
          }}
        >
          Scorecard Workbench
        </h1>
      </div>

      {/* Stats strip */}
      <ScorecardStats />

      {/* Spacer below stats, above the fixed prompt bar */}
      <div style={{ height: 130 }} />

      {/* Action options row + dropdowns */}
      <div ref={containerRef} className="flex flex-col items-center w-full" style={{ paddingBottom: 32 }}>
        {/* Pill row */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* Options 1–3: dropdown triggers */}
          {ACTION_MENUS.map((menu) => {
            const Icon = MENU_ICONS[menu.id as keyof typeof MENU_ICONS];
            const isOpen = openMenu === menu.id;
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : menu.id)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-medium rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  fontFamily: F,
                  color: isOpen ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.75)",
                  background: isOpen ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                  border: `1px solid ${isOpen ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.20)"}`,
                }}
              >
                {Icon && <Icon size={12} style={{ opacity: 0.7, flexShrink: 0 }} />}
                {menu.label}
                <IconChevronDown
                  size={11}
                  style={{
                    opacity: 0.6,
                    transition: "transform 200ms ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}
                />
              </button>
            );
          })}

          {/* Option 4: Build a Narrative — gleam border */}
          <button
            type="button"
            onClick={onCreateNarrative}
            aria-label="Build a Narrative"
            className="group relative isolate rounded-full p-[1.5px] active:scale-[0.98] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full"
              style={{
                background: "linear-gradient(110deg, #c4b5fd 0%, #818cf8 25%, #38bdf8 50%, #a78bfa 75%, #c4b5fd 100%)",
                backgroundSize: "200% 100%",
                animation: "gleam 3s linear infinite",
              }}
            />
            <span
              className="flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-semibold rounded-full transition-colors"
              style={{ fontFamily: F, color: "rgba(210,190,255,0.95)", background: "rgba(18,12,42,0.88)" }}
            >
              <IconNotebook size={12} style={{ color: "rgba(180,160,255,0.85)", flexShrink: 0 }} />
              Build a Narrative
            </span>
          </button>

          {/* Option 5: Build a Results Narrative — teal gleam */}
          <button
            type="button"
            onClick={onCreateResultsNarrative}
            aria-label="Build a Results Narrative"
            className="group relative isolate rounded-full p-[1.5px] active:scale-[0.98] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full"
              style={{
                background: "linear-gradient(110deg, #5eead4 0%, #22d3ee 25%, #34d399 50%, #2dd4bf 75%, #5eead4 100%)",
                backgroundSize: "200% 100%",
                animation: "gleam 3s linear infinite",
              }}
            />
            <span
              className="flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-semibold rounded-full transition-colors"
              style={{ fontFamily: F, color: "rgba(180,255,240,0.95)", background: "rgba(10,32,30,0.88)" }}
            >
              <IconBook2 size={12} style={{ color: "rgba(100,240,210,0.85)", flexShrink: 0 }} />
              Build a Results Narrative
            </span>
          </button>
        </div>

        {/* Dropdown panel — appears below the pill row when a menu is open */}
        {openMenu && (() => {
          const menu = ACTION_MENUS.find((m) => m.id === openMenu);
          if (!menu) return null;
          return (
            <div
              role="listbox"
              aria-label={`${menu.label} prompts`}
              style={{
                marginTop: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                maxWidth: 680,
                padding: "14px 18px",
                background: "rgba(10,25,35,0.80)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                animation: "fadeSlideDown 160ms ease forwards",
              }}
            >
              {menu.prompts.map((p) => (
                <button
                  key={p.prompt}
                  role="option"
                  aria-selected={false}
                  type="button"
                  onClick={() => handlePromptClick(p.prompt)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] font-medium transition-all duration-120 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  style={{
                    fontFamily: F,
                    color: "rgba(255,255,255,0.82)",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
```

- [ ] **Verify in browser**
  - All 5 pill options are visible
  - Clicking "Explore the Scorecard", "Analyse", "Explain Contributions" opens a dropdown with 4 prompts each
  - Only one dropdown is open at a time — opening a second closes the first
  - Clicking a prompt closes the dropdown
  - Clicking outside closes the dropdown
  - Escape key closes the dropdown
  - "Build a Narrative" and "Build a Results Narrative" still trigger the narrative workflow

- [ ] **Verify dev server healthy**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` → `200`

---

## Task 3: InsightCard Type + Mock Data Update (US042 part 1)

**Files:**
- Modify: `lib/insightSynth.ts` — add two fields to `InsightCard`
- Modify: `data/insights.json` — add the two fields to all existing cards

### What to build
Add `insight_type` (one of `"Variance" | "Comparison" | "Trend" | "Forecast"`) and `engagement_count` (number) to the interface and the 3 existing seeded cards.

- [ ] **Add fields to `InsightCard` in `lib/insightSynth.ts`**

Find the interface:
```ts
export interface InsightCard {
  id: string;
  question: string;
  outcome_area: string;
  indicator_code: string | null;
  accent: string;
  headline: string;
  insight: string;
  hero_stat: { value: string; caption: string } | null;
  follow_ups: string[];
  generated_at: string;
}
```

Replace with:
```ts
export interface InsightCard {
  id: string;
  question: string;
  outcome_area: string;
  indicator_code: string | null;
  accent: string;
  headline: string;
  insight: string;
  hero_stat: { value: string; caption: string } | null;
  follow_ups: string[];
  generated_at: string;
  /** Display pill label, e.g. "Variance", "Trend", "Comparison", "Forecast" */
  insight_type?: "Variance" | "Comparison" | "Trend" | "Forecast";
  /** Mock engagement count — number of people who explored this insight */
  engagement_count?: number;
}
```

- [ ] **Update `data/insights.json`** — add `insight_type` and `engagement_count` to each card. Open the file and add these two fields to each object. Use realistic but mocked values:

Card `energy-access` → `"insight_type": "Variance"`, `"engagement_count": 47`
Card `safety-nets` (or whichever is second) → `"insight_type": "Comparison"`, `"engagement_count": 83`
Card `broadband` (or whichever is third) → `"insight_type": "Trend"`, `"engagement_count": 61`

To check card IDs: `cat data/insights.json | python3 -c "import json,sys; [print(c['id']) for c in json.load(sys.stdin)]"`

- [ ] **Verify TypeScript still compiles**: `npx tsc --noEmit` should exit 0 (or show only pre-existing errors, none new)

---

## Task 4: Trending Insights UI Enhancements (US042 part 2)

**Files:**
- Modify: `components/SynthesizedInsights.tsx`

### What to build
Three additions to each card and the section header:
1. **Insight-type pill** — small rounded badge (e.g. "Variance") above the outcome-area label
2. **Engagement count** — "47 people explored this" below the arrow affordance at the bottom of the card
3. **"Updated" timestamp** — next to the existing "Synthesized from Scorecard data" label in the section header, changed to show a last-updated date

- [ ] **Replace `components/SynthesizedInsights.tsx`** with:

```tsx
"use client";

import { IconArrowRight, IconUsers } from "@tabler/icons-react";
import insightsData from "@/data/insights.json";
import type { InsightCard } from "@/lib/insightSynth";

const F = "'Open Sans', sans-serif";
const CARDS = insightsData as InsightCard[];

const TYPE_COLOURS: Record<string, { bg: string; color: string }> = {
  Variance:   { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B" },
  Comparison: { bg: "rgba(59,130,246,0.15)",  color: "#60A5FA" },
  Trend:      { bg: "rgba(16,185,129,0.15)",  color: "#34D399" },
  Forecast:   { bg: "rgba(168,85,247,0.15)",  color: "#C084FC" },
};

export interface SynthesizedInsightsProps {
  onOpenInsight: (card: InsightCard) => void;
}

export default function SynthesizedInsights({ onOpenInsight }: SynthesizedInsightsProps) {
  if (!CARDS.length) return null;

  return (
    <section aria-label="Trending Insights" style={{ marginBottom: 40, fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: "rgba(255,255,255,0.96)",
            lineHeight: "34px",
            letterSpacing: "-1.2px",
            margin: 0,
          }}
        >
          Trending Insights
        </h2>
        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
          Synthesized from Scorecard data · Updated Jun 2025
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
        {CARDS.map((card) => {
          const typeStyle = card.insight_type ? TYPE_COLOURS[card.insight_type] : null;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onOpenInsight(card)}
              className="group text-left flex flex-col"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                padding: "18px 18px 16px",
                transition: "background 160ms, border-color 160ms, transform 160ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Top row: insight-type pill + outcome-area label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                {typeStyle && card.insight_type && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      padding: "2px 7px",
                      borderRadius: 999,
                      background: typeStyle.bg,
                      color: typeStyle.color,
                      flexShrink: 0,
                    }}
                  >
                    {card.insight_type}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: card.accent, flexShrink: 0, display: "inline-block" }} />
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {card.outcome_area}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "rgba(255,255,255,0.95)", lineHeight: 1.3, margin: 0 }}>
                {card.headline}
              </h3>

              {/* Hero stat */}
              {card.hero_stat && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: card.accent, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                    {card.hero_stat.value}
                  </div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 2, lineHeight: 1.35 }}>
                    {card.hero_stat.caption}
                  </div>
                </div>
              )}

              {/* Insight — clamped */}
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {card.insight}
              </p>

              {/* Footer: explore affordance + engagement count */}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <span className="group-hover:text-white" style={{ transition: "color 160ms" }}>
                    Explore this insight
                  </span>
                  <IconArrowRight size={14} className="group-hover:translate-x-0.5" style={{ transition: "transform 160ms" }} />
                </div>

                {card.engagement_count != null && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      color: "rgba(255,255,255,0.38)",
                    }}
                  >
                    <IconUsers size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                    <span>{card.engagement_count} explored this</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Verify in browser**
  - Each card shows a coloured insight-type pill (Variance / Comparison / Trend)
  - Engagement count ("47 explored this") appears bottom-right of each card
  - Section header shows "Updated Jun 2025"
  - Card click still opens conversation

---

## Task 5: Momentum Groups Directional Arrows + Timestamp (US041)

**Files:**
- Modify: `components/MomentumGroups.tsx`

### What to build
Two additions:
1. **Directional arrow on each row's achieved value** — `▲` in teal/green for positive delta, `▼` in orange/red for negative delta, derived from the existing `delta` string (e.g. `"+108%"`, `"-6.3%"`)
2. **"Updated" timestamp** in the section header (right-aligned, matching Trending Insights style)

The `delta` field is a string like `"+108%"` or `"-6.3%"`. Parse the sign to determine direction.

- [ ] **Add a `parseDeltaSign` helper and update the row rendering in `components/MomentumGroups.tsx`**

Add this helper just above the component export (after imports):
```tsx
function parseDeltaSign(delta: string | undefined): "positive" | "negative" | null {
  if (!delta) return null;
  if (delta.startsWith("+")) return "positive";
  if (delta.startsWith("-")) return "negative";
  return null;
}
```

- [ ] **Add timestamp to section header** — find this block in `MomentumGroups.tsx`:

```tsx
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <h2
          style={{
            margin: 0,
            color: "rgba(255, 255, 255, 0.95)",
            fontFamily: F,
            fontSize: 26,
            fontWeight: 300,
            lineHeight: "34px",
            letterSpacing: "-1.2px",
          }}
        >
          Latest Indicator Movements
        </h2>
        <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>
```

Replace with:
```tsx
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <h2
          style={{
            margin: 0,
            color: "rgba(255, 255, 255, 0.95)",
            fontFamily: F,
            fontSize: 26,
            fontWeight: 300,
            lineHeight: "34px",
            letterSpacing: "-1.2px",
          }}
        >
          Latest Indicator Movements
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.40)", fontFamily: F }}>
            Updated Jun 2025
          </span>
          <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)", fontFamily: F, textDecoration: "none" }}>
            View all →
          </a>
        </div>
      </div>
```

- [ ] **Update row rendering** to show a directional indicator next to the achieved value. Find the achieved value span in the row map:

```tsx
                    <span style={{ width: 80, textAlign: "right", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", flexShrink: 0 }}>
                      {r.achieved ?? r.delta}
                    </span>
```

Replace with:
```tsx
                    <span style={{ width: 80, textAlign: "right", fontSize: 13, fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                      {(() => {
                        const sign = parseDeltaSign(r.delta);
                        return (
                          <>
                            {sign === "positive" && (
                              <span style={{ fontSize: 10, color: "#34D399", lineHeight: 1 }}>▲</span>
                            )}
                            {sign === "negative" && (
                              <span style={{ fontSize: 10, color: "#FB923C", lineHeight: 1 }}>▼</span>
                            )}
                            <span style={{ color: sign === "negative" ? "#FB923C" : sign === "positive" ? "#34D399" : "rgba(255,255,255,0.9)" }}>
                              {r.achieved ?? r.delta}
                            </span>
                          </>
                        );
                      })()}
                    </span>
```

- [ ] **Verify in browser**
  - "High-Performing Indicators" card: achieved values appear in teal-green with ▲ arrow
  - "Progress Watch Areas" card: achieved values appear in orange with ▼ arrow
  - "Emerging Growth Areas" card: check delta signs in mockData and verify correct colour
  - "Updated Jun 2025" timestamp appears in section header right area
  - Card hover sweep animation still works correctly

- [ ] **Verify dev server healthy**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` → `200`

---

## Self-Review

**Spec coverage:**
- US014: ✅ 5 options, first 3 with dropdown of golden prompts, 4+5 keep guided workflow
- US041: ✅ Directional arrows on achieved values, timestamp on header
- US042: ✅ Insight-type pill, engagement count, timestamp on header
- US005 ("+" button): not covered — this requires backend attachment handling and is out of scope for a UI-only plan. Flag to the team separately.

**Placeholder scan:** No TBDs, TODOs, or "similar to above" references.

**Type consistency:**
- `InsightCard.insight_type` is `"Variance" | "Comparison" | "Trend" | "Forecast" | undefined` in both the interface and the component
- `InsightCard.engagement_count` is `number | undefined` in both
- `ACTION_MENUS` type `ActionMenu[]` is consumed in SearchHero via exact import
- `parseDeltaSign` takes `string | undefined`, returns `"positive" | "negative" | null` — used consistently in the JSX

**Risk note:** The achieved value span currently uses a CSS class `.mg-card-row-delta` for colour transitions on hover. The replacement uses inline `style={{ color }}`, which overrides the CSS class colour — the hover colour-flip to white (`color: #FFFFFF`) set by `.mg-card:hover .mg-card-row-delta` will no longer apply to the achieved span. The arrow and value will stay their directional colour on hover. This is acceptable as a deliberate trade-off (the directional colour conveys meaning even on the filled card). If you want to restore the white flip on hover, you'd need to keep the class on the outer span and move the directional colour to a nested `data-*`-driven approach — out of scope here.
