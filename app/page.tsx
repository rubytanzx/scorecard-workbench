
import { useEffect, useRef, useState } from "react";
import {
  IconSparkles, IconX, IconArrowUp, IconPlus,
  IconPaperclip, IconPhoto, IconPlugConnected,
  IconChevronRight, IconChevronLeft, IconSettings, IconTool,
  IconAlertTriangle, IconFiles, IconShare,
} from "@tabler/icons-react";
import { MCP_CONNECTORS } from "@/data/mockInteraction";
import AppHeader from "@/components/AppHeader";
import SearchHero from "@/components/SearchHero";
import QuickStartPills from "@/components/QuickStartPills";
import AppFooter from "@/components/AppFooter";
import StoryDetailModal from "@/components/StoryDetailModal";
import ConversationView, { type AddedVisual } from "@/components/conversation/ConversationView";
import NarrativePanel, { NARRATIVE_PANEL_DEFAULT_WIDTH } from "@/components/conversation/NarrativePanel";
import InfographicPanel from "@/components/conversation/InfographicPanel";
import SkeletonPreviewPanel from "@/components/conversation/SkeletonPreviewPanel";
import { detectFlow } from "@/components/conversation/ConversationView";
import { type NarrativeSkeleton } from "@/components/conversation/NarrativeSkeletons";
import { fetchMatchedSkeletons } from "@/lib/narrativeApi";
import type { NarrativeBuilderResult, NarrativeMeta } from "@/components/conversation/NarrativeBuilderWizard";
import type { ChallengeSet } from "@/lib/challengeData";
import { useNarrativeSession } from "@/hooks/useNarrativeSession";
import type { ConverseSkeleton } from "@/lib/converse";
import ViewerView from "@/components/conversation/ViewerView";
import WorkspaceView from "@/components/conversation/WorkspaceView";
import PromptBar from "@/components/PromptBar";
import IndicatorTicker from "@/components/IndicatorTicker";
import SynthesizedInsights from "@/components/SynthesizedInsights";
import type { InsightCard } from "@/lib/insightSynth";
import MomentumGroups from "@/components/MomentumGroups";
import AnalyticsCards from "@/components/AnalyticsCards";
import FeaturedNarratives from "@/components/FeaturedNarratives";
import CounterIntuitiveFindings from "@/components/CounterIntuitiveTextCard";
import OutcomeAreaGrid from "@/components/SystemPatternTile";

import { indicators, secondaryStories, hnpGeoHint, type GeoCountryDetail } from "@/lib/mockData";
import LoadingScreen from "@/components/LoadingScreen";
import D3Globe from "@/components/D3Globe";
import FlatMapOverlay from "@/components/FlatMapOverlay";
import { usePageReady } from "@/hooks/usePageReady";

// First ~6 words of the prompt as a working title.
function deriveArtefactTitle(prompt: string): string {
  if (!prompt.trim()) return "";
  const words = prompt.trim().replace(/[?!.]+$/g, "").split(/\s+/).slice(0, 7);
  let t = words.join(" ");
  if (t.length > 56) t = t.slice(0, 56) + "…";
  return t;
}

// ─── Chat menu helpers ────────────────────────────────────────────────────────

const F = "'Open Sans', sans-serif";
const CONV_NAV_H = 56; // conversation-page nav height in px

const CONNECTOR_META: Record<string, { color: string; initial: string }> = {
  "wbg-scorecard": { color: "#003366", initial: "WB"  },
  "ifc":           { color: "#F5A623", initial: "IFC" },
  "miga":          { color: "#1565C0", initial: "M"   },
  "wb-operations": { color: "#0288D1", initial: "OP"  },
  "wdi":           { color: "#2E7D32", initial: "WD"  },
  "cpf":           { color: "#6A1B9A", initial: "CP"  },
  "open-data":     { color: "#C62828", initial: "OD"  },
};

const menuShell: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

const menuRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "9px 14px", cursor: "pointer",
  transition: "background 0.1s", userSelect: "none",
};

function ChatToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? "#0b6fd3" : "#D1D5DB",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background 0.18s",
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.18s",
      }} />
    </div>
  );
}

function ChatConnectorIcon({ id }: { id: string }) {
  const meta = CONNECTOR_META[id] ?? { color: "#616161", initial: "?" };
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 7, background: meta.color,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontFamily: F, fontSize: 8, fontWeight: 700, color: "#FFFFFF", letterSpacing: 0.2 }}>
        {meta.initial}
      </span>
    </div>
  );
}

// ─── Fade-in on scroll ────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AI_SUGGESTIONS = [
  "Which outcome areas have the biggest gaps vs. LAC peers?",
  "What's driving Mexico's learning poverty rate?",
  "Show me WB projects contributing to health outcomes",
];

// State machine for the narrative creation flow:
//   idle              — nothing happening yet
//   planning          — AI thinking; planning steps animate in
//   skeleton-ready    — 4 angle cards shown; user picks one
//   refining          — user clicked "Make changes" in preview; prompt-bar
//                       shows a reference chip and accepts feedback
//   refined-ready     — refined-skeleton widget shown inline; user can
//                       Proceed or iterate ("Make changes" again)
//   generating        — opening the final NarrativePanel. The AI picks
//                       interactive visuals on its own and surfaces them
//                       via a summary message once the draft is ready.
export type NarrativePhase =
  | "idle"
  | "guided-discovery"   // legacy hardcoded-question flow — kept for back-compat
  | "converse"           // free-form chat with LLM → emits skeleton
  | "planning"
  | "skeleton-ready"
  | "refining"
  | "refined-ready"
  | "generating"
  | "narrative-output";

export type InteractiveElement = "map" | "charts" | "tables" | "timeline";

