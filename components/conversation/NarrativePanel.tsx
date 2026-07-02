
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IconX,
  IconChevronDown,
  IconNotebook,
  IconGripVertical,
  IconMapPin,
  IconPlus,
  IconMinus as IconMinusSign,
  IconRefresh,
  IconWand,
  IconChartBar as IconInfographic,
  IconChartBar,
  IconTrendingUp,
  IconChartHistogram,
  IconChartPie,
  IconAlignLeft,
  IconPresentationAnalytics,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconChevronUp,
  IconWorld,
  IconCheck,
  IconSparkles,
  IconPhoto,
  IconQuote,
  IconArrowsMaximize,
  IconEye,
} from "@tabler/icons-react";
import type { AddedVisual } from "./ConversationView";
import type { NarrativeMeta } from "./NarrativeBuilderWizard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RcTooltip,
  CartesianGrid,
} from "recharts";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { type Pathways, type NarrativeSkeleton } from "./NarrativeSkeletons";

interface Props {
  open: boolean;
  prompt: string;
  onClose: () => void;
  width: number;
  onResize: (width: number, dragging: boolean) => void;
  /** Fires when the user picks an option from the Generate menu. The parent
   * decides what to do with the chosen format (e.g. swap to Infographic
   * panel, queue a download, etc.). */
  onGenerate?: (kind: string) => void;
  /** Fires when the user clicks the Preview button in the footer. */
  onPreview?: () => void;
  /** When true, render skeleton placeholders + an animated geography loader
   * in place of the real content — used while the narrative is being
   * generated for the first time. */
  loading?: boolean;
  /** Kinds already generated for this conversation. Used to mark menu
   * items as "open" rather than "generate" since one of each per
   * conversation is the rule. */
  generatedKinds?: string[];
  /** Which narrative-angle skeleton the conversation picked. Used to
   *  resolve the extra country example surfaced after the user clicks
   *  "Add one more country example" in the conversation thread. */
  skeletonId?: string | null;
  /** True after the user has applied the post-draft "add one more country
   *  example" refinement. The Country Examples section appends the
   *  skeleton's `extraCountryExample` story when this is set. */
  extraCountryApplied?: boolean;
  /** Visuals the user assigned from the VisualSupportMessage — rendered as
   *  skeleton placeholders inside the matching accordion section. */
  addedVisuals?: AddedVisual[];
  /** Called when the user removes a visual from the panel. */
  onRemoveVisual?: (id: string) => void;
  /** Called when the user adds a visual inline from a section's dotted-box
   *  picker. The panel knows the section, so it only needs to surface the
   *  type the user picked — the parent assigns an id. */
  onAddVisual?: (visual: AddedVisual) => void;
  /** Called when the user highlights text and clicks "Modify this". */
  onModifyContent?: (target: { text: string; sectionId: string | null }) => void;
  /** Called when the user clicks "Explain with AI" on a narrative strength score. */
  onAutoPrompt?: (text: string) => void;
  /** Signal from page.tsx to trigger a purple skeleton + body override for a
   *  section. The nonce ensures the effect fires even when the same sectionId
   *  is targeted twice in succession. */
  contentModifySignal?: { sectionId: string | null; instruction: string; nonce: number } | null;
  /** Fired by the wizard's "Add to Narrative" button — shimmers the mapped section
   *  and bumps the corresponding Narrative Strength score. */
  guidanceSignal?: { dimensionNum: number; nonce: number } | null;
  /** When provided (guided narrative flow), use this skeleton's full data to
   *  build the draft sections following agent-instructions format.
   *  Overrides the per-flow SECTIONS_* arrays for the Opening + Pathways +
   *  Country Examples + Lessons sections. */
  guidedSkeleton?: NarrativeSkeleton;
  /** When "donor-priorities", renders the 5 donor narrative sections
   *  (Headline · Summary · Challenge · Response · Lessons Learned)
   *  instead of the Results Narrative sections. */
  narrativeVariant?: "results" | "donor-priorities";
  /** Audience, read time, tonality, and title collected from the wizard. */
  narrativeMeta?: NarrativeMeta;
}

export const NARRATIVE_PANEL_DEFAULT_WIDTH = 560;
export const NARRATIVE_PANEL_MIN_WIDTH = 360;
export const NARRATIVE_PANEL_MAX_WIDTH = 880;

// ─── Region map data ─────────────────────────────────────────────────────────

interface Region {
  code: string;       // WB region code
  name: string;
  short: string;      // ultra-short label for the tile
  reachM: number;     // FY25 IDA beneficiaries reached, millions (cross-pillar)
  expectedM: number;  // FY25 pipeline target, millions
  // Health-services breakdown (CSC_RES_HEA_SERV) for the health-gap flow
  healthReachM: number;
  healthExpectedM: number;
  keywords: string[];
}

// Regional totals for IDA-eligible CSC_RES_HEA_SERV (FY25) — internally
// consistent with the country breakdown shown in the conversation chart:
//   • SAR includes India (89/101) + Bangladesh (32.6/35.2) → ~88% achievement
//   • MENAAP includes Pakistan (28.4/36.5) + Afghanistan (2.4/5.5) + Yemen (1.2/3.2)
//     → low ratio because the bottom-2 drag the regional aggregate
//   • AFE includes Sudan + South Sudan (both bottom-5) → drag
//   • EAP includes Myanmar (bottom-5) → drag
const REGIONS: Region[] = [
  { code: "AFE",    name: "Africa East",                  short: "Africa East",  reachM: 92, expectedM: 124, healthReachM: 52, healthExpectedM:  72, keywords: ["africa", "sub-saharan", "afe", "kenya", "ethiopia", "sudan", "south sudan", "somalia"] },
  { code: "AFW",    name: "Africa West",                  short: "Africa West",  reachM: 78, expectedM: 113, healthReachM: 41, healthExpectedM:  52, keywords: ["africa", "sub-saharan", "afw", "nigeria", "ghana"] },
  { code: "EAP",    name: "East Asia & Pacific",          short: "East Asia",    reachM: 41, expectedM:  66, healthReachM: 31, healthExpectedM:  42, keywords: ["east asia", "pacific", "eap", "indonesia", "vietnam", "philippines", "myanmar"] },
  { code: "ECA",    name: "Europe & Central Asia",        short: "Eur. & C.Asia", reachM: 24, expectedM:  29, healthReachM:  8, healthExpectedM:  10, keywords: ["europe", "central asia", "eca"] },
  { code: "LCR",    name: "Latin America & Caribbean",    short: "LAC",          reachM: 28, expectedM:  39, healthReachM:  6, healthExpectedM:   8, keywords: ["latin america", "caribbean", "lcr", "lac", "mexico", "brazil"] },
  { code: "MENAAP", name: "Middle East · N. Africa · A&P", short: "MENAAP",       reachM: 19, expectedM:  35, healthReachM: 34, healthExpectedM:  52, keywords: ["middle east", "north africa", "menaap", "mena", "afghanistan", "pakistan", "yemen"] },
  { code: "SAR",    name: "South Asia",                   short: "South Asia",   reachM: 95, expectedM: 151, healthReachM: 92, healthExpectedM: 104, keywords: ["south asia", "sar", "india", "bangladesh", "nepal", "sri lanka"] },
];

const FCS_LENS_KEYWORDS = ["fcs", "fcv", "fragile", "conflict", "violence", "displaced", "refugee"];

function detectRegions(prompt: string, flow: FlowId): { codes: string[]; fcs: boolean } {
  const text = prompt.toLowerCase();

  // Health-gap flow is a global question ("which countries are behind?") —
  // every region needs to be visible for cross-region comparison. We just
  // force the FCS lens on, since the answer's bottom-5 are all FCS.
  if (flow === "health-gap") {
    return { codes: REGIONS.map((r) => r.code), fcs: true };
  }

  if (!text.trim()) return { codes: REGIONS.map((r) => r.code), fcs: false };
  const codes = new Set<string>();
  for (const r of REGIONS) {
    for (const k of r.keywords) {
      if (text.includes(k)) { codes.add(r.code); break; }
    }
  }
  const fcs = FCS_LENS_KEYWORDS.some((k) => text.includes(k));
  if (codes.size === 0) REGIONS.forEach((r) => codes.add(r.code));
  return { codes: Array.from(codes), fcs };
}

function ratioColor(r: number) {
  if (r < 0.55) return "#D04040";   // red
  if (r < 0.70) return "#E88B2B";   // gold
  return "#2E8B57";                 // green
}

// ─── World map data ──────────────────────────────────────────────────────────
// Topojson source: world-atlas v2 (Natural Earth, 110m). geo.id is M49 numeric,
// padded to 3 chars (e.g. Nigeria = "566", Afghanistan = "004").
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const pad3 = (n: number) => String(n).padStart(3, "0");

// IDA-relevant countries grouped by WBG region (ISO 3166-1 numeric).
const REGION_COUNTRIES: Record<string, number[]> = {
  AFE: [404, 834, 231, 800, 646, 108, 450, 454, 508, 894, 716, 706, 728, 729, 174, 232, 262],
  AFW: [566, 288, 686, 384, 854, 466, 562, 120, 148, 430, 694, 324, 624, 270, 478, 204, 768, 178, 180, 140, 132, 266, 678],
  EAP: [360, 608, 704, 116, 418, 104, 598,  90, 548, 242, 776, 882, 296, 583, 584, 626, 496, 156, 410, 392],
  ECA: [792, 643, 804, 398, 860, 762, 417,  31,  51, 268, 498, 112,   8,  70, 807, 499, 688, 795, 100, 191, 348, 616, 642, 703, 705, 233, 428, 440, 246, 752, 578, 208, 372, 826, 250, 276, 380, 528,  56, 442, 438,  40],
  LCR: [484,  76,  32, 170, 604, 152, 862,  68, 218, 320, 340, 558, 222, 591, 188, 858, 600, 388, 332, 214, 192,  84, 328, 740, 780,  44, 212, 308, 28],
  MENAAP: [818, 682, 364, 368, 400, 422, 760, 504, 788,  12, 434, 887,   4, 586, 729, 376, 275, 784, 634, 414,  48, 512],
  SAR: [356,  50, 524,  64, 144, 462],
};

const ISO_TO_REGION: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [r, isos] of Object.entries(REGION_COUNTRIES)) {
    for (const iso of isos) m[pad3(iso)] = r;
  }
  return m;
})();

const REGION_FILL: Record<string, string> = {
  AFE:    "#1A6B72",   // dark teal — Africa East
  AFW:    "#1D8A7E",   // slightly lighter teal — Africa West
  EAP:    "#1565A0",   // steel blue — East Asia & Pacific
  ECA:    "#2C4F82",   // navy blue — Europe & Central Asia
  LCR:    "#0E6B8A",   // ocean blue — Latin America & Caribbean
  MENAAP: "#2A5C78",   // blue-grey — Middle East / N. Africa
  SAR:    "#0D5C7A",   // deep marine — South Asia
};

interface WorldMapProps {
  prompt: string;
  flow: FlowId;
  selectedRegion: string | null;
  onSelectRegion: (r: string | null) => void;
}

