---
name: Conversation & Viewer Entrance Animation Fix
description: Fix broken entrance animations in ConversationView and ViewerView — staged mount sequencing for the chat flow, entrance animations for narrative confirmation blocks, and a smooth page-level transition for the viewer.
type: project
---

## Problem

Two views mount with no entrance animations:

1. **ConversationView** — when the user submits a search term, the user message bubble and ThoughtProcess container snap in on the same frame with no staging. The whole chat area pops in at once before the sequential step animation kicks in.
2. **ViewerView** — clicking a story card from the home page swaps the view instantly, with no transition.

Additionally, the narrative confirmation flow blocks (`showBlock1/2/3`) appear abruptly when `narrativePhase` advances.

## Approach: State-driven mount sequencing (Option A)

No new dependencies. Matches the existing pattern used by `NarrativePlanningMessage` (`visible` state + delay) and the `thoughtDone` / `leadDone` gates already in `ConversationView`.

---

## Section 1 — ConversationView mount sequencing

**File:** `components/conversation/ConversationView.tsx`

Add a `mountStage` state (`0 | 1 | 2`) initialized to `0`.

Two `useEffect` calls fire on mount:
- **Stage 1** at 0ms delay: renders the user message bubble
- **Stage 2** at 350ms delay: renders the `ThoughtProcess` component

The scroll body only renders content when `mountStage >= 1`, so nothing pops in on frame 0.

**User message bubble** — gets `narrative-content-enter` CSS class (already defined in `globals.css`: 520ms, `translateY(10px)`, `filter: blur(2px)` → clear).

**ThoughtProcess container** — the bordered wrapper div inside `ThoughtProcess` gets `narrative-content-enter` so it fades+lifts in on mount rather than snapping in. The internal step-by-step animation (400ms per step, collapse on complete, `thoughtDone` callback) is unchanged.

**Timing summary:**
```
0ms    → ConversationView mounts, scroll body empty
~16ms  → Stage 1: user message slides in (narrative-content-enter, 520ms)
350ms  → Stage 2: ThoughtProcess mounts and starts stepping (400ms × 4 steps)
~1950ms → ThoughtProcess done, collapses
~2350ms → thoughtDone fires, AI response begins streaming
```

---

## Section 2 — Narrative confirmation flow blocks

**File:** `components/conversation/ConversationView.tsx`

Three elements need entrance animations when their show-gate flips true:

| Element | Gate | Fix |
|---|---|---|
| "Create narrative" user bubble | `showBlock1` | Add `narrative-content-enter` to wrapper div |
| `NarrativeSkeletonMessage` | `showBlock2` | Add `narrative-content-enter` to outer wrapper in the component |
| `NarrativeGeneratingMessage` | `showBlock3` | Add `narrative-content-enter` to outer wrapper in the component |

`NarrativePlanningMessage` already has its own `visible` state + 700ms delay — no change.

---

## Section 3 — ViewerView entrance animation

**File:** `components/conversation/ViewerView.tsx`  
**File:** `app/globals.css`

Add a `view-enter` keyframe to `globals.css`:

```css
@keyframes view-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.view-enter {
  animation: view-enter 400ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

`narrative-content-enter` is not reused here because its `filter: blur(2px)` start looks wrong at full-screen scale.

Apply `.view-enter` to `ViewerView`'s outer `<div className="relative h-screen overflow-hidden bg-white">`.

---

## Files changed

| File | Change |
|---|---|
| `components/conversation/ConversationView.tsx` | Add `mountStage` state + two `useEffect` timers; apply `narrative-content-enter` to user bubble and ThoughtProcess container; apply `narrative-content-enter` to narrative flow block wrappers |
| `components/conversation/ViewerView.tsx` | Add `view-enter` class to outer div |
| `app/globals.css` | Add `view-enter` keyframe + class |

No content changes. No new dependencies.
