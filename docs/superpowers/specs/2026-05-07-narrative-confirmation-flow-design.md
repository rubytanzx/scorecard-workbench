# Narrative Confirmation Flow — Design Spec

**Date:** 2026-05-07  
**Status:** Approved

## Problem

When a user clicks "Create narrative", the NarrativePanel slides in from the right immediately with no warning. The user hasn't seen anything in the conversation to prepare them, so the sudden appearance of a full-width panel feels jarring.

## Solution

Insert a 3-step AI conversation exchange — planning, skeleton outline, confirmation — before the NarrativePanel opens. The user sees what the narrative will contain and explicitly approves it.

---

## Phase state machine

`page.tsx` replaces `narrativeGenerating: boolean` with:

```ts
type NarrativePhase = "idle" | "planning" | "skeleton-ready" | "generating"
```

| Phase | Triggered by | Duration |
|---|---|---|
| `idle` | default | — |
| `planning` | click "Create narrative" | ~2.4s (steps animate in) |
| `skeleton-ready` | planning animation ends | until user clicks Yes / Make changes |
| `generating` | click "Yes" | ~500ms, then panel opens |

`narrativeGenerating` is removed. `NarrativePanel`'s `loading` prop is derived as `narrativePhase === "generating"`.

When the user clicks "Make changes": reset to `idle`. No edit UI in this iteration — the user re-reads the conversation and clicks "Create narrative" again when ready.

One narrative per conversation rule is unchanged: if an artefact already exists, clicking "Create narrative" re-opens the panel directly (existing behaviour, bypass the phase machine).

---

## PromptBar chip area

`PromptBar` receives three new props:

```ts
narrativePhase?: NarrativePhase       // default "idle"
onNarrativeConfirm?: () => void
onNarrativeMakeChanges?: () => void
```

Chip rendering by phase:

| Phase | Chip(s) shown |
|---|---|
| `idle` | `[📓 Create narrative]` — existing chip, unchanged |
| `planning` | none |
| `skeleton-ready` | `[✓ Yes, create narrative]` (blue-tinted) · `[Make changes]` (ghost) |
| `generating` | none |

The two new chips live in the same fixed-position container as the existing "Create narrative" chip, right-aligned above the PromptBar pill.

---

## ConversationView new messages

`ConversationView` receives one new prop:

```ts
narrativePhase?: NarrativePhase   // default "idle"
```

Below the existing assistant response, it conditionally renders up to three sequential blocks.

### Block 1 — Narrative planning (phases: `planning`, `skeleton-ready`, `generating`)

An AI avatar bubble containing an animated step list. Steps are revealed one by one at ~400ms intervals. Uses the same visual language as the existing `ThoughtProcess` component (icon type → tinted icon badge, monospace detail line).

Steps for the africa-poverty flow:

| Type | Label | Detail |
|---|---|---|
| search | Reading conversation context | africa-poverty signal · 1 query |
| search | Loading indicator catalogue | IDA_Scorecard_Metadata_1.xlsx · 21 Results indicators |
| filter | Matching 6 Results indicators | SOC_SAF · EDU_SUPP · HEA_SERV · RESI_CLIM · ELC_ACCS · EXT_POOR_FCS |
| compute | Filtering to AFE + AFW · FY25 cut-off | Time_Period == 2025-06-30 · Double_Counting_Flag ≠ Y |
| filter | Pairing 3 Client Context series | CSC_CLI_EXT_POOR_FCS · SE_LPV_PRIM · EG_ELC_ACCS_ZS |
| analyze | Structuring narrative sections | Context · Intervention · Evidence · Impact |

Once all steps are revealed, the block collapses to a compact collapsed row: `✓ Narrative plan ready · 6 steps` — same toggle pattern as the existing `ThoughtProcess`. It stays visible in all subsequent phases.

The animation completes in ~2.4s (6 steps × 400ms). After the final step, `narrativePhase` advances to `skeleton-ready` via a callback `onNarrativePlanningComplete` fired from `ConversationView` up to `page.tsx`.

