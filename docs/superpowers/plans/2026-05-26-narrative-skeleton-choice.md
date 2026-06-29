# Narrative Skeleton Choice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single skeleton in the `skeleton-ready` phase with a horizontal carousel of 4 narrative-angle cards (drawn from PAD/ISR/ICR analysis), gate the existing "Yes, create narrative" button on a card selection, and persist the chosen `skeletonId` on the created artefact.

**Architecture:** Two new files (data + presentational component) co-located with `ConversationView.tsx`. Three modify-only edits: `ConversationView.tsx` swaps the old skeleton message for the new chooser; `PromptBar.tsx` gains a `narrativeConfirmDisabled` prop; `app/page.tsx` adds a `selectedSkeletonId` state, threads it through both, and writes `skeletonId` onto the artefact when the user confirms. No tests — this is a Next.js mock prototype with no test infra. Each task ends with `npx tsc --noEmit` (typecheck) + a manual run pass.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, framer-motion, @tabler/icons-react. No test runner in this repo.

**Spec:** `docs/superpowers/specs/2026-05-26-narrative-skeleton-choice-design.md`

---

## File structure

| File | Action | Responsibility |
|---|---|---|
| `components/conversation/NarrativeSkeletons.ts` | **Create** | `NarrativeSkeleton` type + `FLOW_SKELETONS` data (4 angles per flow). Pure data + types, no React. |
| `components/conversation/NarrativeSkeletonChoice.tsx` | **Create** | The 4-card horizontal carousel + selection UI. Presentational; receives `selectedSkeletonId` and `onSelect` from parent. |
| `components/conversation/ConversationView.tsx` | **Modify** | Add `selectedSkeletonId` + `onSelectSkeleton` to `Props`. Swap `<NarrativeSkeletonMessage />` for `<NarrativeSkeletonChoice />`. Delete `NarrativeSkeletonMessage` function + `SKELETON_LEAD` const. |
| `components/PromptBar.tsx` | **Modify** | Add `narrativeConfirmDisabled?: boolean` prop. Apply disabled styling on the "Yes, create narrative" button (lines 203-210). |
| `app/page.tsx` | **Modify** | Add `selectedSkeletonId` state. Reset on `handleCreateNarrative` and `handleNarrativeMakeChanges`. Persist `skeletonId` on the Artefact in `handleNarrativeConfirm`. Add `skeletonId?: string` to both `Artefact` interfaces (this file + `ConversationView.tsx` re-declaration). |

---

### Task 1: Create the skeleton data file

**Files:**
- Create: `components/conversation/NarrativeSkeletons.ts`

- [ ] **Step 1: Create the file with the type + data**

