import { useState } from "react";
import type { NodeProps } from "reactflow";
import { IconThumbUp, IconThumbDown } from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

const ROWS = [
  {
    rank: "1",
    area: "Protection for Poorest\n(Financial Inclusion / Social Protection)",
    gap: "–32pp (financial),\n–34pp (poorest quintile coverage vs. Chile/Peru)",
    portfolio: "1 DPF only",
    achieved: "0",
    trend: "Stalling",
    trendType: "stalling" as const,
  },
  {
    rank: "2",
    area: "No Learning Poverty",
    gap: "–20pp vs. Chile; 5pp below peer avg",
    portfolio: "0 projects",
    achieved: "0",
    trend: "No engagement",
    trendType: "stalling" as const,
  },
  {
    rank: "3",
    area: "Healthier Lives (UHC + Stunting)",
    gap: "Stunting worst in peer group (13.1%); UHC 3pp below peer avg",
    portfolio: "0 projects",
    achieved: "0",
    trend: "No engagement",
    trendType: "stalling" as const,
  },
  {
    rank: "3",
    area: "Climate / Green Planet\n(GHG + Protected Areas)",
    gap: "Only country with net positive GHG portfolio;\n–18pp protected areas vs. Chile",
    portfolio: "4 projects (all closing);\n0 renewable energy",
    achieved: "Achieved",
    trend: "Growing on land,\nwrong direction on GHG",
    trendType: "warning" as const,
  },
  {
    rank: "5",
    area: "Digital / Financial Services",
    gap: "–13pp internet vs. Chile;\n–33pp financial inclusion vs. Chile",
    portfolio: "1 DPF (0 results)",
    achieved: "0",
    trend: "Stalling",
    trendType: "stalling" as const,
  },
];

const COLS = [
  { label: "Rank", width: 72 },
  { label: "Outcome Area", width: 200 },
  { label: "Mexico vs. Peer Avg Gap", width: 240 },
  { label: "Active Portfolio", width: 180 },
  { label: "Achieved FY25", width: 120 },
  { label: "Trend", width: 200 },
];

function TrendCell({ trend, type }: { trend: string; type: "stalling" | "warning" }) {
  if (type === "warning") {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 14, lineHeight: "20px", flexShrink: 0 }}>⚠️</span>
        <span style={{ fontFamily: F, fontSize: 14, color: "#1E293B", lineHeight: "20px", whiteSpace: "pre-line" }}>
          {trend}
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#FEE2E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontWeight: 700,
          fontSize: 13,
          color: "#EF4444",
          lineHeight: 1,
        }}
      >
        –
      </div>
      <span style={{ fontFamily: F, fontSize: 14, color: "#1E293B", lineHeight: "20px" }}>{trend}</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OverviewCard({ selected, data }: NodeProps<any>) {
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
        width: playMode ? "100%" : 1200,
        background: "#FFFFFF",
        border: playMode ? "none" : selected ? "1px solid #0B6FD3" : cardHovered ? "1px solid #C8C8C8" : "1px solid #E5E5E5",
        borderRadius: playMode ? 0 : 8,
        boxShadow: playMode ? "none" : selected
          ? "0 0 0 2px #0B6FD3, 0px 6px 16px 0px rgba(12,35,60,0.14)"
          : cardHovered
          ? "0px 6px 16px 0px rgba(12,35,60,0.14)"
          : "0px 2px 4px 0px rgba(12,35,60,0.08)",
        fontFamily: F,
        overflow: "hidden",
        cursor: playMode ? "default" : "grab",
        transition: playMode ? undefined : "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      {/* Title */}
      <div style={{ padding: "24px 24px 16px" }}>
        <h2
          style={{
            margin: 0,
            fontFamily: F,
            fontSize: 24,
            fontWeight: 700,
            color: "#000",
            letterSpacing: -0.25,
            lineHeight: "1.4",
          }}
        >
          Overview of Mexico compared to Chile, Brazil, Colombia and Peru.
        </h2>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            {COLS.map((c) => (
              <col key={c.label} style={{ width: c.width }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              {COLS.map((c) => (
                <th
                  key={c.label}
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    fontFamily: F,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#64748B",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={i}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderBottom: i < ROWS.length - 1 ? "1px solid #F1F5F9" : "none",
                  background: hoveredRow === i ? "#F8FAFC" : "transparent",
                  transition: "background 0.12s",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "20px 24px", fontFamily: F, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                  {row.rank}
                </td>
                <td style={{ padding: "20px 24px", fontFamily: F, fontSize: 14, color: "#1E293B", lineHeight: "1.45", whiteSpace: "pre-line" }}>
                  {row.area}
                </td>
                <td style={{ padding: "16px 24px", fontFamily: F, fontSize: 14, color: "#475569", lineHeight: "1.45", whiteSpace: "pre-line" }}>
                  {row.gap}
                </td>
                <td style={{ padding: "20px 24px", fontFamily: F, fontSize: 14, color: "#1E293B", lineHeight: "1.45", whiteSpace: "pre-line" }}>
                  {row.portfolio}
                </td>
                <td style={{ padding: "20px 24px", fontFamily: F, fontSize: 14, color: "#1E293B" }}>
                  {row.achieved}
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <TrendCell trend={row.trend} type={row.trendType} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #E5E5E5",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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
          {["WB Portfolio Data", "WDI", "Country CPF"].map((src) => (
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
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {!viewMode && !playMode && (
            <>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: F,
                  fontSize: 12,
                  color: "#086ED3",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ↓ Down
              </button>
              <button
                onClick={() => data?.onShowOutcomeAreas?.("Show me how each individual outcome areas are derived")}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: F,
                  fontSize: 12,
                  color: "#086ED3",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                |→ Show me how each individual outcome areas are derived
              </button>
            </>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
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

export default OverviewCard;
