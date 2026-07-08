
import { outcomeAreas, type OutcomeArea } from "@/lib/mockData";
import { IconChevronRight } from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

function Tile({ area }: { area: OutcomeArea }) {
  return (
    <article
      style={{
        flexShrink: 0,
        width: 200,
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 14,
        padding: "20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: F,
        cursor: "pointer",
        transition: "background 160ms, border-color 160ms",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--card-bg-hover)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--card-bg)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border)";
      }}
    >
      <span
        aria-hidden="true"
        style={{ display: "block", width: 36, height: 36, opacity: 0.85, backgroundImage: `url(${area.iconSrc})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
      />
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.4 }}>
        {area.name}
      </div>
    </article>
  );
}

export default function OutcomeAreaGrid() {
  return (
    <section aria-label="Explore by Outcome Area" style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <h2
          style={{
            margin: 0,
            color: "var(--section-title)",
            fontFamily: F,
            fontSize: 26,
            fontWeight: 300,
            lineHeight: "34px",
            letterSpacing: "-1.2px",
          }}
        >
          Explore by Outcome Area
        </h2>
        <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "var(--section-link)", fontFamily: F, textDecoration: "none" }}>
          View all <IconChevronRight size={13} style={{ display: "inline", verticalAlign: "middle" }} />
        </a>
      </div>

      {/* Scrollable row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
        }}
        // Hide webkit scrollbar via className
        className="scrollbar-hidden"
      >
        {outcomeAreas.map((a) => (
          <Tile key={a.id} area={a} />
        ))}
      </div>
    </section>
  );
}
