# Workspace Edit / View-Only Modes

**Date:** 2026-03-19
**Status:** Approved

---

## Overview

The canvas workspace needs two distinct modes: **Edit** (for notebook owners) and **View-only** (for readers arriving from a published story). The mode is determined by the entry point and expressed as a separate URL route.

---

## Routing

| Entry point | Route | Mode |
|---|---|---|
| Landing page → Story detail CTA | `/workspace/[id]/view` | view |
| Create notebook (`/workspace/new`) | `/workspace/new` | edit |
| Sidebar / My Boards | `/workspace/[id]` | edit |

### New file: `app/workspace/[id]/view/page.tsx`

Uses Next.js async params pattern (matching the existing `[id]/page.tsx`):

```tsx
export default async function ViewWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceShell mode="view" prebuilt={id === "mexico-fy25"} />;
}
```

`initialTitle` is not passed — the component uses its hardcoded default (`"Country Partnership Framework for Mexico FY25"`), which is correct for this prototype. No data-driven title source is required.

### Data update: `lib/mockData.ts`

All 9 occurrences of `/workspace/mexico-fy25` (both `ctaHref` and `href` fields) across lines 103, 319, 320, 335, 336, 351, 352, 383, 384 should be updated to `/workspace/mexico-fy25/view`.

**Rationale:** Every entry in `mockData.ts` containing a workspace URL appears in story-detail context (`secondaryStories`, `story3Notebooks`, `story3PeerBoards`). All of these lead to the view-only route. There are no cases where these mock links represent an owner navigating to their own notebook — those flows use real routing (`/workspace/new`, `/workspace/[id]`).

---

## Mode Prop

`WorkspaceShell` receives `mode?: "edit" | "view"` (default `"edit"`). Existing call-sites without `mode` (`/workspace/new`, `/workspace/[id]`) remain unmodified and default to edit.

`WorkspaceShell` passes `mode` to four components:

```tsx
<FloatingTitle mode={mode} initialTitle={empty ? "" : undefined} />
<FloatingActions mode={mode} />
<FloatingControls mode={mode} />
<PromptBar mode={mode} ... />
```

Each of the four components extends its Props interface with `mode?: "edit" | "view"` defaulting to `"edit"`, so existing call-sites without `mode` continue to work.

No new components are created. All differences are handled via conditional rendering inside existing components.

**Canvas interactivity (`CanvasLoader`, node data):** Unchanged in both modes. Cards remain draggable and selectable in view mode. `CanvasLoader` is not modified.

---

## Component Behaviour by Mode

### FloatingTitle

The component currently renders two top-level branches: `editing` (input + confirm button) and non-editing (all buttons + title span). Mode changes apply only within the **non-editing branch**.

**Non-editing branch contents by mode:**

| Element | Edit | View |
|---|---|---|
| Summary (sparkles) button | ✓ | ✓ |
| Title span | `onClick={() => setEditing(true)}`, `cursor: "text"` | no `onClick`, `cursor: "default"` |
| Divider (between title and vote buttons) | ✗ removed | ✓ |
| Upvote button + count | ✗ removed | ✓ |
| Downvote button + count | ✗ removed | ✓ |
| Kebab (⋮) button | ✓ | ✓ |

**Editing branch in view mode:** The `editing` state variable and the editing branch of the conditional still exist in the component, but `setEditing(true)` is never called (no `onClick` on the title span), making the editing branch unreachable in practice. The pill border/shadow styling that reacts to `editing` state continues to work as-is — since `editing` will always be `false` in view mode, the border always shows non-editing colour. No special handling needed.

### FloatingActions

| Element | Edit | View |
|---|---|---|
| Share and Access | ✓ | ✗ |
| Generate (with dropdown) | ✓ | ✓ |
| Publish | ✓ | ✗ |
| Close (×) | ✓ | ✓ |

**Close button behaviour:** In both modes, close navigates to `/` (`router.push("/")`). No change in view mode — returning to home is acceptable for this prototype.

### FloatingControls

| Element | Edit | View |
|---|---|---|
| Add Component button (+ dropdown) | ✓ | ✗ |
| Cursor mode | ✓ | ✓ |
| Pan mode | ✓ | ✓ |
| Grid mode | ✓ | ✓ |
| Divider | ✓ | ✓ |
| Zoom in / Zoom out | ✓ | ✓ |

In view mode, removing Add Component makes the bar narrower. Remaining buttons stay left-aligned — no layout adjustment needed.

### PromptBar

| Property | Edit | View |
|---|---|---|
| Placeholder text | `"Give me more insights"` | `"Ask about this notebook"` |
| Suggestion pills | `["Compare regions", "Continue Analysis via MCP", "Create a notebook"]` | `["Compare regions", "Continue Analysis via MCP"]` |

Pills are currently a constant array inside `PromptBar`. In view mode, pass a different array (or derive it from `mode`). Rest of the UI (textarea, send button, context banner) is identical in both modes.

---

## Implementation Scope

**Files to create:**
- `app/workspace/[id]/view/page.tsx`

**Files to modify:**
- `lib/mockData.ts` — update all 9 `/workspace/mexico-fy25` values to `/workspace/mexico-fy25/view`
- `components/workspace/WorkspaceShell.tsx` — add `mode?: "edit" | "view"` prop, pass to four children
- `components/workspace/FloatingTitle.tsx` — add `mode` prop; in edit mode remove divider + votes from non-editing branch; in view mode remove title onClick
- `components/workspace/FloatingActions.tsx` — add `mode` prop; hide Share and Access + Publish in view mode
- `components/workspace/FloatingControls.tsx` — add `mode` prop; hide Add Component button + dropdown in view mode
- `components/workspace/PromptBar.tsx` — add `mode` prop; change placeholder and pill array in view mode

---

## Out of Scope

- Authentication or permission checks (prototype only)
- Canvas card behaviour or interactivity differences between modes (`CanvasLoader` not modified)
- `AIChatPanel` — identical in both modes
- `RightNavDots`, `FloatingSidebar` — identical in both modes
