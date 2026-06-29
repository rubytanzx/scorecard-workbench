# Loading Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen cinematic loading screen (3D globe + purplish-blue atmospheric glow + animated network arcs) that shows before the landing page and dismisses once `document.readyState === "complete"`.

**Architecture:** A `LoadingScreen` component (fixed overlay, z-index 100) renders above the existing `page.tsx` content. It owns a `GlobeCanvas` wrapper (SSR-safe dynamic import of `react-globe.gl`) and reads load progress from a `usePageReady` hook. When ready, the overlay fades out and unmounts. The globe component is designed to be reusable in the landing page background later.

**Tech Stack:** react-globe.gl (Three.js-backed), Next.js dynamic import (ssr:false), TypeScript, inline styles (no Tailwind inside loading screen), CSS keyframes in globals.css.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `hooks/usePageReady.ts` | Tracks `document.readyState` → emits `{ isReady, progress }` |
| Create | `components/GlobeCanvas.tsx` | SSR-safe react-globe.gl wrapper with nodes, arcs, atmosphere |
| Create | `components/LoadingScreen.tsx` | Full-screen overlay: branding, progress bar, GlobeCanvas |
| Modify | `app/globals.css` | Add `@keyframes globe-pulse` and `.loading-exit` |
| Modify | `app/page.tsx` | Render `<LoadingScreen>` as first child, pass `isReady` |

---

## Task 1: Install react-globe.gl

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install the package**

```bash
cd /Users/ruby.tan/wbg-scorecard-2
npm install react-globe.gl
```

Expected output: `added N packages` with no peer-dependency errors.

- [ ] **Step 2: Verify it's in package.json**

```bash
grep "react-globe.gl" package.json
```

Expected: `"react-globe.gl": "^2.x.x"` (exact version will vary).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-globe.gl"
```

---

## Task 2: Add CSS animations to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Open `app/globals.css` and append the following at the end of the file**

```css
/* ── Loading screen ──────────────────────────────────────────────────────── */

/* Atmospheric glow pulse — the canvas wrapper breathes while loading */
@keyframes globe-pulse {
  0%, 100% { opacity: 0.85; }
  50%       { opacity: 1; }
}
.globe-pulse {
  animation: globe-pulse 3s ease-in-out infinite;
}

/* Exit fade — applied when isReady becomes true */
.loading-exit {
  opacity: 0 !important;
  pointer-events: none;
  transition: opacity 600ms ease-out;
}
```

- [ ] **Step 2: Verify no syntax errors by running the dev server**

```bash
npm run dev
```

Open http://localhost:3000 — page should still load without console errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add globe-pulse and loading-exit keyframes"
```

---

## Task 3: Create usePageReady hook

**Files:**
- Create: `hooks/usePageReady.ts`

- [ ] **Step 1: Create the file**

```typescript
// hooks/usePageReady.ts
"use client";
import { useEffect, useState } from "react";

interface PageReadyState {
  isReady: boolean;
  progress: number; // 0–1
}

export function usePageReady(): PageReadyState {
  const [progress, setProgress] = useState<number>(0.1);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    let settled = false;

    const markComplete = () => {
      if (settled) return;
      setProgress(0.9);
      setTimeout(() => {
        if (!settled) {
          settled = true;
          setProgress(1);
          setIsReady(true);
        }
      }, 500);
    };

    const update = () => {
      const rs = document.readyState;
      if (rs === "loading") {
        setProgress(0.1);
      } else if (rs === "interactive") {
        setProgress(0.6);
      } else if (rs === "complete") {
        markComplete();
      }
    };

    update();
    document.addEventListener("readystatechange", update);

    // Fallback: if already complete when the hook mounts (e.g. fast machines)
    if (document.readyState === "complete") markComplete();

    return () => document.removeEventListener("readystatechange", update);
  }, []);

  return { isReady, progress };
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/usePageReady.ts
git commit -m "feat: add usePageReady hook"
```

---

## Task 4: Create GlobeCanvas component

**Files:**
- Create: `components/GlobeCanvas.tsx`

- [ ] **Step 1: Create the IDA country capitals data and arc-picker utility at the top of the file**

