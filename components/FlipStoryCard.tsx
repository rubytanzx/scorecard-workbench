
import { useState } from "react";
import { type Story } from "@/lib/mockData";
import StoryTagBadge from "./StoryTagBadge";
import InstitutionLogos from "./InstitutionLogos";

interface FlipStoryCardProps {
  story: Story & {
    drivingIndicators: NonNullable<Story["drivingIndicators"]>;
    narrativeUrl: string;
  };
  featured?: boolean;
}

export default function FlipStoryCard({ story, featured = false }: FlipStoryCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    if (!window.matchMedia("(hover: hover)").matches) {
      setFlipped((v) => !v);
    }
  };

  const backBg = featured ? "#003F6B" : "#1A1A2E";

  return (
    <div
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={handleClick}
      style={{ perspective: 1000, cursor: "pointer" }}
      aria-label={`Story: ${story.headline}`}
    >
      {/* Flipper */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "none",
          position: "relative",
        }}
      >
        {/* Front face — normal flow, sets height */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            background: "#FFFFFF",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 200,
          }}
        >
          <StoryTagBadge tag={story.tag} />
          <h3
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 15,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.4,
              flex: 1,
              margin: 0,
            }}
          >
            {story.headline}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 10,
              borderTop: "1px solid #F3F4F6",
              marginTop: "auto",
            }}
          >
            <InstitutionLogos institutions={story.institutions} />
            {story.lastUpdated && (
              <span
                style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {story.lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Back face — absolute, fills front dimensions */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 12,
            background: backBg,
            padding: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* "DRIVING INDICATORS" label */}
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            Driving Indicators
          </div>

          {/* Indicator rows */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {story.drivingIndicators.map((ind) => (
              <div
                key={`${ind.label}-${ind.achieved}`}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: ind.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "'DM Sans', sans-serif",
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {ind.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#FFFFFF",
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {ind.achieved}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Mono', monospace",
                    flexShrink: 0,
                    minWidth: 32,
                    textAlign: "right",
                  }}
                >
                  {ind.percentOfTarget}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={story.narrativeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 14,
              fontSize: 11,
              fontWeight: 600,
              color: "#00A0DF",
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Read full narrative →
          </a>
        </div>
      </div>
    </div>
  );
}