```ts
// components/conversation/NarrativeSkeletons.ts
//
// Per-flow 4-angle skeleton data shown in the skeleton-ready phase of the
// narrative-creation flow. Each angle is one analytical framing the user can
// pick. Mirrors the FLOW_CONTENT pattern in ConversationView.tsx.

import type { FlowId } from "./ConversationView";

export type SkeletonMarker = "I" | "II" | "III" | "IV";

export interface NarrativeSkeleton {
  id: string;
  marker: SkeletonMarker;
  title: string;
  challengeTeaser: string;
  countryExamples: [string, string];
  sourceCounts: { pads: number; isrs: number; icrs: number };
}

export type NarrativeSkeletonSet = readonly [
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
  NarrativeSkeleton,
];

export const FLOW_SKELETONS: Record<FlowId, NarrativeSkeletonSet> = {
  "africa-poverty": [
    {
      id: "africa-poverty-climate-safety-nets",
      marker: "I",
      title: "Climate Shocks & Social Safety Nets",
      challengeTeaser:
        "Recurrent droughts and floods erode household resilience faster than recovery transfers can scale, leaving the poorest exposed to repeated shocks.",
      countryExamples: ["Ethiopia", "Niger"],
      sourceCounts: { pads: 11, isrs: 8, icrs: 3 },
    },
    {
      id: "africa-poverty-learning-teacher-capacity",
      marker: "II",
      title: "Learning Poverty & Teacher Capacity",
      challengeTeaser:
        "70% of primary-age children cannot read a simple passage, while a teaching workforce trained in outdated, theoretical methods perpetuates the gap.",
      countryExamples: ["Madagascar", "Kenya"],
      sourceCounts: { pads: 9, isrs: 7, icrs: 4 },
    },
    {
      id: "africa-poverty-fiscal-space-revenue",
      marker: "III",
      title: "Fiscal Space & Domestic Revenue",
      challengeTeaser:
        "56 economies collect less than 15% tax-to-GDP, limiting public investment in human capital and basic services even as poverty deepens.",
      countryExamples: ["Sierra Leone", "Rwanda"],
      sourceCounts: { pads: 8, isrs: 6, icrs: 2 },
    },
    {
      id: "africa-poverty-fragility-displacement",
      marker: "IV",
      title: "Fragility, Conflict & Displacement",
      challengeTeaser:
        "Extreme poverty is now concentrated in FCS contexts where conflict destroys services and forced displacement disrupts livelihoods for years.",
      countryExamples: ["South Sudan", "Yemen"],
      sourceCounts: { pads: 12, isrs: 9, icrs: 5 },
    },
  ],
  "health-gap": [
    {
      id: "health-gap-workforce-density",
      marker: "I",
      title: "Health Workforce Density in FCS",
      challengeTeaser:
        "FCS countries average 0.8 health workers per 1,000 people — a quarter of WHO's threshold for basic service delivery and the binding constraint on coverage.",
      countryExamples: ["Yemen", "Afghanistan"],
      sourceCounts: { pads: 10, isrs: 8, icrs: 4 },
    },
    {
      id: "health-gap-primary-care-last-mile",
      marker: "II",
      title: "Primary-Care Access at the Last Mile",
      challengeTeaser:
        "Remote and pastoralist communities sit beyond functional referral catchments, so even funded clinics fail to convert into service contacts.",
      countryExamples: ["Mozambique", "Sudan"],
      sourceCounts: { pads: 9, isrs: 7, icrs: 3 },
    },
    {
      id: "health-gap-stunting-nutrition",
      marker: "III",
      title: "Stunting & Nutrition in Children Under-5",
      challengeTeaser:
        "Under-5 stunting in FCS sits at 33.6% — locking in cognitive and economic losses that no later-life intervention can fully reverse.",
      countryExamples: ["Pakistan", "Bangladesh"],
      sourceCounts: { pads: 8, isrs: 6, icrs: 4 },
    },
    {
      id: "health-gap-emergency-response",
      marker: "IV",
      title: "Emergency Health Response Capacity",
      challengeTeaser:
        "Recurrent disease outbreaks and crisis episodes overwhelm fragile health systems, eroding the gains made during stable years.",
      countryExamples: ["Myanmar", "South Sudan"],
      sourceCounts: { pads: 11, isrs: 9, icrs: 3 },
    },
  ],
  "electricity-fcs": [
    {
      id: "electricity-fcs-grid-extension",
      marker: "I",
      title: "Grid Extension to Remote Settlements",
      challengeTeaser:
        "78M households in FCS countries remain unconnected, and last-mile grid economics fall apart at low population densities and high insecurity costs.",
      countryExamples: ["DRC", "Chad"],
      sourceCounts: { pads: 10, isrs: 7, icrs: 3 },
    },
    {
      id: "electricity-fcs-off-grid-solar",
      marker: "II",
      title: "Off-Grid & Mini-Grid Solar",
      challengeTeaser:
        "Distributed solar can leapfrog the grid for scattered settlements, but financing, maintenance, and tariff models stall pilots before they scale.",
      countryExamples: ["Nigeria", "Burkina Faso"],
      sourceCounts: { pads: 9, isrs: 8, icrs: 4 },
    },
    {
      id: "electricity-fcs-affordability-tariff",
      marker: "III",
      title: "Affordability & Tariff Reform",
      challengeTeaser:
        "Cost-recovery tariffs price the poorest out, while subsidised tariffs hollow out utility balance sheets — neither path serves connection targets.",
      countryExamples: ["Mali", "Madagascar"],
      sourceCounts: { pads: 8, isrs: 6, icrs: 2 },
    },
    {
      id: "electricity-fcs-climate-resilient-generation",
      marker: "IV",
      title: "Climate-Resilient Generation Capacity",
      challengeTeaser:
        "Hydro-dependent grids face dry-season collapse and flood damage; diversification into renewables with storage is the resilience path.",
      countryExamples: ["Mozambique", "Zambia"],
      sourceCounts: { pads: 11, isrs: 9, icrs: 5 },
    },
  ],
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add components/conversation/NarrativeSkeletons.ts
git commit -m "feat(narrative): add 4-angle skeleton data per flow"
```

