
import type { Node } from "reactflow";
import { OverviewCard } from "@/components/cards/OverviewCard";
import { NarrativeCard } from "@/components/cards/NarrativeCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { OutcomeAreaCard } from "@/components/cards/OutcomeAreaCard";
import { DataCard } from "@/components/cards/DataCard";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

const cardComponents = {
  overview: OverviewCard,
  narrative: NarrativeCard,
  news: NewsCard,
  outcomeArea: OutcomeAreaCard,
  dataCard: DataCard,
} as const;

interface Props {
  node: Node;
  index: number;
  total: number;
  onAdvance: () => void;
  onPrev: () => void;
}

function getCardSummary(node: Node): { title: string; body: string } {
  switch (node.type) {
    case "outcomeArea":
      return {
        title: node.data.title?.replace(/\n/g, " ") ?? "Outcome Area",
        body: node.data.body
          ? node.data.body.slice(0, 320) + (node.data.body.length > 320 ? "…" : "")
          : "",
      };
    case "dataCard":
      return {
        title: "Data Insights",
        body: node.data.description ?? "",
      };
    case "narrative":
      return {
        title: "Holistic Overview",
        body: "Before diving into individual areas, this synthesis connects the key patterns across Mexico's scorecard. It covers portfolio concentration, spatial gaps, pipeline exposure, and peer comparisons — giving you the full picture in one view.",
      };
    case "news":
      return {
        title: "Live Intelligence",
        body: "Real-time alerts and insights from news, policy announcements, and data releases relevant to Mexico's development context.",
      };
    case "overview":
      return {
        title: "Scorecard Overview",
        body: "A comparative view of Mexico's performance against Chile, Brazil, Colombia, and Peru across 5 priority outcome areas — showing portfolio gaps and trend directions.",
      };
    default:
      return { title: "Card Summary", body: "" };
  }
}

export default function PlayModeCard({ node, index, total, onAdvance, onPrev }: Props) {
  const CardComponent = cardComponents[node.type as keyof typeof cardComponents];
  const isLast = index === total - 1;
  const isFirst = index === 0;
  const summary = getCardSummary(node);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(92vw, 1160px)",
        height: "80vh",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        borderRadius: 16,
        boxShadow: "0px 24px 64px rgba(0,0,0,0.22)",
        overflow: "hidden",
      }}
    >
      {/* Main body: card content + summary panel side by side */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left: card content (no card chrome) */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: 32,
            minWidth: 0,
          }}
        >
          {CardComponent ? (
            <CardComponent
              id={node.id}
              type={node.type ?? ""}
              data={{ ...node.data, viewMode: true, playMode: true }}
              selected={false}
              isConnectable={false}
              zIndex={0}
              xPos={0}
              yPos={0}
              dragging={false}
            />
          ) : (
            <div style={{ padding: 24, fontFamily: F, color: "#616161" }}>Card unavailable</div>
          )}
        </div>

        {/* Right: summary panel */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderLeft: "1px solid #E5E5E5",
            background: "#F8FAFB",
            display: "flex",
            flexDirection: "column",
            padding: "28px 24px",
            gap: 16,
            overflowY: "auto",
          }}
        >
          {/* AI label */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconSparkles size={14} stroke={1.5} style={{ color: "#AE5DED", flexShrink: 0 }} />
            <span
              style={{
                fontSize: 11,
                fontFamily: F,
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                background: "linear-gradient(to left, #68C5EA 19%, #AE5DED 123%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              What this means
            </span>
          </div>

          {/* Summary title */}
          <p
            style={{
              margin: 0,
              fontFamily: F,
              fontSize: 15,
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: "1.45",
            }}
          >
            {summary.title}
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: "#E5E5E5" }} />

          {/* Summary body */}
          <p
            style={{
              margin: 0,
              fontFamily: F,
              fontSize: 13,
              color: "#475569",
              lineHeight: "1.6",
            }}
          >
            {summary.body}
          </p>
        </div>
      </div>

      {/* Footer: Prev / Next navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderTop: "1px solid #F0F0F0",
          background: "#FAFAFA",
          flexShrink: 0,
        }}
      >
        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            background: "transparent",
            cursor: isFirst ? "default" : "pointer",
            fontFamily: F,
            fontSize: 13,
            fontWeight: 600,
            color: isFirst ? "#D0D0D0" : "#616161",
            opacity: isFirst ? 0.4 : 1,
          }}
        >
          <IconArrowLeft size={14} stroke={2} />
          Prev
        </button>

        {/* Progress indicator */}
        <span style={{ fontFamily: F, fontSize: 12, color: "#9E9E9E" }}>
          {index + 1} of {total}
        </span>

        {/* Next / Finish */}
        <button
          onClick={onAdvance}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 999,
            border: isLast ? "1px solid #0b6fd3" : "none",
            background: isLast ? "#0b6fd3" : "transparent",
            cursor: "pointer",
            fontFamily: F,
            fontSize: 13,
            fontWeight: 600,
            color: isLast ? "#FFFFFF" : "#616161",
          }}
        >
          {isLast ? (
            <>
              <IconCheck size={14} stroke={2} />
              Finish
            </>
          ) : (
            <>
              Next
              <IconArrowRight size={14} stroke={2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
