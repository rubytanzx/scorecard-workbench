
import type { Node } from "reactflow";
import {
  IconLayoutDashboard,
  IconSparkles,
  IconNews,
  IconTarget,
  IconChartBar,
} from "@tabler/icons-react";
import { OverviewCard }    from "@/components/cards/OverviewCard";
import { NarrativeCard }   from "@/components/cards/NarrativeCard";
import { NewsCard }        from "@/components/cards/NewsCard";
import { OutcomeAreaCard } from "@/components/cards/OutcomeAreaCard";
import { DataCard }        from "@/components/cards/DataCard";
import { IDACard }         from "@/components/cards/IDACard";

const CARD_NAME_MAP: Record<string, string> = {
  "card-overview":           "Overview",
  "card-narrative":          "AI Narrative",
  "card-news":               "News",
  "outcome-1":               "Protection of the Poorest",
  "outcome-2":               "No Learning Poverty",
  "outcome-3":               "Healthier Lives",
  "outcome-4":               "Climate / Green Planet",
  "outcome-5":               "Digital / Financial Services",
  "data-social-protection":  "Social Protection Coverage",
  "data-financial-accounts": "Financial Account Ownership",
  "data-safety-net":         "Safety Net Programs",
  "data-financial-services": "Financial Services",
  "data-gender-equality":    "Gender Equality",
  "data-private-capital":    "Private Capital",
  "ida-section-context":      "The Challenge",
  "ida-section-intervention": "Pathways to Outcomes (IDA projects)",
  "ida-section-evidence":     "Country Examples",
  "ida-section-impact":       "Lessons Learned",
};

const NATURAL_WIDTH: Record<string, number> = {
  overview:    1200,
  narrative:   411,
  news:        411,
  outcomeArea: 411,
  dataCard:    710,
  idaCard:     411,
};

const CARD_COMPONENTS: Record<string, React.ComponentType<{ selected: boolean; data: Record<string, unknown> }>> = {
  overview:    OverviewCard    as React.ComponentType<{ selected: boolean; data: Record<string, unknown> }>,
  narrative:   NarrativeCard   as React.ComponentType<{ selected: boolean; data: Record<string, unknown> }>,
  news:        NewsCard        as React.ComponentType<{ selected: boolean; data: Record<string, unknown> }>,
  outcomeArea: OutcomeAreaCard as React.ComponentType<{ selected: boolean; data: Record<string, unknown> }>,
  dataCard:    DataCard        as React.ComponentType<{ selected: boolean; data: Record<string, unknown> }>,
  idaCard:     IDACard         as React.ComponentType<{ selected: boolean; data: Record<string, unknown> }>,
};

function iconFor(type: string | undefined) {
  switch (type) {
    case "overview":    return IconLayoutDashboard;
    case "narrative":   return IconSparkles;
    case "news":        return IconNews;
    case "outcomeArea": return IconTarget;
    case "idaCard":     return IconTarget;
    default:            return IconChartBar;
  }
}

const THUMB_W = 184;
const THUMB_H = 100;

function CardThumbnail({ node, isActive }: { node: Node; isActive: boolean }) {
  const Component = CARD_COMPONENTS[node.type ?? ""];
  const naturalW  = NATURAL_WIDTH[node.type ?? ""] ?? 411;
  const scale     = THUMB_W / naturalW;

  return (
    <div
      style={{
        width: THUMB_W,
        height: THUMB_H,
        overflow: "hidden",
        borderRadius: 8,
        border: `1px solid ${isActive ? "rgba(11,111,211,0.35)" : "#e5e5e5"}`,
        background: "#fafafa",
        position: "relative",
        flexShrink: 0,
        transition: "border-color 0.12s",
      }}
    >
      {Component ? (
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: naturalW,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <Component
            selected={false}
            data={{ ...node.data, viewMode: true }}
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#f0f0f0" }} />
      )}
    </div>
  );
}

interface Props {
  nodes: Node[];
  activeNodeId?: string | null;
  onFocus: (id: string) => void;
}

export default function CanvasNavPane({ nodes, activeNodeId, onFocus }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        top: 96,
        height: "calc(100vh - 118px)",
        width: 216,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        background: "white",
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        boxShadow: "0px 2px 4px 0px rgba(12,35,60,0.08)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
        <span style={{
          fontFamily: "'Open Sans', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: "#9e9e9e",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
        }}>
          Cards
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {nodes.length === 0 ? (
          <p style={{
            fontFamily: "'Open Sans', sans-serif",
            fontSize: 12,
            color: "#bdbdbd",
            textAlign: "center",
            margin: "24px 0",
          }}>
            No cards yet
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {nodes.map((node) => {
              const label    = CARD_NAME_MAP[node.id] ?? node.data?.title ?? node.id;
              const isActive = node.id === activeNodeId;
              const Icon     = iconFor(node.type);

              return (
                <div
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onFocus(node.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onFocus(node.id); }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 6,
                    padding: "8px 8px 6px",
                    borderRadius: 10,
                    background: isActive ? "#EBF3FC" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f5f5f5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? "#EBF3FC" : "transparent"; }}
                >
                  <CardThumbnail node={node} isActive={isActive} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "0 2px" }}>
                    <Icon
                      size={12}
                      stroke={1.8}
                      color={isActive ? "#0b6fd3" : "#9e9e9e"}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <span style={{
                      fontFamily: "'Open Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#0b6fd3" : "#424242",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
