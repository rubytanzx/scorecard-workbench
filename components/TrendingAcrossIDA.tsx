
import { useEffect, useState } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import {
  trendingTop,
  trendingSides,
  type TrendingProgress,
  type TrendingSideCard,
} from "@/lib/mockData";
import AiTagPill from "./AiTagPill";
import OutcomeAreaIcons from "./OutcomeAreaIcons";

const F = "'Open Sans', sans-serif";

const PROGRESS_COLOR: Record<TrendingProgress["tone"], string> = {
  green: "#22C55E",
  amber: "#F59E0B",
  red:   "#DC2626",
};

function ProgressBar({ progress }: { progress: TrendingProgress }) {
  const fill = PROGRESS_COLOR[progress.tone];
  const target = Math.max(0, Math.min(100, progress.pct));
  const remaining = 100 - target;
  // Animate the fill in on mount: start at 0, then push to target.
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setPct(target), 60);
    return () => window.clearTimeout(t);
  }, [target]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span
        className="ti-bar"
        tabIndex={0}
        role="progressbar"
        aria-valuenow={target}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={progress.footnote}
      >
        <span className="ti-bar-track" style={{ background: "rgba(255,255,255,0.2)" }}>
          <span
            className="ti-bar-fill"
            style={{ width: `${pct}%`, background: fill }}
          />
        </span>
        <span className="ti-bar-bubble" role="tooltip">
          <strong style={{ color: fill }}>{target}%</strong> achieved · {remaining}% remaining
        </span>
      </span>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", fontFamily: F, lineHeight: 1.4 }}>
        {progress.footnote}
      </div>
    </div>
  );
}

function SideCard({ card }: { card: TrendingSideCard }) {
  return (
    <article
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: "22px 24px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: F,
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <AiTagPill label={card.tag} />
        <OutcomeAreaIcons areas={card.linkedOutcomeAreas} />
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.4,
          }}
        >
          {card.headline}
        </h3>
        <div style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.62)", lineHeight: 1.5 }}>
          {card.subtitle}
        </div>
      </div>

      <ProgressBar progress={card.progress} />

      <a
        href="#"
        style={{
          marginTop: "auto",
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
          textDecoration: "none",
        }}
      >
        {card.ctaLabel}
        <IconArrowRight size={16} stroke={2} aria-hidden="true" />
      </a>
    </article>
  );
}

interface Props {
  /** Called when the user clicks the top card; receives the headline so
   * the home page can hand it off to its search-complete handler and
   * jump into the conversation flow. */
  onOpenTopCard?: (prompt: string) => void;
}

export default function TrendingAcrossIDA({ onOpenTopCard }: Props = {}) {
  return (
    <section aria-label="Trending Across IDA" style={{ marginBottom: 40 }}>
      <style>{`
        .ti-bar {
          position: relative;
          display: block;
          width: 100%;
          cursor: pointer;
          outline: none;
        }
        .ti-bar-track {
          display: block;
          width: 100%;
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
        }
        .ti-bar-fill {
          display: block;
          height: 100%;
          border-radius: 999px;
          transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ti-bar-bubble {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          padding: 6px 10px;
          background: #0D1A2B;
          color: #FFFFFF;
          font-family: 'Open Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.35;
          white-space: nowrap;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 120ms ease, transform 120ms ease;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(13, 26, 43, 0.18);
        }
        .ti-bar-bubble::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #0D1A2B;
        }
        .ti-bar:hover .ti-bar-bubble,
        .ti-bar:focus-visible .ti-bar-bubble {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h2
            style={{
              margin: 0,
              color: "rgba(255, 255, 255, 0.95)",
              fontFamily: F,
              fontSize: 26,
              fontWeight: 300,
              lineHeight: "34px",
              letterSpacing: "-1.2px",
            }}
          >
            Trending Across IDA
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: F }}>
            AI-synthesized patterns from scorecard data and narratives
          </p>
        </div>
        <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)", fontFamily: F, textDecoration: "none" }}>
          View all patterns →
        </a>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        {/* Top card (left, 58%) — clickable; hands the headline back to
            the home page so it can open the conversation flow. */}
        <article
          className="xl:basis-[58%]"
          onClick={() => onOpenTopCard?.(trendingTop.headline)}
          role={onOpenTopCard ? "button" : undefined}
          tabIndex={onOpenTopCard ? 0 : undefined}
          onKeyDown={(e) => {
            if (!onOpenTopCard) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenTopCard(trendingTop.headline);
            }
          }}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
            cursor: onOpenTopCard ? "pointer" : "default",
            padding: "24px 28px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            fontFamily: F,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <AiTagPill label={trendingTop.tag} />
            <OutcomeAreaIcons areas={trendingTop.linkedOutcomeAreas} />
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              color: "rgba(255,255,255,0.95)",
              lineHeight: 1.3,
            }}
          >
            {trendingTop.headline}
          </h3>

          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.62)", lineHeight: 1.6 }}>
            {trendingTop.description}
          </p>

          <ProgressBar progress={trendingTop.progress} />

          <a
            href="#"
            style={{
              marginTop: 8,
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              textDecoration: "none",
            }}
          >
            {trendingTop.ctaLabel}
            <IconArrowRight size={16} stroke={2} aria-hidden="true" />
          </a>
        </article>

        {/* Side stack (right) */}
        <div className="flex flex-col gap-4 xl:flex-1">
          {trendingSides.map((c) => (
            <SideCard key={c.id} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
