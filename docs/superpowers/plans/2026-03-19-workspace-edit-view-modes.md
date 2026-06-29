# Workspace Edit / View-Only Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a view-only mode to the canvas workspace, determined by URL route, with distinct UI differences from the existing edit mode.

**Architecture:** A `mode?: "edit" | "view"` prop (default `"edit"`) is added to `WorkspaceShell` and threaded to four child components. A new `/workspace/[id]/view` route renders `WorkspaceShell` in view mode. No new components are created — all differences are conditional rendering inside existing components.

**Tech Stack:** Next.js 15 (app router, async params), React, TypeScript, inline `React.CSSProperties` styles, `@tabler/icons-react`

**Spec:** `docs/superpowers/specs/2026-03-19-workspace-edit-view-modes-design.md`

---

## File Map

| Action | File | Change |
|---|---|---|
| Create | `app/workspace/[id]/view/page.tsx` | New view-mode page route |
| Modify | `lib/mockData.ts` | 9 hrefs → `/view` suffix |
| Modify | `components/workspace/WorkspaceShell.tsx` | Add `mode` prop, pass to 4 children |
| Modify | `components/workspace/FloatingTitle.tsx` | Hide/show edit+votes by mode |
| Modify | `components/workspace/FloatingActions.tsx` | Hide Share+Publish in view |
| Modify | `components/workspace/FloatingControls.tsx` | Hide Add Component in view |
| Modify | `components/workspace/PromptBar.tsx` | Different placeholder+pills in view |

---

## Task 1: Update mock data links

**Files:**
- Modify: `lib/mockData.ts`

- [ ] **Step 1.1: Replace all workspace hrefs**

In `lib/mockData.ts`, replace every occurrence of `"/workspace/mexico-fy25"` with `"/workspace/mexico-fy25/view"`. There are 9 occurrences across `ctaHref` and `href` fields (lines ~103, 319, 320, 335, 336, 351, 352, 383, 384).

- [ ] **Step 1.2: Verify count**

Run:
```bash
grep -c "workspace/mexico-fy25" lib/mockData.ts
```
Expected output: `9` (all now pointing to `/view`)

Run:
```bash
grep "workspace/mexico-fy25\"" lib/mockData.ts
```
Expected: every match ends with `/view"` — none end with just `fy25"`.

- [ ] **Step 1.3: Commit**

```bash
git add lib/mockData.ts
git commit -m "fix: update mock workspace links to view-only route"
```

---

## Task 2: Create the view-only page route

**Files:**
- Create: `app/workspace/[id]/view/page.tsx`

- [ ] **Step 2.1: Create the file**

```tsx
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default async function ViewWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceShell mode="view" prebuilt={id === "mexico-fy25"} />;
}
```

Note: `WorkspaceShell` does not yet accept `mode` — TypeScript will error until Task 3. That is expected.

- [ ] **Step 2.2: Commit**

```bash
git add app/workspace/[id]/view/page.tsx
git commit -m "feat: add view-only workspace route"
```

---

## Task 3: Add `mode` prop to `WorkspaceShell`

**Files:**
- Modify: `components/workspace/WorkspaceShell.tsx`

- [ ] **Step 3.1: Update Props interface**

Find:
```tsx
interface Props {
  empty?: boolean;
  prebuilt?: boolean;
}
```

Replace with:
```tsx
interface Props {
  empty?: boolean;
  prebuilt?: boolean;
  mode?: "edit" | "view";
}
```

- [ ] **Step 3.2: Destructure `mode` with default**

Find the function signature:
```tsx
export default function WorkspaceShell({ empty = false, prebuilt = false }: Props) {
```

Replace with:
```tsx
export default function WorkspaceShell({ empty = false, prebuilt = false, mode = "edit" }: Props) {
```

- [ ] **Step 3.3: Pass `mode` to four children**

Find:
```tsx
<FloatingTitle initialTitle={empty ? "" : undefined} />
<FloatingActions />
<FloatingControls />
<PromptBar onSubmit={handleUserSubmit} onHeightChange={setPromptBarHeight} selectedCard={selectedCard} onClearSelection={() => setSelectedCard(null)} />
```

