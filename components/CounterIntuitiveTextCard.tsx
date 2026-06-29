
import { IconArrowRight } from "@tabler/icons-react";
import {
  counterIntuitiveTextCards,
  type CounterIntuitiveTextCard,
} from "@/lib/mockData";
import AiTagPill from "./AiTagPill";
import OutcomeAreaIcons from "./OutcomeAreaIcons";

const F = "'Open Sans', sans-serif";

function Card({ card }: { card: CounterIntuitiveTextCard }) {
  return (
    <article
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: "20px 22px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
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
        <AiTagPill label={card.category} />
        <OutcomeAreaIcons areas={card.linkedOutcomeAreas} />
      </div>

      <h4
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: "rgba(255,255,255,0.95)",
          lineHeight: 1.35,
        }}
      >
        {card.headline}
      </h4>

      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "rgba(255,255,255,0.62)",
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {card.description}
      </p>

      <a
        href="#"
        style={{
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
          textDecoration: "none",
        }}
      >
        Explore
        <IconArrowRight size={14} stroke={2} />
      </a>
    </article>
  );
}

export default function CounterIntuitiveFindings() {
  return (
    <section aria-label="Counter Intuitive Findings" style={{ marginBottom: 40 }}>
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
            Counter Intuitive Findings
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: F }}>
            Where the data challenges assumptions
          </p>
        </div>
        <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)", fontFamily: F, textDecoration: "none" }}>
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {counterIntuitiveTextCards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </div>
    </section>
  );
}
