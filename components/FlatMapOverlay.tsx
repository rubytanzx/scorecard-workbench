
import { useEffect, useMemo, useRef, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import type { GeoCountryDetail } from "@/lib/mockData";

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
}

export default function FlatMapOverlay({
  onClose,
  highlightRegions,
  highlightColor,
  highlightTooltipData,
  geoDetailData,
  groupTitle,
}: FlatMapOverlayProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [features, setFeatures] = useState<any[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  // Panning state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const didDragRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Popup state — tracks which highlighted country was clicked + where (relative to container)
  const [popup, setPopup] = useState<{ name: string; x: number; y: number } | null>(null);

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
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.38)", letterSpacing: "0.03em" }}>
          {groupTitle ?? "Highlighted countries"}
        </span>
      </div>

      {/* Back button — bottom-right */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", bottom: 26, right: 28, zIndex: 10,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20, cursor: "pointer",
          color: "rgba(255,255,255,0.40)", padding: "5px 14px",
          fontFamily: "'Open Sans', sans-serif", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.03em",
        }}
      >
        ← Back to globe
      </button>

      {/* Map SVG — pannable canvas */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block", cursor: dragRef.current ? "grabbing" : "grab" }}
        aria-hidden="true"
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
          // Convert screen-space drag delta to SVG viewBox units
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const scaleX = VB_W / rect.width;
          const scaleY = VB_H / rect.height;
          setPan({
            x: dragRef.current.panX + dx * scaleX,
            y: dragRef.current.panY + dy * scaleY,
          });
        }}
        onMouseUp={() => { dragRef.current = null; }}
        onMouseLeave={() => { dragRef.current = null; }}
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
        <rect x={-VB_W} y={-VB_H} width={VB_W * 3} height={VB_H * 3} fill="#0D2A3E" />

        {/* Pan group — all geography shifts together */}
        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {countryDs.map((d, i) => {
            const name: string = features[i]?.properties?.NAME ?? features[i]?.properties?.NAME_EN ?? "";
            const isHL  = highlightRegions.includes(name);
            const isHov = hovered === name;
            if (!d) return null;
            return (
              <path
                key={i}
                d={d}
                fill={isHL ? `${highlightColor}${isHov ? "50" : "25"}` : "rgba(180,215,240,0.22)"}
                stroke={isHL ? highlightColor : "rgba(180,215,240,0.45)"}
                strokeWidth={isHL ? (isHov ? 1.0 : 0.7) : 0.5}
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

      </svg>

      {/* Hover note — bottom-left */}
      {hovered && !popup && (() => {
        const hoverDetail = geoDetailData?.[hovered] ?? null;
        return (
          <div style={{
            position: "absolute", bottom: 20, left: 20, zIndex: 20,
            background: "rgba(4,14,26,0.90)",
            border: `1px solid ${highlightColor}38`,
            borderRadius: 8, padding: "8px 12px",
            maxWidth: "38%", pointerEvents: "none",
            fontFamily: "'Open Sans', sans-serif",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: (activeNote || hoverDetail) ? 4 : 0 }}>
              {hovered}
            </div>
            {hoverDetail ? (
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: highlightColor }}>{hoverDetail.achieved}</span>
                  <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginLeft: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>achieved</span>
                </div>
                {hoverDetail.expected && (
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.38)" }}>{hoverDetail.expected}</span>
                    <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginLeft: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>expected</span>
                  </div>
                )}
              </div>
            ) : activeNote ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.45, marginBottom: 4 }}>
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
              background: "rgba(6,16,32,0.97)",
              border: `1px solid ${highlightColor}40`,
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: `0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px ${highlightColor}18`,
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
                color: "rgba(255,255,255,0.35)", fontSize: 18, lineHeight: 1, padding: 4,
              }}
              aria-label="Close"
            >
              ×
            </button>

            {/* Dot + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: note ? 12 : 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: highlightColor, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.01em" }}>
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
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>
                    {detail.indicatorName}
                  </p>
                )}
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  {detail.projects != null && (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>{detail.projects}</div>
                      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Project{detail.projects !== 1 ? "s" : ""}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: highlightColor, lineHeight: 1 }}>{detail.achieved}</div>
                    <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Achieved (FY25)</div>
                  </div>
                  {detail.expected && (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.42)", lineHeight: 1 }}>{detail.expected}</div>
                      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>Expected</div>
                    </div>
                  )}
                </div>
              </>
            ) : note ? (
              <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
                {note}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.38)", fontStyle: "italic" }}>
                No additional data available for this region.
              </p>
            )}

            {groupTitle && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: 10.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {groupTitle}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
