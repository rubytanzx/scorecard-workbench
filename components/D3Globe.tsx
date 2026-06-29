
import { useEffect, useMemo, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoDistance } from "d3-geo";

// 39 IDA client-country capitals
const IDA_NODES: { lat: number; lng: number }[] = [
  { lat: 23.72, lng: 90.41 },
  { lat:  9.02, lng: 38.74 },
  { lat:  9.06, lng:  7.50 },
  { lat: -1.29, lng: 36.82 },
  { lat: -6.17, lng: 35.74 },
  { lat:  0.32, lng: 32.58 },
  { lat:  5.56, lng: -0.20 },
  { lat:-25.97, lng: 32.59 },
  { lat:-18.91, lng: 47.54 },
  { lat: 12.65, lng: -8.00 },
  { lat: 13.51, lng:  2.11 },
  { lat: 12.37, lng: -1.53 },
  { lat: 12.11, lng: 15.04 },
  { lat: -4.32, lng: 15.32 },
  { lat:  3.87, lng: 11.52 },
  { lat: 14.69, lng:-17.44 },
  { lat:  9.53, lng:-13.68 },
  { lat: -1.94, lng: 30.06 },
  { lat:-15.42, lng: 28.28 },
  { lat:-17.83, lng: 31.05 },
  { lat: 11.56, lng:104.92 },
  { lat: 16.87, lng: 96.19 },
  { lat: 27.72, lng: 85.32 },
  { lat: 17.96, lng:102.61 },
  { lat: 34.53, lng: 69.17 },
  { lat: 18.54, lng:-72.34 },
  { lat:-16.50, lng:-68.15 },
  { lat: 14.09, lng:-87.21 },
  { lat: 12.13, lng:-86.29 },
  { lat: -9.44, lng:147.18 },
  { lat: 42.87, lng: 74.59 },
  { lat: 38.56, lng: 68.77 },
  { lat: 15.37, lng: 44.19 },
  { lat: 15.55, lng: 32.53 },
  { lat:  4.86, lng: 31.57 },
  { lat:  8.49, lng:-13.23 },
  { lat:  6.30, lng:-10.80 },
  { lat:  6.14, lng:  1.22 },
  { lat:  6.37, lng:  2.42 },
];

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
  /** Country names matching Natural Earth NAME property to highlight on the globe. */
  highlightRegions?: string[];
  /** Accent hex colour for the highlighted country fill/stroke. */
  highlightColor?: string;
  /** Short note per country for the hover tooltip. Falls back to country name only. */
  highlightTooltipData?: Record<string, string>;
  /** Fired when the user enters/leaves a highlighted country.
   *  name/note are null when leaving. x/y are viewport coordinates. */
  onCountryHover?: (name: string | null, note: string | null, x: number, y: number) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPHERE = { type: "Sphere" } as any;

