
import { useEffect, useMemo, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoDistance } from "d3-geo";
import { useTheme } from "@/contexts/ThemeContext";


export interface SubnationalPoint {
  name: string;
  lon: number;
  lat: number;
  /** Circle radius in SVG units (default 6). */
  r?: number;
  color: string;
  label?: string;
  /** "region" renders as a semi-transparent poverty bubble (flat map only). */
  kind?: "region";
  /** Short text shown in the flat-map popup when the dot is clicked. */
  note?: string;
  /** Structured data for a rich popup card (cercle detail). */
  detail?: {
    rows: [string, string][];
    indicators?: string[];
    project?: { name: string; id: string; achieved: number; expected: number; status?: string };
  };
}

export interface D3GlobeProps {
  width: number;
  height: number;
  /** Override sphere centre X (defaults to width/2). Useful for off-centre layouts. */
  cx?: number;
  /** Override sphere centre Y (defaults to height/2). */
  cy?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
  /** Top-weighted limb gleam — landing page only (off on the loading screen). */
  showGleam?: boolean;
  /** Render IDA network nodes + animated arcs — landing page light mode only. */
  showNetwork?: boolean;
  /** Globe tilt in degrees (phi rotation). Negative = tilt toward viewer / show more north. Default -20. */
  tiltAngle?: number;
  /** Country names matching Natural Earth NAME property to highlight on the globe. */
  highlightRegions?: string[];
  /** Accent hex colour for the highlighted country fill/stroke. */
  highlightColor?: string;
  /** Short note per country for the click tooltip. Falls back to country name only. */
  highlightTooltipData?: Record<string, string>;
  /** Fired when the user clicks a highlighted country (or null to dismiss). */
  onCountryHover?: (name: string | null, note: string | null, x: number, y: number) => void;
  /** Sub-national points to project onto the globe surface (e.g. city/cercle dots). */
  subnationalPoints?: SubnationalPoint[];
  /** When provided, snaps the globe rotation to this longitude (degrees).
   *  Combine with autoRotate=false to freeze the globe centred on a location. */
  controlledRot?: number;
  /** Fired when the user clicks a subnational point that has a note or detail. */
  onSnPointClick?: (pt: SubnationalPoint, x: number, y: number) => void;
  /** Fired when the user clicks the globe background (dismiss popups). */
  onDismiss?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPHERE = { type: "Sphere" } as any;

// Lattice geometry — parallels and meridians that genuinely wrap the whole globe
const PARALLELS = [-60, -45, -30, -15, 0, 15, 30, 45, 60] as const;
const MERIDIANS = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180] as const;


