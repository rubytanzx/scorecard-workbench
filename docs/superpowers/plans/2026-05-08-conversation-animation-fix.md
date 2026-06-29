# Conversation & Viewer Entrance Animation Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken entrance animations so the conversation view stages in sequentially (user message → thought process → AI response), narrative confirmation blocks fade in, and the viewer animates in on open.

**Architecture:** Three targeted edits — add a `mountStage` counter to `ConversationView` that gates what renders on each frame, apply the existing `narrative-content-enter` CSS class to elements that currently pop in, and add a new `view-enter` keyframe for full-screen view transitions.

**Tech Stack:** Next.js 14, React, Tailwind CSS, existing CSS keyframes in `app/globals.css`.

---

### Task 1: Add `view-enter` CSS keyframe to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add the keyframe and class after the existing `narrative-content-enter` block (line 253)**

Open `app/globals.css`. After the closing `}` of the `.narrative-content-enter` rule (currently the last rule in the file), append:

```css
/* Full-screen view entrance — fade + lift without blur (blur looks wrong at page scale) */
@keyframes view-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.view-enter {
  animation: view-enter 400ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

- [ ] **Step 2: Verify the file builds without errors**

```bash
npm run build 2>&1 | tail -5
```

Expected: build succeeds (no CSS parse errors).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add view-enter CSS keyframe for full-screen view transitions"
```

---

### Task 2: Animate ViewerView entrance

**Files:**
- Modify: `components/conversation/ViewerView.tsx:92`

- [ ] **Step 1: Add `view-enter` to the outer div**

In `ViewerView.tsx`, the component returns this outer div at line 92:

```tsx
// Before
<div className="relative h-screen overflow-hidden bg-white">
```

Change it to:

```tsx
// After
<div className="relative h-screen overflow-hidden bg-white view-enter">
```

- [ ] **Step 2: Verify visually**

```bash
npm run dev
```

Navigate to the home page. Click a story card that has a `viewerPrompt` (e.g. the "Health services" card). The viewer should now fade+lift in over ~400ms instead of snapping in. Click the X to close and reopen — each open should re-animate.

- [ ] **Step 3: Commit**

```bash
git add components/conversation/ViewerView.tsx
git commit -m "feat: animate ViewerView entrance with view-enter transition"
```

---

### Task 3: Add `narrative-content-enter` to ThoughtProcess container

**Files:**
- Modify: `components/conversation/ConversationView.tsx:682`

The `ThoughtProcess` function returns a single div at line 682. When it mounts it currently snaps in. Add the existing `narrative-content-enter` class so the container lifts+fades in.

- [ ] **Step 1: Add the CSS class to the ThoughtProcess container div**

In `ConversationView.tsx`, find the return value of the `ThoughtProcess` function (around line 682):

```tsx
// Before
  return (
    <div className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
```

Change to:

```tsx
// After
  return (
    <div className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden narrative-content-enter">
```

- [ ] **Step 2: Verify the class does not interfere with the collapse animation**

The ThoughtProcess collapses by toggling the `open` state which hides the steps list via `{open && <div>...steps...</div>}`. The `narrative-content-enter` animation only runs once on mount and does not affect the collapse. Confirm the animation runs once and the collapse still works.

- [ ] **Step 3: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat: fade in ThoughtProcess container on mount"
```

---

### Task 4: Gate conversation content behind mountStage

**Files:**
- Modify: `components/conversation/ConversationView.tsx`

This is the core fix. Currently the user message bubble and `ThoughtProcess` both render on the same frame when `ConversationView` mounts. The fix is a `mountStage` counter (0 → 1 → 2) that sequences their appearance.

- [ ] **Step 1: Add the `mountStage` state and its two timer effects**

In `ConversationView.tsx`, find the existing state declarations near the top of the `ConversationView` function (around line 1164):

```tsx
  const [thoughtDone, setThoughtDone] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
