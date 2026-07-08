
import { useEffect, useMemo, useRef, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import type { GeoCountryDetail } from "@/lib/mockData";
import type { SubnationalPoint } from "@/components/D3Globe";
import { useTheme } from "@/contexts/ThemeContext";

// Intrinsic coordinate space — equirectangular fills this rectangle exactly.
const VB_W = 960;
const VB_H = 500;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WORLD_EXTENT = { type: "Feature", geometry: { type: "Polygon", coordinates: [[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]] }, properties: {} } as any;

export interface FlatMapOverlayProps {
  onClose: () => void;
  highlightRegions: string[];
  highlightColor: string;
  highlightTooltipData?: Record<string, string>;
  geoDetailData?: Record<string, GeoCountryDetail>;
  groupTitle?: string;
  viewMode?: "achieved" | "expected";
  subnationalPoints?: SubnationalPoint[];
  /** When true: color Mali amber + show poverty legend */
  povertyMode?: boolean;
  /** When set, animates the initial view to centre on this lon/lat at the given zoom.
   *  visibleOffsetFrac (0–1) is the x-fraction of the viewBox where the visible centre lies;
   *  defaults to 0.5 (full-width centre). Pass ~0.76 when left panel covers ~52% of screen. */
  centreOn?: { lon: number; lat: number; zoom: number; visibleOffsetFrac?: number };
}

export default function FlatMapOverlay({
  onClose,
  highlightRegions,
  highlightColor,
  highlightTooltipData,
  geoDetailData,
  groupTitle,
  viewMode = "achieved",
  subnationalPoints,
  povertyMode = false,
  centreOn,
}: FlatMapOverlayProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  // Pan + zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const didDragRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Keep refs in sync for wheel handler (avoids stale closure)
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // Centre the view on a given lon/lat when requested (e.g. Mali flow)
  useEffect(() => {
    if (!centreOn || features.length === 0) return;
    const xy = projection([centreOn.lon, centreOn.lat]);
    if (!xy) return;
    const s = centreOn.zoom;
    const visibleCenterX = VB_W * (centreOn.visibleOffsetFrac ?? 0.5);
    setPan({ x: visibleCenterX - xy[0] * s, y: VB_H / 2 - xy[1] * s });
    setScale(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreOn, features.length]);

  const MIN_SCALE = 1;
  const MAX_SCALE = 8;

  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  };

  // Popup state — tracks which highlighted country was clicked + where (relative to container)
  const [popup, setPopup] = useState<{ name: string; x: number; y: number } | null>(null);
  // Sub-national dot popup — stores the full point for rich rendering
  const [snPopup, setSnPopup] = useState<{ pt: SubnationalPoint } | null>(null);

  useEffect(() => {
    if (features.length > 0) return;
    fetch("/ne_110m_admin_0_countries.geojson")
      .then((r) => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((d: any) => setFeatures(d.features ?? []));
  }, [features.length]);

  // Equirectangular fills the rectangle edge-to-edge — no oval.
  const projection = useMemo(
    () => geoEquirectangular().fitSize([VB_W, VB_H], WORLD_EXTENT),
    []
  );
  const pathGen   = useMemo(() => geoPath(projection), [projection]);
  const countryDs = useMemo(
    () => features.map((f) => pathGen(f) ?? ""),
    [pathGen, features]
  );

  const { isDark } = useTheme();
  const activeNote = hovered ? (highlightTooltipData?.[hovered] ?? null) : null;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Group label — top-right */}
      <div style={{
        position: "absolute", top: 22, right: 28, zIndex: 10,
        display: "flex", alignItems: "center", gap: 7,
        fontFamily: "'Open Sans', sans-serif",
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: highlightColor, display: "inline-block" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.38)" : "#4E6174", letterSpacing: "0.03em" }}>
          {groupTitle ?? "Highlighted countries"}
        </span>
      </div>


      {/* Zoom controls — bottom-right */}
      <div style={{
        position: "absolute", bottom: 22, right: 20, zIndex: 20,
        display: "flex", flexDirection: "column", gap: 4,
        fontFamily: "'Open Sans', sans-serif",
      }}>
        {[
          { label: "+", action: () => { const s = Math.min(MAX_SCALE, scaleRef.current * 1.4); const cx = VB_W / 2, cy = VB_H / 2; setPan({ x: cx - (cx - panRef.current.x) * (s / scaleRef.current), y: cy - (cy - panRef.current.y) * (s / scaleRef.current) }); setScale(s); } },
          { label: "−", action: () => { const s = Math.max(MIN_SCALE, scaleRef.current / 1.4); const cx = VB_W / 2, cy = VB_H / 2; setPan({ x: cx - (cx - panRef.current.x) * (s / scaleRef.current), y: cy - (cy - panRef.current.y) * (s / scaleRef.current) }); setScale(s); } },
          { label: "⊙", action: resetView },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              width: 30, height: 30, borderRadius: 6, border: "none", cursor: "pointer",
              background: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.82)",
              color: isDark ? "rgba(255,255,255,0.75)" : "#3D5166",
              fontSize: 16, fontWeight: 600, lineHeight: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label={label === "+" ? "Zoom in" : label === "−" ? "Zoom out" : "Reset zoom"}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Map SVG — pannable + zoomable canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block", cursor: dragRef.current ? "grabbing" : "grab" }}
        aria-hidden="true"
        onWheel={(e) => {
          e.preventDefault();
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          // Cursor in SVG viewBox space
          const cx = (e.clientX - rect.left) / rect.width  * VB_W;
          const cy = (e.clientY - rect.top)  / rect.height * VB_H;
          const oldScale = scaleRef.current;
          const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
          const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale * factor));
          // Keep the point under the cursor fixed
          const { x: px, y: py } = panRef.current;
          const newPan = {
            x: cx - (cx - px) * (newScale / oldScale),
            y: cy - (cy - py) * (newScale / oldScale),
          };
          setScale(newScale);
          setPan(newPan);
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          didDragRef.current = false;
          dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
        }}
        onMouseMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.startX;
          const dy = e.clientY - dragRef.current.startY;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDragRef.current = true;
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const svgScaleX = VB_W / rect.width;
          const svgScaleY = VB_H / rect.height;
          setPan({
            x: dragRef.current.panX + dx * svgScaleX,
            y: dragRef.current.panY + dy * svgScaleY,
          });
        }}
        onMouseUp={() => { dragRef.current = null; }}
        onMouseLeave={() => { dragRef.current = null; }}
        onClick={() => { if (!didDragRef.current) { setSnPopup(null); setPopup(null); } }}
      >
        <defs>
          <filter id="fm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean fill */}
        <rect x={-VB_W} y={-VB_H} width={VB_W * 3} height={VB_H * 3} fill={isDark ? "#0D2A3E" : "#6BB4D6"} opacity={isDark ? 1 : 0.55} />

        {/* Pan + zoom group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {countryDs.map((d, i) => {
            const name: string = features[i]?.properties?.NAME ?? features[i]?.properties?.NAME_EN ?? "";
            const isHL  = highlightRegions.includes(name);
            const isHov = hovered === name;
            const isMaliPoverty = povertyMode && name === "Mali";
            if (!d) return null;
            // In poverty mode Mali fill is replaced by regional layer below
            const fillColor = isMaliPoverty
              ? "transparent"
              : isHL ? `${highlightColor}${isHov ? "50" : "25"}` : (isDark ? "rgba(180,215,240,0.22)" : "rgba(235,248,255,0.88)");
            const strokeColor = isMaliPoverty ? "rgba(101,50,10,0.6)" : isHL ? highlightColor : (isDark ? "rgba(180,215,240,0.45)" : "rgba(0,57,107,0.50)");
            return (
              <path
                key={i}
                d={d}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isHL || isMaliPoverty ? (isHov ? 0.6 : 0.35) : 0.2}
                filter={isHL ? "url(#fm-glow)" : undefined}
                style={{ cursor: isHL ? "pointer" : dragRef.current ? "grabbing" : "grab", transition: "fill 100ms" }}
                onMouseEnter={isHL ? () => setHovered(name) : undefined}
                onMouseLeave={isHL ? () => setHovered(null) : undefined}
                onClick={isHL ? (e) => {
                  if (didDragRef.current) return;
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setPopup({ name, x: e.clientX - rect.left, y: e.clientY - rect.top });
                } : undefined}
              />
            );
          })}

        </g>

        {/* Sub-national points — screen-space stable: positions track pan+zoom but size stays fixed */}
        {subnationalPoints && subnationalPoints.map((pt) => {
          const xy = projection([pt.lon, pt.lat]);
          if (!xy) return null;
          const x = xy[0] * scale + pan.x;
          const y = xy[1] * scale + pan.y;
          if (x < -20 || x > VB_W + 20 || y < -20 || y > VB_H + 20) return null;
          const r = pt.r ?? 6;
          const isActive = snPopup?.pt.name === pt.name;
          const isClickable = !!pt.detail;
          const handleClick = isClickable ? (e: React.MouseEvent) => {
            e.stopPropagation();
            if (didDragRef.current) return;
            setSnPopup(isActive ? null : { pt });
            setPopup(null);
          } : undefined;

          // Region poverty bubble — large, semi-transparent
          if (pt.kind === "region") {
            return (
              <g key={pt.name} style={{ cursor: isClickable ? "pointer" : "default" }} onClick={handleClick}>
                <circle cx={x} cy={y} r={r * 1.55} fill="none" stroke={pt.color} strokeOpacity={0.18} strokeWidth={2} />
                <circle cx={x} cy={y} r={r} fill={pt.color} fillOpacity={isActive ? 0.45 : 0.28} stroke={pt.color} strokeOpacity={isActive ? 1 : 0.7} strokeWidth={isActive ? 2.5 : 2} />
                {pt.label && (
                  <text x={x} y={y + r + 11} textAnchor="middle" fontSize={9} fontWeight="700"
                        fill={pt.color} stroke="white" strokeWidth={2.5} paintOrder="stroke">
                    {pt.label}
                  </text>
                )}
              </g>
            );
          }

          return (
            <g
              key={pt.name}
              style={{ cursor: isClickable ? "pointer" : "default" }}
              onClick={handleClick}
            >
              {!povertyMode && <circle cx={x} cy={y} r={r * 2.2} fill={pt.color} opacity={isActive ? 0.28 : 0.15} />}
              {povertyMode && isActive && <circle cx={x} cy={y} r={r * 1.8} fill={pt.color} opacity={0.22} />}
              <circle cx={x} cy={y} r={r} fill={pt.color} opacity={0.88} stroke="white" strokeWidth={isActive ? 1.8 : 1} />
              {pt.label && (
                <text
                  x={x}
                  y={y - r - 4}
                  textAnchor="middle"
                  fontSize={Math.max(8, r * 1.2)}
                  fontWeight="700"
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
        })}

      </svg>

      {/* Hover note — bottom-left */}
      {hovered && !popup && (() => {
        const hoverDetail = geoDetailData?.[hovered] ?? null;
        return (
          <div style={{
            position: "absolute", bottom: 20, left: 20, zIndex: 20,
            background: isDark ? "rgba(4,14,26,0.90)" : "rgba(255,255,255,0.95)",
            border: `1px solid ${highlightColor}38`,
            borderRadius: 8, padding: "8px 12px",
            maxWidth: "38%", pointerEvents: "none",
            fontFamily: "'Open Sans', sans-serif",
            boxShadow: isDark ? "none" : "0 2px 12px rgba(0,57,107,0.12)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,13,26,0.90)", marginBottom: (activeNote || hoverDetail) ? 4 : 0 }}>
              {hovered}
            </div>
            {hoverDetail ? (
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: viewMode === "expected" ? (isDark ? "rgba(255,255,255,0.38)" : "#5A6B7C") : highlightColor }}>{hoverDetail.achieved}</span>
                  <span style={{ fontSize: 9.5, color: isDark ? "rgba(255,255,255,0.4)" : "#5A6B7C", marginLeft: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>achieved</span>
                </div>
                {hoverDetail.expected && (
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: viewMode === "expected" ? highlightColor : (isDark ? "rgba(255,255,255,0.38)" : "#5A6B7C") }}>{hoverDetail.expected}</span>
                    <span style={{ fontSize: 9.5, color: isDark ? "rgba(255,255,255,0.4)" : "#5A6B7C", marginLeft: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>expected</span>
                  </div>
                )}
              </div>
            ) : activeNote ? (
              <div style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.5)" : "#4E6174", lineHeight: 1.45, marginBottom: 4 }}>
                {activeNote}
              </div>
            ) : null}
            <div style={{ fontSize: 10, color: `${highlightColor}90`, letterSpacing: "0.04em" }}>
              Click to expand
            </div>
          </div>
        );
      })()}

      {/* Click popup — anchored near the click point */}
      {popup && (() => {
        const note = highlightTooltipData?.[popup.name] ?? null;
        const detail = geoDetailData?.[popup.name] ?? null;
        const POPUP_W = 320;
        const POPUP_MAX_H = 260;
        const OFFSET = 14;

        // Container size via ref — we only know the SVG rect at render time so use percentages
        // as fallback; clamp so popup stays inside.
        const cW = containerRef.current?.offsetWidth ?? 800;
        const cH = containerRef.current?.offsetHeight ?? 500;

        // Default: open to the right and slightly above click; flip if too close to edge.
        let left = popup.x + OFFSET;
        let top  = popup.y - OFFSET;

        if (left + POPUP_W > cW - 12) left = popup.x - POPUP_W - OFFSET;
        if (top + POPUP_MAX_H > cH - 12) top = cH - POPUP_MAX_H - 12;
        if (top < 8) top = 8;

        return (
          <div
            style={{
              position: "absolute",
              left,
              top,
              width: POPUP_W,
              zIndex: 30,
              background: isDark ? "rgba(6,16,32,0.97)" : "rgba(255,255,255,0.98)",
              border: `1px solid ${highlightColor}40`,
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: isDark ? `0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px ${highlightColor}18` : `0 8px 32px rgba(0,57,107,0.14), 0 0 0 1px ${highlightColor}18`,
              fontFamily: "'Open Sans', sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setPopup(null)}
              style={{
                position: "absolute", top: 10, right: 12,
                background: "none", border: "none", cursor: "pointer",
                color: isDark ? "rgba(255,255,255,0.35)" : "#5A6B7C", fontSize: 18, lineHeight: 1, padding: 4,
              }}
              aria-label="Close"
            >
              ×
            </button>

            {/* Dot + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: note ? 12 : 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: highlightColor, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,13,26,0.90)", letterSpacing: "-0.01em" }}>
                {popup.name}
              </span>
            </div>

            {detail ? (
              <>
                {detail.indicatorName && (
                  <p style={{ margin: "0 0 4px", fontSize: 10, color: highlightColor, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 700, opacity: 0.8 }}>
                    WBG Results
                  </p>
                )}
                {detail.indicatorName && (
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: isDark ? "rgba(255,255,255,0.6)" : "#4E6174", lineHeight: 1.55 }}>
                    {detail.indicatorName}
                  </p>
                )}
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  {detail.projects != null && (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,13,26,0.88)", lineHeight: 1 }}>{detail.projects}</div>
                      <div style={{ fontSize: 9.5, color: isDark ? "rgba(255,255,255,0.35)" : "#5A6B7C", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Project{detail.projects !== 1 ? "s" : ""}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: viewMode === "expected" ? "rgba(255,255,255,0.42)" : highlightColor }}>{detail.achieved}</div>
                    <div style={{ fontSize: 9.5, color: isDark ? "rgba(255,255,255,0.35)" : "#5A6B7C", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Achieved (FY25)</div>
                  </div>
                  {detail.expected && (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: viewMode === "expected" ? highlightColor : (isDark ? "rgba(255,255,255,0.42)" : "#5A6B7C") }}>{detail.expected}</div>
                      <div style={{ fontSize: 9.5, color: isDark ? "rgba(255,255,255,0.35)" : "#5A6B7C", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Expected</div>
                    </div>
                  )}
                </div>
              </>
            ) : note ? (
              <p style={{ margin: 0, fontSize: 12.5, color: isDark ? "rgba(255,255,255,0.65)" : "#3D5166", lineHeight: 1.65 }}>
                {note}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 12.5, color: isDark ? "rgba(255,255,255,0.38)" : "#5A6B7C", fontStyle: "italic" }}>
                No additional data available for this region.
              </p>
            )}

            {groupTitle && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,57,107,0.10)", fontSize: 10.5, color: isDark ? "rgba(255,255,255,0.28)" : "#5A6B7C", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {groupTitle}
              </div>
            )}
          </div>
        );
      })()}

      {/* Sub-national dot popup — position tracks the dot as you pan */}
      {snPopup && (() => {
        const { pt } = snPopup;
        const xy = projection([pt.lon, pt.lat]);
        if (!xy) return null;
        // Dot position in VB coords (screen-space)
        const vbX = xy[0] * scale + pan.x;
        const vbY = xy[1] * scale + pan.y;
        // Convert to CSS pixels within the container
        const svgW = svgRef.current?.clientWidth  ?? (containerRef.current?.offsetWidth  ?? 800);
        const svgH = svgRef.current?.clientHeight ?? (containerRef.current?.offsetHeight ?? 500);
        const dotX = (vbX / VB_W) * svgW;
        const dotY = (vbY / VB_H) * svgH;

        const hasDetail = !!pt.detail;
        const POPUP_W = hasDetail ? 380 : 260;
        const OFFSET = 12;
        const cW = containerRef.current?.offsetWidth ?? 800;
        const cH = containerRef.current?.offsetHeight ?? 500;
        let left = dotX + OFFSET;
        let top  = dotY - OFFSET - 80;
        if (left + POPUP_W > cW - 12) left = dotX - POPUP_W - OFFSET;
        if (top < 8) top = dotY + OFFSET;
        if (top + 300 > cH - 8) top = Math.max(8, cH - 308);
        return (
          <div
            style={{
              position: "absolute", left, top, width: POPUP_W, zIndex: 35,
              background: isDark ? "rgba(6,16,32,0.97)" : "rgba(255,255,255,0.98)",
              border: `1px solid ${pt.color}30`,
              borderRadius: 12,
              boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.55)" : "0 4px 20px rgba(0,57,107,0.13)",
              fontFamily: "'Open Sans', sans-serif",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSnPopup(null)}
              style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.35)" : "#94A3B8", fontSize: 16, lineHeight: 1, padding: 4, zIndex: 1 }}
              aria-label="Close"
            >×</button>

            {hasDetail ? (
              /* Rich cercle detail */
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 10 }}>Cercle Detail</div>
                {pt.detail!.rows.map(([label, val]) => {
                  const isMpm = label.includes("MPM");
                  const isReach = label === "% of population reached";
                  const isBold = label === "Cercle" || label === "City" || isReach;
                  return (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", gap: 8, marginBottom: isReach ? 6 : 4, fontSize: 12,
                      ...(isReach ? { background: isDark ? "rgba(59,130,246,0.10)" : "#EFF6FF", borderRadius: 6, padding: "5px 8px", margin: "6px -8px 4px" } : {}),
                    }}>
                      <span style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", flexShrink: 0 }}>{label}:</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: isBold ? 700 : 400, fontSize: isReach ? 14 : 12, color: isReach ? (isDark ? "#93C5FD" : "#1D4ED8") : isMpm ? (isDark ? "rgba(255,255,255,0.65)" : "#475569") : (isDark ? "rgba(255,255,255,0.88)" : "#1E293B") }}>{val}</span>
                        {isMpm && <span style={{ display: "block", fontSize: 9.5, color: isDark ? "rgba(255,255,255,0.33)" : "#94A3B8", fontStyle: "italic", marginTop: 1 }}>regional level</span>}
                      </div>
                    </div>
                  );
                })}
                {pt.detail!.indicators && pt.detail!.indicators.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", marginBottom: 6 }}>
                      Indicators present ({pt.detail!.indicators.length}):
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {pt.detail!.indicators.map((ind) => (
                        <span key={ind} style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                          background: isDark ? "rgba(59,130,246,0.18)" : "#EFF6FF",
                          color: isDark ? "#93C5FD" : "#1D4ED8",
                          border: `1px solid ${isDark ? "rgba(59,130,246,0.25)" : "#BFDBFE"}`,
                          letterSpacing: "0.04em",
                        }}>
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pt.detail!.project && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8", marginBottom: 6 }}>Contributing projects (current indicator):</div>
                    <div style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`, borderRadius: 6, padding: "10px 10px", borderLeft: "3px solid #16A34A" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.88)" : "#1E293B", lineHeight: 1.4 }}>{pt.detail!.project.name}</div>
                      <div style={{ fontSize: 10.5, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8", marginTop: 2 }}>
                        {pt.detail!.project.id} · Scorecard: <span style={{ color: "#16A34A" }}>{pt.detail!.project.status ?? "Active"}</span> · <span style={{ color: "#16A34A" }}>Active in GEMS</span>
                      </div>
                      <div style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", marginTop: 5 }}>
                        Achieved (est.): {pt.detail!.project.achieved.toLocaleString()} · Expected (est.): {pt.detail!.project.expected.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Simple note popup */
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.90)" : "rgba(0,13,26,0.88)", marginBottom: 6 }}>
                  {pt.name}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: isDark ? "rgba(255,255,255,0.58)" : "#4E6174", lineHeight: 1.55 }}>
                  {pt.note}
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Poverty legend — bottom-left when povertyMode */}
      {povertyMode && !snPopup && (
        <div style={{
          position: "absolute", bottom: 60, left: 20, zIndex: 20,
          background: isDark ? "rgba(6,16,32,0.92)" : "rgba(255,255,255,0.96)",
          border: "1px solid rgba(146,64,14,0.22)",
          borderRadius: 10, padding: "12px 14px",
          fontFamily: "'Open Sans', sans-serif",
          boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 2px 12px rgba(0,57,107,0.12)",
          minWidth: 180,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.45)" : "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Multidimensional Poverty (MPM 2021)
          </div>
          {/* Continuous gradient bar */}
          <div style={{ height: 10, borderRadius: 4, background: "linear-gradient(to right, #F2D88C, #D9B060, #B8843A, #955C1C, #72380C, #4A2008, #280E02)", marginBottom: 4 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8", marginBottom: 10 }}>
            <span>58%</span><span>70%</span><span>81%</span>
          </div>
          {/* Region labels with MPM */}
          {([
            ["#F2D88C", "Kayes",              "~58%"],
            ["#D9B060", "Koulikoro",          "~58%"],
            ["#B8843A", "Ségou",              "~62%"],
            ["#955C1C", "Mopti",              "~70%"],
            ["#72380C", "Tombouctou",         "~71%"],
            ["#4A2008", "Gao",                "~74%"],
            ["#280E02", "Kidal",              "~81%"],
          ] as [string, string, string][]).map(([c, region, pct]) => (
            <div key={region} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: isDark ? "rgba(255,255,255,0.6)" : "#64748B", marginBottom: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0, display: "inline-block" }} />
              <span style={{ flex: 1 }}>{region}</span>
              <span style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94A3B8" }}>{pct}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9"}`, paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.45)" : "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              SSN beneficiary reach
            </div>
            {([["#1D4ED8", ">20%"], ["#3B82F6", "10–20%"], ["#93C5FD", "<10%"]] as [string, string][]).map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: isDark ? "rgba(255,255,255,0.6)" : "#64748B", marginBottom: 3 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.8, flexShrink: 0, display: "inline-block" }} />
                {l}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.28)" : "#94A3B8", marginTop: 8 }}>Click dots to explore</div>
        </div>
      )}
    </div>
  );
}