---

### Task 2: Create the `NarrativeSkeletonChoice` component

**Files:**
- Create: `components/conversation/NarrativeSkeletonChoice.tsx`

- [ ] **Step 1: Create the file**

```tsx
// components/conversation/NarrativeSkeletonChoice.tsx
//
// Renders the AI assistant message + 4 narrative-angle cards as a horizontal
// scroll-snap carousel in the skeleton-ready phase. Clicking a card sets the
// selection; clicking the selected card again toggles it off.

"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import {
  FLOW_SKELETONS,
  type NarrativeSkeleton,
} from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";

interface Props {
  flow: FlowId;
  selectedSkeletonId: string | null;
  onSelect: (id: string | null) => void;
  /** When true, animate the lead text + stagger the cards in. */
  animate: boolean;
}

export default function NarrativeSkeletonChoice({
  flow,
  selectedSkeletonId,
  onSelect,
  animate,
}: Props) {
  const skeletons = FLOW_SKELETONS[flow];

  // Sum source counts across the 4 skeletons for the lead-text message.
  const totals = skeletons.reduce(
    (acc, s) => ({
      pads: acc.pads + s.sourceCounts.pads,
      isrs: acc.isrs + s.sourceCounts.isrs,
      icrs: acc.icrs + s.sourceCounts.icrs,
    }),
    { pads: 0, isrs: 0, icrs: 0 },
  );

  const leadText = `I analysed ${totals.pads} PADs, ${totals.isrs} ISRs, and ${totals.icrs} ICRs and found 4 angles for this narrative. Pick one to expand.`;

  // Stagger card mount-in by 80ms per card when animating.
  const [revealedCount, setRevealedCount] = useState(animate ? 0 : 4);
  useEffect(() => {
    if (!animate) {
      setRevealedCount(4);
      return;
    }
    setRevealedCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Wait ~300ms after mount for the lead text to settle, then reveal each card.
    for (let i = 0; i < 4; i++) {
      timers.push(setTimeout(() => setRevealedCount((n) => Math.max(n, i + 1)), 300 + i * 80));
    }
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">{leadText}</p>

        {/* Horizontal scroll-snap carousel — bleeds 8px past the gutters
            so partially-scrolled cards aren't clipped at the edges. */}
        <div
          className="-mx-2 px-2 overflow-x-auto scrollbar-auto-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          <div className="flex gap-3 pb-1">
            {skeletons.map((s, i) => (
              <SkeletonCard
                key={s.id}
                skeleton={s}
                selected={selectedSkeletonId === s.id}
                revealed={i < revealedCount}
                onClick={() =>
                  onSelect(selectedSkeletonId === s.id ? null : s.id)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({
  skeleton,
  selected,
  revealed,
  onClick,
}: {
  skeleton: NarrativeSkeleton;
  selected: boolean;
  revealed: boolean;
  onClick: () => void;
}) {
  const { marker, title, challengeTeaser, countryExamples, sourceCounts } = skeleton;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{ scrollSnapAlign: "start" }}
      className={
        "relative shrink-0 w-[280px] text-left bg-white rounded-xl p-4 flex flex-col gap-2.5 " +
        "transition-[opacity,transform,border-color,box-shadow,background] duration-200 " +
        (revealed
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-1 pointer-events-none ") +
        (selected
          ? "border-2 border-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.12)] "
          : "border border-gray-200 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] ")
      }
    >
      {/* Selected check pill — top-right */}
      {selected && (
        <span
          aria-hidden
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"
        >
          <IconCheck size={11} stroke={3} className="text-white" />
        </span>
      )}

      <span className="text-[11px] font-semibold text-gray-400 tracking-wider">
        {marker}
      </span>

      <h4
        className="text-[14px] font-semibold text-gray-900 leading-snug"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </h4>

      <p
        className="text-[12.5px] text-gray-700 leading-relaxed"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {challengeTeaser}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
        {countryExamples.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[11px] text-gray-700"
          >
            <span className="w-1 h-1 rounded-full bg-gray-400" aria-hidden />
            {c}
          </span>
        ))}
      </div>

      <div className="mt-1 pt-2 border-t border-gray-100 text-[10.5px] text-gray-400">
        Built from {sourceCounts.pads} PADs · {sourceCounts.isrs} ISRs · {sourceCounts.icrs} ICRs
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes with no errors. (Note: `FlowId` is imported from `./ConversationView` which already exports it at line 80 of that file — no change needed there.)

- [ ] **Step 3: Commit**

```bash
git add components/conversation/NarrativeSkeletonChoice.tsx
git commit -m "feat(narrative): add NarrativeSkeletonChoice carousel component"
```

---

### Task 3: Wire `NarrativeSkeletonChoice` into `ConversationView` and remove the old skeleton message

**Files:**
- Modify: `components/conversation/ConversationView.tsx`

- [ ] **Step 1: Add new props to the `Props` interface**

Find the existing `Props` interface (it ends around line 71 — last field is `onNarrativePlanningComplete`). Add two new fields right after it:

Current ending of `Props`:
```ts
  /** Fires when the NarrativePlanningMessage step animation completes. */
  onNarrativePlanningComplete?: () => void;
}
```

Change to:
```ts
  /** Fires when the NarrativePlanningMessage step animation completes. */
  onNarrativePlanningComplete?: () => void;
  /** Currently selected narrative-skeleton id in the skeleton-ready phase. */
  selectedSkeletonId?: string | null;
  /** Called when the user clicks a skeleton card (or clicks it again to toggle off). */
  onSelectSkeleton?: (id: string | null) => void;
}
```

- [ ] **Step 2: Destructure the new props in the function signature**

Find the function signature (it's around line 1200-1204, the destructuring object). It currently ends with `onNarrativePlanningComplete,`. Add the two new ones:

Current:
```tsx
  narrativePhase = "idle",
  onNarrativePlanningComplete,
}: Props) {
```

Change to:
```tsx
  narrativePhase = "idle",
  onNarrativePlanningComplete,
  selectedSkeletonId = null,
  onSelectSkeleton,
}: Props) {
```

- [ ] **Step 3: Import the new component**

In the import block at the top of the file (the `@tabler/icons-react` block ends at line 26, and `recharts` block ends at line 35, then there's `import type { NarrativePhase } from "../../app/page";` at line 36), add a new import line below the NarrativePhase import:

```tsx
import type { NarrativePhase } from "../../app/page";
import NarrativeSkeletonChoice from "./NarrativeSkeletonChoice";
```

- [ ] **Step 4: Swap the render site**

Find line ~1469:
```tsx
          {showBlock2 && <NarrativeSkeletonMessage animate={narrativePhase === "skeleton-ready"} />}
```

Replace with:
```tsx
          {showBlock2 && (
            <NarrativeSkeletonChoice
              flow={flow}
              selectedSkeletonId={selectedSkeletonId}
              onSelect={(id) => onSelectSkeleton?.(id)}
              animate={narrativePhase === "skeleton-ready"}
            />
          )}
```

- [ ] **Step 5: Delete the old `NarrativeSkeletonMessage` function and `SKELETON_LEAD` constant**

Delete the block from line 945 to line 1080 (inclusive):
- Line 945: `const SKELETON_LEAD = "Here's the outline for your narrative. Let me know if this looks right:";`
- Line 946: blank
- Lines 947–1080: the entire `function NarrativeSkeletonMessage({ animate }: { animate: boolean }) { ... }` definition (ends with the closing `}` of the function).

Verify by grepping after the delete:
```bash
grep -n "NarrativeSkeletonMessage\|SKELETON_LEAD" components/conversation/ConversationView.tsx
```
Expected: no matches.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes with no errors. (`StreamingText` may now be unused — if tsc flags it via `noUnusedLocals`, leave it; the project tsconfig doesn't enforce that based on prior commits. If a real error appears, address only that specific error.)

- [ ] **Step 7: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat(narrative): swap single skeleton message for 4-card chooser"
```