Replace with:
```tsx
<FloatingTitle mode={mode} initialTitle={empty ? "" : undefined} />
<FloatingActions mode={mode} />
<FloatingControls mode={mode} />
<PromptBar mode={mode} onSubmit={handleUserSubmit} onHeightChange={setPromptBarHeight} selectedCard={selectedCard} onClearSelection={() => setSelectedCard(null)} />
```

- [ ] **Step 3.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: errors only about `mode` not existing on child component Props (those are fixed in Tasks 4–7). No other errors.

- [ ] **Step 3.5: Commit**

```bash
git add components/workspace/WorkspaceShell.tsx
git commit -m "feat: thread mode prop through WorkspaceShell"
```

---

## Task 4: Update `FloatingTitle` for mode

**Files:**
- Modify: `components/workspace/FloatingTitle.tsx`

**Background:** The component renders two branches — `editing` (input + confirm button) and non-editing (summary btn, title span, divider, upvote, downvote, kebab). Mode changes affect only the non-editing branch. In **edit mode**: hide divider, upvote, downvote (nothing follows the title). In **view mode**: hide `onClick` on title span (non-editable).

- [ ] **Step 4.1: Add `mode` to Props**

Find:
```tsx
interface Props {
  initialTitle?: string;
}
```

Replace with:
```tsx
interface Props {
  initialTitle?: string;
  mode?: "edit" | "view";
}
```

- [ ] **Step 4.2: Destructure `mode`**

Find:
```tsx
export default function FloatingTitle({ initialTitle = "Country Partnership Framework for Mexico FY25" }: Props) {
```

Replace with:
```tsx
export default function FloatingTitle({ initialTitle = "Country Partnership Framework for Mexico FY25", mode = "edit" }: Props) {
```

- [ ] **Step 4.3: Make title span mode-aware**

In the non-editing branch, find the title `<span>`:
```tsx
<span
  onClick={() => setEditing(true)}
  style={{ ...TEXT_STYLE, color: title ? "#616161" : "#bdbdbd", padding: "0 6px", cursor: "text" }}
>
  {title || PLACEHOLDER}
</span>
```

Replace with:
```tsx
<span
  onClick={mode === "edit" ? () => setEditing(true) : undefined}
  style={{ ...TEXT_STYLE, color: title ? "#616161" : "#bdbdbd", padding: "0 6px", cursor: mode === "edit" ? "text" : "default" }}
>
  {title || PLACEHOLDER}
</span>
```

- [ ] **Step 4.4: Conditionally render divider, upvote, downvote**

In the non-editing branch, find the divider `<div>` followed by the two `TertiaryBtn` vote buttons:

```tsx
{/* Divider */}
<div style={{ width: 1, height: 22, background: "#E5E5E5", flexShrink: 0, margin: "0 4px" }} />

{/* Upvote */}
<TertiaryBtn
  label="Upvote this notebook"
  ...
>
  ...
</TertiaryBtn>

{/* Downvote */}
<TertiaryBtn
  label="Downvote this notebook"
  ...
>
  ...
</TertiaryBtn>
```

Wrap all three in a mode check:
```tsx
{mode === "view" && (
  <>
    {/* Divider */}
    <div style={{ width: 1, height: 22, background: "#E5E5E5", flexShrink: 0, margin: "0 4px" }} />

    {/* Upvote */}
    <TertiaryBtn
      label="Upvote this notebook"
      onClick={() => handleVote("up")}
      active={vote === "up"}
      activeColor="#16a34a"
    >
      <IconArrowBigUp
        size={15}
        stroke={vote === "up" ? 2.2 : 1.6}
        color={vote === "up" ? "#16a34a" : "#616161"}
      />
      <span style={{ color: vote === "up" ? "#16a34a" : "#616161" }}>{upvotes}</span>
    </TertiaryBtn>

    {/* Downvote */}
    <TertiaryBtn
      label="Downvote this notebook"
      onClick={() => handleVote("down")}
      active={vote === "down"}
      activeColor="#dc2626"
    >
      <IconArrowBigDown
        size={15}
        stroke={vote === "down" ? 2.2 : 1.6}
        color={vote === "down" ? "#dc2626" : "#616161"}
      />
      <span style={{ color: vote === "down" ? "#dc2626" : "#616161" }}>{downvotes}</span>
    </TertiaryBtn>
  </>
)}
```