export default function D3Globe({
  width,
  height,
  cx: cxProp,
  cy: cyProp,
  autoRotate = true,
  rotationSpeed = 0.15,
  showGleam = false,
  highlightRegions,
  highlightColor = "#34D399",
  highlightTooltipData,
  onCountryHover,
}: D3GlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([]);
  const rotRef       = useRef(0);
  const rotPausedRef = useRef(false);
  const [rotPaused, setRotPaused] = useState(false);
  const [rot, setRot] = useState(0);
  const dragRef      = useRef<{ startX: number; startRot: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Projection — re-derived each frame as rot changes; tilted -20° for visual interest
  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(radius)
        .translate([cx, cy])
        .rotate([rot, -20, 0])
        .clipAngle(90),
    [rot, radius, cx, cy]
  );

  const pathGen  = useMemo(() => geoPath(projection), [projection]);
  const sphereD = useMemo(() => pathGen(SPHERE) ?? "", [pathGen]);

  // Country paths — all recomputed each frame; back-hemisphere features clip to ""
  const countryDs = useMemo(
    () => features.map((f) => pathGen(f) ?? ""),
    [pathGen, features]
  );

  // Compute each node's screen position + facing factor.
  // facing = cos(angularDistance) → 1.0 at centre, 0.0 at horizon, negative behind.
  // Applying facing as <g opacity> fades nodes out smoothly instead of snapping.
  const nodeData = useMemo(() => {
    const centre: [number, number] = [-rot, 20];
    return IDA_NODES.map(({ lat, lng }) => {
      const dist = geoDistance(centre, [lng, lat]);
      if (dist >= Math.PI / 2) return null;
      const pt = projection([lng, lat]);
      if (!pt) return null;
      return { pt, facing: Math.cos(dist) };
    });
  }, [projection, rot]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible", cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
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
    >
      <defs>
        {/* Sphere lighting — off-centre radial gives a top-left light source */}
        <radialGradient id="d3g-sphere" cx="36%" cy="28%" r="72%" fx="36%" fy="28%">
          <stop offset="0%"   stopColor="#7AAEC8" stopOpacity="0.55" />
          <stop offset="45%"  stopColor="#3A6E8A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0C1E2E" stopOpacity="0.20" />
        </radialGradient>

        {/* Soft atmosphere glow */}
        <filter id="d3g-atmo" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.025} />
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
          <stop offset="87%"  stopColor="#7FC4EE" stopOpacity="0.52" />
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
          <stop offset="97%"  stopColor="#A5D6F2" stopOpacity="0.78" />
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
          <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.06} />
        </filter>
        <filter id="d3g-rim-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.012} />
        </filter>

        {/* Node glow — blurred copy behind the source creates a soft light halo */}
        <filter id="d3g-node-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
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
        stroke="#8AAABB"
        strokeWidth={radius * 0.06}
        opacity={0.18}
        filter="url(#d3g-atmo)"
      />

      {/* Base — semi-transparent ocean fill. Click-to-resume is handled by the SVG root. */}
      <circle
        cx={cx} cy={cy} r={radius} fill="#112531" opacity={0.52}
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
            fill="rgba(210,225,235,0.09)"
            stroke="rgba(210,225,235,0.32)"
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
              onMouseMove={onCountryHover ? (e) => onCountryHover(name, note, e.clientX, e.clientY) : undefined}
              onMouseLeave={onCountryHover ? () => { if (!rotPausedRef.current) onCountryHover(null, null, 0, 0); } : undefined}
              onClick={(e) => {
                e.stopPropagation();
                rotPausedRef.current = true;
                setRotPaused(true);
              }}
            />
          );
        })
      }

      {/* Sphere rim */}
      <path
        d={sphereD}
        fill="none"
        stroke="#8AAABB"
        strokeWidth={1.2}
        opacity={0.40}
      />

      {/* Limb gleam — layered: wide soft blue halo + thin near-white hot rim,
          both top-weighted by the mask so the crown is brightest. Landing
          page only; off on the loading screen. */}
      {showGleam && (
        <g mask="url(#d3g-gleam-mask)">
          <circle
            cx={cx} cy={cy}
            r={radius * 1.16}
            fill="url(#d3g-halo)"
            filter="url(#d3g-halo-blur)"
            opacity={0.9}
          />
          <circle
            cx={cx} cy={cy}
            r={radius * 1.04}
            fill="url(#d3g-rim)"
            filter="url(#d3g-rim-blur)"
            opacity={0.95}
          />
        </g>
      )}

      {/* IDA network nodes — facing factor fades them smoothly at the horizon */}
      {nodeData.map((d, i) => {
        if (!d) return null;
        const [x, y] = d.pt;
        const delay = `${(i * 317) % 4000}ms`;
        return (
          <g key={i} opacity={d.facing}>
            {/* Outer aura — large blurred bloom, gentle pulse */}
            <circle
              cx={x} cy={y} r={11}
              fill="rgba(160,225,255,0.18)"
              filter="url(#d3g-node-glow)"
              className="d3-node-aura"
              style={{ animationDelay: delay }}
            />
            {/* Crisp ring — the "node" marker */}
            <circle
              cx={x} cy={y} r={4}
              fill="rgba(180,235,255,0.10)"
              stroke="rgba(200,240,255,0.60)"
              strokeWidth={0.8}
              className="d3-node-ring"
              style={{ animationDelay: delay }}
            />
            {/* Hot centre dot */}
            <circle cx={x} cy={y} r={1.5} fill="white" opacity={0.95} />
          </g>
        );
      })}
    </svg>
  );
}