```typescript
// components/GlobeCanvas.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// ~40 IDA country capital coordinates
const IDA_NODES = [
  { lat: 23.72, lng: 90.41 },  // Bangladesh
  { lat:  9.02, lng: 38.74 },  // Ethiopia
  { lat:  9.06, lng:  7.50 },  // Nigeria
  { lat: -1.29, lng: 36.82 },  // Kenya
  { lat: -6.17, lng: 35.74 },  // Tanzania
  { lat:  0.32, lng: 32.58 },  // Uganda
  { lat:  5.56, lng: -0.20 },  // Ghana
  { lat:-25.97, lng: 32.59 },  // Mozambique
  { lat:-18.91, lng: 47.54 },  // Madagascar
  { lat: 12.65, lng: -8.00 },  // Mali
  { lat: 13.51, lng:  2.11 },  // Niger
  { lat: 12.37, lng: -1.53 },  // Burkina Faso
  { lat: 12.11, lng: 15.04 },  // Chad
  { lat: -4.32, lng: 15.32 },  // DR Congo
  { lat:  3.87, lng: 11.52 },  // Cameroon
  { lat: 14.69, lng:-17.44 },  // Senegal
  { lat:  9.53, lng:-13.68 },  // Guinea
  { lat: -1.94, lng: 30.06 },  // Rwanda
  { lat:-15.42, lng: 28.28 },  // Zambia
  { lat:-17.83, lng: 31.05 },  // Zimbabwe
  { lat: 11.56, lng:104.92 },  // Cambodia
  { lat: 16.87, lng: 96.19 },  // Myanmar
  { lat: 27.72, lng: 85.32 },  // Nepal
  { lat: 17.96, lng:102.61 },  // Laos
  { lat: 34.53, lng: 69.17 },  // Afghanistan
  { lat: 18.54, lng:-72.34 },  // Haiti
  { lat:-16.50, lng:-68.15 },  // Bolivia
  { lat: 14.09, lng:-87.21 },  // Honduras
  { lat: 12.13, lng:-86.29 },  // Nicaragua
  { lat: -9.44, lng:147.18 },  // Papua New Guinea
  { lat: 42.87, lng: 74.59 },  // Kyrgyz Republic
  { lat: 38.56, lng: 68.77 },  // Tajikistan
  { lat: 15.37, lng: 44.19 },  // Yemen
  { lat: 15.55, lng: 32.53 },  // Sudan
  { lat:  4.86, lng: 31.57 },  // South Sudan
  { lat:  8.49, lng:-13.23 },  // Sierra Leone
  { lat:  6.30, lng:-10.80 },  // Liberia
  { lat:  6.14, lng:  1.22 },  // Togo
  { lat:  6.37, lng:  2.42 },  // Benin
  { lat: 12.36, lng: -1.53 },  // Burkina Faso (Ouagadougou variant)
];

interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

function pickArcs(count: number): Arc[] {
  const shuffled = [...IDA_NODES].sort(() => Math.random() - 0.5);
  const arcs: Arc[] = [];
  for (let i = 0; i + 1 < shuffled.length && arcs.length < count; i += 2) {
    arcs.push({
      startLat: shuffled[i].lat,
      startLng: shuffled[i].lng,
      endLat: shuffled[i + 1].lat,
      endLng: shuffled[i + 1].lng,
    });
  }
  return arcs;
}
```

- [ ] **Step 2: Add the dynamic Globe import and props interface below the utilities**

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Globe = dynamic(() => import("react-globe.gl") as any, { ssr: false });