- [ ] **Step 4.5: Verify in browser**

Run `npm run dev`. Navigate to:
- `/workspace/mexico-fy25` → title bar should show: Summary btn · editable title · kebab. No votes.
- `/workspace/mexico-fy25/view` → title bar should show: Summary btn · non-editable title · upvote (312) · downvote (11) · kebab. Clicking the title text should do nothing.

- [ ] **Step 4.6: Commit**

```bash
git add components/workspace/FloatingTitle.tsx
git commit -m "feat: FloatingTitle respects edit/view mode"
```

---

## Task 5: Update `FloatingActions` for mode

**Files:**
- Modify: `components/workspace/FloatingActions.tsx`

**Background:** In view mode, hide "Share and Access" button and "Publish" button. Keep "Generate" (with its dropdown) and "Close (×)".

- [ ] **Step 5.1: Add `mode` to Props**

Find:
```tsx
export default function FloatingActions() {
```

Replace with:
```tsx
interface Props {
  mode?: "edit" | "view";
}

export default function FloatingActions({ mode = "edit" }: Props) {
```

- [ ] **Step 5.2: Conditionally render Share and Access**

Find the Share and Access button (starts with `<button` containing `IconLock`). Wrap it:
```tsx
{mode === "edit" && (
  <button
    style={{ ... }}
  >
    <IconLock size={20} stroke={1.5} />
    Share and Access
  </button>
)}
```

- [ ] **Step 5.3: Conditionally render Publish**

Find the Publish button (contains `IconPlayerPlay`). Wrap it:
```tsx
{mode === "edit" && (
  <button
    style={{ ... }}
  >
    <IconPlayerPlay size={20} stroke={1.5} />
    Publish
  </button>
)}
```

- [ ] **Step 5.4: Verify in browser**

- `/workspace/mexico-fy25` → action bar: Share and Access · Generate · Publish · Close
- `/workspace/mexico-fy25/view` → action bar: Generate · Close

- [ ] **Step 5.5: Commit**

```bash
git add components/workspace/FloatingActions.tsx
git commit -m "feat: FloatingActions respects edit/view mode"
```

---

## Task 6: Update `FloatingControls` for mode

**Files:**
- Modify: `components/workspace/FloatingControls.tsx`

**Background:** In view mode, hide the "Add Component" button and its dropdown. The remaining buttons stay left-aligned — the bar just becomes narrower.

- [ ] **Step 6.1: Add `mode` to Props**

Find:
```tsx
export default function FloatingControls() {
```

Replace with:
```tsx
interface Props {
  mode?: "edit" | "view";
}

export default function FloatingControls({ mode = "edit" }: Props) {
```

- [ ] **Step 6.2: Conditionally render Add Component section**

The Add Component button and its dropdown live inside a `<div ref={dropdownRef}>`. Wrap the entire div:
```tsx
{mode === "edit" && (
  <div ref={dropdownRef} style={{ position: "relative" }}>
    {/* Add Component button */}
    ...
    {/* Dropdown */}
    ...
  </div>
)}
```

- [ ] **Step 6.3: Verify in browser**

- `/workspace/mexico-fy25` → controls bar: Add Component · Cursor · Pan · Grid · | · Zoom+ · Zoom-
- `/workspace/mexico-fy25/view` → controls bar: Cursor · Pan · Grid · | · Zoom+ · Zoom-

- [ ] **Step 6.4: Commit**

```bash
git add components/workspace/FloatingControls.tsx
git commit -m "feat: FloatingControls respects edit/view mode"
```

---

## Task 7: Update `PromptBar` for mode

**Files:**
- Modify: `components/workspace/PromptBar.tsx`

**Background:** In view mode, change placeholder text and remove the "Create a notebook" suggestion pill.

