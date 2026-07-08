
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconX,
  IconChartBar,
  IconGripVertical,
  IconDownload,
  IconWand,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  NARRATIVE_PANEL_MIN_WIDTH,
  NARRATIVE_PANEL_MAX_WIDTH,
} from "./NarrativePanel";

interface Props {
  open: boolean;
  prompt: string;
  onClose: () => void;
  onOpenNarrative?: () => void;
  onPreviewAsViewer?: () => void;
  width: number;
  onResize: (width: number, dragging: boolean) => void;
  loading?: boolean;
}

// ─── Flow detection ───────────────────────────────────────────────────────────

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

// ─── Visual primitives ────────────────────────────────────────────────────────

function MiniBar({ name, pct, color }: { name: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] text-gray-500 w-[90px] shrink-0 truncate leading-tight">{name}</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[9px] font-semibold tabular-nums shrink-0 w-6 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

function PosterHeader({
  title,
  subtitle,
  source,
}: {
  title: string;
  subtitle: string;
  source: string;
}) {
  return (
    <div
      style={{ background: "#003F6B" }}
      className="px-6 py-5 text-white shrink-0"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h1 className="text-[19px] font-bold leading-tight flex-1">{title}</h1>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white/45 shrink-0 pt-0.5">
          Source: {source}
        </span>
      </div>
      <p className="text-[11.5px] text-white/70 leading-snug">{subtitle}</p>
    </div>
  );
}

function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2 className={`text-[9.5px] font-bold uppercase tracking-widest mb-2.5 ${light ? "text-white/40" : "text-gray-400"}`}>
      {children}
    </h2>
  );
}

function ContextKPI({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
      <div className="flex items-start gap-2">
        <span className="w-[3px] self-stretch rounded-sm shrink-0" style={{ background: accent }} />
        <span className="text-[16px] font-bold text-gray-900 leading-tight">{value}</span>
      </div>
      <span className="text-[10px] text-gray-500 leading-snug pl-2.5">{label}</span>
    </div>
  );
}

function TealCallout({ lines }: { lines: string[] }) {
  return (
    <div
      style={{ background: "#007BA4" }}
      className="px-5 py-4 text-white text-center"
    >
      {lines.map((l, i) => (
        <p
          key={i}
          className={`leading-snug ${i === 0 ? "text-[12px] font-bold" : "text-[11px] text-white/85 mt-1"}`}
        >
          {l}
        </p>
      ))}
    </div>
  );
}

function PosterFooter({ caption }: { caption: string }) {
  return (
    <div className="px-5 py-2.5 bg-gray-800">
      <p className="text-[9px] text-gray-400 text-center tracking-wide">{caption}</p>
    </div>
  );
}

// ─── Africa Poverty Poster ────────────────────────────────────────────────────

const AFRICA_REGIONS = [
  { name: "AFE  Africa East",          pct: 97, color: "#2E8B57" },
  { name: "AFW  Africa West",          pct: 86, color: "#00A0DF" },
  { name: "SAR  South Asia",           pct: 93, color: "#E88B2B" },
  { name: "EAP  East Asia & Pacific",  pct: 83, color: "#00A0DF" },
  { name: "ECA  Eur & Central Asia",   pct: 62, color: "#00A0DF" },
  { name: "LCR  Latin America",        pct: 41, color: "#E88B2B" },
  { name: "MENAAP",                    pct: 54, color: "#E88B2B" },
];

const PILLAR_COLORS: Record<string, string> = {
  People:         "#34D399",
  Planet:         "#60A5FA",
  Infrastructure: "#FBBF24",
  Digital:        "#A78BFA",
  Prosperity:     "#F472B6",
};

const AFRICA_PILLARS = [
  { label: "People",         value: "939M", pct: 53 },
  { label: "Planet",         value: "337M", pct: 45 },
  { label: "Infrastructure", value: "215M", pct: 41 },
  { label: "Digital",        value: "217M", pct: 50 },
  { label: "Prosperity",     value: "56M",  pct: 52 },
];

