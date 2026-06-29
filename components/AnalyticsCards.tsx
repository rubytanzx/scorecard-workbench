
const F = "'Open Sans', sans-serif";

type ChartType = "comparative" | "trend" | "compositional";

// ─── Mini chart: Comparative horizontal bars ──────────────────────────────────

function ComparativeChart() {
  const bars = [
    { label: "S. Asia",     value: 112, max: 150, color: "#0288D1" },
    { label: "E. Asia Pac", value: 74,  max: 150, color: "#0288D1" },
    { label: "ECA",         value: 43,  max: 150, color: "#0288D1" },
  ];
  const H = 110;
  const W = 280;
  const leftPad = 72;
  const rightPad = 8;
  const barH = 14;
  const rowH = H / bars.length;

  return (
    <div style={{ width: "100%", background: "#0A1929", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontFamily: F, fontSize: 10.5, color: "rgba(255,255,255,0.40)", marginBottom: 10 }}>
        People reached with health services by region · FY25 (M)
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} aria-hidden="true">
        {/* Grid lines at 0, 50, 100, 150 */}
        {[0, 50, 100, 150].map((tick) => {
          const x = leftPad + (tick / 150) * (W - leftPad - rightPad);
          return (
            <g key={tick}>
              <line x1={x} y1={0} x2={x} y2={H - 18} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={x} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.32)" fontFamily={F}>
                {tick}M
              </text>
            </g>
          );
        })}

        {bars.map((b, i) => {
          const y = i * rowH + (rowH - barH) / 2 + 4;
          const barW = (b.value / b.max) * (W - leftPad - rightPad);
          return (
            <g key={b.label}>
              <text x={leftPad - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.50)" fontFamily={F}>
                {b.label}
              </text>
              {/* Track */}
              <rect x={leftPad} y={y} width={W - leftPad - rightPad} height={barH} rx={4} fill="rgba(255,255,255,0.06)" />
              {/* Fill */}
              <rect x={leftPad} y={y} width={barW} height={barH} rx={4} fill={b.color} opacity={0.85} />
              {/* Value label */}
              <text x={leftPad + barW + 5} y={y + barH / 2 + 4} fontSize={10} fill="rgba(255,255,255,0.60)" fontFamily={F}>
                {b.value}M
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Mini chart: Trend lines ──────────────────────────────────────────────────

function TrendChart() {
  const years = ["FY22", "FY23", "FY24", "FY25", "FY26", "FY27"];
  const W = 280;
  const H = 120;
  const padL = 38;
  const padR = 10;
  const padT = 10;
  const padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxV = 450;

  // All points are (yearIndex, value) — yearIndex is 0=FY22 … 5=FY27
  // Actual data runs FY22–FY25 (indices 0–3); target runs FY22–FY27 (indices 0–5)
  const edActual:  [number, number][] = [[0,190],[1,240],[2,285],[3,330]];
  const edTarget:  [number, number][] = [[0,190],[1,235],[2,280],[3,315],[4,370],[5,420]];
  const climActual:[number, number][] = [[0,80], [1,120],[2,165],[3,205]];

  const toX = (yi: number) => padL + (yi / (years.length - 1)) * chartW;
  const toY = (v: number)  => padT + chartH - (v / maxV) * chartH;

  const pathD = (pts: [number, number][]) =>
    pts.map(([yi, v], i) => `${i === 0 ? "M" : "L"}${toX(yi)} ${toY(v)}`).join(" ");

  return (
    <div style={{ width: "100%", background: "#0A1929", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontFamily: F, fontSize: 10.5, color: "rgba(255,255,255,0.40)", marginBottom: 10 }}>
        FY24–FY25 progress vs IDA21 implied trajectory
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} aria-hidden="true">
        {/* Horizontal grid */}
        {[0, 200, 400].map((tick) => {
          const y = toY(tick);
          return (
            <g key={tick}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={padL - 5} y={y + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.32)" fontFamily={F}>
                {tick === 0 ? "0M" : `${tick}M`}
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {years.map((yr, i) => (
          <text key={yr} x={toX(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.32)" fontFamily={F}>
            {yr}
          </text>
        ))}

        {/* Education target — green dotted, FY22–FY27 */}
        <path d={pathD(edTarget)} fill="none" stroke="#34D399" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />

        {/* Education actual — green solid, FY22–FY25 */}
        <path d={pathD(edActual)} fill="none" stroke="#34D399" strokeWidth={2} opacity={0.9} />
        <circle cx={toX(3)} cy={toY(330)} r={3.5} fill="#34D399" />

        {/* Climate actual — red solid, FY22–FY25 */}
        <path d={pathD(climActual)} fill="none" stroke="#F87171" strokeWidth={2} opacity={0.9} />
        <circle cx={toX(3)} cy={toY(205)} r={3.5} fill="#F87171" />
      </svg>
    </div>
  );
}

// ─── Mini chart: Compositional stacked bar ────────────────────────────────────

function CompositionalChart() {
  const segments = [
    { label: "Health & Nutrition", pct: 28, color: "#0288D1" },
    { label: "Education",          pct: 21, color: "#34D399" },
    { label: "Social Protection",  pct: 12, color: "#A78BFA" },
    { label: "Climate",            pct: 24, color: "#FFA05C" },
    { label: "Other",              pct: 15, color: "rgba(255,255,255,0.20)" },
  ];

  let cumulative = 0;
  return (
    <div style={{ width: "100%", background: "#0A1929", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontFamily: F, fontSize: 10.5, color: "rgba(255,255,255,0.40)", marginBottom: 10 }}>
        Share of FY25 total results by outcome area
      </div>

      {/* Stacked bar — clipped to rounded rect */}
      <svg viewBox="0 0 280 36" width="100%" height={36} aria-hidden="true">
        <defs>
          <clipPath id="ac-bar-clip">
            <rect x={0} y={0} width={280} height={36} rx={8} />
          </clipPath>
        </defs>
        <g clipPath="url(#ac-bar-clip)">
          {segments.map((s) => {
            const x = (cumulative / 100) * 280;
            const w = (s.pct / 100) * 280;
            cumulative += s.pct;
            return (
              <rect key={s.label} x={x} y={0} width={w} height={36} fill={s.color} />
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 12 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              {s.label} <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{s.pct}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardData {
  type: ChartType;
  headline: string;
  body: string;
  source: string;
  chart: React.ReactNode;
}

const CARDS: CardData[] = [
  {
    type: "comparative",
    headline:
      "South Asia leads regional performance — Sub-Saharan Africa accounts for the largest gap between achieved and expected results",
    body: "South Asia delivered 112M of 145M expected beneficiaries — the strongest regional rate. Sub-Saharan Africa faces the widest absolute gap, with 66M fewer people reached than the portfolio implied trajectory at this point in the cycle.",
    source: "IDA Scorecard · Health & Nutrition · Regional breakdown · FY25",
    chart: <ComparativeChart />,
  },
  {
    type: "trend",
    headline:
      "IDA21 is running ahead of trajectory on education — climate resilience is the indicator most at risk of falling short by 2030",
    body: "Education results are running 15M ahead of the implied IDA21 trajectory, driven by expansion in South Asia. Climate resilience is the outlier — 24M below trajectory at FY25, with delivery concentrated in a small number of high-value projects rather than broad coverage.",
    source: "IDA Scorecard · Portfolio progress against IDA21 targets · FY24–FY25",
    chart: <TrendChart />,
  },
  {
    type: "compositional",
    headline:
      "Three outcome areas account for 61% of all FY25 results — and two of them are off the pace needed to meet IDA21 targets",
    body: "Health and nutrition, education, and social protection together produced 61% of all FY25 beneficiary results. Of these three, education is ahead of trajectory while health and social protection are running behind the pace required to meet IDA21 end-of-period commitments.",
    source: "IDA Scorecard · All outcome areas · FY25",
    chart: <CompositionalChart />,
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export default function AnalyticsCards() {
  return (
    <section aria-label="Analytics" style={{ marginBottom: 40, fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: "rgba(255,255,255,0.96)",
            lineHeight: "34px",
            letterSpacing: "-1.2px",
            margin: 0,
          }}
        >
          Explore Analyses
        </h2>
        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
          Pre-built analysis · FY25
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {CARDS.map((card) => (
          <AnalyticsCard key={card.headline} card={card} />
        ))}
      </div>
    </section>
  );
}

function AnalyticsCard({ card }: { card: CardData }) {
  return (
    <div
      style={{
        background: "rgba(10,22,38,0.72)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: "18px 18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 2px 16px rgba(0,0,0,0.32)",
      }}
    >
      {/* Headline */}
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: "rgba(255,255,255,0.95)",
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {card.headline}
      </h3>

      {/* Chart */}
      {card.chart}

      {/* Body */}
      <p
        style={{
          margin: 0,
          fontSize: 12.5,
          color: "rgba(255,255,255,0.52)",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {card.body}
      </p>

      {/* Source */}
      <div
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.02em",
          marginTop: "auto",
        }}
      >
        {card.source}
      </div>
    </div>
  );
}
