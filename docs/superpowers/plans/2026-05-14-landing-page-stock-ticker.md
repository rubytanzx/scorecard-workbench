# Landing Page Stock-Ticker Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current landing page (between the search hero and the footer) with a stock-ticker indicator marquee, a Trending Across IDA momentum block, a 3-column momentum-groups section, a 4-card Counter Intuitive Findings row, and a 6-tile System Pattern grid — matching the layout from the user-supplied reference screenshot. All text is Open Sans; no Crimson Pro.

**Architecture:** One data file (`lib/mockData.ts`) is rewritten in place: the `Indicator` shape and the `indicators` array (now 22 entries lifted from the Active Portfolio Results screenshot) plus five new exports for the other sections. Seven new presentation components in `components/` encapsulate each section. `app/page.tsx` is updated to render the new sections in order and drops the imports for the components no longer used.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, inline styles + raw CSS keyframes for the marquee animation. No new dependencies. No unit-test framework is added — this project already verifies with `npx tsc --noEmit` and a manual dev-server pass, so this plan does the same.

**Source spec:** `docs/superpowers/specs/2026-05-14-landing-page-stock-ticker-redesign.md`

---

## File map

| Action | File | Responsibility |
|---|---|---|
| Modify | `lib/mockData.ts` | Rewrite `Indicator`/`IndicatorSubRow`; replace 21-entry `indicators` array with 22 entries; add `trendingTop`, `trendingSides`, `momentumGroups`, `counterIntuitiveTextCards`, `systemPatterns` exports |
| Modify | `components/ResultsBand.tsx` | Update field references (`label`→`name`, `target`→`expected`, drop `exceeded`) so the file keeps compiling even though it's no longer imported by `app/page.tsx` |
| Create | `components/IndicatorSparkline.tsx` | Generic SVG polyline (`width`, `height`, `color`, `points`) |
| Create | `components/IndicatorTicker.tsx` | Marquee + methodology drawer |
| Create | `components/TrendingAcrossIDA.tsx` | Top momentum + risk/emerging stack |
| Create | `components/MomentumGroups.tsx` | 3-column accelerating/slowing/emerging |
| Create | `components/CounterIntuitiveTextCard.tsx` | Single icon card |
| Create | `components/SystemPatternTile.tsx` | Single 6-col tile |
| Modify | `app/page.tsx` | Remove old section imports/renders; render five new section components in order; collapse 2-col main layout into a single column |

---

## Task 1: Rewrite `Indicator` type and `indicators` array

**Files:**
- Modify: `lib/mockData.ts:57-65` (the `Indicator` interface)
- Modify: `lib/mockData.ts:600-749` (the `indicators` array)

- [ ] **Step 1: Replace the `Indicator` interface and add `IndicatorSubRow`**

Find the existing `Indicator` interface at line 57:

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

Replace it with:

```ts
export interface IndicatorSubRow {
  label: string;
  achieved: string; // e.g. "1.8M" or "--"
  expected: string; // e.g. "14M"
}

export interface Indicator {
  id: string;
  name: string;        // Full Active Portfolio Results name from the IDA Scorecard
  achieved: string;    // e.g. "146.6M" or "--"
  expected: string;    // e.g. "192.3M" or "-102.7MtCO2eq/year"
  /** Numeric ratio of achieved/expected used to drive sparkline tint. Null when achieved is "--". */
  ratio: number | null;
  sparkline: number[]; // 5 mocked points (0–1 range)
  methodologyNote: string;
  methodologyUrl?: string;
  subRows?: IndicatorSubRow[];
  comingSoon?: boolean; // true for "More and better-paid jobs"
}
```

- [ ] **Step 2: Replace the entire `indicators` array**

Find the existing `indicators` export at line 600 (`export const indicators: Indicator[] = [`) and replace the entire array (through its closing `];`) with the 22-entry version below. Order matches the user-supplied screenshot exactly.

