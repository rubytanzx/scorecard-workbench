// ─────────────────────────────────────────────────────────────────────────────
// WBG Scorecard – Mock Data
// All data is illustrative and editorial in nature.
// ─────────────────────────────────────────────────────────────────────────────

export interface Author {
  initials: string;
  name: string;
  color: string;
}

export interface StoryTag {
  label: string;
  variant: "structural-break" | "peer-divergence" | "methodology-gap" | "concentration-risk" | "trend" | "signal" | "evidence-gap";
}

export type ThumbVariant = "people" | "digital" | "planet" | "fcs";

export interface DrivingIndicator {
  label: string;
  achieved: string;
  percentOfTarget: string;
  color: string;
}

export interface Story {
  id: string;
  tag: StoryTag;
  headline: string;
  description?: string;
  workspaceType: string;
  workspaceIcon: "chart-line" | "access-point" | "bar-chart";
  institutions: string[];
  author: Author;
  ctaLabel: string;
  ctaHref: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  thumbVariant?: ThumbVariant;
  lastUpdated?: string;
  upvotes?: number;
  downvotes?: number;
  connectors?: number;
  /** When set, clicking the story opens the shared-link viewer with this
   * prompt as the underlying artefact — turning the story card into an
   * entry point to a published infographic. */
  viewerPrompt?: string;
  drivingIndicators?: DrivingIndicator[];
  narrativeUrl?: string;
}

export interface FeaturedStory extends Story {
  description: string;
}

export interface IndicatorSubRow {
  label: string;
  achieved: string; // e.g. "1.8M" or "--"
  expected: string; // e.g. "14M"
}

export interface Indicator {
  id: string;
  name: string;        // Full Active Portfolio Results name from the IDA Scorecard
  achieved: string;    // e.g. "146.6M" or "--"
  expected: string;    // e.g. "192.3M" or "-102.7MtCO2eq/year"
  /** Numeric ratio of achieved/expected used to drive sparkline tint. Null when achieved is "--". */
  ratio: number | null;
  sparkline: number[]; // 5 mocked points (0–1 range)
  methodologyNote: string;
  methodologyUrl?: string;
  subRows?: IndicatorSubRow[];
  comingSoon?: boolean; // true for "More and better-paid jobs"
}

// ─── Topics Trending ─────────────────────────────────────────────────────────

export const featuredStory: FeaturedStory = {
  id: "featured-1",
  tag: { label: "Peer Divergence · FCS Focus", variant: "peer-divergence" },
  headline: "IDA countries in FCS delivering 2.3× more health coverage per dollar than non-FCS IDA peers",
  description:
    "Targeted health systems investments in fragile states are showing outsized efficiency gains — 370M people reached against a 425M pipeline. Reform sequencing, not aid volume, appears to be the primary driver.",
  workspaceType: "Trend",
  workspaceIcon: "chart-line",
  institutions: ["IDA", "FCS"],
  author: { initials: "KR", name: "Kofi Rana", color: "#2563eb" },
  ctaLabel: "View FCS health coverage analysis",
  ctaHref: "#",
  imageSrc: "/images/IDA-1.png",
  imageAlt: "Health workers in a fragile-states clinic",
  lastUpdated: "Mar 19, 2025",
  upvotes: 312,
  downvotes: 11,
  connectors: 9,
};

export const secondaryStories: Story[] = [
  {
    id: "story-1",
    tag: { label: "Peer Divergence · Sub-Saharan Africa", variant: "peer-divergence" },
    headline: "FY25 IDA delivery reaches 939M in extreme-poverty countries — Infrastructure and Planet trail plan most",
    workspaceType: "Infographic",
    workspaceIcon: "bar-chart",
    institutions: ["IDA", "AFE", "AFW"],
    author: { initials: "RT", name: "Ruby Tan", color: "#0891b2" },
    ctaLabel: "Open shared infographic",
    ctaHref: "#",
    imageSrc: "/images/IDA-2.png",
    imageAlt: "Cross-pillar IDA delivery in Sub-Saharan Africa",
    lastUpdated: "May 5, 2026",
    upvotes: 184, downvotes: 4, connectors: 6,
    viewerPrompt:
      "Is IDA making a difference for people in extreme poverty in Sub-Saharan Africa?",
  },
  {
    id: "story-2",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "Digital connectivity surge — but 62% of LIC countries still unmapped for broadband reach",
    workspaceType: "Trend",
    workspaceIcon: "chart-line",
    institutions: ["IDA", "AFW"],
    author: { initials: "DN", name: "Dina N.", color: "#0891b2" },
    ctaLabel: "View broadband mapping gaps",
    ctaHref: "#",
    imageSrc: "/images/IDA-3.png",
    imageAlt: "Global network connectivity from space",
    lastUpdated: "Mar 9, 2025",
    upvotes: 156, downvotes: 23, connectors: 6,
    narrativeUrl: "https://scorecard.worldbank.org/en/narratives/digital-connectivity/results-narrative",
    drivingIndicators: [
      { label: "People Using Broadband Internet", achieved: "176.6M", percentOfTarget: "41%", color: "#00A0DF" },
    ],
  },
  {
    id: "story-3",
    tag: { label: "Emerging Signal", variant: "signal" },
    headline: "Climate resilience targets at 57% of pipeline — LDCs outpacing middle-income IDA borrowers",
    workspaceType: "Trend",
    workspaceIcon: "chart-line",
    institutions: ["IDA", "EAP"],
    author: { initials: "CS", name: "Carlos S.", color: "#a101a1" },
    ctaLabel: "View LDC climate analysis",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/story/story-3",
    imageSrc: "/images/IDA-4.png",
    imageAlt: "Climate-resilient infrastructure in an LDC setting",
    lastUpdated: "Mar 17, 2025",
    upvotes: 231, downvotes: 5, connectors: 7,
    narrativeUrl: "https://scorecard.worldbank.org/en/narratives/green-and-blue-planet/results-narrative",
    drivingIndicators: [
      { label: "Hectares of Conserved Land and Water", achieved: "92.7M", percentOfTarget: "75%", color: "#2E8B57" },
      { label: "Beneficiaries of Better Climate Risk Resilience", achieved: "136M", percentOfTarget: "32%", color: "#00A0DF" },
      { label: "Greenhouse Gas Emissions", achieved: "—", percentOfTarget: "—", color: "#6B4FA0" },
    ],
  },
];

// ─── What's Changing Right Now ────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface ChangingCard {
  id: string;
  tag: StoryTag;
  headline: string;
  workspaceType: string;
  institutions: string[];
  ctaLabel: string;
  ctaHref: string;
  chartType: "grouped-bar" | "area" | "multi-area";
  chartData: ChartDataPoint[];
  legend: { label: string; color: string }[];
  /** When set, clicking the card opens the shared-link viewer for this
   * prompt — wiring the home-page card to a pre-generated artefact. */
  viewerPrompt?: string;
}

export const changingCards: ChangingCard[] = [
  {
    id: "changing-1",
    tag: { label: "Concentration Risk · FCS", variant: "concentration-risk" },
    headline: "5 IDA-FCS countries account for ~37% of FY25 health-services shortfall",
    workspaceType: "Infographic",
    institutions: ["IDA", "FCS", "MENAAP"],
    ctaLabel: "Open shared infographic",
    ctaHref: "#",
    chartType: "grouped-bar",
    chartData: [
      { label: "Yemen",   value: 1.2, secondary: 3.2 },
      { label: "Sudan",   value: 1.7, secondary: 4.1 },
      { label: "Afgh.",   value: 2.4, secondary: 5.5 },
      { label: "S.Sudan", value: 0.6, secondary: 1.3 },
      { label: "Myanmar", value: 1.5, secondary: 3.1 },
    ],
    legend: [
      { label: "FY25 achieved (M people)", color: "#dc2626" },
      { label: "FY25 target (M people)",   color: "#fca5a5" },
    ],
    viewerPrompt:
      "Which countries are furthest behind on health services targets in FY25 — and what's driving the gap?",
  },
  {
    id: "changing-2",
    tag: { label: "Methodology Gap", variant: "methodology-gap" },
    headline: "Gender equality results rising — but beneficiary counting methodology varies across 14 IDA projects",
    workspaceType: "Signal",
    institutions: ["IDA", "IBRD", "MIGA"],
    ctaLabel: "Review gender inclusion methodology",
    ctaHref: "#",
    chartType: "multi-area",
    chartData: [
      { label: "Q1", value: 42, secondary: 61 },
      { label: "Q2", value: 48, secondary: 58 },
      { label: "Q3", value: 53, secondary: 67 },
      { label: "Q4", value: 58, secondary: 71 },
      { label: "Q5", value: 62, secondary: 75 },
      { label: "Q6", value: 69, secondary: 78 },
    ],
    legend: [
      { label: "Global Average", color: "#94a3b8" },
      { label: "LCR (flat)", color: "#3b82f6" },
    ],
  },
  {
    id: "changing-3",
    tag: { label: "Stalling", variant: "peer-divergence" },
    headline: "6 Scorecard indicators stalling across LCR — no advancement in 24 months",
    workspaceType: "Signal",
    institutions: ["IDA", "LCR"],
    ctaLabel: "View LCR stalled indicators",
    ctaHref: "#",
    chartType: "area",
    chartData: [
      { label: "FY21", value: 72 },
      { label: "FY22", value: 69 },
      { label: "FY23", value: 71 },
      { label: "FY24", value: 68 },
      { label: "FY25", value: 67 },
    ],
    legend: [
      { label: "Stalling Indicators", color: "#f97316" },
    ],
  },
];

// ─── Counter Intuitive Findings ───────────────────────────────────────────────

export interface CounterIntuitiveCard {
  id: string;
  tag: StoryTag;
  headline: string;
  workspaceType: string;
  institutions: string[];
  ctaLabel: string;
  ctaHref: string;
  chartType: "bar" | "donut" | "area-annotated";
  chartData: ChartDataPoint[];
  donutData?: { label: string; value: number; color: string }[];
  annotation?: string;
  legend?: { label: string; color: string }[];
}