---

### Task 4: Add `narrativeConfirmDisabled` prop to `PromptBar`

**Files:**
- Modify: `components/PromptBar.tsx`

- [ ] **Step 1: Add the prop to the `Props` interface**

Find the `Props` interface (lines 18-50). After the `onNarrativeMakeChanges` field (line 44), add a new field:

Current:
```ts
  /** Fires when the user clicks "Make changes" in skeleton-ready phase. */
  onNarrativeMakeChanges?: () => void;
  /** When true, submit doesn't trigger a new conversation transition. */
  inConversation?: boolean;
```

Change to:
```ts
  /** Fires when the user clicks "Make changes" in skeleton-ready phase. */
  onNarrativeMakeChanges?: () => void;
  /** When true, the "Yes, create narrative" button is disabled (no skeleton picked yet). */
  narrativeConfirmDisabled?: boolean;
  /** When true, submit doesn't trigger a new conversation transition. */
  inConversation?: boolean;
```

- [ ] **Step 2: Destructure the new prop**

In the function signature (lines 56-73), add `narrativeConfirmDisabled = false,` after `onNarrativeMakeChanges,`:

Current:
```tsx
  onNarrativeConfirm,
  onNarrativeMakeChanges,
  inConversation = false,
```

Change to:
```tsx
  onNarrativeConfirm,
  onNarrativeMakeChanges,
  narrativeConfirmDisabled = false,
  inConversation = false,
```

