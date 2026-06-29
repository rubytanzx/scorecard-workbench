
import { IconArrowRight, IconRadar } from "@tabler/icons-react";
import { type ChangingCard } from "@/lib/mockData";
import InstitutionLogos from "./InstitutionLogos";
import StoryTagBadge from "./StoryTagBadge";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState } from "react";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  legend,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color?: string }[];
  label?: string;
  legend?: { label: string; color: string }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-[11px] animate-fade-in pointer-events-none">
      <div className="font-semibold text-gray-700 mb-1">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: legend?.[i]?.color ?? entry.color }} />
          <span className="text-gray-500">{legend?.[i]?.label ?? entry.name}:</span>
          <span className="font-semibold text-gray-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Grouped Bar Chart ────────────────────────────────────────────────────────

function GroupedBarMiniChart({ data, legend }: { data: ChangingCard["chartData"]; legend: { label: string; color: string }[] }) {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barCategoryGap="30%" barGap={2}>
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          content={<ChartTooltip legend={legend} />}
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={20}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={activeBar === i ? legend[0].color : `${legend[0].color}cc`}
              onMouseEnter={() => setActiveBar(i)}
              onMouseLeave={() => setActiveBar(null)}
            />
          ))}
        </Bar>
        {data[0]?.secondary !== undefined && (
          <Bar dataKey="secondary" radius={[2, 2, 0, 0]} maxBarSize={20}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={activeBar === i ? legend[1]?.color : `${legend[1]?.color}cc`}
                onMouseEnter={() => setActiveBar(i)}
                onMouseLeave={() => setActiveBar(null)}
              />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Multi-Area Chart ─────────────────────────────────────────────────────────

function MultiAreaMiniChart({ data, legend }: { data: ChangingCard["chartData"]; legend: { label: string; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="grad-secondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={legend[0]?.color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={legend[0]?.color} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-primary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={legend[1]?.color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={legend[1]?.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip legend={legend} />} />
        <Area
          type="monotone"
          dataKey="secondary"
          stroke={legend[0]?.color}
          strokeWidth={1.5}
          fill="url(#grad-secondary)"
          dot={false}
          activeDot={{ r: 3, fill: legend[0]?.color }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={legend[1]?.color}
          strokeWidth={2}
          fill="url(#grad-primary)"
          dot={false}
          activeDot={{ r: 3, fill: legend[1]?.color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Area Chart ───────────────────────────────────────────────────────────────

function AreaMiniChart({ data, legend }: { data: ChangingCard["chartData"]; legend: { label: string; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="grad-stalling" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={legend[0]?.color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={legend[0]?.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip legend={legend} />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={legend[0]?.color}
          strokeWidth={2}
          fill="url(#grad-stalling)"
          dot={false}
          activeDot={{ r: 3.5, fill: legend[0]?.color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Legend Row ───────────────────────────────────────────────────────────────

function LegendRow({ legend }: { legend: { label: string; color: string }[] }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {legend.map((l) => (
        <div key={l.label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
          <span className="text-[10px] text-gray-500">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface Props {
  card: ChangingCard;
}

export default function InsightChartCard({ card }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300">
      {/* Chart area */}
      <div className="px-4 pt-4 pb-1">
        {card.chartType === "grouped-bar" && (
          <GroupedBarMiniChart data={card.chartData} legend={card.legend} />
        )}
        {card.chartType === "multi-area" && (
          <MultiAreaMiniChart data={card.chartData} legend={card.legend} />
        )}
        {card.chartType === "area" && (
          <AreaMiniChart data={card.chartData} legend={card.legend} />
        )}
        <LegendRow legend={card.legend} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-3">
        <StoryTagBadge tag={card.tag} />
        <h3 className="mt-2 text-[13.5px] font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-3">
          {card.headline}
        </h3>
        <div className="flex items-center gap-1 mt-1.5">
          <IconRadar size={10} className="text-gray-400" />
          <span className="text-[10.5px] text-gray-400">Workspace Type: {card.workspaceType}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <InstitutionLogos institutions={card.institutions} />
          <button className="group/cta flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-700 transition-colors w-fit">
            {card.ctaLabel}
            <IconArrowRight size={10} className="group-hover/cta:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
}