```ts
export const indicators: Indicator[] = [
  {
    id: "ind-safety-nets",
    name: "Beneficiaries of social safety net programs",
    achieved: "171.6M",
    expected: "176.2M",
    ratio: 171.6 / 176.2,
    sparkline: [0.52, 0.61, 0.70, 0.82, 0.97],
    methodologyNote:
      "People benefiting from social protection programs including cash transfers, food vouchers, and social insurance schemes.",
  },
  {
    id: "ind-students",
    name: "Students supported with better education",
    achieved: "100.8M",
    expected: "174.7M",
    ratio: 100.8 / 174.7,
    sparkline: [0.31, 0.38, 0.45, 0.52, 0.58],
    methodologyNote:
      "Students benefiting from WBG education investments across primary, secondary, and tertiary levels in IDA countries.",
  },
  {
    id: "ind-health-services",
    name: "People receiving quality health, nutrition, and population services",
    achieved: "225.4M",
    expected: "268.6M",
    ratio: 225.4 / 268.6,
    sparkline: [0.55, 0.62, 0.71, 0.78, 0.84],
    methodologyNote:
      "People accessing quality health, nutrition, and population services through IDA-supported projects. Includes primary care, maternal health, and community health workers.",
  },
  {
    id: "ind-health-emergencies",
    name: "Countries benefitting from strengthened capacity to prevent, detect, and respond to health emergencies",
    achieved: "14",
    expected: "42",
    ratio: 14 / 42,
    sparkline: [0.10, 0.14, 0.22, 0.28, 0.33],
    methodologyNote:
      "IDA countries that have strengthened their capacity to prepare for and respond to health emergencies through IDA-financed programs.",
  },
  {
    id: "ind-debt",
    name: "Percentage of countries in or at high risk of debt distress that implemented reforms towards debt sustainability",
    achieved: "76.7%",
    expected: "83.7%",
    ratio: 76.7 / 83.7,
    sparkline: [0.60, 0.66, 0.71, 0.74, 0.92],
    methodologyNote:
      "Share of IDA countries in or at high risk of debt distress that have implemented debt sustainability reforms supported by WBG programs.",
  },
  {
    id: "ind-tax",
    name: "Countries with tax revenues-to-GDP ratio at or below 15% (including social security contributions) that have increased collections, considering equity",
    achieved: "18",
    expected: "26",
    ratio: 18 / 26,
    sparkline: [0.40, 0.48, 0.55, 0.63, 0.69],
    methodologyNote:
      "IDA countries that have increased tax-to-GDP ratios through WBG-supported fiscal reform programs, with equity considerations applied.",
  },
  {
    id: "ind-ghg",
    name: "Net greenhouse gas emissions (GHG)",
    achieved: "--",
    expected: "-102.7MtCO2eq/year",
    ratio: null,
    sparkline: [0.50, 0.50, 0.50, 0.50, 0.50],
    methodologyNote:
      "Net greenhouse gas emission reductions attributable to IDA-financed climate mitigation projects, measured over project lifetime. Reporting pending for FY25.",
  },
  {
    id: "ind-climate-resilience",
    name: "Beneficiaries with enhanced resilience to climate risks",
    achieved: "104M",
    expected: "268.1M",
    ratio: 104 / 268.1,
    sparkline: [0.18, 0.24, 0.30, 0.36, 0.39],
    methodologyNote:
      "People with strengthened climate resilience through IDA adaptation projects, early-warning systems, and climate-smart infrastructure.",
  },
  {
    id: "ind-hectares",
    name: "Hectares of terrestrial and aquatic areas under enhanced conservation/management",
    achieved: "39.3M",
    expected: "59.3M",
    ratio: 39.3 / 59.3,
    sparkline: [0.45, 0.52, 0.58, 0.62, 0.66],
    methodologyNote:
      "Land and aquatic area brought under enhanced natural-resource management, including forests, wetlands, and protected marine areas.",
  },
  {
    id: "ind-wash",
    name: "People provided with water, sanitation, and/or hygiene, and the number provided with safely managed services",
    achieved: "41.3M",
    expected: "90.1M",
    ratio: 41.3 / 90.1,
    sparkline: [0.20, 0.28, 0.36, 0.42, 0.46],
    methodologyNote:
      "People with access to improved water supply, sanitation, and hygiene through IDA WASH investments. The total figure is broken out by safely managed services as a sub-row.",
    subRows: [
      { label: "Total", achieved: "41.3M", expected: "90.1M" },
      { label: "Safely managed", achieved: "1.8M", expected: "14M" },
    ],
  },
  {
    id: "ind-food-security",
    name: "People with strengthened food and nutrition security",
    achieved: "146.6M",
    expected: "192.3M",
    ratio: 146.6 / 192.3,
    sparkline: [0.45, 0.55, 0.65, 0.72, 0.76],
    methodologyNote:
      "People with improved food and nutrition security outcomes through IDA agriculture, nutrition, and resilient food-systems investments.",
  },
  {
    id: "ind-transport",
    name: "People that benefit from improved access to sustainable transport infrastructure and services",
    achieved: "84.3M",
    expected: "277.5M",
    ratio: 84.3 / 277.5,
    sparkline: [0.16, 0.22, 0.26, 0.29, 0.30],
    methodologyNote:
      "People benefiting from improved transport infrastructure and services through IDA-financed sustainable transport projects.",
  },
  {
    id: "ind-electricity",
    name: "People provided with access to electricity",
    achieved: "86.7M",
    expected: "205.7M",
    ratio: 86.7 / 205.7,
    sparkline: [0.20, 0.28, 0.34, 0.40, 0.42],
    methodologyNote:
      "People gaining first-time or improved electricity access through IDA energy projects, including grid and off-grid solutions.",
  },
  {
    id: "ind-renewable-energy",
    name: "GW of renewable energy capacity enabled",
    achieved: "4.8GW",
    expected: "26.64GW",
    ratio: 4.8 / 26.64,
    sparkline: [0.10, 0.14, 0.16, 0.17, 0.18],
    methodologyNote:
      "Gigawatts of renewable energy capacity enabled through IDA-financed energy projects, including solar, wind, hydro, and geothermal.",
  },
  {
    id: "ind-broadband",
    name: "People using broadband internet",
    achieved: "64.8M",
    expected: "142.1M",
    ratio: 64.8 / 142.1,
    sparkline: [0.20, 0.28, 0.36, 0.42, 0.46],
    methodologyNote:
      "People with improved broadband access through IDA digital infrastructure projects. Includes mobile broadband where fixed broadband is unavailable.",
  },
  {
    id: "ind-digital-services",
    name: "People using digitally enabled services",
    achieved: "25M",
    expected: "76.4M",
    ratio: 25 / 76.4,
    sparkline: [0.15, 0.20, 0.26, 0.30, 0.33],
    methodologyNote:
      "People using government or commercial services delivered through digital platforms supported by IDA-financed digital economy projects.",
  },
  {
    id: "ind-gender-equality",
    name: "People benefiting from actions to advance gender equality, and the number benefitting from actions that expand and enable economic opportunities",
    achieved: "191.8M",
    expected: "307.2M",
    ratio: 191.8 / 307.2,
    sparkline: [0.42, 0.50, 0.56, 0.60, 0.62],
    methodologyNote:
      "Women and girls benefiting from programs explicitly targeting gender gaps in education, health, finance, and labor markets. Sub-rows break out beneficiaries of economic-opportunity actions specifically.",
    subRows: [
      { label: "Total", achieved: "191.8M", expected: "307.2M" },
      {
        label: "Beneficiaries of actions to expand and enable economic opportunities",
        achieved: "67.7M",
        expected: "128.1M",
      },
    ],
  },
  {
    id: "ind-financial-services",
    name: "People and businesses using financial services, including the number of women",
    achieved: "44.4M",
    expected: "26M",
    ratio: 44.4 / 26,
    sparkline: [0.55, 0.72, 0.88, 1.0, 1.0],
    methodologyNote:
      "People and businesses accessing financial services in IDA countries through IFC and IDA-supported financial sector projects. Sub-rows isolate the female beneficiary count.",
    subRows: [
      { label: "Total", achieved: "44.4M", expected: "26M" },
      { label: "Female", achieved: "19.2M", expected: "10.6M" },
    ],
  },
  {
    id: "ind-jobs",
    name: "More and better-paid jobs (Coming soon)",
    achieved: "--",
    expected: "--",
    ratio: null,
    sparkline: [0.50, 0.50, 0.50, 0.50, 0.50],
    methodologyNote:
      "Final methodology under consultation. First IDA-wide report on jobs outcomes expected in FY26.",
    comingSoon: true,
  },
  {
    id: "ind-displaced-people",
    name: "Displaced people and people in host communities provided with services and livelihoods",
    achieved: "9.2M",
    expected: "34.7M",
    ratio: 9.2 / 34.7,
    sparkline: [0.15, 0.18, 0.22, 0.25, 0.27],
    methodologyNote:
      "Forcibly displaced people and host communities supported through IDA projects addressing protection, livelihoods, and durable solutions.",
  },
  {
    id: "ind-private-capital-enabled",
    name: "Total private capital enabled",
    achieved: "--",
    expected: "$25.8B",
    ratio: null,
    sparkline: [0.50, 0.50, 0.50, 0.50, 0.50],
    methodologyNote:
      "Total private capital enabled through IDA-supported projects. Includes IFC upstream work and WBG advisory engagements that facilitate private investment. Reporting pending for FY25.",
  },
  {
    id: "ind-private-capital-mobilized",
    name: "Total private capital mobilized",
    achieved: "--",
    expected: "$17.1B",
    ratio: null,
    sparkline: [0.50, 0.50, 0.50, 0.50, 0.50],
    methodologyNote:
      "Private capital mobilized by IFC and MIGA in IDA-eligible countries, measured at commitment. Excludes sub-national guarantees. Reporting pending for FY25.",
  },
];
```

