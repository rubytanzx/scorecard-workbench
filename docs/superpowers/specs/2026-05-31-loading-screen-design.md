# Loading Screen Design

**Date:** 2026-05-31  
**Status:** Approved

## Overview

A full-screen cinematic loading screen shown before the landing page. Uses a react-globe.gl 3D globe with animated network nodes, flowing arcs, and a purplish-blue atmospheric glow. Dismisses automatically when page data is ready; the globe component stays mounted for reuse in the landing page background.

---

## Architecture

### New files

| File | Purpose |
|---|---|
| `components/GlobeCanvas.tsx` | SSR-safe react-globe.gl wrapper. Accepts props for node data, arc data, glow colour, rotation speed, size. Reusable in both the loading screen and (later) as a landing page background element. |
| `components/LoadingScreen.tsx` | Full-screen overlay. Composes `GlobeCanvas`, WBG branding, progress bar, and atmospheric pulse. Unmounts (or fades out) when `isReady` is true. |
| `hooks/usePageReady.ts` | Returns `{ isReady, progress }`. Resolves when `document.readyState === "complete"` plus a 500 ms settle delay. `progress` is a 0–1 value synthesised from `readyState` stages for the progress bar. |

### Modified files

| File | Change |
|---|---|
| `app/page.tsx` | Render `<LoadingScreen>` conditionally at the top of the JSX tree (fixed overlay, z-index 100). Pass `isReady` from `usePageReady`. |

---

## Component Details

### `GlobeCanvas`

- Dynamic import: `next/dynamic` with `{ ssr: false }` — prevents hydration mismatch since react-globe.gl uses WebGL.
- Props:
  - `width / height` — controlled by parent
  - `autoRotate: boolean` — slow spin during loading
  - `rotationSpeed: number` — default `0.3`
  - `atmosphereColor: string` — default `"#7B5EA7"` (purple-blue)
  - `atmospherePulse: boolean` — toggles CSS keyframe on the canvas wrapper
- Globe surface: dark base (`#060D1F`), country hex-polygons with `rgba(100, 180, 255, 0.15)` stroke
- **Nodes**: ~40 hardcoded IDA country capital lat/lng pairs. Rendered as glowing dots (purple-blue, radius 0.4, altitude 0.01).
- **Arcs**: 20 randomly sampled pairs from the node set, new set re-sampled every 6 s. Each arc: `color: ["#7B5EA7", "#00B29C"]` gradient, `strokeWidth: 0.5`, `dashLength: 0.4`, `dashGap: 2`, `animateTime: 2000` ms.

### `LoadingScreen`

- `position: fixed; inset: 0; z-index: 100`
- Background: `#060D1F` with a radial purple gradient centred on the globe: `radial-gradient(ellipse 70% 60% at 50% 80%, rgba(80,40,160,0.35) 0%, transparent 70%)`
- Layout: flex column, centered horizontally
  - Top section (~35% height): WBG globe icon + "THE WORLD BANK" label + "The World Bank Group **Scorecard**" H1 (Open Sans, weight 300/700 split matching existing landing page)
  - Bottom section (~65% height): `GlobeCanvas` filling the lower portion, cropped so the globe rises from the bottom edge (matching the reference screenshots)
- **Progress bar**: 320px wide, 4px tall, rounded. Track `rgba(255,255,255,0.12)`, fill `linear-gradient(90deg, #7B5EA7, #00B29C)`. Animated by `progress` from `usePageReady`.
- **Status text**: `"Initializing…"` below bar, Open Sans 12px, `rgba(255,255,255,0.5)`
- **Atmospheric pulse**: CSS `@keyframes globePulse` — the canvas wrapper alternates opacity `0.85 → 1.0 → 0.85` over 3 s, `ease-in-out`, `infinite`. Stops once `isReady`.
- **Exit**: when `isReady` becomes true, add CSS class `loading-exit` → `opacity: 0; pointer-events: none` over 600 ms, then unmount.

### `usePageReady`

```ts
// Stages mapped to progress values:
// "loading"     → 0.1
// "interactive" → 0.6
// "complete"    → 0.9
// +500ms settle → 1.0 (isReady = true)
```

Returns `{ isReady: boolean, progress: number }`.

---

## Styling Notes

- All text: Open Sans (already loaded via `next/font/google` in `layout.tsx`)
- Colours stay within the existing dark-navy / teal palette; purple-blue is additive (loading-only)
- No Tailwind utility classes inside `LoadingScreen` — inline styles only to avoid class conflicts with the landing page

---

## Dependencies

```
npm install react-globe.gl
```

react-globe.gl bundles Three.js internally (~500 kb parsed, ~200 kb gzipped). No other new dependencies.

---

## Out of Scope

- The globe's role in the landing page background after loading (deferred — user confirmed they want to decide the transition later)
- Country-flag arcs (as in the reference image) — complex, deferred
- Accessibility: `aria-live` region for load status, `prefers-reduced-motion` respected (auto-rotation and arc animation disabled)