export const counterIntuitiveCards: CounterIntuitiveCard[] = [
  {
    id: "counter-1",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Few large IDA projects ≠ portfolio strength",
    workspaceType: "Robust",
    institutions: ["IDA", "AFE", "AFW"],
    ctaLabel: "View concentration risk across 14 indicators",
    ctaHref: "#",
    chartType: "bar",
    chartData: [
      { label: "1–2", value: 38 },
      { label: "3–5", value: 62 },
      { label: "6–10", value: 55 },
      { label: "11+", value: 29 },
    ],
    legend: [
      { label: "PCE Score", color: "#3b82f6" },
      { label: "Benchmark", color: "#e2e8f0" },
    ],
  },
  {
    id: "counter-2",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Gender equality rising — methodology questions persist",
    workspaceType: "Trend",
    institutions: ["IDA", "IBRD", "MIGA"],
    ctaLabel: "View mapping gaps",
    ctaHref: "#",
    chartType: "donut",
    chartData: [],
    donutData: [
      { label: "62% mapped", value: 62, color: "#3b82f6" },
      { label: "38% unmapped", value: 38, color: "#e2e8f0" },
    ],
  },
  {
    id: "counter-3",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Client context gains ≠ WBG impact in IDA countries",
    workspaceType: "Trend",
    institutions: ["IDA", "LCR"],
    ctaLabel: "View context vs intervention attribution",
    ctaHref: "#",
    chartType: "area-annotated",
    chartData: [
      { label: "FY21", value: 55, secondary: 38 },
      { label: "FY22", value: 59, secondary: 44 },
      { label: "FY23", value: 64, secondary: 51 },
      { label: "FY24", value: 61, secondary: 58 },
      { label: "FY25", value: 68, secondary: 63 },
    ],
    annotation: "GDP Growth",
    legend: [
      { label: "GDP Growth", color: "#94a3b8" },
      { label: "WBG Results", color: "#3b82f6" },
    ],
  },
];

// ─── Explore by Patterns ─────────────────────────────────────────────────────

export interface PatternCard {
  id: string;
  headline: string;
  description: string;
  href: string;
}

export const patternCards: PatternCard[] = [
  {
    id: "pattern-1",
    headline: "Indicators flat for 2+ years",
    description:
      "Scorecard indicators with no advancement over 24 months, suggesting structural barriers rather than cyclical dips.",
    href: "#",
  },
  {
    id: "pattern-2",
    headline: "Peer groups with mismatched contexts",
    description:
      "IDA countries benchmarked against peers with fundamentally different income levels, fragility status, or portfolio size.",
    href: "#",
  },
  {
    id: "pattern-3",
    headline: "Projects contributing to 4+ indicators",
    description:
      "Multi-indicator IDA projects that could be replicated or scaled — high-leverage portfolio positions.",
    href: "#",
  },
];

// ─── Story-3 notebook boards ──────────────────────────────────────────────────

