
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IconShare,
  IconFiles,
  IconX,
  IconChevronDown,
  IconChevronRight,
  IconCopy as IconCopySm,
  IconThumbUp,
  IconThumbDown,
  IconArrowDown,
  IconArrowUp as IconArrowUpRight,
  IconExternalLink,
  IconMinus,
  IconNotebook,
  IconSparkles,
  IconSearch,
  IconCalculator,
  IconFilter,
  IconChartBar,
  IconCheck,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconQuote,
  IconLock,
  IconBook2,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { useViewMode } from "@/contexts/ViewModeContext";
import type { NarrativePhase } from "../../app/page";
import type { MomentumGroup } from "../../lib/mockData";
import NarrativeSkeletonChoice from "./NarrativeSkeletonChoice";
import SkeletonRefinedMessage from "./SkeletonRefinedMessage";
import GuidedDiscovery from "./GuidedDiscovery";
import NarrativeConverse from "./NarrativeConverse";
import NarrativeBuilderWizard, { type NarrativeBuilderResult } from "./NarrativeBuilderWizard";
import DonorNarrativeWizard from "./DonorNarrativeWizard";
import type { NarrativeSkeleton } from "./NarrativeSkeletons";
import { ACTION_MENUS } from "@/data/goldenPrompts";

const F = "'Open Sans', sans-serif";

export interface Artefact {
  id: string;
  kind: "narrative" | "infographic";
  title: string;
  prompt: string;
  createdAt: number;
  /** Which narrative-angle skeleton the user picked (narrative artefacts only). */
  skeletonId?: string;
}