### Block 2 — Skeleton narrative (phases: `skeleton-ready`, `generating`)

Appears as a second AI avatar bubble immediately after Block 1 collapses.

Lead sentence:
> Here's the outline for your narrative. Let me know if this looks right:

Four labelled sections rendered as bold heading + prose:

**Context** — Sub-Saharan Africa remains the epicentre of extreme poverty. FCS-country poverty sits at 30.4% (`CSC_CLI_EXT_POOR_FCS`), 70% learning poverty persists in primary schools (`SE_LPV_PRIM`), and 56 economies collect less than 15% tax-to-GDP — limiting fiscal space for homegrown investment.

**Intervention** — FY25 IDA operations targeted People-pillar programs across AFE + AFW, with safety nets, education access, and primary health care as the primary delivery channels. Climate resilience and electricity expansion (`EG_ELC_ACCS_ZS`) addressed the Planet and Infrastructure pillars.

**Evidence** — Key FY25 results vs. pipeline targets:
- Social safety nets: 244M / ~313M (`CSC_RES_SOC_SAF_PROG`)
- Students supported: 325M / ~452M (`CSC_RES_EDU_SUPP`)
- Health services: 370M / ~425M (`CSC_RES_HEA_SERV`)
- Climate resilience: 244M / ~425M — behind target (`CSC_RES_RESI_CLIM_RISK`)
- Electricity access: 215M / 576M — significantly behind target (`CSC_RES_ELC_ACCS`)

**Impact** — The People vertical leads at 68% achievement. FCS-country health efficiency is 2.3× vs. non-FCS IDA peers. Infrastructure at 41% flags FY26 priorities, with electricity access warranting a dedicated funding push in AFE.

The indicator codes render as `<code>` spans (same monospace style used elsewhere). No charts or interactive elements in this block — it is deliberately lightweight so the real NarrativePanel feels additive.

### Block 3 — Generating confirmation (phase: `generating` only)

A third AI avatar bubble with a single sentence:

> Got it — generating the first draft of your narrative now.

500ms after this message appears, `page.tsx` sets `rightPane = "narrative"` and the NarrativePanel slides in.

---

## Data flow summary

```
User clicks "Create narrative"
  → page.tsx: setNarrativePhase("planning")
  → PromptBar: hides chip
  → ConversationView: renders Block 1, begins step animation

ConversationView fires onNarrativePlanningComplete()  (~2.4s)
  → page.tsx: setNarrativePhase("skeleton-ready")
  → ConversationView: collapses Block 1, renders Block 2
  → PromptBar: shows [Yes] + [Make changes] chips

User clicks "Yes"
  → page.tsx: setNarrativePhase("generating")
  → ConversationView: renders Block 3
  → PromptBar: hides chips
  → page.tsx: setTimeout(500ms) → setRightPane("narrative")

User clicks "Make changes"
  → page.tsx: setNarrativePhase("idle")
  → ConversationView: removes all new blocks
  → PromptBar: shows [Create narrative] chip again
```

---

## Props changes summary

### `page.tsx`

- Remove: `narrativeGenerating: boolean`
- Add: `narrativePhase: NarrativePhase` (replaces it)
- `NarrativePanel` prop `loading` → `narrativePhase === "generating"`

### `PromptBar`

- Add: `narrativePhase?: NarrativePhase`
- Add: `onNarrativeConfirm?: () => void`
- Add: `onNarrativeMakeChanges?: () => void`

### `ConversationView`

- Add: `narrativePhase?: NarrativePhase`
- Add: `onNarrativePlanningComplete?: () => void`

---

## Out of scope

- "Make changes" edit UI (iterating on the skeleton outline before generating)
- health-gap flow variant of the planning steps (africa-poverty only for now)
- Persisting the skeleton outline text as part of the saved artefact
- Scroll-to-bottom behaviour when new blocks appear
