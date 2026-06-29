
import { IconWorld } from "@tabler/icons-react";
import type { WBGNarrative } from "@/lib/narrativeApi";

interface Props {
  narrativeSlug: string;
  /** The matched narrative (grounded in narratives.json), injected by the parent. */
  narrative: WBGNarrative;
  angle: string;
  countries: string[];
  dark?: boolean;
}

const ANGLE_LABELS: Record<string, string> = {
  results: "Results achieved",
  challenges: "Challenges addressed",
  lessons: "Lessons for scale",
};

export default function NarrativeOutput({ narrativeSlug, narrative, angle, countries, dark = false }: Props) {
  void narrativeSlug;

  const angleLabel = ANGLE_LABELS[angle] ?? angle;
  const displayCountries = countries.length > 0 ? countries : narrative.countries;

  const containerCls = dark
    ? "rounded-2xl border border-[#334155] bg-[#1E293B]"
    : "rounded-2xl border border-gray-200 bg-white";

  const statCardCls = dark
    ? "rounded-xl border border-[rgba(2,136,209,0.25)] bg-[rgba(2,136,209,0.12)] px-4 py-3"
    : "rounded-xl bg-blue-50 px-4 py-3";

  const titleCls = dark ? "text-[#F1F5F9]" : "text-[#121D28]";
  const bodyTextCls = dark ? "text-[#94A3B8]" : "text-gray-600";
  const labelTextCls = dark ? "text-[#64748B]" : "text-gray-500";
  const statValueCls = dark ? "text-[#38BDF8]" : "text-[#0288D1]";

  return (
    <div className={`${containerCls} overflow-hidden narrative-content-enter`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {/* Header strip */}
      <div className="flex items-start gap-4 p-5 pb-4">
        <div className="relative w-10 h-10 shrink-0 mt-0.5">
          <img
            src={narrative.iconPath}
            alt={narrative.category}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          {/* Category + angle badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                dark
                  ? "bg-[rgba(2,136,209,0.18)] text-[#38BDF8]"
                  : "bg-blue-50 text-[#0288D1]"
              }`}
            >
              {narrative.category}
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                dark
                  ? "bg-[rgba(167,139,250,0.15)] text-violet-300"
                  : "bg-violet-50 text-violet-600"
              }`}
            >
              {angleLabel}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`text-[16px] font-bold leading-snug ${titleCls}`}
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            {narrative.title}
          </h3>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3 px-5 pb-4">
        {narrative.topStats.map((stat, i) => (
          <div key={i} className={statCardCls}>
            <div className={`text-[18px] font-bold leading-tight ${statValueCls}`}>
              {stat.value}
            </div>
            <div className={`text-[11px] leading-snug mt-1 ${bodyTextCls}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className={`mx-5 border-t ${dark ? "border-[#334155]" : "border-gray-100"}`} />

      {/* The Challenge */}
      <div className="px-5 py-4">
        <h4 className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${labelTextCls}`}>
          The Challenge
        </h4>
        <p className={`text-[13.5px] leading-relaxed ${bodyTextCls}`}>
          {narrative.summary}
        </p>
      </div>

      {/* Country examples */}
      <div className="px-5 pb-4">
        <h4 className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${labelTextCls}`}>
          Country Examples
        </h4>
        <div className="flex flex-wrap gap-2">
          {displayCountries.map((country) => (
            <span
              key={country}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium ${
                dark
                  ? "bg-[#0F172A] border border-[#334155] text-[#CBD5E1]"
                  : "bg-gray-50 border border-gray-200 text-gray-700"
              }`}
            >
              <IconWorld size={12} className="shrink-0 opacity-60" />
              {country}
            </span>
          ))}
        </div>
      </div>

      <div className="pb-1" />
    </div>
  );
}