interface Props {
  prompt: string;
  /** Set true for dark mode, false (default) for light mode. */
  dark?: boolean;
  /** When true, root background is transparent (map-mode: map shows behind). */
  mapMode?: boolean;
  onClose?: () => void;
  /** When true, the right-side narrative panel is open — shrink content area. */
  panelOpen?: boolean;
  panelWidth?: number;
  /** Skip CSS transition while the panel is being dragged. */
  suppressTransition?: boolean;
  /** Saved-narrative artefacts created from this conversation. */
  artefacts?: Artefact[];
  /** Open the narrative panel for a previously-created artefact. */
  onSelectArtefact?: (a: Artefact) => void;
  /** User-editable title — falls back to flow's default title when empty. */
  title?: string;
  onTitleChange?: (t: string) => void;
  /** When true, render only the conversation body (no header, h-full instead
   * of h-screen) so this view can be embedded inside another layout, e.g.
   * the shared-link viewer. */
  embedded?: boolean;
  /** Current narrative creation phase — drives which AI message blocks to render. */
  narrativePhase?: NarrativePhase;
  /** Fires when the NarrativePlanningMessage step animation completes. */
  onNarrativePlanningComplete?: () => void;
  /** Fires when the NarrativeBuilderWizard completes — carries the selected
   *  challenge so the parent can trigger skeleton generation. */
  onWizardComplete?: (result: NarrativeBuilderResult) => void;
  /** Currently selected narrative-skeleton id in the skeleton-ready phase. */
  selectedSkeletonId?: string | null;
  /** Called when the user clicks a skeleton card (or clicks it again to toggle off). */
  onSelectSkeleton?: (id: string | null) => void;
  /** Called when the user clicks the expand icon on a skeleton card. */
  onPreviewSkeleton?: (id: string) => void;
  /** Called when the user deselects a skeleton (toggle-off) so the parent
   *  can close the preview drawer in sync. */
  onClosePreviewSkeleton?: () => void;
  /** Which skeleton angle the user is refining (drives the refined widget). */
  refiningSkeletonId?: string | null;
  /** History of user-submitted refinement texts. */
  refinementTurns?: string[];
  /** Fires when the user clicks "Proceed" inside the inline refined widget. */
  onRefinedProceed?: () => void;
  /** Fires when the user clicks "Make changes" inside the inline refined widget. */
  onRefinedMakeChanges?: () => void;
  /** True once the user has submitted a refinement that adds a third
   *  country to the skeleton. Surfaces inside the refined widget (and
   *  carries through to the final narrative panel). */
  extraCountryApplied?: boolean;
  /** Dynamic follow-up prompts surfaced from the card that opened this conversation. */
  followUpPrompts?: string[];
  /** Called when the user clicks a follow-up prompt. */
  onFollowUpClick?: (prompt: string) => void;
  /** When true, the conversation was opened via the landing-page
   *  "Create a narrative" pill — skip the AI Q&A response block and start
   *  the narrative-creation flow directly. */
  narrativeDirect?: boolean;
  /** When set, the conversation was opened from a MomentumGroups card —
   *  render the card data view instead of the fake AI Q&A conversation. */
  sourceCard?: MomentumGroup;
  /** Guided narrative discovery: slug selected by the user (or pre-filled). */
  guidedNarrativeSlug?: string | null;
  /** Guided narrative discovery: angle selected by the user. */
  guidedNarrativeAngle?: string;
  /** Guided narrative discovery: country examples selected by the user. */
  guidedNarrativeCountries?: string[];
  /** True once guided discovery has completed — keeps GuidedDiscovery mounted
   *  so its conversation messages remain visible as the phase advances. */
  guidedDiscoveryCompleted?: boolean;
  /** Generated skeletons for the guided narrative flow — passed through to
   *  SkeletonRefinedMessage so it can look up angles by ID. */
  guidedSkeletons?: import("@/components/conversation/NarrativeSkeletons").NarrativeSkeleton[];
  /** Carousel loading state (true while /match is in flight). */
  guidedSkeletonsLoading?: boolean;
  /** Carousel error state (true when /match returned nothing/failed). */
  guidedSkeletonsError?: boolean;
  /** Called when the guided discovery flow completes. */
  onGuidedDiscoveryComplete?: (slug: string, angle: string, countries: string[], params: import("@/components/conversation/GuidedDiscovery").NarrativeParams) => void;
  // ── Free-conversation flow (replaces GuidedDiscovery) ──────────────────────
  /** SessionId from useNarrativeSession; threaded into /api/narrative/converse. */
  converseSessionId?: string | null;
  /** Fires when the LLM emits a parseable <skeleton> block. */
  onConverseSkeleton?: (skeleton: import("@/lib/converse").ConverseSkeleton) => void;
  /** Exposes the converse sendMessage so the bottom PromptBar can drive
   *  follow-up turns from outside the chat. */
  onConverseReady?: (api: { sendMessage: (text: string) => void; isStreaming: boolean }) => void;
  /** Ref to forward PromptBar submissions into the NarrativeBuilderWizard
   *  during the "planning" phase. */
  wizardInputRef?: React.MutableRefObject<((text: string) => void) | null>;
  /** Pre-fills the outcome area in the wizard from the landing-page prompt. */
  initialOutcomeArea?: string | null;
  /** Pre-fills the country/region scope in the wizard from the landing-page prompt. */
  initialCountrySubset?: string | null;
  /** Called when the wizard wants to surface contextual chips above the prompt bar. */
  onWizardContextChipsChange?: (chips: { id: string; label: string }[]) => void;
  /** Ref the parent calls to dispatch a named wizard action. */
  wizardContextActionRef?: React.MutableRefObject<((actionId: string) => void) | null>;
  /** Fills the PromptBar with text when a Narrative Guidance tip is "Add to Narrative"d. */
  onWizardPrefillPrompt?: (text: string) => void;
  /** Selects which wizard to render during the "planning" phase. */
  narrativeVariant?: "results" | "donor-priorities";
  /** Fires when "Add to Narrative" is clicked to set/clear the reply chip above the prompt bar. */
  onWizardGuidanceReply?: (label: string | null) => void;
  /** Fires when "Add to Narrative" is clicked — carries the Authenticity Rubric dimension number
   *  so the right-hand NarrativePanel can shimmer the relevant section and bump the score. */
  onWizardGuidanceDimension?: (dimensionNum: number) => void;
  // ── Preloaded insight (trending-insight card → conversation) ───────────────
  /** When set, render this as the first AI answer (skip thought process +
   *  mock body); the user can then follow up normally. */
  preloadedAnswer?: string | null;
  /** Suggested follow-ups shown beneath a preloaded answer. */
  preloadedFollowUps?: string[];
  /** Called when the user clicks "Convert into a narrative" after an AI response. */
  onConvertToNarrative?: () => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Numbers from CLAUDE.md §7 (FY25 headline results). Indicator codes match
// the XLSX inventory in §4. Colors use the design system tokens in §11.

// Flow detection — keyword-driven. Anything mentioning "health services target"
// resolves to the health-gap flow; anything with "extreme poverty" resolves to
// the africa-poverty flow. Falls back to africa-poverty otherwise (the default).
export type FlowId =
  | "africa-poverty"
  | "health-gap"
  | "electricity-fcs"
  | "fy24-fy25-delta"
  | "hnp-measurement"
  | "methods-taxonomy"
  | "methods-compilation"
  | "norway-donor";

export function detectFlow(prompt: string): FlowId {
  const t = prompt.toLowerCase();
  // Methods Advisor — structural taxonomy question.
  if (
    t.includes("relationship between") &&
    (t.includes("results indicator") || t.includes("client context")) &&
    (t.includes("outcome area") || t.includes("client context"))
  ) return "methods-taxonomy";
  // Methods Advisor — compilation process question.
  if (
    (t.includes("how are scorecard") || t.includes("how is the scorecard") || t.includes("how are indicators")) &&
    (t.includes("compiled") || t.includes("compilation"))
  ) return "methods-compilation";
  // Methodology / definition questions about a specific HNP indicator. Must
  // be checked before health-gap because both share the "health services"
  // keyword — the verb ("measure" / "defined" / "how is") disambiguates.
  if (
    (t.includes("hnp") ||
      t.includes("health, nutrition") ||
      t.includes("health and nutrition") ||
      t.includes("health services")) &&
    (t.includes("measure") ||
      t.includes("defined") ||
      t.includes("methodology") ||
      t.includes("how is people reached"))
  ) return "hnp-measurement";
  // Year-over-year comparison across the FY24 → FY25 cycle.
  if (
    (t.includes("fy24") && t.includes("fy25")) ||
    t.includes("difference in results between fy24") ||
    (t.includes("year-over-year") && t.includes("scorecard"))
  ) return "fy24-fy25-delta";
  if (t.includes("norway") && t.includes("proportion")) return "norway-donor";
  if (
    t.includes("electricity") ||
    t.includes("energy access") ||
    (t.includes("fcs") && t.includes("driving"))
  ) return "electricity-fcs";
  if (
    t.includes("health services target") ||
    t.includes("health & nutrition") ||
    t.includes("global") ||
    t.includes("countries")
  ) return "health-gap";
  // "extreme poverty", "africa", "sub-saharan", "poverty & social protection", "social protection" → africa-poverty
  return "africa-poverty";
}

type Vertical = "People" | "Prosperity" | "Planet" | "Infrastructure" | "Digital";
const FILTER_TABS = ["All", "People", "Prosperity", "Planet", "Infrastructure", "Digital"] as const;
type FilterTab = typeof FILTER_TABS[number];

// Health-flow filter tabs (country-level lens)
const HEALTH_FILTER_TABS = ["All countries", "FCS", "Behind target"] as const;
type HealthFilterTab = typeof HEALTH_FILTER_TABS[number];

interface ChartRow {
  name: string;
  code: string;
  vertical: Vertical;
  achieved: number;          // FY25 achieved (in millions for beneficiary indicators)
  expected: number | null;   // FY25 pipeline target (null when CLAUDE.md doesn't list one)
  unit: string;              // for the tooltip
  note?: string;
}

// CLAUDE.md §7 — FY25 headline results. expected = null where the doc shows "—".
const CHART_DATA: ChartRow[] = [
  { name: "Social safety nets",  code: "CSC_RES_SOC_SAF_PROG",   vertical: "People",         achieved: 244, expected: 313, unit: "M people", note: "+12% YoY" },
  { name: "Students supported",  code: "CSC_RES_EDU_SUPP",       vertical: "People",         achieved: 325, expected: 452, unit: "M students", note: "+12% YoY" },
  { name: "Health services",     code: "CSC_RES_HEA_SERV",       vertical: "People",         achieved: 370, expected: 425, unit: "M people", note: "+12% YoY" },
  { name: "Tax-to-GDP <15%",     code: "CSC_RES_TAX_REV_GDP",    vertical: "Prosperity",     achieved:  56, expected: null, unit: "countries", note: "Persistent" },
  { name: "Climate resilience",  code: "CSC_RES_RESI_CLIM_RISK", vertical: "Planet",         achieved: 244, expected: 425, unit: "M people", note: "Behind target" },
  { name: "Conservation hectares", code: "CSC_RES_TER_AQU_HECT", vertical: "Planet",         achieved:  93, expected: null, unit: "M hectares", note: "+12% YoY" },
  { name: "Electricity access",  code: "CSC_RES_ELC_ACCS",       vertical: "Infrastructure", achieved: 215, expected: 576, unit: "M people", note: "Behind target" },
  { name: "Broadband users",     code: "CSC_RES_BRO_INTE",       vertical: "Digital",        achieved: 217, expected: null, unit: "M people", note: "2× vs FY24" },
];

type SignalDirection = "down" | "flat" | "up";

interface SignalCard {
  iconSrc: string;
  label: string;
  value: string;
}

// Shorthand for the outcome-area SVG directory (URL-encoded space).
const OA = "/outcome%20areas";

const RELATED_SIGNALS: SignalCard[] = [
  { iconSrc: `${OA}/protection%20for%20the%20pooresr.svg`,                                                              label: "Extreme poverty rate (FCS)",   value: "30.4%"  },
  { iconSrc: `${OA}/learning%20poverty.svg`,                                                                            label: "Learning poverty (primary)",   value: "70%"    },
  { iconSrc: `${OA}/healthier%20lives.svg`,                                                                             label: "UHC service coverage index",    value: "45/100" },
  { iconSrc: `${OA}/Digital%20Connectivity.svg`,                                                                        label: "Broadband users (vs FY24)",     value: "217M"   },
];

// ─── Health-gap flow data ────────────────────────────────────────────────────
// Country-level breakdown of CSC_RES_HEA_SERV (FY25). All countries with > 40%
// gap are FCS — keeping the chart focused on diagnostic signal.
interface HealthCountryRow {
  name: string;
  iso3: string;
  fcs: boolean;
  achieved: number;   // M people receiving HNP services
  expected: number;   // FY25 pipeline target, M people
}

const HEALTH_COUNTRY_DATA: HealthCountryRow[] = [
  { name: "Yemen",       iso3: "YEM", fcs: true,  achieved: 1.2, expected: 3.2 },
  { name: "Sudan",       iso3: "SDN", fcs: true,  achieved: 1.7, expected: 4.1 },
  { name: "Afghanistan", iso3: "AFG", fcs: true,  achieved: 2.4, expected: 5.5 },
  { name: "South Sudan", iso3: "SSD", fcs: true,  achieved: 0.6, expected: 1.3 },
  { name: "Myanmar",     iso3: "MMR", fcs: true,  achieved: 1.5, expected: 3.1 },
  { name: "Mozambique",  iso3: "MOZ", fcs: false, achieved: 2.7, expected: 4.5 },
  { name: "Pakistan",    iso3: "PAK", fcs: false, achieved: 28.4, expected: 36.5 },
  { name: "Bangladesh",  iso3: "BGD", fcs: false, achieved: 32.6, expected: 35.2 },
  { name: "India",       iso3: "IND", fcs: false, achieved: 89.0, expected: 101.0 },
];

const HEALTH_RELATED_SIGNALS: SignalCard[] = [
  { iconSrc: `${OA}/healthier%20lives.svg`,                                                                             label: "Avg health-service achievement (FCS)", value: "44%"     },
  { iconSrc: `${OA}/healthier%20lives.svg`,                                                                             label: "UHC service coverage index — FCS",     value: "32/100"  },
  { iconSrc: `${OA}/Sustainable%20Food%20Systems.svg`,                                                                  label: "Stunting prevalence (FCS, under-5)",   value: "33.6%"   },
  { iconSrc: `${OA}/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg`,             label: "Health worker density (per 1k, FCS)",  value: "0.8"     },
];

const ELECTRICITY_FCS_SIGNALS: SignalCard[] = [
  { iconSrc: `${OA}/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg`,                            label: "Electricity access pipeline met",      value: "37%"     },
  { iconSrc: `${OA}/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg`,                            label: "Renewable energy capacity enabled",    value: "33.82 GW"},
  { iconSrc: `${OA}/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg`,             label: "Avg electricity reach in FCV countries", value: "21%"   },
  { iconSrc: `${OA}/Connected%20Communities.svg`,                                                                       label: "Households still unconnected (FCS)",   value: "78M"     },
];

const YOY_DELTA_SIGNALS: SignalCard[] = [
  { iconSrc: `${OA}/protection%20for%20the%20pooresr.svg`,                                                              label: "People-pillar reach (YoY)",            value: "+12%"    },
  { iconSrc: `${OA}/Digital%20Connectivity.svg`,                                                                        label: "Broadband users (FY24 → FY25)",        value: "2×"      },
  { iconSrc: `${OA}/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg`,                            label: "Electricity reach (YoY)",              value: "+5%"     },
  { iconSrc: `${OA}/Green%20Planet.svg`,                                                                                label: "Climate resilience (YoY)",             value: "−2%"     },
];

const HNP_METHOD_SIGNALS: SignalCard[] = [
  { iconSrc: `${OA}/healthier%20lives.svg`,                                                                             label: "FY25 HNP reach (unique people)",       value: "370M"    },
  { iconSrc: `${OA}/healthier%20lives.svg`,                                                                             label: "FY25 HNP pipeline target",             value: "425M"    },
  { iconSrc: `${OA}/Sustainable%20Food%20Systems.svg`,                                                                  label: "Operations contributing to the count", value: "182"     },
  { iconSrc: `${OA}/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg`,             label: "Double-counting flag affected rows",   value: "9.4%"    },
];

// ─── FY24 → FY25 delta flow data ────────────────────────────────────────────
// FY24 baselines back-derived from the "+12% YoY" / "2× vs FY24" notes already
// in CHART_DATA. Where the source is silent (climate, electricity, tax) we
// keep the FY24 values consistent with the "Behind target" / "Persistent"
// signal — i.e. FY25 is roughly flat or slightly worse.
interface YoYRow {
  name: string;
  code: string;
  vertical: Vertical;
  fy24: number;
  fy25: number;
  unit: string;
  /** A short qualitative tag rendered next to the bar (e.g. "Behind target"). */
  note?: string;
}
const YOY_DATA: YoYRow[] = [
  { name: "Health services",      code: "CSC_RES_HEA_SERV",       vertical: "People",         fy24: 330, fy25: 370, unit: "M people",   note: "+12% YoY" },
  { name: "Students supported",   code: "CSC_RES_EDU_SUPP",       vertical: "People",         fy24: 290, fy25: 325, unit: "M students",  note: "+12% YoY" },
  { name: "Social safety nets",   code: "CSC_RES_SOC_SAF_PROG",   vertical: "People",         fy24: 218, fy25: 244, unit: "M people",   note: "+12% YoY" },
  { name: "Conservation hectares",code: "CSC_RES_TER_AQU_HECT",   vertical: "Planet",         fy24:  83, fy25:  93, unit: "M hectares",  note: "+12% YoY" },
  { name: "Broadband users",      code: "CSC_RES_BRO_INTE",       vertical: "Digital",        fy24: 109, fy25: 217, unit: "M people",   note: "2× vs FY24" },
  { name: "Electricity access",   code: "CSC_RES_ELC_ACCS",       vertical: "Infrastructure", fy24: 205, fy25: 215, unit: "M people",   note: "Behind target" },
  { name: "Climate resilience",   code: "CSC_RES_RESI_CLIM_RISK", vertical: "Planet",         fy24: 250, fy25: 244, unit: "M people",   note: "Slipped vs FY24" },
  { name: "Tax-to-GDP <15%",      code: "CSC_RES_TAX_REV_GDP",    vertical: "Prosperity",     fy24:  58, fy25:  56, unit: "countries",   note: "Persistent" },
];

// ─── HNP measurement flow data ──────────────────────────────────────────────
// 5-year trend of CSC_RES_HEA_SERV used to anchor the methodology card. The
// numbers track the same trajectory the other flows reference (FY25 = 370M).
interface TrendPoint { fy: string; value: number }
const HNP_TREND: TrendPoint[] = [
  { fy: "FY21", value: 245 },
  { fy: "FY22", value: 280 },
  { fy: "FY23", value: 305 },
  { fy: "FY24", value: 330 },
  { fy: "FY25", value: 370 },
];

// ─── Per-flow content map ────────────────────────────────────────────────────
interface FlowContent {
  title: string;
  defaultPrompt: string;
  leadAnswer: string;
  bodyText: string;
  filterCaption: string;
  chartTitle: string;
  signalsHeader: string;
  continueExploring: string[];
  sources: string[];
}

const FLOW_CONTENT: Record<FlowId, FlowContent> = {
  "africa-poverty": {
    title: "World Bank Group's Performance in Africa",
    defaultPrompt: "Is IDA making a difference for people in extreme poverty in Sub-Saharan Africa?",
    leadAnswer:
      "Yes — IDA reached 244M people through safety nets and 325M students through education in FY25, with the strongest gains in Sub-Saharan Africa.",
    bodyText:
      "IDA operations in FY25 delivered measurable improvements across the poorest 75 countries. Coverage is growing, but electricity access and climate resilience remain significantly below target — signalling where the largest gaps persist for people in extreme poverty.",
    filterCaption: "Figures from the active FY2025 portfolio (end-June 2025). Filter by theme:",
    chartTitle: "FY25 Results vs pipeline — IDA headline indicators",
    signalsHeader: "Related Signals",
    continueExploring: [
      "Which countries saw the biggest safety net gains?",
      "Why is electricity access lagging behind its 576M target?",
      "How does IDA compare to IBRD on poverty results?",
      "Show me FCS-only results for Sub-Saharan Africa",
    ],
    sources: [
      "Social Safety Nets results · FY2025 global aggregate",
      "Education Support results · FY2025 project data, FCS countries",
      "Social Safety Nets methodology note — beneficiary counting rules",
    ],
  },
  "electricity-fcs": {
    title: "Electricity access — FY25 delivery gap",
    defaultPrompt:
      "Electricity access is the scorecard's biggest gap — and FCS is driving it",
    leadAnswer:
      "Yes — only 37% of the FY25 electricity access pipeline has been met. The shortfall is concentrated in fragile and conflict-affected states, where utility performance and delivery timing — not ambition — are the binding constraints.",
    bodyText:
      "Globally, IDA-financed electricity projects reached 215M people in FY25 against a 576M pipeline target. The biggest absolute and proportional gaps sit in FCS economies: average country-level achievement in FCV settings is roughly 21%, less than half the IDA average. Renewable energy capacity continues to grow (33.82 GW enabled, +75%), but supply is concentrated in middle-income IBRD markets rather than the IDA countries where access gaps are widest.",
    filterCaption:
      "FY25 IDA results — filter by outcome theme to locate the electricity gap:",
    chartTitle: "FY25 Results vs pipeline — IDA headline indicators",
    signalsHeader: "Related Signals",
    continueExploring: [
      "Which FCS countries are furthest behind on electricity?",
      "How is renewable capacity distributed across IDA?",
      "What's the FY26 electricity pipeline for fragile states?",
      "Show me private capital flows into IDA energy projects",
    ],
    sources: [
      "Electricity access results · FY2025 project data",
      "Renewable energy methodology note — FY25",
      "FCS portfolio overview — energy operations",
      "WBG energy strategy — FY25 progress",
    ],
  },
  "fy24-fy25-delta": {
    title: "What changed between FY24 and FY25",
    defaultPrompt: "What explains the difference in results between FY24 and FY25?",
    leadAnswer:
      "FY25 People-pillar indicators grew +12% YoY and broadband doubled — but climate resilience slipped 2% and electricity access only ticked up 5%, widening the gap to its FY25 pipeline target.",
    bodyText:
      "Across the eight Scorecard headline indicators, six rose vs FY24 and two declined. People-pillar reach (safety nets, students, health services) tracked consistently around +12% YoY — the strongest signal in the portfolio. Digital connectivity doubled off a small base. The exceptions sit in Infrastructure and Planet: electricity access reached 215M (FY24: 205M) but the FY25 pipeline target jumped to 576M, so the gap widened; climate resilience actually contracted as the FY24 anticipatory-action surge wasn't repeated.",
    filterCaption:
      "FY24 actuals vs FY25 (end-June 2025). Filter by direction:",
    chartTitle: "Indicator change — FY24 → FY25",
    signalsHeader: "Year-over-year signals",
    continueExploring: [
      "Why did climate resilience contract this year?",
      "Which regions drove the People-pillar gain?",
      "What expanded the electricity-access target so much?",
      "How did FCS countries change between FY24 and FY25?",
    ],
    sources: [
      "FY2024 and FY2025 IDA Results aggregate · indicator-level Achieved values",
      "Scorecard Metadata · Double_Counting_Flag (FY24/FY25 comparability)",
      "Digital Connectivity methodology note — FY24 baseline restatement",
      "Climate Resilience methodology note — anticipatory-action accounting change",
    ],
  },
  "hnp-measurement": {
    title: "How HNP Services reach is measured",
    defaultPrompt: "How is People Reached with HNP Services measured?",
    leadAnswer:
      "People Reached with Health, Nutrition and Population Services counts unique people who received at least one IDA-financed health, nutrition, or population service in the reporting period — deduplicated across operations using country and beneficiary-program identifiers.",
    bodyText:
      "Operations contribute project-level achieved counts to the indicator each fiscal year. A person counted under more than one IDA-financed program in the same country is recorded once — a duplicate flag at the project row tells the aggregator when to drop the extra count. Services that count include primary care visits, maternal and child health touchpoints, immunisations, nutrition consultations, and disease-specific outreach. Pure infrastructure (e.g. clinic construction) and one-off equipment grants do not count as a service to a person.",
    filterCaption:
      "Indicator definition and 5-year trajectory:",
    chartTitle: "People Reached with HNP Services · 5-year reach",
    signalsHeader: "Indicator at a glance",
    continueExploring: [
      "Show me the FY25 country breakdown for HNP",
      "How does the duplicate-counting control work in practice?",
      "Which projects contribute the most HNP reach?",
      "Compare HNP counting rules to Safety-Net counting",
    ],
    sources: [
      "HNP Services methodology note — beneficiary counting definition",
      "Scorecard Metadata — indicator row and duplicate-counting flag",
      "Health Services results · FY2025 project-level data",
      "WBG Results Measurement System — deduplication rules",
    ],
  },
  "health-gap": {
    title: "Health services delivery gap — IDA FY25",
    defaultPrompt:
      "Which countries are furthest behind on health services targets in FY25 — and what's driving the gap?",
    leadAnswer:
      "5 IDA countries are tracking under 50% of their FY25 HNP-service targets — every one is FCS, with conflict-related supply-chain disruption and health-worker shortages as the dominant drivers.",
    bodyText:
      "Globally, WBG-supported HNP services reached 370M people in FY25 vs the 425M pipeline (87%). The headline obscures sharp country-level divergence: Yemen, Sudan, Afghanistan, South Sudan and Myanmar each fall well below 50% of plan, while Bangladesh, India and Pakistan are within 12 points of theirs. The shared driver across the bottom-five is conflict-affected service delivery — staff displacement, drug-supply chain breakdown, and de-prioritization of primary care for emergency response.",
    filterCaption:
      "FY25 country-level breakdown of Health Services results. Filter by status:",
    chartTitle: "HNP service achievement — country gaps vs FY25 target",
    signalsHeader: "Driving signals",
    continueExploring: [
      "Show me Yemen's full health portfolio",
      "What's the trajectory of UHC service coverage in FCS?",
      "Which prior IDA programs closed similar gaps?",
      "What's the FY26 pipeline for HNP in conflict states?",
    ],
    sources: [
      "Health Services results · FY2025 project data, FCS countries",
      "HNP Services methodology note — service coverage definition",
      "Universal Health Coverage context — UHC service coverage index",
      "Poverty in FCS context — health correlates",
    ],
  },
  "methods-taxonomy": {
    title: "Scorecard taxonomy — Results, Context, and Outcome Areas",
    defaultPrompt: "What is the relationship between Results Indicators, Client Context Indicators, and Outcome Areas?",
    leadAnswer:
      "Results Indicators capture what WBG operations deliver. Client Context Indicators track the development environment those operations work in. Both are organized under Outcome Areas — the six strategic groupings the Scorecard uses to frame WBG performance.",
    bodyText:
      "The Scorecard uses three structural layers. Outcome Areas (e.g. 'Ending Poverty', 'Climate Action') define the WBG's strategic priorities. Within each area, Results Indicators — sourced from project ISRs — report outputs and outcomes directly attributable to WBG financing. Client Context Indicators — drawn from WDI and external statistical databases — provide the country-level baseline against which those results should be read. The two types use different schemas, different source systems, and different aggregation rules. They are not interchangeable.",
    filterCaption: "Source: IDA Scorecard Metadata, Result sheet · Scorecard taxonomy and indicator classification",
    chartTitle: "Scorecard structure — Outcome Areas, Results and Context Indicators",
    signalsHeader: "Methods Advisor",
    continueExploring: [
      "How many Outcome Areas are there in the FY25 Scorecard?",
      "What is the difference between Active Portfolio and Lifetime Results indicators?",
      "How is the Client Context score derived?",
      "Which indicators fall under the Planet Outcome Area?",
    ],
    sources: [
      "IDA Scorecard Metadata — Result sheet (indicator catalogue and type classification)",
      "Results Handbook — Scorecard taxonomy and indicator classification",
      "IDMS Metadata — outcome area mappings and indicator type flags",
    ],
  },
  "methods-compilation": {
    title: "How Scorecard Results Indicators are compiled",
    defaultPrompt: "How are Scorecard Indicators compiled?",
    leadAnswer:
      "Scorecard Results Indicators are compiled annually by aggregating project-level Achieved_Results figures from Implementation Status Reports, applying double-counting controls, and running a quality-assurance process managed by the Scorecard team.",
    bodyText:
      "Each active operation with a Core Results Indicator tag files an achieved results figure in its Implementation Status Report during the annual reporting window (typically July–December for the prior fiscal year). Project rows are first aggregated to country totals, then rolled up to the global portfolio figure. Where a project row is marked as a duplicate, the aggregator drops it before summing. Client Context Indicators follow a separate path — they are sourced from WDI and IMF databases, not from project reports. The Results Handbook governs the full data flow, timing cutoffs, and restatement rules. If a specific project's data appears incorrectly captured, that needs to go to the Scorecard team directly.",
    filterCaption: "Source: Results Handbook — annual reporting cycle and data flow · FY25",
    chartTitle: "Results compilation pipeline — ISR to Scorecard",
    signalsHeader: "Methods Advisor",
    continueExploring: [
      "How does the duplicate-counting control work in practice?",
      "When are FY25 results final — what is the lock date?",
      "How does the restatement process work when a project corrects an ISR?",
      "Which projects are excluded from Scorecard aggregation?",
    ],
    sources: [
      "Results Handbook — annual reporting cycle, data flow, and governance",
      "Scorecard Methodology Notes — per-indicator aggregation and counting rules",
      "IDMS Metadata — CRI tagging structure and ISR filing fields",
    ],
  },
  "norway-donor": {
    title: "Norway's share of IDA results",
    defaultPrompt: "What proportion of Scorecard results in IDA countries is being achieved with Norway's money?",
    leadAnswer:
      "Norway's IDA21 subscription of $1.97B represents 4.3% of total donor contributions. On a proportional attribution basis, this maps to approximately 12.5 million of the 292 million beneficiaries reached through Scorecard indicators in IDA countries in FY25.",
    bodyText:
      "IDA does not attribute specific project results to individual donors — all contributions go into a common pool. Proportional attribution divides Norway's share of IDA21 subscriptions (4.3%) across the aggregate IDA results for each indicator. Across the People pillar, Norway's attributed share covers an estimated 5.2M people reached with health services, 4.1M students supported, and 3.2M beneficiaries of social safety nets. On climate and infrastructure, the proportional share is smaller in absolute terms but Norway's priorities in fragile and conflict-affected states mean a higher concentration of attributed results come from FCS countries — roughly 38% vs 24% for the wider IDA portfolio.",
    filterCaption: "Proportional attribution — Norway IDA21 subscription share (4.3%) applied to FY25 IDA aggregate results",
    chartTitle: "Norway's attributed share — FY25 IDA indicators",
    signalsHeader: "Donor attribution signals",
    continueExploring: [
      "How does Norway's share compare to other Nordic donors?",
      "Which IDA financing windows does Norway's funding flow through?",
      "How does Norway's food security priority align with Scorecard indicators?",
      "Show Norway's attributed results in FCS countries specifically",
    ],
    sources: [
      "IDA21 Replenishment Agreement — donor subscription schedule",
      "FY25 IDA Results aggregate · Achieved_Results by indicator",
      "Scorecard Metadata · Double_Counting_Flag and country eligibility",
      "IDA Results Measurement System — proportional attribution methodology",
    ],
  },
};

// Narrative catalog from CLAUDE.md §12. Keywords drive matching against the
// user's query so the surfaced narratives are relevant to what they asked.
interface Narrative {
  oa: string;          // outcome-area badge label
  title: string;       // narrative title
  slug: string;        // appended to NARRATIVE_BASE
  headline: string;    // FY25 stat tied to the narrative
  direction: SignalDirection;
  keywords: string[];  // matched against the prompt
}

const NARRATIVE_BASE = "https://scorecard.worldbank.org/en/narratives/";

const NARRATIVES: Narrative[] = [
  {
    oa: "OA-1", title: "Protection for the Poorest",
    slug: "protection-for-the-poorest/results-narrative",
    headline: "244M reached", direction: "up",
    keywords: ["poverty", "poor", "extreme", "safety net", "social protection", "vulnerable", "inequality"],
  },
  {
    oa: "OA-2", title: "No Learning Poverty",
    slug: "no-learning-poverty/results-narrative",
    headline: "325M students", direction: "up",
    keywords: ["education", "learning", "school", "students", "literacy", "primary"],
  },
  {
    oa: "OA-3", title: "Healthier Lives",
    slug: "healthier-lives/results-narrative",
    headline: "370M people", direction: "up",
    keywords: ["health", "uhc", "hospital", "stunting", "nutrition", "disease", "medical"],
  },
  {
    oa: "OA-5", title: "Green & Blue Planet",
    slug: "green-and-blue-planet/results-narrative",
    headline: "244M / 425M", direction: "down",
    keywords: ["climate", "resilience", "emissions", "ghg", "conservation", "biodiversity", "planet", "environment"],
  },
  {
    oa: "OA-7", title: "Sustainable Food Systems",
    slug: "sustainable-food-systems/results-narrative",
    headline: "Food security", direction: "flat",
    keywords: ["food", "nutrition", "hunger", "agriculture", "farm", "crops"],
  },
  {
    oa: "OA-9", title: "Energy for All",
    slug: "affordable-reliable-sustainable-energy/results-narrative",
    headline: "215M / 576M", direction: "down",
    keywords: ["electricity", "energy", "power", "grid", "renewable", "solar", "wind"],
  },
  {
    oa: "OA-10", title: "Digital Connectivity",
    slug: "digital-connectivity/results-narrative",
    headline: "217M (+2x)", direction: "up",
    keywords: ["broadband", "internet", "digital", "connectivity", "online"],
  },
  {
    oa: "OA-11", title: "Digital Services",
    slug: "digital-services/results-narrative",
    headline: "e-Gov rollout", direction: "up",
    keywords: ["digital", "service", "egovernment", "platform", "digitalization"],
  },
  {
    oa: "OA-12", title: "Gender Equality & Youth",
    slug: "gender-equality-and-youth-inclusion/results-narrative",
    headline: "Women & youth", direction: "up",
    keywords: ["gender", "women", "girls", "youth", "equality", "inclusion", "neet"],
  },
  {
    oa: "OA-14", title: "Better Lives in FCV",
    slug: "better-lives-for-people-in-fragility/results-narrative",
    headline: "FCS focus", direction: "down",
    keywords: ["fcs", "fcv", "fragile", "conflict", "violence", "displacement", "refugee"],
  },
  {
    oa: "OA-15", title: "More Private Investments",
    slug: "more-private-investments/results-narrative",
    headline: "PCE & PCM", direction: "flat",
    keywords: ["private capital", "investment", "pce", "pcm", "ifc", "miga", "mobilized", "enabled"],
  },
];

/** Score each narrative by how many of its keywords appear in `prompt`,
 * return the top `n`. Falls back to the first `n` when nothing matches. */
function pickNarratives(prompt: string, n = 4): Narrative[] {
  const text = prompt.toLowerCase();
  const scored = NARRATIVES.map((nv) => ({
    nv,
    score: nv.keywords.reduce((acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0), 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  if (scored[0].score === 0) return NARRATIVES.slice(0, n);
  return scored.slice(0, n).map((s) => s.nv);
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function NarrativeCard({ n }: { n: Narrative }) {
  return (
    <a
      href={`${NARRATIVE_BASE}${n.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2.5 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h6 className="text-[13.5px] font-semibold text-gray-900 leading-snug">
          {n.title}
        </h6>
        <IconExternalLink
          size={13}
          className="text-gray-300 group-hover:text-blue-600 transition-colors shrink-0 mt-0.5"
        />
      </div>
      <span className="text-[11.5px] text-gray-500 leading-tight">{n.headline}</span>
    </a>
  );
}

function SignalCard({ s }: { s: SignalCard }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
      <img
        src={s.iconSrc}
        alt=""
        width={32}
        height={32}
        aria-hidden="true"
        className="shrink-0"
        style={{ display: "block" }}
      />
      <span className="flex-1 text-[12.5px] text-gray-700 leading-snug">{s.label}</span>
      <span className="text-[15px] font-semibold text-gray-900 leading-none whitespace-nowrap">{s.value}</span>
    </div>
  );
}

interface ChartTooltipPayload {
  payload: ChartRow;
}
function ChartTooltip({ active, payload }: { active?: boolean; payload?: ChartTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const ratio = row.expected
    ? Math.round((row.achieved / row.expected) * 100)
    : null;
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-md px-3 py-2 text-[12px]">
      <div className="font-semibold text-gray-900 mb-1">{row.name}</div>
      <div className="flex items-center gap-2 text-gray-600">
        <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#5B5BD6" }} />
        Achieved <span className="font-semibold text-gray-900 ml-auto">{row.achieved} {row.unit}</span>
      </div>
      {row.expected != null && (
        <div className="flex items-center gap-2 text-gray-600 mt-0.5">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#C7C7F0" }} />
          Expected <span className="font-semibold text-gray-900 ml-auto">{row.expected} {row.unit}</span>
        </div>
      )}
      {ratio != null && (
        <div className="text-[11px] text-gray-400 mt-1">{ratio}% of pipeline</div>
      )}
      {row.note && <div className="text-[11px] text-gray-400 mt-0.5">{row.note}</div>}
      <div className="text-[10px] text-gray-300 mt-1.5 font-mono">{row.code}</div>
    </div>
  );
}

function PovertyChart({ title, disabled = false }: { title: string; disabled?: boolean }) {
  const [active, setActive] = useState<FilterTab>("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const data = active === "All"
    ? CHART_DATA
    : CHART_DATA.filter((r) => r.vertical === active);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 ${disabled ? "opacity-90" : ""}`}>
      <h4 className="text-[15px] font-bold text-gray-900">{title}</h4>

      {/* Interactive filter tabs — locked once the user moves into the
          narrative-creation flow so the conversation chart freezes at
          whatever view they chose. */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => !disabled && setActive(t)}
            disabled={disabled && active !== t}
            aria-disabled={disabled || undefined}
            className={`px-3 py-1 rounded-md text-[12px] font-medium border transition-colors ${
              active === t
                ? "border-gray-900 text-gray-900 bg-white"
                : "border-gray-200 text-gray-500 bg-white" +
                  (disabled
                    ? " opacity-50 cursor-not-allowed"
                    : " hover:border-gray-300 hover:text-gray-700")
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11.5px] text-gray-600 mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#5B5BD6" }} />
          Achieved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#C7C7F0" }} />
          Expected (pipeline)
        </span>
      </div>

      <div style={{ height: Math.max(180, data.length * 52) }} className={`w-full ${disabled ? "pointer-events-none" : ""}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            barCategoryGap={10}
            onMouseLeave={() => setHovered(null)}
          >
            <CartesianGrid horizontal={false} stroke="#F1F5F9" />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v}`}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11.5, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              width={150}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(91, 91, 214, 0.05)" }} />
            <Bar
              dataKey="achieved"
              fill="#5B5BD6"
              radius={[0, 3, 3, 0]}
              barSize={10}
              onMouseEnter={(d: { payload?: ChartRow }) => !disabled && setHovered(d.payload?.code ?? null)}
              fillOpacity={1}
            />
            <Bar
              dataKey="expected"
              fill="#C7C7F0"
              radius={[0, 3, 3, 0]}
              barSize={10}
              onMouseEnter={(d: { payload?: ChartRow }) => !disabled && setHovered(d.payload?.code ?? null)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote that updates with hover for a bit of feedback */}
      <div className="text-[11px] text-gray-400 -mt-1 pl-1 min-h-[14px]">
        {disabled
          ? `${data.length} indicator${data.length === 1 ? "" : "s"} · view locked while narrative is in progress`
          : hovered
            ? `Indicator code: ${hovered}`
            : `${data.length} indicator${data.length === 1 ? "" : "s"} · hover bars for detail`}
      </div>
    </div>
  );
}

// Health-gap flow — country-level achievement chart with status filter.
function HealthGapChart({ title, caption, disabled = false }: { title: string; caption: string; disabled?: boolean }) {
  const [active, setActive] = useState<HealthFilterTab>("All countries");
  const [hovered, setHovered] = useState<string | null>(null);

  const data = HEALTH_COUNTRY_DATA
    .filter((r) => {
      if (active === "FCS") return r.fcs;
      if (active === "Behind target") return r.achieved / r.expected < 0.5;
      return true;
    })
    .slice()
    .sort((a, b) => a.achieved / a.expected - b.achieved / b.expected); // worst first

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 ${disabled ? "opacity-90" : ""}`}>
      <h4 className="text-[15px] font-bold text-gray-900">{title}</h4>

      <div className="flex items-center gap-2 flex-wrap">
        {HEALTH_FILTER_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => !disabled && setActive(t)}
            disabled={disabled && active !== t}
            aria-disabled={disabled || undefined}
            className={`px-3 py-1 rounded-md text-[12px] font-medium border transition-colors ${
              active === t
                ? "border-gray-900 text-gray-900 bg-white"
                : "border-gray-200 text-gray-500 bg-white" +
                  (disabled
                    ? " opacity-50 cursor-not-allowed"
                    : " hover:border-gray-300 hover:text-gray-700")
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11.5px] text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#5B5BD6" }} />
          Achieved (FY25)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#C7C7F0" }} />
          FY25 target
        </span>
      </div>

      <ul className={`flex flex-col gap-2.5 ${disabled ? "pointer-events-none" : ""}`}>
        {data.map((row) => {
          const ratio = row.achieved / row.expected;
          const pct = Math.round(ratio * 100);
          const isHover = !disabled && hovered === row.iso3;
          const barColor =
            ratio < 0.5  ? "#D04040" :
            ratio < 0.75 ? "#E88B2B" : "#2E8B57";
          return (
            <li
              key={row.iso3}
              onMouseEnter={() => !disabled && setHovered(row.iso3)}
              onMouseLeave={() => !disabled && setHovered(null)}
              className="flex flex-col gap-1"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-gray-900 flex items-center gap-1.5">
                  {row.name}
                  {row.fcs && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded bg-orange-50 text-orange-700 border border-orange-200">
                      FCS
                    </span>
                  )}
                </span>
                <span className={`text-[11.5px] tabular-nums transition-colors ${isHover ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                  {row.achieved}M / {row.expected}M · {pct}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-[#C7C7F0]"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, pct)}%`, background: barColor, opacity: isHover ? 1 : 0.9 }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-[11px] text-gray-400 -mt-1">
        {disabled ? `${caption} · view locked while narrative is in progress` : caption}
      </div>
    </div>
  );
}

// FY24 → FY25 delta flow — paired FY24/FY25 bars per indicator with a delta
// chip on the right. Filter chips at top split rows into Gainers / Slippers
// to make the directional split immediately readable.
const YOY_FILTER_TABS = ["All", "Gainers", "Slippers"] as const;
type YoYFilterTab = typeof YOY_FILTER_TABS[number];

function YoYDeltaChart({ title, disabled = false }: { title: string; disabled?: boolean }) {
  const [active, setActive] = useState<YoYFilterTab>("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const rows = YOY_DATA
    .filter((r) => {
      if (active === "Gainers")  return r.fy25 > r.fy24;
      if (active === "Slippers") return r.fy25 <= r.fy24;
      return true;
    })
    .slice()
    .sort((a, b) => (b.fy25 / b.fy24) - (a.fy25 / a.fy24)); // biggest gainers first

  // Shared scale across both bars so visual length is comparable across rows.
  const max = Math.max(...YOY_DATA.flatMap((r) => [r.fy24, r.fy25]));

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 ${disabled ? "opacity-90" : ""}`}>
      <h4 className="text-[15px] font-bold text-gray-900">{title}</h4>

      <div className="flex items-center gap-2 flex-wrap">
        {YOY_FILTER_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => !disabled && setActive(t)}
            disabled={disabled && active !== t}
            aria-disabled={disabled || undefined}
            className={`px-3 py-1 rounded-md text-[12px] font-medium border transition-colors ${
              active === t
                ? "border-gray-900 text-gray-900 bg-white"
                : "border-gray-200 text-gray-500 bg-white" +
                  (disabled
                    ? " opacity-50 cursor-not-allowed"
                    : " hover:border-gray-300 hover:text-gray-700")
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11.5px] text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#C7C7F0" }} />
          FY24
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#5B5BD6" }} />
          FY25
        </span>
      </div>

      <ul className={`flex flex-col gap-3 ${disabled ? "pointer-events-none" : ""}`}>
        {rows.map((row) => {
          const delta = row.fy25 - row.fy24;
          const pct = row.fy24 ? Math.round((delta / row.fy24) * 100) : 0;
          const isUp = delta > 0;
          const isFlat = delta === 0;
          const isHover = hovered === row.code;
          const fy24Pct = (row.fy24 / max) * 100;
          const fy25Pct = (row.fy25 / max) * 100;
          const deltaColor = isFlat ? "#94a3b8" : isUp ? "#2E8B57" : "#D04040";
          return (
            <li
              key={row.code}
              onMouseEnter={() => !disabled && setHovered(row.code)}
              onMouseLeave={() => !disabled && setHovered(null)}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-gray-900 flex items-center gap-1.5">
                  {row.name}
                  {row.note && (
                    <span className="text-[9.5px] font-medium uppercase tracking-wider px-1 py-px rounded bg-gray-50 text-gray-500 border border-gray-200">
                      {row.note}
                    </span>
                  )}
                </span>
                <span
                  className="text-[11.5px] font-semibold tabular-nums flex items-center gap-1 shrink-0"
                  style={{ color: deltaColor }}
                >
                  {isUp ? <IconArrowUpRight size={12} /> : isFlat ? <IconMinus size={12} /> : <IconArrowDown size={12} />}
                  {isUp && "+"}{pct}%
                </span>
              </div>
              {/* Paired bars — FY24 on top, FY25 below. Sharing the global
                  max keeps lengths comparable across rows. */}
              <div className="flex flex-col gap-1">
                <div className="h-[7px] bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${fy24Pct}%`, background: "#C7C7F0", opacity: isHover ? 1 : 0.9 }} />
                </div>
                <div className="h-[7px] bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${fy25Pct}%`, background: "#5B5BD6", opacity: isHover ? 1 : 0.9 }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10.5px] tabular-nums text-gray-400">
                <span>FY24 {row.fy24} {row.unit}</span>
                <span className={isHover ? "text-gray-700" : ""}>FY25 {row.fy25} {row.unit}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-[11px] text-gray-400 -mt-1">
        {disabled
          ? `${rows.length} indicator${rows.length === 1 ? "" : "s"} · view locked while narrative is in progress`
          : hovered
            ? `Indicator code: ${hovered}`
            : `${rows.length} indicator${rows.length === 1 ? "" : "s"} · FY25 − FY24 delta · hover rows for code`}
      </div>
    </div>
  );
}

// ─── Analytics Engine: Comparative Response ──────────────────────────────────
// Structured three-layer comparative response for the fy24-fy25-delta flow.
// Mirrors the Analytics Engine spec: headline → ranked chart → synthesis →
// Layer 1 (portfolio) → Layer 2 (common cohort) → Layer 3 (project drivers) →
// methodology / provenance → follow-up prompts.

const LAYER_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  "Layer 1": { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
  "Layer 2": { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  "Layer 3": { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
};

function LayerBadge({ label }: { label: string }) {
  const s = LAYER_BADGE[label] ?? LAYER_BADGE["Layer 1"];
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

const PORTFOLIO_STATS = {
  fy24: { projects: 412, indicators: 8, doubleFlagged: "9.4%" },
  fy25: { projects: 438, indicators: 8, doubleFlagged: "8.7%" },
};

const RANKED_DELTA_DATA = [
  { name: "Broadband users",      delta: 99  },
  { name: "Health services",      delta: 12  },
  { name: "Students supported",   delta: 12  },
  { name: "Conservation",         delta: 12  },
  { name: "Social safety nets",   delta: 12  },
  { name: "Electricity access",   delta: 5   },
  { name: "Climate resilience",   delta: -2  },
  { name: "Tax-to-GDP",           delta: -3  },
].sort((a, b) => b.delta - a.delta);

const WBG_AVG_DELTA = Math.round(
  RANKED_DELTA_DATA.reduce((s, d) => s + d.delta, 0) / RANKED_DELTA_DATA.length
);

function RankedDeltaChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-gray-800">Year-on-year change by indicator</span>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="inline-block w-8 border-t-2 border-dashed border-gray-400" />
          WBG average ({WBG_AVG_DELTA > 0 ? "+" : ""}{WBG_AVG_DELTA}%)
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={RANKED_DELTA_DATA}
          layout="vertical"
          margin={{ top: 0, right: 48, bottom: 0, left: 112 }}
          barSize={12}
        >
          <CartesianGrid horizontal={false} stroke="#F1F5F9" />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
            tick={{ fontSize: 10.5, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11.5, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={108}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            formatter={(v) => [`${Number(v) > 0 ? "+" : ""}${v}%`, "YoY change"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <ReferenceLine
            x={WBG_AVG_DELTA}
            stroke="#94a3b8"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: `avg`, position: "insideTopRight", fontSize: 9.5, fill: "#94a3b8", dy: -4 }}
          />
          <Bar dataKey="delta" radius={[0, 3, 3, 0]}>
            {RANKED_DELTA_DATA.map((d) => (
              <Cell key={d.name} fill={d.delta >= 0 ? "#5B5BD6" : "#F87171"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


const PROJECT_DRIVERS = [
  { name: "HNP Services (SSA)",    code: "P174623", contribution: "+18M", direction: "up"   as const, indicator: "Health services"    },
  { name: "Education SSA II",      code: "P175802", contribution: "+14M", direction: "up"   as const, indicator: "Students supported"  },
  { name: "Safety Net Scale-Up",   code: "P178910", contribution: "+11M", direction: "up"   as const, indicator: "Social safety nets"  },
  { name: "Digital Connect LAC",   code: "P180041", contribution: "+52M", direction: "up"   as const, indicator: "Broadband users"     },
  { name: "Electricity FCS Niger", code: "P171334", contribution: "−3M",  direction: "down" as const, indicator: "Electricity access"  },
  { name: "Climate Action YEM",    code: "P179220", contribution: "−4M",  direction: "down" as const, indicator: "Climate resilience"  },
];

const NON_CONTRIBUTING = [
  { name: "West Africa Agri Dev",      code: "P176201", reason: "No ISR filed (FY25)"              },
  { name: "MENA Water Access III",     code: "P172844", reason: "Closed before June 2025 cut-off"  },
  { name: "East Africa Transport",     code: "P169903", reason: "Out-of-scope indicator tag"        },
  { name: "SAR Resilience SOP-2",      code: "P181122", reason: "Pipeline — not yet disbursing"     },
  { name: "Digital Govt Bolivia",      code: "P173560", reason: "Results reported under parent P"   },
];

function DonorAttributionStats({ disabled = false }: { disabled?: boolean }) {
  const stats = [
    { label: "Norway's IDA21 subscription", value: "$1.97B" },
    { label: "Share of total donor contributions", value: "4.3%" },
    { label: "Attributed beneficiaries (FY25)", value: "~12.5M" },
    { label: "Results in FCS countries", value: "38%" },
  ];
  const breakdown = [
    { label: "People reached with health services", value: "~5.2M" },
    { label: "Students supported", value: "~4.1M" },
    { label: "Social safety net beneficiaries", value: "~3.2M" },
  ];
  return (
    <div className={`flex flex-col gap-4 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-4">
            <div className="text-[22px] font-bold text-gray-900 leading-none">{s.value}</div>
            <div className="text-[12px] text-gray-500 mt-1.5 leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">People pillar attribution</span>
        </div>
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
            <span className="text-[13px] text-gray-700">{b.label}</span>
            <span className="text-[13px] font-semibold text-gray-900">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparativeAnalyticsResponse({ disabled, leadDone }: { disabled: boolean; leadDone: boolean }) {
  const [showDriverCodes, setShowDriverCodes] = useState(false);
  const [showNonContrib, setShowNonContrib] = useState(false);
  const { isInternal } = useViewMode();

  return (
    <div className="flex flex-col gap-5" style={{ opacity: leadDone ? 1 : 0, transition: "opacity 0.7s" }}>

      {/* Ranked bar chart */}
      <RankedDeltaChart />

      {/* Synthesis */}
      <p className="text-[13.5px] text-gray-700 leading-relaxed">
        <strong className="font-semibold text-gray-900">Broadband (+99%)</strong> is the widest gainer, doubling off a small base.{" "}
        <strong className="font-semibold text-gray-900">Climate resilience and Tax-to-GDP</strong> are the only two indicators that declined.
        The People pillar's consistent +12% was not driven by more projects — projects that were already active matured and delivered more, and fewer beneficiaries were counted more than once compared to the prior year.
      </p>

      {/* Portfolio stats */}
      <div className="grid grid-cols-2 gap-3">
        {(["fy24", "fy25"] as const).map((fy) => {
          const s = PORTFOLIO_STATS[fy];
          return (
            <div key={fy} className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{fy.toUpperCase()}</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11.5px] text-gray-500">Active projects</span>
                  <span className="text-[13.5px] font-bold text-gray-900 tabular-nums">{s.projects}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11.5px] text-gray-500">Indicators reported</span>
                  <span className="text-[13.5px] font-bold text-gray-900 tabular-nums">{s.indicators}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11.5px] text-gray-500">Deduplicated rows</span>
                  <span className="text-[13.5px] font-bold text-gray-900 tabular-nums">{s.doubleFlagged}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[13px] text-gray-600 leading-relaxed">
        FY25 added <strong className="text-gray-800">26 net-new projects</strong>, a 6.3% increase. Where the same beneficiary was reached by more than one project, only one instance was counted — this deduplication rate improved slightly year-on-year.
        Electricity access is a notable exception: fewer projects reported to this indicator in FY25, yet total reach still rose by 10 million people because the remaining projects were larger on average and operating outside fragile settings.
      </p>

      {/* Common cohort */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1.5">
          <span className="text-[10.5px] text-gray-400 leading-snug">Projects active in both FY24 and FY25 <span className="text-gray-300">· 347 projects</span></span>
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-bold text-gray-900 tabular-nums">1,512M</span>
            <span className="text-[11px] font-semibold text-emerald-600">+9.1%</span>
          </div>
          <span className="text-[10.5px] text-gray-400">FY24: 1,386M people</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1.5">
          <span className="text-[10.5px] text-gray-400 leading-snug">All active projects in FY25 <span className="text-gray-300">· full portfolio</span></span>
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-bold text-gray-900 tabular-nums">1,569M</span>
            <span className="text-[11px] font-semibold text-emerald-600">+57M</span>
          </div>
          <span className="text-[10.5px] text-gray-400">from 91 new FY25 entrants</span>
        </div>
      </div>

      <p className="text-[13px] text-gray-600 leading-relaxed">
        The 347 projects active in both years account for 88% of total reach. Their +9.1% gain explains most of the People-pillar improvement — projects that entered the portfolio for the first time in FY25 contributed the remaining 3 percentage points.
      </p>

      {/* Project-level drivers */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Top drivers</span>
          {isInternal && (
            <button
              onClick={() => !disabled && setShowDriverCodes((v) => !v)}
              className="text-[11.5px] text-blue-600 hover:text-blue-800 transition-colors"
              disabled={disabled}
            >
              {showDriverCodes ? "Hide codes" : "Show project codes"}
            </button>
          )}
        </div>
        <div className="flex flex-col divide-y divide-gray-100">
          {PROJECT_DRIVERS.map((p) => (
            <div key={p.code} className="flex items-center gap-3 py-2">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.direction === "up" ? "bg-emerald-500" : "bg-red-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-gray-800 truncate">{p.name}</div>
                <div className="text-[11px] text-gray-400">{p.indicator}</div>
              </div>
              {isInternal && showDriverCodes && (
                <code className="text-[10.5px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">{p.code}</code>
              )}
              <span className={`text-[12.5px] font-bold tabular-nums shrink-0 ${p.direction === "up" ? "text-emerald-700" : "text-red-600"}`}>
                {p.contribution}
              </span>
            </div>
          ))}
        </div>

        {isInternal && (
          <div className="mt-1 flex flex-col gap-2">
            <button
              onClick={() => !disabled && setShowNonContrib((v) => !v)}
              disabled={disabled}
              className="flex items-center gap-1.5 text-[11.5px] text-gray-500 hover:text-gray-700 transition-colors w-fit"
            >
              <IconChevronRight size={12} className={`transition-transform duration-150 ${showNonContrib ? "rotate-90" : ""}`} />
              <span>{showNonContrib ? "Hide" : "Show"} projects with no contribution ({NON_CONTRIBUTING.length})</span>
            </button>
            {showNonContrib && (
              <div className="flex flex-col divide-y divide-gray-100">
                {NON_CONTRIBUTING.map((p) => (
                  <div key={p.code} className="flex items-center gap-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-gray-300" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-gray-600 truncate">{p.name}</div>
                      <div className="text-[10.5px] text-gray-400">{p.reason}</div>
                    </div>
                    <code className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">{p.code}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Methodology note + sources */}
      <div className="flex flex-col gap-2 text-[12px] text-gray-500 leading-relaxed pt-3 border-t border-gray-100">
        <p>
          FY24 figures are as reported at end-June 2024; FY25 at end-June 2025. The broadband baseline was corrected from 115M to 109M after a methodology review, and the climate resilience figure was restated following a change in how anticipatory-action results are counted. All year-on-year comparisons use the restated baselines.
        </p>
        <UsedSources sources={[
          "FY2024 and FY2025 IDA Results — indicator-level achieved values",
          "Scorecard Metadata — deduplication rules (FY24/FY25 comparability)",
          "Digital Connectivity methodology note — FY24 baseline restatement",
          "Climate Resilience methodology note — anticipatory-action accounting change",
        ]} />
      </div>

    </div>
  );
}

// HNP measurement flow — a methodology card. Left column documents what
// counts (and what doesn't); right column charts the 5-year reach trajectory
// ─── Methods Advisor Card ────────────────────────────────────────────────────
// Renders a structured methodology card for text-based Methods Advisor flows
// (taxonomy and compilation) — no chart data, pure structure explanation.
function MethodsAdvisorCard({ flow, disabled = false }: { flow: "methods-taxonomy" | "methods-compilation"; disabled?: boolean }) {
  const isTaxonomy = flow === "methods-taxonomy";
  return (
    <div className={`flex flex-col gap-3 text-[13.5px] text-gray-700 leading-relaxed ${disabled ? "opacity-90" : ""}`}>
      {isTaxonomy ? (
        <>
          <p>
            The Scorecard is structured in three layers. At the top, Outcome Areas define the WBG's strategic development priorities — there are six in the FY25 Scorecard, covering poverty, prosperity, people, resilience, sustainability, and institutions. <Cite>IDA Scorecard Metadata</Cite>
          </p>
          <p>
            Within each Outcome Area sit two distinct types of indicators. Results Indicators measure what WBG operations directly deliver — they are sourced from project Implementation Status Reports and aggregate from project level up to a global portfolio total. <Cite>Results Handbook</Cite>
          </p>
          <p>
            Client Context Indicators measure the development environment those operations work in. They are drawn from external statistical sources such as the World Development Indicators and IMF databases, and are reported at country level only — they are not summed to a portfolio total. The two types use different data structures and different source systems and are not interchangeable. <Cite>Results Handbook</Cite>
          </p>
          <p className="text-[11px] text-gray-400">
            Source: IDA Scorecard Metadata — Result sheet · Results Handbook
          </p>
        </>
      ) : (
        <>
          <p>
            Scorecard Results Indicators are compiled through an annual cycle that runs from July to December for the prior fiscal year. The process begins when Core Results Indicator tags are assigned to active operations — this typically happens over the summer and determines which projects contribute to which indicators. <Cite>Results Handbook</Cite>
          </p>
          <p>
            Once tagged, task teams file an achieved results figure for each indicator in the project's Implementation Status Report. These project-level figures are then aggregated first to country totals and then to the global portfolio figure. Rows identified as duplicates at the project level are excluded from the sum before it rolls up, so no beneficiary is counted more than once. <Cite>Results Handbook</Cite>
          </p>
          <p>
            Before publication the Scorecard team runs validation checks — range tests, year-over-year outlier flags, and cross-indicator consistency reviews. Validated figures are published as the final Scorecard for that fiscal year. Client Context Indicators follow a separate path entirely: they are sourced directly from WDI and IMF databases and updated independently of the Implementation Status Report cycle. <Cite>Results Handbook</Cite>
          </p>
          <p className="text-[11px] text-gray-400">
            Source: Results Handbook — annual reporting cycle · FY25
          </p>
        </>
      )}
    </div>
  );
}

function Cite({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 10.5, lineHeight: 1,
      padding: "2px 7px", borderRadius: 100,
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.6)",
      fontWeight: 500, letterSpacing: "0.01em",
      verticalAlign: "middle", whiteSpace: "nowrap",
      marginLeft: 3,
    }}>
      {children}
    </span>
  );
}

// so the indicator's recent history is visible alongside the definition.
function IndicatorMethodologyCard({ title, disabled = false }: { title: string; disabled?: boolean }) {
  const [hoverPoint, setHoverPoint] = useState<TrendPoint | null>(null);
  const max = Math.max(...HNP_TREND.map((p) => p.value));
  const min = Math.min(...HNP_TREND.map((p) => p.value));
  // Inline SVG instead of recharts — a single-series sparkline with markers
  // reads as "indicator history" rather than another full chart panel.
  const W = 280;
  const H = 110;
  const padX = 28;
  const padY = 14;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const xFor = (i: number) => padX + (i / (HNP_TREND.length - 1)) * innerW;
  const yFor = (v: number) =>
    padY + innerH - ((v - min) / Math.max(1, max - min)) * innerH;
  const path = HNP_TREND.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`).join(" ");
  const areaPath = `${path} L ${xFor(HNP_TREND.length - 1)} ${padY + innerH} L ${xFor(0)} ${padY + innerH} Z`;

  return (
    <div className={`flex flex-col gap-4 ${disabled ? "opacity-90" : ""}`}>
      <div className="flex flex-col gap-3 text-[13.5px] text-gray-700 leading-relaxed">
        <p>
          This indicator counts the unique number of people who received at least one IDA-financed health, nutrition, or population service during the fiscal year. <Cite>HNP Services methodology note</Cite> A person is counted once regardless of how many services they received — duplicate entries across operations are removed before the country total is calculated. <Cite>Results Handbook</Cite>
        </p>
        <p>
          Services that qualify include primary care visits, maternal and child health touchpoints, immunisations, nutrition consultations, and disease-specific outreach. <Cite>HNP Services methodology note</Cite> Infrastructure outputs such as clinic construction and equipment-only grants do not count as a service to a person. Health-worker training and insurance-scheme enrolment also do not count unless they directly correspond to an individual receiving a service.
        </p>
        <p>
          Project totals are first aggregated to country level, then summed to the global portfolio figure. <Cite>Results Handbook</Cite> Rows identified as duplicates at the project level are excluded before summing so that no individual is counted more than once in the global total. <Cite>Scorecard Metadata</Cite>
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">5-year reach (M people)</span>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-[130px]"
          role="img"
          aria-label="People reached with HNP Services, FY21 to FY25"
        >
          {[0, 0.5, 1].map((t) => {
            const y = padY + innerH * (1 - t);
            return <line key={t} x1={padX} y1={y} x2={W - padX} y2={y} stroke="#E2E8F0" strokeWidth={1} />;
          })}
          <path d={areaPath} fill="#5B5BD6" opacity={0.06} />
          <path d={path} fill="none" stroke="#5B5BD6" strokeWidth={2} />
          {HNP_TREND.map((p, i) => {
            const isHover = !disabled && hoverPoint?.fy === p.fy;
            return (
              <g key={p.fy}
                onMouseEnter={() => !disabled && setHoverPoint(p)}
                onMouseLeave={() => !disabled && setHoverPoint(null)}
                style={{ cursor: disabled ? "default" : "pointer" }}
              >
                <circle cx={xFor(i)} cy={yFor(p.value)} r={isHover ? 5 : 3.5} fill="#5B5BD6" stroke="white" strokeWidth={1.5} />
                <rect x={xFor(i) - 14} y={padY} width={28} height={innerH} fill="transparent" />
              </g>
            );
          })}
          {HNP_TREND.map((p, i) => (
            <text key={p.fy} x={xFor(i)} y={H - 2} fontSize={9} textAnchor="middle" fill="#94a3b8">{p.fy}</text>
          ))}
        </svg>
        <div className="flex items-baseline justify-between px-1">
          <span className="text-[11px] text-gray-400">
            {hoverPoint ? `${hoverPoint.fy} · ${hoverPoint.value}M people` : "Hover for year"}
          </span>
          <span className="text-[11px] font-semibold text-gray-600 tabular-nums">+51% over 5y</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Source: HNP Services methodology note · FY25 reporting cycle
      </p>
    </div>
  );
}

// ─── Thought Process ─────────────────────────────────────────────────────────
// A vertical "research log" with typed steps (search → compute → filter → analyze)
// each rendered as a connected timeline item with its own icon and a
// monospace "result" line.

type ThoughtStepType = "search" | "compute" | "filter" | "analyze";

const THOUGHT_STEP_META: Record<ThoughtStepType, { icon: typeof IconSearch; color: string; tint: string; label: string }> = {
  search:  { icon: IconSearch,     color: "#0288D1", tint: "#E6F4FB", label: "Search"  },
  compute: { icon: IconCalculator, color: "#6B4FA0", tint: "#EFEAF7", label: "Compute" },
  filter:  { icon: IconFilter,     color: "#E88B2B", tint: "#FCEFE0", label: "Filter"  },
  analyze: { icon: IconChartBar,   color: "#2E8B57", tint: "#E5F2EC", label: "Analyze" },
};

interface ThoughtStep {
  type: ThoughtStepType;
  text: string;
  detail?: string;   // monospaced "result" line
}

const THOUGHT_STEPS_AFRICA: ThoughtStep[] = [
  { type: "search",  text: "Searching the active FY2025 portfolio for poverty-relevant outcome indicators",         detail: "8 Results indicators matched" },
  { type: "filter",  text: "Filtering to IDA-eligible countries and excluding double-counted beneficiaries",          detail: "Deduplicating beneficiaries" },
  { type: "compute", text: "Computing achieved/expected pipeline ratios per indicator at FY25 cut-off",                detail: "FY2025 cut-off (June 2025)" },
  { type: "analyze", text: "Identifying regional leaders and cross-referencing related context signals",               detail: "AFE/AFW lead vs other regions" },
];

const THOUGHT_STEPS_HEALTH: ThoughtStep[] = [
  { type: "search",  text: "Reading Health Services results · project-level rows for FY2025",                           detail: "874 project rows scanned" },
  { type: "compute", text: "Computing achieved/expected ratio per country and aggregating by ISO3",                     detail: "Deduplicating beneficiaries" },
  { type: "filter",  text: "Filtering to fragile/conflict-affected states and ranking countries furthest below 100%",   detail: "5 countries below 50% — all FCS" },
  { type: "analyze", text: "Layering UHC index and stunting context indicators to identify driver patterns",            detail: "UHC Coverage · Stunting" },
];

const THOUGHT_STEPS_ELECTRICITY: ThoughtStep[] = [
  { type: "search",  text: "Scanning Electricity Access results · project-level rows for FY2025",                       detail: "612 project rows scanned" },
  { type: "compute", text: "Computing achieved/expected pipeline ratio across IDA portfolio",                            detail: "215M reached vs 576M expected" },
  { type: "filter",  text: "Cross-referencing renewable energy capacity and FCS country status",                         detail: "FCV countries flagged · 21% avg" },
  { type: "analyze", text: "Identifying delivery-side drivers — utility performance, project maturation, supply mix",    detail: "Capacity vs access concentration" },
];

const THOUGHT_STEPS_YOY: ThoughtStep[] = [
  { type: "search",  text: "Loading FY24 and FY25 indicator aggregates from the Results catalogue",                     detail: "8 headline indicators paired" },
  { type: "compute", text: "Computing FY25 − FY24 deltas and percent change per indicator",                              detail: "Δ% calculated · sign retained" },
  { type: "filter",  text: "Flagging indicators with restated FY24 baselines for comparability",                         detail: "2 indicators restated · noted" },
  { type: "analyze", text: "Grouping by direction (gainers vs slippers) and surfacing dominant outliers",                detail: "6 up · 2 down · broadband leads" },
];

const THOUGHT_STEPS_HNP_METHOD: ThoughtStep[] = [
  { type: "search",  text: "Reading the HNP Services methodology note for the FY25 reporting cycle",                    detail: "CSC_RES_HEA_SERV definition pulled" },
  { type: "filter",  text: "Extracting counting rules — what qualifies as a service, what doesn't",                      detail: "5 service categories · 2 exclusions" },
  { type: "compute", text: "Applying Double_Counting_Flag to project rows to estimate dedup impact",                     detail: "9.4% of rows flagged · aggregated once" },
  { type: "analyze", text: "Building 5-year reach trajectory (FY21 → FY25) and surfacing aggregation steps",             detail: "Project → country → global" },
];

const THOUGHT_STEPS_METHODS_TAXONOMY: ThoughtStep[] = [
  { type: "search",  text: "Reading the IDA Scorecard Metadata — Result sheet for indicator type classification",  detail: "Results vs Context indicators identified" },
  { type: "filter",  text: "Mapping indicator types to Outcome Areas across the FY25 Scorecard",                   detail: "6 Outcome Areas · 21 Results · 14 Context indicators" },
  { type: "analyze", text: "Extracting schema differences — COUNTRY vs ECONOMY, Achieved_Results vs Value",        detail: "2 schemas · separate source systems" },
  { type: "analyze", text: "Cross-checking taxonomy with the Results Handbook — structural mapping section",       detail: "Confirmed against handbook v01" },
];

const THOUGHT_STEPS_METHODS_COMPILATION: ThoughtStep[] = [
  { type: "search",  text: "Reading the Results Handbook — annual reporting cycle and data flow section",          detail: "FY25 compilation timeline identified" },
  { type: "filter",  text: "Extracting CRI tagging process — how indicators are assigned to operations",           detail: "Core Results Indicator tagging rules" },
  { type: "compute", text: "Mapping aggregation path — project row → country → global portfolio total",            detail: "Double_Counting_Flag applied at aggregation step" },
  { type: "analyze", text: "Separating Results compilation path from Client Context Indicator sourcing",           detail: "ISR vs WDI/IMF — distinct pipelines confirmed" },
];

const NARRATIVE_PLAN_STEPS: ThoughtStep[] = [
  { type: "search",  text: "Reading conversation context",          detail: "africa-poverty signal · 1 query" },
  { type: "search",  text: "Loading indicator catalogue",           detail: "IDA_Scorecard_Metadata_1.xlsx · 21 Results indicators" },
  { type: "filter",  text: "Matching 6 Results indicators",         detail: "SOC_SAF · EDU_SUPP · HEA_SERV · RESI_CLIM · ELC_ACCS · EXT_POOR_FCS" },
  { type: "compute", text: "Filtering to AFE + AFW · FY25 cut-off", detail: "Time_Period == 2025-06-30 · Double_Counting_Flag ≠ Y" },
  { type: "filter",  text: "Pairing 3 Client Context series",       detail: "CSC_CLI_EXT_POOR_FCS · SE_LPV_PRIM · EG_ELC_ACCS_ZS" },
  { type: "analyze", text: "Structuring narrative sections",        detail: "The Challenge · Pathways to Outcomes · Country Examples · Lessons Learned" },
];


function StreamingText({
  text,
  wordDelay = 30,
  onComplete,
}: {
  text: string;
  wordDelay?: number;
  onComplete?: () => void;
}) {
  const words = useMemo(() => text.split(" "), [text]);
  const [count, setCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const countRef = useRef(0);

  useEffect(() => {
    if (words.length === 0) { onCompleteRef.current?.(); return; }
    startRef.current = null;
    countRef.current = 0;
    setCount(0);

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const target = Math.min(
        Math.floor((now - startRef.current) / wordDelay),
        words.length,
      );
      if (target > countRef.current) {
        countRef.current = target;
        setCount(target);
      }
      if (target < words.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onCompleteRef.current?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // Re-run only when the text or delay changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, wordDelay]);

  return <>{words.slice(0, count).join(" ")}</>;
}

function ThoughtProcess({
  flow,
  customSteps,
  label = "Thought Process",
  onComplete,
}: {
  flow: FlowId;
  /** When provided, overrides the flow-based step list — used for the
   *  short transitional loader before the interactive-elements picker. */
  customSteps?: ThoughtStep[];
  /** Header label displayed next to the sparkle icon. Defaults to
   *  "Thought Process" for the original Q&A use; the proceed-loader passes
   *  "Preparing interactive elements" so the user reads it as a distinct
   *  pause rather than a duplicate of the upstream analysis log. */
  label?: string;
  onComplete?: () => void;
}) {
  const steps = customSteps ?? (
    flow === "health-gap"            ? THOUGHT_STEPS_HEALTH           :
    flow === "electricity-fcs"       ? THOUGHT_STEPS_ELECTRICITY      :
    flow === "fy24-fy25-delta"       ? THOUGHT_STEPS_YOY              :
    flow === "hnp-measurement"       ? THOUGHT_STEPS_HNP_METHOD       :
    flow === "methods-taxonomy"      ? THOUGHT_STEPS_METHODS_TAXONOMY  :
    flow === "methods-compilation"   ? THOUGHT_STEPS_METHODS_COMPILATION :
                                       THOUGHT_STEPS_AFRICA
  );
  const [visibleCount, setVisibleCount] = useState(0);
  const [open, setOpen] = useState(true);
  const done = visibleCount >= steps.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), 400);
    return () => clearTimeout(t);
  }, [visibleCount, done]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => { setOpen(false); onCompleteRef.current?.(); }, 400);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <div className="narrative-content-enter flex flex-col gap-1.5">
      {/* Header — animated dots while running, checkmark when done */}
      <button
        onClick={() => done && setOpen((v) => !v)}
        className="flex items-center gap-2 text-[12.5px] transition-colors text-left w-fit"
        aria-expanded={open}
        disabled={!done}
      >
        {done ? (
          <IconCheck size={13} className="text-emerald-500 shrink-0" />
        ) : (
          <span className="flex items-center gap-[3px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[5px] h-[5px] rounded-full bg-gray-400"
                style={{ animation: "typing-dot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        )}
        <span className={done ? "text-gray-500" : "text-gray-400 italic"}>
          {done ? label : `${label}…`}
        </span>
        {done && (
          <IconChevronDown
            size={13}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Steps — plain text, thin left rule */}
      {open && (
        <div className="ml-1 pl-3 border-l-2 border-gray-200 flex flex-col gap-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`text-[12px] text-gray-400 leading-relaxed transition-opacity duration-300 ${
                i < visibleCount ? "opacity-100" : "opacity-0"
              }`}
            >
              {step.text}
              {step.detail && i < visibleCount && (
                <span className="ml-1.5 text-gray-300 font-mono text-[10.5px]">
                  → {step.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NarrativePlanningMessage({
  animate,
  onComplete,
}: {
  animate: boolean;
  onComplete?: () => void;
}) {
  // Pause after the user's "Create narrative" message before the AI starts —
  // gives the conversation a more deliberate, reflective rhythm.
  const [visible, setVisible] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [animate]);

  const [visibleCount, setVisibleCount] = useState(() =>
    animate ? 0 : NARRATIVE_PLAN_STEPS.length
  );
  const [open, setOpen] = useState(animate);
  const done = visibleCount >= NARRATIVE_PLAN_STEPS.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reveal one step every 400ms while animating
  useEffect(() => {
    if (!animate || done) return;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), 400);
    return () => clearTimeout(t);
  }, [animate, visibleCount, done]);

  // Auto-collapse and fire callback once all steps are visible
  useEffect(() => {
    if (!animate || !done) return;
    const t = setTimeout(() => {
      setOpen(false);
      onCompleteRef.current?.();
    }, 400);
    return () => clearTimeout(t);
  }, [animate, done]);

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 pt-1.5 flex flex-col gap-1.5">
        {/* Header */}
        <button
          onClick={() => done && setOpen((v) => !v)}
          className="flex items-center gap-2 text-[12.5px] transition-colors text-left w-fit"
          aria-expanded={open}
          disabled={!done}
        >
          {done ? (
            <IconCheck size={13} className="text-emerald-500 shrink-0" />
          ) : (
            <span className="flex items-center gap-[3px]" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[5px] h-[5px] rounded-full bg-gray-400"
                  style={{ animation: "typing-dot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </span>
          )}
          <span className={done ? "text-gray-500" : "text-gray-400 italic"}>
            {done ? "Narrative planning" : "Narrative planning…"}
          </span>
          {done && (
            <IconChevronDown
              size={13}
              className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {/* Steps */}
        {open && (
          <div className="ml-1 pl-3 border-l-2 border-gray-200 flex flex-col gap-1">
            {NARRATIVE_PLAN_STEPS.map((step, i) => (
              <div
                key={i}
                className={`text-[12px] text-gray-400 leading-relaxed transition-opacity duration-300 ${
                  i < visibleCount ? "opacity-100" : "opacity-0"
                }`}
              >
                {step.text}
                {step.detail && i < visibleCount && (
                  <span className="ml-1.5 text-gray-300 font-mono text-[10.5px]">
                    → {step.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function NarrativeGeneratingMessage({ generating }: { generating: boolean }) {
  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          Got it — generating the first draft of your narrative now.
        </p>
        {generating && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}

// Shown once when the user enters refining mode (clicked "Make changes" from
// any entry point). Plain bulleted text list of things the user might want
// to tweak — explicitly the simple variant the user picked over chips.
function MakeChangesSuggestionsMessage() {
  const suggestions = [
    "Add another country example so the angle isn't just one or two case studies.",
    "Sharpen the lessons learned with a specific success-vs-pitfall pair.",
    "Swap one of the country examples for one in a different region.",
    "Reframe the challenge paragraph around a different bottleneck.",
  ];
  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 pt-1 flex flex-col gap-2">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          Sure — a few things you might want to change:
        </p>
        <ul className="flex flex-col gap-1.5 pl-5 list-disc text-[13px] text-gray-700 leading-relaxed marker:text-gray-400">
          {suggestions.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <p className="text-[12.5px] text-gray-500 leading-relaxed mt-1">
          Type your change in the prompt bar below, or describe something else entirely.
        </p>
      </div>
    </div>
  );
}

function CvUserBubble({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(9999);
  useEffect(() => {
    if (ref.current) setRadius(ref.current.offsetHeight > 44 ? 18 : 9999);
  }, [text]);
  return (
    <div ref={ref} style={{ background: "rgba(100,116,139,0.35)", color: "rgba(226,232,240,0.95)", borderRadius: radius }} className="px-4 py-3 text-[14px] leading-relaxed">
      {text}
    </div>
  );
}

// User's "Proceed to create narrative" bubble. The AI now picks
// interactive visuals on its own and surfaces a summary message once the
// draft lands — so the older thought-process loader has been removed.
function ProceedMessage() {
  return (
    <div className="self-end flex items-center gap-3 max-w-[85%] narrative-content-enter">
      <CvUserBubble text="Proceed to create narrative" />
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        NT
      </div>
    </div>
  );
}

// AI message that lands once the narrative draft is ready. Lists every
// interactive element + section the AI baked into the panel as a collapsed
// checklist the user can expand to scan.
const NARRATIVE_READY_ITEMS = [
  { label: "Interactive map", section: "Country Examples" },
  { label: "Time-series chart", section: "The Challenge" },
  { label: "Country examples", section: "Country Examples" },
  { label: "Pathways to Outcomes", section: "Pathways to Outcomes" },
  { label: "Lessons Learned", section: "Lessons Learned" },
];

function NarrativeReadyMessage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 pt-1 flex flex-col gap-2">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          Your draft is ready in the panel on the right. I&apos;ve baked in an{" "}
          <span className="font-semibold text-gray-900">interactive map</span>{" "}
          (in Country Examples) and a{" "}
          <span className="font-semibold text-gray-900">time-series chart</span>{" "}
          (in The Challenge), alongside the supporting sections.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            aria-expanded={open}
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <IconCheck size={11} stroke={3} className="text-emerald-600" />
              </span>
              <span className="text-[12.5px] font-semibold text-gray-800">
                What I added
              </span>
              <span className="text-[10.5px] font-mono text-gray-400">
                {NARRATIVE_READY_ITEMS.length} elements
              </span>
            </span>
            <IconChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <ul className="border-t border-gray-100 px-3 py-2 flex flex-col gap-1.5">
              {NARRATIVE_READY_ITEMS.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-[12px] text-gray-700"
                >
                  <span className="flex items-center gap-1.5">
                    <IconCheck size={10} stroke={3} className="text-emerald-500 shrink-0" />
                    {item.label}
                  </span>
                  <span className="text-[10.5px] text-gray-400">
                    in <span className="text-gray-600">{item.section}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-[12.5px] text-gray-500 leading-relaxed">
          Want to tweak anything? Just say the word — or add more visuals from the suggestions below.
        </p>
      </div>
    </div>
  );
}

// Sections the user can assign a visual to — matches accordion titles in NarrativePanel.
const NARRATIVE_SECTIONS = [
  "Summary",
  "The Challenge",
  "Pathways to Outcomes",
  "Country Examples",
  "Lessons Learned",
];

export type AddedVisual = { id: string; type: string; section: string };

// Thumbnail components for each visual suggestion.
function HeroImageThumb({ active }: { active: boolean }) {
  const sky = active ? "#7c3aed" : "#60a5fa";
  const land = active ? "#a78bfa" : "#34d399";
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      <rect x={0} y={0} width={120} height={38} rx={0} fill={sky} opacity={0.5} />
      <rect x={0} y={38} width={120} height={26} rx={0} fill={land} opacity={0.45} />
      {/* sun / moon */}
      <circle cx={90} cy={16} r={7} fill={active ? "#c4b5fd" : "#fde68a"} opacity={0.9} />
      {/* horizon hills */}
      <ellipse cx={30} cy={42} rx={28} ry={10} fill={active ? "#7c3aed" : "#059669"} opacity={0.45} />
      <ellipse cx={88} cy={44} rx={22} ry={8} fill={active ? "#5b21b6" : "#065f46"} opacity={0.4} />
    </svg>
  );
}

function ChartThumb({ active }: { active: boolean }) {
  const rows = [
    { width: 78, color: active ? "#a78bfa" : "#2E8B57" },
    { width: 64, color: active ? "#7c3aed" : "#E88B2B" },
    { width: 48, color: active ? "#a78bfa" : "#E88B2B" },
    { width: 32, color: active ? "#7c3aed" : "#D04040" },
  ];
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      {rows.map((r, i) => {
        const y = 12 + i * 12;
        return (
          <g key={i}>
            <rect x={10} y={y} width={100} height={4} rx={2} fill="#e2e8f0" />
            <rect x={10} y={y} width={r.width} height={4} rx={2} fill={r.color} />
          </g>
        );
      })}
    </svg>
  );
}

function QuoteThumb({ active }: { active: boolean }) {
  const c = active ? "#7c3aed" : "#94a3b8";
  const fill = active ? "rgba(124,58,237,0.08)" : "rgba(148,163,184,0.12)";
  return (
    <svg viewBox="0 0 120 64" className="w-full h-full" preserveAspectRatio="none">
      <rect x={8} y={10} width={104} height={44} rx={4} fill={fill} />
      {/* quote mark */}
      <text x={18} y={36} fontSize="22" fill={c} opacity={0.45} fontFamily="Georgia, serif">&ldquo;</text>
      {/* text lines */}
      <rect x={34} y={20} width={66} height={2.5} rx={1.25} fill={c} opacity={0.3} />
      <rect x={34} y={27} width={58} height={2.5} rx={1.25} fill={c} opacity={0.3} />
      <rect x={34} y={34} width={50} height={2.5} rx={1.25} fill={c} opacity={0.3} />
      <rect x={34} y={41} width={30} height={2.5} rx={1.25} fill={c} opacity={0.2} />
    </svg>
  );
}

// Follow-up assistant message that lands once the draft narrative has
// mounted in the right pane. Instructional: points the user at the
// per-section "+ Add visual" button inside the panel rather than offering
// thumbnail cards in the chat. The in-panel interaction is now the single
// path for adding supporting visuals.
function VisualSupportMessage() {
  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          You can add supporting visualizations — hero images, additional charts, or callout quotes — directly to any section of the draft. Look for the{" "}
          <span className="inline-flex items-center gap-1 align-baseline px-1.5 py-0.5 rounded border border-dashed border-gray-300 bg-white text-gray-600 text-[12px] font-medium">
            <IconPlus size={11} />
            Add visual
          </span>{" "}
          button at the bottom of each section in the panel on the right.
        </p>
        <p className="text-[12.5px] text-gray-500 leading-relaxed">
          You can also highlight any passage of the draft and use{" "}
          <span className="font-medium text-gray-700">Modify content</span>{" "}
          to rewrite it without leaving the panel.
        </p>
      </div>
    </div>
  );
}

// Hover-to-edit conversation title — pencil glyph appears on hover; click to
// switch to a centered text input that commits on Enter or blur, cancels on
// Escape. Used in the conversation header so users can override the
// AI-derived working title.
function EditableTitle({
  value,
  onChange,
}: {
  value: string;
  onChange?: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!onChange) {
    return (
      <h1 className="text-center text-[15px] font-semibold text-gray-900" style={{ fontFamily: F }}>
        {value}
      </h1>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const next = draft.trim();
          if (next && next !== value) onChange(next);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter")  { e.currentTarget.blur(); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className="text-center text-[15px] font-semibold text-gray-900 bg-white border border-blue-300 rounded-md px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[280px] max-w-[480px]"
        style={{ fontFamily: F }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to rename"
      className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-gray-900 hover:bg-gray-50 rounded-md px-2 py-0.5 transition-colors max-w-full"
      style={{ fontFamily: F }}
    >
      <span className="truncate">{value}</span>
      <IconPencil
        size={12}
        className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
}

function UsedSources({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-[12.5px] text-blue-600 font-medium">
        Used {sources.length} sources
        <IconChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-2 ml-4 list-disc text-[12px] text-gray-500 space-y-1">
          {sources.map((s) => <li key={s}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function ConversationView({
  prompt,
  dark = false,
  mapMode = false,
  onClose,
  panelOpen,
  panelWidth = 0,
  suppressTransition,
  artefacts = [],
  onSelectArtefact,
  title,
  onTitleChange,
  embedded,
  narrativePhase = "idle",
  onNarrativePlanningComplete,
  onWizardComplete,
  selectedSkeletonId = null,
  onSelectSkeleton,
  onPreviewSkeleton,
  onClosePreviewSkeleton,
  refiningSkeletonId = null,
  refinementTurns = [],
  onRefinedProceed,
  onRefinedMakeChanges,
  extraCountryApplied = false,
  narrativeDirect = false,
  followUpPrompts = [],
  onFollowUpClick,
  sourceCard,
  guidedNarrativeSlug = null,
  guidedNarrativeAngle = "results",
  guidedNarrativeCountries = [],
  guidedDiscoveryCompleted = false,
  guidedSkeletons: guidedSkeletonsProp = [],
  guidedSkeletonsLoading = false,
  guidedSkeletonsError = false,
  onGuidedDiscoveryComplete,
  converseSessionId,
  onConverseSkeleton,
  onConverseReady,
  wizardInputRef,
  initialOutcomeArea = null,
  initialCountrySubset = null,
  onWizardContextChipsChange,
  wizardContextActionRef,
  onWizardPrefillPrompt,
  onWizardGuidanceReply,
  onWizardGuidanceDimension,
  narrativeVariant = "results",
  preloadedAnswer = null,
  preloadedFollowUps = [],
  onConvertToNarrative,
}: Props) {
  const flow = useMemo(() => detectFlow(prompt), [prompt]);
  const content = FLOW_CONTENT[flow];
  const isNarrativeMenuPrompt = useMemo(() => {
    const narrativeMenu = ACTION_MENUS.find((m) => m.id === "narrative");
    return narrativeMenu?.prompts.some((p) => p.prompt === prompt) ?? false;
  }, [prompt]);
  const signals =
    flow === "health-gap"          ? HEALTH_RELATED_SIGNALS  :
    flow === "electricity-fcs"     ? ELECTRICITY_FCS_SIGNALS :
    flow === "fy24-fy25-delta"     ? YOY_DELTA_SIGNALS       :
    flow === "hnp-measurement"     ? HNP_METHOD_SIGNALS      :
    flow === "methods-taxonomy"    ? []                      :
    flow === "methods-compilation" ? []                      :
    flow === "norway-donor"        ? []                      :
                                     RELATED_SIGNALS;

  // Surface a prompt chip above the bar for narrative-menu prompts.
  // Donor-attribution prompts get "Donor narrative"; others get "Convert into a narrative".
  useEffect(() => {
    if (isNarrativeMenuPrompt && onWizardContextChipsChange) {
      const label = flow === "norway-donor" ? "Create a Narrative" : "Convert into a narrative";
      onWizardContextChipsChange([{ id: "convert-narrative", label }]);
      return () => onWizardContextChipsChange([]);
    }
  }, [isNarrativeMenuPrompt, flow, onWizardContextChipsChange]);

  // When in the guided narrative flow, generate 4 angle skeletons from the
  // matched WBGNarrative so the SkeletonChoice carousel shows real data.
  const guidedSkeletons: NarrativeSkeleton[] | undefined =
    guidedSkeletonsProp.length > 0 ? guidedSkeletonsProp : undefined;

  const [thoughtDone, setThoughtDone] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [mountStage, setMountStage] = useState(0);

  // Stage 0 (frame 0): blank — nothing pops in on the first paint
  // Stage 1 (~0ms): user message slides in
  // Stage 2 (350ms): ThoughtProcess mounts and starts its step sequence
  useEffect(() => {
    const t1 = setTimeout(() => setMountStage(1), 0);
    const t2 = setTimeout(() => setMountStage(2), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const narrativeArtefact = artefacts.find((a) => a.kind === "narrative");
  // Show blocks permanently once the artefact is saved (persistent chat history).
  const showBlock1 = narrativePhase !== "idle" || !!narrativeArtefact;
  const showBlock2 =
    narrativePhase === "skeleton-ready" ||
    narrativePhase === "refining" ||
    narrativePhase === "refined-ready" ||
    narrativePhase === "generating" ||
    !!narrativeArtefact;
  // Make-changes suggestions: shown once the user enters refining mode and
  // persisted through every later phase (incl. post-narrative). refiningSkeletonId
  // is cleared at conversation boundaries, so this naturally stays scoped
  // to the refining-driven flow.
  const showMakeChangesSuggestions =
    refiningSkeletonId != null &&
    (narrativePhase === "refining" ||
      narrativePhase === "refined-ready" ||
      narrativePhase === "generating" ||
      !!narrativeArtefact);
  const showRefinementBlock =
    refiningSkeletonId != null &&
    (refinementTurns.length > 0 ||
      narrativePhase === "refined-ready" ||
      narrativePhase === "generating" ||
      !!narrativeArtefact);
  // "Proceed to create narrative" user bubble. Renders the moment proceed
  // is clicked (phase flips to generating) and stays in the chat.
  const showProceedBubble =
    narrativePhase === "generating" || !!narrativeArtefact;
  const showBlock3 = narrativePhase === "generating" || !!narrativeArtefact;
  // AI summary message — lands once the narrative artefact has been saved
  // and generation has finished (phase reset to "idle" by the kickoff timer).
  const showNarrativeReady = !!narrativeArtefact && narrativePhase !== "generating";

  // Files dropdown state
  const [filesOpen, setFilesOpen] = useState(false);
  const filesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filesOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (filesRef.current && !filesRef.current.contains(e.target as Node)) {
        setFilesOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filesOpen]);

  return (
    <div
      className={`flex flex-col ${embedded ? "h-full" : "h-screen"} ${dark ? "cv-dark" : "bg-white"} ${mapMode ? "cv-map-mode" : ""} ${suppressTransition ? "" : "transition-[padding] duration-500 ease-in-out"}`}
      style={{ paddingRight: panelOpen ? panelWidth : 0, ...(dark && mapMode ? { background: "transparent" } : {}) }}
    >
      {/* 3-column grid keeps the title at the geometric viewport center
          regardless of left logo width or right action group width.
          Hidden in embedded mode — the parent provides its own header. */}
      {!embedded && <header
        className={`grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 border-b border-gray-100 ${dark ? "fixed left-0 top-0 z-50" : "shrink-0"}`}
        style={dark ? {
          background: mapMode ? "rgba(8,18,30,0.72)" : "#112531",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(mapMode ? {"backdropFilter": "blur(16px)", "WebkitBackdropFilter": "blur(16px)"} as any : {}),
          right: panelOpen ? panelWidth : 0,
          transition: suppressTransition ? undefined : "right 500ms ease-in-out",
        } : undefined}
      >
        <button
          onClick={onClose}
          aria-label="Back to home"
          title="Back to home"
          className="justify-self-start shrink-0 rounded-full hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <img
            src="/globe.svg"
            alt="World Bank Group"
            width={36}
            height={36}
            style={{ filter: dark ? "brightness(0) invert(1)" : "none", display: "block" }}
          />
        </button>
        <div className="justify-self-center min-w-0 max-w-full flex items-center justify-center">
          <EditableTitle value={title ?? (sourceCard ? sourceCard.title : content.title)} onChange={onTitleChange} />
        </div>
        <div className="justify-self-end flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-50">
            <IconShare size={14} />
            Share
          </button>

          {/* Files: list of created artefacts */}
          <div ref={filesRef} className="relative group">
            {!filesOpen && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 rounded text-[11px] font-medium text-white bg-gray-900 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Artefacts
              </span>
            )}
            <button
              onClick={() => setFilesOpen((v) => !v)}
              aria-label={`Artefacts (${artefacts.length})`}
              className={`relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${
                filesOpen ? "text-gray-900 bg-gray-100" : "text-gray-500"
              }`}
            >
              <IconFiles size={16} />
              {artefacts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-semibold flex items-center justify-center">
                  {artefacts.length}
                </span>
              )}
            </button>

            {filesOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Artefacts</div>
                </div>
                {artefacts.length === 0 ? (
                  <div className="px-3 py-6 text-[12px] text-gray-400 text-center">
                    No artefacts yet.<br />
                    Artefacts you create in your conversations will appear here.
                  </div>
                ) : (
                  <ul className="max-h-[320px] overflow-y-auto">
                    {[...artefacts].reverse().map((a) => {
                      const isInsight = a.kind === "infographic";
                      const Icon = isInsight ? IconChartBar : IconNotebook;
                      return (
                        <li key={a.id}>
                          <button
                            onClick={() => { onSelectArtefact?.(a); setFilesOpen(false); }}
                            className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                              isInsight ? "bg-emerald-50" : "bg-blue-50"
                            }`}>
                              <Icon size={13} className={isInsight ? "text-emerald-600" : "text-blue-600"} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] font-medium text-gray-900 truncate">{a.title}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded ${
                                  isInsight ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                                }`}>
                                  {isInsight ? "Insight" : "Narrative"}
                                </span>
                                <span className="text-[10.5px] text-gray-400">
                                  {new Date(a.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                </span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <IconX size={16} />
          </button>
        </div>
      </header>}

      {/* Scrollable conversation area — bottom padding leaves room for the
          shared PromptBar that sits fixed at the page bottom. */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden" style={!embedded && dark ? { paddingTop: 69 } : undefined}>
        <div className="max-w-[1020px] mx-auto px-6 py-8 pb-32 flex flex-col gap-6">
          {sourceCard ? (
            <div className="flex flex-col gap-8 narrative-content-enter">
              {/* Card section */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-200">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Latest Indicator Movements
                  </p>
                  <h2 className="text-[18px] font-semibold text-gray-900">{sourceCard.title}</h2>
                  <p className="text-[12.5px] text-gray-500 mt-0.5">{sourceCard.subtitle}</p>
                </div>
                {/* Column headers */}
                <div className="flex items-center px-5 py-2 border-b border-gray-100">
                  <span className="flex-1 text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">Results</span>
                  <span className="w-[90px] text-right text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">Achieved</span>
                  <span className="w-[90px] text-right text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">Expected</span>
                </div>
                {/* Rows */}
                {sourceCard.rows.map((row) => (
                  <div key={row.label} className="flex items-center px-5 py-3.5 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span aria-hidden="true" style={{ display: "block", width: 22, height: 22, flexShrink: 0, opacity: 0.7, backgroundImage: `url(${row.iconSrc})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
                      <span className="text-[13px] text-gray-800 leading-snug truncate">{row.label}</span>
                    </div>
                    <span className="w-[90px] text-right text-[13px] font-semibold text-gray-900">{row.achieved ?? row.delta}</span>
                    <span className="w-[90px] text-right text-[13px] text-gray-500">{row.expected ?? "—"}</span>
                  </div>
                ))}
              </div>

              {/* Composed insight paragraph */}
              {sourceCard.insight && (
                <p className="text-[13.5px] text-gray-600 leading-relaxed m-0">{sourceCard.insight}</p>
              )}

              {/* Copy / feedback row */}
              <div className="flex items-center gap-3 text-gray-400">
                <button className="hover:text-gray-700 transition-colors" aria-label="Copy"><IconCopySm size={16} /></button>
                <span className="w-px h-4 bg-gray-200" />
                <button className="hover:text-gray-700 transition-colors" aria-label="Thumbs up"><IconThumbUp size={16} /></button>
                <button className="hover:text-gray-700 transition-colors" aria-label="Thumbs down"><IconThumbDown size={16} /></button>
              </div>

              {/* Follow-up prompts */}
              {followUpPrompts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <IconSparkles size={13} className="text-violet-400 shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Follow Up</span>
                  </div>
                  <div className="flex flex-col border-t border-gray-200">
                    {followUpPrompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onFollowUpClick?.(p)}
                        className="flex items-center justify-between py-3.5 border-b border-gray-200 text-[13.5px] text-gray-700 hover:text-gray-900 group transition-colors text-left"
                      >
                        <span>{p}</span>
                        <IconPlus size={15} className="text-gray-400 group-hover:text-gray-600 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* User message — stage 1: slides in after first paint */}
              {mountStage >= 1 && !(showBlock1 && !narrativeDirect && narrativeVariant !== "donor-priorities") && (
                <div className="self-end flex items-center gap-3 max-w-[85%] narrative-content-enter">
                  <CvUserBubble text={prompt} />
                  <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                    NT
                  </div>
                </div>
              )}

              {/* Preloaded insight answer — trending-insight card click. Shows
                  the precomputed synthesized answer as the first AI turn, then
                  the user can follow up via the normal input. Skips the mock
                  thought-process + body entirely. */}
              {!narrativeDirect && narrativePhase === "idle" && preloadedAnswer && mountStage >= 1 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                    SC
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <div className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                      <StreamingText text={preloadedAnswer} wordDelay={18} />
                    </div>
                    {/* Copy / feedback row */}
                    <div className="flex items-center gap-3 text-gray-400">
                      <button className="hover:text-gray-700 transition-colors" aria-label="Copy"><IconCopySm size={16} /></button>
                      <span className="w-px h-4 bg-gray-200" />
                      <button className="hover:text-gray-700 transition-colors" aria-label="Thumbs up"><IconThumbUp size={16} /></button>
                      <button className="hover:text-gray-700 transition-colors" aria-label="Thumbs down"><IconThumbDown size={16} /></button>
                    </div>
                    {preloadedFollowUps.length > 0 && (
                      <div className="mt-1">
                        <div className="flex items-center gap-2 mb-3">
                          <IconSparkles size={13} className="text-violet-400 shrink-0" aria-hidden="true" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Follow Up</span>
                        </div>
                        <div className="flex flex-col border-t border-gray-200">
                          {preloadedFollowUps.map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => onFollowUpClick?.(q)}
                              className="flex items-center justify-between py-3.5 border-b border-gray-200 text-[13.5px] text-gray-700 hover:text-gray-900 group transition-colors text-left"
                            >
                              <span>{q}</span>
                              <IconPlus size={15} className="text-gray-400 group-hover:text-gray-600 shrink-0 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Thought process — stage 2: mounts 350ms after user message, then steps animate sequentially.
                  Suppressed entirely in narrative-direct mode (landing-page "Create a narrative" entry). */}
              {!narrativeDirect && !(showBlock1 && narrativeVariant !== "donor-priorities") && !preloadedAnswer && mountStage >= 2 && (
                <ThoughtProcess flow={flow} onComplete={() => setThoughtDone(true)} />
              )}

              {/* Assistant response — appears after thought process collapses */}
              {!narrativeDirect && !(showBlock1 && narrativeVariant !== "donor-priorities") && !preloadedAnswer && thoughtDone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                    SC
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <p className="text-[14.5px] font-semibold text-gray-900 leading-relaxed">
                      <StreamingText
                        text={content.leadAnswer}
                        wordDelay={30}
                        onComplete={() => setLeadDone(true)}
                      />
                    </p>

                    {/* Rest of response fades in after lead answer finishes streaming */}
                    <div
                      className="flex flex-col gap-4 transition-opacity duration-700"
                      style={{ opacity: leadDone ? 1 : 0 }}
                    >
                      {/* Comparative Analytics Engine response — replaces
                          chart + body for fy24-fy25-delta; other flows keep
                          the standard body → chart → sources layout. */}
                      {flow === "fy24-fy25-delta" ? (
                        <ComparativeAnalyticsResponse disabled={showBlock1} leadDone={leadDone} />
                      ) : (
                        <>
                          <p className="text-[13.5px] text-gray-700 leading-relaxed">
                            {content.bodyText}
                          </p>
                          <p className="text-[12.5px] text-gray-500">
                            {content.filterCaption}
                          </p>

                          {flow === "health-gap" ? (
                            <HealthGapChart
                              title={content.chartTitle}
                              caption="Health Services results · project-level data · FY2025"
                              disabled={showBlock1}
                            />
                          ) : flow === "hnp-measurement" ? (
                            <IndicatorMethodologyCard title={content.chartTitle} disabled={showBlock1} />
                          ) : flow === "methods-taxonomy" ? (
                            <MethodsAdvisorCard flow="methods-taxonomy" disabled={showBlock1} />
                          ) : flow === "methods-compilation" ? (
                            <MethodsAdvisorCard flow="methods-compilation" disabled={showBlock1} />
                          ) : flow === "norway-donor" ? (
                            <DonorAttributionStats disabled={showBlock1} />
                          ) : (
                            <PovertyChart title={content.chartTitle} disabled={showBlock1} />
                          )}

                          {/* Sources */}
                          <UsedSources sources={content.sources} />
                        </>
                      )}

                      {/* Copy / feedback row */}
                      <div className="flex items-center gap-3 mt-2 text-gray-400">
                        <button className="hover:text-gray-700 transition-colors" aria-label="Copy"><IconCopySm size={16} /></button>
                        <span className="w-px h-4 bg-gray-200" />
                        <button className="hover:text-gray-700 transition-colors" aria-label="Thumbs up"><IconThumbUp size={16} /></button>
                        <button className="hover:text-gray-700 transition-colors" aria-label="Thumbs down"><IconThumbDown size={16} /></button>
                      </div>

                      {/* Continue exploring */}
                      <div className="mt-1">
                        <div className="flex items-center gap-2 mb-3">
                          <IconSparkles size={13} className="text-violet-400 shrink-0" aria-hidden="true" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Follow Up</span>
                        </div>
                        <div className="flex flex-col border-t border-gray-200">
                          {content.continueExploring.map((q) => (
                            <button
                              key={q}
                              type="button"
                              className="flex items-center justify-between py-3.5 border-b border-gray-200 text-[13.5px] text-gray-700 hover:text-gray-900 group transition-colors text-left"
                            >
                              <span>{q}</span>
                              <IconPlus size={15} className="text-gray-400 group-hover:text-gray-600 shrink-0 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {flow === "norway-donor" && !showBlock1 && (
                        <p className="text-[13.5px] text-gray-500 leading-relaxed mt-1">
                          I can create a structured donor narrative for you — showing how Norway's contribution maps to real outcomes across health, education, and social protection.
                        </p>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* ── Free conversational discovery ──
                  Replaces the legacy GuidedDiscovery's hardcoded question
                  sequence. The LLM drives the conversation and emits a
                  <skeleton> JSON block once it has enough context — the
                  parent opens SkeletonPreviewPanel via onConverseSkeleton. */}
              {narrativeDirect && narrativePhase === "converse" && (
                <NarrativeConverse
                  sessionId={converseSessionId ?? null}
                  initialUserMessage={prompt}
                  onSkeleton={(s) => onConverseSkeleton?.(s)}
                  onReady={(api) => onConverseReady?.(api)}
                />
              )}
              {/* Legacy hardcoded-question flow — left in place for back-compat
                  in case any code path still sets narrativePhase to
                  "guided-discovery". The create-narrative entry point now
                  routes to the converse flow above. */}
              {narrativeDirect && (narrativePhase === "guided-discovery" || guidedDiscoveryCompleted) && (
                <GuidedDiscovery
                  initialPrompt={prompt}
                  onComplete={(slug, angle, countries, params) => onGuidedDiscoveryComplete?.(slug, angle, countries, params)}
                  dark={dark}
                />
              )}

              {/* ── Narrative Builder flow (Steps 3–7) ── */}
              {showBlock1 && !narrativeDirect && (
                <div className="self-end flex items-center gap-3 max-w-[85%] narrative-content-enter">
                  <CvUserBubble text={narrativeVariant === "donor-priorities" ? "Create a Narrative" : "Build a Results Narrative"} />
                  <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                    NT
                  </div>
                </div>
              )}
              {showBlock1 && !narrativeDirect && narrativeVariant !== "donor-priorities" && (
                <NarrativeBuilderWizard
                  inputRef={wizardInputRef}
                  initialOutcomeArea={initialOutcomeArea}
                  initialCountrySubset={initialCountrySubset}
                  onContextChipsChange={onWizardContextChipsChange}
                  contextActionRef={wizardContextActionRef}
                  onPrefillPrompt={onWizardPrefillPrompt}
                  onSetGuidanceReply={onWizardGuidanceReply}
                  onGuidanceDimension={onWizardGuidanceDimension}
                  onComplete={(result: NarrativeBuilderResult) => {
                    onWizardComplete?.(result);
                  }}
                />
              )}
              {showBlock1 && !narrativeDirect && narrativeVariant === "donor-priorities" && (
                <DonorNarrativeWizard
                  inputRef={wizardInputRef}
                  onContextChipsChange={onWizardContextChipsChange}
                  contextActionRef={wizardContextActionRef}
                  onSetGuidanceReply={onWizardGuidanceReply}
                  onGuidanceDimension={onWizardGuidanceDimension}
                  onComplete={(result: NarrativeBuilderResult) => {
                    onWizardComplete?.(result);
                  }}
                />
              )}
              {/* Legacy path for narrativeDirect (guided-discovery/converse flow) */}
              {showBlock1 && narrativeDirect && narrativePhase !== "guided-discovery" && (
                <NarrativePlanningMessage
                  animate={narrativePhase === "planning"}
                  onComplete={onNarrativePlanningComplete}
                />
              )}
              {showBlock2 && (
                <NarrativeSkeletonChoice
                  flow={flow}
                  selectedSkeletonId={selectedSkeletonId}
                  onSelect={(id) => onSelectSkeleton?.(id)}
                  onPreview={(id) => onPreviewSkeleton?.(id)}
                  onPreviewClose={() => onClosePreviewSkeleton?.()}
                  animate={narrativePhase === "skeleton-ready"}
                  dark={dark}
                  guidedNarrative={undefined}
                  skeletons={guidedSkeletons ?? []}
                  loading={guidedSkeletonsLoading}
                  error={guidedSkeletonsError}
                />
              )}
              {showMakeChangesSuggestions && <MakeChangesSuggestionsMessage />}
              {showRefinementBlock && refiningSkeletonId && (
                <SkeletonRefinedMessage
                  flow={flow}
                  skeletonId={refiningSkeletonId}
                  turns={refinementTurns}
                  active={narrativePhase === "refined-ready"}
                  extraCountryApplied={extraCountryApplied}
                  onProceed={() => onRefinedProceed?.()}
                  onMakeChanges={() => onRefinedMakeChanges?.()}
                  guidedSkeletons={guidedSkeletons ?? guidedSkeletonsProp}
                />
              )}
              {showProceedBubble && <ProceedMessage />}
              {showBlock3 && <NarrativeGeneratingMessage generating={narrativePhase === "generating"} />}
              {showNarrativeReady && <NarrativeReadyMessage />}

              {/* Visual-support guidance — appears once the artefact has been
                  created (the panel is rendering the draft). Suggests image /
                  chart / quote additions and surfaces the highlight-to-modify
                  gesture in the right pane. */}
              {narrativeArtefact && narrativePhase !== "generating" && <VisualSupportMessage />}

              {/* Follow-up prompts — sourced from the card that opened this conversation */}
              {!narrativeDirect && narrativePhase === "idle" && followUpPrompts.length > 0 && mountStage >= 2 && (
                <div className="narrative-content-enter" style={{ animationDelay: "500ms" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <IconSparkles size={13} className="text-violet-400 shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Follow Up</span>
                  </div>
                  <div className="flex flex-col border-t border-gray-200">
                    {followUpPrompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onFollowUpClick?.(p)}
                        className="flex items-center justify-between py-3.5 text-left border-b border-gray-200 text-[13.5px] text-gray-700 hover:text-gray-900 group transition-colors"
                      >
                        <span>{p}</span>
                        <IconPlus size={15} className="text-gray-400 group-hover:text-gray-600 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="h-8" />
        </div>
      </div>

    </div>
  );
}
