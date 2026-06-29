import { useState } from "react";
import type { NodeProps } from "reactflow";
import {
  IconThumbUp,
  IconThumbDown,
  IconPlus,
  IconArrowBarRight,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

const F = "'Open Sans', sans-serif";
const BLUE = "#086ED3";
const BLUE_LIGHT = "#E3F0FC";

// ─── Chart 1: Social Protection Coverage — dumbbell/range SVG ─────────────────

function SocialProtectionChart() {
  const rows = [
    {
      label: "Total\npopulation",
      mx: 48.2,
      peers: [
        { label: "CO", val: 55.2 },
        { label: "PE", val: 62.8 },
        { label: "BR", val: 73.7 },
        { label: "CL", val: 85.8 },
      ],
    },
    {
      label: "Poorest\nquintile",
      mx: 53.9,
      peers: [
        { label: "CO", val: 54.0 },
        { label: "BR", val: 83.2 },
        { label: "PE", val: 95.5 },
        { label: "CL", val: 95.8 },
      ],
    },
  ];

  const ticks = [40, 50, 60, 70, 80, 90, 100];
  const minVal = 40;
  const maxVal = 100;
  const chartW = 580;
  const rowH = 80;
  const leftPad = 90;
  const rightPad = 20;
  const trackW = chartW - leftPad - rightPad;
  const toX = (v: number) => leftPad + ((v - minVal) / (maxVal - minVal)) * trackW;
  const svgH = rows.length * rowH + 30;

  return (
    <svg width="100%" viewBox={`0 0 ${chartW} ${svgH}`} style={{ fontFamily: F }}>
      {/* Tick lines + axis labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={toX(t)} y1={0} x2={toX(t)} y2={svgH - 24}
            stroke="#E5E5E5" strokeWidth={1}
          />
          <text x={toX(t)} y={svgH - 8} textAnchor="middle" fontSize={11} fill="#9E9E9E">
            {t}
          </text>
        </g>
      ))}

      {rows.map((row, ri) => {
        const cy = ri * rowH + 44;
        const peerMax = Math.max(...row.peers.map((p) => p.val));
        const topPeer = row.peers.find((p) => p.val === peerMax)!;

        return (
          <g key={row.label}>
            {/* Row label */}
            {row.label.split("\n").map((line, li) => (
              <text key={li} x={leftPad - 8} y={cy + li * 14 - 4} textAnchor="end" fontSize={11} fill="#616161">
                {line}
              </text>
            ))}

            {/* Track line from MX to highest peer */}
            <line
              x1={toX(row.mx)} y1={cy} x2={toX(peerMax)} y2={cy}
              stroke="#CBD5E1" strokeWidth={2}
            />

            {/* Intermediate peer marks */}
            {row.peers.filter((p) => p.val !== peerMax).map((p) => (
              <g key={p.label}>
                <rect
                  x={toX(p.val) - 5} y={cy - 5}
                  width={10} height={10}
                  fill="#94A3B8" rx={2}
                />
                <text x={toX(p.val)} y={cy - 10} textAnchor="middle" fontSize={10} fill="#94A3B8">
                  {p.label} {p.val}
                </text>
              </g>
            ))}

            {/* Mexico dot (lowest) */}
            <circle cx={toX(row.mx)} cy={cy} r={7} fill="#1E293B" />
            <text x={toX(row.mx)} y={cy + 18} textAnchor="middle" fontSize={10} fill="#1E293B" fontWeight={600}>
              MX {row.mx}
            </text>

            {/* Top peer (triangle/arrow shape) */}
            <polygon
              points={`${toX(peerMax) - 6},${cy - 7} ${toX(peerMax) + 6},${cy - 7} ${toX(peerMax)},${cy + 6}`}
              fill={BLUE}
            />
            <text x={toX(peerMax)} y={cy - 12} textAnchor="middle" fontSize={10} fill={BLUE} fontWeight={600}>
              {topPeer.label} {topPeer.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Chart 2: Financial Account Ownership — grouped bar ───────────────────────

function FinancialAccountChart() {
  const data = [
    { country: "MX", total: 53, female: 47 },
    { country: "CO", total: 61, female: 55 },
    { country: "PE", total: 73, female: 70 },
    { country: "BR", total: 86, female: 84 },
    { country: "CL", total: 85, female: 84 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }} barGap={2} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
        <XAxis dataKey="country" tick={{ fontSize: 11, fontFamily: F, fill: "#616161" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: F, fill: "#9E9E9E" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ fontFamily: F, fontSize: 12, border: "1px solid #E5E5E5", borderRadius: 6 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [`${v}%`, name === "total" ? "Total (15+)" : "Female"]}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: F }} formatter={(v) => v === "total" ? "Total (15+)" : "Female"} />
        <Bar dataKey="total" fill={BLUE} radius={[3, 3, 0, 0]} />
        <Bar dataKey="female" fill="#68C5EA" radius={[3, 3, 0, 0]} />
        <ReferenceLine y={53} stroke="#EF4444" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "MX 53%", position: "insideTopLeft", fontSize: 10, fill: "#EF4444" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Chart 3: Safety Net Coverage — horizontal bar ────────────────────────────

function SafetyNetChart() {
  const data = [
    { country: "Chile",    total: 96, poorest: 96 },
    { country: "Peru",     total: 96, poorest: 95 },
    { country: "Brazil",   total: 92, poorest: 88 },
    { country: "Colombia", total: 75, poorest: 64 },
    { country: "Mexico",   total: 48, poorest: 54 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 52, bottom: 4 }} barGap={2} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: F, fill: "#9E9E9E" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fontFamily: F, fill: "#616161" }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          contentStyle={{ fontFamily: F, fontSize: 12, border: "1px solid #E5E5E5", borderRadius: 6 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [`${v}%`, name === "total" ? "Total pop." : "Poorest quintile"]}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: F }} formatter={(v) => v === "total" ? "Total pop." : "Poorest quintile"} />
        <Bar dataKey="total" fill={BLUE} radius={[0, 3, 3, 0]} />
        <Bar dataKey="poorest" fill="#68C5EA" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Chart 4: Financial Services Users — bar + line ───────────────────────────

function FinancialServicesChart() {
  const data = [
    { country: "MX", accounts: 53, mobile: 17, credit: 28 },
    { country: "CO", accounts: 61, mobile: 21, credit: 29 },
    { country: "PE", accounts: 73, mobile: 33, credit: 43 },
    { country: "BR", accounts: 86, mobile: 49, credit: 51 },
    { country: "CL", accounts: 85, mobile: 44, credit: 60 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
        <XAxis dataKey="country" tick={{ fontSize: 11, fontFamily: F, fill: "#616161" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: F, fill: "#9E9E9E" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ fontFamily: F, fontSize: 12, border: "1px solid #E5E5E5", borderRadius: 6 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [`${v}%`, ({ accounts: "Account ownership", mobile: "Mobile money", credit: "Credit access" } as Record<string, string>)[name] ?? name]}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: F }} formatter={(v) => (({ accounts: "Account ownership", mobile: "Mobile money", credit: "Credit access" } as Record<string, string>)[v] ?? v)} />
        <Bar dataKey="accounts" stackId="a" fill={BLUE} radius={[0, 0, 0, 0]} />
        <Bar dataKey="mobile" stackId="a" fill="#68C5EA" />
        <Bar dataKey="credit" stackId="a" fill="#A5D8F0" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Chart 5: Gender Equality — radar chart ───────────────────────────────────

function GenderEqualityChart() {
  const data = [
    { indicator: "No GBV",     MX: 42, CL: 68, BR: 55 },
    { indicator: "Jobs",       MX: 38, CL: 72, BR: 61 },
    { indicator: "Assets",     MX: 51, CL: 75, BR: 63 },
    { indicator: "Services",   MX: 61, CL: 82, BR: 70 },
    { indicator: "Leadership", MX: 29, CL: 58, BR: 42 },
    { indicator: "Human cap.", MX: 55, CL: 78, BR: 66 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
        <PolarGrid stroke="#E5E5E5" />
        <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 10, fontFamily: F, fill: "#616161" }} />
        <Radar name="Mexico" dataKey="MX" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} strokeWidth={2} />
        <Radar name="Chile" dataKey="CL" stroke={BLUE} fill={BLUE} fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
        <Radar name="Brazil" dataKey="BR" stroke="#68C5EA" fill="#68C5EA" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: F }} />
        <Tooltip contentStyle={{ fontFamily: F, fontSize: 12, border: "1px solid #E5E5E5", borderRadius: 6 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Chart 6: Private Capital Enabled — line chart ───────────────────────────

function PrivateCapitalChart() {
  const data = [
    { year: "FY21", MX: 0.4, CL: 1.2, BR: 3.8, PE: 0.9 },
    { year: "FY22", MX: 0.3, CL: 1.5, BR: 4.1, PE: 1.1 },
    { year: "FY23", MX: 0.5, CL: 1.8, BR: 4.6, PE: 1.3 },
    { year: "FY24", MX: 0.6, CL: 2.1, BR: 5.2, PE: 1.4 },
    { year: "FY25", MX: 0.7, CL: 2.4, BR: 5.8, PE: 1.6 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: F, fill: "#616161" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fontFamily: F, fill: "#9E9E9E" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} />
        <Tooltip
          contentStyle={{ fontFamily: F, fontSize: 12, border: "1px solid #E5E5E5", borderRadius: 6 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`$${v}B`]}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: F }} />
        <Line dataKey="MX" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} name="Mexico" />
        <Line dataKey="CL" stroke={BLUE} strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 3" name="Chile" />
        <Line dataKey="BR" stroke="#68C5EA" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 3" name="Brazil" />
        <Line dataKey="PE" stroke="#94A3B8" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 3" name="Peru" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Chart router ─────────────────────────────────────────────────────────────

const CHARTS: Record<string, React.ReactNode> = {
  socialProtection: <SocialProtectionChart />,
  financialAccounts: <FinancialAccountChart />,
  safetyNet: <SafetyNetChart />,
  financialServices: <FinancialServicesChart />,
  genderEquality: <GenderEqualityChart />,
  privateCapital: <PrivateCapitalChart />,
};

// ─── Shared card chrome ───────────────────────────────────────────────────────

interface DataCardData {
  label?: string;
  title: string;
  achieved?: string;
  expected?: string;
  portfolioText?: string;
  description: string;
  resultsTag?: string;
  unit?: string;
  category: string;
  chartType: keyof typeof CHARTS;
  streamDelay?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataCard({ data, selected }: NodeProps<any>) {
  const {
    label = "DATA",
    title,
    achieved = "--",
    expected = "--",
    portfolioText,
    description,
    unit = "People",
    category,
    chartType,
    connector,
    viewMode = false,
    playMode = false,
  } = data as DataCardData & { connector?: string; viewMode?: boolean; playMode?: boolean };

  const chart = CHARTS[chartType];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card-enter"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: playMode ? "100%" : 710,
        background: "#FFFFFF",
        border: playMode ? "none" : selected ? "1px solid #0b6fd3" : hovered ? "1px solid #BDBDBD" : "1px solid #E5E5E5",
        borderRadius: playMode ? 0 : 8,
        boxShadow: playMode ? "none" : selected ? "0px 0px 0px 3px rgba(11,111,211,0.12)" : hovered ? "0px 4px 12px rgba(0,0,0,0.08)" : "0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -1px rgba(0,0,0,0.03)",
        padding: 25,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: F,
        cursor: playMode ? "default" : "grab",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {/* Label + Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, color: "#9E9E9E", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.4" }}>
          {label}
        </span>
        <span
          style={{ fontSize: 20, fontWeight: 600, color: "#000", lineHeight: "1.4" }}
        >
          {title}
        </span>

        {/* Active Portfolio Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(0,13,26,0.7)", lineHeight: "24px" }}>
            Active Portfolio Results
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(0,13,26,0.7)", lineHeight: "24px" }}>
              {achieved}&nbsp;<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(0,13,26,0.57)" }}>Achieved</span>
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(0,13,26,0.7)", lineHeight: "24px" }}>
              {expected}&nbsp;<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(0,13,26,0.57)" }}>Expected</span>
            </span>
          </div>
        </div>

        {/* Portfolio summary */}
        {portfolioText && (
          <p style={{ margin: 0, fontSize: 16, color: "rgba(0,13,26,0.57)", lineHeight: "24px" }}
            dangerouslySetInnerHTML={{ __html: portfolioText }}
          />
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#E5E5E5", width: "100%", flexShrink: 0 }} />

      {/* Description */}
      <p
        style={{ margin: 0, fontSize: 16, color: "rgba(0,13,26,0.57)", lineHeight: "24px" }}
      >
        {description}
      </p>

      {/* Metadata bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {/* RESULTS tag */}
          <div style={{
            background: "rgba(0,57,107,0.08)",
            padding: "6px 16px",
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(0,13,26,0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.25px",
            lineHeight: "15px",
            whiteSpace: "nowrap",
          }}>
            Results
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 12, background: "rgba(0,57,107,0.16)", margin: "0 12px" }} />

          {/* Unit */}
          <span style={{ fontSize: 12, color: "rgba(0,13,26,0.7)", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            {unit}
          </span>

          {/* Divider */}
          <div style={{ width: 1, height: 12, background: "rgba(0,57,107,0.16)", margin: "0 12px" }} />

          {/* Category */}
          <span style={{ fontSize: 12, color: "rgba(0,13,26,0.57)", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            {category}
          </span>
        </div>

        {/* Data/Methods button */}
        <button
          style={{
            background: "none",
            border: "none",
            padding: "1px 5px 1px 1px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: BLUE, letterSpacing: "0.5px", lineHeight: "21px" }}>
            Data/Methods
          </span>
          <div style={{
            width: 32,
            height: 32,
            background: BLUE_LIGHT,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
              <path d="M6.5 1v9M6.5 10l-3-3M6.5 10l3-3M1 13h11" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {/* Interactive chart slot */}
      <div style={{
        border: "1px solid #E0E0E0",
        borderRadius: 8,
        padding: "12px 4px 4px",
        background: "#FAFAFA",
        minHeight: 260,
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{ width: "100%" }}>
          {chart}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {connector && (
            <span style={{
              fontSize: 11, color: "#0B6FD3",
              background: "rgba(11,111,211,0.07)",
              border: "1px solid rgba(11,111,211,0.18)",
              borderRadius: 4, padding: "2px 6px",
              lineHeight: "1.4", whiteSpace: "nowrap", fontFamily: F,
            }}>
              {connector}
            </span>
          )}
          {/* Source avatars placeholder */}
          <div style={{ display: "flex" }}>
            {["#4A90D9", "#50C878", "#F7B841"].map((color, i) => (
              <div key={i} style={{
                width: 20, height: 20, borderRadius: "50%", background: color,
                border: "2px solid #fff", marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i,
                position: "relative",
              }} />
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#616161", fontFamily: F }}>3 Source(s)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button style={{ background: "none", border: "none", padding: "3.5px", cursor: "pointer", color: "#616161", display: "flex", borderRadius: 100 }}>
            <IconThumbUp size={17} stroke={1.5} />
          </button>
          <button style={{ background: "none", border: "none", padding: "3.5px", cursor: "pointer", color: "#616161", display: "flex", borderRadius: 100 }}>
            <IconThumbDown size={17} stroke={1.5} />
          </button>
        </div>
      </div>

      {/* Push cards — hidden in view/play mode */}
      {!viewMode && !playMode && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
            <IconPlus size={14} stroke={2} style={{ color: BLUE, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: BLUE, fontFamily: F, lineHeight: "18px" }}>Add New Card</span>
          </button>
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 6, flex: 1 }}>
            <IconArrowBarRight size={14} stroke={2} style={{ color: BLUE, flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: BLUE, fontFamily: F, lineHeight: "18px", textAlign: "left" }}>
              Give me a breakdown of the data within this outcome area
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default DataCard;