export default function HomePage() {
  const { isReady, progress } = usePageReady();
  const [modalStory, setModalStory] = useState<(typeof secondaryStories)[0] | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  // Conversation flow: "home" → user submits → 3s beam → "conversation".
  // The shared PromptBar stays mounted; only its `mode` prop changes, so
  // it animates from hero-center to bottom-fixed.
  const [view, setView] = useState<"home" | "conversation" | "workspace" | "viewer">("home");

  // Centralised go-home: resets view + syncs the browser URL to "/".
  const goHome = () => {
    setView("home");
    setConversationPrompt("");
    setRightPane(null);
    setGlobeTooltip(null);
    setFlatMapOpen(false);
    setMapCollapsed(false);
    setConversationGeoHint(null);
    if (typeof window !== "undefined") {
      window.history.pushState({ view: "home" }, "", "/");
    }
  };
  const [conversationPrompt, setConversationPrompt] = useState("");
  const [conversationFollowUps, setConversationFollowUps] = useState<string[]>([]);
  const [conversationSourceCard, setConversationSourceCard] = useState<import("@/lib/mockData").MomentumGroup | null>(null);
  const [conversationGeoHint, setConversationGeoHint] = useState<{
    regions: string[];
    geoData: Record<string, string>;
    geoDetailData: Record<string, GeoCountryDetail>;
    title: string;
    color: string;
  } | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [guidanceReplyLabel, setGuidanceReplyLabel] = useState<string | null>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  // Single discriminator for which right-side artefact pane is open.
  // null = closed; only one pane can be visible at a time.
  type RightPane = "narrative" | "infographic" | "skeleton-preview" | null;
  const [rightPane, setRightPane] = useState<RightPane>(null);
  const [rightPaneWidth, setRightPaneWidth] = useState(NARRATIVE_PANEL_DEFAULT_WIDTH);
  const [rightPaneDragging, setRightPaneDragging] = useState(false);
  const [narrativePhase, setNarrativePhase] = useState<NarrativePhase>("idle");
  const [selectedSkeletonId, setSelectedSkeletonId] = useState<string | null>(null);
  // Which skeleton is being previewed in the right pane (null when no preview open).
  const [previewSkeletonId, setPreviewSkeletonId] = useState<string | null>(null);
  // For the wizard path: the selected challenge to display in the preview panel.
  const [wizardChallenge, setWizardChallenge] = useState<ChallengeSet | null>(null);
  // Which skeleton the user is currently refining via "Make changes". Drives
  // both the reference chip in the prompt bar and the refined-widget content.
  const [refiningSkeletonId, setRefiningSkeletonId] = useState<string | null>(null);
  // History of refinement turns — each entry is the text the user submitted.
  // Renders as user-bubble + AI-response + refined-skeleton widget per turn.
  const [refinementTurns, setRefinementTurns] = useState<string[]>([]);
  // Interactive-elements multi-select. Persists after Proceed so generated
  // narratives could (later) branch on it.
  const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([]);
  // True when the user clicked "Create a narrative" on the landing page —
  // adds a tag to the prompt bar and routes submits straight into the
  // narrative-creation flow (skipping the AI Q&A response in conversation).
  const [createNarrativeMode, setCreateNarrativeMode] = useState(false);
  // Conversation ids that bypass the AI Q&A response and start directly in
  // the planning phase (landing-page "Create a narrative" entry point).
  const [narrativeDirectConversations, setNarrativeDirectConversations] = useState<Set<string>>(
    new Set(),
  );
  const [narrativePanelLoading, setNarrativePanelLoading] = useState(false);
  const [narrativeVariant, setNarrativeVariant] = useState<"results" | "donor-priorities">("results");
  const [narrativeMeta, setNarrativeMeta] = useState<NarrativeMeta | null>(null);
  const [narrativeTitle, setNarrativeTitle] = useState<string>("");
  const [addedVisuals, setAddedVisuals] = useState<AddedVisual[]>([]);
  // Guided narrative discovery state
  const [guidedNarrativeSlug, setGuidedNarrativeSlug] = useState<string | null>(null);
  const [guidedNarrativeAngle, setGuidedNarrativeAngle] = useState<string>("results");
  const [guidedNarrativeCountries, setGuidedNarrativeCountries] = useState<string[]>([]);
  // True once guided discovery has been completed for the current conversation.
  // Keeps the GuidedDiscovery component mounted (and its messages visible) even
  // after the phase advances beyond "guided-discovery".
  const [guidedDiscoveryCompleted, setGuidedDiscoveryCompleted] = useState(false);
  // Cache of the 4 generated skeletons for the currently-selected guided narrative.
  // Computed whenever the slug changes so ConversationView and NarrativePanel
  // share the same skeleton instances (enabling lookup by id).
  const [guidedSkeletons, setGuidedSkeletons] = useState<NarrativeSkeleton[]>([]);
  const [guidedSkeletonsLoading, setGuidedSkeletonsLoading] = useState(false);
  const [guidedSkeletonsError, setGuidedSkeletonsError] = useState(false);
  // Content-modify flow: tracks the currently selected passage + fires a
  // signal to NarrativePanel when the user submits an edit instruction.
  const [contentModifyTarget, setContentModifyTarget] = useState<
    { text: string; sectionId: string | null } | null
  >(null);
  const [contentModifySignal, setContentModifySignal] = useState<
    { sectionId: string | null; instruction: string; nonce: number } | null
  >(null);
  // Fired when the user clicks "Add to Narrative" in the guidance widget —
  // carries the Authenticity Rubric dimension number so NarrativePanel can
  // shimmer the relevant section and bump its strength score.
  const [guidanceSignal, setGuidanceSignal] = useState<
    { dimensionNum: number; nonce: number } | null
  >(null);
  // Conversations that have applied the "add one more country example"
  // refinement step. Drives the extra story rendered inside the narrative
  // panel's Country Examples section, plus the user/AI turn in the
  // conversation thread.
  const [extraCountryByConvId, setExtraCountryByConvId] = useState<Set<string>>(
    new Set(),
  );
  // True for ~3.5s after the user picks "Generate · Infographic" —
  // drives the beam + cycling text loader inside the infographic pane.
  const [infographicGenerating, setInfographicGenerating] = useState(false);
  // When a kind that already exists is picked from the Generate menu, we
  // open a confirm dialog instead of regenerating immediately. null = no
  // dialog open; otherwise the kind being asked about.
  const [regenerateConfirm, setRegenerateConfirm] = useState<string | null>(null);
  const [homeScrolled, setHomeScrolled] = useState(false);
  const homeScrollRef = useRef<HTMLDivElement>(null);
  // Stored handle for the post-confirm animation delay so future readers
  // know it's intentional and can cancel if navigation patterns change.
  const narrativeConfirmTimerRef = useRef<number | null>(null);
  const [globeW, setGlobeW] = useState(0);
  const [globeH, setGlobeH] = useState(0);
  const globeBlurRef = useRef<HTMLDivElement>(null);
  const [globeTooltip, setGlobeTooltip] = useState<{ name: string; note: string | null; x: number; y: number } | null>(null);
  const [flatMapOpen, setFlatMapOpen] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [dividerHovered, setDividerHovered] = useState(false);
  const [splitPercent, setSplitPercent] = useState(52);
  const splitDragRef = useRef<{ startX: number; startPct: number } | null>(null);
  const splitDidDrag = useRef(false);

  const GROUP_ACCENT: Record<string, string> = {
    "accelerating": "#34D399",
    "slowing":      "#FB923C",
    "emerging":     "#818CF8",
  };
  const cardAccent = conversationSourceCard ? (GROUP_ACCENT[conversationSourceCard.id] ?? "#34D399") : "#34D399";

  useEffect(() => {
    const measure = () => { setGlobeW(window.innerWidth); setGlobeH(window.innerHeight); };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!splitDragRef.current) return;
      const dx = Math.abs(e.clientX - (splitDragRef.current.startX));
      if (dx > 3) splitDidDrag.current = true;
      const pct = Math.round((e.clientX / window.innerWidth) * 100);
      setSplitPercent(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => { splitDragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Track home-page scroll so the prompt bar can dock at the bottom once the
  // user moves past the hero. Listen on both the inner overflow-y-auto
  // container and the window so it works regardless of the scroll target.
  useEffect(() => {
    if (view !== "home") {
      if (globeBlurRef.current) globeBlurRef.current.style.filter = "none";
      return;
    }
    const THRESHOLD = 80;
    const check = () => {
      const inner = homeScrollRef.current;
      const innerTop = inner?.scrollTop ?? 0;
      const winTop = typeof window !== "undefined"
        ? (window.scrollY || document.documentElement.scrollTop || 0)
        : 0;
      const raw = Math.max(innerTop, winTop);
      setHomeScrolled(raw > THRESHOLD);
      // Blur globe as user scrolls: 0px at top → 14px at 320px scroll
      if (globeBlurRef.current) {
        const blurPx = Math.min(raw / 320 * 14, 14).toFixed(1);
        globeBlurRef.current.style.filter = `blur(${blurPx}px)`;
      }
    };
    check();
    const inner = homeScrollRef.current;
    inner?.addEventListener("scroll", check, { passive: true });
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      inner?.removeEventListener("scroll", check);
      window.removeEventListener("scroll", check);
    };
  }, [view]);

  // Browser back/forward support: popstate fires when the user navigates
  // back to "/" so we reset the view to home without a full page reload.
  useEffect(() => {
    const handle = () => {
      if (window.location.pathname === "/" || window.location.pathname === "") {
        setView("home");
        setConversationPrompt("");
        setRightPane(null);
      }
    };
    window.addEventListener("popstate", handle);
    return () => window.removeEventListener("popstate", handle);
  }, []);

  // Conversations + artefacts — each conversation owns its own artefacts list.
  // `kind` discriminates which right-side pane to open when re-selected.
  interface Artefact {
    id: string;
    kind: "narrative" | "infographic";
    title: string;
    prompt: string;
    createdAt: number;
    /** Which narrative-angle skeleton the user picked (narrative artefacts only). */
    skeletonId?: string;
  }
  interface Conversation {
    id: string;
    title: string;
    prompt: string;
    createdAt: number;
    artefacts: Artefact[];
  }
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const currentArtefacts = currentConversation?.artefacts ?? [];
  const isNarrativeDirect = view === "conversation" && currentConversationId != null && narrativeDirectConversations.has(currentConversationId);
  const hideMap = isNarrativeDirect || mapCollapsed || narrativePhase !== "idle";

  const handleSearchComplete = (
    text: string,
    preload?: { answer: string; followUps: string[] } | null,
  ) => {
    const id = Date.now().toString();
    resetNarrativeStateForNewConversation();
    setConversationSourceCard(null);
    setConversationFollowUps([]);
    // Set geo hint based on detected flow
    const flow = detectFlow(text);
    setConversationGeoHint(flow === "hnp-measurement" ? hnpGeoHint : null);
    // Set after reset (reset clears it) so an insight click can preload a
    // synthesized answer into the conversation's first AI turn.
    setPreloadedInsight(preload ?? null);
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: deriveArtefactTitle(text) || "Untitled query",
        prompt: text,
        createdAt: Date.now(),
        artefacts: [],
      },
    ]);
    setCurrentConversationId(id);
    setConversationPrompt(text);
    setPromptValue("");        // empty the bar for follow-up questions
    setView("conversation");
    setHomeScrolled(false);    // reset for when we return home
    if (typeof window !== "undefined") {
      window.history.pushState({ view: "conversation", id }, "", `/conversation/${id}`);
    }
  };

  // Landing-page "Create a narrative" pill → arms the create-narrative tag
  // on the prompt bar so the next submit routes through the direct path.
  const handleArmCreateNarrative = () => {
    setCreateNarrativeMode(true);
  };

  // Landing-page "Build a Results Narrative" → skip the prompt bar entirely
  // and go straight into the wizard (planning phase) in conversation view.
  const handleDirectBuildNarrative = () => {
    const id = Date.now().toString();
    resetNarrativeStateForNewConversation();
    setConversationSourceCard(null);
    setConversationFollowUps([]);
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: "Results Narrative",
        prompt: "",
        createdAt: Date.now(),
        artefacts: [],
      },
    ]);
    setCurrentConversationId(id);
    setConversationPrompt("");
    setPromptValue("");
    setHomeScrolled(false);
    setGuidedNarrativeSlug(null);
    setGuidedNarrativeAngle("results");
    setGuidedNarrativeCountries([]);
    setNarrativePhase("planning");
    setView("conversation");
    if (typeof window !== "undefined") {
      window.history.pushState({ view: "conversation", id }, "", `/conversation/${id}`);
    }
  };

  // The user submitted while the create-narrative tag was on. Skip the AI
  // Q&A response in the conversation thread and start the planning phase
  // immediately. We mark this conversation as narrative-direct so the
  // ConversationView knows to suppress the Q&A block.
  const handleCreateNarrativeSubmit = (text: string) => {
    const id = Date.now().toString();
    resetNarrativeStateForNewConversation();
    setConversationSourceCard(null);
    setConversationFollowUps([]);
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: deriveArtefactTitle(text) || "Untitled narrative",
        prompt: text,
        createdAt: Date.now(),
        artefacts: [],
      },
    ]);
    setCurrentConversationId(id);
    setConversationPrompt("");
    setPromptValue("");
    setCreateNarrativeMode(false);
    setHomeScrolled(false);
    setView("conversation");
    if (typeof window !== "undefined") {
      window.history.pushState({ view: "conversation", id }, "", `/conversation/${id}`);
    }
    setGuidedNarrativeSlug(null);
    setGuidedNarrativeAngle("results");
    setGuidedNarrativeCountries([]);
    setNarrativeVariant(
      text.toLowerCase().includes("donor") || text.toLowerCase().includes("ida21 address")
        ? "donor-priorities"
        : "results"
    );
    setNarrativePhase("planning");
  };

  // Called by NarrativeConverse the moment the LLM emits a complete
  // <skeleton> block. Opens the right preview pane with the converse-shape
  // skeleton. The user can then click "Make changes" (re-prompt) or
  // "Yes, create narrative" to advance to the final NarrativePanel pipeline.
  const handleConverseSkeleton = (skeleton: ConverseSkeleton) => {
    setConverseSkeleton(skeleton);
    setRightPane("skeleton-preview");
  };

  const handleConverseProceed = () => {
    setNarrativePhase("skeleton-ready");
    setSelectedSkeletonId("converse-skeleton");
    setRightPane(null);
    // Hand off to the existing NarrativePanel pipeline. kickoffNarrativeGeneration
    // reads conversationPrompt + the selected skeleton; the converse skeleton
    // is plumbed via converseSkeleton state for NarrativePanel to consume.
    kickoffNarrativeGeneration();
  };

  // "Make changes" — focus the chat input by re-sending an empty message?
  // Instead, just close the preview so the user keeps chatting. The next
  // user turn in the existing converse history will become the change request.
  const handleConverseMakeChanges = () => {
    setRightPane(null);
    // The chat input is already wired (PromptBar), so the user just types.
  };

  const handleCreateNarrative = () => {
    if (!currentConversationId) return;
    // One narrative per conversation — if one already exists, just re-open the panel.
    const existing = currentConversation?.artefacts.find((a) => a.kind === "narrative");
    if (existing) {
      setRightPane("narrative");
      return;
    }
    setSelectedSkeletonId(null);
    setNarrativePhase("planning");
  };

  const handleNarrativePlanningComplete = () => {
    setNarrativePhase("skeleton-ready");
  };

  const handleWizardComplete = (result: NarrativeBuilderResult) => {
    if (result.narrativeMeta) {
      setNarrativeMeta(result.narrativeMeta);
      setNarrativeTitle(result.narrativeMeta.title ?? "");
    }
    // Open the NarrativePanel (draggable sections) with a loading state
    setRightPane("narrative");
    setNarrativePanelLoading(true);
    window.setTimeout(() => {
      setNarrativePanelLoading(false);
    }, 4500);
  };

  const handleGuidedDiscoveryComplete = (slug: string, angle: string, countries: string[], params: import("@/components/conversation/GuidedDiscovery").NarrativeParams) => {
    setGuidedNarrativeSlug(slug);
    setGuidedNarrativeAngle(angle);
    setGuidedNarrativeCountries(countries);
    setGuidedDiscoveryCompleted(true);
    setNarrativePhase("planning");
    void params;

    // Ground the carousel in real matched narratives (no mock fallback).
    setGuidedSkeletons([]);
    setGuidedSkeletonsError(false);
    setGuidedSkeletonsLoading(true);
    const query = conversationPrompt || slug;
    // Thread sessionId + intent from Call 0 — server caches the scorecard
    // slice under sessionId so /generate can reuse it without re-fetching.
    fetchMatchedSkeletons(
      query,
      {
        outcomeArea: narrativeSession.extractedParams?.outcome_area ?? undefined,
        geography:   narrativeSession.extractedParams?.geography   ?? undefined,
        sector:      narrativeSession.extractedParams?.sector      ?? undefined,
      },
      narrativeSession.sessionId ?? undefined,
      narrativeSession.intent,
    ).then((matched) => {
      setGuidedSkeletonsLoading(false);
      if (matched && matched.length) setGuidedSkeletons(matched);
      else setGuidedSkeletonsError(true);
    });
  };

  // Shared entry point for kicking off narrative generation. Seeds the
  // interactive-elements selection with the AI's default (map + timeline)
  // — the AI now bakes those into the draft on its own and surfaces a
  // summary message once the panel is ready, rather than asking the user
  // to confirm.
  const kickoffNarrativeGeneration = () => {
    if (!currentConversationId) return;
    setInteractiveElements(["map", "timeline"]);
    setNarrativePhase("generating");
    const a: Artefact = {
      id: Date.now().toString(),
      kind: "narrative",
      title: deriveArtefactTitle(conversationPrompt) || "Untitled narrative",
      prompt: conversationPrompt,
      createdAt: Date.now(),
      skeletonId: selectedSkeletonId ?? undefined,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId ? { ...c, artefacts: [...c.artefacts, a] } : c
      )
    );
    narrativeConfirmTimerRef.current = window.setTimeout(() => {
      setRightPane("narrative");
      setNarrativePanelLoading(true);
      window.setTimeout(() => {
        setNarrativePanelLoading(false);
        setNarrativePhase("idle");
      }, 4500);
    }, 500);
  };

  // Prompt-bar "Yes, create narrative" path. Skeleton must be selected.
  const handleNarrativeConfirm = () => {
    if (!currentConversationId || selectedSkeletonId == null) return;
    kickoffNarrativeGeneration();
  };

  // "Make changes" from the prompt-bar pill in skeleton-ready phase. The
  // pill only renders when a card is selected, so selectedSkeletonId is
  // guaranteed non-null here. Opens the preview for the selected angle and
  // switches to refining mode (chip in prompt bar).
  const handleNarrativeMakeChanges = () => {
    if (selectedSkeletonId == null) return;
    enterRefiningMode(selectedSkeletonId);
  };

  // Opens the skeleton-preview panel for a given angle. If another pane is
  // already open we replace it — only one right pane at a time.
  const handlePreviewSkeleton = (id: string) => {
    setPreviewSkeletonId(id);
    setRightPane("skeleton-preview");
  };

  // Closes the skeleton-preview panel. Fired when the user toggles off a
  // selected card so the drawer stays in sync with selection state.
  const handleClosePreviewSkeleton = () => {
    if (rightPane === "skeleton-preview") setRightPane(null);
    setPreviewSkeletonId(null);
  };

  // Preview-panel "Proceed to Create Full Narrative" — commits this angle
  // as the selection, closes the panel, and advances to the
  // interactive-elements question.
  //
  // We intentionally DO NOT clear refiningSkeletonId / refinementTurns here.
  // Those drive the in-chat persistence of the Make-changes suggestions and
  // the "Narrative updated" bubble — both need to stay visible after the
  // user proceeds. Cross-conversation isolation is handled by the
  // currentConversationId effect below, so state still resets when the user
  // switches to a different conversation.
  const handleProceedFromPreview = (id: string) => {
    setSelectedSkeletonId(id);
    // Keep skeleton-preview open — it closes naturally when the narrative
    // panel opens via the kickoff timer.
    kickoffNarrativeGeneration();
  };

  // Preview-panel "Make changes" — keeps the preview open so the user can
  // reference the full skeleton while writing their feedback, and switches
  // the prompt bar into refining mode.
  const handleMakeChangesFromPreview = (id: string) => {
    enterRefiningMode(id);
  };

  // Shared implementation: both "Make changes" entry points (prompt-bar pill
  // and preview-panel button) land here. Preview panel stays open; chip
  // appears in the prompt bar; refinement history resets.
  const enterRefiningMode = (id: string) => {
    setRefiningSkeletonId(id);
    setSelectedSkeletonId(id);
    setPreviewSkeletonId(id);
    setRightPane("skeleton-preview");
    setRefinementTurns([]);
    setNarrativePhase("refining");
  };

  // User submitted feedback while in the refining phase. Append the turn,
  // mark the conversation as having added the extra country (mock: any
  // refinement triggers the addition), and advance to refined-ready so the
  // AI response + widget render.
  const handleSubmitRefinement = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRefinementTurns((prev) => [...prev, trimmed]);
    if (currentConversationId) {
      setExtraCountryByConvId((prev) => {
        if (prev.has(currentConversationId)) return prev;
        const next = new Set(prev);
        next.add(currentConversationId);
        return next;
      });
    }
    setPromptValue("");
    setNarrativePhase("refined-ready");
  };

  // Inline refined-widget "Make changes" — loop back into refining mode
  // and reopen the preview panel so the user can reference the original
  // skeleton while writing the next refinement. History stays so the
  // conversation thread keeps the previous turns.
  const handleMakeChangesFromRefined = () => {
    if (refiningSkeletonId == null) {
      setNarrativePhase("refining");
      return;
    }
    setPreviewSkeletonId(refiningSkeletonId);
    setRightPane("skeleton-preview");
    setNarrativePhase("refining");
  };

  // Inline refined-widget "Proceed to Create Full Narrative" — kicks off
  // generation directly. The interactive-elements picker has been retired
  // in favour of an AI summary message that lands once the draft is ready.
  const handleProceedFromRefined = () => {
    kickoffNarrativeGeneration();
  };

  // Cancel the refining session entirely (user dismissed the chip). Returns
  // to skeleton-ready with the original selection cleared.
  const handleCancelRefining = () => {
    setRefiningSkeletonId(null);
    setRefinementTurns([]);
    setNarrativePhase("skeleton-ready");
  };

  // Generate format from the narrative panel. Only "infographic" is
  // wired up to a real pane today — the other formats stay as no-ops until
  // their respective views are built.
  // Internal — runs the mock generation pass for the infographic.
  // `replace` removes any existing infographic before adding the new
  // one, preserving the "one per conversation" rule when regenerating.
  const runInfographicGeneration = (replace: boolean) => {
    if (!currentConversationId) return;
    if (replace) {
      setConversations((prev) =>
        prev.map((c) => c.id === currentConversationId
          ? { ...c, artefacts: c.artefacts.filter((a) => a.kind !== "infographic") }
          : c
        )
      );
    }
    setInfographicGenerating(true);
    setRightPane("infographic");
    window.setTimeout(() => {
      const baseTitle = deriveArtefactTitle(conversationPrompt) || "Infographic";
      const a: Artefact = {
        id: Date.now().toString(),
        kind: "infographic",
        title: `${baseTitle} · Infographic`,
        prompt: conversationPrompt,
        createdAt: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) => c.id === currentConversationId ? { ...c, artefacts: [...c.artefacts, a] } : c)
      );
      setInfographicGenerating(false);
    }, 3500);
  };

  const handleGenerate = (kind: string) => {
    if (kind !== "infographic") return;
    if (!currentConversationId) return;
    const existing = currentConversation?.artefacts.find((a) => a.kind === "infographic");
    if (existing) {
      // Existing artefact — ask before regenerating.
      setRegenerateConfirm(kind);
      return;
    }
    runInfographicGeneration(false);
  };

  const confirmRegenerate = () => {
    const kind = regenerateConfirm;
    setRegenerateConfirm(null);
    if (kind === "infographic") runInfographicGeneration(true);
  };

  const handleSelectArtefact = (a: Artefact) => {
    setRightPane(a.kind);
  };

  const extraCountryApplied =
    currentConversationId != null && extraCountryByConvId.has(currentConversationId);
  const narrativeArtefact = currentArtefacts.find((a) => a.kind === "narrative");
  const narrativeSkeletonForCurrent = narrativeArtefact?.skeletonId ?? selectedSkeletonId;

  // Open the shared-link viewer for a home-page card (e.g. a featured
  // narrative). If a conversation for that prompt already exists, jump
  // back into it; otherwise fabricate a stub conversation with a
  // pre-generated infographic artefact attached.
  const handleOpenViewer = (prompt: string, fallbackTitle: string) => {
    const existing = conversations.find((c) => c.prompt === prompt);
    if (existing) {
      setCurrentConversationId(existing.id);
      setConversationPrompt(prompt);
      setView("viewer");
      return;
    }
    const id = `seed-${Date.now()}`;
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const baseTitle = deriveArtefactTitle(prompt) || fallbackTitle;
    const insight: Artefact = {
      id: `${id}-insight`,
      kind: "infographic",
      title: `${baseTitle} · Infographic`,
      prompt,
      createdAt: yesterday,
    };
    setConversations((prev) => [
      ...prev,
      {
        id,
        title: baseTitle,
        prompt,
        createdAt: yesterday,
        artefacts: [insight],
      },
    ]);
    setCurrentConversationId(id);
    setConversationPrompt(prompt);
    setView("viewer");
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    resetNarrativeStateForNewConversation();
    setCurrentConversationId(id);
    setConversationPrompt(conv.prompt);
    setRightPane(null);
    setView("conversation");
  };

  // Reset transient narrative-creation state when the user moves to a
  // different conversation. refiningSkeletonId / refinementTurns /
  // selectedSkeletonId are global so the chat can stay cumulative inside
  // one conversation — but they need to be cleared at conversation
  // boundaries or they'd leak into the next chat. Called explicitly from
  // the conversation-entry handlers (not via useEffect) so it can't
  // clobber state the handler set after currentConversationId.
  // Narrative session: one sessionId + extracted-param chip-fill bundle per
  // "user hits send" event. Cleared whenever the user starts over.
  const narrativeSession = useNarrativeSession();

  // Converse-flow state: the LLM-emitted skeleton + a ref to the chat's
  // sendMessage so the bottom PromptBar can drive follow-up turns from
  // outside the NarrativeConverse component tree.
  const [converseSkeleton, setConverseSkeleton] = useState<ConverseSkeleton | null>(null);
  const converseSendRef = useRef<((text: string) => void) | null>(null);
  // Forwards PromptBar submissions into NarrativeBuilderWizard during "planning".
  const wizardInputRef = useRef<((text: string) => void) | null>(null);
  // Contextual chips surfaced by the wizard above the PromptBar.
  const [wizardContextChips, setWizardContextChips] = useState<{ id: string; label: string }[]>([]);
  const wizardContextActionRef = useRef<((actionId: string) => void) | null>(null);

  // Preloaded synthesized answer for the insight-card → conversation flow.
  const [preloadedInsight, setPreloadedInsight] = useState<{ answer: string; followUps: string[] } | null>(null);

  // Open a conversation seeded with a trending-insight card's question and its
  // already-synthesized answer (shown as the first AI turn).
  const handleOpenInsight = (card: InsightCard) => {
    const answer = card.hero_stat
      ? `${card.insight}\n\n${card.hero_stat.value} — ${card.hero_stat.caption}`
      : card.insight;
    handleSearchComplete(card.question, { answer, followUps: card.follow_ups });
  };

  const resetNarrativeStateForNewConversation = () => {
    setRefiningSkeletonId(null);
    setRefinementTurns([]);
    setSelectedSkeletonId(null);
    setNarrativePhase("idle");
    setGuidedNarrativeSlug(null);
    setGuidedNarrativeAngle("results");
    setGuidedNarrativeCountries([]);
    setGuidedDiscoveryCompleted(false);
    setConverseSkeleton(null);
    converseSendRef.current = null;
    setPreloadedInsight(null);
    setNarrativeVariant("results");
    setNarrativeMeta(null);
    setNarrativeTitle("");
    narrativeSession.clearSession();
  };

  // Call 0 — fires when the user submits the prompt. Generates the sessionId,
  // populates empty chips from the extracted params, stores intent. If all of
  // {geography, sector, outcome_area} come back null we report proceed=false
  // and PromptBar renders an inline "be more specific" message in lieu of
  // transitioning views.
  const handleBeforeSubmit = async (
    prompt: string,
  ): Promise<{ proceed: boolean; message?: string | null }> => {
    const params = await narrativeSession.runExtract(prompt, {});
    if (!params) {
      // Extraction failed entirely — let submission proceed; downstream calls
      // can still match on the raw query.
      return { proceed: true };
    }
    return { proceed: true };
  };

  // + button menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [mainMenuLeft, setMainMenuLeft] = useState<number | undefined>(0);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(() => new Set(MCP_CONNECTORS.map((c) => c.id)));
  const menuRef = useRef<HTMLDivElement>(null);
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [subMenuLeft, setSubMenuLeft] = useState(230);

  const openSub = () => {
    if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      // Would the submenu (290px) fit to the right of the main menu (230px)?
      const rightEdge = rect.left + 230 + 290;
      if (rightEdge > window.innerWidth - 8) {
        // Flip: open to the left of the main menu
        setSubMenuLeft(-290);
      } else {
        setSubMenuLeft(230);
      }
    }
    setSubOpen(true);
  };
  const closeSub = () => { subCloseTimer.current = setTimeout(() => setSubOpen(false), 120); };
  const toggleConnector = (id: string) => setEnabledIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false); setSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => { if (!menuOpen) setSubOpen(false); }, [menuOpen]);

  return (
    <>
      <LoadingScreen isReady={isReady} progress={progress} />
      {/* Shared, always-mounted prompt bar. Animates between hero-center
          (home) and bottom-fixed (conversation). */}
      {view !== "workspace" && view !== "viewer" && <PromptBar
        mode={(view === "conversation" || (view === "home" && homeScrolled)) ? "bottom" : "hero"}
        widthMode={view === "conversation" ? "wide" : "compact"}
        value={promptValue}
        onChange={setPromptValue}
        beforeSubmit={view === "home" && !createNarrativeMode ? handleBeforeSubmit : undefined}
        populateChips={narrativeSession.extractedParams}
        onComplete={handleSearchComplete}
        onCreateNarrative={handleCreateNarrative}
        panelOpen={isNarrativeDirect ? rightPane !== null : view === "conversation"}
        panelWidth={
          isNarrativeDirect
            ? rightPaneWidth
            : view === "conversation"
              ? (rightPane !== null ? rightPaneWidth : 0) + (hideMap ? 0 : Math.round(globeW * (1 - splitPercent / 100)))
              : rightPaneWidth
        }
        suppressTransition={rightPaneDragging}
        showCreateChip={
          view === "conversation" &&
          !currentArtefacts.some((a) => a.kind === "narrative") &&
          narrativePhase === "skeleton-ready" &&
          selectedSkeletonId != null
        }
        narrativePhase={narrativePhase}
        onNarrativeConfirm={handleNarrativeConfirm}
        onNarrativeMakeChanges={handleNarrativeMakeChanges}
        narrativeConfirmDisabled={narrativePhase === "skeleton-ready" && selectedSkeletonId === null}
        guidanceReplyChip={
          guidanceReplyLabel
            ? { label: guidanceReplyLabel, onDismiss: () => setGuidanceReplyLabel(null) }
            : undefined
        }
        refiningChip={
          narrativePhase === "refining" && refiningSkeletonId
            ? {
                title:
                  guidedSkeletons.find((s) => s.id === refiningSkeletonId)?.title ?? "narrative angle",
                onDismiss: handleCancelRefining,
              }
            : undefined
        }
        onRefineSubmit={
          narrativePhase === "refining"
            ? handleSubmitRefinement
            : narrativePhase === "planning"
              ? (text: string) => {
                  wizardInputRef.current?.(text);
                  setPromptValue("");
                }
              : narrativePhase === "converse"
                ? (text: string) => {
                    converseSendRef.current?.(text);
                    setPromptValue("");
                  }
                : undefined
        }
        createNarrativeChip={
          view === "home" && createNarrativeMode
            ? { onDismiss: () => setCreateNarrativeMode(false) }
            : undefined
        }
        onCreateNarrativeSubmit={
          view === "home" && createNarrativeMode ? handleCreateNarrativeSubmit : undefined
        }
        contentModifyChip={
          contentModifyTarget
            ? {
                text: contentModifyTarget.text.length > 50
                  ? contentModifyTarget.text.slice(0, 50) + "…"
                  : contentModifyTarget.text,
                onDismiss: () => setContentModifyTarget(null),
              }
            : undefined
        }
        onContentModifySubmit={contentModifyTarget ? (instruction) => {
          setContentModifySignal({
            sectionId: contentModifyTarget.sectionId,
            instruction,
            nonce: Date.now(),
          });
          setContentModifyTarget(null);
        } : undefined}
        inputRef={promptInputRef}
        inConversation={view === "conversation"}
        contextChips={wizardContextChips}
        onContextChipClick={(id) => wizardContextActionRef.current?.(id)}
        onSubmit={() => {
          // Scroll the home view back to the top on submit so the beam runs
          // in the right place and the bar can animate from bottom→hero first.
          if (view === "home" && homeScrolled) {
            const el = homeScrollRef.current;
            if (el) el.scrollTo({ top: 0, behavior: "smooth" });
            setHomeScrolled(false);
          }
        }}
      />}

      {/* ── Fixed page background ── */}
      {/* Base: always #112531 */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: -2, background: "#112531" }}
      />
      {/* Landing gradient overlay — fades out on conversation / workspace */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: -1,
          background: [
            /* radial bloom — soft light source just above centre-top */
            "radial-gradient(ellipse 110% 60% at 50% -5%, rgba(58,155,205,0.42) 0%, rgba(28,90,135,0.12) 50%, transparent 72%)",
            /* linear fade — lighter teal crown darkening to base */
            "linear-gradient(180deg, #1C4A62 0%, #152E3E 38%, #112531 68%)",
          ].join(", "),
          opacity: (view === "conversation" || view === "workspace") ? 0 : 1,
          transition: "opacity 700ms ease",
          pointerEvents: "none",
        }}
      />

      {/* ── Globe — right-panel in conversation, centred on home ── */}
      {globeW > 0 && globeH > 0 && (
        <div
          ref={globeBlurRef}
          aria-hidden="true"
          style={
            view === "conversation"
              ? {
                  position: "fixed",
                  left: `${splitPercent}%`,
                  width: `${100 - splitPercent}%`,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: (hideMap || flatMapOpen) ? 0 : 0.72,
                  transition: "opacity 450ms ease",
                  pointerEvents: (conversationSourceCard?.geoRegions?.length || conversationGeoHint?.regions.length) ? "auto" : "none",
                }
              : {
                  position: "fixed",
                  left: "50%",
                  top: "24vh",
                  transform: "translate(-50%, 0) scale(1)",
                  opacity: view === "workspace" ? 0 : 0.38,
                  pointerEvents: "none",
                  zIndex: 0,
                  transition: "opacity 600ms ease",
                  willChange: "transform, filter",
                }
          }
        >
          {view === "conversation" ? (
            <D3Globe
              width={Math.round(Math.min(globeH * 0.72, globeW * (1 - splitPercent / 100) * 0.86))}
              height={Math.round(Math.min(globeH * 0.72, globeW * (1 - splitPercent / 100) * 0.86))}
              autoRotate
              rotationSpeed={0.12}
              showGleam={false}
              highlightRegions={conversationSourceCard?.geoRegions ?? conversationGeoHint?.regions}
              highlightColor={conversationGeoHint && !conversationSourceCard ? conversationGeoHint.color : cardAccent}
              highlightTooltipData={conversationSourceCard?.geoData ?? conversationGeoHint?.geoData}
              onCountryHover={
                (conversationSourceCard?.geoRegions?.length || conversationGeoHint?.regions.length)
                  ? (name, note, x, y) => {
                      if (name) setGlobeTooltip({ name, note, x, y });
                      else setGlobeTooltip(null);
                    }
                  : undefined
              }
            />
          ) : (
            <D3Globe
              width={Math.round(globeW * 0.82)}
              height={Math.round(globeW * 0.82)}
              autoRotate
              rotationSpeed={0.12}
              showGleam={view === "home"}
            />
          )}
        </div>
      )}

      {/* ── Flat map — full-screen, crossfades with globe ── */}
      {globeW > 0 && view === "conversation" && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            opacity: flatMapOpen && !hideMap ? 1 : 0,
            transition: "opacity 450ms ease",
            pointerEvents: flatMapOpen ? "auto" : "none",
          }}
        >
          <FlatMapOverlay
            onClose={() => setFlatMapOpen(false)}
            highlightRegions={conversationSourceCard?.geoRegions ?? conversationGeoHint?.regions ?? []}
            highlightColor={conversationGeoHint && !conversationSourceCard ? conversationGeoHint.color : cardAccent}
            highlightTooltipData={conversationSourceCard?.geoData ?? conversationGeoHint?.geoData}
            geoDetailData={conversationSourceCard?.geoDetailData ?? conversationGeoHint?.geoDetailData}
            groupTitle={conversationSourceCard?.title ?? conversationGeoHint?.title}
          />
        </div>
      )}

      {view === "conversation" && (
        <div className="cv-dark" style={{ display: "contents" }}>
          <NarrativePanel
            open={rightPane === "narrative"}
            prompt={conversationPrompt}
            onClose={() => setRightPane(null)}
            onGenerate={handleGenerate}
            loading={narrativePanelLoading}
            generatedKinds={currentArtefacts.map((a) => a.kind)}
            skeletonId={narrativeSkeletonForCurrent}
            extraCountryApplied={extraCountryApplied}
            addedVisuals={addedVisuals}
            onRemoveVisual={(id) => setAddedVisuals((prev) => prev.filter((v) => v.id !== id))}
            onAddVisual={(v) => setAddedVisuals((prev) => [...prev, v])}
            onModifyContent={(target) => setContentModifyTarget(target)}
            onAutoPrompt={(text) => {
              if (converseSendRef.current) {
                converseSendRef.current(text);
              } else {
                setPromptValue(text);
              }
            }}
            contentModifySignal={contentModifySignal}
            guidanceSignal={guidanceSignal}
            guidedSkeleton={
              narrativeSkeletonForCurrent && guidedSkeletons.length > 0
                ? guidedSkeletons.find((s) => s.id === narrativeSkeletonForCurrent)
                : undefined
            }
            narrativeVariant={narrativeVariant}
            narrativeMeta={narrativeMeta ?? undefined}
            width={rightPaneWidth}
            onResize={(w, dragging) => {
              setRightPaneWidth(w);
              setRightPaneDragging(dragging);
            }}
          />
          <InfographicPanel
            open={rightPane === "infographic"}
            prompt={conversationPrompt}
            onClose={() => setRightPane(null)}
            onOpenNarrative={() => setRightPane("narrative")}
            onPreviewAsViewer={() => {
              setRightPane(null);
              setView("viewer");
            }}
            loading={infographicGenerating}
            width={rightPaneWidth}
            onResize={(w, dragging) => {
              setRightPaneWidth(w);
              setRightPaneDragging(dragging);
            }}
          />
          <SkeletonPreviewPanel
            open={rightPane === "skeleton-preview"}
            flow={detectFlow(conversationPrompt)}
            skeletonId={previewSkeletonId}
            width={rightPaneWidth}
            onResize={(w, dragging) => {
              setRightPaneWidth(w);
              setRightPaneDragging(dragging);
            }}
            onClose={() => {
              setRightPane(null);
              setPreviewSkeletonId(null);
              setWizardChallenge(null);
            }}
            onProceed={(id) => {
              if (id.startsWith("converse:")) { handleConverseProceed(); return; }
              handleProceedFromPreview(id);
            }}
            onMakeChanges={(id) => {
              if (id.startsWith("converse:")) { handleConverseMakeChanges(); return; }
              handleMakeChangesFromPreview(id);
            }}
            converseSkeleton={converseSkeleton}
            refinementTurns={refinementTurns}
            extraCountryApplied={extraCountryApplied}
            guidedSkeletons={guidedSkeletons}
            wizardChallenge={wizardChallenge}
          />
        </div>
      )}

      {view === "viewer" ? (
        <ViewerView
          prompt={conversationPrompt}
          title={currentConversation?.title ?? "Shared infographic"}
          onClose={goHome}
        />
      ) : view === "workspace" ? (
        <WorkspaceView
          items={conversations.map((c) => ({
            id: c.id,
            title: c.title,
            prompt: c.prompt,
            createdAt: c.createdAt,
            artefactCount: c.artefacts.length,
          }))}
          onSelect={handleSelectConversation}
          onClose={goHome}
        />
      ) : view === "conversation" ? (
        <>
          {/* ── Conversation-page nav ── */}
          <nav style={{
            position: "fixed", top: 0, left: 0, right: 0,
            height: CONV_NAV_H, zIndex: 100,
            display: "flex", alignItems: "center", gap: 10,
            padding: "0 20px",
            background: "rgba(17,37,49,0.90)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontFamily: F,
          }}>
            {/* Logo + brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <img src="/globe.svg" alt="" width={26} height={26} style={{ filter: "brightness(0) invert(1)", display: "block" }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.62)", letterSpacing: "0.01em" }}>
                Scorecard Workbench
              </span>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Artefacts — icon only */}
            <button
              onClick={currentArtefacts.length > 0 ? () => handleSelectArtefact(currentArtefacts[0]) : undefined}
              title="Artefacts"
              aria-label={`Artefacts (${currentArtefacts.length})`}
              style={{
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34,
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "50%", cursor: "pointer",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              <IconFiles size={15} />
              {currentArtefacts.length > 0 && (
                <span style={{
                  position: "absolute", top: -3, right: -3,
                  background: "#00B29C",
                  borderRadius: 10, padding: "1px 4px",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  lineHeight: 1.4,
                }}>
                  {currentArtefacts.length}
                </span>
              )}
            </button>

            {/* Share */}
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 13px",
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 20, cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)",
              letterSpacing: "0.02em",
            }}>
              <IconShare size={13} />
              Share
            </button>

            {/* Close → home */}
            <button
              onClick={goHome}
              title="Close"
              aria-label="Close conversation"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34,
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "50%", cursor: "pointer",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              <IconX size={15} />
            </button>
          </nav>

          {/* ── Frosted glass panel — only shown when map is expanded ── */}
          {!hideMap && (
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                top: CONV_NAV_H, left: 0,
                width: `${splitPercent}%`,
                bottom: 0,
                zIndex: 1,
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                background: "rgba(8,18,30,0.72)",
                pointerEvents: "none",
                transition: "width 300ms ease",
              }}
            />
          )}

          {/* ── Conversation content ── */}
          <div
            style={{
              position: "fixed",
              top: CONV_NAV_H, left: 0,
              width: hideMap ? "100%" : `${splitPercent}%`,
              bottom: 0,
              zIndex: 2,
              background: "transparent",
              transition: "width 300ms ease",
            }}
            className="conv-enter"
          >
            <ConversationView
              embedded
              dark={true}
              mapMode={true}
              prompt={conversationPrompt}
              onClose={goHome}
              panelOpen={rightPane !== null}
              panelWidth={rightPaneWidth}
              suppressTransition={rightPaneDragging}
              artefacts={currentArtefacts}
              onSelectArtefact={handleSelectArtefact}
              title={currentConversation?.title}
              onTitleChange={(t) => setConversations((prev) =>
                prev.map((c) => c.id === currentConversationId ? { ...c, title: t } : c)
              )}
              narrativePhase={narrativePhase}
              onNarrativePlanningComplete={handleNarrativePlanningComplete}
              selectedSkeletonId={selectedSkeletonId}
              onSelectSkeleton={setSelectedSkeletonId}
              onPreviewSkeleton={handlePreviewSkeleton}
              onClosePreviewSkeleton={handleClosePreviewSkeleton}
              refiningSkeletonId={refiningSkeletonId}
              refinementTurns={refinementTurns}
              onRefinedProceed={handleProceedFromRefined}
              onRefinedMakeChanges={handleMakeChangesFromRefined}
              extraCountryApplied={extraCountryApplied}
              narrativeDirect={
                currentConversationId != null &&
                narrativeDirectConversations.has(currentConversationId)
              }
              followUpPrompts={conversationFollowUps}
              sourceCard={conversationSourceCard ?? undefined}
              onFollowUpClick={(p) => {
                setConversationFollowUps([]);
                setConversationSourceCard(null);
                handleSearchComplete(p);
              }}
              guidedNarrativeSlug={guidedNarrativeSlug}
              guidedNarrativeAngle={guidedNarrativeAngle}
              guidedNarrativeCountries={guidedNarrativeCountries}
              guidedDiscoveryCompleted={guidedDiscoveryCompleted}
              guidedSkeletons={guidedSkeletons}
              guidedSkeletonsLoading={guidedSkeletonsLoading}
              guidedSkeletonsError={guidedSkeletonsError}
              onGuidedDiscoveryComplete={handleGuidedDiscoveryComplete}
              converseSessionId={narrativeSession.sessionId}
              onConverseSkeleton={handleConverseSkeleton}
              onConverseReady={(api) => { converseSendRef.current = api.sendMessage; }}
              wizardInputRef={wizardInputRef}
              onWizardComplete={handleWizardComplete}
              onWizardContextChipsChange={setWizardContextChips}
              wizardContextActionRef={wizardContextActionRef}
              onWizardPrefillPrompt={setPromptValue}
              onWizardGuidanceReply={setGuidanceReplyLabel}
              onWizardGuidanceDimension={(dim) => setGuidanceSignal({ dimensionNum: dim, nonce: Date.now() })}
              narrativeVariant={narrativeVariant}
              initialOutcomeArea={narrativeSession.extractedParams?.outcome_area ?? null}
              initialCountrySubset={narrativeSession.extractedParams?.geography ?? null}
              preloadedAnswer={preloadedInsight?.answer ?? null}
              preloadedFollowUps={preloadedInsight?.followUps ?? []}
            />
          </div>

          {/* ── Divider with collapse / expand ── */}
          {!hideMap && (
            <div
              onMouseEnter={() => setDividerHovered(true)}
              onMouseLeave={() => setDividerHovered(false)}
              onMouseDown={mapCollapsed ? undefined : (e) => {
                splitDidDrag.current = false;
                splitDragRef.current = { startX: e.clientX, startPct: splitPercent };
                e.preventDefault();
              }}
              onClick={() => {
                if (splitDidDrag.current) return;
                setMapCollapsed((v) => !v);
              }}
              style={{
                position: "fixed",
                top: CONV_NAV_H, bottom: 0,
                ...(mapCollapsed
                  ? { right: 0, width: 40 }
                  : { left: `calc(${splitPercent}% - 20px)`, width: 40 }),
                zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: mapCollapsed ? "pointer" : "col-resize",
              }}
            >
              {/* Thin vertical line — visible on hover when expanded */}
              {dividerHovered && !mapCollapsed && (
                <div style={{
                  position: "absolute", top: 0, bottom: 0, left: "50%",
                  width: 1,
                  background: "rgba(255,255,255,0.16)",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Chevron button */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: dividerHovered ? "rgba(255,255,255,0.10)" : "transparent",
                border: `1px solid ${dividerHovered ? "rgba(255,255,255,0.18)" : "transparent"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, border-color 0.15s",
              }}>
                {mapCollapsed
                  ? <IconChevronLeft size={15} color={dividerHovered ? "rgba(255,255,255,0.75)" : "transparent"} />
                  : <IconChevronRight size={15} color={dividerHovered ? "rgba(255,255,255,0.75)" : "transparent"} />
                }
              </div>
            </div>
          )}

          {/* ── Globe ↔ Flat map toggle ── */}
          {!hideMap && !flatMapOpen && (
            <button
              onClick={() => { setFlatMapOpen((v) => !v); setGlobeTooltip(null); }}
              style={{
                position: "fixed",
                bottom: 24, right: 28,
                zIndex: 10,
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                background: "rgba(8,18,30,0.82)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20, cursor: "pointer",
                fontFamily: F, fontSize: 11, fontWeight: 600,
                color: "rgba(255,255,255,0.60)",
                letterSpacing: "0.03em",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "opacity 0.15s",
              }}
            >
              {flatMapOpen ? "← Globe" : "Flat map →"}
            </button>
          )}
        </>
      ) : (
    <div
      className="flex h-screen overflow-hidden"
      style={{ position: "relative" }}
    >
      {/* ── Main scrollable content ── */}
      <div ref={homeScrollRef} className="flex-1 min-w-0 overflow-y-auto flex flex-col" style={{ position: "relative", zIndex: 1 }}>
      <AppHeader
        workspaceCount={conversations.length}
        onOpenWorkspace={() => setView("workspace")}
        scrolled={homeScrolled || view !== "home"}
        narrativeTitle={narrativeTitle || undefined}
        onNarrativeTitleChange={setNarrativeTitle}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <SearchHero />
        <QuickStartPills
          visible={view === "home" && !homeScrolled}
          onPillClick={(prompt) => {
            setPromptValue(prompt);
            setTimeout(() => promptInputRef.current?.focus(), 0);
          }}
          onNarrativePromptClick={handleCreateNarrativeSubmit}
          onCreateResultsNarrative={handleDirectBuildNarrative}
        />

        {/* Ticker hidden for now — keep import/state intact for a quick re-enable.
            To bring it back, wrap with the FadeIn delay={25} block again. */}
        {false && (
          <FadeIn delay={25}>
            <IndicatorTicker indicators={indicators} />
          </FadeIn>
        )}

        <FadeIn delay={25}>
          <MomentumGroups onCardClick={(prompt, followUps, group) => {
            handleSearchComplete(prompt);
            // Re-set after handleSearchComplete so card state wins in React's batch
            setConversationFollowUps(followUps);
            setConversationSourceCard(group);
          }} />
        </FadeIn>

        <FadeIn delay={50}>
          <OutcomeAreaGrid />
        </FadeIn>

        <FadeIn delay={62}>
          <SynthesizedInsights onOpenInsight={handleOpenInsight} />
        </FadeIn>

        {/* <FadeIn delay={75}>
          <AnalyticsCards />
        </FadeIn> */}

        <FadeIn delay={88}>
          <FeaturedNarratives onOpenInfographic={handleOpenViewer} />
        </FadeIn>

        {/* Counter Intuitive Findings — hidden for now */}
        {false && (
          <FadeIn delay={100}>
            <CounterIntuitiveFindings />
          </FadeIn>
        )}

        <div className="h-8" />
      </main>

      <AppFooter />
      </div>
      {/* ── AI Chat sidebar (pushes content) ── */}
      {aiChatOpen && (
        <div
          className="shrink-0 border-l border-gray-200 flex flex-col bg-white"
          style={{ width: 420, height: "100vh" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-5 py-4 shrink-0"
            style={{ background: "linear-gradient(135deg, #0D52A2 0%, #0b6fd3 60%, #2196F3 100%)" }}
          >
            <IconSparkles size={20} stroke={1.9} style={{ color: "rgba(255,255,255,0.9)", flexShrink: 0 }} />
            <span
              className="flex-1 text-[15px] font-bold"
              style={{ fontFamily: "'Open Sans', sans-serif", color: "#FFFFFF", letterSpacing: "-0.15px" }}
            >
              Ask AI
            </span>
            <button
              onClick={() => setAiChatOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <IconX size={16} stroke={1.5} />
            </button>
          </div>

          {/* Body — empty state */}
          <div className="flex-1 overflow-y-auto flex flex-col justify-center gap-3 px-5 py-6">
            <p className="text-[13px] text-gray-400 text-center" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Ask anything about the scorecard data, country performance, or portfolio gaps.
            </p>
            <div className="flex flex-col gap-2">
              {AI_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setAiInput(s)}
                  className="text-left px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 py-4">
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                borderRadius: 16,
                boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.05)",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* + button + menus */}
              <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
                <button
                  aria-label="Add"
                  onClick={() => {
                    if (!menuOpen && menuRef.current) {
                      const rect = menuRef.current.getBoundingClientRect();
                      // If 230px main menu would overflow right, anchor it right-aligned to button
                      if (rect.left + 230 > window.innerWidth - 8) {
                        setMainMenuLeft(undefined); // will use right:0 below
                      } else {
                        setMainMenuLeft(0);
                      }
                    }
                    setMenuOpen((v) => !v);
                  }}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: "none", background: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#616161", flexShrink: 0,
                  }}
                >
                  <IconPlus size={15} stroke={2} />
                </button>

                {/* Main menu — opens upward */}
                {menuOpen && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: mainMenuLeft, right: mainMenuLeft === undefined ? 0 : undefined, width: 230, zIndex: 200, ...menuShell }}>
                    <div
                      style={{ ...menuRow }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; closeSub(); }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <IconPaperclip size={16} stroke={1.5} color="#616161" />
                      <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Add files or photos</span>
                    </div>
                    <div
                      style={{ ...menuRow, borderBottom: "1px solid #F3F4F6" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; closeSub(); }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <IconPhoto size={16} stroke={1.5} color="#616161" />
                      <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Add images</span>
                    </div>
                    <div
                      style={{ ...menuRow, background: subOpen ? "#F5F5F5" : "transparent", justifyContent: "space-between" }}
                      onMouseEnter={openSub}
                      onMouseLeave={closeSub}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <IconPlugConnected size={16} stroke={1.5} color="#616161" />
                        <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Connectors</span>
                      </div>
                      <IconChevronRight size={14} stroke={1.5} color="#9E9E9E" />
                    </div>
                  </div>
                )}

                {/* Connectors submenu */}
                {menuOpen && subOpen && (
                  <div
                    style={{ position: "absolute", bottom: "calc(100% + 8px)", left: subMenuLeft, width: 290, zIndex: 201, ...menuShell }}
                    onMouseEnter={openSub}
                    onMouseLeave={closeSub}
                  >
                    {MCP_CONNECTORS.map((c, i) => {
                      const on = enabledIds.has(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleConnector(c.id)}
                          style={{ ...menuRow, borderBottom: i < MCP_CONNECTORS.length - 1 ? "1px solid #F3F4F6" : "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <ChatConnectorIcon id={c.id} />
                          <span style={{ fontFamily: F, fontSize: 13, color: "#212121", flex: 1, lineHeight: "18px" }}>{c.name}</span>
                          <ChatToggle on={on} onToggle={() => toggleConnector(c.id)} />
                        </div>
                      );
                    })}
                    <div style={{ borderTop: "1px solid #F3F4F6" }}>
                      <div
                        style={{ ...menuRow, borderBottom: "1px solid #F3F4F6" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconSettings size={14} stroke={1.5} color="#616161" />
                        </div>
                        <span style={{ fontFamily: F, fontSize: 13, color: "#212121" }}>Manage connectors</span>
                      </div>
                      <div
                        style={{ ...menuRow }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconTool size={14} stroke={1.5} color="#616161" />
                        </div>
                        <div>
                          <div style={{ fontFamily: F, fontSize: 13, color: "#212121" }}>Tool access</div>
                          <div style={{ fontFamily: F, fontSize: 11, color: "#9E9E9E", marginTop: 1 }}>Load tools when needed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                rows={1}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Give me more insights"
                className="flex-1 resize-none focus:outline-none"
                style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: 16,
                  color: "#212121",
                  background: "transparent",
                  border: "none",
                  lineHeight: "24px",
                  height: 24,
                  overflowY: "hidden",
                  minWidth: 0,
                  padding: 0,
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 72) + "px";
                }}
              />

              {/* Send button */}
              <button
                disabled={!aiInput.trim()}
                aria-label="Send"
                style={{
                  width: 32, height: 32, borderRadius: "50%", border: "none",
                  background: aiInput.trim() ? "#0b6fd3" : "#BDBDBD",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  cursor: aiInput.trim() ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
              >
                <IconArrowUp size={16} stroke={2} color="#FFFFFF" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating AI button (hidden when chat is open) ── */}
      {!aiChatOpen && <button
        aria-label="Ask AI"
        onClick={() => setAiChatOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: `1px solid ${aiChatOpen ? "#0b6fd3" : "#E5E5E5"}`,
          background: aiChatOpen ? "#EBF3FC" : "#FFFFFF",
          boxShadow: "0px 4px 12px rgba(12,35,60,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 50,
          color: aiChatOpen ? "#0b6fd3" : "#616161",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
      >
        <IconSparkles size={22} stroke={1.5} />
      </button>}

      {modalStory && (
        <StoryDetailModal story={modalStory} onClose={() => setModalStory(null)} />
      )}
    </div>
      )}

      {/* Regenerate confirmation — appears when a user picks a Generate
          option whose artefact already exists. Click the backdrop or
          Cancel to dismiss; Regenerate replaces the existing artefact
          and re-runs the mock composer. */}
      {/* Globe country tooltip */}
      {globeTooltip && (() => {
        const accentColor = conversationGeoHint && !conversationSourceCard ? conversationGeoHint.color : cardAccent;
        const detail = conversationSourceCard?.geoDetailData?.[globeTooltip.name] ?? conversationGeoHint?.geoDetailData?.[globeTooltip.name] ?? null;
        return (
          <div
            onClick={() => { setFlatMapOpen(true); setGlobeTooltip(null); }}
            style={{
              position: "fixed",
              left: globeTooltip.x + 14,
              top: globeTooltip.y - 12,
              zIndex: 200,
              pointerEvents: "auto",
              cursor: "pointer",
              background: "rgba(8,20,36,0.96)",
              border: `1px solid ${accentColor}44`,
              borderRadius: 10,
              padding: "10px 14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
              maxWidth: 260,
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.95)", lineHeight: 1.2 }}>{globeTooltip.name}</span>
            </div>
            {detail ? (
              <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: accentColor, lineHeight: 1.1 }}>{detail.achieved}</div>
                  <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>Achieved</div>
                </div>
                {detail.expected && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.45)", lineHeight: 1.1 }}>{detail.expected}</div>
                    <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>Expected</div>
                  </div>
                )}
              </div>
            ) : globeTooltip.note ? (
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{globeTooltip.note}</p>
            ) : null}
            <p style={{ margin: 0, fontSize: 10.5, color: accentColor, opacity: 0.7, letterSpacing: "0.02em" }}>
              Click to view map →
            </p>
          </div>
        );
      })()}

      {regenerateConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setRegenerateConfirm(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-[440px] max-w-[calc(100vw-32px)] mx-4 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "card-enter 200ms ease-out both" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <IconAlertTriangle size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-gray-900">
                  Replace existing {regenerateConfirm}?
                </h3>
                <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed">
                  This conversation already has {regenerateConfirm === "infographic" ? "an" : "a"} {regenerateConfirm}.
                  Regenerating will overwrite the existing version — it can&rsquo;t be recovered afterwards.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => setRegenerateConfirm(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegenerate}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