- [ ] **Step 3: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: errors only in `components/ResultsBand.tsx` (references to renamed `label`/`target`/`exceeded` fields). No other files should fail. Task 2 fixes those.

- [ ] **Step 4: Commit**

```bash
git add lib/mockData.ts
git commit -m "feat: rewrite Indicator type and 22-entry indicators array from FY25 Active Portfolio Results"
```

---

## Task 2: Update `ResultsBand.tsx` to compile with the new `Indicator` shape

**Files:**
- Modify: `components/ResultsBand.tsx`

`ResultsBand` is no longer imported by `app/page.tsx` after Task 10, but the file remains on disk. Keep it compiling against the new schema. The simplest update: rename `label`→`name`, `target`→`expected`, and drop the `exceeded` branch (replace with a percent-of-expected readout). Methodology note + URL are unchanged.

- [ ] **Step 1: Update the front-face label reference**

In `components/ResultsBand.tsx`, find the front-face block:

```tsx
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
```

Replace `{indicator.label}` with `{indicator.name}`.

- [ ] **Step 2: Replace the exceeded/target conditional with an expected readout**

Find this block (lines ~77–97 of the current file):

```tsx
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
```

Replace with:

```tsx
          <div
            style={{
              fontSize: 8,
              color: "#9CA3AF",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            of {indicator.expected}
          </div>
```

- [ ] **Step 3: Update the `aria-label` to use the new field name**

Find:
```tsx
      aria-label={`${indicator.label}: ${indicator.achieved}`}
```

Replace with:
```tsx
      aria-label={`${indicator.name}: ${indicator.achieved}`}
```

- [ ] **Step 4: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add components/ResultsBand.tsx
git commit -m "chore: update ResultsBand to compile against new Indicator schema"
```

---

## Task 3: Add new section data exports

**Files:**
- Modify: `lib/mockData.ts` (append at end of file, after the `indicators` array)

- [ ] **Step 1: Append trending data after the `indicators` array**

At the bottom of `lib/mockData.ts`, append:

```ts
// ─── Trending Across IDA ──────────────────────────────────────────────────────

export interface TrendingStat {
  value: string;     // "+14.8%"
  label: string;     // "Job access (YoY)"
  tone: "positive" | "negative" | "neutral";
}

export interface TrendingTopCard {
  tag: "TOP MOMENTUM";
  headline: string;
  description: string;
  stats: TrendingStat[];
  ctaLabel: string;
}

export interface TrendingSideCard {
  id: "risk-watch" | "emerging-signal";
  tag: "RISK WATCH" | "EMERGING SIGNAL";
  headline: string;
  description: string;
  sparkline: number[]; // 7 points, 0–1
  ctaLabel: string;
}

export const trendingTop: TrendingTopCard = {
  tag: "TOP MOMENTUM",
  headline:
    "Economic mobility is accelerating through infrastructure and digital access",
  description:
    "Countries investing in transport and digital infrastructure are seeing stronger gains in jobs, entrepreneurship, and financial inclusion. This pattern holds across income levels, with the strongest improvements in IDA countries.",
  stats: [
    { value: "18",      label: "Countries improving",        tone: "neutral"  },
    { value: "+14.8%",  label: "Job access (YoY)",           tone: "positive" },
    { value: "+11.2M",  label: "New digital wallets",        tone: "positive" },
    { value: "+9.1%",   label: "Female labor participation", tone: "positive" },
  ],
  ctaLabel: "Explore this pattern",
};

export const trendingSides: TrendingSideCard[] = [
  {
    id: "risk-watch",
    tag: "RISK WATCH",
    headline: "Fragility and fiscal pressure remain key constraints",
    description:
      "High debt and weak institutional capacity continue to limit service delivery improvements in many fragile and conflict-affected settings.",
    sparkline: [0.75, 0.70, 0.68, 0.62, 0.55, 0.50, 0.45],
    ctaLabel: "Explore drivers",
  },
  {
    id: "emerging-signal",
    tag: "EMERGING SIGNAL",
    headline: "Water outcomes improving despite infrastructure delivery challenges",
    description:
      "Behavior change, better O&M, and service-delivery reforms are driving results in several regions.",
    sparkline: [0.30, 0.38, 0.45, 0.55, 0.62, 0.70, 0.78],
    ctaLabel: "Explore countries",
  },
];

// ─── Momentum Groups (What's Changing Right Now) ──────────────────────────────

export interface MomentumRow {
  label: string;
  delta: string; // "+11.2%" | "-6.3%" | "New"
}

export interface MomentumGroup {
  id: "accelerating" | "slowing" | "emerging";
  title: string;
  subtitle: string;
  rows: MomentumRow[];
}