- [ ] **Step 3: Apply disabled styling to the "Yes, create narrative" button**

Find the button at lines 203-210:

Current:
```tsx
              <button
                type="button"
                onClick={() => onNarrativeConfirm?.()}
                className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-white bg-blue-600 border border-blue-600 rounded-full shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-colors"
              >
                <IconCheck size={12} />
                Yes, create narrative
              </button>
```

Change to:
```tsx
              <button
                type="button"
                onClick={() => onNarrativeConfirm?.()}
                disabled={narrativeConfirmDisabled}
                aria-disabled={narrativeConfirmDisabled}
                className={
                  "flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-full shadow-sm active:scale-[0.98] transition-colors " +
                  (narrativeConfirmDisabled
                    ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                    : "text-white bg-blue-600 border border-blue-600 hover:bg-blue-700")
                }
              >
                <IconCheck size={12} />
                Yes, create narrative
              </button>
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes with no errors.

- [ ] **Step 5: Commit**

```bash
git add components/PromptBar.tsx
git commit -m "feat(narrative): gate 'Yes, create narrative' on skeleton selection"
```

---

### Task 5: Wire `selectedSkeletonId` through `app/page.tsx` and persist `skeletonId` on the artefact

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/conversation/ConversationView.tsx` (one tiny change — extend the local `Artefact` interface)

- [ ] **Step 1: Add `skeletonId?: string` to the page-level `Artefact` interface**

In `app/page.tsx`, find the inline `Artefact` interface (around line 215-221):

Current:
```ts
  interface Artefact {
    id: string;
    kind: "narrative" | "infographic";
    title: string;
    prompt: string;
    createdAt: number;
  }
```

