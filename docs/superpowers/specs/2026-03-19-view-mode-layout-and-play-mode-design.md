# View Mode Layout & Play Mode Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give view-only workspace visitors a coherent experience through two states: a read-only freeform canvas as the default, and a play mode (triggered by `▶ Play`) that reflows cards into a masonry grid and guides viewers through them one at a time with a spotlight.

**Architecture:** Play mode state lives in `WorkspaceShell` (`playActive`, `currentCardIndex`). The freeform ReactFlow canvas is the default in view mode — unchanged from edit mode except editing is disabled. When play mode activates, `WorkspaceCanvas` switches to a masonry grid layout and dims; a `PlayModeCard` spotlight panel floats above. Exiting play mode returns to the freeform canvas.

**Tech Stack:** Next.js 15, React, TypeScript, inline `React.CSSProperties` styles (no Tailwind in workspace components).

---

## 1. Default View Mode (Freeform Canvas)

- ReactFlow canvas renders as normal — cards in their authored positions.
- **Editing disabled:** node dragging, adding, and connecting are all disabled. ReactFlow `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}`.
- Zoom and pan remain functional (read-only exploration).
- All view-mode chrome is visible: `FloatingTitle` (with upvote/downvote), `FloatingControls`, `PromptBar`, `FloatingActions`.
- `FloatingActions` in view mode shows: `▶ Play` (leftmost, new) + Generate + Close. Share and Access and Publish remain hidden (existing `mode === "edit"` guards).
- No auto-start. User must click `▶ Play` to enter play mode.

---

## 2. Play Mode

### Entry

- Triggered by clicking `▶ Play` in `FloatingActions`.
- Sets `playActive = true`, `currentCardIndex = 0`.
- No auto-start on page load.

### Canvas in Play Mode

- `WorkspaceCanvas` receives `playActive` prop.
- When `playActive === true`, it **replaces the ReactFlow canvas** with a plain scrollable `<div>` masonry grid (dimmed behind the spotlight).
- When `playActive === false`, it renders ReactFlow as normal.

### Masonry Grid Layout (play mode background)

- **2-column CSS grid**, rendered as a plain `<div>` (no ReactFlow).
- Column width: `calc((100vw - 96px - 48px) / 2)` — 96px sidebar, 48px total gap (16px between columns + 16px padding each side).
- Card height: `height: auto`, `align-items: start` — true masonry, no fixed row heights.
- **Column span by card type** (ReactFlow node type keys):
  - `narrative`: 2 columns (`grid-column: span 2`)
  - `overview`: 2 columns (`grid-column: span 2`)
  - `news`: 1 column
  - `outcomeArea`: 1 column
  - `dataCard`: 1 column
  - unknown: 1 column
- **Card order:** nodes sorted by `position.y` (primary), then `position.x` (secondary) — top-to-bottom, left-to-right.
- Gap: 16px. Canvas scrollable vertically.
- Canvas dims: `opacity: 0.4`, `pointer-events: none`.

### Card rendering in masonry grid

Card components (`OverviewCard`, `NarrativeCard`, etc.) accept `NodeProps` from ReactFlow. They can be rendered directly outside ReactFlow by passing a plain object satisfying `{ id, data, ... }` — card components only use `data` and `id`, they do not call ReactFlow hooks internally.

### Spotlight Panel

- A semi-transparent backdrop (`rgba(0,0,0,0.35)`, `position: fixed`, full viewport) sits above the dimmed canvas.
- **`PlayModeCard`** (new component): `position: fixed`, centered (`left: 50%, top: 50%, transform: translate(-50%, -50%)`), `width: min(70vw, 860px)`, `max-height: 80vh`, `overflow-y: auto`, `background: #FFFFFF`, `borderRadius: 16px`, `boxShadow: 0px 24px 64px rgba(0,0,0,0.18)`.
- Renders the active card component with a plain NodeProps-compatible object. Cards have fixed internal widths — `PlayModeCard` uses `overflow: hidden`; content may crop at narrow viewports (accepted phase 1).
- **Click to advance:** clicking anywhere on the card panel advances to the next card. A small `→ Next` hint (Open Sans 13px, `#9E9E9E`) sits bottom-right of the panel. On the last card it reads `Finish`.

### Navigation

- Click card / Next hint → advance to `currentCardIndex + 1`.
- Last card → Finish → exit play mode, return to freeform canvas.
- No back/previous navigation.

### Play Mode HUD

- Replaces `FloatingActions` entirely during play mode (FloatingActions hidden).
- `position: fixed`, `top: 16`, `right: 16`, `zIndex: 50`.
- Contains:
  - Progress: `3 / 7` — Open Sans 13px, `#616161`
  - `✕ End` button — exits play mode, returns to freeform canvas.
- `FloatingControls`, `FloatingTitle`, and `PromptBar` are **hidden** during play mode.

### Exit

- `✕ End` in HUD → `playActive = false` → freeform canvas, all chrome reappears.
- `Finish` on last card → same as End.

### Re-entry

- `▶ Play` in `FloatingActions` → restarts from card 1.

---

## 3. State Machine

```
[Land on /view] → [Freeform Canvas, read-only]
                          ↓ ▶ Play
                  [Play Mode: masonry + spotlight card 1]
                          ↓ click
                  [Play Mode: card N]
                          ↓ Finish / End
                  [Freeform Canvas, read-only]
                          ↓ ▶ Play
                  [Play Mode: card 1]
```

---

## 4. Component Responsibilities

| Component | Change |
|---|---|
| `WorkspaceShell` | Add `playActive: boolean`, `currentCardIndex: number` state. Pass to children. |
| `CanvasLoader` | Intermediate dynamic-import wrapper — add `playActive` + `orderedCards` to props so `WorkspaceCanvas` receives them. |
| `WorkspaceCanvas` | When `playActive`: replace ReactFlow with dimmed masonry grid div. When not: render ReactFlow with editing disabled in view mode. |
| `PlayModeCard` (new) | Spotlight panel — renders active card in centered fixed panel. |
| `PlayModeHUD` (new) | Top-right HUD with progress + End button, replaces FloatingActions during play. |
| `FloatingActions` | Add `▶ Play` button in view mode (leftmost). Hide entirely during play mode. |
| `FloatingControls` | Hide during play mode. |
| `FloatingTitle` | Hide during play mode. |
| `PromptBar` | Hide during play mode. |

---

## 5. Data / Props

- `playActive: boolean` — is play mode running
- `currentCardIndex: number` — which card is spotlit (0-based)
- `orderedCards: Node[]` — nodes sorted by position heuristic (y then x), derived in `WorkspaceShell`, used by masonry grid and play sequence
- `onAdvance: () => void` — advance to next card, or exit play mode if on last
- `onEndPlay: () => void` — exit play mode immediately

---

## 6. Known Limitations (Phase 1)

- `OutcomeAreaCard` uses `useStreamingText` which re-streams on mount. Since `PlayModeCard` mounts/unmounts per advance, text re-streams each time this card is spotlit. Accepted for phase 1.
- Card components have fixed internal widths — spotlight may crop content at narrow viewports. Accepted for phase 1.

## 7. Out of Scope

- Auto-start play mode on first land
- Author-set card ordering in edit mode
- Back/previous navigation in play mode
- Persisting play state across sessions
- Animated card-to-card transitions (phase 2)
- Making card components width-agnostic (phase 2)