export const momentumGroups: MomentumGroup[] = [
  {
    id: "accelerating",
    title: "Accelerating",
    subtitle: "Outcomes gaining momentum",
    rows: [
      { label: "Digital financial inclusion", delta: "+11.2%" },
      { label: "Primary learning outcomes",   delta: "+8.7%"  },
      { label: "Women entrepreneurship",      delta: "+7.5%"  },
    ],
  },
  {
    id: "slowing",
    title: "Slowing",
    subtitle: "Momentum losing pace",
    rows: [
      { label: "Climate adaptation finance",  delta: "-6.3%" },
      { label: "Tax revenue mobilization",    delta: "-4.1%" },
      { label: "Infrastructure delivery",     delta: "-3.8%" },
    ],
  },
  {
    id: "emerging",
    title: "Emerging",
    subtitle: "New signals to watch",
    rows: [
      { label: "Green jobs creation",         delta: "New" },
      { label: "Digital public infrastructure", delta: "New" },
      { label: "Resilience program scale-up", delta: "New" },
    ],
  },
];

// ─── Counter Intuitive Text Cards ─────────────────────────────────────────────

export interface CounterIntuitiveTextCard {
  id: string;
  icon: "chart" | "water" | "female" | "dollar";
  tone: "green" | "blue" | "purple" | "amber";
  headline: string;
  description: string;
}

export const counterIntuitiveTextCards: CounterIntuitiveTextCard[] = [
  {
    id: "ci-1",
    icon: "chart",
    tone: "green",
    headline: "Lower connectivity investments, higher mobile money adoption",
    description:
      "Countries with lower connectivity spend saw 23% higher mobile money growth driven by strong policy and demand factors.",
  },
  {
    id: "ci-2",
    icon: "water",
    tone: "blue",
    headline: "Water outcomes improved despite lower infrastructure spend",
    description:
      "Service delivery reforms and community management drove better outcomes in 12 countries.",
  },
  {
    id: "ci-3",
    icon: "female",
    tone: "purple",
    headline: "Transport investments unlock greater gains for women",
    description:
      "Countries where transport investments preceded financial access saw 2x higher female labor participation gains.",
  },
  {
    id: "ci-4",
    icon: "dollar",
    tone: "amber",
    headline: "Debt increases, but fiscal space improves in some IDA economies",
    description:
      "Better revenue administration outperformed borrowing growth in 7 countries.",
  },
];

// ─── System Patterns ──────────────────────────────────────────────────────────

export interface SystemPattern {
  id: string;
  name: string;
  description: string;
  icon: "trend" | "digital" | "human" | "climate" | "inclusion" | "fragility";
  tint: "green" | "blue" | "teal" | "purple-light" | "purple" | "orange";
  narrativeCount: number;
  indicatorCount: number;
}

export const systemPatterns: SystemPattern[] = [
  {
    id: "sp-1",
    name: "Economic Mobility",
    description: "Jobs, productivity, and opportunity for all",
    icon: "trend",
    tint: "green",
    narrativeCount: 24,
    indicatorCount: 18,
  },
  {
    id: "sp-2",
    name: "Digital Transformation",
    description: "Digital infrastructure and services at scale",
    icon: "digital",
    tint: "blue",
    narrativeCount: 19,
    indicatorCount: 14,
  },
  {
    id: "sp-3",
    name: "Human Capital",
    description: "Health, education, and skills for resilience",
    icon: "human",
    tint: "teal",
    narrativeCount: 21,
    indicatorCount: 16,
  },
  {
    id: "sp-4",
    name: "Climate Resilience",
    description: "Adaptation, mitigation, and sustainable growth",
    icon: "climate",
    tint: "purple-light",
    narrativeCount: 17,
    indicatorCount: 13,
  },
  {
    id: "sp-5",
    name: "Inclusive Participation",
    description: "Gender, youth, and social inclusion",
    icon: "inclusion",
    tint: "purple",
    narrativeCount: 16,
    indicatorCount: 12,
  },
  {
    id: "sp-6",
    name: "Fragility & Institutions",
    description: "State capacity, governance, and resilience",
    icon: "fragility",
    tint: "orange",
    narrativeCount: 20,
    indicatorCount: 15,
  },
];
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add lib/mockData.ts
git commit -m "feat: add trending, momentum, counter-intuitive, and system-pattern mock data"
```

---

## Task 4: Create `IndicatorSparkline` atom

**Files:**
- Create: `components/IndicatorSparkline.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