Change to:
```ts
  interface Artefact {
    id: string;
    kind: "narrative" | "infographic";
    title: string;
    prompt: string;
    createdAt: number;
    /** Which narrative-angle skeleton the user picked (narrative artefacts only). */
    skeletonId?: string;
  }
```

- [ ] **Step 2: Mirror the field on the exported `Artefact` in `ConversationView.tsx`**

In `components/conversation/ConversationView.tsx`, find the exported `Artefact` interface (lines 40-46):

Current:
```ts
export interface Artefact {
  id: string;
  kind: "narrative" | "infographic";
  title: string;
  prompt: string;
  createdAt: number;
}
```

Change to:
```ts
export interface Artefact {
  id: string;
  kind: "narrative" | "infographic";
  title: string;
  prompt: string;
  createdAt: number;
  /** Which narrative-angle skeleton the user picked (narrative artefacts only). */
  skeletonId?: string;
}
```

- [ ] **Step 3: Add `selectedSkeletonId` state**

In `app/page.tsx`, find the state declarations around line 174-187. Right after `const [narrativePhase, setNarrativePhase] = useState<NarrativePhase>("idle");` (line 174), add:

```tsx
  const [narrativePhase, setNarrativePhase] = useState<NarrativePhase>("idle");
  const [selectedSkeletonId, setSelectedSkeletonId] = useState<string | null>(null);
```

- [ ] **Step 4: Reset selection when entering planning**

Find `handleCreateNarrative` (around line 253-262):

Current:
```tsx
  const handleCreateNarrative = () => {
    if (!currentConversationId) return;
    // One narrative per conversation — if one already exists, just re-open the panel.
    const existing = currentConversation?.artefacts.find((a) => a.kind === "narrative");
    if (existing) {
      setRightPane("narrative");
      return;
    }
    setNarrativePhase("planning");
  };
```

Change the final lines so the selection resets when a new planning round starts:
```tsx
  const handleCreateNarrative = () => {
    if (!currentConversationId) return;
    // One narrative per conversation — if one already exists, just re-open the panel.
    const existing = currentConversation?.artefacts.find((a) => a.kind === "narrative");
    if (existing) {
      setRightPane("narrative");
      return;
    }
    setSelectedSkeletonId(null);
    setNarrativePhase("planning");
  };
```

- [ ] **Step 5: Reset selection on "Make changes"**

Find `handleNarrativeMakeChanges` (around line 293-295):

Current:
```tsx
  const handleNarrativeMakeChanges = () => {
    setNarrativePhase("idle");
  };
```

Change to:
```tsx
  const handleNarrativeMakeChanges = () => {
    setSelectedSkeletonId(null);
    setNarrativePhase("idle");
  };
```

- [ ] **Step 6: Persist `skeletonId` on the artefact in `handleNarrativeConfirm`**

Find `handleNarrativeConfirm` (around line 268-291). The artefact is built around line 272-278:

Current:
```tsx
    const a: Artefact = {
      id: Date.now().toString(),
      kind: "narrative",
      title: deriveArtefactTitle(conversationPrompt) || "Untitled narrative",
      prompt: conversationPrompt,
      createdAt: Date.now(),
    };
```

Change to:
```tsx
    const a: Artefact = {
      id: Date.now().toString(),
      kind: "narrative",
      title: deriveArtefactTitle(conversationPrompt) || "Untitled narrative",
      prompt: conversationPrompt,
      createdAt: Date.now(),
      skeletonId: selectedSkeletonId ?? undefined,
    };
```

- [ ] **Step 7: Thread the state into `ConversationView` props**

Find the `<ConversationView ... />` render block around line 526-540. After the `onNarrativePlanningComplete` prop (line 539), add the two new props:

Current:
```tsx
          narrativePhase={narrativePhase}
          onNarrativePlanningComplete={handleNarrativePlanningComplete}
        />
```

Change to:
```tsx
          narrativePhase={narrativePhase}
          onNarrativePlanningComplete={handleNarrativePlanningComplete}
          selectedSkeletonId={selectedSkeletonId}
          onSelectSkeleton={setSelectedSkeletonId}
        />
```