export default function D3Globe({
  width,
  height,
  cx: cxProp,
  cy: cyProp,
  autoRotate = true,
  rotationSpeed = 0.15,
  showGleam = false,
  showNetwork = false,
  tiltAngle = -20,
  highlightRegions,
  highlightColor = "#34D399",
  highlightTooltipData,
  onCountryHover,
  subnationalPoints,
  controlledRot,
  onSnPointClick,
  onDismiss,
}: D3GlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([]);
  const rotRef       = useRef(0);
  const rotPausedRef = useRef(false);
  const [rotPaused, setRotPaused] = useState(false);
  const [rot, setRot] = useState(0);
  const dragRef      = useRef<{ startX: number; startRot: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isDark } = useTheme();

  const cx     = cxProp ?? width  / 2;
  const cy     = cyProp ?? height / 2;
  const radius = Math.min(cx, cy) * 0.9;

  // Fetch Natural Earth 110m country polygons (same source as before)
  useEffect(() => {
    fetch("/ne_110m_admin_0_countries.geojson")
      .then((r) => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((d: any) => setFeatures(d.features ?? []));
  }, []);

  // Rotation RAF loop — mutates ref, pushes state update each frame.
  // Checks rotPausedRef synchronously so pausing never requires restarting the loop.
  useEffect(() => {
    if (!autoRotate) return;
    let rafId: number;
    const tick = () => {
      if (!rotPausedRef.current) {
        rotRef.current += rotationSpeed;
        setRot(rotRef.current);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoRotate, rotationSpeed]);

  // Snap to a specific longitude when controlledRot changes
  useEffect(() => {
    if (controlledRot === undefined) return;
    rotRef.current = controlledRot;
    setRot(controlledRot);
  }, [controlledRot]);

  // Projection — re-derived each frame as rot or zoom changes
  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(radius)
        .translate([cx, cy])
        .rotate([rot, tiltAngle, 0])
        .clipAngle(90),
    [rot, radius, cx, cy, tiltAngle]
  );

  const pathGen  = useMemo(() => geoPath(projection), [projection]);
  const sphereD = useMemo(() => pathGen(SPHERE) ?? "", [pathGen]);

  // Country paths — all recomputed each frame; back-hemisphere features clip to ""
  const countryDs = useMemo(
    () => features.map((f) => pathGen(f) ?? ""),
    [pathGen, features]
  );

  // Lattice lines (parallels + meridians) and intersection nodes for the network overlay.
  // Lines are dense enough (one sample per 5°) that D3 clips them cleanly at the hemisphere edge.
  const latticeData = useMemo(() => {
    if (!showNetwork) return { lines: [] as { d: string; key: string; idx: number }[], nodes: [] as { pt: number[]; facing: number; key: string }[] };

    const lines: { d: string; key: string; idx: number }[] = [];
    let idx = 0;

    for (const lat of PARALLELS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coords: [number, number][] = Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat]);
      const d = pathGen({ type: "LineString", coordinates: coords } as any);
      if (d) lines.push({ d, key: `par-${lat}`, idx: idx++ });
    }

    for (const lng of MERIDIANS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coords: [number, number][] = Array.from({ length: 37 }, (_, i) => [lng, -90 + i * 5]);
      const d = pathGen({ type: "LineString", coordinates: coords } as any);
      if (d) lines.push({ d, key: `mer-${lng}`, idx: idx++ });
    }

    const centre: [number, number] = [-rot, -tiltAngle];
    const nodes: { pt: number[]; facing: number; key: string }[] = [];
    for (const lat of PARALLELS) {
      for (const lng of MERIDIANS) {
        const dist = geoDistance(centre, [lng, lat]);
        if (dist < Math.PI / 2) {
          const pt = projection([lng, lat]);
          if (pt) nodes.push({ pt, facing: Math.cos(dist), key: `n-${lat}-${lng}` });
        }
      }
    }

    return { lines, nodes };
  }, [pathGen, showNetwork, rot, tiltAngle, projection]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: "block",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitMaskImage: "radial-gradient(circle farthest-side at 50% 50%, black 88%, transparent 100%)",
        maskImage: "radial-gradient(circle farthest-side at 50% 50%, black 88%, transparent 100%)",
      }}
      aria-hidden="true"
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        rotPausedRef.current = true;
        setRotPaused(true);
        dragRef.current = { startX: e.clientX, startRot: rotRef.current };
        setIsDragging(true);
      }}
      onMouseMove={(e) => {
        if (!dragRef.current) return;
        const dx = e.clientX - dragRef.current.startX;
        const newRot = dragRef.current.startRot + dx * 0.35;
        rotRef.current = newRot;
        setRot(newRot);
      }}
      onMouseUp={() => { dragRef.current = null; setIsDragging(false); }}
      onMouseLeave={() => { dragRef.current = null; setIsDragging(false); }}
      onClick={() => { if (onCountryHover) onCountryHover(null, null, 0, 0); onDismiss?.(); }}
    >
      <defs>
        {/* Sphere lighting — off-centre radial gives a top-left light source */}
        <radialGradient id="d3g-sphere" cx="36%" cy="28%" r="72%" fx="36%" fy="28%">
          {isDark ? <>
            <stop offset="0%"   stopColor="#7AAEC8" stopOpacity="0.55" />
            <stop offset="45%"  stopColor="#3A6E8A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0C1E2E" stopOpacity="0.20" />
          </> : <>
            <stop offset="0%"   stopColor="#C8E8F8" stopOpacity="0.70" />
            <stop offset="45%"  stopColor="#90C4E0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#5A9EBE" stopOpacity="0.25" />
          </>}
        </radialGradient>

        {/* Soft atmosphere glow */}
        <filter id="d3g-atmo" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={radius * (isDark ? 0.025 : 0.042)} />
        </filter>

        {/* Outer atmosphere halo — wide, soft, blue; bleeds into space and
            onto the surface. Heavily blurred for a volumetric (not ring-like)
            look. Globe-centred radial so it follows the curve. */}
        <radialGradient
          id="d3g-halo"
          gradientUnits="userSpaceOnUse"
          cx={cx} cy={cy} r={radius * 1.16}
        >
          <stop offset="0%"   stopColor="#5FB0E6" stopOpacity="0" />
          <stop offset="74%"  stopColor="#5FB0E6" stopOpacity="0" />
          <stop offset="87%"  stopColor={isDark ? "#7FC4EE" : "#00B8CC"} stopOpacity={isDark ? 0.62 : 0.28} />
          <stop offset="100%" stopColor="#4F9EDC" stopOpacity="0" />
        </radialGradient>

        {/* Hot rim — thin near-white band sitting right on the limb. Lightly
            blurred so it's crisp but not aliased. */}
        <radialGradient
          id="d3g-rim"
          gradientUnits="userSpaceOnUse"
          cx={cx} cy={cy} r={radius * 1.04}
        >
          <stop offset="0%"   stopColor="#9FD2F0" stopOpacity="0" />
          <stop offset="93%"  stopColor="#9FD2F0" stopOpacity="0" />
          <stop offset="97%"  stopColor={isDark ? "#A5D6F2" : "#40D4E0"} stopOpacity={isDark ? 0.72 : 0.28} />
          <stop offset="100%" stopColor="#7FC0EA" stopOpacity="0" />
        </radialGradient>

        {/* Gentle top-weight mask — crown brightest, sides still lit, only
            really dropping near the bottom. Soft so it reads as light, not a
            wipe. */}
        <linearGradient id="d3g-gleam-mask-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fff" stopOpacity="1" />
          <stop offset="42%"  stopColor="#fff" stopOpacity="0.66" />
          <stop offset="72%"  stopColor="#fff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.12" />
        </linearGradient>
        <mask id="d3g-gleam-mask" maskUnits="userSpaceOnUse"
              x={cx - radius * 1.25} y={cy - radius * 1.25}
              width={radius * 2.5} height={radius * 2.5}>
          <rect x={cx - radius * 1.25} y={cy - radius * 1.25}
                width={radius * 2.5} height={radius * 2.5}
                fill="url(#d3g-gleam-mask-grad)" />
        </mask>

        {/* Two blur scales — wide soft bloom for the halo, tight for the rim */}
        <filter id="d3g-halo-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={radius * (isDark ? 0.06 : 0.045)} />
        </filter>
        <filter id="d3g-rim-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.012} />
        </filter>

