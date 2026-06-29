
import { useState } from "react";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import {
  type PulseMetric,
  type BiggestMover,
  type ScorecardVertical,
  trackingMetrics,
  biggestMovers,
  scorecardVerticals,
} from "@/lib/mockData";

// ─── Delta chip ───────────────────────────────────────────────────────────────

function DeltaChip({ delta, direction }: { delta: string; direction: PulseMetric["deltaDirection"] }) {
  if (!delta) return null;

  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-[2px] px-[4px] py-[2px] rounded-[4px] bg-[#e5faf1] text-[10px] text-[#065f46] whitespace-nowrap">
        <IconArrowUp size={10} stroke={2.5} />
        {delta}
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="inline-flex items-center gap-[2px] px-[4px] py-[2px] rounded-[4px] bg-[#fde8e8] text-[10px] text-[#c62828] whitespace-nowrap">
        <IconArrowDown size={10} stroke={2.5} />
        {delta}
      </span>
    );
  }
  // warning / expected
  return (
    <span className="inline-flex items-center px-[4px] py-[2px] rounded-[4px] bg-[#c9e1ff] text-[10px] text-[#1d1b99] whitespace-nowrap">
      {delta}
    </span>
  );
}

// ─── Individual Metric Card ───────────────────────────────────────────────────

function MetricCard({ metric }: { metric: PulseMetric }) {
  return (
    <div className="group flex flex-col gap-[4px] p-[13px] bg-white border border-[rgba(39,37,30,0.07)] rounded-[12px] hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
      <div className="flex items-center justify-between w-full">
        <span className="text-[18px] font-semibold text-[#27251e] leading-[1.4]">
          {metric.value}
        </span>
        <DeltaChip delta={metric.delta} direction={metric.deltaDirection} />
      </div>
      <p className="text-[12px] text-[#212121] leading-[16px] tracking-[-0.4px]">
        {metric.label}
      </p>
    </div>
  );
}

// ─── Section block (title + 2×2 grid of metric cards) ────────────────────────

function MetricSection({ title, subtitle, metrics }: { title: string; subtitle?: string; metrics: PulseMetric[] }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <h3 className="text-[18px] font-semibold text-[#212121] leading-[140%]">
        {title}
        {subtitle && <span className="text-[#212121]"> {subtitle}</span>}
      </h3>
      <div className="grid grid-cols-2 gap-[12px]">
        {metrics.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>
    </div>
  );
}

// ─── Biggest Movers (single card, rows with dividers) ─────────────────────────

function BiggestMoversSection({ movers }: { movers: BiggestMover[] }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <h3 className="text-[18px] font-semibold text-[#212121] leading-[140%]">Biggest Movers</h3>
      <div className="bg-white border border-[rgba(39,37,30,0.07)] rounded-[12px] overflow-hidden">
        {movers.map((mover, i) => (
          <div key={mover.id}>
            <div className="group flex items-center gap-[4px] px-[13px] py-[10px] hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                <span className="text-[14px] font-semibold text-[#27251e] leading-[1.4]">
                  {mover.label}
                </span>
                <span className="text-[12px] text-[#212121] leading-[16px] tracking-[-0.4px]">
                  {mover.sublabel}
                </span>
              </div>
              <div className="shrink-0 ml-2">
                {mover.deltaDirection === "new" ? (
                  <span className="inline-flex items-center px-[4px] py-[2px] rounded-[4px] bg-[#c9e1ff] text-[10px] text-[#1d1b99]">
                    New
                  </span>
                ) : (
                  <span
                    className={`text-[14px] font-semibold leading-[1.4] ${
                      mover.deltaDirection === "up" ? "text-[#065f46]" : "text-[#f44336]"
                    }`}
                  >
                    {mover.delta}
                  </span>
                )}
              </div>
            </div>
            {i < movers.length - 1 && (
              <div className="h-px bg-[#e0e0e0] mx-[13px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scorecard Verticals ──────────────────────────────────────────────────────

const VERTICAL_VALUE_COLOR: Record<string, string> = {
  "sv-1": "#065f46",  // People — green
  "sv-2": "#c16b02",  // Prosperity — orange
  "sv-3": "#c16b02",  // Planet — orange
  "sv-4": "#f44336",  // Infrastructure — red
  "sv-5": "#c16b02",  // Digital — orange
};

function VerticalRow({ vertical }: { vertical: ScorecardVertical }) {
  const [hovered, setHovered] = useState(false);
  const valueColor = VERTICAL_VALUE_COLOR[vertical.id] ?? "#212121";

  return (
    <div
      className="flex items-center gap-[24px] cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="w-[100px] shrink-0 text-[14px] font-semibold text-[#27251e] leading-[1.4]">
        {vertical.label}
      </span>
      <div className="flex-1 h-[12px] bg-[#e9ecef] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${vertical.value}%`,
            backgroundColor: vertical.color,
            opacity: hovered ? 1 : 0.9,
          }}
        />
      </div>
      <div className="w-[40px] shrink-0 text-right">
        <span
          className="text-[14px] font-semibold leading-[1.4] transition-colors"
          style={{ color: hovered ? vertical.color : valueColor }}
        >
          {vertical.value}%
        </span>
      </div>
    </div>
  );
}

function VerticalsSection({ verticals }: { verticals: ScorecardVertical[] }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <h3 className="text-[18px] font-semibold text-[#212121] leading-[140%]">Scorecard Verticals</h3>
      <div className="bg-white border border-[rgba(39,37,30,0.07)] rounded-[12px] p-[13px] flex flex-col gap-[8px]">
        <div className="flex flex-col gap-[16px]">
          {verticals.map((v) => (
            <VerticalRow key={v.id} vertical={v} />
          ))}
        </div>
        <p className="text-[12px] text-[#9e9e9e] text-right leading-[16px] tracking-[-0.4px] mt-1">
          Achieved / expected pipeline ratio FY25
        </p>
      </div>
    </div>
  );
}

// ─── Sidebar Assembly ─────────────────────────────────────────────────────────

export default function SidebarSection() {
  return (
    <div className="flex flex-col gap-[24px]">
      <MetricSection
        title="Also Tracking"
        metrics={trackingMetrics}
      />
      <BiggestMoversSection movers={biggestMovers} />
      <VerticalsSection verticals={scorecardVerticals} />
    </div>
  );
}
