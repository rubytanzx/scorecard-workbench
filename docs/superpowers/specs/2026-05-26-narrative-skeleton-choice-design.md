# Narrative Skeleton Choice — Design Spec

**Date:** 2026-05-26
**Status:** Approved

## Problem

In the current narrative-building flow, the `skeleton-ready` phase shows a single pre-baked skeleton (`NarrativeSkeletonMessage`) and asks the user to confirm with **"Yes, create narrative"** or revise with **"Make changes"**. The user has no chance to choose an analytical angle — the framing is decided for them. We want to surface that the assistant has analysed multiple project documents (PADs, ISRs, ICRs) and let the user pick which framing becomes the full narrative.

## Solution

Replace the single skeleton message with a **4-card chooser** rendered inline in the conversation. Each card is a compact summary of one analytical angle drawn from project-document analysis. The user clicks a card to highlight it, then commits via the existing **"Yes, create narrative"** button. Selection is required — the confirm button is disabled until a card is picked.

---

## Phase state machine

The existing `NarrativePhase` (`idle | planning | skeleton-ready | generating`) is unchanged. A new state variable holds the user's selection:

```ts
const [selectedSkeletonId, setSelectedSkeletonId] = useState<string | null>(null);
```

| Transition | Effect on `selectedSkeletonId` |
|---|---|
| Enter `planning` | reset to `null` |
| Enter `skeleton-ready` | stays `null` (no default selection) |
| User clicks a skeleton card | set to that card's `id` |
| User clicks the already-selected card | reset to `null` (toggle off) |
| User clicks **"Make changes"** | reset to `null`, phase → `idle` |
| User clicks **"Yes, create narrative"** | stays set; carried into the artefact |

The `handleNarrativeConfirm` callback persists `skeletonId` on the new artefact:

```ts
interface Artefact {
  id: string;
  kind: "narrative" | "infographic";
  title: string;
  prompt: string;
  createdAt: number;
  skeletonId?: string;   // NEW — which angle the user picked
}
```

---

## Data shape

```ts
interface NarrativeSkeleton {
  id: string;                          // "transport-climate"
  marker: "I" | "II" | "III" | "IV";
  title: string;                       // "Climate Vulnerability of Transport Infrastructure"
  challengeTeaser: string;             // 2-line summary
  countryExamples: [string, string];   // ["Tonga", "Mozambique"]
  sourceCounts: { pads: number; isrs: number; icrs: number };
}
```

Mirroring the existing `FLOW_CONTENT` pattern, one 4-skeleton set per `FlowId`:

```ts
const FLOW_SKELETONS: Record<FlowId, [NarrativeSkeleton, NarrativeSkeleton, NarrativeSkeleton, NarrativeSkeleton]> = {
  "africa-poverty":  [ ... 4 angles ... ],
  "health-gap":      [ ... 4 angles ... ],
  "electricity-fcs": [ ... 4 angles ... ],
};
```

Initial mock content per flow (thematically faithful to the transport/education examples the user provided):

| Flow | I | II | III | IV |
|---|---|---|---|---|
| `africa-poverty` | Climate Shocks & Social Safety Nets | Learning Poverty & Teacher Capacity | Fiscal Space & Domestic Revenue | Fragility, Conflict & Displacement |
| `health-gap` | Health Workforce Density in FCS | Primary-Care Access at the Last Mile | Stunting & Nutrition in Children Under-5 | Emergency Health Response Capacity |
| `electricity-fcs` | Grid Extension to Remote Settlements | Off-Grid & Mini-Grid Solar | Affordability & Tariff Reform | Climate-Resilient Generation Capacity |

Each skeleton carries 2 country examples and a `sourceCounts` triplet — numbers are mocked but plausible (PADs 8–14, ISRs 6–12, ICRs 2–6).

---

## Component change

A new component `NarrativeSkeletonChoice` replaces `NarrativeSkeletonMessage` at its existing render site in `ConversationView.tsx` (around line 1469):

```tsx
{showBlock2 && (
  <NarrativeSkeletonChoice
    flow={flow}
    selectedSkeletonId={selectedSkeletonId}
    onSelect={onSelectSkeleton}
    animate={narrativePhase === "skeleton-ready"}
  />
)}
```

`NarrativeSkeletonMessage` is removed. The `SKELETON_LEAD` string is replaced by a new lead that surfaces source provenance:

> *"I analysed N PADs, N ISRs, and N ICRs and found 4 angles for this narrative. Pick one to expand."*

`N` is summed across the 4 skeletons in the active flow.

---

## Card anatomy

```
┌─────────────────────────────────────┐
│  I                                  │   ← Roman numeral marker — 11px, gray-400, semibold
│                                     │
│  Climate Vulnerability of           │   ← Title — 14px, gray-900, semibold, 2-line clamp
│  Transport Infrastructure           │
│                                     │
│  Transport networks face high       │   ← Challenge teaser — 12.5px, gray-700, 2-line clamp
│  exposure to floods, landslides,    │
│  and sea-level rise…                │
│                                     │
│  ● Tonga   ● Mozambique             │   ← Country chips — small pill, 11px
│                                     │
│  Built from 12 PADs · 9 ISRs · 4 ICRs│  ← Provenance — 10.5px, gray-400, top-divider
└─────────────────────────────────────┘
```

