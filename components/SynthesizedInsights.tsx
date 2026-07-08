
import { IconArrowRight, IconUsersGroup } from "@tabler/icons-react";
import insightsData from "@/data/insights.json";
import type { InsightCard } from "@/lib/insightSynth";

const F = "'Open Sans', sans-serif";
const CARDS = insightsData as InsightCard[];

export interface SynthesizedInsightsProps {
  onOpenInsight: (card: InsightCard) => void;
}

export default function SynthesizedInsights({ onOpenInsight }: SynthesizedInsightsProps) {
  if (!CARDS.length) return null;

  return (
    <section aria-label="Trending Insights" style={{ marginBottom: 40, fontFamily: F }}>
      <div style={{ marginBottom: 18 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: "var(--section-title)",
            lineHeight: "34px",
            letterSpacing: "-1.2px",
            margin: 0,
          }}
        >
          Trending Insights
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onOpenInsight(card)}
            className="group text-left flex flex-col"
            style={{
              width: "100%",
              minWidth: 0,
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: 16,
              padding: "20px 20px 18px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
              transition: "background 160ms, border-color 160ms, transform 160ms, box-shadow 160ms",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--card-bg-hover)";
              e.currentTarget.style.borderColor = "var(--card-border-hover)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card-bg)";
              e.currentTarget.style.borderColor = "var(--card-border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.18)";
            }}
          >
            {/* Outcome area tag */}
            {card.outcome_area && (
              <div style={{ marginBottom: 10 }}>
                <span
                  title={card.outcome_area}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--tag-text)",
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {card.outcome_area}
                </span>
              </div>
            )}

            {/* Headline */}
            <h3
              title={card.headline}
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-1)",
                lineHeight: 1.35,
                margin: "0 0 12px",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {card.headline}
            </h3>

            {/* Body insight text */}
            <p
              title={card.insight}
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--insight-body)",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {card.insight}
            </p>

            {/* Footer */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              {/* Views */}
              {card.engagement_count != null && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--insight-views)",
                  }}
                >
                  <IconUsersGroup size={14} style={{ opacity: 0.7, flexShrink: 0 }} />
                  <span>{card.engagement_count} viewed this insight</span>
                </div>
              )}

              {/* Explore link */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1ABCAD",
                  flexShrink: 0,
                  transition: "color 160ms",
                }}
              >
                <span>Explore</span>
                <IconArrowRight size={14} className="group-hover:translate-x-0.5" style={{ transition: "transform 160ms" }} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