{/* Wide ambient outer glow + specular/top-rim helpers — light mode only */}
        {!isDark && <>
          <radialGradient id="d3g-outer-glow" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={radius * 1.65}>
            <stop offset="0%"  stopColor="#B8E2FF" stopOpacity="0" />
            <stop offset="55%" stopColor="#B8E2FF" stopOpacity="0" />
            <stop offset="74%" stopColor="#00C4D4" stopOpacity="0.22" />
            <stop offset="90%" stopColor="#0095A8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#50C0C8" stopOpacity="0" />
          </radialGradient>
          <filter id="d3g-outer-glow-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.10} />
          </filter>

          {/* Specular gloss — small radial hotspot matching the sphere's light source (top-left) */}
          <radialGradient id="d3g-specular"
            gradientUnits="userSpaceOnUse"
            cx={cx - radius * 0.20} cy={cy - radius * 0.26}
            r={radius * 0.38}>
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.62" />
            <stop offset="38%"  stopColor="#E0F8F8" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#B0E8E8" stopOpacity="0" />
          </radialGradient>
          <clipPath id="d3g-sphere-clip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>

          {/* Top-rim mask — white at crown, transparent at equator */}
          <linearGradient id="d3g-top-rim-mask-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="white" stopOpacity="1" />
            <stop offset="28%"  stopColor="white" stopOpacity="0.7" />
            <stop offset="50%"  stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="d3g-top-rim-mask" maskUnits="userSpaceOnUse"
            x={cx - radius * 1.15} y={cy - radius * 1.15}
            width={radius * 2.3} height={radius * 2.3}>
            <rect x={cx - radius * 1.15} y={cy - radius * 1.15}
              width={radius * 2.3} height={radius * 2.3}
              fill="url(#d3g-top-rim-mask-grad)" />
          </mask>
        </>}

        {/* Dark mode outer bloom — wide electric-blue corona */}
        {isDark && <>
          <radialGradient id="d3g-outer-glow-dark" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={radius * 1.65}>
            <stop offset="0%"  stopColor="#1855E0" stopOpacity="0" />
            <stop offset="62%" stopColor="#1855E0" stopOpacity="0" />
            <stop offset="78%" stopColor="#2870FF" stopOpacity="0.72" />
            <stop offset="92%" stopColor="#0C45C8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#3060E0" stopOpacity="0" />
          </radialGradient>
          <filter id="d3g-outer-glow-dark-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.12} />
          </filter>
        </>}

        {/* Highlight country glow */}
        <filter id="d3g-hl-glow-keep" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Lattice line bloom — soft, restrained */}
        <filter id="d3g-lattice-bloom" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>

        <filter id="d3g-node-bloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>

        {/* Streak soft-blur — thin, barely-visible glow */}
        <filter id="d3g-streak-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>

        {/* Highlight country glow */}
        <filter id="d3g-hl-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

      </defs>

      {/* Soft atmosphere glow — blurred, no hard edge */}
      <circle
        cx={cx} cy={cy}
        r={radius * 1.04}
        fill="none"
        stroke={isDark ? "#8AAABB" : "rgba(210,238,255,0.80)"}
        strokeWidth={radius * (isDark ? 0.06 : 0.028)}
        opacity={isDark ? 0.62 : 0.60}
        filter="url(#d3g-atmo)"
      />
      {/* Light mode: crisp cyan rim glow on the sphere edge */}
      {!isDark && <>
        <path d={sphereD} fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={radius * 0.036}
          filter="url(#d3g-halo-blur)"
          opacity={0.80}
        />
        <path d={sphereD} fill="none"
          stroke="rgba(255,255,255,0.50)"
          strokeWidth={radius * 0.018}
          opacity={0.80}
        />
      </>}
      {/* Dark mode: electric blue rim glow */}
      {isDark && <>
        <path d={sphereD} fill="none"
          stroke="rgba(40,120,255,0.62)"
          strokeWidth={radius * 0.045}
          filter="url(#d3g-halo-blur)"
          opacity={0.92}
        />
        <path d={sphereD} fill="none"
          stroke="rgba(100,185,255,0.88)"
          strokeWidth={radius * 0.014}
          opacity={0.96}
        />
      </>}

      {/* Base — semi-transparent ocean fill. Click-to-resume is handled by the SVG root. */}
      <circle
        cx={cx} cy={cy} r={radius}
        fill={isDark ? "#112531" : "#6BB4D6"}
        opacity={isDark ? 0.32 : 0.24}
        style={{ pointerEvents: "none" }}
      />

      {/* Lighting gradient overlay */}
      <path d={sphereD} fill="url(#d3g-sphere)" />