- [ ] **Step 8: Thread the disabled flag into `PromptBar` props**

Find the `<PromptBar ... />` render block around line 443-471. After the `onNarrativeMakeChanges` prop (line 460), add:

Current:
```tsx
        narrativePhase={narrativePhase}
        onNarrativeConfirm={handleNarrativeConfirm}
        onNarrativeMakeChanges={handleNarrativeMakeChanges}
        inConversation={view === "conversation"}
```

Change to:
```tsx
        narrativePhase={narrativePhase}
        onNarrativeConfirm={handleNarrativeConfirm}
        onNarrativeMakeChanges={handleNarrativeMakeChanges}
        narrativeConfirmDisabled={narrativePhase === "skeleton-ready" && selectedSkeletonId === null}
        inConversation={view === "conversation"}
```

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes with no errors.

- [ ] **Step 10: Commit**

```bash
git add app/page.tsx components/conversation/ConversationView.tsx
git commit -m "feat(narrative): thread selectedSkeletonId through page + persist on artefact"
```

---

### Task 6: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server reports `Local: http://localhost:3000` (or similar). Leave running.

- [ ] **Step 2: Walk the golden path in a browser**

In the browser at `http://localhost:3000`:

1. Submit a query in the prompt bar — e.g. "Show me extreme poverty trends in Sub-Saharan Africa". The conversation view should open.
2. Wait for the AI response to finish streaming. Scroll to the bottom so the "Create narrative" chip is visible.
3. Click **"Create narrative"**.
4. Observe the planning steps animate, then collapse.
5. The new lead text should appear: *"I analysed 40 PADs, 30 ISRs, and 14 ICRs and found 4 angles for this narrative. Pick one to expand."* (Totals vary by detected flow — for the default `africa-poverty` flow the totals are 40 PADs · 30 ISRs · 14 ICRs.)
6. Four cards should stagger in below it, in a horizontal scroll-snap row inside the conversation thread.
7. Verify the **"Yes, create narrative"** button above the PromptBar is in its disabled state (gray bg, gray text, no hover).
8. Scroll the carousel horizontally with the trackpad — confirm snap behaviour.
9. Click a card. Verify: blue ring border, blue check pill in top-right, "Yes, create narrative" button flips to primary blue.
10. Click the same card again. Verify: it deselects, button returns to disabled.
11. Click a different card. Confirm: only one card has the selected state at a time.
12. Click **"Make changes"**. Verify the flow returns to `idle` (chip returns to "Create narrative", carousel disappears) and selection resets — confirm by re-entering planning and seeing no card pre-selected.
13. Re-enter the flow, pick a card, click **"Yes, create narrative"**. The right-side `NarrativePanel` should open as before.

- [ ] **Step 3: Spot-check the other two flows**

Repeat the golden path with prompts that trip the other flows:

- Prompt: "What's behind the health services target gap?" → flow detects as `health-gap`. Carousel should show "Health Workforce Density in FCS", "Primary-Care Access at the Last Mile", "Stunting & Nutrition in Children Under-5", "Emergency Health Response Capacity". Totals: 38 PADs · 30 ISRs · 14 ICRs.
- Prompt: "What's driving low energy access in FCS countries?" → flow detects as `electricity-fcs`. Carousel should show "Grid Extension to Remote Settlements", "Off-Grid & Mini-Grid Solar", "Affordability & Tariff Reform", "Climate-Resilient Generation Capacity". Totals: 38 PADs · 30 ISRs · 14 ICRs.

- [ ] **Step 4: Stop the dev server**

Stop the running dev server process.

- [ ] **Step 5: Final typecheck**

Run: `npx tsc --noEmit`
Expected: passes with no errors.

- [ ] **Step 6: Final commit if anything was tweaked**

If steps 2 or 3 surfaced a tweak (typo in lead text, off-by-one stagger), commit it:
```bash
git add -p
git commit -m "fix(narrative): adjustments after manual verification"
```

If nothing was tweaked, skip this step.
