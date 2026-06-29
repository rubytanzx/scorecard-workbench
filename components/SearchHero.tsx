
import ScorecardStats from "./ScorecardStats";

const F = "'Open Sans', sans-serif";

export default function SearchHero() {
  return (
    <section
      className="relative w-full flex flex-col items-center"
      style={{ paddingTop: 88, paddingBottom: 32 }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontFamily: F, margin: 0, lineHeight: 1.18, letterSpacing: "-0.03em" }}>
          <span style={{ display: "block", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, color: "rgba(255,255,255,0.88)" }}>
            The World Bank Group
          </span>
          <span style={{ display: "block", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "rgba(255,255,255,0.96)" }}>
            Scorecard Workbench
          </span>
        </h1>
      </div>

      <ScorecardStats />

      {/* Spacer so the fixed prompt bar + pills float above page content */}
      <div style={{ height: 130 }} />
    </section>
  );
}