const DEEP_DIVE = [
  { label: "Health Services", achieved: 370, target: 425, pct: 87, color: "#2E8B57" },
  { label: "Safety Nets",     achieved: 325, target: 452, pct: 72, color: "#E88B2B" },
  { label: "Climate",         achieved: 244, target: 425, pct: 37, color: "#D04040" },
];

function AfricaPovertyPoster() {
  return (
    <div className="flex flex-col text-gray-900">
      <PosterHeader
        title="Is IDA Making a Difference?"
        subtitle="FY25 Corporate Scorecard Results — People Living in Extreme Poverty"
        source="WBG Corporate Scorecard"
      />

      {/* Context KPIs */}
      <div className="px-5 pt-4 pb-3 bg-gray-50">
        <SectionLabel>The Context</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <ContextKPI value="30.4%" label="FCS population in extreme poverty" accent="#D04040" />
          <ContextKPI value="70%" label="Learning poverty in LIC primary schools" accent="#E88B2B" />
          <ContextKPI value="56 countries" label="Collecting below 15% tax-to-GDP" accent="#E88B2B" />
        </div>
        <p className="text-[10.5px] text-gray-500 mt-2.5 leading-snug">
          IDA serves ~75 of the world's poorest countries facing debt, climate shocks & service gaps
        </p>
      </div>

      {/* FY25 Global Reach — regional bars */}
      <div className="px-5 py-4 bg-white border-t border-gray-100">
        <SectionLabel>FY25 Global Reach</SectionLabel>
        <div className="flex flex-col gap-2">
          {AFRICA_REGIONS.map((r) => (
            <MiniBar key={r.name} name={r.name} pct={r.pct} color={r.color} />
          ))}
        </div>
      </div>

      {/* Pillar breakdown — dark card */}
      <div style={{ background: "#002342" }} className="px-5 py-4">
        <SectionLabel light>FY25 Delivery by Pillar</SectionLabel>
        <div className="grid grid-cols-5 gap-2">
          {AFRICA_PILLARS.map((p) => {
            const color = PILLAR_COLORS[p.label] ?? "#60A5FA";
            return (
              <div
                key={p.label}
                className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-1"
                style={{ background: "rgba(255,255,255,0.09)" }}
              >
                <span className="text-[13px] font-bold text-white leading-none">{p.value}</span>
                <span
                  className="text-[7.5px] uppercase tracking-wide text-center leading-tight"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {p.label}
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color }} className="leading-none">{p.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement deep-dive — simple bars */}
      <div className="px-5 py-4 bg-white border-t border-gray-100">
        <SectionLabel>Achievement Pillar Deep Dive</SectionLabel>
        <div className="flex flex-col gap-4">
          {DEEP_DIVE.map((d) => (
            <div key={d.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[11px] text-gray-700 font-medium">{d.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12px] font-bold" style={{ color: d.color }}>{d.pct}%</span>
                  <span className="text-[9.5px] text-gray-400">{d.achieved}M / {d.target}M</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <TealCallout
        lines={[
          "FCS countries: 2.3× more health coverage per dollar than non-FCS IDA peers",
          "Infrastructure (41%) and Planet (45%) are the next funding-cycle priorities",
        ]}
      />
      <PosterFooter caption="WBG Corporate Scorecard · FY25 · Time Period: 2025-06-30 · Org Code: WBG" />
    </div>
  );
}

// ─── Health Gap Poster ────────────────────────────────────────────────────────

const HNP_REGIONS = [
  { name: "SAR  South Asia",          pct: 89, color: "#00A0DF" },
  { name: "AFW  Africa West",         pct: 64, color: "#003F6B" },
  { name: "ECA  Eur & Central Asia",  pct: 74, color: "#00A0DF" },
  { name: "LCR  Latin America",       pct: 72, color: "#00A0DF" },
  { name: "South Sudan",              pct: 25, color: "#D04040" },
  { name: "MENAAP (Yemen)",           pct: 12, color: "#D04040" },
];

const HNP_PROGRAMS = [
  { label: "Maternal & child health", achieved: 110, target: 148, pct: 74, color: "#60A5FA"  },
  { label: "Disease surveillance",    achieved:  62, target:  90, pct: 69, color: "#A78BFA"  },
  { label: "Nutrition programs",      achieved:  78, target: 115, pct: 68, color: "#FBBF24"  },
  { label: "Primary care expansion",  achieved:  88, target: 225, pct: 39, color: "#F97316"  },
  { label: "Health workforce",        achieved:  65, target: 320, pct: 20, color: "#F87171"  },
];

const HNP_MIX = [
  { name: "Supply chain",   value: 38, color: "#003F6B" },
  { name: "Workforce gap",  value: 27, color: "#E88B2B" },
  { name: "Displacement",   value: 18, color: "#7EC8E3" },
  { name: "Funding lag",    value: 10, color: "#9CA3AF" },
  { name: "Reporting",      value:  7, color: "#D1D5DB" },
];

function HealthGapPoster() {
  return (
    <div className="flex flex-col text-gray-900">
      <PosterHeader
        title="FCS Health Services: Who's Furthest Behind & Why?"
        subtitle="FY25 Corporate Scorecard — IDA Fragility-Affected States"
        source="WBG Corporate Scorecard"
      />

      {/* Context */}
      <div className="px-5 pt-4 pb-3 bg-gray-50">
        <SectionLabel>The Context</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <ContextKPI value="32/100" label="UHC Service Coverage Index (vs LIC avg 49)" accent="#003F6B" />
          <ContextKPI value="33.6%" label="Stunting prevalence in FCS under-5s" accent="#E88B2B" />
          <ContextKPI value="0.8/1k" label="Health workers in FCS (WHO threshold: 4.45)" accent="#D04040" />
        </div>
        <p className="text-[10.5px] text-gray-500 mt-2.5 leading-snug">
          UHC coverage in FCS countries has been roughly flat for 5 years while the LIC average has nudged up
        </p>
      </div>

      {/* Dark alert banner */}
      <div style={{ background: "#003F6B" }} className="px-5 py-3">
        <p className="text-[11px] font-semibold text-white text-center leading-snug">
          All below 50% of FY25 plan — collectively ~37% of global pipeline shortfall
        </p>
      </div>

      {/* FY25 HNP — regional bars */}
      <div className="px-5 py-4 bg-white">
        <SectionLabel>FY25 Global HNP Reach (FCS Lens)</SectionLabel>
        <div className="flex flex-col gap-2">
          {HNP_REGIONS.map((r) => (
            <MiniBar key={r.name} name={r.name} pct={r.pct} color={r.color} />
          ))}
        </div>
      </div>

      {/* Bottom 5 — simple bars + donut */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <SectionLabel>Bottom 5: Driving the Furthest Gap</SectionLabel>
        <div className="flex gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-3.5">
            {HNP_PROGRAMS.map((p) => (
              <div key={p.label}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] text-gray-600">{p.label}</span>
                  <span className="text-[10px] font-semibold" style={{ color: p.color }}>{p.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* HNP mix donut */}
          <div className="shrink-0 w-[120px] flex flex-col items-center gap-2">
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-gray-400 text-center">
              FY25 HNP<br/>Delivery Mix
            </span>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={HNP_MIX}
                    cx="50%"
                    cy="50%"
                    innerRadius="44%"
                    outerRadius="80%"
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {HNP_MIX.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full flex flex-col gap-1">
              {HNP_MIX.map((d) => (
                <li key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                  <span className="text-[8.5px] text-gray-600 leading-tight flex-1 truncate">{d.name}</span>
                  <span className="text-[8.5px] font-bold shrink-0" style={{ color: d.color }}>{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <TealCallout
        lines={["Highest-leverage FY26 lever: Workforce + Supply Chain Remediation in 5 Conflict States"]}
      />
      <PosterFooter caption="WBG Corporate Scorecard · FCS Lens · FY25 · Source: Health Services results" />
    </div>
  );
}

// ─── Public body export ───────────────────────────────────────────────────────

export function InfographicBody({ prompt }: { prompt: string }) {
  const flow = useMemo(() => detectFlow(prompt), [prompt]);
  return flow === "health-gap" ? <HealthGapPoster /> : <AfricaPovertyPoster />;
}

// ─── Loading state ────────────────────────────────────────────────────────────

const INSIGHT_LOADING_STAGES = ["Generating", "Illustrating", "Composing visual story", "Polishing layout", "Finalizing"];

function InfographicLoading() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % INSIGHT_LOADING_STAGES.length), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full overflow-hidden flex flex-col items-center justify-center" aria-busy="true">
      <div aria-hidden className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 360 }}>
        <div className="prompt-beam absolute" style={{ top: -60, left: "50%", width: "min(900px, 130%)", height: 280, transform: "translateX(-50%)", borderRadius: "50%" }} />
      </div>
      <div aria-hidden className="prompt-stroke absolute top-0 left-0 right-0" style={{ height: 2 }} />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 -mt-20">
        <div className="w-14 h-14 rounded-full bg-white/85 backdrop-blur-sm border border-emerald-200 flex items-center justify-center shadow-sm">
          <IconWand size={22} className="text-emerald-600 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">FY25 Infographic</div>
          <div key={stage} className="text-[18px] font-semibold text-gray-900 transition-opacity duration-300" style={{ animation: "narrative-content-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
            {INSIGHT_LOADING_STAGES[stage]}<span className="inline-block w-1 ml-0.5 stream-cursor">·</span>
          </div>
          <div className="text-[11.5px] text-gray-500">Building your single-page summary</div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          {INSIGHT_LOADING_STAGES.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === stage ? "w-6 bg-emerald-500" : i < stage ? "w-1.5 bg-emerald-400" : "w-1.5 bg-gray-200"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function InfographicPanel({ open, prompt, onClose, onOpenNarrative, onPreviewAsViewer, width, onResize, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const flow = useMemo(() => detectFlow(prompt), [prompt]);

  const kicker = "FY25 INSIGHTOGRAPHIC";
  const title = flow === "health-gap" ? "Health-Services Delivery Gap" : "IDA Cross-Pillar Reach";

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = startX.current - e.clientX;
      const next = Math.max(NARRATIVE_PANEL_MIN_WIDTH, Math.min(NARRATIVE_PANEL_MAX_WIDTH, startWidth.current + delta));
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
      className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] flex flex-col ${dragging ? "" : "transition-transform duration-500 ease-in-out"}`}
      style={{ width, transform: open ? "translateX(0)" : `translateX(${width}px)`, zIndex: 60 }}
    >
      {open && (
        <div onMouseDown={beginDrag} role="separator" aria-label="Resize panel" className="group absolute left-0 top-0 bottom-0 w-2 -translate-x-1/2 cursor-col-resize z-10 flex items-center justify-center">
          <span className={`block h-12 w-1 rounded-full transition-colors ${dragging ? "bg-blue-500" : "bg-gray-200 group-hover:bg-gray-300"}`} />
          <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md p-0.5 text-gray-400 pointer-events-none shadow-sm">
            <IconGripVertical size={12} />
          </span>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
            <IconChartBar size={15} className="text-emerald-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">{kicker}</span>
            <span className="text-[14px] font-semibold text-gray-900 leading-none truncate">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button title="Download PNG" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <IconDownload size={16} />
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500" aria-label="Close panel">
            <IconX size={16} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-auto-hide">
        {loading ? <InfographicLoading /> : <InfographicBody prompt={prompt} />}
      </div>

      {/* Footer */}
      <footer className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50">
        <button onClick={onPreviewAsViewer} className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          Publish
        </button>
      </footer>
    </aside>
  );
}