- [ ] **Step 7.1: Add `mode` to Props**

Find:
```tsx
interface Props {
  onSubmit?: (text: string) => void;
  onHeightChange?: (height: number) => void;
  selectedCard?: string | null;
  onClearSelection?: () => void;
}
```

Replace with:
```tsx
interface Props {
  onSubmit?: (text: string) => void;
  onHeightChange?: (height: number) => void;
  selectedCard?: string | null;
  onClearSelection?: () => void;
  mode?: "edit" | "view";
}
```

- [ ] **Step 7.2: Destructure `mode`**

Find:
```tsx
export default function PromptBar({ onSubmit, onHeightChange, selectedCard, onClearSelection }: Props) {
```

Replace with:
```tsx
export default function PromptBar({ onSubmit, onHeightChange, selectedCard, onClearSelection, mode = "edit" }: Props) {
```

- [ ] **Step 7.3: Verify PILLS is not imported elsewhere**

```bash
grep -r "PILLS" components/ app/
```

Expected: only one result inside `PromptBar.tsx`. If found in other files, do not remove the top-level const — instead, keep it and add a separate view-mode array. In practice, PILLS is defined and consumed only within `PromptBar.tsx`.

- [ ] **Step 7.4: Make pills mode-aware**

Find the top-level constant (outside the component function):
```tsx
const PILLS = ["Compare regions", "Continue Analysis via MCP", "Create a notebook"];
```

Delete it. Then, inside the component function body (after the Props destructure, before any `useState` calls), add:
```tsx
const PILLS =
  mode === "view"
    ? ["Compare regions", "Continue Analysis via MCP"]
    : ["Compare regions", "Continue Analysis via MCP", "Create a notebook"];
```

**Edit mode pills:** `["Compare regions", "Continue Analysis via MCP", "Create a notebook"]` — identical to the original constant, no content change.
**View mode pills:** `["Compare regions", "Continue Analysis via MCP"]` — "Create a notebook" removed.

- [ ] **Step 7.5: Make placeholder mode-aware**

Find the `<textarea>` element and its `placeholder` prop:
```tsx
placeholder="Give me more insights"
```

Replace with:
```tsx
placeholder={mode === "view" ? "Ask about this notebook" : "Give me more insights"}
```

- [ ] **Step 7.6: Verify in browser**

- `/workspace/mexico-fy25` → prompt bar placeholder: "Give me more insights"; 3 pills visible including "Create a notebook"
- `/workspace/mexico-fy25/view` → placeholder: "Ask about this notebook"; 2 pills, no "Create a notebook"

- [ ] **Step 7.7: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7.8: Commit**

```bash
git add components/workspace/PromptBar.tsx
git commit -m "feat: PromptBar respects edit/view mode"
```

---

## Task 8: End-to-end verification

- [ ] **Step 8.1: Verify full edit flow**

1. Start at `/` (landing page)
2. Click a story card → story detail modal opens
3. Confirm the "Open workspace" CTA now links to `/workspace/mexico-fy25/view`
4. Navigate to `/workspace/mexico-fy25` directly (edit mode):
   - Title bar: Summary · editable title · kebab (no votes)
   - Actions: Share and Access · Generate · Publish · Close
   - Controls: Add Component · Cursor · Pan · Grid · | · Zoom
   - Prompt: "Give me more insights", 3 pills

- [ ] **Step 8.2: Verify full view flow**

Navigate to `/workspace/mexico-fy25/view`:
- Title bar: Summary · non-editable title (click does nothing) · upvote 312 · downvote 11 · kebab
- Actions: Generate · Close (no Share, no Publish)
- Controls: Cursor · Pan · Grid · | · Zoom (no Add Component)
- Prompt: "Ask about this notebook", 2 pills (no "Create a notebook")

- [ ] **Step 8.3: Verify `/workspace/new` unaffected**

Navigate to `/workspace/new` — should be full edit mode with empty title field.

- [ ] **Step 8.4: Final commit**

```bash
git add .
git commit -m "feat: workspace edit/view-only modes complete"
```