interface Props {
  points: number[];   // 0–1 normalised values
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export default function IndicatorSparkline({
  points,
  width = 60,
  height = 16,
  color = "#10B981",
  strokeWidth = 1.5,
}: Props) {
  if (points.length < 2) return null;

  const stepX = width / (points.length - 1);
  const polyline = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - p * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/IndicatorSparkline.tsx
git commit -m "feat: add IndicatorSparkline atom component"
```

---

## Task 5: Create `IndicatorTicker` component

**Files:**
- Create: `components/IndicatorTicker.tsx`

The component owns its marquee keyframes (injected via `<style>` block — kept local so we don't touch `globals.css`), the ticker card rendering, and a click-to-open right-side methodology drawer. No new dependencies; the drawer is a fixed-positioned panel with a click-outside scrim.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import { type Indicator } from "@/lib/mockData";
import IndicatorSparkline from "./IndicatorSparkline";

interface Props {
  indicators: Indicator[];
}

const F = "'Open Sans', sans-serif";

function deltaTone(ind: Indicator) {
  if (ind.ratio === null) {
    return { color: "#9CA3AF", arrow: "•", label: ind.comingSoon ? "Coming soon" : "Pending" };
  }
  const pct = Math.round(ind.ratio * 100);
  if (ind.ratio >= 0.85) return { color: "#10B981", arrow: "▲", label: `${pct}% of expected` };
  if (ind.ratio >= 0.5)  return { color: "#F59E0B", arrow: "▲", label: `${pct}% of expected` };
  return { color: "#EF4444", arrow: "▼", label: `${pct}% of expected` };
}

function TickerCard({ indicator, onOpen }: { indicator: Indicator; onOpen: () => void }) {
  const tone = deltaTone(indicator);
  return (
    <button
      onClick={onOpen}
      aria-label={`${indicator.name}: ${indicator.achieved} of ${indicator.expected}`}
      style={{
        flex: "0 0 220px",
        height: 90,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: F,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "#6B7280",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {indicator.name}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: indicator.achieved === "--" ? "#9CA3AF" : "#0D1A2B",
              lineHeight: 1,
            }}
          >
            {indicator.achieved === "--" ? "—" : indicator.achieved}
          </div>
          <div style={{ marginTop: 2, fontSize: 10, color: tone.color, fontWeight: 500 }}>
            {tone.arrow} {tone.label}
          </div>
        </div>
        <IndicatorSparkline
          points={indicator.sparkline}
          width={60}
          height={16}
          color={tone.color}
        />
      </div>
    </button>
  );
}

function MethodologyDrawer({
  indicator,
  onClose,
}: {
  indicator: Indicator;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${indicator.name} methodology`}
      style={{ position: "fixed", inset: 0, zIndex: 100 }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(13,26,43,0.35)" }}
      />
      <aside
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          background: "#FFFFFF",
          boxShadow: "-12px 0 32px rgba(13,26,43,0.18)",
          padding: 24,
          overflowY: "auto",
          fontFamily: F,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0D1A2B", lineHeight: 1.35 }}>
            {indicator.name}
          </h3>
          <button
            aria-label="Close methodology"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
              color: "#6B7280",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 24 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: 0.8 }}>
              Achieved
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#0D1A2B", marginTop: 4 }}>
              {indicator.achieved === "--" ? "—" : indicator.achieved}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: 0.8 }}>
              Expected
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#0D1A2B", marginTop: 4 }}>
              {indicator.expected}
            </div>
          </div>
        </div>

        {indicator.subRows && indicator.subRows.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: 0.8 }}>
              Breakdown
            </div>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {indicator.subRows.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 8,
                    alignItems: "baseline",
                    fontSize: 12,
                    color: "#374151",
                  }}
                >
                  <span>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.achieved}</span>
                  <span style={{ color: "#9CA3AF" }}>of {row.expected}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 13, color: "#4B5563", lineHeight: 1.55 }}>
          {indicator.methodologyNote}
        </p>

        {indicator.methodologyUrl && (
          <a
            href={indicator.methodologyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 14,
              fontSize: 12,
              color: "#003F6B",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            How this is measured →
          </a>
        )}
      </aside>
    </div>
  );
}

export default function IndicatorTicker({ indicators }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? indicators.find((i) => i.id === openId) ?? null : null;

  // The track is rendered twice for a seamless loop.
  const doubled = [...indicators, ...indicators];

  return (
    <section aria-label="IDA scorecard indicators" style={{ marginBottom: 32 }}>
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll 120s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
          .ticker-viewport { overflow-x: auto; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: "#9CA3AF",
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: F,
              fontWeight: 500,
            }}
          >
            Indicators
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", fontFamily: F, marginTop: 2 }}>
            Real-time pulse of development outcomes
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: F }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#067647" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 0 4px rgba(16,185,129,0.18)",
              }}
            />
            Auto-updating
          </span>
          <button
            style={{
              fontSize: 12,
              color: "#003F6B",
              fontFamily: F,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            View all 22 →
          </button>
        </div>
      </div>

      {/* Viewport with fade-edge masks */}
      <div
        className="ticker-viewport"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#F8F7F4",
          borderRadius: 12,
          padding: "12px 0",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
        }}
      >
        <div
          className="ticker-track"
          style={{
            display: "flex",
            gap: 10,
            paddingLeft: 12,
            paddingRight: 12,
            width: "max-content",
          }}
        >
          {doubled.map((ind, i) => (
            <TickerCard
              key={`${ind.id}-${i}`}
              indicator={ind}
              onOpen={() => setOpenId(ind.id)}
            />
          ))}
        </div>
      </div>

      {open && <MethodologyDrawer indicator={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/IndicatorTicker.tsx
git commit -m "feat: add IndicatorTicker marquee with methodology drawer"
```

---

## Task 6: Create `TrendingAcrossIDA` section

**Files:**
- Create: `components/TrendingAcrossIDA.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { trendingTop, trendingSides, type TrendingSideCard, type TrendingStat } from "@/lib/mockData";
import IndicatorSparkline from "./IndicatorSparkline";

const F = "'Open Sans', sans-serif";

function statColor(tone: TrendingStat["tone"]) {
  if (tone === "positive") return "#067647";
  if (tone === "negative") return "#B91C1C";
  return "#0D1A2B";
}

function SideCard({ card }: { card: TrendingSideCard }) {
  const isRisk = card.id === "risk-watch";
  const tagBg = isRisk ? "#FEE2E2" : "#EDE9FE";
  const tagFg = isRisk ? "#B91C1C" : "#5B21B6";
  const sparkColor = isRisk ? "#EF4444" : "#7C3AED";

  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: F,
      }}
    >
      <span
        style={{
          alignSelf: "flex-start",
          background: tagBg,
          color: tagFg,
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 6,
          fontWeight: 600,
        }}
      >
        {card.tag}
      </span>

      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
        {card.headline}
      </h4>

      <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
        {card.description}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <a
          href="#"
          style={{ fontSize: 11, color: "#003F6B", fontWeight: 600, textDecoration: "none" }}
        >
          {card.ctaLabel} →
        </a>
        <IndicatorSparkline points={card.sparkline} width={60} height={24} color={sparkColor} />
      </div>
    </article>
  );
}