{/* Country fills + outlines */}
      {countryDs.map((d, i) =>
        d ? (
          <path
            key={i}
            d={d}
            fill={isDark ? "rgba(210,225,235,0.06)" : "rgba(235,248,255,0.30)"}
            stroke={isDark ? "rgba(210,225,235,0.18)" : "rgba(0,57,107,0.14)"}
            strokeWidth={0.5}
          />
        ) : null
      )}

      {/* Highlighted country overlays — rendered above base fills */}
      {highlightRegions && highlightRegions.length > 0 &&
        features.map((f, i) => {
          const name: string = f?.properties?.NAME ?? f?.properties?.NAME_EN ?? "";
          if (!highlightRegions.includes(name)) return null;
          const d = countryDs[i];
          if (!d) return null;
          const note = highlightTooltipData?.[name] ?? null;
          return (
            <path
              key={`hl-${i}`}
              d={d}
              fill={`${highlightColor}28`}
              stroke={highlightColor}
              strokeWidth={1.0}
              strokeOpacity={0.75}
              filter="url(#d3g-hl-glow)"
              style={{ pointerEvents: onCountryHover ? "all" : "none", cursor: onCountryHover ? "pointer" : "default" }}
              onClick={(e) => {
                e.stopPropagation();
                rotPausedRef.current = true;
                setRotPaused(true);
                if (onCountryHover) onCountryHover(name, note, e.clientX, e.clientY);
              }}
            />
          );
        })
      }

      {/* Sub-national points — projected onto sphere, clipped to near hemisphere */}
      {subnationalPoints && subnationalPoints.length > 0 && (() => {
        const centre: [number, number] = [-rot, -tiltAngle];
        return subnationalPoints.map((pt) => {
          const coord: [number, number] = [pt.lon, pt.lat];
          const dist = geoDistance(centre, coord);
          if (dist >= Math.PI / 2) return null; // back hemisphere
          const xy = projection(coord);
          if (!xy) return null;
          const [x, y] = xy;
          const r = pt.r ?? 6;
          const facing = Math.cos(dist);
          const isClickable = !!(pt.note || pt.detail);
          return (
            <g
              key={pt.name}
              opacity={Math.min(facing * 1.4, 1)}
              style={{ pointerEvents: isClickable ? "all" : "none", cursor: isClickable ? "pointer" : "default" }}
              onClick={isClickable ? (e) => { e.stopPropagation(); onSnPointClick?.(pt, e.clientX, e.clientY); } : undefined}
            >
              {/* Glow */}
              <circle cx={x} cy={y} r={r * 2.2} fill={pt.color} opacity={0.18} />
              {/* Fill */}
              <circle cx={x} cy={y} r={r} fill={pt.color} opacity={0.82} stroke="white" strokeWidth={0.8} />
              {pt.label && (
                <text
                  x={x}
                  y={y - r - 3}
                  textAnchor="middle"
                  fontSize={Math.max(8, r * 1.1)}
                  fontWeight="600"
                  fill={pt.color}
                  stroke="white"
                  strokeWidth={2.5}
                  paintOrder="stroke"
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        });
      })()}

      {/* Sphere rim */}
      <path
        d={sphereD}
        fill="none"
        stroke={isDark ? "#8AAABB" : "rgba(0,57,107,0.22)"}
        strokeWidth={1.2}
        opacity={isDark ? 0.40 : 0.50}
      />

      {/* Limb gleam — layered: wide soft blue halo + thin near-white hot rim,
          both top-weighted by the mask so the crown is brightest. Landing
          page only; off on the loading screen. */}

      {/* Dark mode: wide electric corona — rendered before gleam so halo sits on top */}
      {showGleam && isDark && (
        <circle
          cx={cx} cy={cy}
          r={radius * 1.65}
          fill="url(#d3g-outer-glow-dark)"
          filter="url(#d3g-outer-glow-dark-blur)"
          opacity={0.88}
        />
      )}

      {/* Specular gloss highlight — polished-sphere reflection, upper-left, clipped to sphere */}
      {showGleam && !isDark && (
        <ellipse
          cx={cx - radius * 0.20} cy={cy - radius * 0.26}
          rx={radius * 0.34} ry={radius * 0.24}
          fill="url(#d3g-specular)"
          clipPath="url(#d3g-sphere-clip)"
          opacity={0.88}
        />
      )}

      {/* Wide ambient outer glow — light mode only */}
      {showGleam && !isDark && (
        <circle
          cx={cx} cy={cy}
          r={radius * 1.65}
          fill="url(#d3g-outer-glow)"
          filter="url(#d3g-outer-glow-blur)"
          opacity={0.80}
        />
      )}

      {showGleam && (
        <g mask="url(#d3g-gleam-mask)">
          <circle
            cx={cx} cy={cy}
            r={radius * 1.16}
            fill="url(#d3g-halo)"
            filter="url(#d3g-halo-blur)"
            opacity={isDark ? 0.9 : 1.0}
          />
          <circle
            cx={cx} cy={cy}
            r={radius * 1.04}
            fill="url(#d3g-rim)"
            filter="url(#d3g-rim-blur)"
            opacity={isDark ? 0.95 : 1.0}
          />
        </g>
      )}
      {/* Bright top-rim arc — light mode only */}
      {showGleam && !isDark && (
        <circle
          cx={cx} cy={cy} r={radius * 1.005}
          fill="none"
          stroke="rgba(255,255,255,0.90)"
          strokeWidth={radius * 0.012}
          filter="url(#d3g-rim-blur)"
          mask="url(#d3g-top-rim-mask)"
        />
      )}


      {/* Keyframes for ambient streak animation */}
      <style>{`
        @keyframes d3-arc-pulse { to { stroke-dashoffset: -1000; } }
        @keyframes d3-streak-opacity {
          0%   { opacity: 0; }
          12%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .d3-streak { animation: none !important; opacity: 0 !important; }
          .d3-streak-core { animation: none !important; opacity: 0 !important; }
        }
      `}</style>

      {/* ── Base lattice lines ── */}
      <g style={{ pointerEvents: "none" }}>
        {latticeData.lines.map(({ d, key }) => (
          <path key={key} d={d} fill="none"
            stroke={isDark ? "rgba(50,90,210,0.32)" : "rgba(0,120,170,0.22)"} strokeWidth={0.75} />
        ))}
      </g>

      {/* ── Soft bloom on base lines ── */}
      <g filter="url(#d3g-lattice-bloom)" style={{ pointerEvents: "none" }} opacity={isDark ? 0.65 : 0.28}>
        {latticeData.lines.map(({ d, key }) => (
          <path key={key} d={d} fill="none"
            stroke={isDark ? "rgba(70,130,240,0.25)" : "rgba(0,150,200,0.35)"} strokeWidth={2.5} />
        ))}
      </g>

      {/* ── Ambient traveling streaks — 3–6 at a time, slow, fading ── */}
      {latticeData.lines
        .filter((_, i) => i % 4 === 0 || i % 7 === 1)  // ~¼ of lines carry a streak
        .slice(0, 6)
        .map(({ d, key, idx }) => {
          // Vary speed (7–14s), dash length, and stagger start
          const speed   = 7.5 + (idx % 11) * 0.65;
          const dashLen = 28 + (idx % 5) * 8;          // 28–60 units of path length
          const opacity = 0.18 + (idx % 5) * 0.044;    // 0.18–0.36
          const delay   = -((idx * 1370) % Math.round(speed * 1000));  // negative = pre-started
          const fadeDelay = (idx * 890) % 3200;

          const movAnim = {
            animation: `d3-arc-pulse ${speed}s linear infinite`,
            animationDelay: `${delay}ms`,
          };
          const fadeAnim = {
            animation: `d3-streak-opacity ${speed}s ease-in-out infinite`,
            animationDelay: `${fadeDelay}ms`,
          };

          return (
            <g key={`streak-${key}`} className="d3-streak" style={{ pointerEvents: "none", ...fadeAnim }}>
              {/* Soft glow halo */}
              <path
                d={d} fill="none"
                stroke={isDark ? "rgba(60,140,255,0.65)" : "rgba(80,185,225,0.28)"}
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1000}
                strokeDasharray={`${dashLen} ${1000 - dashLen}`}
                filter="url(#d3g-streak-blur)"
                className="d3-streak-core"
                style={{ ...movAnim, opacity: opacity * 0.6 }}
              />
              {/* Crisp core */}
              <path
                d={d} fill="none"
                stroke={isDark ? "rgba(140,200,255,0.95)" : "rgba(100,195,235,0.55)"}
                strokeWidth={0.7}
                strokeLinecap="round"
                pathLength={1000}
                strokeDasharray={`${dashLen} ${1000 - dashLen}`}
                className="d3-streak-core"
                style={{ ...movAnim, opacity }}
              />
            </g>
          );
        })}

      {/* ── Node bloom — very soft ── */}
      <g filter="url(#d3g-node-bloom)" style={{ pointerEvents: "none" }} opacity={isDark ? 0.55 : 0.30}>
        {latticeData.nodes.map(({ pt, key }) => (
          <circle key={key} cx={pt[0]} cy={pt[1]} r={isDark ? 6 : 6}
            fill={isDark ? "rgba(60,130,255,0.45)" : "rgba(0,130,200,0.35)"} />
        ))}
      </g>

      {/* ── Node dots — city lights in dark mode, soft white glow in light mode ── */}
      {latticeData.nodes.map(({ pt, facing, key }) => (
        <g key={`dot-${key}`} opacity={Math.min(facing * (isDark ? 0.85 : 0.88), isDark ? 0.75 : 0.78)}>
          <circle cx={pt[0]} cy={pt[1]} r={isDark ? 2.2 : 2.2}
            fill={isDark ? "rgba(160,210,255,0.92)" : "rgba(0,130,200,0.55)"}
            stroke={isDark ? "rgba(80,160,255,0.55)" : "rgba(0,90,160,0.30)"} strokeWidth={0.7} />
        </g>
      ))}

    </svg>
  );
}