export const story3Notebooks: Story[] = [
  {
    id: "nb-1",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "Mexico Country Scorecard",
    workspaceType: "Scorecard Overview",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IFC", "IDA"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "View full Mexico FY25 outcome analysis",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-1.jpg",
    imageAlt: "Mexico Country Scorecard",
    lastUpdated: "Mar 12, 2025",
    upvotes: 142, downvotes: 8, connectors: 5,
  },
  {
    id: "nb-2",
    tag: { label: "Evidence Gap", variant: "evidence-gap" },
    headline: "Mexico DPF Results Analysis",
    workspaceType: "Portfolio Deep-dive",
    workspaceIcon: "bar-chart",
    institutions: ["IBRD"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "Unpack P503988 indicator gaps",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-2.jpg",
    imageAlt: "Mexico DPF Results Analysis",
    lastUpdated: "Feb 28, 2025",
    upvotes: 87, downvotes: 21, connectors: 3,
  },
  {
    id: "nb-3",
    tag: { label: "Structural Break", variant: "structural-break" },
    headline: "Education & Safety Net Gap — Mexico",
    workspaceType: "Gap Analysis",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IDA"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "See why Mexico records zero WB contribution",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-3.jpg",
    imageAlt: "Education & Safety Net Gap — Mexico",
    lastUpdated: "Mar 5, 2025",
    upvotes: 113, downvotes: 14, connectors: 7,
  },
  {
    id: "nb-4",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "LAC Social Protection Benchmarks",
    workspaceType: "Regional Benchmark",
    workspaceIcon: "bar-chart",
    institutions: ["IDA", "IBRD", "LCR"],
    author: { initials: "DS", name: "Dina El-Sayed", color: "#0891b2" },
    ctaLabel: "Compare coverage across 5 LAC peers",
    ctaHref: "/workspace/lac-regional-fy25",
    href: "/workspace/lac-regional-fy25",
    imageSrc: "/images/nb-4.jpg",
    imageAlt: "LAC social protection recipients in a community setting",
    lastUpdated: "Mar 1, 2025",
    upvotes: 64, downvotes: 31, connectors: 2,
  },
  {
    id: "nb-5",
    tag: { label: "Concentration Risk", variant: "concentration-risk" },
    headline: "Financial Inclusion Gap — LAC Region",
    workspaceType: "Indicator Analysis",
    workspaceIcon: "access-point",
    institutions: ["IFC", "MIGA"],
    author: { initials: "AO", name: "Amara Osei", color: "#2563eb" },
    ctaLabel: "Map the 28-point account ownership gap",
    ctaHref: "/workspace/mexico-fy25/view",
    href: "/workspace/mexico-fy25/view",
    imageSrc: "/images/nb-5.jpg",
    imageAlt: "Woman using mobile banking in Latin America",
    lastUpdated: "Feb 14, 2025",
    upvotes: 113, downvotes: 14, connectors: 4,
  },
  {
    id: "nb-6",
    tag: { label: "Peer Divergence", variant: "peer-divergence" },
    headline: "Learning Poverty: LAC Peer Comparison",
    workspaceType: "Peer Analysis",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IDA"],
    author: { initials: "RK", name: "Rajiv Khanna", color: "#7c3aed" },
    ctaLabel: "Explore the 20-point gap to Chile",
    ctaHref: "/workspace/chile-education",
    href: "/workspace/chile-education",
    imageSrc: "/images/nb-6.jpg",
    imageAlt: "Primary school children in a Latin American classroom",
    lastUpdated: "Mar 18, 2025",
    upvotes: 198, downvotes: 3, connectors: 6,
  },
];

export const story3PeerBoards: Story[] = [
  {
    id: "pb-1",
    tag: { label: "Trend", variant: "trend" },
    headline: "Brazil LAC Portfolio Review",
    workspaceType: "Portfolio Review",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IFC"],
    author: { initials: "AO", name: "Amara Osei", color: "#2563eb" },
    ctaLabel: "See how 6 education projects reach 48M students",
    ctaHref: "/workspace/brazil-lac-fy25",
    href: "/workspace/brazil-lac-fy25",
    imageSrc: "/images/pb-1.jpg",
    imageAlt: "Schoolchildren in a Brazilian classroom",
    lastUpdated: "Mar 10, 2025",
    upvotes: 113, downvotes: 14, connectors: 8,
  },
  {
    id: "pb-2",
    tag: { label: "Signal", variant: "signal" },
    headline: "Chile Education Outcomes",
    workspaceType: "Scorecard Overview",
    workspaceIcon: "bar-chart",
    institutions: ["IBRD"],
    author: { initials: "DS", name: "Dina El-Sayed", color: "#0891b2" },
    ctaLabel: "Explore Chile's 27.2% learning poverty rate",
    ctaHref: "/workspace/chile-education",
    href: "/workspace/chile-education",
    imageSrc: "/images/pb-2.jpg",
    imageAlt: "Students reading in a Chilean school",
    lastUpdated: "Mar 3, 2025",
    upvotes: 87, downvotes: 21, connectors: 3,
  },
  {
    id: "pb-3",
    tag: { label: "Signal", variant: "signal" },
    headline: "Colombia UHC Assessment",
    workspaceType: "Health Outcomes",
    workspaceIcon: "access-point",
    institutions: ["IBRD", "IDA"],
    author: { initials: "RK", name: "Rajiv Khanna", color: "#7c3aed" },
    ctaLabel: "Unpack 760K+ health results from 2 projects",
    ctaHref: "/workspace/colombia-uhc",
    href: "/workspace/colombia-uhc",
    imageSrc: "/images/pb-3.jpg",
    imageAlt: "Healthcare worker with patients in Colombia",
    lastUpdated: "Feb 20, 2025",
    upvotes: 142, downvotes: 8, connectors: 5,
  },
  {
    id: "pb-4",
    tag: { label: "Trend", variant: "trend" },
    headline: "Peru Climate Portfolio",
    workspaceType: "Climate Analysis",
    workspaceIcon: "chart-line",
    institutions: ["IBRD", "IFC"],
    author: { initials: "CM", name: "Carlos Mendoza", color: "#a101a1" },
    ctaLabel: "Map Peru's net emissions reduction strategy",
    ctaHref: "/workspace/peru-climate",
    href: "/workspace/peru-climate",
    imageSrc: "/images/pb-4.jpg",
    imageAlt: "Andean forest and renewable energy infrastructure in Peru",
    lastUpdated: "Mar 15, 2025",
    upvotes: 64, downvotes: 31, connectors: 4,
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export interface PulseMetric {
  id: string;
  value: string;
  delta: string;
  deltaDirection: "up" | "down" | "warning";
  label: string;
}

export const pulseMetrics: PulseMetric[] = [
  { id: "pm-1", value: "325M", delta: "12%", deltaDirection: "up", label: "Students supported through WBG education programs" },
  { id: "pm-2", value: "244M", delta: "12%", deltaDirection: "up", label: "People benefiting from social safety nets" },
  { id: "pm-3", value: "215M", delta: "576M expected", deltaDirection: "warning", label: "People connected to electricity" },
  { id: "pm-4", value: "244M", delta: "425M Expected", deltaDirection: "warning", label: "People with strengthened climate resilience" },
];

export const trackingMetrics: PulseMetric[] = [
  { id: "tm-1", value: "370M", delta: "12%", deltaDirection: "up", label: "People accessing health services" },
  { id: "tm-2", value: "217M", delta: "2x vs FY24", deltaDirection: "up", label: "People with broadband access" },
  { id: "tm-3", value: "56", delta: "Persists", deltaDirection: "warning", label: "Countries collecting below 15% tax-to-GDP" },
  { id: "tm-4", value: "93M ha", delta: "12%", deltaDirection: "up", label: "Hectares under improved conservation" },
];

export interface BiggestMover {
  id: string;
  label: string;
  sublabel: string;
  delta: string;
  deltaDirection: "up" | "down" | "new";
}

export const biggestMovers: BiggestMover[] = [
  {
    id: "bm-1",
    label: "Broadband Access",
    sublabel: "Guinea-Bissau digital reforms; IDA + IFC push",
    delta: "+108%",
    deltaDirection: "up",
  },
  {
    id: "bm-2",
    label: "Renewable Electricity Capacity",
    sublabel: "Surged from 20 GW to 34 GW in one year",
    delta: "+75%",
    deltaDirection: "up",
  },
  {
    id: "bm-3",
    label: "Private capital enabled - fragile states",
    sublabel: "IDA countries seeing minimal PCE pipeline for FY27",
    delta: "-18%",
    deltaDirection: "down",
  },
  {
    id: "bm-4",
    label: "Jobs Indicator",
    sublabel: "Final Methodology Under Consultation – First report expected FY26",
    delta: "New",
    deltaDirection: "new",
  },
];

export interface ScorecardVertical {
  id: string;
  label: string;
  value: number;
  color: string;
}

export const scorecardVerticals: ScorecardVertical[] = [
  { id: "sv-1", label: "People",         value: 68, color: "#00c853" },
  { id: "sv-2", label: "Prosperity",     value: 52, color: "#f57c00" },
  { id: "sv-3", label: "Planet",         value: 45, color: "#f57c00" },
  { id: "sv-4", label: "Infrastructure", value: 41, color: "#d84315" },
  { id: "sv-5", label: "Digital",        value: 50, color: "#f57c00" },
];

// ─── Results Band Indicators ──────────────────────────────────────────────────

export const indicators: Indicator[] = [
  {
    id: "ind-safety-nets",
    name: "Beneficiaries of social safety net programs",
    achieved: "171.6M",
    expected: "176.2M",
    ratio: 171.6 / 176.2,
    sparkline: [0.55, 0.62, 0.58, 0.68, 0.65, 0.74, 0.71, 0.82, 0.88, 0.95],
    methodologyNote:
      "People benefiting from social protection programs including cash transfers, food vouchers, and social insurance schemes.",
  },
  {
    id: "ind-students",
    name: "Students supported with better education",
    achieved: "100.8M",
    expected: "174.7M",
    ratio: 100.8 / 174.7,
    sparkline: [0.32, 0.38, 0.35, 0.42, 0.40, 0.47, 0.45, 0.52, 0.56, 0.58],
    methodologyNote:
      "Students benefiting from WBG education investments across primary, secondary, and tertiary levels in IDA countries.",
  },
  {
    id: "ind-health-services",
    name: "People receiving quality health, nutrition, and population services",
    achieved: "225.4M",
    expected: "268.6M",
    ratio: 225.4 / 268.6,
    sparkline: [0.54, 0.61, 0.57, 0.66, 0.72, 0.69, 0.75, 0.79, 0.76, 0.84],
    methodologyNote:
      "People accessing quality health, nutrition, and population services through IDA-supported projects. Includes primary care, maternal health, and community health workers.",
  },
  {
    id: "ind-health-emergencies",
    name: "Countries benefitting from strengthened capacity to prevent, detect, and respond to health emergencies",
    achieved: "14",
    expected: "42",
    ratio: 14 / 42,
    sparkline: [0.10, 0.15, 0.12, 0.20, 0.18, 0.25, 0.22, 0.28, 0.30, 0.33],
    methodologyNote:
      "IDA countries that have strengthened their capacity to prepare for and respond to health emergencies through IDA-financed programs.",
  },
  {
    id: "ind-debt",
    name: "Percentage of countries in or at high risk of debt distress that implemented reforms towards debt sustainability",
    achieved: "76.7%",
    expected: "83.7%",
    ratio: 76.7 / 83.7,
    sparkline: [0.60, 0.67, 0.63, 0.70, 0.74, 0.71, 0.78, 0.76, 0.85, 0.92],
    methodologyNote:
      "Share of IDA countries in or at high risk of debt distress that have implemented debt sustainability reforms supported by WBG programs.",
  },
  {
    id: "ind-tax",
    name: "Countries with tax revenues-to-GDP ratio at or below 15% (including social security contributions) that have increased collections, considering equity",
    achieved: "18",
    expected: "26",
    ratio: 18 / 26,
    sparkline: [0.40, 0.46, 0.43, 0.51, 0.56, 0.52, 0.60, 0.64, 0.61, 0.69],
    methodologyNote:
      "IDA countries that have increased tax-to-GDP ratios through WBG-supported fiscal reform programs, with equity considerations applied.",
  },
  {
    id: "ind-ghg",
    name: "Net greenhouse gas emissions (GHG)",
    achieved: "--",
    expected: "-102.7MtCO2eq/year",
    ratio: null,
    sparkline: [0.48, 0.52, 0.50, 0.49, 0.51, 0.50, 0.48, 0.52, 0.50, 0.51],
    methodologyNote:
      "Net greenhouse gas emission reductions attributable to IDA-financed climate mitigation projects, measured over project lifetime. Reporting pending for FY25.",
  },
  {
    id: "ind-climate-resilience",
    name: "Beneficiaries with enhanced resilience to climate risks",
    achieved: "104M",
    expected: "268.1M",
    ratio: 104 / 268.1,
    sparkline: [0.18, 0.23, 0.20, 0.27, 0.25, 0.31, 0.29, 0.35, 0.33, 0.39],
    methodologyNote:
      "People with strengthened climate resilience through IDA adaptation projects, early-warning systems, and climate-smart infrastructure.",
  },
  {
    id: "ind-hectares",
    name: "Hectares of terrestrial and aquatic areas under enhanced conservation/management",
    achieved: "39.3M",
    expected: "59.3M",
    ratio: 39.3 / 59.3,
    sparkline: [0.45, 0.51, 0.48, 0.55, 0.59, 0.56, 0.62, 0.60, 0.64, 0.66],
    methodologyNote:
      "Land and aquatic area brought under enhanced natural-resource management, including forests, wetlands, and protected marine areas.",
  },
  {
    id: "ind-wash",
    name: "People provided with water, sanitation, and/or hygiene, and the number provided with safely managed services",
    achieved: "41.3M",
    expected: "90.1M",
    ratio: 41.3 / 90.1,
    sparkline: [0.20, 0.26, 0.23, 0.31, 0.36, 0.33, 0.39, 0.43, 0.41, 0.46],
    methodologyNote:
      "People with access to improved water supply, sanitation, and hygiene through IDA WASH investments. The total figure is broken out by safely managed services as a sub-row.",
    subRows: [
      { label: "Total", achieved: "41.3M", expected: "90.1M" },
      { label: "Safely managed", achieved: "1.8M", expected: "14M" },
    ],
  },
  {
    id: "ind-food-security",
    name: "People with strengthened food and nutrition security",
    achieved: "146.6M",
    expected: "192.3M",
    ratio: 146.6 / 192.3,
    sparkline: [0.45, 0.53, 0.49, 0.58, 0.63, 0.60, 0.68, 0.65, 0.72, 0.76],
    methodologyNote:
      "People with improved food and nutrition security outcomes through IDA agriculture, nutrition, and resilient food-systems investments.",
  },
  {
    id: "ind-transport",
    name: "People that benefit from improved access to sustainable transport infrastructure and services",
    achieved: "84.3M",
    expected: "277.5M",
    ratio: 84.3 / 277.5,
    sparkline: [0.16, 0.21, 0.18, 0.24, 0.22, 0.27, 0.25, 0.29, 0.27, 0.30],
    methodologyNote:
      "People benefiting from improved transport infrastructure and services through IDA-financed sustainable transport projects.",
  },
  {
    id: "ind-electricity",
    name: "People provided with access to electricity",
    achieved: "86.7M",
    expected: "205.7M",
    ratio: 86.7 / 205.7,
    sparkline: [0.20, 0.27, 0.24, 0.32, 0.30, 0.36, 0.34, 0.39, 0.37, 0.42],
    methodologyNote:
      "People gaining first-time or improved electricity access through IDA energy projects, including grid and off-grid solutions.",
  },
  {
    id: "ind-renewable-energy",
    name: "GW of renewable energy capacity enabled",
    achieved: "4.8GW",
    expected: "26.64GW",
    ratio: 4.8 / 26.64,
    sparkline: [0.10, 0.13, 0.11, 0.15, 0.14, 0.16, 0.15, 0.17, 0.16, 0.18],
    methodologyNote:
      "Gigawatts of renewable energy capacity enabled through IDA-financed energy projects, including solar, wind, hydro, and geothermal.",
  },
  {
    id: "ind-broadband",
    name: "People using broadband internet",
    achieved: "64.8M",
    expected: "142.1M",
    ratio: 64.8 / 142.1,
    sparkline: [0.20, 0.27, 0.24, 0.33, 0.38, 0.35, 0.42, 0.40, 0.44, 0.46],
    methodologyNote:
      "People with improved broadband access through IDA digital infrastructure projects. Includes mobile broadband where fixed broadband is unavailable.",
  },
  {
    id: "ind-digital-services",
    name: "People using digitally enabled services",
    achieved: "25M",
    expected: "76.4M",
    ratio: 25 / 76.4,
    sparkline: [0.15, 0.19, 0.17, 0.22, 0.26, 0.23, 0.29, 0.27, 0.31, 0.33],
    methodologyNote:
      "People using government or commercial services delivered through digital platforms supported by IDA-financed digital economy projects.",
  },
  {
    id: "ind-gender-equality",
    name: "People benefiting from actions to advance gender equality, and the number benefitting from actions that expand and enable economic opportunities",
    achieved: "191.8M",
    expected: "307.2M",
    ratio: 191.8 / 307.2,
    sparkline: [0.42, 0.48, 0.45, 0.52, 0.55, 0.52, 0.58, 0.56, 0.60, 0.62],
    methodologyNote:
      "Women and girls benefiting from programs explicitly targeting gender gaps in education, health, finance, and labor markets. Sub-rows break out beneficiaries of economic-opportunity actions specifically.",
    subRows: [
      { label: "Total", achieved: "191.8M", expected: "307.2M" },
      {
        label: "Beneficiaries of actions to expand and enable economic opportunities",
        achieved: "67.7M",
        expected: "128.1M",
      },
    ],
  },
  {
    id: "ind-financial-services",
    name: "People and businesses using financial services, including the number of women",
    achieved: "44.4M",
    expected: "26M",
    ratio: 44.4 / 26,
    sparkline: [0.56, 0.65, 0.72, 0.80, 0.76, 0.88, 0.92, 0.97, 1.00, 1.00],
    methodologyNote:
      "People and businesses accessing financial services in IDA countries through IFC and IDA-supported financial sector projects. Sub-rows isolate the female beneficiary count.",
    subRows: [
      { label: "Total", achieved: "44.4M", expected: "26M" },
      { label: "Female", achieved: "19.2M", expected: "10.6M" },
    ],
  },
  {
    id: "ind-jobs",
    name: "More and better-paid jobs (Coming soon)",
    achieved: "--",
    expected: "--",
    ratio: null,
    sparkline: [0.50, 0.53, 0.51, 0.49, 0.52, 0.50, 0.53, 0.51, 0.49, 0.52],
    methodologyNote:
      "Final methodology under consultation. First IDA-wide report on jobs outcomes expected in FY26.",
    comingSoon: true,
  },
  {
    id: "ind-displaced-people",
    name: "Displaced people and people in host communities provided with services and livelihoods",
    achieved: "9.2M",
    expected: "34.7M",
    ratio: 9.2 / 34.7,
    sparkline: [0.15, 0.19, 0.17, 0.21, 0.20, 0.23, 0.22, 0.25, 0.24, 0.27],
    methodologyNote:
      "Forcibly displaced people and host communities supported through IDA projects addressing protection, livelihoods, and durable solutions.",
  },
  {
    id: "ind-private-capital-enabled",
    name: "Total private capital enabled",
    achieved: "--",
    expected: "$25.8B",
    ratio: null,
    sparkline: [0.51, 0.49, 0.52, 0.50, 0.48, 0.51, 0.50, 0.53, 0.49, 0.51],
    methodologyNote:
      "Total private capital enabled through IDA-supported projects. Includes IFC upstream work and WBG advisory engagements that facilitate private investment. Reporting pending for FY25.",
  },
  {
    id: "ind-private-capital-mobilized",
    name: "Total private capital mobilized",
    achieved: "--",
    expected: "$17.1B",
    ratio: null,
    sparkline: [0.49, 0.51, 0.50, 0.53, 0.50, 0.48, 0.51, 0.50, 0.52, 0.49],
    methodologyNote:
      "Private capital mobilized by IFC and MIGA in IDA-eligible countries, measured at commitment. Excludes sub-national guarantees. Reporting pending for FY25.",
  },
];

// ─── Trending Across IDA ──────────────────────────────────────────────────────

export interface TrendingProgress {
  pct: number;                   // 0..100, controls the filled bar width
  tone: "green" | "amber" | "red";
  footnote: string;              // e.g. "37% of 575.6M expected  •  -6% vs FY24"
}

export interface TrendingTopCard {
  tag: string;
  headline: string;
  description: string;
  progress: TrendingProgress;
  ctaLabel: string;
  linkedOutcomeAreas: OutcomeAreaRef[];
}

export interface TrendingSideCard {
  id: string;
  tag: string;
  headline: string;
  subtitle: string;
  progress: TrendingProgress;
  ctaLabel: string;
  linkedOutcomeAreas: OutcomeAreaRef[];
}

export const trendingTop: TrendingTopCard = {
  tag: "People Pillar",
  headline: "People targets lead IDA21 at 68% — social protection and health are pulling the pack",
  description:
    "The People pillar is IDA21's best-performing cluster in FY25. Social safety nets reached 244M beneficiaries (78% of the 313M target) and health services covered 370M people (87% of target) — both accelerating +12% year-on-year. The remaining gap is concentrated in fragile and conflict-affected states, where pipeline operations are slower to disburse. If FCS delivery rates hold through FY26, the pillar is on track to close above 80%.",
  progress: {
    pct: 68,
    tone: "green",
    footnote: "68% aggregate across People indicators  •  5 of 7 on track  •  +9% vs FY24",
  },
  ctaLabel: "Explore People Targets",
  linkedOutcomeAreas: [
    {
      name: "Protection for the Poorest",
      iconSrc: "/outcome%20areas/protection%20for%20the%20pooresr.svg",
    },
    {
      name: "Healthier Lives",
      iconSrc: "/outcome%20areas/healthier%20lives.svg",
    },
    {
      name: "Learning Poverty",
      iconSrc: "/outcome%20areas/learning%20poverty.svg",
    },
  ],
};

export const trendingSides: TrendingSideCard[] = [
  {
    id: "social-protection",
    tag: "Infrastructure",
    headline: "Electricity access is the sharpest target miss — 215M of 576M reached",
    subtitle: "Infrastructure pillar at 41%; energy operations in FCS states mature slowly",
    progress: {
      pct: 41,
      tone: "red",
      footnote: "41% of IDA21 infrastructure target  •  energy access at 37%  •  -6% vs FY24",
    },
    ctaLabel: "Explore Infrastructure Targets",
    linkedOutcomeAreas: [
      {
        name: "Affordable, Reliable and Sustainable Energy for All",
        iconSrc: "/outcome%20areas/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg",
      },
      {
        name: "Connected Communities",
        iconSrc: "/outcome%20areas/Connected%20Communities.svg",
      },
    ],
  },
  {
    id: "planet",
    tag: "Planet",
    headline: "Planet pillar at 45% — climate resilience trails as ambition scales up",
    subtitle: "244M beneficiaries of 425M climate target; 93M hectares conserved (+12% YoY)",
    progress: {
      pct: 45,
      tone: "amber",
      footnote: "45% of IDA21 planet target  •  conservation +12% YoY  •  co-finance rising",
    },
    ctaLabel: "Explore Planet Targets",
    linkedOutcomeAreas: [
      {
        name: "Green and Blue Planet and Resilient Populations",
        iconSrc: "/outcome%20areas/Green%20and%20Blue%20Planet%20and%20Resilient%20Populations.svg",
      },
      {
        name: "Sustainable Food Systems",
        iconSrc: "/outcome%20areas/Sustainable%20Food%20Systems.svg",
      },
    ],
  },
];

// ─── Momentum Groups (Latest Indicator Movements) ─────────────────────────────

export interface InsightComposer {
  type: "Performance Pattern" | "Benchmark Comparison" | "Tension Finding" | "Methodology Note";
  finding: string;
  evidence: string[];
  citation: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceNote?: string;
  narrativeBridge?: string; // only populate when confidence is HIGH
}

export interface MomentumRow {
  label: string;
  delta: string;       // "+11.2%" | "-6.3%" | "New"
  iconSrc: string;     // path under /public, URL-encoded
  achieved?: string;   // e.g. "217M" or "+108%"
  expected?: string;   // pipeline target, e.g. "100M"
  insight?: string;
  structuredInsight?: InsightComposer;
  /** Surfaced instead of structuredInsight when the follow-up is causal ("why", "what caused", "explain"). */
  whyInsight?: InsightComposer;
  achievedGeoRegions?: string[];
  achievedGeoData?: Record<string, string>;
  expectedGeoRegions?: string[];
  expectedGeoData?: Record<string, string>;
}

export interface GeoCountryDetail {
  indicatorName?: string;
  achieved: string;
  expected?: string;
  projects?: number;
}

export interface MomentumGroup {
  id: "accelerating" | "slowing" | "emerging";
  title: string;
  subtitle: string;
  /** Composed insight paragraph surfaced in the conversation view when the card is opened. */
  insight: string;
  structuredInsight?: InsightComposer;
  rows: MomentumRow[];
  suggestedPrompts: string[];
  /** Country names (matching Natural Earth NAME property) to highlight on the globe. */
  geoRegions?: string[];
  /** Short note per country shown in the globe tooltip. Falls back to group title. */
  geoData?: Record<string, string>;
  /** Structured achieved/expected data per country for richer popup display. */
  geoDetailData?: Record<string, GeoCountryDetail>;
}

const OA = "/outcome%20areas";

export const momentumGroups: MomentumGroup[] = [
  {
    id: "accelerating",
    title: "High-Performing Indicators",
    subtitle: "Outcomes gaining momentum",
    insight: "These three indicators are running well ahead of target, reflecting stronger-than-expected delivery in digital and energy sectors. Broadband access has more than doubled its FY25 target, driven by large-scale IDA investments across Africa and Asia. Renewable energy capacity enabled has outpaced its target by 75%, while digital services uptake continues to accelerate across IDA countries. Together they signal strong momentum in the connectivity and clean energy agenda — though the gap between headline numbers and on-the-ground access quality warrants closer examination before citing these as confirmed impact.",
    rows: [
      {
        label: "People using broadband internet",
        delta: "+108%",
        iconSrc: `${OA}/Digital%20Connectivity.svg`,
        achieved: "217M",
        expected: "100M",
        insight: "IDA-supported broadband programmes have dramatically outpaced targets — 217M people connected against a 100M plan. Bangladesh alone accounts for 38M new subscribers, while Vietnam, Kenya, and Rwanda have seen government-IDA co-funded fibre rollouts more than double expected coverage. The result reflects improved digital infrastructure investment sequencing and partnerships with telecom operators that unlocked private capital at scale.",
        structuredInsight: {
          type: "Performance Pattern",
          finding: "IDA broadband programmes have more than doubled their FY25 target — 217 million people connected against a plan of 100 million.",
          evidence: [
            "Bangladesh enrolled 38M new subscribers — 108% above its country target (ISR P161806, FY25)",
            "Vietnam, Kenya, and Rwanda each saw government–IDA co-funded fibre rollouts exceed projected coverage",
            "Telecom partnerships mobilised private capital at scale, accelerating deployment across 8 IDA countries",
          ],
          citation: "Scorecard Results Indicator Data FY25; ISRs P161806 (Bangladesh), P152100 (Kenya), P165537 (Vietnam)",
          confidence: "MEDIUM",
          confidenceNote: "Figures validated for the five largest contributing countries. Data for three smaller portfolio countries subject to ISR reporting lag.",
        },
        whyInsight: {
          type: "Performance Pattern",
          finding: "Three converging factors explain the broadband surge: post-pandemic sovereign demand, a telecom co-investment model that unlocked private capital, and faster spectrum licensing that halved rollout timelines in key markets.",
          evidence: [
            "Post-pandemic recovery plans in Bangladesh, Vietnam, and Kenya aligned national digital investment with IDA financing — amplifying scale and reducing procurement delays",
            "IDA's public-private rollout framework across 8 countries backstopped last-mile infrastructure risk, enabling private operators to invest ahead of revenue recovery",
            "Simplified spectrum licensing in Bangladesh and Vietnam cut average project-to-service timelines from 18 to 9 months (ISRs P161806, P165537)",
          ],
          citation: "IDA Digital Infrastructure Portfolio Review FY25; ISRs P161806 (Bangladesh), P165537 (Vietnam); Spectrum Policy Assessment FY25",
          confidence: "MEDIUM",
          confidenceNote: "Causal attribution draws on project ISRs from five countries; three additional markets pending final FY25 reporting.",
        },
        achievedGeoRegions: ["Bangladesh", "Vietnam", "Kenya", "Rwanda", "Nigeria", "Indonesia", "Pakistan", "Tanzania"],
        achievedGeoData: { "Bangladesh": "38M new subscribers — broadband ahead 108% vs target", "Vietnam": "Fibre rollout doubled expected coverage", "Kenya": "Digital services 92M users — above target", "Rwanda": "Connectivity surging — government co-funding model", "Nigeria": "Broadband: largest SSA contributor to total" },
        expectedGeoRegions: ["Bangladesh", "Vietnam", "Kenya", "Rwanda", "Nigeria", "Indonesia", "Pakistan", "Tanzania", "Senegal", "Mozambique", "Laos", "Cambodia"],
        expectedGeoData: { "Bangladesh": "Target: 28M — achieved 38M (+36%)", "Vietnam": "Target: 18M — fibre ahead of plan", "Kenya": "Target: 20M — digital uptake above plan", "Senegal": "Target: 8M — on track", "Mozambique": "Target: 6M — slightly behind" },
      },
      {
        label: "Renewable Energy Enabled",
        delta: "+75%",
        iconSrc: `${OA}/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg`,
        achieved: "38.2 GW",
        expected: "21.8 GW",
        insight: "Renewable energy capacity enabled through IDA projects has reached 38.2 GW — 75% above the FY25 target of 21.8 GW. Ethiopia's flagship wind-solar hybrid programme delivered 12.6 GW, anchoring the continent's lead. IDA guarantee instruments and DFI co-financing have catalysed $3.2B in private capital across the pipeline, driving accelerated installation in Sub-Saharan Africa and South Asia.",
        structuredInsight: {
          type: "Performance Pattern",
          finding: "IDA-enabled renewable energy capacity has reached 38.2 GW — 75% above the FY25 target of 21.8 GW, with Ethiopia's wind-solar hybrid programme as the single largest contributor.",
          evidence: [
            "Ethiopia contributed 12.6 GW — 33% of the global total — via a wind-solar hybrid programme (ICR P126094, FY25)",
            "IDA guarantee instruments and DFI co-financing mobilised $3.2B in private capital across the pipeline",
            "Sub-Saharan Africa and South Asia together account for 78% of new capacity enabled",
          ],
          citation: "Scorecard Results Indicator Data FY25; ICR P126094 (Ethiopia); IDA Guarantee Portfolio FY25",
          confidence: "MEDIUM",
          confidenceNote: "The $3.2B private capital mobilisation figure draws on preliminary DFI co-financing reports pending IDMS sign-off.",
        },
        achievedGeoRegions: ["Ethiopia", "Kenya", "Morocco", "Bangladesh", "Nigeria", "Ghana", "Tanzania"],
        achievedGeoData: { "Ethiopia": "12.6 GW — largest SSA contributor, wind-solar hybrid", "Kenya": "Geothermal expansion: 4.2 GW above plan", "Nigeria": "Solar: 3.8 GW, ahead of grid target", "Ghana": "Renewables 2.1 GW — 85% of plan achieved", "Bangladesh": "Off-grid solar: 3.4M households" },
        expectedGeoRegions: ["Ethiopia", "Kenya", "Morocco", "Bangladesh", "Nigeria", "Ghana", "Tanzania", "Zambia", "Senegal", "Nepal"],
        expectedGeoData: { "Ethiopia": "Target: 8 GW — achieved 12.6 GW (+58%)", "Kenya": "Target: 3 GW — exceeded by 40%", "Nigeria": "Target: 4 GW — nearly met", "Tanzania": "Target: 2 GW — on track", "Zambia": "Target: 1.5 GW — slightly behind" },
      },
      {
        label: "People using digitally enabled services",
        delta: "+22%",
        iconSrc: `${OA}/Digital%20Services.svg`,
        achieved: "92M",
        expected: "75M",
        insight: "Digital services uptake across IDA countries has reached 92M beneficiaries, outpacing the 75M target by 23%. Mobile government platforms in Bangladesh and Pakistan have driven the largest volume gains, while Kenya's fintech integration model shows strong spillovers into health and agriculture services. Gender-disaggregated data reveals a 34% gap in female uptake — a structural challenge flagged for the next IDA cycle.",
        structuredInsight: {
          type: "Tension Finding",
          finding: "Digital services have reached 92 million people — 23% above target — but gender-disaggregated data shows women are being reached at 34 percentage points lower than men.",
          evidence: [
            "Bangladesh and Pakistan drove the largest volume gains (32M and 18M respectively) via mobile government platforms (ISRs P160102, P155192)",
            "Kenya's fintech integration model shows measurable spillovers into health and agriculture services",
            "Female uptake trails male uptake by 34 percentage points across IDA countries where data is available",
          ],
          citation: "Scorecard Results Indicator Data FY25; Gender Disaggregation Report FY25; ISRs P160102 (Bangladesh), P155192 (Pakistan)",
          confidence: "MEDIUM",
          confidenceNote: "Gender-disaggregated data is available for 14 of 22 contributing countries; the 34-point gap reflects available data only.",
        },
        achievedGeoRegions: ["Bangladesh", "Pakistan", "Nigeria", "Kenya", "Vietnam", "Ghana", "Senegal"],
        achievedGeoData: { "Bangladesh": "32M users — mobile govt platform leads region", "Pakistan": "18M users — digital ID + services integration", "Kenya": "14M users — fintech model expanding", "Nigeria": "12M users — payment infrastructure driving uptake", "Ghana": "8.6M — government-to-person transfers unlocked" },
        expectedGeoRegions: ["Bangladesh", "Pakistan", "Nigeria", "Kenya", "Vietnam", "Ghana", "Senegal", "Uganda", "Rwanda", "Nepal"],
        expectedGeoData: { "Bangladesh": "Target: 26M — achieved 32M (+23%)", "Pakistan": "Target: 15M — exceeded", "Kenya": "Target: 12M — exceeded", "Uganda": "Target: 6M — on track", "Nepal": "Target: 4M — tracking below" },
      },
    ],
    suggestedPrompts: [
      "Why is broadband surging?",
      "Top accelerating countries",
      "Compare to FY24 baseline",
    ],
    geoRegions: ["Bangladesh", "Vietnam", "Cambodia", "Kenya", "Rwanda", "Senegal", "Ethiopia", "Mozambique", "Nepal", "Uganda", "Tanzania", "Nigeria", "Ghana", "Laos"],
    geoData: {
      "Bangladesh": "Broadband: 217M connected — +108% vs FY24 target",
      "Kenya": "Digital services: 92M users, above 75M target",
      "Vietnam": "Broadband + digital uptake both tracking above plan",
      "Rwanda": "Renewable energy + digital connectivity surging",
      "Ethiopia": "38.2 GW renewable capacity — leading SSA contributor",
    },
  },
  {
    id: "slowing",
    title: "Progress Watch Areas",
    subtitle: "Momentum losing pace",
    insight: "These indicators are tracking below their expected pace across four areas. Electricity access is the most acute — at 37% of its 576M target, it represents the scorecard's largest absolute shortfall. Social safety net coverage has grown 12% year-on-year but sits 22% below target, with last-mile payment infrastructure constraining the final stretch. Services to displaced populations have slipped amid ongoing FCS pressures, while health emergency response capacity has stalled just two countries short of target. Each warrants a root-cause diagnostic to distinguish reporting lags from structural delivery ceilings.",
    rows: [
      {
        label: "Beneficiaries of social safety net programs",
        delta: "-22.0%",
        iconSrc: `${OA}/protection%20for%20the%20pooresr.svg`,
        achieved: "244M",
        expected: "313M",
        insight: "Social safety net programmes have reached 244M beneficiaries — 22% below the 313M FY25 target, despite a +12% year-on-year improvement. Ethiopia and Pakistan anchor the numbers with government-IDA co-funded cash transfer schemes that have scaled well, but last-mile identification and payment infrastructure bottlenecks in Niger, Malawi, and Zambia are constraining the final stretch of coverage. The urban-rural split is pronounced: urban expansion has been 40% faster than rural delivery, pointing to a structural gap in reaching the most vulnerable.",
        achievedGeoRegions: ["Ethiopia", "Pakistan", "Bangladesh", "Nigeria", "Tanzania", "Zambia", "Uganda", "Kenya", "Malawi"],
        achievedGeoData: { "Ethiopia": "38M beneficiaries — PSNP IV scaling faster than plan", "Pakistan": "29M — BISP expansion driving coverage", "Bangladesh": "24M — cash transfer + school feeding combined", "Nigeria": "18M — northern states programme scaling", "Tanzania": "12M — expanded to new districts" },
        expectedGeoRegions: ["Ethiopia", "Pakistan", "Bangladesh", "Nigeria", "Tanzania", "Zambia", "Uganda", "Kenya", "Malawi", "Niger", "Ghana", "Cameroon"],
        expectedGeoData: { "Ethiopia": "Target: 48M — 19% shortfall remains", "Pakistan": "Target: 38M — behind despite BISP growth", "Bangladesh": "Target: 30M — gap persists", "Niger": "Target: 12M — last-mile ID barrier blocking coverage", "Malawi": "Target: 9M — payment infrastructure gap" },
      },
      {
        label: "Displaced people provided with services",
        delta: "-6.3%",
        iconSrc: `${OA}/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg`,
        achieved: "28.4M",
        expected: "30.3M",
        insight: "Services to displaced populations have reached 28.4M against a 30.3M target — a 6.3% shortfall driven by prolonged FCS pressures in three high-burden countries. In Yemen and Sudan, access and security constraints have forced project redesigns mid-implementation, while Congo DRC absorption has been slower than expected. The 1.9M gap represents real people not yet reached; rapid needs assessments in Q1 FY26 will inform whether redesign or reprogramming is the appropriate response.",
        achievedGeoRegions: ["Yemen", "Sudan", "Somalia", "South Sudan", "Congo DRC", "Ethiopia", "Afghanistan"],
        achievedGeoData: { "Yemen": "4.2M served — below 5.1M target due to access barriers", "Sudan": "3.8M reached — conflict zones causing delivery gaps", "Somalia": "2.6M — IDP services via NGO partnerships", "South Sudan": "1.9M — programme redesign underway", "Congo DRC": "3.1M — absorption slower than plan" },
        expectedGeoRegions: ["Yemen", "Sudan", "Somalia", "South Sudan", "Congo DRC", "Ethiopia", "Afghanistan", "Myanmar", "Haiti", "Mali"],
        expectedGeoData: { "Yemen": "Target: 5.1M — 18% shortfall", "Sudan": "Target: 4.5M — conflict causing delays", "Somalia": "Target: 2.9M — close to target", "Afghanistan": "Target: 3.2M — access severely restricted", "Myanmar": "Target: 1.8M — political crisis impact" },
      },
      {
        label: "People provided with electricity",
        delta: "-62.7%",
        iconSrc: `${OA}/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg`,
        achieved: "215M",
        expected: "576M",
        insight: "Electricity access has reached 215M people — only 37% of the 576M FY25 target. This is the largest absolute shortfall on the scorecard. Last-mile grid extension costs have risen 30–40% above FY23 estimates in key markets, forex pressures have delayed transformer procurement, and FCS-country pipelines have stalled amid conflict disruptions. Nigeria accounts for a significant share of the gap. Renewable off-grid solutions in Uganda and Tanzania are delivering faster than grid extension but cannot compensate for the scale of unmet demand. A structural rethink of delivery models — including larger off-grid and mini-grid programmes — is needed for IDA21.",
        achievedGeoRegions: ["Nigeria", "Tanzania", "Bangladesh", "Ethiopia", "Pakistan", "Uganda", "Senegal"],
        achievedGeoData: { "Nigeria": "68M — well behind target due to grid cost overruns", "Tanzania": "22M — off-grid pilot ahead of schedule", "Bangladesh": "38M — national grid programme on track", "Ethiopia": "28M — rural electrification progressing", "Uganda": "12M — off-grid solar driving gains" },
        expectedGeoRegions: ["Nigeria", "Tanzania", "Bangladesh", "Ethiopia", "Pakistan", "Uganda", "Senegal", "Sudan", "Madagascar", "Niger", "Mozambique", "Democratic Republic of the Congo", "Myanmar", "Yemen"],
        expectedGeoData: { "Nigeria": "Target: 148M — major shortfall, forex + cost overruns", "Tanzania": "Target: 48M — off-grid exceeding grid component", "Bangladesh": "Target: 72M — grid programme behind schedule", "Sudan": "Target: 28M — delivery stalled in conflict zones", "Madagascar": "Target: 18M — procurement delays" },
      },
    ],
    suggestedPrompts: [
      "What's behind the electricity dip?",
      "Worst-affected regions",
      "Where is delivery stuck?",
    ],
    geoRegions: ["Yemen", "Sudan", "Afghanistan", "Myanmar", "Haiti", "Mali", "Madagascar", "Niger", "Somalia", "Chad", "Central African Republic"],
    geoData: {
      "Yemen": "28.4M displaced people served — 6.3% below pace",
      "Sudan": "Electricity access: last-mile delivery stalled in conflict zones",
      "Afghanistan": "Health emergency capacity: implementation barriers persist",
      "Myanmar": "Electricity grid: 4.1% behind target — FCS delivery drag",
      "Mali": "Electricity access + health emergency response both lagging",
    },
  },
  {
    id: "emerging",
    title: "Emerging Growth Areas",
    subtitle: "New signals to watch",
    insight: "These indicators are showing early but meaningful outperformance, suggesting emerging strengths in climate-aligned employment and digital infrastructure. Green jobs and digital public infrastructure are both tracking above their FY25 plans, and while their absolute scale remains modest relative to IDA's broader ambitions, the trajectory is encouraging and warrants continued monitoring.",
    rows: [
      {
        label: "Green jobs creation",
        delta: "24.3M",
        iconSrc: `${OA}/More%20and%20Better%20Jobs.svg`,
        achieved: "24.3M",
        expected: "21M",
        insight: "Green jobs have reached 24.3M — outpacing the 21M target by 16%, driven primarily by agri-forestry and off-grid energy installation employment in Ethiopia (6.4M) and Bangladesh (4.1M). Definitional consistency across reporting systems remains a risk: three countries count part-time and seasonal positions in ways that inflate totals. A harmonised job-quality standard applied across all IDA green jobs programmes would sharpen future targeting and credibility.",
        achievedGeoRegions: ["Ethiopia", "Bangladesh", "Ghana", "Indonesia", "Nigeria", "Kenya", "Tanzania"],
        achievedGeoData: { "Ethiopia": "6.4M green jobs — agri-forestry dominant", "Bangladesh": "4.1M — off-grid solar installation workforce", "Ghana": "2.8M — cocoa agroforestry + solar", "Nigeria": "3.2M — clean cooking + solar retail", "Kenya": "2.1M — geothermal + conservation employment" },
        expectedGeoRegions: ["Ethiopia", "Bangladesh", "Ghana", "Indonesia", "Nigeria", "Kenya", "Tanzania", "Pakistan", "Bolivia", "Zambia"],
        expectedGeoData: { "Ethiopia": "Target: 5.5M — exceeded by 16%", "Bangladesh": "Target: 3.8M — exceeded", "Ghana": "Target: 2.5M — exceeded", "Pakistan": "Target: 2M — 85% achieved", "Bolivia": "Target: 1.2M — on track" },
      },
      {
        label: "Digital public infrastructure",
        delta: "87.4M",
        iconSrc: `${OA}/Connected%20Communities.svg`,
        achieved: "87.4M",
        expected: "80M",
        insight: "Digital public infrastructure deployments have reached 87.4M citizens — 9% above the 80M target. The gains are concentrated in three countries that launched foundational ID systems: Bangladesh's digital ID scheme enrolled 32M in FY25, while Ghana's interoperable payments layer has unlocked government-to-person transfers for 8.6M additional recipients. Six countries remain on track to deploy their first interoperable digital systems by Q2 FY26.",
        achievedGeoRegions: ["Bangladesh", "Ghana", "Pakistan", "Kenya", "Nigeria", "Senegal", "Rwanda"],
        achievedGeoData: { "Bangladesh": "32M — digital ID + e-services integration", "Ghana": "8.6M — interoperable payments layer", "Pakistan": "14M — Ehsaas digital platform", "Kenya": "10M — Huduma Namba integration", "Nigeria": "9M — BVN-linked service delivery" },
        expectedGeoRegions: ["Bangladesh", "Ghana", "Pakistan", "Kenya", "Nigeria", "Senegal", "Rwanda", "Tanzania", "Uganda", "Nepal"],
        expectedGeoData: { "Bangladesh": "Target: 28M — exceeded by 14%", "Ghana": "Target: 8M — exceeded", "Pakistan": "Target: 12M — exceeded", "Tanzania": "Target: 7M — on track", "Uganda": "Target: 5M — slightly behind" },
      },
    ],
    suggestedPrompts: [
      "Unpack the social safety net gains",
      "Which countries are leading on jobs?",
      "What to watch next quarter",
    ],
    geoRegions: ["Pakistan", "Ethiopia", "Ghana", "Tanzania", "Zambia", "Uganda", "Malawi", "Benin", "Cameroon", "Indonesia", "Bolivia"],
    geoData: {
      "Pakistan": "Social safety nets: 171.6M beneficiaries, above 158M target",
      "Ethiopia": "Green jobs: 24.3M created — 16% above plan in agriculture",
      "Ghana": "Digital public infrastructure: 87.4M reached, +9% above target",
      "Tanzania": "Social protection expansion: strong YoY growth trajectory",
    },
  },
];

// ─── HNP / Health Services geo hint ──────────────────────────────────────────
// Used to light up the globe and flat map when the methods-measurement flow
// is active. Separate from momentumGroups so it doesn't render a source card
// in the conversation view.
const HNP_INDICATOR_NAME = "People reaching health, nutrition, and population services";

export const hnpGeoHint = {
  // Achieved: 10 countries with confirmed delivery (≥60% of pipeline met)
  achievedRegions: [
    "India", "Bangladesh", "Pakistan", "Nigeria", "Ethiopia",
    "Chad", "Kenya", "Tanzania", "Uganda", "Mozambique",
  ],
  // Expected: full 15-country pipeline including FCS underperformers
  expectedRegions: [
    "India", "Bangladesh", "Pakistan", "Ethiopia", "Nigeria",
    "Chad", "Afghanistan", "Yemen", "Sudan", "South Sudan",
    "Myanmar", "Mozambique", "Tanzania", "Uganda", "Kenya",
  ],
  achievedGeoData: {
    "India":      "Achieved: 89.0M people (FY25)",
    "Bangladesh": "Achieved: 32.6M people (FY25)",
    "Pakistan":   "Achieved: 28.4M people (FY25)",
    "Nigeria":    "Achieved: 15.0M people (FY25)",
    "Ethiopia":   "Achieved: 8.2M people (FY25)",
    "Kenya":      "Achieved: 6.2M people (FY25)",
    "Chad":       "Achieved: 6.5M people (FY25)",
    "Tanzania":   "Achieved: 5.2M people (FY25)",
    "Uganda":     "Achieved: 4.8M people (FY25)",
    "Mozambique": "Achieved: 2.7M people (FY25)",
  } as Record<string, string>,
  expectedGeoData: {
    "India":       "Target: 101.0M expected (FY25)",
    "Bangladesh":  "Target: 35.2M expected (FY25)",
    "Pakistan":    "Target: 36.5M expected (FY25)",
    "Nigeria":     "Target: 22.0M expected (FY25)",
    "Ethiopia":    "Target: 12.0M expected (FY25)",
    "Kenya":       "Target: 8.0M expected (FY25)",
    "Chad":        "Target: 8.2M expected (FY25)",
    "Tanzania":    "Target: 7.0M expected (FY25)",
    "Uganda":      "Target: 6.5M expected (FY25)",
    "Mozambique":  "Target: 4.5M expected (FY25)",
    "Afghanistan": "Target: 5.5M expected (FY25)",
    "Myanmar":     "Target: 3.1M expected (FY25)",
    "Sudan":       "Target: 4.1M expected (FY25)",
    "Yemen":       "Target: 3.2M expected (FY25)",
    "South Sudan": "Target: 1.3M expected (FY25)",
  } as Record<string, string>,
  geoDetailData: {
    "India":       { indicatorName: HNP_INDICATOR_NAME, achieved: "89.0M", expected: "101.0M", projects: 28 },
    "Bangladesh":  { indicatorName: HNP_INDICATOR_NAME, achieved: "32.6M", expected: "35.2M",  projects: 12 },
    "Pakistan":    { indicatorName: HNP_INDICATOR_NAME, achieved: "28.4M", expected: "36.5M",  projects: 8  },
    "Nigeria":     { indicatorName: HNP_INDICATOR_NAME, achieved: "15.0M", expected: "22.0M",  projects: 9  },
    "Ethiopia":    { indicatorName: HNP_INDICATOR_NAME, achieved: "8.2M",  expected: "12.0M",  projects: 6  },
    "Kenya":       { indicatorName: HNP_INDICATOR_NAME, achieved: "6.2M",  expected: "8.0M",   projects: 5  },
    "Chad":        { indicatorName: HNP_INDICATOR_NAME, achieved: "6.5M",  expected: "8.2M",   projects: 3  },
    "Tanzania":    { indicatorName: HNP_INDICATOR_NAME, achieved: "5.2M",  expected: "7.0M",   projects: 7  },
    "Uganda":      { indicatorName: HNP_INDICATOR_NAME, achieved: "4.8M",  expected: "6.5M",   projects: 6  },
    "Mozambique":  { indicatorName: HNP_INDICATOR_NAME, achieved: "2.7M",  expected: "4.5M",   projects: 5  },
    "Afghanistan": { indicatorName: HNP_INDICATOR_NAME, achieved: "2.4M",  expected: "5.5M",   projects: 4  },
    "Myanmar":     { indicatorName: HNP_INDICATOR_NAME, achieved: "1.5M",  expected: "3.1M",   projects: 3  },
    "Sudan":       { indicatorName: HNP_INDICATOR_NAME, achieved: "1.7M",  expected: "4.1M",   projects: 4  },
    "Yemen":       { indicatorName: HNP_INDICATOR_NAME, achieved: "1.2M",  expected: "3.2M",   projects: 3  },
    "South Sudan": { indicatorName: HNP_INDICATOR_NAME, achieved: "0.6M",  expected: "1.3M",   projects: 2  },
  } as Record<string, GeoCountryDetail>,
  title: "Health Services Coverage",
  color: "#34D399",
};

export const norwayGeoHint = {
  // Achieved: 18 countries where Norway-attributed results confirmed delivered
  achievedRegions: [
    "Nigeria", "Bangladesh", "Pakistan", "Ethiopia", "Chad",
    "Tanzania", "Kenya", "Uganda", "Nepal", "Senegal",
    "Niger", "Rwanda", "Democratic Republic of the Congo",
    "Burkina Faso", "Zambia", "Mozambique", "Malawi", "Madagascar",
  ],
  // Expected: full pipeline — all 25 countries including harder-to-reach FCS
  expectedRegions: [
    "Ethiopia", "Nigeria", "Tanzania", "Uganda", "Kenya", "Mozambique",
    "South Sudan", "Sudan", "Chad", "Mali", "Niger", "Burkina Faso",
    "Somalia", "Democratic Republic of the Congo", "Madagascar",
    "Bangladesh", "Pakistan", "Afghanistan", "Myanmar", "Nepal",
    "Yemen", "Senegal", "Rwanda", "Zambia", "Malawi",
  ],
  achievedGeoData: {
    "Nigeria":                         "Norway achieved: ~645K reached (4.3% attribution, FY25)",
    "Bangladesh":                      "Norway achieved: ~1.4M reached (4.3% attribution, FY25)",
    "Pakistan":                        "Norway achieved: ~1.2M reached (4.3% attribution, FY25)",
    "Ethiopia":                        "Norway achieved: ~354K reached (4.3% attribution, FY25)",
    "Chad":                            "Norway achieved: ~280K reached (4.3% attribution, FY25)",
    "Tanzania":                        "Norway achieved: ~224K reached (4.3% attribution, FY25)",
    "Kenya":                           "Norway achieved: ~267K reached (4.3% attribution, FY25)",
    "Uganda":                          "Norway achieved: ~207K reached (4.3% attribution, FY25)",
    "Nepal":                           "Norway achieved: ~178K reached (4.3% attribution, FY25)",
    "Senegal":                         "Norway achieved: ~134K reached (4.3% attribution, FY25)",
    "Niger":                           "Norway achieved: ~112K reached (4.3% attribution, FY25)",
    "Rwanda":                          "Norway achieved: ~96K reached (4.3% attribution, FY25)",
    "Democratic Republic of the Congo":"Norway achieved: ~193K reached (4.3% attribution, FY25)",
    "Burkina Faso":                    "Norway achieved: ~89K reached (4.3% attribution, FY25)",
    "Zambia":                          "Norway achieved: ~89K reached (4.3% attribution, FY25)",
    "Mozambique":                      "Norway achieved: ~116K reached (4.3% attribution, FY25)",
    "Malawi":                          "Norway achieved: ~74K reached (4.3% attribution, FY25)",
    "Madagascar":                      "Norway achieved: ~68K reached (4.3% attribution, FY25)",
  } as Record<string, string>,
  expectedGeoData: {
    "Ethiopia":                        "Norway target: ~391K expected (4.3% attribution, FY25)",
    "Nigeria":                         "Norway target: ~946K expected (4.3% attribution, FY25)",
    "Tanzania":                        "Norway target: ~301K expected (4.3% attribution, FY25)",
    "Uganda":                          "Norway target: ~280K expected (4.3% attribution, FY25)",
    "Kenya":                           "Norway target: ~344K expected (4.3% attribution, FY25)",
    "Mozambique":                      "Norway target: ~194K expected (4.3% attribution, FY25)",
    "South Sudan":                     "Norway target: ~56K expected (4.3% attribution, FY25)",
    "Sudan":                           "Norway target: ~176K expected (4.3% attribution, FY25)",
    "Chad":                            "Norway target: ~353K expected (4.3% attribution, FY25)",
    "Mali":                            "Norway target: ~155K expected (4.3% attribution, FY25)",
    "Niger":                           "Norway target: ~172K expected (4.3% attribution, FY25)",
    "Burkina Faso":                    "Norway target: ~148K expected (4.3% attribution, FY25)",
    "Somalia":                         "Norway target: ~86K expected (4.3% attribution, FY25)",
    "Democratic Republic of the Congo":"Norway target: ~280K expected (4.3% attribution, FY25)",
    "Madagascar":                      "Norway target: ~112K expected (4.3% attribution, FY25)",
    "Bangladesh":                      "Norway target: ~1.5M expected (4.3% attribution, FY25)",
    "Pakistan":                        "Norway target: ~1.6M expected (4.3% attribution, FY25)",
    "Afghanistan":                     "Norway target: ~237K expected (4.3% attribution, FY25)",
    "Myanmar":                         "Norway target: ~133K expected (4.3% attribution, FY25)",
    "Nepal":                           "Norway target: ~224K expected (4.3% attribution, FY25)",
    "Yemen":                           "Norway target: ~138K expected (4.3% attribution, FY25)",
    "Senegal":                         "Norway target: ~194K expected (4.3% attribution, FY25)",
    "Rwanda":                          "Norway target: ~129K expected (4.3% attribution, FY25)",
    "Zambia":                          "Norway target: ~129K expected (4.3% attribution, FY25)",
    "Malawi":                          "Norway target: ~112K expected (4.3% attribution, FY25)",
  } as Record<string, string>,
  geoDetailData: {
    "Ethiopia":                        { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "354K", expected: "391K", projects: 6 },
    "Nigeria":                         { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "645K", expected: "946K", projects: 9 },
    "Tanzania":                        { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "224K", expected: "301K", projects: 7 },
    "Uganda":                          { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "207K", expected: "280K", projects: 6 },
    "Kenya":                           { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "267K", expected: "344K", projects: 5 },
    "Mozambique":                      { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "116K", expected: "194K", projects: 5 },
    "South Sudan":                     { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "26K",  expected: "56K",  projects: 2 },
    "Sudan":                           { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "73K",  expected: "176K", projects: 4 },
    "Chad":                            { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "280K", expected: "353K", projects: 3 },
    "Bangladesh":                      { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "1.4M", expected: "1.5M", projects: 12 },
    "Pakistan":                        { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "1.2M", expected: "1.6M", projects: 8 },
    "Afghanistan":                     { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "103K", expected: "237K", projects: 4 },
    "Myanmar":                         { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "65K",  expected: "133K", projects: 3 },
    "Nepal":                           { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "178K", expected: "224K", projects: 5 },
    "Yemen":                           { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "52K",  expected: "138K", projects: 3 },
    "Democratic Republic of the Congo":{ indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "193K", expected: "280K", projects: 7 },
    "Madagascar":                      { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "68K",  expected: "112K", projects: 3 },
    "Mali":                            { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "98K",  expected: "155K", projects: 4 },
    "Niger":                           { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "112K", expected: "172K", projects: 4 },
    "Burkina Faso":                    { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "89K",  expected: "148K", projects: 3 },
    "Somalia":                         { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "42K",  expected: "86K",  projects: 2 },
    "Senegal":                         { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "134K", expected: "194K", projects: 4 },
    "Rwanda":                          { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "96K",  expected: "129K", projects: 5 },
    "Zambia":                          { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "89K",  expected: "129K", projects: 4 },
    "Malawi":                          { indicatorName: "Norway proportional attribution (4.3% of IDA21)", achieved: "74K",  expected: "112K", projects: 3 },
  } as Record<string, GeoCountryDetail>,
  title: "Norway Attributed Results (IDA21)",
  color: "#818CF8",
};

export const benefGeoHint = {
  achievedRegions: [
    "Mali", "Niger", "Kenya", "Nigeria", "Ethiopia", "Pakistan", "Bangladesh",
    "Senegal", "Burkina Faso", "Tanzania", "Uganda", "Zambia",
  ],
  expectedRegions: [
    "Mali", "Niger", "Yemen", "Sudan", "Kenya", "Nigeria", "Ethiopia",
    "Pakistan", "Bangladesh", "Senegal", "Burkina Faso", "Tanzania",
    "Uganda", "Zambia", "Mozambique",
  ],
  achievedGeoData: {
    "Mali":       "Safety Net: 748,462 achieved (FY25)",
    "Niger":      "Safety Net: 320K achieved (FY25)",
    "Kenya":      "Safety Net: 1.2M achieved (FY25)",
    "Nigeria":    "Safety Net: 3.4M achieved (FY25)",
    "Ethiopia":   "Safety Net: 4.2M achieved (FY25)",
    "Pakistan":   "Safety Net: 6.3M achieved (FY25)",
    "Bangladesh": "Safety Net: 8.1M achieved (FY25)",
    "Tanzania":   "Safety Net: 0.9M achieved (FY25)",
    "Uganda":     "Safety Net: 0.7M achieved (FY25)",
  } as Record<string, string>,
  expectedGeoData: {
    "Mali":       "Target: 976,080 expected (FY25) — 77%",
    "Niger":      "Target: 580K expected (FY25) — 55%",
    "Yemen":      "Target: 650K expected (FY25) — 32%",
    "Sudan":      "Target: 380K expected (FY25) — 25%",
    "Kenya":      "Target: 1.5M expected (FY25) — 80%",
    "Nigeria":    "Target: 4.1M expected (FY25) — 83%",
    "Ethiopia":   "Target: 4.8M expected (FY25) — 88%",
    "Pakistan":   "Target: 6.8M expected (FY25) — 93%",
    "Bangladesh": "Target: 8.5M expected (FY25) — 95%",
  } as Record<string, string>,
  geoDetailData: {
    "Mali":       { indicatorName: "Social Safety Nets", achieved: "748,462", expected: "976,080", projects: 3 },
    "Niger":      { indicatorName: "Social Safety Nets", achieved: "320K",    expected: "580K",    projects: 2 },
    "Yemen":      { indicatorName: "Social Safety Nets", achieved: "210K",    expected: "650K",    projects: 2 },
    "Sudan":      { indicatorName: "Social Safety Nets", achieved: "95K",     expected: "380K",    projects: 2 },
    "Kenya":      { indicatorName: "Social Safety Nets", achieved: "1.2M",    expected: "1.5M",    projects: 5 },
    "Nigeria":    { indicatorName: "Social Safety Nets", achieved: "3.4M",    expected: "4.1M",    projects: 8 },
    "Ethiopia":   { indicatorName: "Social Safety Nets", achieved: "4.2M",    expected: "4.8M",    projects: 6 },
    "Pakistan":   { indicatorName: "Social Safety Nets", achieved: "6.3M",    expected: "6.8M",    projects: 7 },
    "Bangladesh": { indicatorName: "Social Safety Nets", achieved: "8.1M",    expected: "8.5M",    projects: 9 },
  } as Record<string, GeoCountryDetail>,
  title: "Social Safety Net Beneficiaries",
  color: "#5B5BD6",
};

// ─── Counter Intuitive Text Cards ─────────────────────────────────────────────

export interface OutcomeAreaRef {
  name: string;     // shown in the hover tooltip
  iconSrc: string;  // path under /public, URL-encoded
}

export interface CounterIntuitiveTextCard {
  id: string;
  category: string;
  headline: string;
  description: string;
  linkedOutcomeAreas: OutcomeAreaRef[];
}

export const counterIntuitiveTextCards: CounterIntuitiveTextCard[] = [
  {
    id: "ci-1",
    category: "Energy",
    headline: "Renewable capacity is surging – but electricity access is off-track",
    description:
      "33.82 GW enabled (+75%), yet only 37% of electricity access pipeline is met. Capacity supply is concentrated in middle-income IBRD economies, not the IDA countries where access gaps are largest.",
    linkedOutcomeAreas: [
      {
        name: "Affordable, Reliable and Sustainable Energy for All",
        iconSrc: `${OA}/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg`,
      },
    ],
  },
  {
    id: "ci-2",
    category: "Education",
    headline: "Education results exceeded pipeline targets in some FCS countries",
    description:
      "324.5M students supported — 80% of pipeline — but the learning poverty context indicator is deteriorating. Project enrollment is up while system-level learning outcomes regress.",
    linkedOutcomeAreas: [
      { name: "Learning Poverty",                                  iconSrc: `${OA}/learning%20poverty.svg` },
      { name: "Better Lives for People in Fragility, Conflict, and Violence", iconSrc: `${OA}/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg` },
    ],
  },
  {
    id: "ci-3",
    category: "Fiscal",
    headline: "More countries implementing debt reforms — but distress rates unchanged",
    description:
      "60.3% of at-risk countries implemented reforms — up significantly — but the share in high or moderate debt distress has not shifted in three fiscal years.",
    linkedOutcomeAreas: [
      { name: "Effective Macroeconomic and Fiscal Management", iconSrc: `${OA}/Effective%20Macroeconomic%20and%20Fiscal%20Management.svg` },
    ],
  },
  {
    id: "ci-4",
    category: "Private Sector",
    headline: "Record private capital mobilized — but IDA-country PCE pipeline is shrinking",
    description:
      "$241.6B mobilized overall, yet private capital enabled in IDA/FCS markets is down 5%. The mobilization headline is driven by IBRD-eligible economies, not the targeted segment.",
    linkedOutcomeAreas: [
      { name: "More Private Investment", iconSrc: `${OA}/More%20Private%20Investment.svg` },
      { name: "More and Better Jobs",    iconSrc: `${OA}/More%20and%20Better%20Jobs.svg` },
    ],
  },
];

// ─── Outcome Areas (Explore by Outcome Area) ─────────────────────────────────

export interface OutcomeArea {
  id: string;
  name: string;
  iconSrc: string; // path under public/, URL-encoded
}

export const outcomeAreas: OutcomeArea[] = [
  { id: "oa-1",  name: "Protection for the Poorest",                               iconSrc: "/outcome%20areas/protection%20for%20the%20pooresr.svg" },
  { id: "oa-2",  name: "Green and Blue Planet and Resilient Populations",           iconSrc: "/outcome%20areas/Green%20and%20Blue%20Planet%20and%20Resilient%20Populations.svg" },
  { id: "oa-3",  name: "Digital Services",                                          iconSrc: "/outcome%20areas/Digital%20Services.svg" },
  { id: "oa-4",  name: "More Private Investment",                                   iconSrc: "/outcome%20areas/More%20Private%20Investment.svg" },
  { id: "oa-5",  name: "Affordable, Reliable and Sustainable Energy for All",      iconSrc: "/outcome%20areas/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg" },
  { id: "oa-6",  name: "Better Lives for People in Fragility, Conflict, and Violence", iconSrc: "/outcome%20areas/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg" },
  { id: "oa-7",  name: "Connected Communities",                                    iconSrc: "/outcome%20areas/Connected%20Communities.svg" },
  { id: "oa-8",  name: "Digital Connectivity",                                     iconSrc: "/outcome%20areas/Digital%20Connectivity.svg" },
  { id: "oa-9",  name: "Effective Macroeconomic and Fiscal Management",            iconSrc: "/outcome%20areas/Effective%20Macroeconomic%20and%20Fiscal%20Management.svg" },
  { id: "oa-10", name: "Gender Equality",                                          iconSrc: "/outcome%20areas/Gender%20Equality.svg" },
  { id: "oa-11", name: "Healthier Lives",                                          iconSrc: "/outcome%20areas/healthier%20lives.svg" },
  { id: "oa-12", name: "Inclusive and Equitable Water and Sanitation Services",    iconSrc: "/outcome%20areas/Inclusive%20and%20Equitable%20Water%20and%20Sanitation%20Services.svg" },
  { id: "oa-13", name: "More and Better Jobs",                                     iconSrc: "/outcome%20areas/More%20and%20Better%20Jobs.svg" },
  { id: "oa-14", name: "No Learning Poverty",                                      iconSrc: "/outcome%20areas/learning%20poverty.svg" },
  { id: "oa-15", name: "Sustainable Food Systems",                                 iconSrc: "/outcome%20areas/Sustainable%20Food%20Systems.svg" },
];

// ─── Featured Narratives ──────────────────────────────────────────────────────

export interface FeaturedNarrative {
  id: string;
  outcomeArea: string;       // small label at top of overlay
  headline: string;          // big headline at bottom of overlay
  imageSrc: string;          // path under /public
  /** Names of the IDA Scorecard indicators this narrative draws on. */
  indicators: string[];
}

const NT = "/narrative%20thumbnails";

export const featuredNarratives: FeaturedNarrative[] = [
  {
    id: "fn-1",
    outcomeArea: "Protection of the Poorest",
    headline: "Closing Sub-Saharan Africa's Poverty Gap Through Targeted Social Protection and Jobs",
    imageSrc: `${NT}/sub%20africa%20poverty.png`,
    indicators: [
      "Beneficiaries of social safety net programs",
      "Displaced people and people in host communities provided with services and livelihoods",
      "People with strengthened food and nutrition security",
      "People benefiting from actions to advance gender equality",
      "More and better-paid jobs",
    ],
  },
  {
    id: "fn-2",
    outcomeArea: "No Learning Poverty",
    headline: "Tackling Learning Poverty with Effective Teaching and Focused Student Support",
    imageSrc: `${NT}/no%20learning%20poverty.jpg`,
    indicators: [
      "Students supported with better education",
      "People benefiting from actions to advance gender equality",
      "People receiving quality health, nutrition, and population services",
    ],
  },
  {
    id: "fn-3",
    outcomeArea: "Healthier Lives",
    headline: "Driving Health Systems Reform for Healthier Lives",
    imageSrc: `${NT}/healthier%20lives.jpg`,
    indicators: [
      "People receiving quality health, nutrition, and population services",
      "Countries benefitting from strengthened capacity to prevent, detect, and respond to health emergencies",
      "People provided with water, sanitation, and/or hygiene",
      "People with strengthened food and nutrition security",
    ],
  },
  {
    id: "fn-4",
    outcomeArea: "Effective Macroeconomic and Fiscal Management",
    headline: "Strengthening Capacity to Implement Tax Policy and Debt Management Reforms",
    imageSrc: `${NT}/effective%20macroeconomic%20and%20fiscal%20management.jpg`,
    indicators: [
      "Percentage of countries in or at high risk of debt distress that implemented reforms towards debt sustainability",
      "Countries with tax revenues-to-GDP ratio at or below 15% that have increased collections, considering equity",
      "Total private capital enabled",
      "Total private capital mobilized",
    ],
  },
];