export default function TrendingAcrossIDA() {
  return (
    <section aria-label="Trending Across IDA" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0D1A2B", fontFamily: F }}>
            Trending Across IDA
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            AI-synthesized patterns from scorecard data and narratives
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all patterns →
        </a>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Top Momentum (left, 58%) */}
        <article
          className="xl:basis-[58%]"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontFamily: F,
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              background: "#E6F4EC",
              color: "#067647",
              fontSize: 10,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {trendingTop.tag}
          </span>

          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", lineHeight: 1.3, fontFamily: F }}>
            {trendingTop.headline}
          </h3>

          <p style={{ margin: 0, fontSize: 14, color: "#4B5563", lineHeight: 1.55 }}>
            {trendingTop.description}
          </p>

          <div
            style={{
              marginTop: 6,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
              borderTop: "1px solid #F3F4F6",
              paddingTop: 14,
            }}
          >
            {trendingTop.stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 600, color: statColor(s.tone), lineHeight: 1.1 }}>
                  {s.value}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: "#6B7280", lineHeight: 1.35 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <a
            href="#"
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#003F6B",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {trendingTop.ctaLabel} →
          </a>
        </article>

        {/* Risk Watch + Emerging Signal (right column) */}
        <div className="flex flex-col gap-3 xl:flex-1">
          {trendingSides.map((c) => (
            <SideCard key={c.id} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/TrendingAcrossIDA.tsx
git commit -m "feat: add TrendingAcrossIDA section with top momentum and risk/emerging cards"
```

---

## Task 7: Create `MomentumGroups` section

**Files:**
- Create: `components/MomentumGroups.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import {
  IconTrendingUp,
  IconAlertTriangle,
  IconBulb,
} from "@tabler/icons-react";
import { momentumGroups, type MomentumGroup } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

interface GroupTheme {
  iconBg: string;
  iconFg: string;
  valueColor: string;
  Icon: typeof IconTrendingUp;
  ctaLabel: string;
}

const THEMES: Record<MomentumGroup["id"], GroupTheme> = {
  accelerating: {
    iconBg: "#E6F4EC",
    iconFg: "#067647",
    valueColor: "#067647",
    Icon: IconTrendingUp,
    ctaLabel: "See all accelerating",
  },
  slowing: {
    iconBg: "#FEE2E2",
    iconFg: "#B91C1C",
    valueColor: "#B91C1C",
    Icon: IconAlertTriangle,
    ctaLabel: "See all slowing",
  },
  emerging: {
    iconBg: "#EDE9FE",
    iconFg: "#5B21B6",
    valueColor: "#5B21B6",
    Icon: IconBulb,
    ctaLabel: "See all emerging",
  },
};

export default function MomentumGroups() {
  return (
    <section aria-label="What's Changing Right Now" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0D1A2B", fontFamily: F }}>
            What&apos;s Changing Right Now
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            Track momentum shifts over time
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {momentumGroups.map((g) => {
          const t = THEMES[g.id];
          const Icon = t.Icon;
          return (
            <article
              key={g.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontFamily: F,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: t.iconBg,
                    color: t.iconFg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden="true"
                >
                  <Icon size={20} stroke={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{g.subtitle}</div>
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {g.rows.map((r) => (
                  <li
                    key={r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      fontSize: 12,
                      color: "#374151",
                      gap: 12,
                    }}
                  >
                    <span style={{ flex: 1, lineHeight: 1.35 }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.valueColor }}>{r.delta}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                style={{ fontSize: 11, color: "#003F6B", fontWeight: 600, textDecoration: "none" }}
              >
                {t.ctaLabel} →
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/MomentumGroups.tsx
git commit -m "feat: add MomentumGroups section for What's Changing Right Now"
```

---

## Task 8: Create `CounterIntuitiveTextCard` and its section wrapper

**Files:**
- Create: `components/CounterIntuitiveTextCard.tsx`

This file exports both the individual card component and a `CounterIntuitiveFindings` section wrapper that lays out the 4-card grid. Keeping them together because the section is small (single grid + header) and the card is only used here.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import {
  IconTrendingUp,
  IconDroplet,
  IconGenderFemale,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import {
  counterIntuitiveTextCards,
  type CounterIntuitiveTextCard,
} from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

interface ToneStyle { bg: string; fg: string; }
const TONES: Record<CounterIntuitiveTextCard["tone"], ToneStyle> = {
  green:  { bg: "#E6F4EC", fg: "#067647" },
  blue:   { bg: "#DBEAFE", fg: "#1D4ED8" },
  purple: { bg: "#EDE9FE", fg: "#5B21B6" },
  amber:  { bg: "#FEF3C7", fg: "#B45309" },
};

const ICON_MAP: Record<CounterIntuitiveTextCard["icon"], typeof IconTrendingUp> = {
  chart:  IconTrendingUp,
  water:  IconDroplet,
  female: IconGenderFemale,
  dollar: IconCurrencyDollar,
};

function Card({ card }: { card: CounterIntuitiveTextCard }) {
  const tone = TONES[card.tone];
  const Icon = ICON_MAP[card.icon];
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: F,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: tone.bg,
          color: tone.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <Icon size={18} stroke={1.8} />
      </div>

      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
        {card.headline}
      </h4>

      <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
        {card.description}
      </p>

      <a
        href="#"
        style={{ marginTop: "auto", fontSize: 11, color: "#003F6B", fontWeight: 600, textDecoration: "none" }}
      >
        Explore insight →
      </a>
    </article>
  );
}

export default function CounterIntuitiveFindings() {
  return (
    <section aria-label="Counter Intuitive Findings" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0D1A2B", fontFamily: F }}>
            Counter Intuitive Findings
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            Where the data challenges assumptions
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {counterIntuitiveTextCards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/CounterIntuitiveTextCard.tsx
git commit -m "feat: add CounterIntuitiveFindings 4-card text section"
```

---

## Task 9: Create `SystemPatternTile` and its section wrapper

**Files:**
- Create: `components/SystemPatternTile.tsx`

Same pattern as Task 8 — tile + section wrapper in one file.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import {
  IconTrendingUp,
  IconDeviceDesktop,
  IconUsers,
  IconLeaf,
  IconUsersGroup,
  IconShield,
} from "@tabler/icons-react";
import { systemPatterns, type SystemPattern } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

interface TintStyle { bg: string; fg: string; }
const TINTS: Record<SystemPattern["tint"], TintStyle> = {
  green:        { bg: "#E6F4EC", fg: "#067647" },
  blue:         { bg: "#DBEAFE", fg: "#1D4ED8" },
  teal:         { bg: "#CCFBF1", fg: "#0F766E" },
  "purple-light": { bg: "#EDE9FE", fg: "#7C3AED" },
  purple:       { bg: "#F3E8FF", fg: "#6B21A8" },
  orange:       { bg: "#FFEDD5", fg: "#C2410C" },
};

const ICON_MAP: Record<SystemPattern["icon"], typeof IconTrendingUp> = {
  trend:      IconTrendingUp,
  digital:    IconDeviceDesktop,
  human:      IconUsers,
  climate:    IconLeaf,
  inclusion:  IconUsersGroup,
  fragility:  IconShield,
};

function Tile({ pattern }: { pattern: SystemPattern }) {
  const tint = TINTS[pattern.tint];
  const Icon = ICON_MAP[pattern.icon];
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
        minHeight: 132,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: F,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: tint.bg,
          color: tint.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <Icon size={16} stroke={1.8} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.35 }}>
        {pattern.name}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#6B7280",
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {pattern.description}
      </div>

      <div style={{ marginTop: "auto", fontSize: 10, color: "#9CA3AF" }}>
        {pattern.narrativeCount} narratives · {pattern.indicatorCount} indicators
      </div>
    </article>
  );
}

export default function SystemPatternGrid() {
  return (
    <section aria-label="Explore by System Pattern" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0D1A2B", fontFamily: F }}>
            Explore by System Pattern
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280", fontFamily: F }}>
            Dive deeper using cross-sector lenses
          </p>
        </div>
        <a href="#" style={{ fontSize: 12, color: "#003F6B", fontFamily: F, textDecoration: "none" }}>
          View all patterns →
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {systemPatterns.map((p) => (
          <Tile key={p.id} pattern={p} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/SystemPatternTile.tsx
git commit -m "feat: add SystemPatternGrid with 6 cross-sector tiles"
```

---

## Task 10: Rewrite landing-page sections in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

Three modifications:

1. Replace the existing imports for components we're removing with the new section imports.
2. Replace the entire `<main>` body inside the home-view branch with the new section ordering.
3. Drop the unused state and helpers that were only used by the old sections (e.g. `modalStory`, `setModalStory`, and the `StoryDetailModal` render) only if they are no longer referenced. Verify by grep — if `modalStory` is still referenced elsewhere in the file, leave it alone.

- [ ] **Step 1: Replace the import block**

Current imports at lines 12–28:

```ts
import SearchHero from "@/components/SearchHero";
import SectionHeader from "@/components/SectionHeader";
import FeaturedStoryCard from "@/components/FeaturedStoryCard";
import StoryCard from "@/components/StoryCard";
import InsightChartCard from "@/components/InsightChartCard";
import CounterIntuitiveCard from "@/components/CounterIntuitiveCard";
import PatternCard from "@/components/PatternCard";
import AppFooter from "@/components/AppFooter";
import StoryDetailModal from "@/components/StoryDetailModal";
import ConversationView from "@/components/conversation/ConversationView";
import NarrativePanel, { NARRATIVE_PANEL_DEFAULT_WIDTH } from "@/components/conversation/NarrativePanel";
import InsightographicPanel from "@/components/conversation/InsightographicPanel";
import ViewerView from "@/components/conversation/ViewerView";
import WorkspaceView from "@/components/conversation/WorkspaceView";
import PromptBar from "@/components/PromptBar";
import ResultsBand from "@/components/ResultsBand";
import FlipStoryCard from "@/components/FlipStoryCard";
```

Replace with:

```ts
import SearchHero from "@/components/SearchHero";
import AppFooter from "@/components/AppFooter";
import StoryDetailModal from "@/components/StoryDetailModal";
import ConversationView from "@/components/conversation/ConversationView";
import NarrativePanel, { NARRATIVE_PANEL_DEFAULT_WIDTH } from "@/components/conversation/NarrativePanel";
import InsightographicPanel from "@/components/conversation/InsightographicPanel";
import ViewerView from "@/components/conversation/ViewerView";
import WorkspaceView from "@/components/conversation/WorkspaceView";
import PromptBar from "@/components/PromptBar";
import IndicatorTicker from "@/components/IndicatorTicker";
import TrendingAcrossIDA from "@/components/TrendingAcrossIDA";
import MomentumGroups from "@/components/MomentumGroups";
import CounterIntuitiveFindings from "@/components/CounterIntuitiveTextCard";
import SystemPatternGrid from "@/components/SystemPatternTile";
```

(`SectionHeader` is no longer used because each new section renders its own header inline.)

- [ ] **Step 2: Replace the `mockData` import block**

Current import at lines 30–38:

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

Replace with:

```ts
import { indicators, secondaryStories } from "@/lib/mockData";
```

(`secondaryStories` is still used by `modalStory` state typing and the `StoryDetailModal` render. Other exports are no longer referenced in `page.tsx`. The unused references to `Story`, `featuredStory`, `changingCards`, `counterIntuitiveCards`, `patternCards` are removed.)

- [ ] **Step 3: Replace the home-view `<main>` body**

Find the entire `<main>` block starting at line 566:

```tsx
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <SearchHero onPillClick={setPromptValue} />

        <FadeIn delay={25}>
          <ResultsBand indicators={indicators} />
        </FadeIn>

        {/* Main 2-col layout */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* ── Left / Main column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">

            {/* Topics Trending */}
            <section aria-label="Topics Trending">
              ...
            </section>

            {/* What's Changing Right Now */}
            <section aria-label="What's Changing Right Now">
              ...
            </section>

            {/* Counter Intuitive Findings */}
            <section aria-label="Counter Intuitive Findings">
              ...
            </section>

            {/* Explore by Patterns */}
            <section aria-label="Explore by Patterns">
              ...
            </section>
          </div>

        </div>

        <div className="h-8" />
      </main>
```

(Stop the replacement at the closing `</main>` — leave `<AppFooter />` and everything below untouched.)

Replace it with:

```tsx
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <SearchHero onPillClick={setPromptValue} />

        <FadeIn delay={25}>
          <IndicatorTicker indicators={indicators} />
        </FadeIn>

        <FadeIn delay={50}>
          <TrendingAcrossIDA />
        </FadeIn>

        <FadeIn delay={75}>
          <MomentumGroups />
        </FadeIn>

        <FadeIn delay={100}>
          <CounterIntuitiveFindings />
        </FadeIn>

        <FadeIn delay={125}>
          <SystemPatternGrid />
        </FadeIn>

        <div className="h-8" />
      </main>
```

- [ ] **Step 4: Remove now-unused handlers if their last call sites are gone**

After Step 3, `handleOpenViewer` is no longer called from the home view, but it is still called elsewhere — verify with:

```bash
grep -n "handleOpenViewer" app/page.tsx
```

If `handleOpenViewer` has zero call sites remaining, delete its definition (currently around lines 369–400). Otherwise, leave it.

Same check for `story3` and `void story3` (lines 172 and 453):

```bash
grep -n "story3\b" app/page.tsx
```

If `story3` is no longer referenced after Step 3, delete its `const story3 = ...` line and the `void story3` line. Otherwise, leave them.

- [ ] **Step 5: Run TypeScript check**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign landing page with indicator ticker and new section layout"
```

---

## Task 11: Dev-server visual verification

**Files:** none (manual check)

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npm run dev
```

Wait for "Ready" log, then open `http://localhost:3000`.

- [ ] **Step 2: Verify the ticker**

1. The `INDICATORS` strip renders below the search hero with header text "Real-time pulse of development outcomes" on the left and "Auto-updating ●  View all 22 →" on the right.
2. Cards scroll left continuously; placing the cursor over the strip pauses the animation; moving the cursor away resumes it.
3. The 22 cards listed in the spec all appear in order; the strip loops seamlessly with no visible jump.
4. The first/last visible cards fade into the edges of the strip (mask gradient).
5. Indicator card #19 ("More and better-paid jobs (Coming soon)") shows "—" for the value, gray styling, and the text "Coming soon".
6. Click any card → a 360px right-side drawer slides in, shows the indicator name, achieved + expected values, a methodology paragraph, and (for #10/#17/#18) a "Breakdown" block listing the sub-rows.
7. Click the scrim or press `Esc` → drawer closes.
8. Open the dev tools, toggle `prefers-reduced-motion: reduce` in the rendering tab. The strip should switch to a horizontally scrollable static layout (no animation).

- [ ] **Step 3: Verify Trending Across IDA**

1. Below the ticker, the section renders with the header "Trending Across IDA" + subhead.
2. On `xl` viewports (≥1280px), the Top Momentum card sits on the left (~58% width), with Risk Watch and Emerging Signal stacked on the right.
3. The Top Momentum card uses Open Sans for its headline (no serif/Crimson Pro).
4. The 4-stat row reads: `18 Countries improving · +14.8% Job access (YoY) · +11.2M New digital wallets · +9.1% Female labor participation`.
5. The Risk Watch card has a red sparkline trending down; the Emerging Signal card has a purple sparkline trending up.

- [ ] **Step 4: Verify What's Changing Right Now**

1. Three cards in a row: Accelerating (green), Slowing (red/amber), Emerging (purple).
2. Each card lists three indicators with the correct delta colors. The Emerging column reads `New` for each row.
3. "See all <group> →" link appears at the bottom of each card.

- [ ] **Step 5: Verify Counter Intuitive Findings**

1. Four cards on a row (`lg:grid-cols-4`), each with a tinted icon circle, headline (Open Sans 14px / 600), description (Open Sans 12px), and "Explore insight →" link.
2. No chart visuals — text + icon only.

- [ ] **Step 6: Verify Explore by System Pattern**

1. Six tiles in a row at `xl`, each with a small icon circle, name, two-line description, and `X narratives · Y indicators` footnote.
2. Below `xl`, the grid collapses to 3 columns, then 2 columns on small screens.

- [ ] **Step 7: Verify untouched flows**

1. Type into the prompt bar and submit — the search-complete conversation flow still works.
2. The AI sidebar opens and closes from the floating button.
3. The header workspace count + open workspace button still works.
4. Resizing to mobile widths: the ticker, trending section, momentum, counter-intuitive, and patterns all degrade gracefully (single-column stack).
5. No editorial photographs appear on the landing page.

- [ ] **Step 8: Final TypeScript and build check**

Run:
```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit
```
Expected: zero errors.

If a build run is desired:
```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npm run build
```
Expected: build completes without errors. (This is optional — `npx tsc` is the project's standard pre-commit check.)

- [ ] **Step 9: Stop the dev server**

`Ctrl+C` in the terminal running `npm run dev`.

- [ ] **Step 10: Final commit (only if any fixups were made during verification)**

If you needed to tweak styles or fix issues during the visual pass, commit those fixes:

```bash
git add -A
git commit -m "fix: address landing-page redesign visual fit-and-finish"
```

If no fixups were needed, skip this step.

---

## Self-Review Against Spec

| Spec requirement | Task that covers it |
|---|---|
| Replace `ResultsBand` with horizontal stock-ticker marquee | Task 5 (component) + Task 10 (wiring) |
| 22 indicators from Active Portfolio Results screenshot | Task 1 (data) |
| Each ticker card: name + achieved + delta + sparkline | Task 5 (`TickerCard`) |
| Coming-soon entry for "More and better-paid jobs" | Task 1 (entry) + Task 5 (`deltaTone` `comingSoon` branch) |
| Auto-scroll pauses on hover; reduced-motion fallback | Task 5 (`.ticker-track` CSS) |
| Click ticker card → methodology drawer with sub-rows | Task 5 (`MethodologyDrawer`) |
| Sub-rows for WASH / Gender / Financial Services | Task 1 (`subRows`) + Task 5 (drawer render) |
| Open Sans throughout, no Crimson Pro | Tasks 5–9 all use `'Open Sans', sans-serif` |
| Trending Across IDA replaces Topics Trending | Task 6 (component) + Task 10 (wiring) |
| 3-column What's Changing Right Now | Task 7 |
| 4-card Counter Intuitive Findings, text-only | Task 8 |
| 6-tile System Pattern grid | Task 9 |
| Drop all editorial photography | Task 10 (no `FeaturedStoryCard`/`StoryCard` renders) |
| Search hero, prompt bar, AI sidebar, post-search views unchanged | Task 10 only touches the home `<main>` body |
| `ResultsBand.tsx` stays on disk and still compiles | Task 2 |
| Full TypeScript pass at every commit | every task includes `npx tsc --noEmit` |