```

Add `mountStage` immediately after these two lines:

```tsx
  const [thoughtDone, setThoughtDone] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [mountStage, setMountStage] = useState(0);

  // Stage 0 (frame 0): blank — nothing pops in on the first paint
  // Stage 1 (~0ms): user message slides in
  // Stage 2 (350ms): ThoughtProcess mounts and starts its step sequence
  useEffect(() => {
    const t1 = setTimeout(() => setMountStage(1), 0);
    const t2 = setTimeout(() => setMountStage(2), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
```

- [ ] **Step 2: Gate the user message behind `mountStage >= 1` and add the entrance class**

In `ConversationView.tsx`, find the user message div (around line 1293):

```tsx
          {/* User message */}
          <div className="self-end flex items-center gap-3 max-w-[85%]">
            <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
              {prompt}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
              NT
            </div>
          </div>
```

Replace with:

```tsx
          {/* User message — stage 1: slides in after first paint */}
          {mountStage >= 1 && (
            <div className="self-end flex items-center gap-3 max-w-[85%] narrative-content-enter">
              <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
                {prompt}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                NT
              </div>
            </div>
          )}
```

- [ ] **Step 3: Gate ThoughtProcess behind `mountStage >= 2`**

Find the ThoughtProcess line (around line 1303):

```tsx
          {/* Thought process — animates steps sequentially, fires onComplete when done */}
          <ThoughtProcess flow={flow} onComplete={() => setThoughtDone(true)} />
```

Replace with:

```tsx
          {/* Thought process — stage 2: mounts 350ms after user message, then steps animate sequentially */}
          {mountStage >= 2 && (
            <ThoughtProcess flow={flow} onComplete={() => setThoughtDone(true)} />
          )}
```

- [ ] **Step 4: Verify the staged entrance sequence visually**

```bash
npm run dev
```

Type a query into the search bar (e.g. "extreme poverty"). Submit. After the 3-second beam:

1. ConversationView appears
2. Frame 0: scroll body is blank
3. ~immediately: user message bubble slides in (narrative-content-enter, 520ms lift+fade)
4. ~350ms later: ThoughtProcess container fades in, then steps appear one by one (400ms each)
5. ThoughtProcess collapses
6. AI response streams in

The full response content (chart, signals, narratives) must NOT be visible until `thoughtDone` fires — confirm this hasn't regressed.

- [ ] **Step 5: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat: stage ConversationView mount — user message then ThoughtProcess with 350ms gap"
```

---

### Task 5: Animate narrative confirmation flow blocks

**Files:**
- Modify: `components/conversation/ConversationView.tsx`

Three elements pop in abruptly when `narrativePhase` advances. Apply `narrative-content-enter` to each.

- [ ] **Step 1: Add entrance animation to the "Create narrative" user bubble (showBlock1)**

Find the first `showBlock1` block (around line 1389):

```tsx
          {showBlock1 && (
            <div className="self-end flex items-center gap-3 max-w-[85%]">
              <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
                Create narrative
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                NT
              </div>
            </div>
          )}
```

Replace with:

```tsx
          {showBlock1 && (
            <div className="self-end flex items-center gap-3 max-w-[85%] narrative-content-enter">
              <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
                Create narrative
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                NT
              </div>
            </div>
          )}
```

- [ ] **Step 2: Add entrance animation to NarrativeSkeletonMessage**

Find the `NarrativeSkeletonMessage` function (around line 901). Its return opens with:

```tsx
  return (
    <div className="flex items-start gap-3">
```

Change to:

```tsx
  return (
    <div className="flex items-start gap-3 narrative-content-enter">
```

- [ ] **Step 3: Add entrance animation to NarrativeGeneratingMessage**

Find the `NarrativeGeneratingMessage` function (around line 1036). Its return opens with:

```tsx
  return (
    <div className="flex items-start gap-3">
```

Change to:

```tsx
  return (
    <div className="flex items-start gap-3 narrative-content-enter">
```

- [ ] **Step 4: Verify the narrative confirmation flow visually**

```bash
npm run dev
```

Submit a query, wait for the AI response to finish streaming. Click "Create narrative" in the prompt bar. Verify:

1. The "Create narrative" user bubble fades+lifts in
2. `NarrativePlanningMessage` appears after its existing 700ms delay (unchanged)
3. Planning steps animate in one by one (unchanged)
4. Planning collapses → `NarrativeSkeletonMessage` fades+lifts in
5. Click "Yes, create narrative" → `NarrativeGeneratingMessage` fades+lifts in
6. Narrative panel slides in from the right (unchanged)

- [ ] **Step 5: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat: animate narrative confirmation flow blocks with narrative-content-enter"
```

---

## Self-review

**Spec coverage:**
- ✅ Section 1 (ConversationView mount sequencing) → Tasks 3 + 4
- ✅ Section 2 (Narrative flow blocks) → Task 5
- ✅ Section 3 (ViewerView entrance) → Tasks 1 + 2

**Placeholder scan:** No TBDs. All steps include exact line numbers, before/after code, and run commands.

**Type consistency:** `mountStage` is `number` (0 | 1 | 2) throughout. `narrative-content-enter` is a string CSS class — same spelling used in NarrativePanel.tsx already. No new types introduced.