export interface GlobeCanvasProps {
  width: number;
  height: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
  atmosphereColor?: string;
  atmospherePulse?: boolean;
}
```

- [ ] **Step 3: Add the component body below the props interface**

```typescript
export default function GlobeCanvas({
  width,
  height,
  autoRotate = true,
  rotationSpeed = 0.3,
  atmosphereColor = "#7B5EA7",
  atmospherePulse = false,
}: GlobeCanvasProps) {
  const globeRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [arcs, setArcs] = useState<Arc[]>(() => pickArcs(20));

  // Enable auto-rotation once the globe is ready
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls?.();
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = rotationSpeed;
      controls.enableZoom = false;
    }
  });

  // Re-sample arcs every 6 s for living network effect
  useEffect(() => {
    const id = setInterval(() => setArcs(pickArcs(20)), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={atmospherePulse ? "globe-pulse" : undefined}>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={0.25}
        pointsData={IDA_NODES}
        pointColor={() => "#9B72CF"}
        pointRadius={0.4}
        pointAltitude={0.01}
        pointsMerge={false}
        arcsData={arcs}
        arcColor={() => ["rgba(123,94,167,0.9)", "rgba(0,178,156,0.9)"]}
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={2000}
        enablePointerInteraction={false}
      />
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. If react-globe.gl types are missing, this is safe — the `as any` cast on the dynamic import suppresses it.

- [ ] **Step 5: Commit**

```bash
git add components/GlobeCanvas.tsx
git commit -m "feat: add GlobeCanvas component with IDA network arcs"
```

---

## Task 5: Create LoadingScreen component

**Files:**
- Create: `components/LoadingScreen.tsx`

- [ ] **Step 1: Create the file with the WBG globe SVG icon inline and the component shell**

The SVG is the WBG globe icon already used in the existing landing page screenshots. Use a simplified version inline so there's no external image dependency.

```typescript
// components/LoadingScreen.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import GlobeCanvas from "./GlobeCanvas";

const F = "'Open Sans', sans-serif";

function WbgIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none"/>
      <ellipse cx="16" cy="16" rx="7" ry="15" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none"/>
      <line x1="1" y1="16" x2="31" y2="16" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
      <line x1="3" y1="9" x2="29" y2="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
      <line x1="3" y1="23" x2="29" y2="23" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
    </svg>
  );
}
```

- [ ] **Step 2: Add the LoadingScreen component body below WbgIcon**

```typescript
interface LoadingScreenProps {
  isReady: boolean;
  progress: number; // 0–1
}

export default function LoadingScreen({ isReady, progress }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure viewport for the globe size
  useEffect(() => {
    const measure = () => {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Trigger exit sequence when page is ready
  useEffect(() => {
    if (!isReady || exiting) return;
    setExiting(true);
    const timer = setTimeout(() => setVisible(false), 650);
    return () => clearTimeout(timer);
  }, [isReady, exiting]);

  if (!visible) return null;

  const barWidth = Math.round(progress * 320);

  return (
    <div
      ref={containerRef}
      className={exiting ? "loading-exit" : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#060D1F",
        overflow: "hidden",
      }}
    >
      {/* Purple radial glow behind globe */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 85%, rgba(80,40,160,0.38) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Branding block — upper ~38% of screen */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "clamp(48px, 9vh, 100px)",
          gap: 0,
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <WbgIcon />
          <span
            style={{
              fontFamily: F,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
            }}
          >
            The World Bank
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: F,
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 300,
            color: "#FFFFFF",
            margin: 0,
            lineHeight: 1.15,
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          The World Bank Group
        </h1>
        <h1
          style={{
            fontFamily: F,
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            color: "#FFFFFF",
            margin: 0,
            lineHeight: 1.15,
            textAlign: "center",
            letterSpacing: "-0.02em",
            marginBottom: 36,
          }}
        >
          Scorecard
        </h1>

        {/* Progress bar */}
        <div
          style={{
            width: 320,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.12)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: barWidth,
              maxWidth: 320,
              borderRadius: 2,
              background: "linear-gradient(90deg, #7B5EA7, #00B29C)",
              transition: "width 400ms ease-out",
            }}
          />
        </div>

        {/* Status label */}
        <span
          style={{
            fontFamily: F,
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.04em",
          }}
        >
          {isReady ? "Ready" : "Initializing…"}
        </span>
      </div>

      {/* Globe — fills lower portion, centred, cropped at bottom */}
      {dimensions.w > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: -Math.round(dimensions.h * 0.18),
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <GlobeCanvas
            width={Math.min(dimensions.w * 0.95, 1100)}
            height={Math.min(dimensions.h * 0.8, 900)}
            autoRotate={!isReady}
            rotationSpeed={0.3}
            atmosphereColor="#7B5EA7"
            atmospherePulse={!isReady}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/LoadingScreen.tsx
git commit -m "feat: add LoadingScreen component"
```

---

## Task 6: Wire LoadingScreen into page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the two new imports at the top of `app/page.tsx` (after existing imports)**

Find the line:
```typescript
import { indicators, secondaryStories } from "@/lib/mockData";
```

Add immediately below it:
```typescript
import LoadingScreen from "@/components/LoadingScreen";
import { usePageReady } from "@/hooks/usePageReady";
```

- [ ] **Step 2: Add the usePageReady call inside the `HomePage` function body**

Find the first line inside `export default function HomePage() {`:
```typescript
  const [modalStory, setModalStory] = useState<(typeof secondaryStories)[0] | null>(null);
```

Add immediately before it:
```typescript
  const { isReady, progress } = usePageReady();
```

- [ ] **Step 3: Render LoadingScreen as the first child of the fragment**

Find the return statement opening:
```typescript
  return (
    <>
      {/* Shared, always-mounted prompt bar.
```

Add `<LoadingScreen>` immediately after the opening fragment tag, before the prompt bar comment:
```typescript
  return (
    <>
      <LoadingScreen isReady={isReady} progress={progress} />
      {/* Shared, always-mounted prompt bar.
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Verify in browser**

Visit http://localhost:3000. You should see:
- Dark `#060D1F` full-screen overlay with WBG branding
- 3D globe rising from the bottom with glowing purple nodes and animated arcs
- Progress bar filling from left to right
- After ~500ms past page load complete, overlay fades out and the landing page appears

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: show LoadingScreen before landing page"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| Full-screen fixed overlay, z-index 100 | Task 5 — `position: fixed; inset: 0; z-index: 100` |
| Background `#060D1F` + radial purple vignette | Task 5 — `background` + `radial-gradient` div |
| Globe centered-bottom, ~70% vw, slow rotation | Task 5 — `bottom: -18%` offset, `width: min(95vw, 1100px)` |
| Dark globe surface, country outlines | Task 4 — `globeImageUrl earth-dark.jpg` |
| ~40 IDA country nodes as glowing dots | Task 4 — `IDA_NODES` array (40 entries), purple dots |
| 20 animated arcs re-sampled every 6s | Task 4 — `pickArcs(20)`, `setInterval(6000)` |
| Purple-teal gradient arcs, 2s travel | Task 4 — `arcColor`, `arcDashAnimateTime: 2000` |
| Atmospheric glow purple-blue | Task 4 — `atmosphereColor: "#7B5EA7"`, `atmosphereAltitude: 0.25` |
| Atmospheric pulse CSS keyframe | Task 2 — `globe-pulse` keyframe; Task 4 — `atmospherePulse` prop |
| WBG logo + title (300/700 weight split) | Task 5 — WbgIcon SVG + two `<h1>` elements |
| Progress bar 320px, 4px, purple→teal | Task 5 — inline styles, `linear-gradient(90deg, #7B5EA7, #00B29C)` |
| "Initializing…" status text | Task 5 — status `<span>` below bar |
| Dismissed by `document.readyState === "complete"` + 500ms | Task 3 — `usePageReady` hook |
| Exit: opacity 0 + pointer-events none, 600ms | Task 2 — `.loading-exit` class; Task 5 — `exiting` state |
| react-globe.gl SSR-safe | Task 4 — `dynamic(..., { ssr: false })` |
| Open Sans for all text | Task 5 — `fontFamily: "'Open Sans', sans-serif"` throughout |

**No placeholder scan:** No TBD, TODO, or incomplete steps found.

**Type consistency check:** 
- `GlobeCanvasProps` defined in Task 4, consumed identically in Task 5 (`width`, `height`, `autoRotate`, `rotationSpeed`, `atmosphereColor`, `atmospherePulse`).
- `LoadingScreenProps` defined and consumed in Task 6 (`isReady`, `progress`).
- `usePageReady` returns `{ isReady: boolean, progress: number }` — consumed identically in Task 6.
- Arc type defined as `Arc` interface in Task 4, used only inside `GlobeCanvas.tsx`.
