import { useState } from "react";
import type { NodeProps } from "reactflow";
import { IconThumbUp, IconThumbDown } from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

const INSIGHTS = [
  {
    tag: "Portfolio Diagnosis",
    tagBg: "#F3E8FF",
    tagColor: "#460073",
    text: "Mexico's active portfolio ($4.2B, 9 projects) allocates 78% of commitments to climate and land management. Health, education, social protection, and digital collectively receive 0% of investment lending. The DPF (P503988) is the only instrument touching human development indicators — and it closes FY26 with zero results.",
  },
  {
    tag: "Portfolio Diagnosis",
    tagBg: "#F3E8FF",
    tagColor: "#460073",
    text: "Of 9 active projects, 6 are environment or natural resource focused. Mexico's WBG portfolio looks like a climate fund, not an upper-middle-income country partnership. Compared to peers, this is the most lopsided sector distribution in the LAC IBRD portfolio.",
  },
  {
    tag: "Spatial Pattern",
    tagBg: "#DBEAFE",
    tagColor: "#1E40AF",
    text: "Chiapas, Oaxaca, and Guerrero account for Mexico's worst outcomes on 4 of 5 priority indicators — stunting (22.4%), learning poverty (64%), financial inclusion (31%), and social protection coverage (38%). These three states also have the highest indigenous population share. A geographically targeted intervention in the Sur region would move national averages more than any other single investment.",
  },
  {
    tag: "Pipeline Risk",
    tagBg: "#FEDBDC",
    tagColor: "#EF4444",
    text: "Forest Management (P164661), Sustainable Landscapes (P159835), Inclusive Growth (P178224), and the DPF (P503988) all close by end of FY26. These represent $1.8B in commitments and the entirety of Mexico's portfolio contribution to terrestrial protection, financial inclusion, and gender. Post-closure, 5 of 10 scorecard indicators lose their only contributing operation.",
  },
  {
    tag: "Peer Benchmark",
    tagBg: "#DCFCE7",
    tagColor: "#166534",
    text: "Brazil maintains 6 active education projects reaching 48M students. Mexico has zero. Brazil's education portfolio alone ($2.1B) exceeds Mexico's total active portfolio ($4.2B) in scope of human development impact. If Mexico engaged at even a quarter of Brazil's scale, it would represent the largest new sector entry in the LAC region.",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NarrativeCard({ selected, data }: NodeProps<any>) {
  const [cardHovered, setCardHovered] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const viewMode = data?.viewMode ?? false;
  const playMode = data?.playMode ?? false;
  const connector = data?.connector as string | undefined;

  return (
    <div
      className="card-enter"
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        width: playMode ? "100%" : 411,
        fontFamily: F,
        cursor: playMode ? "default" : "grab",
        borderRadius: playMode ? 0 : 8,
        boxShadow: (!playMode && selected) ? "0 0 0 2px #0B6FD3" : undefined,
        transition: playMode ? undefined : "box-shadow 0.2s",
      }}
    >
      {/* Gradient Header */}
      <div
        style={{
          background: playMode ? "transparent" : "linear-gradient(to left, rgba(104,197,234,0.15), rgba(174,93,237,0.15))",
          borderTop: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderRight: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderBottom: "none",
          borderLeft: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderRadius: playMode ? 0 : "8px 8px 0 0",
          padding: playMode ? "24px 24px 8px" : "16px 24px",
          transition: playMode ? undefined : "border-color 0.2s",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: playMode ? 24 : 20,
            fontWeight: 700,
            lineHeight: "1.4",
            background: "linear-gradient(to left, #68C5EA, #AE5DED)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {playMode ? "AI Overview" : "AI Narrative Assistant"}
        </h3>
      </div>

      {/* Body */}
      <div
        style={{
          background: "#FFFFFF",
          borderTop: "none",
          borderRight: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderBottom: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderLeft: playMode ? "none" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
          borderRadius: playMode ? 0 : "0 0 8px 8px",
          boxShadow: playMode ? "none" : cardHovered
            ? "0px 6px 16px 0px rgba(12,35,60,0.14)"
            : "0px 2px 4px 0px rgba(12,35,60,0.08)",
          transition: playMode ? undefined : "box-shadow 0.2s, border-color 0.2s",
        }}
      >
        {INSIGHTS.map((insight, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              padding: "16px",
              borderBottom: i < INSIGHTS.length - 1 ? "1px solid #F3F4F6" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: hoveredRow === i ? "#FAFAFA" : "transparent",
              transition: "background 0.12s",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "inline-block",
                alignSelf: "flex-start",
                background: insight.tagBg,
                color: insight.tagColor,
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: -0.25,
                lineHeight: "1.4",
                padding: "2px 8px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {insight.tag}
            </span>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#374151",
                lineHeight: "1.4",
              }}
            >
              {insight.text}
            </p>
          </div>
        ))}

        {/* Footer: sources + thumbs */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
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
            {["FY25 Scorecard", "LAC Portfolio", "WB Project Portal"].map((src) => (
              <span
                key={src}
                style={{
                  fontSize: 11,
                  color: "#616161",
                  background: "#F5F5F5",
                  borderRadius: 4,
                  padding: "2px 6px",
                  lineHeight: "1.4",
                  fontFamily: F,
                  whiteSpace: "nowrap",
                }}
              >
                {src}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <button
              style={{
                background: "none",
                border: "none",
                padding: "3.5px",
                cursor: "pointer",
                color: "#616161",
                display: "flex",
                alignItems: "center",
                borderRadius: 100,
              }}
            >
              <IconThumbUp size={17} stroke={1.5} />
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                padding: "3.5px",
                cursor: "pointer",
                color: "#616161",
                display: "flex",
                alignItems: "center",
                borderRadius: 100,
              }}
            >
              <IconThumbDown size={17} stroke={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NarrativeCard;