- **Dimensions:** 280px wide, height fits content (~200px)
- **Spacing:** 16px internal padding, 12px gap between cards
- **Idle:** 1px gray-200 border, white background
- **Hover:** border → gray-300, subtle shadow `0 2px 8px rgba(0,0,0,0.04)`
- **Selected:** 2px blue-600 ring (matches existing PromptBar focus ring), inner background tint `rgba(37,99,235,0.04)`, and a 16px check pill (white check on blue-600 background) in the top-right corner
- **Click target:** the entire card is one button (full-area click). Re-clicking the selected card deselects.

## Layout

Horizontal scroll-snap row inside the existing conversation thread (max-width 680px):

```
┌────────────────────────────────────────────────────────────────┐
│ SC  I analysed 38 PADs, 27 ISRs, and 12 ICRs and found 4       │
│     angles for this narrative. Pick one to expand.             │
│                                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  I       │ │  II      │ │  III     │ │  IV      │  →        │
│  │ Climate  │ │ Urban    │ │ Rural    │ │ Road     │           │
│  │ Vuln.    │ │ Transit  │ │ Connect. │ │ Safety   │           │
│  │ ...      │ │ ...      │ │ ...      │ │ ...      │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└────────────────────────────────────────────────────────────────┘
```

- Container: `overflow-x-auto`, `scroll-snap-type: x mandatory`, `-mx-2 px-2` to bleed the row 8px past the thread gutters so partially-scrolled cards aren't visually clipped at the edge.
- Each card: `scroll-snap-align: start`.
- Scrollbar hidden visually but accessible (existing `scrollbar-auto-hide` utility).
- ~2.2 cards visible at a time inside the 680px thread, motivating the horizontal scroll cue.

## PromptBar change

`PromptBar`'s "Yes, create narrative" button gains a `disabled` state driven by `selectedSkeletonId === null`. Visual states:

| State | Style |
|---|---|
| `disabled` (no selection) | `bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed` — no hover |
| `enabled` (a card is selected) | existing primary-blue style |

A new prop:

```ts
narrativeConfirmDisabled?: boolean
```

`page.tsx` threads `selectedSkeletonId === null` into this prop.

"Make changes" button is unchanged.

---

## Animation / motion

- **Card stagger-in:** when entering `skeleton-ready`, cards animate in with the existing `narrative-content-enter` fade-up class, staggered 80ms per card (cards 1–4 at 0/80/160/240ms after the lead text completes).
- **Selection transition:** 200ms ease on `border-color`, `box-shadow`, `background`. Checkmark pill scale-in uses the spring already in `MadLibsInput` (`{ type: "spring", stiffness: 500, damping: 32, mass: 0.7 }`).
- **Deselection:** same transition reversed; checkmark pill scale-out.

---

## Wire-up summary

| File | Change |
|---|---|
| `app/page.tsx` | Add `selectedSkeletonId` state. Reset on entry to `planning` and on `handleNarrativeMakeChanges`. Persist `skeletonId` on the artefact in `handleNarrativeConfirm`. Thread `selectedSkeletonId` and `setSelectedSkeletonId` into `ConversationView` and `PromptBar`. |
| `components/conversation/ConversationView.tsx` | Add `NarrativeSkeleton`, `FLOW_SKELETONS`, and `NarrativeSkeletonChoice` component. Replace `NarrativeSkeletonMessage` usage at line ~1469. Remove `NarrativeSkeletonMessage` and `SKELETON_LEAD`. New props on `ConversationView`: `selectedSkeletonId`, `onSelectSkeleton`. |
| `components/PromptBar.tsx` | Add `narrativeConfirmDisabled` prop. Apply disabled styling on the "Yes, create narrative" button. |
| `lib/mockData.ts` (or co-located) | `FLOW_SKELETONS` data lives next to `FLOW_CONTENT` in `ConversationView.tsx` for consistency with the existing pattern. |

---

## Out of scope

- **Right panel content per-angle.** `NarrativePanel` keeps its current prebuilt content. The `skeletonId` is persisted on the artefact so a future iteration can branch the panel content on it, but rewiring the panel's rendered narrative per chosen angle is a follow-up.
- **Real document-grounded analysis.** The `sourceCounts` and skeleton content are mocked. Sourcing from actual PAD/ISR/ICR corpora is a separate data-pipeline workstream.
- **Editing a skeleton.** "Make changes" still resets to `idle` — there's no inline edit UI for a chosen skeleton.

---

## Open follow-ups (do later)

- Right-panel content branches on `skeletonId`.
- Document-corpus analysis driving real `sourceCounts` and content.
- Multi-select mode (pick 2+ to combine into a richer narrative).
- Per-card "See full skeleton" disclosure for users who want to compare the full 5 sections before picking.
