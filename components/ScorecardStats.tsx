
import React, { useEffect, useRef, useState } from "react";
import { usePageReady } from "@/hooks/usePageReady";
import { useTheme } from "@/contexts/ThemeContext";

const F = "'Open Sans', sans-serif";

const STATS = [
  {
    value: "15",
    unit: "",
    label: "Outcome Areas",
  },
  {
    value: "22",
    unit: "",
    label: "Results Indicators",
  },
  {
    value: "9",
    unit: "",
    label: "Targets",
  },
] as const;

// Parse "378.9M" → { num: 378.9, suffix: "M", decimals: 1 }
// Decimals preserved so the count-up animation matches the source precision.
function parseValue(v: string): { num: number; suffix: string; decimals: number } {
  const m = v.match(/^([\d.]+)([A-Za-z]*)$/);
  if (!m) return { num: 0, suffix: "", decimals: 0 };
  const numStr = m[1];
  const dot = numStr.indexOf(".");
  const decimals = dot === -1 ? 0 : numStr.length - dot - 1;
  return { num: parseFloat(numStr), suffix: m[2], decimals };
}

const PARSED = STATS.map((s) => ({ ...s, ...parseValue(s.value) }));

// Stagger each stat so they start 120 ms apart
const STAGGER_MS = 120;
const DURATION_MS = 1600;

export default function ScorecardStats() {
  const { isReady } = usePageReady();
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const animatedRef = useRef(false);

  useEffect(() => {
    // Wait for the loading screen to be fully gone before counting up.
    // LoadingScreen fades out over 600ms once isReady fires — add 100ms margin.
    if (!isReady || animatedRef.current) return;

    let rafId: number;
    const delay = setTimeout(() => {
      animatedRef.current = true;
      const start = performance.now();
      const totalDuration = DURATION_MS + STAGGER_MS * (PARSED.length - 1);

      const animate = (now: number) => {
        const t = Math.min((now - start) / totalDuration, 1);
        setProgress(t);
        if (t < 1) rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
    }, 700); // loading screen exit: 600ms transition + 100ms buffer

    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(rafId);
    };
  }, [isReady]);

  return (
    <div
      className="w-full max-w-[480px] mx-auto"
      style={{ fontFamily: F }}
    >
      <style>{`
        .sc-stat-divider {
          width: 1px;
          align-self: stretch;
          background: var(--stat-divider);
          flex-shrink: 0;
        }
        @media (max-width: 639px) {
          .sc-stat-divider { display: none; }
          .sc-stat-grid { gap: 0 !important; }
          .sc-stat-item {
            border-bottom: 1px solid rgba(255,255,255,0.10);
            padding: 18px 0 !important;
          }
          .sc-stat-item:last-child { border-bottom: none; }
        }
      `}</style>

      <div
        className="sc-stat-grid flex flex-col sm:flex-row items-stretch"
        style={{ gap: 0 }}
      >
        {PARSED.map((s, i) => {
          // Each stat gets its own time window, offset by STAGGER_MS * i
          const staggerOffset = (STAGGER_MS * i) / (DURATION_MS + STAGGER_MS * (PARSED.length - 1));
          const localT = Math.max(0, Math.min(1, (progress - staggerOffset) / (1 - staggerOffset)));
          // Ease-out cubic — decelerates into the final value
          const eased = 1 - Math.pow(1 - localT, 3);
          // Preserve the source precision: "378.9M" animates to 378.9, "22" to 22.
          const interpolated = s.num * eased;
          const displayed = s.decimals > 0
            ? interpolated.toFixed(s.decimals)
            : Math.round(interpolated).toString();

          return (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="sc-stat-divider hidden sm:block" />}
              <div
                className="sc-stat-item flex-1 flex flex-col items-center text-center"
                style={{ padding: "10px 16px" }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-1.5px",
                    fontVariantNumeric: "tabular-nums",
                    ...(isDark ? { color: "var(--stat-number)" } : {
                      background: "linear-gradient(155deg, #003D66 15%, #0071BC 85%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }),
                  }}
                >
                  {displayed}
                  {s.suffix}
                  {s.unit && (
                    <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--text-3)" }}>
                      {s.unit}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--stat-label)",
                    lineHeight: 1.3,
                  }}
                >
                  {s.label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
