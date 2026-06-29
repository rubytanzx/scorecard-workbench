
import { IconArrowRight } from "@tabler/icons-react";
import { type CounterIntuitiveCard as CardType } from "@/lib/mockData";
import StoryTagBadge from "./StoryTagBadge";
import InstitutionLogos from "./InstitutionLogos";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useState, useCallback } from "react";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function SimpleTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-2.5 py-1.5 text-[10.5px] pointer-events-none">
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-gray-800">{payload[0].value}</div>
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

function MiniBarChart({ data, legend }: { data: CardType["chartData"]; legend?: { label: string; color: string }[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const primary = legend?.[0]?.color ?? "#3b82f6";
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} barCategoryGap="25%" barGap={2}>
        <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<SimpleTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={16}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={activeIdx === i ? primary : `${primary}99`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function MiniDonutChart({ data }: { data: NonNullable<CardType["donutData"]> }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const onPieEnter = useCallback((_: unknown, index: number) => setActiveIdx(index), []);
  const active = data[activeIdx];

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={34}
              outerRadius={50}
              dataKey="value"
              onMouseEnter={onPieEnter}
              strokeWidth={0}
              paddingAngle={2}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  opacity={activeIdx === i ? 1 : 0.65}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[15px] font-bold text-gray-900">{active?.value}%</span>
          <span className="text-[8px] text-gray-400">{active?.label.split(" ")[0]}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Annotated Area Chart ─────────────────────────────────────────────────────

function AnnotatedAreaChart({
  data,
  legend,
  annotation,
}: {
  data: CardType["chartData"];
  legend?: { label: string; color: string }[];
  annotation?: string;
}) {
  return (
    <div className="relative">
      {annotation && (
        <div className="absolute top-0 right-1 text-[9px] text-gray-400 font-medium z-10">{annotation}</div>
      )}
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad-ci-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={legend?.[0]?.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={legend?.[0]?.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-ci-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={legend?.[1]?.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={legend?.[1]?.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip content={<SimpleTooltip />} />
          <Area
            type="monotone"
            dataKey="secondary"
            stroke={legend?.[0]?.color}
            strokeWidth={1.5}
            fill="url(#grad-ci-1)"
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={legend?.[1]?.color}
            strokeWidth={2}
            fill="url(#grad-ci-2)"
            dot={false}
            activeDot={{ r: 3.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {legend && (
        <div className="flex items-center gap-3 mt-1">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[9px] text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface Props {
  card: CardType;
}

export default function CounterIntuitiveCard({ card }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300">
      {/* Chart */}
      <div className="px-4 pt-4 pb-1">
        {card.chartType === "bar" && (
          <MiniBarChart data={card.chartData} legend={card.legend} />
        )}
        {card.chartType === "donut" && card.donutData && (
          <MiniDonutChart data={card.donutData} />
        )}
        {card.chartType === "area-annotated" && (
          <AnnotatedAreaChart data={card.chartData} legend={card.legend} annotation={card.annotation} />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-2">
        <StoryTagBadge tag={card.tag} />
        <h3 className="mt-2 text-[13.5px] font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-3">
          {card.headline}
        </h3>
        <div className="flex items-center gap-1 mt-1">
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