function WorldMap({ prompt, flow, selectedRegion, onSelectRegion }: WorldMapProps) {
  const { codes, fcs } = useMemo(() => detectRegions(prompt, flow), [prompt, flow]);
  const inScope = (r?: string) => !r || codes.includes(r);
  const [hover, setHover] = useState<string | null>(null);

  // Zoom + pan state for ZoomableGroup
  const [zoom, setZoom] = useState(1.6);
  const [center, setCenter] = useState<[number, number]>([20, 10]);
  const clampZoom = (z: number) => Math.max(1, Math.min(8, z));

  return (
    <div className="relative rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]" style={{ background: "linear-gradient(135deg, #0A1929 0%, #0D2137 60%, #0E2540 100%)" }}>
      <div className="w-full" style={{ aspectRatio: "2 / 1" }}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 130 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={1}
            maxZoom={8}
            onMoveEnd={({ coordinates, zoom: z }) => {
              setCenter(coordinates as [number, number]);
              setZoom(z);
            }}
          >
            <Geographies geography={WORLD_GEO_URL}>
              {({ geographies }: { geographies: { rsmKey: string; id: string; properties: { name?: string } }[] }) =>
                geographies.map((geo) => {
                  const region = ISO_TO_REGION[geo.id];
                  const isHover = hover === geo.id;
                  const isSelected = !!selectedRegion && region === selectedRegion;
                  const inScopeNow = inScope(region);
                  const baseFill = region ? REGION_FILL[region] : "#1A2E3B";

                  // Selection > scope > hover for visibility
                  let opacity: number;
                  if (selectedRegion) {
                    opacity = isSelected ? 1 : region ? 0.2 : 0.08;
                  } else if (!region) {
                    opacity = 0.35;
                  } else {
                    opacity = inScopeNow ? (isHover ? 1 : 0.82) : 0.2;
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={baseFill}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={0.4}
                      onMouseEnter={() => setHover(geo.id)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => {
                        if (region) onSelectRegion(selectedRegion === region ? null : region);
                      }}
                      style={{
                        default: { outline: "none", opacity, transition: "opacity .15s, fill .15s, stroke .15s", cursor: region ? "pointer" : "default" },
                        hover:   { outline: "none", opacity: 1 },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* FCS lens chip */}
      {fcs && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
          FCS lens
        </span>
      )}

      {/* Zoom controls — bottom-right */}
      <div className="absolute bottom-2 right-2 flex flex-col rounded-md overflow-hidden" style={{ background: "rgba(13,33,55,0.85)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          aria-label="Zoom in"
          onClick={() => setZoom((z) => clampZoom(z * 1.5))}
          className="w-7 h-7 flex items-center justify-center transition-colors"
          style={{ color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <IconPlus size={13} />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => setZoom((z) => clampZoom(z / 1.5))}
          className="w-7 h-7 flex items-center justify-center transition-colors"
          style={{ color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <IconMinusSign size={13} />
        </button>
        <button
          aria-label="Reset view"
          onClick={() => { setZoom(1.6); setCenter([20, 10]); }}
          className="w-7 h-7 flex items-center justify-center transition-colors"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <IconRefresh size={12} />
        </button>
      </div>

      {/* Hovered/selected readout */}
      {(hover || selectedRegion) && (
        <div
          className="absolute bottom-2 left-2 rounded-md px-2 py-1 text-[11px] flex items-center gap-2"
          style={{ background: "rgba(13,33,55,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <span
            className="w-2 h-2 rounded-sm"
            style={{
              background:
                (hover && ISO_TO_REGION[hover] && REGION_FILL[ISO_TO_REGION[hover]!]) ||
                (selectedRegion && REGION_FILL[selectedRegion]) ||
                "#2A5C78",
            }}
          />
          <span className="font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
            {(hover && (ISO_TO_REGION[hover] ?? "Out of WBG scope")) || selectedRegion}
          </span>
          {selectedRegion && !hover && (
            <button
              onClick={() => onSelectRegion(null)}
              className="ml-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
              aria-label="Clear selection"
            >
              <IconX size={10} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Impact-section country map ──────────────────────────────────────────────
// Highlights only the countries present in Impact countryStories. Shows a
// hover popup with theme, result, and source meta. All other countries are
// rendered in muted gray so the story countries stand out clearly.

function ImpactWorldMap({ stories }: { stories: CountryStory[] }) {
  const highlightedM49 = useMemo(() => {
    const set = new Set<string>();
    for (const s of stories) {
      const code = NAME_TO_M49[s.name];
      if (code) set.add(code);
    }
    return set;
  }, [stories]);

  const storyByM49 = useMemo(() => {
    const map: Record<string, CountryStory> = {};
    for (const s of stories) {
      const code = NAME_TO_M49[s.name];
      if (code) map[code] = s;
    }
    return map;
  }, [stories]);

  const [hover, setHover] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.6);
  const [center, setCenter] = useState<[number, number]>([20, 10]);
  const clampZoom = (z: number) => Math.max(1, Math.min(8, z));
  const containerRef = useRef<HTMLDivElement>(null);

  const hoveredStory = hover ? storyByM49[hover] : null;

  const countryNames = stories.map((s) => s.name).join(", ");

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`World map showing impact case study locations: ${countryNames}. Hover a highlighted country to preview its story. Full details follow below.`}
      className="relative rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]"
      style={{ background: "linear-gradient(135deg, #0A1929 0%, #0D2137 60%, #0E2540 100%)" }}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {/* Visual map — aria-hidden; all story details repeat in the text list below */}
      <div className="w-full" style={{ aspectRatio: "2 / 1" }} aria-hidden="true">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 130 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={1}
            maxZoom={8}
            onMoveEnd={({ coordinates, zoom: z }) => {
              setCenter(coordinates as [number, number]);
              setZoom(z);
            }}
          >
            <Geographies geography={WORLD_GEO_URL}>
              {({ geographies }: { geographies: { rsmKey: string; id: string; properties: { name?: string } }[] }) =>
                geographies.map((geo) => {
                  const geoId = String(geo.id);
                  const isHighlighted = highlightedM49.has(geoId);
                  const isHover = hover === geoId;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isHighlighted ? (isHover ? "#93C5FD" : "#60A5FA") : "#1A2E3B"}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={isHighlighted ? 0.7 : 0.4}
                      onMouseEnter={() => { if (isHighlighted) setHover(geoId); }}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        default: {
                          outline: "none",
                          opacity: isHighlighted ? 1 : 0.45,
                          cursor: isHighlighted ? "pointer" : "default",
                          transition: "fill 0.15s, opacity 0.15s",
                        },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-2 right-2 flex flex-col rounded-md overflow-hidden"
        style={{ background: "rgba(13,33,55,0.85)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <button aria-label="Zoom in" onClick={() => setZoom((z) => clampZoom(z * 1.5))}
          className="w-7 h-7 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          style={{ color: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <IconPlus size={13} />
        </button>
        <button aria-label="Zoom out" onClick={() => setZoom((z) => clampZoom(z / 1.5))}
          className="w-7 h-7 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          style={{ color: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <IconMinusSign size={13} />
        </button>
        <button aria-label="Reset map view" onClick={() => { setZoom(1.6); setCenter([20, 10]); }}
          className="w-7 h-7 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          style={{ color: "rgba(255,255,255,0.75)" }}>
          <IconRefresh size={12} />
        </button>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px]"
        aria-hidden="true"
        style={{ background: "rgba(13,33,55,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 8px", color: "rgba(255,255,255,0.75)" }}
      >
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#60A5FA" }} />
        <span>Impact case study</span>
      </div>

      {/* Hover tooltip — purely visual; aria-hidden since text repeats below */}
      {hoveredStory && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none z-20"
          style={{
            left: Math.min(mousePos.x + 12, (containerRef.current?.offsetWidth ?? 400) - 216),
            top: Math.max(4, mousePos.y - 96),
          }}
        >
          <div
            className="rounded-xl flex flex-col gap-1.5 p-3"
            style={{
              width: 204,
              background: "rgba(13,33,55,0.97)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {hoveredStory.theme && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em" }}>
                {hoveredStory.theme}
              </span>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>{hoveredStory.name}</span>
            {hoveredStory.meta && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontFamily: "monospace" }}>{hoveredStory.meta}</span>
            )}
            {hoveredStory.result && (
              <p style={{ fontSize: 11, color: "#6EE7B7", lineHeight: 1.45, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 6, marginTop: 2 }}>
                <span style={{ fontWeight: 600 }}>→</span>{" "}{hoveredStory.result}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface RegionTilesProps {
  prompt: string;
  flow: FlowId;
  selectedRegion: string | null;
  onSelectRegion: (r: string | null) => void;
}

function RegionTiles({ prompt, flow, selectedRegion, onSelectRegion }: RegionTilesProps) {
  const { codes } = useMemo(() => detectRegions(prompt, flow), [prompt, flow]);
  const [hover, setHover] = useState<string | null>(null);

  // Pick which slice to display — health-services-only for the health-gap flow,
  // cross-pillar reach otherwise.
  const isHealth = flow === "health-gap";
  const reachOf = (r: Region) => isHealth ? r.healthReachM : r.reachM;
  const expectedOf = (r: Region) => isHealth ? r.healthExpectedM : r.expectedM;

  // Resolve the active row. When nothing is selected or hovered, fall back
  // to a synthetic "Global" row that aggregates all regions — this gives
  // the user a meaningful default headline.
  const active = selectedRegion ?? hover;
  const activeRegion = active ? REGIONS.find((r) => r.code === active) : null;

  const globalReach = REGIONS.reduce((sum, r) => sum + reachOf(r), 0);
  const globalExpected = REGIONS.reduce((sum, r) => sum + expectedOf(r), 0);

  const activeCode = activeRegion?.code ?? "GLOBAL";
  const activeName = activeRegion?.name ?? (isHealth ? "All IDA · global" : "All IDA · global");
  const activeReach = activeRegion ? reachOf(activeRegion) : globalReach;
  const activeExpected = activeRegion ? expectedOf(activeRegion) : globalExpected;
  const activeRatio = activeExpected ? activeReach / activeExpected : 0;
  const activePct = Math.round(activeRatio * 100);

  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
        {isHealth ? "Regional health-services reach (FY25)" : "Regional reach (FY25)"}
      </h4>

      {/* Region tile grid — no outer card wrapper; each tile already
          carries its own surface so a parent card would just nest. */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-1.5">
          {REGIONS.map((r) => {
            const reach = reachOf(r);
            const expected = expectedOf(r);
            const ratio = expected ? reach / expected : 0;
            const pct = Math.round(ratio * 100);
            const inScope = codes.includes(r.code);
            const isHover = hover === r.code;
            const isSelected = selectedRegion === r.code;
            return (
              <button
                key={r.code}
                onMouseEnter={() => setHover(r.code)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectRegion(isSelected ? null : r.code)}
                className={`group relative flex flex-col items-start gap-0.5 p-2 rounded-md border transition-all text-left ${
                  isSelected
                    ? "bg-white border-gray-900 ring-2 ring-gray-300 shadow-sm"
                    : inScope
                      ? "bg-white border-gray-200 hover:border-gray-400"
                      : "bg-white/40 border-gray-100 opacity-50 hover:opacity-80"
                } ${isHover && !isSelected ? "ring-2 ring-blue-200 border-blue-400" : ""}`}
              >
                <span className="text-[9px] font-mono text-gray-400">{r.code}</span>
                <span className="text-[10.5px] font-semibold text-gray-700 leading-tight truncate w-full">
                  {r.short}
                </span>
                <span className="text-[13px] font-bold leading-none mt-0.5" style={{ color: ratioColor(ratio) }}>
                  {reach}M
                </span>
                <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: ratioColor(ratio) }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 mt-0.5">{pct}% of target</span>
              </button>
            );
          })}
        </div>

        {/* Live readout — single sentence around a prominent stat + progress bar.
            Falls back to global aggregate when nothing is selected/hovered. */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-mono text-gray-400">{activeCode}</span>
            <span className="text-[12.5px] font-semibold text-gray-900 truncate">{activeName}</span>
            {!activeRegion && (
              <span className="ml-auto text-[10px] text-gray-400 italic">
                hover or select a region
              </span>
            )}
          </div>

          {/* Headline reach number */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold text-gray-900 tabular-nums leading-none">
              {activeReach}M
            </span>
            <span className="text-[12px] text-gray-500">
              {isHealth ? "people received HNP services in FY25" : "people reached in FY25"}
            </span>
          </div>

          {/* Progress bar with percent on the right */}
          <div className="flex items-center gap-2.5 mt-0.5">
            <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${activePct}%`, background: ratioColor(activeRatio) }}
              />
            </div>
            <span
              className="text-[12px] font-semibold tabular-nums shrink-0"
              style={{ color: ratioColor(activeRatio) }}
            >
              {activePct}%
            </span>
          </div>

          {/* Target context */}
          <span className="text-[10.5px] text-gray-400 -mt-0.5">
            of {activeExpected}M FY25 {isHealth ? "HNP-services target" : "target"}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Per-country locator map ────────────────────────────────────────────────
// Small map embedded in each country example card. Reuses the same
// world-atlas topojson as the (now-removed) global WorldMap, but zooms in
// on a single country, highlighting it in violet. Falls back to a neutral
// dot when the country isn't in the lookup tables.

// Country name → M49 numeric (matches the topojson `geo.id`, padded to 3).
const NAME_TO_M49: Record<string, string> = {
  Ethiopia: "231", Niger: "562", Mozambique: "508", Madagascar: "450",
  Kenya: "404", Rwanda: "646", Senegal: "686", Yemen: "887",
  Afghanistan: "004", Sudan: "729", "South Sudan": "728", Pakistan: "586",
  Bangladesh: "050", Myanmar: "104", Chad: "148", Nigeria: "566",
  Mali: "466", Zambia: "894", Malawi: "454",
};

// Country name → [longitude, latitude]. Centred roughly on each country's
// geographic centroid so the projection focuses the map on the target.
const NAME_TO_LATLNG: Record<string, [number, number]> = {
  Ethiopia:    [40.5,   9.1],
  Niger:       [ 8.1,  17.6],
  Mozambique:  [35.5, -18.7],
  Madagascar:  [46.9, -18.8],
  Kenya:       [37.9,  -0.0],
  Rwanda:      [29.9,  -1.9],
  Senegal:     [-14.5, 14.5],
  Yemen:       [48.5,  15.6],
  Afghanistan: [67.7,  33.9],
  Sudan:       [30.2,  12.9],
  "South Sudan":[31.3,  7.9],
  Pakistan:    [69.3,  30.4],
  Bangladesh:  [90.4,  23.7],
  Myanmar:     [95.9,  21.9],
  Chad:        [18.7,  15.5],
  Nigeria:     [ 8.7,   9.1],
  Mali:        [-3.9,  17.6],
  Zambia:      [27.8, -13.1],
  Malawi:      [34.3, -13.3],
};

function CountryLocatorMap({ name }: { name: string }) {
  const m49 = NAME_TO_M49[name];
  const center = NAME_TO_LATLNG[name];
  // If the country isn't in our lookup, render a small placeholder so the
  // layout stays stable instead of collapsing.
  if (!m49 || !center) {
    return (
      <div
        className="w-full h-full rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center"
        aria-hidden
      >
        <IconMapPin size={14} className="text-gray-300" />
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-md overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/40">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 600, center }}
        style={{ width: "100%", height: "100%" }}
        aria-label={`Locator map of ${name}`}
      >
        <Geographies geography={WORLD_GEO_URL}>
          {({ geographies }: { geographies: { rsmKey: string; id: string }[] }) =>
            geographies.map((geo) => {
              const isTarget = String(geo.id) === m49;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isTarget ? "#6B4FA0" : "#E5E7EB"}
                  stroke="#FFFFFF"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none", opacity: isTarget ? 1 : 0.85 },
                    hover:   { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

// ─── Charts for each accordion ──────────────────────────────────────────────

// Shared chart container
const chartWrap = {
  borderRadius: 12,
  background: "#0D1B2A",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: "14px 16px 12px",
} as const;

// ─── Chart Type System ────────────────────────────────────────────────────────
// Six canonical types matching the platform's chart type reference.

type ChartType = "comparative" | "trend" | "geographic" | "diagnostic" | "compositional" | "explanatory";

const CHART_TYPE_META: { id: ChartType; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "comparative",   label: "Comparative",   Icon: IconInfographic },
  { id: "trend",         label: "Trend",          Icon: IconTrendingUp },
  { id: "geographic",    label: "Geographic",     Icon: IconWorld },
  { id: "diagnostic",    label: "Diagnostic",     Icon: IconChartHistogram },
  { id: "compositional", label: "Compositional",  Icon: IconChartPie },
  { id: "explanatory",   label: "Explanatory",    Icon: IconAlignLeft },
];

function ChartTypeSwitcherBar({ available, selected, onChange }: {
  available: ChartType[];
  selected: ChartType;
  onChange: (t: ChartType) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
      {CHART_TYPE_META.map(({ id, label, Icon }) => {
        const isAvailable = available.includes(id);
        const isSelected = id === selected;
        return (
          <button
            key={id}
            type="button"
            disabled={!isAvailable}
            onClick={() => isAvailable && onChange(id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 9px", borderRadius: 20, fontSize: 10.5,
              fontFamily: "'Open Sans', sans-serif", fontWeight: isSelected ? 600 : 400,
              border: isSelected ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.07)",
              background: isSelected ? "rgba(255,255,255,0.10)" : "transparent",
              color: isSelected ? "rgba(255,255,255,0.88)" : isAvailable ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.13)",
              cursor: isAvailable ? "pointer" : "default",
              transition: "all 0.15s",
            }}
          >
            <Icon size={10} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Shared style tokens used across chart renders
const ctTitle: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em", fontFamily: "'Open Sans', sans-serif" };
const ctTick = { fontSize: 10, fill: "rgba(255,255,255,0.35)" } as const;
const ctTip = { fontSize: 11, padding: "6px 10px", borderRadius: 8, background: "#0D2137", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.88)" };
const ctSrc: React.CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.30)", marginTop: 6 };

// Reusable ranked horizontal bar chart (Comparative type)
function RankedBars({ data, title, unit = "", source, labelWidth = 80 }: {
  data: { name: string; value: number; color?: string }[];
  title: string;
  unit?: string;
  source?: string;
  labelWidth?: number;
}) {
  return (
    <>
      <div className="mb-3"><span style={ctTitle}>{title}</span></div>
      <div className="h-[128px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={ctTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}${unit}`} />
            <YAxis type="category" dataKey="name" tick={ctTick} axisLine={false} tickLine={false} width={labelWidth} />
            <RcTooltip contentStyle={ctTip} formatter={(v) => [`${v}${unit}`]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.color ?? "#3B82F6"} fillOpacity={0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {source && <div style={ctSrc}>{source}</div>}
    </>
  );
}

// Reusable explanatory text block
function ExplanatoryText({ title, body }: { title: string; body: string }) {
  return (
    <>
      <div className="mb-2"><span style={ctTitle}>{title}</span></div>
      <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: 0, fontFamily: "'Open Sans', sans-serif" }}>{body}</p>
    </>
  );
}

// CONTEXT — extreme poverty rate trend (FCS) from CLAUDE.md (declining)
const POVERTY_TREND = [
  { year: "FY21", fcs: 35.6, lic: 25.1 },
  { year: "FY22", fcs: 34.4, lic: 24.2 },
  { year: "FY23", fcs: 33.2, lic: 22.8 },
  { year: "FY24", fcs: 31.8, lic: 21.6 },
  { year: "FY25", fcs: 30.4, lic: 20.5 },
];

function ContextChart({ chartType }: { chartType: ChartType }) {
  return (
    <div style={chartWrap}>

      {chartType === "trend" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span style={ctTitle}>Extreme poverty rate</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}><span className="w-3 h-0.5 rounded-full" style={{ background: "#EF4444" }} />FCS</span>
              <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}><span className="w-3 h-0.5 rounded-full" style={{ background: "#3B82F6" }} />LIC avg</span>
            </div>
          </div>
          <div className="h-[128px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={POVERTY_TREND} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradFcs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gradLic" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.10} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="year" tick={ctTick} axisLine={false} tickLine={false} />
                <YAxis tick={ctTick} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
                <RcTooltip contentStyle={ctTip} formatter={(v, name) => [`${v}%`, name === "fcs" ? "FCS" : "LIC avg"]} />
                <Area type="monotone" dataKey="fcs" stroke="#EF4444" strokeWidth={2} dot={false} fill="url(#gradFcs)" />
                <Area type="monotone" dataKey="lic" stroke="#3B82F6" strokeWidth={2} dot={false} fill="url(#gradLic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={ctSrc}>CSC_CLI_EXT_POOR_FCS · 5-year trend</div>
        </>
      )}

      {chartType === "comparative" && (
        <RankedBars
          title="Extreme poverty rate — FY25"
          data={[{ name: "FCS countries", value: 30.4, color: "#EF4444" }, { name: "LIC average", value: 20.5, color: "#3B82F6" }]}
          unit="%"
          source="CSC_CLI_EXT_POOR_FCS · FY25 values"
          labelWidth={100}
        />
      )}

      {chartType === "diagnostic" && (
        <>
          <div className="mb-3"><span style={ctTitle}>Year-on-year change — FCS poverty rate</span></div>
          <div className="h-[128px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ period: "FY21→22", delta: -1.2 }, { period: "FY22→23", delta: -1.2 }, { period: "FY23→24", delta: -1.4 }, { period: "FY24→25", delta: -1.4 }]} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="period" tick={{ ...ctTick, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ ...ctTick, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}pp`} />
                <RcTooltip contentStyle={ctTip} formatter={(v) => [`${v}pp`, "Change"]} />
                <Bar dataKey="delta" fill="#34D399" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={ctSrc}>Percentage point change per year · FCS countries</div>
        </>
      )}

      {chartType === "explanatory" && (
        <ExplanatoryText
          title="Extreme poverty rate — reading the data"
          body="Extreme poverty in FCS countries declined from 35.6% in FY21 to 30.4% in FY25 — a 5.2 percentage point reduction over five years. The LIC average fell from 25.1% to 20.5% over the same period, narrowing but not closing the gap. FCS countries remain 10 percentage points above the LIC average, reflecting structural constraints that financing alone has not resolved."
        />
      )}
    </div>
  );
}

// INTERVENTION — distribution of FY25 results by vertical (stacked bar)
const VERTICAL_MIX = [
  { name: "People",         value: 939, color: "#1D4ED8" },
  { name: "Planet",         value: 337, color: "#059669" },
  { name: "Infrastructure", value: 215, color: "#D97706" },
  { name: "Digital",        value: 217, color: "#0284C7" },
  { name: "Prosperity",     value:  56, color: "#7C3AED" },
];

function InterventionChart({ chartType }: { chartType: ChartType }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = VERTICAL_MIX.reduce((s, v) => s + v.value, 0);
  return (
    <div style={chartWrap}>

      {chartType === "compositional" && (
        <>
          <div className="flex items-baseline justify-between mb-3">
            <span style={ctTitle}>FY25 reach by delivery vertical</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{total.toLocaleString()}M total</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden mb-3.5">
            {VERTICAL_MIX.map((v) => (
              <div key={v.name} style={{ width: `${(v.value / total) * 100}%`, background: v.color, opacity: !hover || hover === v.name ? 1 : 0.25, transition: "opacity 0.15s" }} onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)} />
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {VERTICAL_MIX.map((v) => {
              const pct = Math.round((v.value / total) * 100);
              const isHov = hover === v.name;
              return (
                <li key={v.name} className="flex flex-col gap-1 cursor-default" onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", fontWeight: isHov ? 500 : 400, transition: "color 0.15s" }}>{v.name}</span>
                    <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)", fontWeight: isHov ? 600 : 400, transition: "color 0.15s" }} className="tabular-nums">{v.value}M &middot; {pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ width: `${pct}%`, height: 3, borderRadius: 99, background: v.color, opacity: !hover || isHov ? 1 : 0.3, transition: "opacity 0.15s" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {chartType === "comparative" && (
        <RankedBars
          title="FY25 reach by vertical — ranked"
          data={[...VERTICAL_MIX].sort((a, b) => b.value - a.value).map((v) => ({ name: v.name, value: v.value, color: v.color }))}
          unit="M"
          source="FY25 beneficiary count · all IDA countries"
        />
      )}

      {chartType === "explanatory" && (
        <ExplanatoryText
          title="FY25 reach by delivery vertical — reading the data"
          body={`IDA investments in FY25 reached ${total.toLocaleString()}M people across five delivery verticals. People-focused investments account for the largest share (939M, 53%), followed by Planet (337M, 19%), Digital (217M, 12%), Infrastructure (215M, 12%), and Prosperity (56M, 3%). The concentration in People reflects IDA's core mandate, while the comparatively small Prosperity share points to an emerging area still scaling.`}
        />
      )}
    </div>
  );
}

// IMPACT — vertical achievement ratios (horizontal bars, Comparative type)
const VERTICAL_RATIOS = [
  { name: "People",         value: 68 },
  { name: "Health services",value: 63 },
  { name: "Prosperity",     value: 52 },
  { name: "Digital",        value: 50 },
  { name: "Planet",         value: 45 },
  { name: "Infrastructure", value: 41 },
];

function ImpactChart({ chartType }: { chartType: ChartType }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div style={chartWrap}>

      {chartType === "comparative" && (
        <>
          <div className="mb-3"><span style={ctTitle}>Achievement rate vs target · FY25</span></div>
          <ul className="flex flex-col gap-2.5">
            {VERTICAL_RATIOS.map((v) => {
              const isHov = hover === v.name;
              const barColor = "rgba(255,255,255,0.55)";
              return (
                <li key={v.name} className="flex flex-col gap-1 cursor-default" onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", fontWeight: isHov ? 500 : 400, transition: "color 0.15s" }}>{v.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)", transition: "color 0.15s" }} className="tabular-nums">{v.value}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${v.value}%`, height: 4, borderRadius: 99, background: barColor, opacity: isHov ? 1 : 0.65, transition: "opacity 0.15s, width 0.4s ease" }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div style={ctSrc}>% of FY25 target · People-pillar average 65%</div>
        </>
      )}

      {chartType === "compositional" && (
        <>
          <div className="mb-3"><span style={ctTitle}>Achieved vs gap to target · FY25</span></div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VERTICAL_RATIOS.map((v) => ({ name: v.name, achieved: v.value, gap: 100 - v.value }))} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={ctTick} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={ctTick} axisLine={false} tickLine={false} width={80} />
                <RcTooltip contentStyle={ctTip} formatter={(v, name) => [`${v}%`, name === "achieved" ? "Achieved" : "Gap"]} />
                <Bar dataKey="achieved" stackId="a" fill="rgba(255,255,255,0.55)" fillOpacity={0.8} />
                <Bar dataKey="gap" stackId="a" fill="rgba(255,255,255,0.07)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={ctSrc}>% of FY25 target · shaded = gap remaining</div>
        </>
      )}

      {chartType === "diagnostic" && (
        <RankedBars
          title="Gap to target by vertical · FY25"
          data={[...VERTICAL_RATIOS].sort((a, b) => (100 - a.value) - (100 - b.value)).map((v) => ({ name: v.name, value: 100 - v.value, color: "rgba(255,255,255,0.45)" }))}
          unit="%"
          source="Percentage points below FY25 target"
        />
      )}

      {chartType === "explanatory" && (
        <ExplanatoryText
          title="Achievement rate vs target — reading the data"
          body="Achievement rates against FY25 targets range from 68% (People) to 41% (Infrastructure). The People pillar average of 65% masks significant variation: Health services and Prosperity are close to that bar, while Planet and Infrastructure sit well below. The persistent underperformance in Infrastructure and Planet suggests constraints beyond financing — likely project complexity and implementation capacity."
        />
      )}
    </div>
  );
}

// ─── Section + Accordion ─────────────────────────────────────────────────────

type FlowId = "africa-poverty" | "health-gap";

function detectFlow(prompt: string): FlowId {
  const t = prompt.toLowerCase();
  if (
    t.includes("health services target") ||
    t.includes("health & nutrition") ||
    t.includes("global") ||
    t.includes("countries")
  ) return "health-gap";
  return "africa-poverty";
}

interface CountryStory {
  flag: string;
  name: string;
  iso?: string;
  /** Thematic label for the example (e.g. "Shock-responsive Safety Nets"). */
  theme?: string;
  /** Context paragraph — the situation before WBG intervention. */
  context?: string;
  /** Action paragraph — what WBG/IDA did. */
  action?: string;
  /** Fallback prose body used by skeleton-driven flow (combines context + action). */
  body: string;
  /** Tiny stat shown on the right of each story card (e.g. project count). */
  meta?: string;
  /** Quantified result line in plain English active voice. Rendered as "→ [text]" in emerald. */
  result?: string;
}

interface IndicatorRow {
  code: string;
  label: string;
  value: string;
}

interface Hero {
  /** Short outcome name shown as the big page title. */
  title: string;
  /** Lead-in paragraph below the title. */
  intro: string;
  /** Large headline metric for the hero stat block. */
  metric: { value: string; caption: string; code: string };
}

interface Section {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
  Chart?: React.ComponentType<{ chartType: ChartType }>;
  chartAvailable?: ChartType[];
  defaultChartType?: ChartType;
  /** Country case-study paragraphs — rendered below the chart inside the
   *  Country Examples accordion when present. */
  countryStories?: CountryStory[];
  /** When set, renders the 4-step pathway cards instead of bullets + Chart. */
  pathways?: Pathways;
  /** Theory of Change steps — renders as plain labeled paragraphs (bold label + em dash + prose). No stepper chrome. */
  tocSteps?: { label: string; body: string }[];
  /** When set, renders a numbered list of "Lesson — bold lead + body"
   *  cards (Lessons Learned format). Replaces `bullets` for sections that
   *  carry structured takeaways. */
  lessons?: { lead: string; body: string }[];
  /** Agent-instructions key results — 2-3 stat chips rendered as a row
   *  below the opening body text. Present only on the "opening" / "summary"
   *  section when the panel is driven by a guidedSkeleton. */
  keyResults?: ReadonlyArray<{ value: string; consequence: string }>;
  /** Multi-paragraph body — each string renders as a separate <p>. Takes
   *  precedence over `body` for sections with more than one paragraph. */
  paragraphs?: string[];
  /** 0–100 quality score shown as a % badge in the accordion header. */
  quality?: number;
}

interface NarrativeScores {
  challengeFraming: number;
  causalHumility: number;
  obstaclesGaps: number;
  evidenceQuality: number;
  lessonsLearned: number;
}

const SCORE_CRITERIA: {
  key: keyof NarrativeScores;
  label: string;
  tooltip: string;
}[] = [
  { key: "challengeFraming", label: "Challenge framing",  tooltip: "Honest characterisation of the challenge" },
  { key: "causalHumility",   label: "Causal humility",    tooltip: "Causal humility — does the narrative avoid overclaiming attribution?" },
  { key: "obstaclesGaps",    label: "Obstacles & gaps",   tooltip: "Acknowledgment of obstacles and incomplete results" },
  { key: "evidenceQuality",  label: "Evidence quality",   tooltip: "Specificity of evidence — are claims grounded in PADs, ISRs, ICRs?" },
  { key: "lessonsLearned",   label: "Lessons learned",    tooltip: "Quality and utility of lessons learned for future engagements" },
];

interface NarrativeContent {
  hero: Hero;
  scores: NarrativeScores;
  sections: Section[];
  indicators: IndicatorRow[];
  methodology: { title: string; href: string };
}

// ─── Agent-instructions skeleton → Section[] builder ────────────────────────
// Constructs the 5 accordion sections from a NarrativeSkeleton following the
// WBG Results Narrative Agent Writing Instructions format:
//   Opening · The Challenge · Pathways to Outcomes · Country Examples · Lessons Learned

function deriveLessonsFromText(lessonsText: string): { lead: string; body: string }[] {
  // Split on sentence boundaries to extract 2–3 lessons from the paragraph.
  // Each sentence that starts with a capital letter after a period becomes a lesson.
  const sentences = lessonsText.split(/(?<=[.!?])\s+(?=[A-Z])/);
  if (sentences.length < 2) {
    return [{ lead: "Key finding.", body: lessonsText }];
  }
  return sentences.slice(0, 3).map((s) => {
    // Try to pull a bold lead from the first clause before the first comma or period.
    const leadMatch = s.match(/^([^,.]+)[,.]/);
    const lead = leadMatch ? leadMatch[1].trim() + "." : s.split(" ").slice(0, 5).join(" ") + ".";
    const body = s.replace(leadMatch?.[0] ?? "", "").trim() || s;
    return { lead, body };
  });
}

function buildSectionsFromSkeleton(skeleton: NarrativeSkeleton): Section[] {
  return [
    {
      id: "headline",
      title: "Headline",
      body: skeleton.openingClaim,
    },
    {
      id: "constraints",
      title: "Constraints and Challenges",
      body: skeleton.challengeText,
    },
    {
      id: "intervention",
      title: "Pathways to Outcomes",
      body: skeleton.pathways.wbgApproach,
      pathways: skeleton.pathways,
    },
    {
      id: "impact",
      title: "Impact",
      body: "Country case studies from the selected narrative angle.",
      countryStories: skeleton.countryExamples.map((c) => ({
        flag: c.flag,
        name: c.name,
        iso: c.name.toUpperCase().slice(0, 3),
        body: c.description,
        result: c.result,
      })),
    },
    {
      id: "lessons-learnt",
      title: "Lessons Learnt",
      body: skeleton.lessonsText,
      lessons: deriveLessonsFromText(skeleton.lessonsText),
    },
  ];
}

const SECTIONS_AFRICA: Section[] = [
  {
    id: "headline",
    title: "Headline",
    quality: 78,
    body: "In FCS countries, where institutional absorption capacity — not financing volume — is the binding constraint, IDA-supported safety nets, structured pedagogy, and primary health programs reached 939 million people in FY25 alongside government-led reforms and bilateral coordination. FCS-country health delivery ran 2.3× more efficiently than non-FCS IDA peers — the clearest evidence yet that integrated People-pillar investment compounds returns when the institutional foundations are in place, though health remains the most off-track component with a 13% delivery shortfall.",
  },
  {
    id: "constraints",
    title: "Constraints and Challenges",
    quality: 82,
    body: "",
    paragraphs: [
      "The binding constraint in IDA-eligible FCS countries is not funding volume but institutional absorption capacity. Chronically weak domestic revenue systems — 56 countries below the 15% tax-to-GDP threshold — fractured social registries, and absent last-mile service infrastructure mean project resources repeatedly reach saturation before the hardest-to-reach populations.",
      "Overlapping shocks compound this: the 2024 Sahel drought and El Niño events triggered anticipatory-transfer clauses in only a minority of active safety-net operations, revealing programme-design gaps rather than financing shortfalls. FCS-country extreme poverty at 30.4% has declined, but the trajectory is fragile — one conflict event or climate shock can erase years of incremental gains (CSC_CLI_EXT_POOR_FCS; SE_LPV_PRIM).",
    ],
    Chart: ContextChart,
    defaultChartType: "trend" as ChartType,
    chartAvailable: ["trend", "comparative", "diagnostic", "explanatory"] as ChartType[],
  },
  {
    id: "intervention",
    title: "Pathways to Outcomes",
    quality: 76,
    body: "IDA's theory of change moves from institutional constraint → targeted support → intermediate outcomes → high-level development impact. The four steps below trace how People-pillar financing translated into measurable gains during IDA20.",
    tocSteps: [
      {
        label: "Constraint",
        body: "In FCS countries, the binding constraint was not financing volume but the institutional infrastructure through which resources reach people: fractured social registries, manual disbursement cycles averaging 60–90 days, and absent last-mile delivery systems meant that funds repeatedly stalled before reaching the hardest-to-reach populations.",
      },
      {
        label: "WBG Support",
        body: "IDA, working alongside government Social Protection and Finance ministries and in coordination with bilateral partners including USAID and EU delegations, responded primarily through institutional strengthening — building biometric ID-linked payment rails, adaptive social registries, and integrated beneficiary systems. Governments provided the policy mandate and civil servant capacity; IDA contributed financing, technical design, and cross-country learning from prior IDA cycles.",
      },
      {
        label: "Intermediate Outcome",
        body: "A functioning shock-responsive architecture: when the 2024 Sahel drought struck, anticipatory-transfer clauses in reformed safety-net operations activated within 14 days rather than the pre-reform 60–90 day cycle (IEG FY22 review). By Q3, structured-pedagogy programmes in nine SSA countries had moved learning poverty metrics off a multi-year plateau. Health remained the most off-track component: 370M reached against 425M expected, a 13% shortfall driven by supply-chain disruption — a gap in last-mile health delivery that the payment-rail reforms did not address.",
      },
      {
        label: "High-Level Development Outcome",
        body: "Q4 ICRs rated 68% of People-pillar operations Satisfactory or better, the highest portfolio share. The strongest returns were concentrated in operations that integrated safety nets, primary health, and education around the same beneficiary cohort — confirming that registry integration compounds across sectors and pointing to a design model for future IDA cycles.",
      },
    ],
    Chart: InterventionChart,
    defaultChartType: "compositional" as ChartType,
    chartAvailable: ["compositional", "comparative", "explanatory"] as ChartType[],
  },
  {
    id: "impact",
    title: "Impact",
    quality: 82,
    Chart: ImpactChart,
    defaultChartType: "comparative" as ChartType,
    chartAvailable: ["comparative", "compositional", "diagnostic", "explanatory"] as ChartType[],
    body: "Three representative operations illustrate the mechanism across different delivery contexts — shock response, registry scale-up, and education-safety net integration.",
    countryStories: [
      {
        flag: "🇪🇹",
        name: "Ethiopia",
        iso: "ETH",
        theme: "Shock-responsive Safety Nets",
        context: "The 2024 Sahel drought placed 9.5M Ethiopians in acute food insecurity, stressing a safety-net system built on manual disbursement cycles averaging 60–90 days per payment run.",
        action: "Led by Ethiopia's Ministry of Labour and Social Affairs with IDA technical and financial support, the Productive Safety Net Programme activated anticipatory transfers using biometric ID rails and a drought-index trigger, delivering payments within 14 days of verified shock onset — a 75% reduction in delivery lead time versus the pre-reform baseline. Without the pre-built biometric infrastructure, manual processing would have taken 60–90 days, well outside the shock-response window.",
        body: "Led by Ethiopia's Ministry of Labour and Social Affairs with IDA support, the Productive Safety Net Programme activated anticipatory transfers using biometric ID rails and a drought-index trigger, delivering payments within 14 days — a 75% reduction in lead time versus the pre-reform baseline.",
        result: "9.5M people reached within the shock window; ICR rated project outcomes Satisfactory.",
        meta: "11 PADs · 41 ICRs",
      },
      {
        flag: "🇳🇪",
        name: "Niger",
        iso: "NER",
        theme: "Social Registry Expansion",
        context: "37% of Niger's chronic-poor households were excluded from the national social registry, limiting targeting accuracy and delaying transfer activation during lean-season shocks.",
        action: "Working with Niger's Ministry of Social Development, IDA financing scaled the adaptive social registry to biometric-ID-linked coverage and integrated payment rails enabling sub-week onboarding during shock-activation events. Registry expansion was a first phase — coverage reached 38%, representing meaningful progress on a previously stalled system, with further scale-up planned for subsequent cycles.",
        body: "Working with Niger's Ministry of Social Development, IDA financing scaled the adaptive social registry to biometric-ID-linked coverage with sub-week onboarding — a first phase of expansion on a previously stalled system.",
        result: "Registry coverage of chronic-poor households reached 38%; lean-season transfer lead times cut from 45 days to under 7.",
        meta: "7 PADs · 19 ICRs",
      },
      {
        flag: "🇰🇪",
        name: "Kenya",
        iso: "KEN",
        theme: "Education–Safety Net Integration",
        context: "Secondary school dropout in Kenya's poorest counties persisted at high levels, driven by fee barriers compounded by household food insecurity — a dual constraint that single-sector programmes could not resolve.",
        action: "Under Kenya Ministry of Education direction and with support from bilateral partners, the Secondary Education Quality Improvement Project paired targeted social grants for 1.4M students with structured in-service coaching for 320,000 teachers, integrating cash transfer and education delivery around the same beneficiary cohort. The dual-constraint approach was designed jointly with the Ministry, reflecting its own diagnostic that fee removal alone had not moved dropout rates.",
        body: "Under Kenya Ministry of Education direction, the Secondary Education Quality Improvement Project paired social grants for 1.4M students with coaching for 320,000 teachers — a dual-constraint approach designed jointly with the Ministry after fee removal alone had not moved dropout rates.",
        result: "Secondary attendance in targeted counties rose 11 percentage points; learning-poverty metrics moved off a 6-year plateau in five counties.",
        meta: "9 PADs · 23 ICRs",
      },
    ],
  },
  {
    id: "lessons-learnt",
    title: "Lessons Learnt",
    quality: 82,
    body: "",
    lessons: [
      {
        lead: "What worked:",
        body: "Per FY25 ICRs across 18 integrated People-pillar operations: combining safety nets, primary health, and education around the same beneficiary cohort achieved 68% Satisfactory ratings, the portfolio's highest share, outperforming siloed programmes by 14–22 percentage points. Ethiopia PSNP FY25 ICR documented that pre-built biometric payment rails reduced shock-response lead times by 75% — a result that was not achievable through disbursement design alone; it required the prior institutional investment in registry and ID infrastructure.",
      },
      {
        lead: "What did not:",
        body: "Operations in FCS contexts retaining manual disbursement cycles and lacking pre-agreed anticipatory-trigger clauses could not activate within shock windows — confirmed across Q3–Q4 ISR monitoring. Infrastructure-pillar integration sat at 41% of target, the weakest delivery channel, while People-pillar operations ran at 68% (Kenya SEQUIP FY25 ISR; Niger Adaptive Safety Net Q4 ISR), confirming a structural portfolio imbalance that pre-dates the current IDA cycle.",
      },
      {
        lead: "What this means for future engagements:",
        body: "The next IDA cycle's FCS programming should mandate biometric payment rails and shock-trigger clauses in all safety-net PADs as structural design requirements, not contingency addenda — as the Ethiopia PSNP experience demonstrates, these cannot be retrofitted during a shock. Portfolio allocation should reweight toward the People-pillar integration model; Infrastructure sub-components that have consistently under-delivered should be reviewed for design or political-economy constraints before the next PAD cycle.",
      },
    ],
  },
];

const HERO_AFRICA: Hero = {
  title: "Protection for the Poorest",
  intro:
    "FY25 IDA delivery converged on People-pillar programs — safety nets, education, and primary health — reaching 939M direct beneficiaries across the world's poorest countries. FCS-country efficiency is 2.3× higher for health coverage than non-FCS IDA peers, a structural finding worth elevating.",
  metric: {
    value: "30.4%",
    caption: "of FCS-country populations live in extreme poverty (FY25)",
    code: "CSC_CLI_EXT_POOR_FCS",
  },
};

const SCORES_AFRICA: NarrativeScores = {
  challengeFraming: 82,
  causalHumility:   81,
  obstaclesGaps:    74,
  evidenceQuality:  88,
  lessonsLearned:   82,
};

const INDICATORS_AFRICA: IndicatorRow[] = [
  { code: "CSC_RES_SOC_SAF_PROG",    label: "Safety net beneficiaries",   value: "244M / 313M" },
  { code: "CSC_RES_EDU_SUPP",        label: "Students supported",         value: "325M / 452M" },
  { code: "CSC_RES_HEA_SERV",        label: "Health services",            value: "370M / 425M" },
  { code: "CSC_RES_RESI_CLIM_RISK",  label: "Climate resilience",         value: "244M / 425M" },
  { code: "CSC_RES_ELC_ACCS",        label: "Electricity access",         value: "215M / 576M" },
  { code: "CSC_CLI_EXT_POOR_FCS",    label: "Extreme poverty (FCS)",      value: "30.4%" },
];

// ─── Health-gap flow charts + sections ──────────────────────────────────────

// CONTEXT — UHC service coverage index FCS vs LIC (declining/flat)
const UHC_TREND = [
  { year: "FY21", fcs: 35, lic: 47 },
  { year: "FY22", fcs: 34, lic: 48 },
  { year: "FY23", fcs: 33, lic: 48 },
  { year: "FY24", fcs: 32, lic: 49 },
  { year: "FY25", fcs: 32, lic: 49 },
];
function HealthContextChart({ chartType }: { chartType: ChartType }) {
  return (
    <div style={chartWrap}>

      {chartType === "trend" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span style={ctTitle}>UHC service coverage index</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}><span className="w-3 h-0.5 rounded-full" style={{ background: "#EF4444" }} />FCS</span>
              <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}><span className="w-3 h-0.5 rounded-full" style={{ background: "#3B82F6" }} />LIC avg</span>
            </div>
          </div>
          <div className="h-[128px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={UHC_TREND} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradUhcFcs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gradUhcLic" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.10} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="year" tick={ctTick} axisLine={false} tickLine={false} />
                <YAxis tick={ctTick} axisLine={false} tickLine={false} domain={[20, 60]} />
                <RcTooltip contentStyle={ctTip} formatter={(v, name) => [`${v}/100`, name === "fcs" ? "FCS" : "LIC avg"]} />
                <Area type="monotone" dataKey="fcs" stroke="#EF4444" strokeWidth={2} dot={false} fill="url(#gradUhcFcs)" />
                <Area type="monotone" dataKey="lic" stroke="#3B82F6" strokeWidth={2} dot={false} fill="url(#gradUhcLic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={ctSrc}>SH_UHC_SRVS_CV_XD · 5-year trend (0–100)</div>
        </>
      )}

      {chartType === "comparative" && (
        <RankedBars
          title="UHC service coverage index — FY25"
          data={[{ name: "FCS countries", value: 32, color: "#EF4444" }, { name: "LIC average", value: 49, color: "#3B82F6" }]}
          unit="/100"
          source="SH_UHC_SRVS_CV_XD · FY25 snapshot"
          labelWidth={110}
        />
      )}

      {chartType === "explanatory" && (
        <ExplanatoryText
          title="UHC service coverage index — reading the data"
          body="UHC coverage in FCS countries has been flat at 32/100 for five consecutive years, while the LIC average edged from 47 to 49 over the same period. The 17-point gap between FCS and LIC reflects structural constraints — conflict disruption, supply-chain fragility, and health worker displacement — that have not responded to increased financing alone."
        />
      )}
    </div>
  );
}

// INTERVENTION — share of FY25 HNP results across project types (stacked bar)
const HNP_PROJECT_MIX = [
  { name: "Primary care expansion",  value: 165, color: "#1D4ED8" },
  { name: "Maternal & child health", value:  88, color: "#0284C7" },
  { name: "Disease surveillance",    value:  62, color: "#059669" },
  { name: "Nutrition programs",      value:  35, color: "#D97706" },
  { name: "Health workforce",        value:  20, color: "#7C3AED" },
];
function HealthInterventionChart({ chartType }: { chartType: ChartType }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = HNP_PROJECT_MIX.reduce((s, v) => s + v.value, 0);
  return (
    <div style={chartWrap}>

      {chartType === "compositional" && (
        <>
          <div className="flex items-baseline justify-between mb-3">
            <span style={ctTitle}>FY25 HNP reach by project type</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{total}M total</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden mb-3.5">
            {HNP_PROJECT_MIX.map((v) => (
              <div key={v.name} style={{ width: `${(v.value / total) * 100}%`, background: v.color, opacity: !hover || hover === v.name ? 1 : 0.25, transition: "opacity 0.15s" }} onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)} />
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {HNP_PROJECT_MIX.map((v) => {
              const pct = Math.round((v.value / total) * 100);
              const isHov = hover === v.name;
              return (
                <li key={v.name} className="flex flex-col gap-1 cursor-default" onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", fontWeight: isHov ? 500 : 400, transition: "color 0.15s" }}>{v.name}</span>
                    <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)", fontWeight: isHov ? 600 : 400, transition: "color 0.15s" }} className="tabular-nums">{v.value}M &middot; {pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ width: `${pct}%`, height: 3, borderRadius: 99, background: v.color, opacity: !hover || isHov ? 1 : 0.3, transition: "opacity 0.15s" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {chartType === "comparative" && (
        <RankedBars
          title="FY25 HNP reach — ranked by project type"
          data={[...HNP_PROJECT_MIX].sort((a, b) => b.value - a.value).map((v) => ({ name: v.name, value: v.value, color: v.color }))}
          unit="M"
          source="FY25 beneficiary count · HNP portfolio"
          labelWidth={130}
        />
      )}

      {chartType === "explanatory" && (
        <ExplanatoryText
          title="FY25 HNP reach by project type — reading the data"
          body={`IDA HNP investments in FY25 reached ${total}M people. Primary care expansion was the largest programme type (165M, ${Math.round(165/total*100)}%), followed by maternal and child health (88M), disease surveillance (62M), nutrition (35M), and health workforce (20M). The small workforce share — just ${Math.round(20/total*100)}% of total reach — understates its strategic importance: health worker shortages are a primary driver of coverage gaps in conflict-affected countries.`}
        />
      )}
    </div>
  );
}

// IMPACT — gap driver decomposition (horizontal bars, Diagnostic type)
const GAP_DRIVERS = [
  { name: "Conflict-related supply",  value: 38, color: "#EF4444" },
  { name: "Health worker shortage",   value: 27, color: "#F59E0B" },
  { name: "Displacement / access",    value: 18, color: "#8B5CF6" },
  { name: "Funding lag",              value: 11, color: "#3B82F6" },
  { name: "Reporting completeness",   value:  6, color: "#10B981" },
];
function HealthImpactChart({ chartType }: { chartType: ChartType }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div style={chartWrap}>

      {chartType === "diagnostic" && (
        <>
          <div className="mb-3"><span style={ctTitle}>Gap driver decomposition · bottom-5 countries</span></div>
          <ul className="flex flex-col gap-2.5">
            {GAP_DRIVERS.map((v) => {
              const isHov = hover === v.name;
              return (
                <li key={v.name} className="flex flex-col gap-1 cursor-default" onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", fontWeight: isHov ? 500 : 400, transition: "color 0.15s" }}>{v.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.60)" }} className="tabular-nums">{v.value}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${v.value}%`, height: 4, borderRadius: 99, background: v.color, opacity: isHov ? 1 : 0.65, transition: "opacity 0.15s, width 0.4s ease" }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div style={ctSrc}>Share of FY25 HNP shortfall · project-note decomposition</div>
        </>
      )}

      {chartType === "comparative" && (
        <RankedBars
          title="Gap drivers ranked by share of shortfall"
          data={[...GAP_DRIVERS].sort((a, b) => b.value - a.value).map((v) => ({ name: v.name, value: v.value, color: v.color }))}
          unit="%"
          source="FY25 HNP shortfall · project-note decomposition"
          labelWidth={140}
        />
      )}

      {chartType === "compositional" && (
        <>
          <div className="mb-3"><span style={ctTitle}>Composition of FY25 HNP shortfall</span></div>
          <div className="flex h-3 rounded-full overflow-hidden mb-3">
            {GAP_DRIVERS.map((v) => (
              <div key={v.name} style={{ width: `${v.value}%`, background: v.color, opacity: !hover || hover === v.name ? 1 : 0.25, transition: "opacity 0.15s" }} onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)} />
            ))}
          </div>
          <ul className="flex flex-col gap-1.5">
            {GAP_DRIVERS.map((v) => (
              <li key={v.name} className="flex items-center justify-between" onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)}>
                <span className="flex items-center gap-2" style={{ fontSize: 11, color: hover === v.name ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: v.color, display: "inline-block", flexShrink: 0 }} />
                  {v.name}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", fontWeight: 500 }} className="tabular-nums">{v.value}%</span>
              </li>
            ))}
          </ul>
          <div style={ctSrc}>Share of FY25 HNP shortfall · all factors sum to 100%</div>
        </>
      )}

      {chartType === "explanatory" && (
        <ExplanatoryText
          title="Gap driver decomposition — reading the data"
          body="Five factors account for the FY25 HNP shortfall in the bottom-performing countries. Conflict-related supply disruption is the largest contributor (38%), ahead of health worker shortages (27%), displacement and access constraints (18%), funding lag (11%), and reporting completeness (6%). Together, the top two drivers — conflict supply and workforce — explain 65% of the gap, pointing to operational and human capital constraints rather than financing gaps."
        />
      )}
    </div>
  );
}

const SECTIONS_HEALTH: Section[] = [
  {
    id: "headline",
    title: "Headline",
    quality: 80,
    body: "Five FCS countries drove 37% of IDA's FY25 HNP pipeline shortfall — not because funding was insufficient but because conflict-disrupted supply chains and health-worker displacement have outpaced the current project design model.",
  },
  {
    id: "constraints",
    title: "Constraints and Challenges",
    quality: 79,
    body: "",
    paragraphs: [
      "Universal health coverage in IDA-FCS countries has been flat for five consecutive years (UHC index ≈ 32/100 versus the LIC average of 49), driven by structural constraints that financing alone cannot resolve. Health-worker density at 0.8 per 1,000 — one-fifth of the WHO threshold of 4.45 — means that even fully disbursed operations run into a human capital ceiling before reaching coverage targets.",
      "Conflict episodes in Yemen, Afghanistan, and Sudan triggered supply-chain disruptions that collapsed medicine and consumables pipelines mid-year, accounting for 38% of the FY25 HNP shortfall according to project-note driver decomposition. These are non-financial constraints: the bottleneck is not money but the institutional and logistical infrastructure to convert disbursements into service delivery in active-conflict environments (SH_UHC_SRVS_CV_XD; SH_STA_STNT_ME_ZS).",
    ],
    Chart: HealthContextChart,
    defaultChartType: "trend" as ChartType,
    chartAvailable: ["trend", "comparative", "explanatory"] as ChartType[],
  },
  {
    id: "intervention",
    title: "Pathways to Outcomes",
    quality: 65,
    body: "IDA-supported HNP operations in FY25 followed a delivery sequence concentrated in primary care and maternal-child health, with workforce-strengthening as a secondary — and undersized — component. Q1–Q2 disbursements targeted 165M people through primary care expansion and 88M through maternal and child health programmes, primarily in lower-fragility IDA countries where absorption capacity was adequate. The transmission mechanism in FCS contexts proved more fragile: Q3 ISRs flagged conflict-driven supply disruptions in Yemen, Sudan, and Afghanistan as breaking the causal chain between disbursement and coverage — a signal that the standard government-executed quarterly procurement model does not hold in high-fragility environments. Third-party monitoring in Afghanistan and pooled-buyer medicine agreements with WHO in Sudan were activated as mid-project course corrections (IEG FY23 FCS health review precedent), and both were on-track by Q4 to recover partial coverage shortfalls. Workforce operations remained off-track: health-worker strengthening reached 20M against a 35M target — adding 27% to the aggregate gap — a structural portfolio imbalance that mid-cycle corrections cannot fully resolve.",
    Chart: HealthInterventionChart,
    defaultChartType: "compositional" as ChartType,
    chartAvailable: ["compositional", "comparative", "explanatory"] as ChartType[],
  },
  {
    id: "impact",
    title: "Impact",
    quality: 84,
    Chart: HealthImpactChart,
    defaultChartType: "diagnostic" as ChartType,
    chartAvailable: ["diagnostic", "comparative", "compositional", "explanatory"] as ChartType[],
    body: "Three operations across Yemen, Afghanistan, and Sudan illustrate how conflict-context delivery models diverged from the standard IDA implementation pathway.",
    countryStories: [
      {
        flag: "🇾🇪",
        name: "Yemen",
        iso: "YEM",
        theme: "Conflict-adaptive Delivery",
        context: "Active conflict in 2024 collapsed Yemen's public health supply chain, leaving 3.2M people without access to HNP services the Emergency Health and Nutrition Project was designed to reach.",
        action: "IDA shifted to UN-implemented delivery with third-party monitoring and rerouted supply chains through WHO-administered pooled procurement to maintain service continuity in accessible districts.",
        body: "Active conflict collapsed Yemen's public health supply chain, leaving 3.2M people unreached. IDA shifted to UN-implemented delivery with third-party monitoring and WHO pooled procurement to maintain continuity.",
        result: "1.2M people reached (38% of target); UN-implemented model extended access to districts where direct IDA implementation was operationally infeasible.",
        meta: "8 PADs · 5 ICRs",
      },
      {
        flag: "🇦🇫",
        name: "Afghanistan",
        iso: "AFG",
        theme: "Regime-shock Resilience",
        context: "The 2021 regime change suspended standard government-executed implementation, threatening coverage for 5M+ beneficiaries under the Sehatmandi Project and eliminating the institutional counterpart the project design assumed.",
        action: "IDA activated a third-party monitored delivery model with rural-retention packages for community health workers in highest-need districts, preserving facility functionality without relying on the suspended government system.",
        body: "The 2021 regime change suspended standard government-executed implementation, threatening 5M+ beneficiaries. IDA activated a third-party delivery model with CHW retention packages in highest-need districts.",
        result: "Coverage held at 44% of plan; CHW retention packages kept facilities functional in 12 high-risk districts — a significant achievement given the operating environment.",
        meta: "6 PADs · 3 ICRs",
      },
      {
        flag: "🇸🇩",
        name: "Sudan",
        iso: "SDN",
        theme: "PFM-triggered Payroll Continuity",
        context: "2024 civil unrest froze Sudan's treasury disbursements, placing frontline health-worker payrolls and facility operations at immediate risk of collapse.",
        action: "IDA deployed PFM-tagged disbursement triggers to ring-fence payroll continuity independent of the frozen treasury system, and executed WHO pooled-buyer agreements to maintain the critical medicines pipeline.",
        body: "2024 civil unrest froze Sudan's treasury disbursements, placing health-worker payrolls at risk. IDA deployed PFM-tagged disbursement triggers and WHO pooled-buyer agreements to maintain the critical medicines pipeline.",
        result: "Frontline facilities remained operational throughout the 2024 unrest; WHO agreements secured 60% of the critical medicines supply.",
        meta: "5 PADs · 2 ICRs",
      },
    ],
  },
  {
    id: "lessons-learnt",
    title: "Lessons Learnt",
    quality: 70,
    body: "",
    lessons: [
      {
        lead: "What worked:",
        body: "Third-party monitoring and UN-implemented delivery models proved effective in sustaining coverage in high-fragility contexts — Afghanistan and Sudan both recovered partial shortfalls through mid-cycle pivots supported by IEG FY23 precedent. WHO pooled-buyer procurement in Sudan secured 60% of critical medicines supply despite a frozen treasury.",
      },
      {
        lead: "What did not:",
        body: "Standard government-executed quarterly procurement broke down under conflict-driven supply disruptions, accounting for 38% of the FY25 HNP shortfall. Workforce-strengthening operations were undersized relative to their driver weight: 20M reached against 35M targeted, contributing 27% of the aggregate miss — a portfolio allocation failure, not an implementation one.",
      },
      {
        lead: "What this means for future engagements:",
        body: "FCS-context HNP PADs should structurally embed WHO pooled-buyer procurement clauses, third-party delivery activation triggers, and health-worker retention packages as core design requirements. Portfolio mix should reweight toward workforce strengthening in high-fragility IDA operations, in line with driver decomposition evidence, shifting allocation from primary care — over-represented relative to its marginal return in FCS — toward human capital investment.",
      },
    ],
  },
];

const HERO_HEALTH: Hero = {
  title: "Healthier Lives",
  intro:
    "Five FCS countries — Yemen, Sudan, Afghanistan, South Sudan and Myanmar — collectively account for ~37% of the FY25 HNP pipeline shortfall, all running below 50% of plan. Across the bottom-5, conflict-driven supply-chain disruption (38%) and health-worker shortages (27%) explain the bulk of the gap.",
  metric: {
    value: "32",
    caption: "UHC service coverage index in FCS / 100 (LIC avg: 49)",
    code: "SH_UHC_SRVS_CV_XD",
  },
};

const SCORES_HEALTH: NarrativeScores = {
  challengeFraming: 79,
  causalHumility:   65,
  obstaclesGaps:    74,
  evidenceQuality:  84,
  lessonsLearned:   70,
};

const INDICATORS_HEALTH: IndicatorRow[] = [
  { code: "CSC_RES_HEA_SERV",         label: "Health services reach",        value: "370M / 425M" },
  { code: "CSC_RES_HEA_EMER_BENE",    label: "Emergency-health beneficiaries", value: "44M" },
  { code: "SH_STA_STNT_ME_ZS",        label: "Under-5 stunting (FCS)",       value: "33.6%" },
  { code: "SH_UHC_SRVS_CV_XD",        label: "UHC index — FCS",              value: "32 / 100" },
  { code: "SH_HEA_WORK_DENS",         label: "Health workforce density",     value: "0.8 / 1k" },
];

// Resolve all the per-flow content surfaced by the panel in one place. Adding
// a new flow just requires extending detectFlow + this lookup.
const CONTENT_BY_FLOW: Record<FlowId, NarrativeContent> = {
  "africa-poverty": {
    hero: HERO_AFRICA,
    scores: SCORES_AFRICA,
    sections: SECTIONS_AFRICA,
    indicators: INDICATORS_AFRICA,
    methodology: {
      title: "Outcome Area 1 · Protection for the Poorest methodology",
      href: "https://scorecard.worldbank.org/en/narratives/protection-for-the-poorest/results-narrative",
    },
  },
  "health-gap": {
    hero: HERO_HEALTH,
    scores: SCORES_HEALTH,
    sections: SECTIONS_HEALTH,
    indicators: INDICATORS_HEALTH,
    methodology: {
      title: "Outcome Area 3 · Healthier Lives methodology",
      href: "https://scorecard.worldbank.org/en/narratives/healthier-lives/results-narrative",
    },
  },
};

// ─── Donor Narrative content (Norway food security) ─────────────────────────

const SECTIONS_DONOR_NORWAY: Section[] = [
  {
    id: "headline",
    title: "Headline",
    quality: 81,
    body: "IDA21's food security commitments align directly with Norway's priorities: since FY23, IDA-supported agriculture and nutrition programs have reached 184M smallholder farmers and food-insecure households across Sub-Saharan Africa and South Asia, with climate-resilient agriculture accounting for 61% of new disbursements — the highest share in IDA history.",
  },
  {
    id: "summary",
    title: "Summary",
    quality: 78,
    body: "",
    paragraphs: [
      "IDA21 enshrines food security as a cross-cutting priority, reflecting donor commitments including Norway's thematic focus on sustainable food systems. The replenishment introduced dedicated food security results indicators, climate-resilient agriculture targets, and nutrition-sensitive programming requirements across all agriculture-sector operations.",
      "Norway's food security priorities span three dimensions: (1) smallholder productivity and market access, (2) nutrition outcomes for women and children under five, and (3) climate adaptation in food production systems. IDA21 Scorecard indicators directly measure progress on all three, with FY25 results showing strong performance in smallholder reach but a significant gap in nutrition outcomes among FCS countries (CSC_RES_AGR_SMHLD; SH_STA_STNT_ME_ZS).",
    ],
    Chart: ContextChart,
    defaultChartType: "trend" as ChartType,
    chartAvailable: ["trend", "comparative", "explanatory"] as ChartType[],
  },
  {
    id: "challenge",
    title: "Challenge",
    quality: 76,
    body: "",
    paragraphs: [
      "Food insecurity in IDA-eligible countries is driven by three compounding constraints: climate shocks, conflict-disrupted supply chains, and fragile smallholder market linkages. The 2023–24 El Niño event reduced cereal production by an estimated 12% across Sub-Saharan Africa, erasing two years of productivity gains in key IDA borrower countries.",
      "In FCS contexts, the constraint compounds: 68% of food-insecure households in Yemen, Sudan, and South Sudan lack reliable access to input markets, extension services, or post-harvest storage infrastructure. Women farmers — who account for 60–80% of food production in Sub-Saharan Africa — face additional barriers including land tenure insecurity and restricted financial access, limiting the scalability of productivity gains (CSC_RES_AGR_SMHLD; FAO SOFI 2024).",
    ],
    Chart: InterventionChart,
    defaultChartType: "compositional" as ChartType,
    chartAvailable: ["compositional", "comparative", "explanatory"] as ChartType[],
  },
  {
    id: "response",
    title: "Response",
    quality: 79,
    body: "",
    tocSteps: [
      {
        label: "IDA21 Commitment",
        body: "IDA21 committed to dedicating at least 40% of climate financing to adaptation, with food systems explicitly prioritised. Norway's co-financing ($320M in IDA21 period) was channelled through the Food Security Special Theme, supporting 23 agriculture operations across 18 countries.",
      },
      {
        label: "On-track indicators",
        body: "Smallholder farmers reached with improved agricultural technology: 184M against 190M target (97%). Climate-resilient agriculture share of new disbursements: 61% against 55% target. Women-led smallholder operations supported: 44% against 40% commitment.",
      },
      {
        label: "Off-track indicators",
        body: "Under-5 stunting in FCS countries: 33.6% against 28% target — a persistent gap driven by conflict disruption of nutrition supply chains. Post-harvest loss reduction in Sub-Saharan Africa: 18% reduction against 25% target, constrained by infrastructure investment shortfalls in storage and logistics.",
      },
      {
        label: "Adaptive response",
        body: "Mid-cycle portfolio reviews in FY24 led to 7 restructured operations in FCS countries, shifting from government-executed to third-party-monitored delivery models. WHO and WFP-partnered nutrition programs in Yemen and South Sudan partially offset FCS delivery gaps, recovering an estimated 3.2M beneficiaries who would otherwise have been missed.",
      },
    ],
    Chart: ImpactChart,
    defaultChartType: "comparative" as ChartType,
    chartAvailable: ["comparative", "diagnostic", "explanatory"] as ChartType[],
  },
  {
    id: "lessons-learned",
    title: "Lessons Learned",
    quality: 75,
    body: "",
    lessons: [
      {
        lead: "What worked:",
        body: "Climate-resilient agriculture integration exceeded targets for the first time in IDA history — 61% of new disbursements incorporate climate adaptation measures, up from 38% in IDA19. Operations that bundled smallholder productivity support with nutrition-sensitive design achieved 23% better stunting outcomes than standalone agriculture projects (IEG FY24 agriculture review). Norway's earmarked co-financing for the Food Security Special Theme provided both financing additionality and political signalling that elevated food security in country dialogues.",
      },
      {
        lead: "What did not:",
        body: "Post-harvest loss reduction lagged due to infrastructure investment shortfalls not addressed within the agriculture sector operations themselves — storage and logistics require cross-sectoral coordination with Infrastructure pillar operations that proved difficult to operationalise within project timelines. FCS nutrition outcomes remained the most persistent gap: conflict-disrupted supply chains for micronutrient supplements were not offset by third-party delivery models, which were designed for cash transfers rather than physical commodity distribution (South Sudan FY25 ISR; Yemen FY24 ICR).",
      },
      {
        lead: "What this means for future engagements:",
        body: "For IDA22 reporting to Norway and other food security donors: nutrition indicator performance in FCS countries should be disaggregated and separately tracked, with FCS-adjusted targets that account for structural delivery constraints. Future Norway co-financing could be directed specifically toward post-harvest infrastructure — the binding constraint identified in IDA21 — and toward cross-sectoral operations that link agriculture productivity with nutrition service delivery in the same beneficiary communities.",
      },
    ],
  },
];

const HERO_DONOR_NORWAY: Hero = {
  title: "Norway's Food Security Priorities",
  intro:
    "IDA21's food security commitments directly address Norway's three thematic priorities: smallholder productivity, climate-resilient agriculture, and nutrition outcomes. FY25 results show strong on-track performance in agriculture reach but a persistent gap in FCS-country nutrition outcomes.",
  metric: {
    value: "184M",
    caption: "smallholder farmers reached under IDA21 food security programs",
    code: "CSC_RES_AGR_SMHLD",
  },
};

const SCORES_DONOR_NORWAY: NarrativeScores = {
  challengeFraming: 76,
  causalHumility:   79,
  obstaclesGaps:    81,
  evidenceQuality:  78,
  lessonsLearned:   75,
};

const INDICATORS_DONOR_NORWAY: IndicatorRow[] = [
  { code: "CSC_RES_AGR_SMHLD",       label: "Smallholder farmers reached",        value: "184M / 190M" },
  { code: "CSC_RES_AGR_CLIM_RESI",   label: "Climate-resilient agr. share",       value: "61% / 55%" },
  { code: "SH_STA_STNT_ME_ZS",       label: "Under-5 stunting (FCS)",             value: "33.6% / 28%" },
  { code: "CSC_RES_AGR_POST_HARV",   label: "Post-harvest loss reduction",        value: "18% / 25%" },
  { code: "CSC_RES_WOM_SMHLD",       label: "Women-led smallholder ops",          value: "44% / 40%" },
];

const CONTENT_DONOR_NORWAY: NarrativeContent = {
  hero: HERO_DONOR_NORWAY,
  scores: SCORES_DONOR_NORWAY,
  sections: SECTIONS_DONOR_NORWAY,
  indicators: INDICATORS_DONOR_NORWAY,
  methodology: {
    title: "IDA21 Food Security Special Theme — methodology note",
    href: "https://scorecard.worldbank.org/en/narratives/food-security",
  },
};

function HeroImageResolved({ onRemove }: { onRemove?: () => void }) {
  const [src, setSrc] = useState("/images/story-featured.jpg");
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSrc(url);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200">
      <img src={src} alt="Narrative hero" className="w-full h-44 object-cover block" />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
        >
          <IconPhoto size={13} />
          Replace image
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-black/50 hover:bg-red-600/80 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
          >
            <IconX size={13} />
            Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
    </div>
  );
}

function VisualPlaceholder({ type, onRemove }: { type: string; onRemove?: () => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1800);
    return () => clearTimeout(t);
  }, []);

  // Phase 1 — shimmer skeleton for all types while "AI is adding".
  // Uses a white-sweep overlay on a gray base so the animation is clearly
  // visible (pure gray-on-gray gradients are nearly invisible on white bg).
  if (!loaded) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
          <div className="narrative-shimmer" />
        </div>
        <div className="px-3 py-2.5 flex flex-col gap-1.5 bg-gray-50">
          <div className="relative h-2.5 rounded-full bg-gray-200 w-2/3 overflow-hidden">
            <div className="narrative-shimmer" />
          </div>
          <div className="relative h-2.5 rounded-full bg-gray-200 w-1/2 overflow-hidden">
            <div className="narrative-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // Phase 2 — resolved content
  if (type === "hero-image") return <HeroImageResolved onRemove={onRemove} />;

  if (type === "extra-chart") {
    return (
      <div className="relative group rounded-xl border border-gray-100 bg-white p-1">
        <ImpactChart chartType="comparative" />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gray-800/70 hover:bg-red-600/80 px-2 py-1 rounded-full backdrop-blur-sm"
          >
            <IconX size={11} />
            Remove
          </button>
        )}
      </div>
    );
  }

  // callout quote
  return (
    <div className="relative group">
      <blockquote className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-[13px] text-gray-600 leading-relaxed italic">
          &ldquo;Across IDA countries, the most durable results come from operations that integrated delivery channels around the same beneficiary cohort — not from parallel, single-sector programs.&rdquo;
        </p>
        <footer className="mt-2 text-[11px] text-gray-400 font-medium">— WBG Results Narrative, FY25</footer>
      </blockquote>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gray-800/70 hover:bg-red-600/80 px-2 py-1 rounded-full backdrop-blur-sm"
        >
          <IconX size={11} />
          Remove
        </button>
      )}
    </div>
  );
}

const PATHWAY_STEPS: { key: keyof Pathways; label: string; labelColor: string; dotColor: string }[] = [
  { key: "challenge",      label: "Constraint",                     labelColor: "text-rose-700 bg-rose-50 border-rose-200",         dotColor: "bg-rose-400"    },
  { key: "wbgApproach",   label: "WBG Support",                    labelColor: "text-blue-700 bg-blue-50 border-blue-200",         dotColor: "bg-blue-500"    },
  { key: "outcomes",      label: "Intermediate Outcome",           labelColor: "text-emerald-700 bg-emerald-50 border-emerald-200", dotColor: "bg-emerald-500" },
  { key: "longTermImpact",label: "High-Level Development Outcome", labelColor: "text-violet-700 bg-violet-50 border-violet-200",   dotColor: "bg-violet-500"  },
];

function PathwaysCards({ pathways }: { pathways: Pathways }) {
  return (
    <div className="flex flex-col gap-2">
      {PATHWAY_STEPS.map(({ key, label, labelColor, dotColor }, i) => (
        <div key={key} className="relative pl-5">
          {/* Connector line between steps */}
          {i < PATHWAY_STEPS.length - 1 && (
            <div className="absolute left-[7px] top-[20px] bottom-[-8px] w-px bg-gray-200" />
          )}
          {/* Step dot */}
          <div className={`absolute left-0 top-[7px] w-3.5 h-3.5 rounded-full ${dotColor} ring-2 ring-white shrink-0`} />
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border mb-1.5 ${labelColor}`}>
              {label}
            </span>
            <p className="text-[12.5px] text-gray-800 leading-relaxed">{pathways[key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const ADD_VISUAL_OPTIONS = [
  { id: "hero-image",  label: "Hero image",    Icon: IconPhoto },
  { id: "extra-chart", label: "Another chart", Icon: IconInfographic },
  { id: "callout",     label: "Callout quote", Icon: IconQuote },
] as const;

// Dotted-box trigger that lets the user add a visual to the current
// section without going back to the conversation thread. Clicking expands
// to a small tile picker; picking a type fires onPick(type) and collapses.
function AddVisualInline({
  sectionTitle,
  takenTypes = [],
  onPick,
}: {
  sectionTitle: string;
  takenTypes?: string[];
  onPick: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className="mt-1">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
          aria-label={`Add visual to ${sectionTitle}`}
        >
          <IconPlus size={12} />
          Add visual
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-medium text-gray-400">
              Add to {sectionTitle}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="Cancel"
            >
              <IconX size={12} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ADD_VISUAL_OPTIONS.map(({ id, label, Icon }) => {
              const disabled = takenTypes.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onPick(id); setOpen(false); }}
                  className={
                    "flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-center transition-all " +
                    (disabled
                      ? "border-gray-100 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 cursor-pointer")
                  }
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="text-[10.5px] font-medium leading-none">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Accordion({
  section,
  open,
  onToggle,
  enterDelay,
  geography,
  sectionVisuals = [],
  onRemoveVisual,
  onAddVisual,
  chartRemoved,
  onRemoveChart,
  isDragOver,
  isModifying,
  bodyOverride,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  showQuality = false,
}: {
  section: Section;
  open: boolean;
  onToggle: () => void;
  /** Optional CSS animation-delay (e.g. "120ms") applied to the
   * narrative-content-enter animation so accordions cascade in. */
  enterDelay?: string;
  /** Geography UI rendered above the chart in the Country Examples
   *  section. Null for all other sections. */
  geography?: React.ReactNode;
  sectionVisuals?: AddedVisual[];
  onRemoveVisual?: (id: string) => void;
  onAddVisual?: (type: string) => void;
  /** When true, the section's AI-baked Chart has been removed by the
   *  user; the accordion skips rendering it. */
  chartRemoved?: boolean;
  /** Called when the user clicks the Remove pill on the AI-baked chart. */
  onRemoveChart?: () => void;
  isDragOver?: boolean;
  isModifying?: boolean;
  bodyOverride?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  showQuality?: boolean;
}) {
  const [localChartType, setLocalChartType] = useState<ChartType>(
    (section.defaultChartType ?? "comparative") as ChartType
  );
  const [chartLoading, setChartLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const typePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTypePicker) return;
    const handle = (e: MouseEvent) => {
      if (typePickerRef.current && !typePickerRef.current.contains(e.target as Node)) {
        setShowTypePicker(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showTypePicker]);

  const handleChangeChartType = (t: ChartType) => {
    if (t === localChartType) return;
    setShowTypePicker(false);
    setChartLoading(true);
    setTimeout(() => {
      setLocalChartType(t);
      setChartLoading(false);
    }, 750);
  };

  return (
    <div
      data-anchor={section.id}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`border-b border-gray-100 last:border-b-0 scroll-mt-12 narrative-content-enter transition-colors ${
        isDragOver ? "bg-blue-50/60 ring-2 ring-inset ring-blue-300" : "bg-gray-50"
      }`}
      style={enterDelay ? { animationDelay: enterDelay } : undefined}
    >
      <div className="flex items-stretch">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between px-5 py-4 text-left hover:bg-gray-100 transition-colors"
          aria-expanded={open}
        >
          <span className="text-[13.5px] font-semibold text-gray-900">{section.title}</span>
          <span className="flex items-center gap-2.5 shrink-0">
            {showQuality && section.quality != null && (() => {
              const q = section.quality;
              const color = q >= 80 ? "#059669" : q >= 65 ? "#D97706" : "#DC2626";
              const bg    = q >= 80 ? "#ECFDF5"  : q >= 65 ? "#FFFBEB"  : "#FEF2F2";
              return (
                <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 6, padding: "2px 7px" }}>
                  {q}%
                </span>
              );
            })()}
            <IconChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </div>
      {open && (
        <div className="px-6 pb-6 pt-3 flex flex-col gap-4 bg-white border-t border-gray-100">
          {section.pathways ? (
            <PathwaysCards pathways={section.pathways} />
          ) : (
            <>
              {isModifying ? (
                <div className="flex flex-col gap-2 py-1" aria-busy="true" aria-label="Updating section">
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "100%" }} />
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "92%" }} />
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "85%" }} />
                  <div className="h-2.5 rounded-full skeleton-shimmer-violet" style={{ width: "62%" }} />
                </div>
              ) : (
                <>
                  {bodyOverride ? (
                    <p className="text-[14px] text-gray-700 leading-relaxed">{bodyOverride}</p>
                  ) : section.paragraphs && section.paragraphs.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {section.paragraphs.map((para, i) => (
                        <p key={i} className="text-[14px] text-gray-700 leading-relaxed">{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-gray-700 leading-relaxed">{section.body}</p>
                  )}
                  {/* Key results — agent-instructions format, Opening section only */}
                  {section.keyResults && section.keyResults.length > 0 && (
                    <div className="grid grid-cols-3 gap-px mt-3 rounded-xl overflow-hidden border border-gray-100/10" style={{ background: "rgba(148,163,184,0.08)" }}>
                      {section.keyResults.map((kr, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-1 px-4 py-3"
                          style={{ background: "rgba(15,23,42,0.55)" }}
                        >
                          <span
                            className="font-bold leading-none tabular-nums"
                            style={{ fontSize: 22, color: "#38BDF8", letterSpacing: "-0.5px" }}
                          >
                            {kr.value}
                          </span>
                          <span
                            className="leading-snug"
                            style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}
                          >
                            {kr.consequence}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {geography}
              {section.Chart && !chartRemoved && (
                <div className="relative group" ref={typePickerRef}>
                  {chartLoading ? (
                    <div style={{
                      borderRadius: 12,
                      background: "#0D1B2A",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "14px 16px 12px",
                    }}>
                      <div style={{ height: 10, width: 90, background: "rgba(255,255,255,0.07)", borderRadius: 4, marginBottom: 12, animation: "pulse 1.4s ease-in-out infinite" }} />
                      <div style={{ height: 128, background: "rgba(255,255,255,0.04)", borderRadius: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
                      <div style={{ height: 8, width: 110, background: "rgba(255,255,255,0.04)", borderRadius: 4, marginTop: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
                    </div>
                  ) : (
                    <section.Chart chartType={localChartType} />
                  )}

                  {/* Hover overlay: Change chart type + Remove */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    {/* Change chart type */}
                    {section.chartAvailable && section.chartAvailable.length > 1 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowTypePicker((v) => !v)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gray-800/70 hover:bg-gray-700/90 px-2 py-1 rounded-full backdrop-blur-sm"
                          aria-label="Change chart type"
                        >
                          <IconChartBar size={11} />
                          Change chart type
                        </button>
                        {showTypePicker && (
                          <div
                            style={{
                              position: "absolute",
                              top: "calc(100% + 6px)",
                              right: 0,
                              zIndex: 60,
                              borderRadius: 12,
                              border: "1px solid rgba(255,255,255,0.10)",
                              background: "rgba(14,28,42,0.95)",
                              backdropFilter: "blur(20px)",
                              WebkitBackdropFilter: "blur(20px)",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
                              padding: "4px",
                              minWidth: 160,
                            }}
                          >
                            {CHART_TYPE_META
                              .filter(({ id }) => section.chartAvailable!.includes(id))
                              .map(({ id, label, Icon }) => {
                                const isActive = id === localChartType;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => handleChangeChartType(id)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 7,
                                      width: "100%",
                                      padding: "7px 10px",
                                      borderRadius: 8,
                                      background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "'Open Sans', sans-serif",
                                      fontSize: 12,
                                      fontWeight: isActive ? 600 : 400,
                                      color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
                                      textAlign: "left",
                                      transition: "background 100ms, color 100ms",
                                    }}
                                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.88)"; }}}
                                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}}
                                  >
                                    <Icon size={12} />
                                    {label}
                                    {isActive && <IconCheck size={10} style={{ marginLeft: "auto", color: "#34D399" }} />}
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remove */}
                    {onRemoveChart && (
                      <button
                        type="button"
                        onClick={onRemoveChart}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-gray-800/70 hover:bg-red-600/80 px-2 py-1 rounded-full backdrop-blur-sm"
                        aria-label="Remove chart"
                      >
                        <IconX size={11} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="flex flex-col gap-1.5 pl-4 list-disc text-[14px] text-gray-700">
                  {section.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
              {section.tocSteps && section.tocSteps.length > 0 && (
                <div className="flex flex-col gap-4 mt-1">
                  {section.tocSteps.map((step, i) => (
                    <p key={i} className="text-[14px] text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900">{step.label}</span>
                      {" — "}
                      {step.body}
                    </p>
                  ))}
                </div>
              )}
              {section.lessons && section.lessons.length > 0 && (
                <ol className="flex flex-col gap-3 mt-1">
                  {section.lessons.map((l, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold flex items-center justify-center tabular-nums"
                      >
                        {i + 1}
                      </span>
                      <p className="flex-1 text-[14px] text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">{l.lead}</span>{" "}
                        {l.body}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
          {section.countryStories && section.countryStories.length > 0 && (
            <ul className="flex flex-col mt-1">
              {section.countryStories.map((s, idx) => (
                <li
                  key={s.iso ?? s.name}
                  className={`flex flex-col gap-2 py-4 ${idx > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      {s.theme && (
                        <span className="text-[10.5px] font-medium text-gray-500">
                          {s.theme}
                        </span>
                      )}
                      <span className="text-[14px] font-semibold text-gray-900">{s.name}</span>
                    </div>
                    {s.meta && (
                      <span className="text-[11px] text-gray-600 font-mono shrink-0 mt-0.5">{s.meta}</span>
                    )}
                  </div>
                  {/* Context: situation before WBG intervention */}
                  <p className="text-[14px] text-gray-700 leading-relaxed">{s.context ?? s.body}</p>
                  {/* Action: what WBG/IDA did — separate paragraph */}
                  {s.action && (
                    <p className="text-[14px] text-gray-700 leading-relaxed">{s.action}</p>
                  )}
                  {s.result && (
                    <p className="text-[13px] text-gray-700 leading-snug">{s.result}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {sectionVisuals.map((v) => (
            <VisualPlaceholder key={v.id} type={v.type} onRemove={() => onRemoveVisual?.(v.id)} />
          ))}
          {onAddVisual && (
            <AddVisualInline
              sectionTitle={section.title}
              takenTypes={sectionVisuals.map((v) => v.type)}
              onPick={(type) => onAddVisual(type)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Narrative Strength Panel — glassmorphism scoring card replacing the old hero.
function NarrativeStrengthPanel({
  scores,
  onExplainScore,
}: {
  scores: NarrativeScores;
  onExplainScore?: (key: keyof NarrativeScores, label: string, val: number) => void;
}) {
  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );
  const R = 46;
  const circ = 2 * Math.PI * R;
  const dash = (overall / 100) * circ;
  const criteriaColor = (v: number) =>
    v >= 80 ? "rgba(52,211,153,0.85)" : v >= 65 ? "rgba(251,191,36,0.85)" : "rgba(248,113,113,0.85)";

  const [scoreMenu, setScoreMenu] = useState<{
    key: keyof NarrativeScores;
    label: string;
    val: number;
    top: number;
    left: number;
  } | null>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!scoreMenu) return;
    const handler = () => setScoreMenu(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [scoreMenu]);

  return (
    <div
      className="narrative-content-enter rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(150deg, rgba(8,15,30,0.98) 0%, rgba(12,22,44,0.96) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
      }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-2">
        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 2 }}>
          Narrative Strength
        </p>
      </div>

      {/* Body: donut left + criteria right */}
      <div className="flex items-center gap-8 px-6 pb-6">
        {/* Donut ring with AI gradient */}
        <svg width={120} height={120} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#818CF8" />
              <stop offset="50%"  stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle cx={60} cy={60} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} />
          <circle
            cx={60} cy={60} r={R}
            fill="none"
            stroke="url(#aiGrad)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={circ / 4}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
          <text x={60} y={56} textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.95)" fontSize={22} fontWeight={700} fontFamily="'Open Sans', sans-serif">
            {overall}%
          </text>
          <text x={60} y={74} textAnchor="middle"
            fill="rgba(255,255,255,0.30)" fontSize={10} fontFamily="'Open Sans', sans-serif">
            overall
          </text>
        </svg>

        {/* Criteria list */}
        <ul className="flex-1 flex flex-col gap-3.5">
          {SCORE_CRITERIA.map((c) => {
            const val = scores[c.key];
            return (
              <li
                key={c.key}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity select-none"
                title={c.tooltip}
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setScoreMenu({ key: c.key, label: c.label, val, top: rect.top, left: rect.left + rect.width / 2 });
                }}
              >
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", whiteSpace: "nowrap", width: 130 }}>
                  {c.label}
                </span>
                <div style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.07)" }}>
                  <div
                    style={{ width: `${val}%`, height: 3, borderRadius: 99, background: criteriaColor(val), transition: "width 0.5s ease" }}
                  />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: criteriaColor(val), width: 32, textAlign: "right", fontFamily: "'Open Sans', sans-serif" }}>
                  {val}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Score click context menu */}
      {scoreMenu && typeof document !== "undefined" && createPortal(
        <div
          role="menu"
          style={{
            position: "fixed",
            top: scoreMenu.top,
            left: scoreMenu.left,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            marginTop: -8,
          }}
          className="pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onExplainScore?.(scoreMenu.key, scoreMenu.label, scoreMenu.val);
              setScoreMenu(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white text-[12px] font-medium shadow-lg ring-1 ring-black/10 hover:bg-gray-800 transition-colors"
          >
            <IconSparkles size={12} />
            Explain with AI
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

// Hero block — outcome title + intro + headline metric.
function NarrativeHero({ hero }: { hero: Hero }) {
  return (
    <section
      data-anchor="hero"
      className="flex flex-col gap-3 scroll-mt-12 narrative-content-enter pb-4"
    >
      <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
        {hero.title}
      </h2>
      <p className="text-[13px] text-gray-700 leading-relaxed">{hero.intro}</p>
      <div className="mt-1 flex items-end gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[28px] font-bold text-gray-900 leading-none tabular-nums">
            {hero.metric.value}
          </span>
          <span className="mt-2 text-[10.5px] font-mono text-gray-400">
            {hero.metric.code}
          </span>
        </div>
        <p className="flex-1 text-[12px] text-gray-600 leading-relaxed pb-0.5">
          {hero.metric.caption}
        </p>
      </div>
    </section>
  );
}

// Related Indicators — a compact stat list rendered after the accordions.
function RelatedIndicators({ rows }: { rows: IndicatorRow[] }) {
  return (
    <section
      data-anchor="indicators"
      className="flex flex-col gap-2 scroll-mt-12 narrative-content-enter"
    >
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Related indicators
      </h3>
      <ul className="flex flex-col rounded-lg border border-gray-200 overflow-hidden">
        {rows.map((r, i) => (
          <li
            key={r.code}
            className={
              "flex items-baseline justify-between gap-3 px-3 py-2 bg-white" +
              (i < rows.length - 1 ? " border-b border-gray-100" : "")
            }
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] text-gray-800 truncate">{r.label}</span>
              <span className="text-[10px] font-mono text-gray-400 truncate">{r.code}</span>
            </div>
            <span className="text-[12.5px] font-semibold text-gray-900 tabular-nums shrink-0">
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Methodology footer — link to the corresponding scorecard page.
function MethodologyFootnote({ title, href }: { title: string; href: string }) {
  return (
    <section
      data-anchor="methodology"
      className="flex flex-col gap-1 scroll-mt-12 narrative-content-enter text-[11px] text-gray-500"
    >
      <span className="font-semibold uppercase tracking-wider text-gray-400">
        Methodology
      </span>
      <p>
        Indicator definitions and computation rules come from the World Bank
        Scorecard methodology note. Source figures: IDA Results data ·
        FY2025 (Time_Period == 2025-06-30).
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start mt-1 text-violet-600 hover:text-violet-700 underline"
      >
        {title} ↗
      </a>
    </section>
  );
}

// ─── Narrative-generation loading state ─────────────────────────────────────
// Two-phase loader: first shows agentic reasoning steps appearing one by
// one (so the user reads "what the AI is doing"), then transitions to a
// skeleton with an animated geography placeholder while final content is
// "drafted." Total feel ~2.5s before real content lands.

interface ReasoningStep {
  label: string;
  detail?: string;
}

const REASONING_STEPS: Record<FlowId, ReasoningStep[]> = {
  "africa-poverty": [
    { label: "Reading conversation context",          detail: "1 prompt · IDA · poverty signal" },
    { label: "Indexing relevant indicators",          detail: "7 Results indicators matched" },
    { label: "Determining regional scope",            detail: "Sub-Saharan Africa (AFE + AFW)" },
    { label: "Pulling FY25 portfolio aggregates",     detail: "Time_Period == 2025-06-30" },
    { label: "Cross-referencing context indicators",  detail: "5 Client Context series paired" },
    { label: "Drafting structured narrative sections",detail: "Opening · Key Results · Challenge · Countries · Lessons" },
  ],
  "health-gap": [
    { label: "Reading conversation context",          detail: "1 prompt · health · FCS" },
    { label: "Filtering to FCV-flagged projects",     detail: "874 projects in fragile/conflict states" },
    { label: "Computing achievement ratios per country", detail: "Achieved vs. target by country" },
    { label: "Ranking bottom-5 performers",           detail: "5 countries below 50% of plan" },
    { label: "Decomposing gap by driver",             detail: "Conflict supply · workforce · access" },
    { label: "Drafting structured narrative sections",detail: "Opening · Key Results · Challenge · Countries · Lessons" },
  ],
};

function buildGuidedReasoningSteps(skeleton: NarrativeSkeleton): ReasoningStep[] {
  const oa = skeleton.outcomeArea.label;
  const countries = skeleton.countryExamples.map((c) => c.name).join(" · ");
  return [
    { label: "Reading guided narrative context",       detail: `${oa} · ${skeleton.title.split(" ").slice(0, 4).join(" ")}…` },
    { label: "Applying agent writing instructions",    detail: "Opening claim → Key results → Challenge → Countries → Lessons" },
    { label: "Drafting opening claim",                 detail: skeleton.openingClaim.split(" ").slice(0, 8).join(" ") + "…" },
    { label: "Pulling key results with consequences",  detail: `${skeleton.keyResults.length} data points — ${skeleton.keyResults[0]?.value}` },
    { label: "Structuring country evidence",           detail: countries },
    { label: "Synthesising lessons learned",           detail: "3 non-obvious insights from ISRs/ICRs" },
  ];
}

function NarrativeReasoning({ flow, guidedSkeleton }: { flow: FlowId; guidedSkeleton?: NarrativeSkeleton }) {
  const steps = guidedSkeleton
    ? buildGuidedReasoningSteps(guidedSkeleton)
    : (REASONING_STEPS[flow] ?? REASONING_STEPS["africa-poverty"]);
  // Reveal one step every ~360ms — slow enough that the user can read
  // each line. Final tick advances past the last step (so all rows show
  // their checkmark) before the parent flips to the skeleton phase.
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i >= steps.length ? i : i + 1));
    }, 360);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="px-5 py-6 flex flex-col gap-4" aria-busy="true">
      <div className="flex items-center gap-2.5">
        {/* WBG globe emblem — viewBox crops to the circular mark only */}
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M29.7142 9.50361C29.3434 9.66107 29.1707 10.0877 29.3282 10.4585C30.0698 12.2109 30.4456 14.0801 30.4456 16.0001C30.4456 17.1785 30.2983 18.3214 30.0241 19.4185C29.8107 20.1093 29.4298 20.7493 28.9066 21.3284C28.9168 21.0795 28.9269 20.8306 28.9269 20.5766C28.932 17.7728 28.1599 14.8166 26.7225 12.0331C27.7739 11.129 28.4444 10.0116 28.678 8.76203C28.7491 8.36584 28.4901 7.98488 28.0939 7.90869C27.6977 7.8325 27.3168 8.09663 27.2456 8.49282C27.0933 9.32076 26.6615 10.0776 25.991 10.7227C25.7828 10.3773 25.5644 10.0369 25.3358 9.69663C24.0558 7.81726 22.532 6.19187 20.866 4.89663C23.0653 5.03885 25.0971 5.57726 26.7377 6.49155C26.9968 6.63885 27.3371 6.63377 27.5758 6.4306C27.8857 6.17155 27.9263 5.70933 27.6672 5.39949C25.3155 2.11314 21.2469 0.299805 16.2082 0.299805C7.55295 0.299805 0.507874 7.34488 0.507874 16.0001C0.507874 17.4935 0.721207 18.936 1.11232 20.3023C1.13771 20.3938 1.15803 20.4852 1.18343 20.5766C1.18851 20.5969 1.19867 20.6122 1.20375 20.6274C3.1847 27.0274 9.15803 31.6954 16.2031 31.6954C19.4641 31.6954 22.4914 30.6947 25.0056 28.9881C25.031 28.9728 25.0564 28.9627 25.0768 28.9474C25.2291 28.8458 25.3714 28.7392 25.5136 28.6274C28.3987 26.4941 30.5371 23.3957 31.431 19.8096C31.4818 19.6471 31.5276 19.4744 31.5631 19.3068C31.5733 19.2662 31.5733 19.2255 31.5783 19.1849C31.7917 18.1538 31.9034 17.0871 31.9034 15.995C31.9034 13.8769 31.4869 11.8198 30.6691 9.88457C30.5168 9.51885 30.085 9.34615 29.7142 9.50361ZM24.132 10.5246C24.3707 10.8801 24.5993 11.2357 24.8177 11.6014C23.6495 12.2769 22.1764 12.6782 20.5815 12.795C20.4444 10.2757 20.1498 7.84774 19.6723 5.83123C21.3333 7.06552 22.8571 8.66044 24.132 10.5246ZM21.9631 2.79377C22.6945 3.08838 23.4209 3.46425 24.1117 3.93663C23.0095 3.66234 21.8361 3.49473 20.6171 3.43377C21.1149 3.10869 21.5771 2.8852 21.9631 2.79377ZM20.033 2.18933C19.6266 2.40774 19.205 2.68203 18.7783 3.00711C18.5853 2.57536 18.3822 2.19441 18.1637 1.86933C18.7479 1.93536 19.3777 2.03695 20.033 2.18933ZM13.0895 12.8509C14.1358 13.3233 15.2787 13.6941 16.4774 13.9531C17.3866 14.1462 18.2907 14.2528 19.1847 14.2833C19.1999 14.8319 19.2101 15.3957 19.2101 15.9747C19.2101 19.4135 18.9358 22.2681 18.5396 24.4979C17.2342 24.442 15.8882 24.2693 14.5371 23.9849C12.7288 23.5938 11.0222 23.0249 9.47295 22.2935C9.98089 20.0077 10.9257 17.2344 12.4291 14.1614C12.6374 13.7144 12.8609 13.2776 13.0895 12.8509ZM10.5396 9.47822C9.93517 8.90933 9.47803 8.3252 9.16819 7.73092C10.5345 6.90806 12.0482 6.23758 13.6634 5.74996C14.6234 5.46044 15.5936 5.24711 16.5637 5.0998C15.1618 6.66425 13.7701 8.65536 12.4901 10.9055C11.7587 10.4839 11.1034 10.0065 10.5396 9.47822ZM19.1237 12.8154C18.3517 12.7849 17.5593 12.6884 16.7822 12.5208C15.7257 12.2973 14.7199 11.9722 13.7955 11.5658C15.1568 9.18361 16.6501 7.11123 18.118 5.56711C18.5752 7.37536 18.9612 9.8033 19.1237 12.8154ZM16.1879 1.76266C16.4368 1.76774 16.7415 2.06234 17.0615 2.64139C16.899 2.57028 16.7364 2.50425 16.5739 2.4433C15.9136 2.18933 15.2583 1.99631 14.6133 1.85409C15.1314 1.79314 15.6545 1.76266 16.1879 1.76266ZM8.76692 5.35377C8.92946 4.59695 9.3866 3.92139 10.0876 3.35758C11.7891 2.84965 13.7752 2.97155 15.8577 3.73346C14.9841 3.88584 14.1053 4.08901 13.2368 4.34806C11.6266 4.8306 10.1079 5.49092 8.71613 6.29853C8.69073 5.97853 8.70597 5.66361 8.76692 5.35377ZM7.40057 4.82552C7.38025 4.90171 7.35994 4.97282 7.3447 5.05409C7.1974 5.74488 7.21264 6.44584 7.38533 7.14679C5.81581 8.22869 4.44946 9.51377 3.3574 10.9512C3.02724 11.3881 2.73264 11.835 2.46343 12.2871C3.27105 9.29536 5.03359 6.69472 7.40057 4.82552ZM7.63422 27.3576C5.19613 25.5138 3.37771 22.9081 2.51422 19.896C2.39232 19.4185 2.31105 18.936 2.28057 18.4484C2.76819 19.1392 3.36248 19.8198 4.06851 20.475C5.13517 21.4604 6.40502 22.3442 7.81708 23.1011C7.53264 24.7163 7.45137 26.1792 7.63422 27.3576ZM5.06406 19.3982C3.8247 18.2503 2.97137 17.0414 2.53454 15.8325C2.87994 14.4814 3.54533 13.1252 4.52565 11.83C5.45517 10.5957 6.61327 9.48838 7.94406 8.53345C8.32502 9.22425 8.86343 9.8998 9.54406 10.5398C10.1942 11.1493 10.946 11.6979 11.7891 12.1804C11.5555 12.6173 11.332 13.0642 11.1136 13.5163C9.81835 16.1728 8.76184 19.0173 8.13708 21.6027C6.98406 20.9576 5.94279 20.216 5.06406 19.3982ZM16.2183 30.2274C16.1828 30.2274 16.1472 30.2325 16.1168 30.2376C13.9428 30.2223 11.8857 29.7246 10.0418 28.8357C10.0012 28.8001 9.95041 28.7696 9.89962 28.7442C9.08692 28.3481 8.76184 26.5398 9.18343 23.7766C10.7428 24.4776 12.4393 25.0312 14.2222 25.4122C15.5733 25.7017 16.9193 25.8795 18.2399 25.9455C17.5949 28.7544 16.7669 30.2274 16.2183 30.2274ZM24.6298 27.4693C22.8114 28.8103 20.6628 29.7296 18.3314 30.0801C18.9155 29.0693 19.3879 27.6471 19.7434 25.976C21.8056 25.9506 23.7612 25.6509 25.4933 25.0668C25.9301 24.9195 26.3415 24.7569 26.7377 24.5792C26.2603 25.7576 25.5542 26.7379 24.6298 27.4693ZM27.2914 22.6439C26.6361 23.0452 25.8844 23.3957 25.031 23.6801C23.5225 24.1881 21.826 24.4623 20.0228 24.5081C20.4545 21.9125 20.6628 18.9004 20.6628 15.9696C20.6628 15.4008 20.6577 14.8268 20.6374 14.2579C22.4558 14.136 24.1371 13.6636 25.5136 12.8712C26.7885 15.3957 27.4742 18.0573 27.4691 20.5665C27.4691 21.2979 27.4082 21.9938 27.2914 22.6439Z" fill="#002244"/>
        </svg>
        <span className="text-[12.5px] font-semibold text-gray-700">
          Generating narrative
        </span>
      </div>

      <ol className="flex flex-col gap-2.5 relative pl-5">
        {/* Connector line — sits behind the marker icons */}
        <span
          aria-hidden
          className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-gray-200"
        />
        {steps.map((step, i) => {
          const done    = i < activeIdx;
          const active  = i === activeIdx;
          const pending = i > activeIdx;
          return (
            <li
              key={i}
              className="relative flex items-start gap-2 transition-all duration-300 ease-out"
              style={{
                opacity: pending ? 0.3 : 1,
                transform: pending ? "translateX(-4px)" : "translateX(0)",
              }}
            >
              {/* Marker — sits on the connector line */}
              <span
                aria-hidden
                className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-white border ${
                  done    ? "border-emerald-500" :
                  active  ? "border-blue-500"   : "border-gray-300"
                }`}
              >
                {done ? (
                  <IconCheck size={9} className="text-emerald-600" stroke={3} />
                ) : active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                )}
              </span>
              <div className="flex-1 min-w-0 pl-1">
                <div className={`text-[12.5px] leading-snug transition-colors ${
                  done   ? "text-gray-700" :
                  active ? "text-gray-900 font-medium" : "text-gray-400"
                }`}>
                  {step.label}
                  {active && (
                    <span className="inline-block w-1 ml-1 stream-cursor">·</span>
                  )}
                </div>
                {step.detail && !pending && (
                  <div className="mt-0.5 text-[10.5px] text-gray-500 font-mono leading-snug">
                    → {step.detail}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Skeleton phase ─────────────────────────────────────────────────────────
// Comes after reasoning. Geography slot gets the animated globe + orbital
// dots; everything else falls back to standard pulsing skeleton bars.

const NARRATIVE_LOADING_STAGES = [
  "Mapping geographic scope",
  "Pulling FY25 portfolio data",
  "Drafting The Challenge · Pathways to Outcomes · Country Examples · Lessons Learned",
  "Finalizing summary",
];

function GeographyLoader() {
  // Cycle the status copy so the loader feels active even though it's only
  // a brief placeholder. Stage interval is faster than the actual mock
  // generation timeout so the user sees at least 2–3 messages.
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setStage((s) => (s + 1) % NARRATIVE_LOADING_STAGES.length),
      650
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/40 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center"
      style={{ aspectRatio: "2 / 1" }}
      aria-label="Generating geography"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 z-10">
        {/* Globe + orbiting dots */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <IconWorld
            size={44}
            className="text-gray-300"
            stroke={1.5}
          />
          {/* Six dots evenly spaced around the globe; staggered animation
              delays make them pulse in sequence (clockwise sweep). */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <span
              key={deg}
              className="geography-orbit-dot absolute w-1.5 h-1.5 rounded-full bg-emerald-500"
              style={{
                top: "50%",
                left: "50%",
                marginTop: -3,
                marginLeft: -3,
                transform: `rotate(${deg}deg) translateY(-30px)`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div className="text-[10.5px] text-gray-500 font-mono tabular-nums tracking-tight transition-opacity duration-300">
          {NARRATIVE_LOADING_STAGES[stage]}
          <span className="inline-block w-2 ml-0.5 stream-cursor">·</span>
        </div>
      </div>

      {/* Light shimmer sweeping across the placeholder map area */}
      <div className="narrative-shimmer" />
    </div>
  );
}

function SkelBar({ width = "100%", height = 10, className = "" }: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}

// Standard (non-guided) loading skeleton — mirrors NarrativeStrengthPanel + accordion rows
function NarrativeLoadingStandard() {
  const sections = ["The Challenge", "Pathways to Outcomes", "Country Examples", "Lessons Learned"];
  return (
    <div className="px-6 py-6 flex flex-col gap-6" aria-busy="true">
      {/* NarrativeStrengthPanel placeholder */}
      <div
        className="rounded-2xl overflow-hidden animate-pulse"
        style={{
          background: "linear-gradient(150deg, rgba(8,15,30,0.98) 0%, rgba(12,22,44,0.96) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        }}
      >
        <div className="px-6 pt-5 pb-2">
          <div className="h-2 w-28 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        </div>
        <div className="flex items-center gap-8 px-6 pb-6">
          <div
            className="shrink-0 rounded-full"
            style={{ width: 120, height: 120, border: "8px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}
          />
          <div className="flex-1 flex flex-col gap-3">
            {[65, 85, 50, 75, 70].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${w}%`, background: "rgba(255,255,255,0.18)" }} />
                </div>
                <div className="h-2 w-7 rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion row skeletons */}
      <section className="flex flex-col -mx-6">
        {sections.map((title, i) => (
          <div
            key={title}
            className="bg-gray-50 border-b border-gray-100 last:border-b-0 px-5 py-4 flex items-center justify-between animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-[13.5px] font-semibold text-gray-300">{title}</span>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-12 rounded bg-gray-200" />
              <div className="h-4 w-4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// Agent-instructions loading skeleton — mirrors the 5-section format:
// Opening claim → Key results → The Challenge → Country Examples → Lessons Learned
function NarrativeLoadingAgent() {
  const sections = [
    "Opening Claim",
    "Key Results",
    "The Challenge",
    "Pathways to Outcomes",
    "Country Examples",
    "Lessons Learned",
  ];
  return (
    <div className="px-6 py-6 flex flex-col gap-6" aria-busy="true">
      {/* NarrativeStrengthPanel placeholder — mirrors the dark rounded card */}
      <div
        className="rounded-2xl overflow-hidden animate-pulse"
        style={{
          background: "linear-gradient(150deg, rgba(8,15,30,0.98) 0%, rgba(12,22,44,0.96) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        }}
      >
        <div className="px-6 pt-5 pb-2">
          <div className="h-2 w-28 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        </div>
        <div className="flex items-center gap-8 px-6 pb-6">
          {/* Donut ring placeholder */}
          <div
            className="shrink-0 rounded-full"
            style={{
              width: 120,
              height: 120,
              border: "8px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
            }}
          />
          {/* Criteria bars */}
          <div className="flex-1 flex flex-col gap-3">
            {[70, 90, 55, 80, 60].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${w}%`, background: "rgba(255,255,255,0.18)" }} />
                </div>
                <div className="h-2 w-7 rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion row skeletons — same structure as the real Accordion headers */}
      <section className="flex flex-col -mx-6">
        {sections.map((title, i) => (
          <div
            key={title}
            className="bg-gray-50 border-b border-gray-100 last:border-b-0 px-5 py-4 flex items-center justify-between animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-[13.5px] font-semibold text-gray-300">{title}</span>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-12 rounded bg-gray-200" />
              <div className="h-4 w-4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function NarrativeLoading({ guided = false }: { guided?: boolean }) {
  return guided ? <NarrativeLoadingAgent /> : <NarrativeLoadingStandard />;
}

// ─── Scroll-linked stepper ───────────────────────────────────────────────────
// Vertically-centered dot column floating on the panel's right edge. The
// active step grows + reveals its label; inactive dots stay subtle. Hover
// previews the label without changing the active step. Fades in only after
// the user has begun scrolling so it feels reactive instead of permanent
// chrome.
function ScrollStepper({
  anchors,
  activeId,
  visible,
  onJump,
}: {
  anchors: { id: string; label: string }[];
  activeId: string;
  visible: boolean;
  onJump: (id: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const activeIdx = Math.max(0, anchors.findIndex((a) => a.id === activeId));

  return (
    <div
      aria-label="Section navigation"
      className={`absolute top-1/2 right-2 -translate-y-1/2 z-30 flex flex-col items-end gap-3 py-2 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-1 pointer-events-none"
      }`}
    >
      {/* Connector line behind the dots */}
      <span
        aria-hidden
        className="absolute right-[7px] top-3 bottom-3 w-px bg-gray-200"
      />

      {anchors.map((a, i) => {
        const isActive = i === activeIdx;
        const isPast   = i < activeIdx;
        const isHover  = hover === a.id;
        const showLabel = isActive || isHover;
        return (
          // Button is just the dot — its hit area is bounded to a tight
          // 16×16 square so the label area on the left doesn't catch
          // hovers and block content underneath. The label is positioned
          // absolutely to the left with pointer-events-none.
          <button
            key={a.id}
            onClick={() => onJump(a.id)}
            onMouseEnter={() => setHover(a.id)}
            onMouseLeave={() => setHover(null)}
            aria-label={`Jump to ${a.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex items-center justify-center cursor-pointer w-4 h-4"
          >
            <span
              aria-hidden
              className={`absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 text-[10.5px] font-medium whitespace-nowrap transition-opacity duration-300 px-2 py-0.5 rounded-md pointer-events-none ${
                showLabel ? "opacity-100" : "opacity-0"
              } ${
                isActive
                  ? "text-gray-900 font-semibold bg-white shadow-sm border border-gray-200"
                  : "text-gray-600 bg-white/95 border border-gray-150"
              }`}
            >
              {a.label}
            </span>
            <span
              className={`shrink-0 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-2.5 h-2.5 bg-gray-900 ring-4 ring-gray-100"
                  : isPast
                    ? "w-1.5 h-1.5 bg-gray-400 group-hover:bg-gray-700"
                    : "w-1.5 h-1.5 bg-gray-300 group-hover:bg-gray-500"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

const DIM_TO_SECTION_RESULTS: Record<number, string> = {
  1: "constraints",
  2: "intervention",
  3: "constraints",
  4: "impact",
  5: "lessons-learnt",
};

const DIM_TO_SECTION_DONOR: Record<number, string> = {
  1: "challenge",
  2: "response",
  3: "challenge",
  4: "response",
  5: "lessons-learned",
};

const DIM_TO_SCORE_KEY: Record<number, keyof NarrativeScores> = {
  1: "challengeFraming",
  2: "causalHumility",
  3: "obstaclesGaps",
  4: "evidenceQuality",
  5: "lessonsLearned",
};

export default function NarrativePanel({ open, prompt, onClose, width, onResize, onGenerate, onPreview, loading, generatedKinds = [], skeletonId = null, extraCountryApplied = false, addedVisuals = [], onRemoveVisual, onAddVisual, onModifyContent, onAutoPrompt, contentModifySignal, guidanceSignal, guidedSkeleton, narrativeVariant = "results", narrativeMeta }: Props) {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const flow = useMemo(() => detectFlow(prompt), [prompt]);
  const content = narrativeVariant === "donor-priorities" ? CONTENT_DONOR_NORWAY : CONTENT_BY_FLOW[flow];
  const { hero, scores, indicators, methodology } = content;
  // When a guided skeleton is provided, build sections from it directly
  // (agent-instructions format). Otherwise fall back to the existing
  // per-flow SECTIONS_* logic with optional skeleton patching.
  const sections = useMemo(() => {
    // Guided flow: full agent-instructions sections from the selected skeleton
    if (guidedSkeleton) {
      const base = buildSectionsFromSkeleton(guidedSkeleton);
      // Append extra country when the user has applied the refinement
      if (extraCountryApplied && guidedSkeleton.extraCountryExample) {
        return base.map((s) =>
          s.id === "impact"
            ? {
                ...s,
                countryStories: [
                  ...(s.countryStories ?? []),
                  {
                    flag: guidedSkeleton.extraCountryExample.flag,
                    name: guidedSkeleton.extraCountryExample.name,
                    iso: guidedSkeleton.extraCountryExample.name.toUpperCase().slice(0, 3),
                    body: guidedSkeleton.extraCountryExample.description,
                    result: guidedSkeleton.extraCountryExample.result,
                  },
                ],
              }
            : s,
        );
      }
      return base;
    }

    // Non-guided flow: base sections with optional skeleton patching
    // Non-guided path no longer patches sections from a mock skeleton; the
    // injected guidedSkeleton (handled in the guided branch above) is the only
    // source of skeleton-driven content. With FLOW_SKELETONS removed there is
    // no skeleton to resolve here, so always fall back to base sections.
    return content.sections;
  }, [content.sections, extraCountryApplied, skeletonId, flow, guidedSkeleton]);
  // Scroll-linked stepper: tracks the section currently in view and which
  // accordions are open. The stepper fades in once the user begins scrolling
  // so it feels reactive rather than chrome.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [activeAnchor, setActiveAnchor] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // ── Section drag-to-reorder state ──────────────────────────────────────
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => sections.map(s => s.id));
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceIdRef = useRef<string | null>(null);

  // ── Content-modify state ────────────────────────────────────────────────
  const [sectionBodyOverrides, setSectionBodyOverrides] = useState<Record<string, string>>({});
  const [modifyingSectionId, setModifyingSectionId] = useState<string | null>(null);

  // ── Guidance signal — "Add to Narrative" from the wizard ───────────────
  const [resolvedDimsByGuidance, setResolvedDimsByGuidance] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (!guidanceSignal) return;
    const { dimensionNum } = guidanceSignal;
    const DIM_TO_SECTION = narrativeVariant === "donor-priorities" ? DIM_TO_SECTION_DONOR : DIM_TO_SECTION_RESULTS;
    const sectionId = DIM_TO_SECTION[dimensionNum];
    if (sectionId) {
      setModifyingSectionId(sectionId);
      // Auto-open the section so the shimmer is visible
      setOpenSections((prev) => new Set([...prev, sectionId]));
      const t = setTimeout(() => {
        setModifyingSectionId(null);
        setResolvedDimsByGuidance((prev) => new Set([...prev, dimensionNum]));
      }, 1800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guidanceSignal]);

  const adjustedScores = useMemo((): NarrativeScores => ({
    challengeFraming: resolvedDimsByGuidance.has(1) ? Math.min(scores.challengeFraming + 9, 97) : scores.challengeFraming,
    causalHumility:   resolvedDimsByGuidance.has(2) ? Math.min(scores.causalHumility   + 9, 97) : scores.causalHumility,
    obstaclesGaps:    resolvedDimsByGuidance.has(3) ? Math.min(scores.obstaclesGaps    + 9, 97) : scores.obstaclesGaps,
    evidenceQuality:  resolvedDimsByGuidance.has(4) ? Math.min(scores.evidenceQuality  + 9, 97) : scores.evidenceQuality,
    lessonsLearned:   resolvedDimsByGuidance.has(5) ? Math.min(scores.lessonsLearned   + 9, 97) : scores.lessonsLearned,
  }), [scores, resolvedDimsByGuidance]);

  // Region filter for the WorldMap in Country Examples.
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // ── Chart removal — tracks which AI-baked charts the user has dismissed.
  // Keyed by section.id; once removed, the Accordion skips rendering its
  // Chart. State is per-panel so it persists across accordion open/close
  // cycles within the same conversation.
  const [removedCharts, setRemovedCharts] = useState<Set<string>>(new Set(["impact"]));
  const removeChart = (sectionId: string) =>
    setRemovedCharts((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"document" | "slides" | "infographic">("document");

  // Keep sectionOrder in sync when the sections list changes (flow switch or
  // extraCountryApplied). Always resets to canonical order since drag-to-reorder
  // is not available.
  useEffect(() => {
    setSectionOrder(sections.map(s => s.id));
  }, [sections]);

  const orderedSections = useMemo(
    () => sectionOrder.map(id => sections.find(s => s.id === id)).filter((s): s is Section => !!s),
    [sectionOrder, sections],
  );

  // Anchor order: hero leads the document, sections follow, related
  // indicators + methodology close it out.
  const anchors = useMemo(
    () => [
      { id: "hero", label: "Overview" },
      ...orderedSections.map((s) => ({ id: s.id, label: s.title })),
      { id: "methodology", label: "Methodology" },
    ],
    [orderedSections]
  );

  // Two-phase loader. When `loading` flips true we start in the "reasoning"
  // phase (~2.5s, long enough for the user to read each step), then move
  // to "skeleton" (~1.5s) before the real content mounts. When loading
  // flips false we land directly in "ready".
  const [loadPhase, setLoadPhase] = useState<"reasoning" | "skeleton" | "ready">("ready");
  useEffect(() => {
    if (!loading) { setLoadPhase("ready"); return; }
    setLoadPhase("reasoning");
    const t = window.setTimeout(() => setLoadPhase("skeleton"), 2500);
    return () => window.clearTimeout(t);
  }, [loading]);

  // Expand the first accordion as soon as the draft narrative mounts so
  // the user lands on visible content rather than a stack of collapsed
  // headers. Re-runs when the flow changes (different sections list).
  useEffect(() => {
    if (loadPhase !== "ready") return;
    const first = sections[0]?.id;
    if (!first) return;
    setOpenSections((prev) => (prev.has(first) ? prev : new Set(prev).add(first)));
  }, [loadPhase, sections]);

  // When a new visual is added, open its target accordion and scroll to it
  // so the shimmer is immediately visible. Using a short timeout instead of
  // rAF because setOpenSections triggers a re-render that needs to complete
  // (and paint) before the accordion DOM node exists to scroll to.
  const prevVisualCountRef = useRef(addedVisuals.length);
  useEffect(() => {
    if (addedVisuals.length <= prevVisualCountRef.current) return;
    prevVisualCountRef.current = addedVisuals.length;
    const latest = addedVisuals[addedVisuals.length - 1];
    const match = sections.find((s) => s.title === latest.section);
    if (!match) return;
    setOpenSections((prev) =>
      prev.has(match.id) ? prev : new Set([...prev, match.id])
    );
    const t = setTimeout(() => {
      const node = bodyRef.current?.querySelector(`[data-anchor="${match.id}"]`);
      if (node) (node as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, [addedVisuals, sections]);
  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const scrollToAnchor = (id: string) => {
    // Open the accordion first so its body is laid out before we scroll.
    if (sections.some((s) => s.id === id)) {
      setOpenSections((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
    setActiveAnchor(id);
    requestAnimationFrame(() => {
      const node = bodyRef.current?.querySelector(`[data-anchor="${id}"]`);
      if (node) (node as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Track which section is in view to drive the stepper's active dot.
  // rootMargin biases toward the upper portion of the panel so a section
  // becomes active just as its heading enters view.
  useEffect(() => {
    if (!open) return;
    const root = bodyRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-anchor]");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.offsetTop - b.offsetTop);
        const id = visible[0]?.getAttribute("data-anchor");
        if (id) setActiveAnchor(id);
      },
      { root, rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [open, anchors]);

  // Fade the stepper in once the user starts scrolling. Resets when the
  // panel is closed so the next open feels fresh.
  useEffect(() => {
    if (!open) { setScrolled(false); return; }
    const root = bodyRef.current;
    if (!root) return;
    const onScroll = () => setScrolled(root.scrollTop > 24);
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [open]);

  // ── Highlight-to-modify ──────────────────────────────────────────────
  // When the user selects text inside the draft body, surface a small
  // "Modify this" pill anchored to the selection. Click clears the menu
  // (deeper integration — actually rewriting the passage — is a later
  // step; this commits to the gesture).
  const [selectionAnchor, setSelectionAnchor] = useState<
    { top: number; left: number; text: string; sectionId: string | null } | null
  >(null);

  useEffect(() => {
    if (!open) { setSelectionAnchor(null); return; }
    const root = bodyRef.current;
    if (!root) return;
    const compute = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelectionAnchor(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) {
        setSelectionAnchor(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) { setSelectionAnchor(null); return; }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setSelectionAnchor(null);
        return;
      }
      const anchorNode = range.commonAncestorContainer;
      const anchorEl =
        (anchorNode instanceof Element ? anchorNode : anchorNode.parentElement)
          ?.closest("[data-anchor]");
      const sectionId = anchorEl?.getAttribute("data-anchor") ?? null;
      setSelectionAnchor({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        text,
        sectionId,
      });
    };
    const onMouseUp = () => window.setTimeout(compute, 0);
    const onScroll = () => setSelectionAnchor(null);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", compute);
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", compute);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const dismissSelectionMenu = () => {
    window.getSelection()?.removeAllRanges();
    setSelectionAnchor(null);
  };

  // When the parent fires a contentModifySignal, show a violet skeleton in
  // the target section for ~2.2s, then resolve to a lightly-modified body.
  useEffect(() => {
    if (!contentModifySignal) return;
    const { sectionId, instruction, nonce } = contentModifySignal;
    void nonce;
    setModifyingSectionId(sectionId);
    const t = setTimeout(() => {
      setModifyingSectionId(null);
      if (sectionId) {
        const sec = sections.find(s => s.id === sectionId);
        const original = sec?.body ?? "";
        setSectionBodyOverrides(prev => ({
          ...prev,
          [sectionId]: instruction
            ? `${original} Updated to reflect: ${instruction.charAt(0).toUpperCase() + instruction.slice(1)}${instruction.endsWith(".") ? "" : "."}`
            : original,
        }));
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [contentModifySignal, sections]);

  // ── Section drag-to-reorder handlers ───────────────────────────────────
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    dragSourceIdRef.current = sectionId;
    e.dataTransfer.effectAllowed = "move";
    // Use the full accordion row as the drag ghost image.
    const row = (e.currentTarget as HTMLElement).closest("[data-anchor]");
    if (row) e.dataTransfer.setDragImage(row, 24, 20);
  };
  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== sectionId) setDragOverId(sectionId);
  };
  const handleSectionDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragSourceIdRef.current;
    dragSourceIdRef.current = null;
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) return;
    setSectionOrder(prev => {
      const next = [...prev];
      const fromIdx = next.indexOf(sourceId);
      const toIdx = next.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, sourceId);
      return next;
    });
  };
  const handleSectionDragEnd = () => {
    dragSourceIdRef.current = null;
    setDragOverId(null);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = startX.current - e.clientX;
      const next = Math.max(
        NARRATIVE_PANEL_MIN_WIDTH,
        Math.min(NARRATIVE_PANEL_MAX_WIDTH, startWidth.current + delta)
      );
      onResize(next, true);
    };
    const onUp = () => {
      setDragging(false);
      onResize(width, false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging, onResize, width]);

  const beginDrag = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startWidth.current = width;
    setDragging(true);
  };

  return (
    <aside
      aria-hidden={!open}
      className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] flex flex-col ${
        dragging ? "" : "transition-transform duration-500 ease-in-out"
      }`}
      style={{
        width,
        transform: open ? "translateX(0)" : `translateX(${width}px)`,
        zIndex: 60,
      }}
    >
      {open && (
        <div
          onMouseDown={beginDrag}
          aria-label="Resize panel"
          role="separator"
          className="group absolute left-0 top-0 bottom-0 w-2 -translate-x-1/2 cursor-col-resize z-10 flex items-center justify-center"
        >
          <span
            className={`block h-12 w-1 rounded-full transition-colors ${
              dragging ? "bg-blue-500" : "bg-gray-200 group-hover:bg-gray-300"
            }`}
          />
          <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md p-0.5 text-gray-400 pointer-events-none shadow-sm">
            <IconGripVertical size={12} />
          </span>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: "rgba(99,102,241,0.10)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.22)" }}>
            Draft
          </span>
          <IconNotebook size={14} className="text-gray-400 shrink-0" />
          <span className="text-[13.5px] font-semibold text-gray-900 leading-none truncate max-w-[220px]">
            {narrativeMeta?.title ?? content.hero.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Authenticity signal */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.28)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "#059669", fontFamily: "'Open Sans', sans-serif", whiteSpace: "nowrap" }}>
              On track · 74% coverage · FY25
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close panel"
          >
            <IconX size={16} />
          </button>
        </div>
      </header>

      {/* Scroll-linked stepper — vertically centered on the panel edge. Fades
          in once the user scrolls; the active dot expands to reveal its
          section label. Hidden while loading (no sections to anchor yet). */}
      <ScrollStepper
        anchors={anchors}
        activeId={activeAnchor}
        visible={scrolled && loadPhase === "ready"}
        onJump={scrollToAnchor}
      />

      {/* Body — beam lives here so it appears below the "Draft Narrative" header */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {(loadPhase === "reasoning" || loadPhase === "skeleton") && (
          <>
            <div
              aria-hidden
              className="prompt-stroke absolute left-0 right-0 pointer-events-none"
              style={{ top: 0, height: 3, zIndex: 65 }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute overflow-hidden"
              style={{ top: 0, left: 0, right: 0, height: 300, zIndex: 64 }}
            >
              <div
                className="prompt-beam absolute"
                style={{
                  top: 0,
                  left: "50%",
                  width: "min(900px, 200%)",
                  height: 240,
                  transform: "translateX(-50%)",
                  borderRadius: "50%",
                }}
              />
            </div>
          </>
        )}

        <div ref={bodyRef} className="flex-1 overflow-y-auto scrollbar-auto-hide">
        {loadPhase === "reasoning" ? (
          <NarrativeReasoning flow={flow} guidedSkeleton={guidedSkeleton ?? undefined} />
        ) : loadPhase === "skeleton" ? (
          <NarrativeLoading guided={!!guidedSkeleton} />
        ) : (
        <div className="px-6 py-6 flex flex-col gap-6">
          {/* Overview — audience, read time, tonality (donor narrative only) */}
          {narrativeVariant === "donor-priorities" && narrativeMeta && (narrativeMeta.audience || narrativeMeta.readTime || narrativeMeta.tonality) && (
            <div
              className="narrative-content-enter rounded-xl"
              style={{
                background: "linear-gradient(150deg, rgba(8,15,30,0.97) 0%, rgba(12,22,44,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "14px 18px",
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                Overview
              </p>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" as const }}>
                {narrativeMeta.audience && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)" }}>Audience</span>
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)", fontFamily: "'Open Sans', sans-serif" }}>{narrativeMeta.audience}</span>
                  </div>
                )}
                {narrativeMeta.readTime && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)" }}>Read Time</span>
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)", fontFamily: "'Open Sans', sans-serif" }}>{narrativeMeta.readTime}</span>
                  </div>
                )}
                {narrativeMeta.tonality && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.28)" }}>Tonality</span>
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)", fontFamily: "'Open Sans', sans-serif" }}>{narrativeMeta.tonality}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Narrative Strength — results variant only */}
          {narrativeVariant !== "donor-priorities" && (
            <NarrativeStrengthPanel scores={adjustedScores} />
          )}

          {/* Accordions — each cascades in after the hero lands. The
              Country Examples section gets a Geography block (WorldMap +
              region tiles) rendered above its chart, plus a list of
              named country case-study blocks below. */}
          <section className="flex flex-col -mx-5">
            {orderedSections.map((s, i) => (
              <Accordion
                key={s.id}
                section={s}
                open={openSections.has(s.id)}
                onToggle={() => toggleSection(s.id)}
                enterDelay={`${260 + i * 70}ms`}
                sectionVisuals={addedVisuals.filter(v => v.section === s.title)}
                onRemoveVisual={onRemoveVisual}
                onAddVisual={
                  onAddVisual
                    ? (type) =>
                        onAddVisual({
                          id: `${type}-${Date.now()}`,
                          type,
                          section: s.title,
                        })
                    : undefined
                }
                chartRemoved={removedCharts.has(s.id)}
                onRemoveChart={() => removeChart(s.id)}
                isDragOver={dragOverId === s.id}
                isModifying={modifyingSectionId === s.id}
                bodyOverride={sectionBodyOverrides[s.id]}
                onDragStart={(e) => handleSectionDragStart(e, s.id)}
                onDragOver={(e) => handleSectionDragOver(e, s.id)}
                onDragLeave={() => setDragOverId(null)}
                onDragEnd={handleSectionDragEnd}
                onDrop={(e) => handleSectionDrop(e, s.id)}
                showQuality={narrativeVariant !== "donor-priorities"}
                geography={
                  s.id === "impact" && s.countryStories && s.countryStories.length > 0
                    ? <ImpactWorldMap stories={s.countryStories} />
                    : undefined
                }
              />
            ))}
          </section>

          {/* Methodology footer */}
          <MethodologyFootnote title={methodology.title} href={methodology.href} />
        </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <NarrativeFooter
        onGenerate={onGenerate}
        generatedKinds={generatedKinds}
        onPreview={() => { setPreviewOpen(true); onPreview?.(); }}
      />

      {/* Preview modal */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        sections={orderedSections}
        hero={hero}
        narrativeMeta={narrativeMeta}
        tab={previewTab}
        onTabChange={setPreviewTab}
      />

      {/* Selection-driven contextual menu. Rendered via portal so that
          position:fixed works relative to the viewport — the aside's
          transform would otherwise create a new containing block. */}
      {selectionAnchor && typeof document !== "undefined" && createPortal(
        <div
          role="menu"
          style={{
            position: "fixed",
            top: selectionAnchor.top,
            left: selectionAnchor.left,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
          }}
          className="pointer-events-auto"
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onModifyContent?.({ text: selectionAnchor.text, sectionId: selectionAnchor.sectionId });
              setSelectionAnchor(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white text-[12px] font-medium shadow-lg ring-1 ring-black/10 hover:bg-gray-800 transition-colors"
          >
            <IconSparkles size={12} />
            Modify content
          </button>
        </div>,
        document.body
      )}
    </aside>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  sections: Section[];
  hero: Hero;
  narrativeMeta?: { title?: string; audience?: string; readTime?: string; tonality?: string };
  tab: "document" | "slides" | "infographic";
  onTabChange: (t: "document" | "slides" | "infographic") => void;
}

const PREVIEW_TABS: { id: "document" | "slides" | "infographic"; label: string }[] = [
  { id: "document",    label: "Document" },
  { id: "slides",      label: "Slides" },
  { id: "infographic", label: "Infographic" },
];

function PreviewModal({ open, onClose, sections, hero, narrativeMeta, tab, onTabChange }: PreviewModalProps) {
  if (!open) return null;
  const docTitle = narrativeMeta?.title ?? hero.title;
  const docAudience = narrativeMeta?.audience ?? "IDA Senior Management";
  const F = "'Open Sans', sans-serif";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(92vw, 1020px)", height: "min(90vh, 780px)",
          borderRadius: 18, overflow: "hidden",
          display: "flex", flexDirection: "column",
          background: "#0D1B26",
          boxShadow: "0 32px 80px rgba(0,0,0,0.70)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {PREVIEW_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                style={{
                  padding: "5px 14px", borderRadius: 100,
                  fontSize: 12.5, fontWeight: tab === t.id ? 600 : 500,
                  fontFamily: F, cursor: "pointer",
                  border: tab === t.id ? "1px solid rgba(255,255,255,0.22)" : "1px solid transparent",
                  background: tab === t.id ? "rgba(255,255,255,0.10)" : "transparent",
                  color: tab === t.id ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
                  transition: "all 120ms",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 8, cursor: "pointer",
              color: "rgba(255,255,255,0.55)", fontSize: 18, lineHeight: 1,
              padding: "4px 10px", fontFamily: F,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

          {/* ── Document view ─────────────────────────────── */}
          {tab === "document" && (
            <div style={{
              maxWidth: 680, margin: "0 auto", padding: "48px 40px 64px",
              background: "#fff", minHeight: "100%",
            }}>
              {/* Letterhead */}
              <div style={{ borderBottom: "2px solid #1a3a5c", paddingBottom: 20, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#1a3a5c", fontFamily: F, marginBottom: 6 }}>
                      World Bank Group · IDA Results Narrative
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0D1B26", fontFamily: F, lineHeight: 1.25 }}>
                      {docTitle}
                    </h1>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: 24 }}>
                    <div style={{ fontSize: 10, color: "#6b7280", fontFamily: F }}>{docAudience}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", fontFamily: F }}>FY25 · {narrativeMeta?.readTime ?? "~3 min"}</div>
                  </div>
                </div>
              </div>

              {/* Hero intro */}
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "#374151", fontFamily: F, margin: "0 0 32px" }}>
                {hero.intro}
              </p>

              {/* Key stat */}
              <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "14px 18px", marginBottom: 32, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8", fontFamily: F, lineHeight: 1 }}>{hero.metric.value}</div>
                <div>
                  <div style={{ fontSize: 11.5, color: "#1e40af", fontFamily: F, lineHeight: 1.45 }}>{hero.metric.caption}</div>
                  <div style={{ fontSize: 10, color: "#93c5fd", fontFamily: F }}>{hero.metric.code}</div>
                </div>
              </div>

              {/* Sections */}
              {sections.map((s, i) => (
                <div key={s.id} style={{ marginBottom: 28 }}>
                  <h2 style={{
                    margin: "0 0 10px", fontSize: 14, fontWeight: 700,
                    color: "#1a3a5c", fontFamily: F, textTransform: "uppercase",
                    letterSpacing: "0.06em", borderBottom: "1px solid #e5e7eb",
                    paddingBottom: 6,
                  }}>
                    {`${i + 1}. ${s.title}`}
                  </h2>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.75, color: "#374151", fontFamily: F }}>
                    {s.paragraphs?.[0] ?? s.body}
                  </p>
                  {s.paragraphs && s.paragraphs.length > 1 && (
                    <p style={{ margin: "10px 0 0", fontSize: 12.5, lineHeight: 1.75, color: "#374151", fontFamily: F }}>
                      {s.paragraphs[1]}
                    </p>
                  )}
                  {s.bullets && s.bullets.length > 0 && (
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                      {s.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontSize: 12, color: "#374151", fontFamily: F, lineHeight: 1.6, marginBottom: 4 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {s.lessons && s.lessons.length > 0 && (
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                      {s.lessons.map((l, li) => (
                        <li key={li} style={{ fontSize: 12, color: "#374151", fontFamily: F, lineHeight: 1.65, marginBottom: 6 }}>
                          <strong>{l.lead}</strong> {l.body}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.countryStories && s.countryStories.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      {s.countryStories.map((cs, ci) => (
                        <div key={ci} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a3a5c", fontFamily: F, marginBottom: 3 }}>{cs.flag} {cs.name}</div>
                          <p style={{ margin: 0, fontSize: 11.5, color: "#374151", fontFamily: F, lineHeight: 1.6 }}>{cs.body}</p>
                          {cs.result && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#059669", fontFamily: F, fontWeight: 500 }}>→ {cs.result}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Slides view ───────────────────────────────── */}
          {tab === "slides" && (
            <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Title slide */}
              <div style={{
                aspectRatio: "16/9", borderRadius: 10, overflow: "hidden",
                background: "linear-gradient(135deg, #0a2540 0%, #1a3a5c 100%)",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "40px 56px", position: "relative",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: F, marginBottom: 12 }}>
                  World Bank Group · IDA Results Narrative
                </div>
                <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: F, lineHeight: 1.2, maxWidth: "70%" }}>
                  {docTitle}
                </h1>
                <div style={{ display: "flex", gap: 20 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: F }}>{docAudience}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: F }}>·</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: F }}>FY25</span>
                </div>
                {/* WBG accent bar */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #0F766E, #0288D1, #7C3AED)" }} />
                {/* Slide number */}
                <div style={{ position: "absolute", bottom: 16, right: 24, fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: F }}>1 / {sections.length + 1}</div>
              </div>

              {/* One slide per section */}
              {sections.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    aspectRatio: "16/9", borderRadius: 10, overflow: "hidden",
                    background: "#0a1929",
                    display: "flex", flexDirection: "column",
                    border: "1px solid rgba(255,255,255,0.08)",
                    position: "relative",
                  }}
                >
                  {/* Slide header */}
                  <div style={{
                    padding: "22px 36px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0288D1", fontFamily: F, marginBottom: 5 }}>
                      {`Section ${i + 1}`}
                    </div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.95)", fontFamily: F }}>
                      {s.title}
                    </h2>
                  </div>

                  {/* Slide body */}
                  <div style={{ flex: 1, padding: "16px 36px 22px", overflow: "hidden", display: "flex", gap: 28 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", fontFamily: F, display: "-webkit-box", WebkitLineClamp: 7, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.paragraphs?.[0] ?? s.body}
                      </p>
                      {s.bullets && s.bullets.slice(0, 3).map((b, bi) => (
                        <div key={bi} style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-start" }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#0288D1", flexShrink: 0, marginTop: 6 }} />
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.62)", fontFamily: F, lineHeight: 1.55 }}>{b}</span>
                        </div>
                      ))}
                      {s.lessons && s.lessons.slice(0, 2).map((l, li) => (
                        <div key={li} style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: F }}>{l.lead} </span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: F }}>{l.body.slice(0, 120)}{l.body.length > 120 ? "…" : ""}</span>
                        </div>
                      ))}
                    </div>

                    {/* Country stories sidebar */}
                    {s.countryStories && s.countryStories.length > 0 && (
                      <div style={{ width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        {s.countryStories.slice(0, 2).map((cs, ci) => (
                          <div key={ci} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "8px 10px" }}>
                            <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: F }}>{cs.flag} {cs.name}</div>
                            {cs.result && <div style={{ fontSize: 10, color: "#34D399", fontFamily: F, marginTop: 3 }}>→ {cs.result}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* WBG accent bar */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0F766E, #0288D1, #7C3AED)" }} />
                  {/* Slide number */}
                  <div style={{ position: "absolute", bottom: 10, right: 18, fontSize: 9.5, color: "rgba(255,255,255,0.20)", fontFamily: F }}>{i + 2} / {sections.length + 1}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Infographic view ──────────────────────────── */}
          {tab === "infographic" && (
            <div style={{ padding: "28px 32px", fontFamily: F }}>
              {/* Title band */}
              <div style={{
                background: "linear-gradient(135deg, #0a2540, #1a3a5c)",
                borderRadius: 12, padding: "24px 32px", marginBottom: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 6 }}>
                    WBG · IDA FY25
                  </div>
                  <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>{docTitle}</h1>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", marginTop: 4 }}>{docAudience}</div>
                </div>
                <div style={{ textAlign: "center", padding: "12px 20px", background: "rgba(2,136,209,0.15)", borderRadius: 10, border: "1px solid rgba(2,136,209,0.30)" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#38BDF8", lineHeight: 1 }}>{hero.metric.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.52)", marginTop: 4, maxWidth: 140, textAlign: "center" }}>{hero.metric.caption}</div>
                </div>
              </div>

              {/* Section cards grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {sections.map((s, i) => {
                  const accentColors = ["#0288D1","#34D399","#818CF8","#F59E0B","#F87171"];
                  const accent = accentColors[i % accentColors.length];
                  const bodyText = s.paragraphs?.[0] ?? s.body;
                  return (
                    <div key={s.id} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${accent}28`,
                      borderTop: `3px solid ${accent}`,
                      borderRadius: 10, padding: "16px 18px",
                    }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>
                        {`0${i + 1}`}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.90)", marginBottom: 8, lineHeight: 1.3 }}>
                        {s.title}
                      </div>
                      <p style={{ margin: 0, fontSize: 11, lineHeight: 1.65, color: "rgba(255,255,255,0.55)", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {bodyText}
                      </p>
                      {s.keyResults && s.keyResults.length > 0 && (
                        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                          {s.keyResults.slice(0, 2).map((kr, ki) => (
                            <div key={ki} style={{ background: `${accent}15`, borderRadius: 6, padding: "6px 10px", flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: accent, lineHeight: 1 }}>{kr.value}</div>
                              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>{kr.consequence.slice(0, 40)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {s.countryStories && s.countryStories.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {s.countryStories.map((cs, ci) => (
                            <span key={ci} style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "2px 7px" }}>
                              {cs.flag} {cs.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Footer with Generate menu ───────────────────────────────────────────────

const GENERATE_OPTIONS = [
  { id: "pdf",         label: "PDF",             desc: "Print-ready narrative document",  icon: IconFileTypePdf },
  { id: "word",        label: "Word document",    desc: "Long-form narrative document",    icon: IconFileTypeDoc },
  { id: "slides",      label: "Slides",           desc: "Editable slides for briefings",   icon: IconPresentationAnalytics },
  { id: "infographic", label: "Infographic",      desc: "Single-page visual summary",      icon: IconInfographic },
] as const;

function NarrativeFooter({
  onGenerate,
  generatedKinds = [],
  onPreview,
}: {
  onGenerate?: (kind: string) => void;
  generatedKinds?: string[];
  onPreview?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const pick = (id: string) => { setOpen(false); onGenerate?.(id); };

  return (
    <footer className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50">
      <div ref={ref} className="relative flex items-center gap-2">
        {/* Preview — secondary */}
        <button
          onClick={onPreview}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <IconEye size={14} />
          Preview
        </button>
        {/* Generate — primary, grows to fill remaining space */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <IconWand size={14} />
          Generate
          {open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 right-0 bottom-[calc(100%+8px)] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-10"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Generate as
              </span>
            </div>
            <ul>
              {GENERATE_OPTIONS.map((o, i) => {
                const Icon = o.icon;
                const generated = generatedKinds.includes(o.id);
                return (
                  <li key={o.id}>
                    <button
                      role="menuitem"
                      onClick={() => pick(o.id)}
                      className={`w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors ${
                        i < GENERATE_OPTIONS.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        generated ? "bg-emerald-50" : "bg-blue-50"
                      }`}>
                        <Icon size={14} className={generated ? "text-emerald-600" : "text-blue-600"} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-900">
                          {o.label}
                          {generated && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Generated
                            </span>
                          )}
                        </span>
                        <span className="block text-[10.5px] text-gray-500 mt-0.5">
                          {generated ? "Click to regenerate (replaces existing)" : o.desc}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

    </footer>
  );
}

