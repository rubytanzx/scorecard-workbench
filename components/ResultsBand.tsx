
import { useState } from "react";
import { type Indicator } from "@/lib/mockData";

interface ResultsBandProps {
  indicators: Indicator[];
  onViewAll?: () => void;
}

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    // On touch devices (no hover), onClick toggles the flip.
    if (!window.matchMedia("(hover: hover)").matches) {
      setFlipped((v) => !v);
    }
  };

  return (
    <div
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={handleClick}
      style={{ perspective: 600, cursor: "pointer" }}
      aria-label={`${indicator.name}: ${indicator.achieved}`}
    >
      {/* Flipper */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "none",
          position: "relative",
          minHeight: 84,
        }}
      >
        {/* Front face */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "#FFFFFF",
            borderRadius: 9,
            padding: "9px 10px",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "#6B7280",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.3,
            }}
          >
            {indicator.name}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#0D1A2B",
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            {indicator.achieved}
          </div>
          <div
            style={{
              fontSize: 8,
              color: "#9CA3AF",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            of {indicator.expected}
          </div>
        </div>

        {/* Back face */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#1A1A2E",
            borderRadius: 9,
            padding: "9px 10px",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <p
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.5,
              overflow: "hidden",
              margin: 0,
            }}
          >
            {indicator.methodologyNote ?? "Methodology note coming soon."}
          </p>
          {indicator.methodologyUrl ? (
            <a
              href={indicator.methodologyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 8,
                color: "#00A0DF",
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: "none",
                flexShrink: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              How this is measured →
            </a>
          ) : (
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              Methodology PDF coming soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsBand({ indicators, onViewAll }: ResultsBandProps) {
  return (
    <section aria-label="Our Results FY25" style={{ marginBottom: 32 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "#9CA3AF",
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          Our Results · FY25
        </span>
        <button
          onClick={onViewAll}
          style={{
            fontSize: 12,
            color: "#003F6B",
            fontFamily: "'DM Sans', sans-serif",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          View all 22 →
        </button>
      </div>

      {/* Indicator grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
        style={{
          gap: 8,
          background: "#F8F7F4",
          borderRadius: 12,
          padding: 12,
        }}
      >
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>
    </section>
  );
}
