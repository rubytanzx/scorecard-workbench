
import { featuredNarratives, type FeaturedNarrative } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

interface Props {
  /** Called when a card is clicked. Receives the prompt to seed and
   * the narrative's headline as a fallback artefact title. */
  onOpenInfographic?: (prompt: string, fallbackTitle: string) => void;
}

function Card({
  narrative,
  onOpen,
}: {
  narrative: FeaturedNarrative;
  onOpen?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (!onOpen) return;
    e.preventDefault();
    onOpen();
  };
  return (
    <a
      href="#"
      onClick={handleClick}
      style={{
        position: "relative",
        display: "block",
        borderRadius: 12,
        aspectRatio: "5 / 4",
        textDecoration: "none",
        fontFamily: F,
        cursor: "pointer",
      }}
    >
      {/* Image + gradient layer — clipped to the card's rounded corners.
          Lives in its own absolutely-positioned wrapper so the tooltip
          bubble below can escape the card edges without being cropped. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <img
          src={narrative.imageSrc}
          alt="" 
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          style={{ objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 18%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0.92) 100%)",
          }}
        />
      </div>

      {/* Text content over the gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 6,
          color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.82)" }}>
          {narrative.outcomeArea}
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>
          {narrative.headline}
        </h3>

      </div>
    </a>
  );
}

export default function FeaturedNarratives({ onOpenInfographic }: Props = {}) {
  return (
    <section aria-label="Featured Results Narratives" style={{ marginBottom: 40 }}>
      <style>{`
        .fn-tt {
          position: relative;
          cursor: help;
          outline: none;
        }
        .fn-tt-bubble {
          position: absolute;
          left: 0;
          bottom: calc(100% + 10px);
          min-width: 240px;
          max-width: 320px;
          padding: 10px 12px;
          background: #0D1A2B;
          color: #FFFFFF;
          font-family: 'Open Sans', sans-serif;
          font-weight: 400;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 120ms ease, transform 120ms ease;
          z-index: 30;
          box-shadow: 0 8px 20px rgba(13, 26, 43, 0.32);
          text-align: left;
        }
        .fn-tt-bubble::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 18px;
          border: 5px solid transparent;
          border-top-color: #0D1A2B;
        }
        .fn-tt:hover .fn-tt-bubble,
        .fn-tt:focus-visible .fn-tt-bubble {
          opacity: 1;
          transform: translateY(0);
        }
        .fn-tt-bubble-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 6px;
        }
        .fn-tt-bubble-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .fn-tt-bubble-list li {
          font-size: 11px;
          color: #FFFFFF;
          line-height: 1.4;
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
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
          Featured Results Narratives
        </h2>
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--section-link)",
            fontFamily: F,
            textDecoration: "none",
          }}
        >
          See all <span aria-hidden="true">›</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredNarratives.map((n) => (
          <Card
            key={n.id}
            narrative={n}
            onOpen={
              onOpenInfographic
                ? () => onOpenInfographic(n.headline, n.headline)
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
