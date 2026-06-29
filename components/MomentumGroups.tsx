
import { momentumGroups, type MomentumGroup } from "@/lib/mockData";

const F = "'Open Sans', sans-serif";

/** Extract the leading number from strings like "217M", "38.2 GW", "41 countries" */
function parseNum(s: string | undefined): number {
  if (!s) return 0;
  const m = s.match(/^[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

const CARD_BG: Record<MomentumGroup["id"], string> = {
  accelerating: "#0F766E",
  slowing:      "#C2410C",
  emerging:     "#1E1B6E",
};

const GRADIENT_BORDER: Record<MomentumGroup["id"], string> = {
  accelerating: "linear-gradient(160deg, #5eead4 0%, #22d3ee 35%, transparent 60%)",
  slowing:      "linear-gradient(160deg, #fb923c 0%, #f97316 35%, transparent 60%)",
  emerging:     "linear-gradient(160deg, #a78bfa 0%, #818cf8 35%, transparent 60%)",
};

const BAR_COLOR: Record<MomentumGroup["id"], string> = {
  accelerating: "#34D399",
  slowing:      "#FB923C",
  emerging:     "#818CF8",
};

interface Props {
  onCardClick?: (prompt: string, followUps: string[], group: MomentumGroup) => void;
}

export default function MomentumGroups({ onCardClick }: Props = {}) {
  return (
    <section aria-label="Latest Indicator Movements" style={{ marginBottom: 40 }}>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          <clipPath id="mg-sweep" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.55,0 C 0.85,0.33 0.85,0.67 0.55,1 L 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        .mg-card {
          --mg-card-color: #FFFFFF;
          --mg-bar-color: #FFFFFF;
          position: relative;
          overflow: hidden;
          background: rgba(8, 18, 30, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          border-radius: 15px;
          padding: 22px 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
          font-family: 'Open Sans', sans-serif;
          transition: box-shadow 300ms ease;
        }
        .mg-card:hover,
        .mg-card:focus-within {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .mg-card-overlay {
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 200%;
          background: var(--mg-card-color);
          clip-path: url(#mg-sweep);
          -webkit-clip-path: url(#mg-sweep);
          transform: translateX(-100%);
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          z-index: 0;
        }
        .mg-card:hover .mg-card-overlay,
        .mg-card:focus-within .mg-card-overlay {
          transform: translateX(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .mg-card-overlay { transition: none; }
        }

        .mg-card-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }

        .mg-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mg-card-stroke {
          flex-shrink: 0;
          width: 4px;
          height: 22px;
          border-radius: 2px;
          background: var(--mg-card-color);
          transition: background-color 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mg-card:hover .mg-card-stroke,
        .mg-card:focus-within .mg-card-stroke {
          background: #FFFFFF;
        }

        .mg-card-title,
        .mg-card-row-label {
          transition: color 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mg-card-title     { color: rgba(255,255,255,0.95); }
        .mg-card-row-label { color: rgba(255,255,255,0.72); }
        .mg-card:hover .mg-card-title,
        .mg-card:focus-within .mg-card-title { color: #FFFFFF; }
        .mg-card:hover .mg-card-row-label,
        .mg-card:focus-within .mg-card-row-label { color: rgba(255,255,255,0.92); }

        /* Vertical bar track */
        .mg-vbar-track {
          width: 4px;
          height: 38px;
          border-radius: 2px;
          background: rgba(255,255,255,0.12);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          transition: background 500ms ease;
        }
        .mg-card:hover .mg-vbar-track,
        .mg-card:focus-within .mg-vbar-track {
          background: rgba(255,255,255,0.2);
        }
        .mg-vbar-fill {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          border-radius: 2px;
          background: var(--mg-bar-color);
          transition: background 500ms ease, height 600ms cubic-bezier(0.22,1,0.36,1);
        }
        .mg-card:hover .mg-vbar-fill,
        .mg-card:focus-within .mg-vbar-fill {
          background: rgba(255,255,255,0.85);
        }

        /* Achieved / expected value text */
        .mg-val-achieved {
          font-size: 17px;
          font-weight: 700;
          color: rgba(255,255,255,0.95);
          line-height: 1;
          transition: color 500ms ease;
        }
        .mg-val-achieved-label {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.45);
          transition: color 500ms ease;
          margin-left: 3px;
        }
        .mg-val-expected {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin-top: 3px;
          transition: color 500ms ease;
        }
        .mg-card:hover .mg-val-achieved,
        .mg-card:focus-within .mg-val-achieved { color: #FFFFFF; }
        .mg-card:hover .mg-val-achieved-label,
        .mg-card:focus-within .mg-val-achieved-label { color: rgba(255,255,255,0.6); }
        .mg-card:hover .mg-val-expected,
        .mg-card:focus-within .mg-val-expected { color: rgba(255,255,255,0.55); }

        /* Row divider */
        .mg-card-row {
          --mg-row-divider: rgba(255,255,255,0.10);
          border-bottom: 1px solid var(--mg-row-divider);
          transition: border-color 500ms ease;
        }
        .mg-card-row:last-child { border-bottom: none; }
        .mg-card:hover .mg-card-row,
        .mg-card:focus-within .mg-card-row {
          --mg-row-divider: rgba(255,255,255,0.18);
        }

        /* Icon crossfade */
        .mg-icon-wrap {
          position: relative;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
        .mg-icon-wrap > * {
          position: absolute;
          inset: 0;
          transition: opacity 500ms ease;
          width: 100%; height: 100%;
          object-fit: contain;
        }
        .mg-icon-color { opacity: 1; }
        .mg-icon-white { opacity: 0; filter: brightness(0) invert(1); }
        .mg-card:hover .mg-icon-color,
        .mg-card:focus-within .mg-icon-color { opacity: 0; }
        .mg-card:hover .mg-icon-white,
        .mg-card:focus-within .mg-icon-white { opacity: 1; }

        /* Prompt pills */
        .mg-prompt {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          cursor: pointer;
          font-family: 'Open Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.3;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.85);
          transition: background-color 140ms ease, border-color 500ms ease;
        }
        .mg-card:hover .mg-prompt,
        .mg-card:focus-within .mg-prompt {
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.18);
        }
        .mg-prompt:hover {
          background: rgba(255,255,255,0.22);
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
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
          Latest Indicator Movements
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.40)", fontFamily: F }}>
            Updated Jun 2025
          </span>
          <a href="#" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)", fontFamily: F, textDecoration: "none" }}>
            View all →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {momentumGroups.map((g) => {
          const barColor = BAR_COLOR[g.id];
          const borderGradient = GRADIENT_BORDER[g.id];
          return (
            <div
              key={g.id}
              style={{
                padding: "1px",
                borderRadius: 16,
                background: borderGradient,
                cursor: onCardClick ? "pointer" : "default",
                height: "100%",
              }}
              onClick={() => onCardClick?.(g.title, g.suggestedPrompts, g)}
              role={onCardClick ? "button" : undefined}
              tabIndex={onCardClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCardClick?.(g.title, g.suggestedPrompts, g);
                }
              }}
              aria-label={onCardClick ? `Open conversation about ${g.title}` : undefined}
            >
            <article
              className="mg-card"
              style={{
                ["--mg-card-color" as string]: barColor,
                ["--mg-bar-color" as string]: barColor,
              }}
            >
              <span className="mg-card-overlay" aria-hidden="true" />
              <div className="mg-card-content">
                <div className="mg-card-header">
                  <span className="mg-card-stroke" aria-hidden="true" />
                  <h3 className="mg-card-title" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                    {g.title}
                  </h3>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
                  {g.rows.map((r) => {
                    const achieved = parseNum(r.achieved);
                    const expected = parseNum(r.expected);
                    const maxVal = Math.max(achieved, expected, 1);
                    const achievedPct = (achieved / maxVal) * 100;
                    const expectedPct = (expected / maxVal) * 100;
                    return (
                      <li
                        key={r.label}
                        className="mg-card-row"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}
                      >
                        {/* Icon */}
                        <span className="mg-icon-wrap" aria-hidden="true">
                          <img className="mg-icon-color" src={r.iconSrc} alt="" />
                          <img className="mg-icon-white" src={r.iconSrc} alt="" />
                        </span>

                        {/* Label */}
                        <span className="mg-card-row-label" style={{ flex: 1, fontSize: 12.5, lineHeight: 1.4 }}>
                          {r.label}
                        </span>

                        {/* Two vertical bars + values */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {/* Grouped bars */}
                          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 38 }}>
                            {/* Achieved bar */}
                            <div style={{ width: 4, height: 38, borderRadius: 2, background: "rgba(255,255,255,0.12)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                              <div className="mg-vbar-fill" style={{ height: `${achievedPct}%` }} />
                            </div>
                            {/* Expected bar — scales relative to max */}
                            <div style={{ width: 4, height: `${expectedPct}%`, maxHeight: 38, borderRadius: 2, background: "rgba(255,255,255,0.30)", flexShrink: 0 }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", alignItems: "baseline" }}>
                              <span className="mg-val-achieved">{r.achieved ?? r.delta}</span>
                              <span className="mg-val-achieved-label">Achieved</span>
                            </div>
                            {r.expected && (
                              <span className="mg-val-expected">{r.expected} Expected</span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
