
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { Node } from "reactflow";
import CanvasLoader from "./CanvasLoader";
import FloatingTitle from "./FloatingTitle";
import CanvasNavPane from "./CanvasNavPane";
import FloatingActions from "./FloatingActions";
import FloatingControls from "./FloatingControls";
import RightNavDots from "./RightNavDots";
import PromptBar, { PROMPT_BOTTOM, PILLS_GAP_BOTTOM, PILLS_GAP_TOP, PILLS_H } from "./PromptBar";
import PlayModeCard from "./PlayModeCard";
import AIChatPanel from "./AIChatPanel";
import { USER_MESSAGE, TYPING_MESSAGE, AI_MESSAGE, GREETING_MESSAGE, OUTCOME_AREAS_MESSAGE, DATA_CARDS_MESSAGE, CONNECTOR_MESSAGE, CONNECTOR_CONFIRMED_AI_MESSAGE, IDA_CONNECTOR_MESSAGE, IDA_AI_MESSAGE, IDA_DATA_CARDS_MESSAGE } from "@/data/mockInteraction";
import type { Message } from "@/data/mockInteraction";

const CARD_NAME_MAP: Record<string, string> = {
  "card-overview": "Overview",
  "card-narrative": "AI Narrative Assistant",
  "card-news": "News",
  "outcome-1": "Protection of the Poorest",
  "outcome-2": "No Learning Poverty",
  "outcome-3": "Healthier Lives",
  "outcome-4": "Climate / Green Planet",
  "outcome-5": "Digital / Financial Services",
  "data-social-protection": "Social Protection Coverage",
  "data-financial-accounts": "Financial Account Ownership",
  "data-safety-net": "Safety Net Programs",
  "data-financial-services": "Financial Services",
  "data-gender-equality": "Gender Equality",
  "data-private-capital": "Private Capital",
  "ida-section-context":         "The Challenge",
  "ida-section-intervention":    "Pathways to Outcomes (IDA projects)",
  "ida-section-evidence":        "Country Examples",
  "ida-section-impact":          "Lessons Learned",
};

// Outcome area cards — placed in a column to the right of the OverviewCard (x:80, w:1200)
const OUTCOME_X = 1360;
// Data drill-down cards — placed to the right of the outcome column
const DATA_CARD_X = 1860;

const DATA_CARDS = [
  {
    id: "data-social-protection",
    chartType: "socialProtection",
    title: "Percentage of people covered by social protection and labor programs in the total population and in the poorest quintile",
    description: "People covered by social protection and labor programs (SPL) refers to members of a household where at least one member received benefits. SPL includes social assistance, social insurance, and labor market programs.",
    category: "Protection for the Poorest",
    y: 40,
  },
  {
    id: "data-financial-accounts",
    chartType: "financialAccounts",
    title: "Population that own a financial account, total (% population ages 15+) and female (% female population ages 15+)",
    description: "Percentage of population that own a financial account. For women, the share is relative to total female population.",
    category: "Gender Equality",
    y: 784,
  },
  {
    id: "data-safety-net",
    chartType: "safetyNet",
    title: "Beneficiaries of social safety net programs",
    description: "The number of people benefiting from safety net programs supported by World Bank operations, including cash-based interventions, public works and workfare programs, fee waivers, and in-kind assistance.",
    category: "Protection for the Poorest",
    portfolioText: "More than <strong>230</strong> projects in <strong>91</strong> countries/economies",
    y: 1528,
  },
  {
    id: "data-financial-services",
    chartType: "financialServices",
    title: "People and businesses using financial services, including the number of women",
    description: "Financial services include transaction accounts, deposit accounts, mobile money accounts, savings, loans, insurance, pensions, factoring, leasing, and investment products.",
    category: "Protection for the Poorest",
    portfolioText: "More than <strong>210</strong> projects in <strong>88</strong> countries/economies",
    y: 2272,
  },
  {
    id: "data-gender-equality",
    chartType: "genderEquality",
    title: "People benefiting from actions to advance gender equality, and the number benefitting from actions that expand and enable economic opportunities",
    description: "Gender equality outcomes include ending gender-based violence, building and protecting human capital, accessing more and better jobs, expanding ownership and use of assets, expanding access and use of services that enable economic participation and advancing women's leadership.",
    category: "Gender Equality",
    portfolioText: "More than <strong>830</strong> projects in <strong>121</strong> countries/economies",
    y: 3016,
  },
  {
    id: "data-private-capital",
    chartType: "privateCapital",
    title: "Total private capital enabled",
    description: "Value of private investments resulting from WBG programs expected to materialize within three years of a project's closure.",
    category: "More Private Investments",
    portfolioText: "More than <strong>150</strong> projects in <strong>100</strong> countries/economies",
    y: 3760,
  },
];

// bodyMinHeight pre-reserves the paragraph height so the card doesn't grow during
// streaming and overlap the card below. Uses ceil(chars / 40) * 24px (conservative:
// 40 chars/line at 16px Open Sans across 361px text width).
// Card total height = 209 + titleLines*28 + bodyMinHeight (includes nav buttons row).
// Y positions = y_prev + cardHeight + 60px gap.
const OUTCOME_DATA = [
  {
    id: "outcome-1",
    title: "Protection for Poorest\n(Financial Inclusion / Social Protection)",
    body: "Mexico has the widest financial inclusion gap in the peer group, with only 53% of adults owning a financial account against Chile's 85% and Brazil's 86%. The gender gap is acute — female ownership sits at 47%, nearly 36 points below Chile. On social protection, Mexico covers just 48% of its total population and 54% of its poorest quintile, compared to 96% in both Chile and Peru. Despite the scale of these gaps, the WB portfolio in Mexico records zero contribution to social safety net outcomes and zero results on financial services — the sole active vehicle, the Mexico DPF (P503988), shows no achieved values on any related indicator. This is the highest-priority gap both structurally and in terms of portfolio absence.",
    bodyMinHeight: 432, // 18 lines × 24px
    y: 40,             // card height ≈ 756px (182+56+432+86nav)
    navLabels: {
      left:  "Back to scorecard overview",
      down:  "Why is learning poverty so high?",
      right: "Unpack Mexico's DPF results",
    },
  },
  {
    id: "outcome-2",
    title: "No Learning Poverty",
    body: "Mexico's learning poverty rate of 47.6% places nearly half of all primary-age children below reading proficiency — a 20-point gap to Chile (27.2%) and 5 points worse than the peer average of 42.5%. Given Mexico's population of ~130 million, this translates into the largest absolute number of affected children among all comparators. The data is from 2019 and may understate post-pandemic deterioration. Critically, the WB has no active operations in Mexico contributing to this outcome area — zero projects, zero students supported — while Brazil alone has 6 education projects with 48 million students in scope.",
    bodyMinHeight: 384, // 16 lines × 24px
    y: 854,            // 40 + 782 + 32 gap (782 = 756 + 26 connector chip footer wrap)
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "Financial inclusion & social protection",
      down:  "How does Mexico's health coverage compare?",
      right: "See how Brazil's education portfolio scales",
    },
  },
  {
    id: "outcome-3",
    title: "Healthier Lives (UHC + Stunting)",
    body: "Mexico's UHC Service Coverage Index of 75 sits 7 points below Chile and 5 points below both Brazil and Colombia, placing it near the bottom of the peer group. More starkly, Mexico's child stunting rate of 13.1% is the highest in the group by a significant margin — more than 11 points above Chile (1.7%) and 4 points above Brazil (8.9%) — a figure that is anomalous for an upper-middle-income country. As with education, the WB holds no active operations contributing to health outcomes in Mexico under FY25 Scorecard reporting, while Colombia's 2 health projects are delivering results to over 760,000 people. The combination of a weak UHC index, high stunting, and zero portfolio engagement makes this a significant gap.",
    bodyMinHeight: 432, // 18 lines × 24px
    y: 1626,           // 854 + 740 + 32 gap (740 = 714 + 26)
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "Learning poverty & education gap",
      down:  "Is Mexico's climate portfolio heading the right way?",
      right: "Break down stunting by region",
    },
  },
  {
    id: "outcome-4",
    title: "Climate / Green Planet\n(GHG + Protected Areas)",
    body: "Mexico's protected area coverage of 19.9% lags Chile (37.9%), Brazil (29.4%), and Colombia (26.4%), though Peru (16.8%) is lower. The more acute concern is the direction of Mexico's climate portfolio: Mexico is the only country in the peer group with a net emissions-increasing portfolio expectation (+19 MtCO2eq/year), driven by a single large project — Water Security for the Valley of Mexico — which offsets reductions from forestry and energy efficiency operations. All peers show net reductions, with Brazil at −323 MtCO2eq/year across 19 projects. On the positive side, Mexico's terrestrial conservation results are among the strongest delivered in the portfolio, with three projects meeting or exceeding targets. The critical gap is on renewable energy: Mexico has zero operations in this space while Brazil, Chile, and Peru all have active projects.",
    bodyMinHeight: 480, // 20 lines × 24px
    y: 2446,           // 1626 + 788 + 32 gap (788 = 762 + 26)
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "UHC, stunting & health outcomes",
      down:  "What's driving the digital exclusion gap?",
      right: "Map the renewable energy gap",
    },
  },
  {
    id: "outcome-5",
    title: "Digital / Financial Services",
    body: "Mexico's internet penetration of 81.2% is below Chile (94.5%) but broadly comparable to Brazil and Peru, suggesting digital infrastructure is not the binding constraint. The more significant finding is the disconnect between relatively high connectivity and very low financial account ownership (53%) — a 28-point gap — which points to barriers of product design, trust, or formal sector access rather than infrastructure. The WB portfolio has no active operations contributing to digital services or broadband outcomes in Mexico, while Brazil and Peru both have projects in scope. The Mexico DPF nominally covers financial services but has recorded no results to date.",
    bodyMinHeight: 384, // 16 lines × 24px
    y: 3342,           // 2446 + 864 + 32 gap (864 = 838 + 26)
    navLabels: {
      left:  "Back to scorecard overview",
      up:    "Climate portfolio & protected areas",
      right: "Map digital wallet adoption by state",
    },
  },
];

interface Props {
  empty?: boolean;
  prebuilt?: boolean;
  mode?: "edit" | "view";
}

function buildAllNodes(onShowOutcomeAreas: () => void, onShowDataCards?: () => void, onNavClick?: (label: string) => void): Node[] {
  const overviewNode: Node = {
    id: "card-overview", type: "overview", position: { x: 80, y: 40 },
    data: { onShowOutcomeAreas, connector: "WBG Scorecard" }, draggable: true, selectable: true,
  };
  const narrativeNode: Node = {
    id: "card-narrative", type: "narrative", position: { x: 80, y: 760 },
    data: { connector: "WBG Scorecard" }, draggable: true, selectable: true,
  };
  const newsNode: Node = {
    id: "card-news", type: "news", position: { x: 540, y: 760 },
    data: { connector: "WB Operations Portal" }, draggable: true, selectable: true,
  };
  const outcomeNodes: Node[] = OUTCOME_DATA.map((item, i) => ({
    id: item.id,
    type: "outcomeArea",
    position: { x: OUTCOME_X, y: item.y },
    data: {
      title: item.title,
      body: item.body,
      bodyMinHeight: item.bodyMinHeight,
      streamDelay: 0,
      index: i,
      totalCards: OUTCOME_DATA.length,
      navLabels: item.navLabels,
      onNavClick,
      connector: "WBG Scorecard",
      ...(item.id === "outcome-1" ? { onNavDown: onShowDataCards } : {}),
    },
    draggable: true,
    selectable: true,
  }));
  return [overviewNode, narrativeNode, newsNode, ...outcomeNodes];
}

export default function WorkspaceShell({ empty = false, prebuilt = false, mode = "edit" }: Props) {
  const [chatOpen, setChatOpen] = useState(empty);
  const [workspaceTitle, setWorkspaceTitle] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>(
    empty ? [GREETING_MESSAGE] : prebuilt ? [USER_MESSAGE, AI_MESSAGE] : []
  );
  const [canvasNodes, setCanvasNodes] = useState<Node[]>([]);
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const [canvasLoading, setCanvasLoading] = useState(false);
  const [promptBarHeight, setPromptBarHeight] = useState(56); // single-line default
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [confirmedConnectorIds, setConfirmedConnectorIds] = useState<Set<string> | undefined>(undefined);
  const [focusTarget, setFocusTarget] = useState<{ id: string; seq: number } | null>(null);
  const [activeNavNodeId, setActiveNavNodeId] = useState<string | null>(null);
  const [outcomeCardsShown, setOutcomeCardsShown] = useState(prebuilt);
  const [dataCardsShown, setDataCardsShown] = useState(prebuilt);
  const orderedNodes = useMemo(
    () => [...canvasNodes].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x),
    [canvasNodes]
  );

  // Play sequence: narrative first, news excluded
  const playOrderedNodes = useMemo(() => {
    const withoutNews = orderedNodes.filter((n) => n.type !== "news");
    const narrativeIdx = withoutNews.findIndex((n) => n.type === "narrative");
    if (narrativeIdx <= 0) return withoutNews;
    const narrative = withoutNews[narrativeIdx];
    return [narrative, ...withoutNews.filter((_, i) => i !== narrativeIdx)];
  }, [orderedNodes]);

  const [panMode, setPanMode] = useState(false);
  const [playActive, setPlayActive] = useState(mode === "view");

  // Inject viewMode into node data; draggability is controlled via nodesDraggable prop
  const processedNodes = useMemo(
    () =>
      canvasNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          ...(mode === "view" ? { viewMode: true } : {}),
        },
      })),
    [canvasNodes, mode]
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleAdvance = () => {
    if (currentCardIndex < playOrderedNodes.length - 1) {
      setCurrentCardIndex((i) => i + 1);
    } else {
      setPlayActive(false);
      setCurrentCardIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((i) => i - 1);
    }
  };

  // submissionPhase: 0=awaiting prompt, 1=awaiting connector confirm, 2=board created (card chat), 3=done
  const submissionPhase = useRef<number>(prebuilt ? 2 : 0);
  const flowTypeRef = useRef<'cpf-mexico' | 'ida-social-protection'>('cpf-mexico');
  const [canvasFlowType, setCanvasFlowType] = useState<'cpf-mexico' | 'ida-social-protection'>('cpf-mexico');

  const handleCardSelect = (nodeId: string | null) => {
    setSelectedCard(nodeId ? (CARD_NAME_MAP[nodeId] ?? null) : null);
  };

  const handleShowOutcomeAreas = useCallback((label?: string) => {
    setOutcomeCardsShown(true);
    setChatOpen(true);
    setMessages((m) => {
      const withUser = label
        ? [...m, { id: `msg-nav-${Date.now()}`, role: "user" as const, content: label, timestamp: "Just now" }]
        : m;
      return [...withUser, TYPING_MESSAGE];
    });
    setTimeout(() => {
      setMessages((m) => [...m.filter((msg) => msg.role !== "typing"), { ...OUTCOME_AREAS_MESSAGE, id: `msg-outcome-areas-${Date.now()}` }]);
    }, 1800);
  }, []);

  const handleShowDataCards = useCallback((label?: string) => {
    setDataCardsShown(true);
    setChatOpen(true);
    setMessages((m) => {
      const withUser = label
        ? [...m, { id: `msg-nav-${Date.now()}`, role: "user" as const, content: label, timestamp: "Just now" }]
        : m;
      return [...withUser, TYPING_MESSAGE];
    });
    setTimeout(() => {
      setMessages((m) => [...m.filter((msg) => msg.role !== "typing"), { ...DATA_CARDS_MESSAGE, id: `msg-data-cards-${Date.now()}` }]);
    }, 1800);
  }, []);

  const handleNavClick = useCallback((label: string) => {
    setChatOpen(true);
    const userMsg: Message = {
      id: `msg-nav-${Date.now()}`,
      role: "user",
      content: label,
      timestamp: "Just now",
    };
    setMessages((m) => [...m, userMsg]);
  }, []);
  const handleNavClickRef = useRef(handleNavClick);
  handleNavClickRef.current = handleNavClick;

  // Seed all nodes immediately when prebuilt
  useEffect(() => {
    if (!prebuilt) return;
    setCanvasNodes(buildAllNodes(handleShowOutcomeAreas, handleShowDataCards, handleNavClickRef.current));
    setFitViewTrigger((t) => t + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prebuilt]);

  // Add outcome area nodes when triggered
  useEffect(() => {
    if (!outcomeCardsShown) return;
    const outcomeNodes: Node[] = OUTCOME_DATA.map((item, i) => ({
      id: item.id,
      type: "outcomeArea",
      position: { x: OUTCOME_X, y: item.y },
      data: {
        title: item.title,
        body: item.body,
        bodyMinHeight: item.bodyMinHeight,
        streamDelay: i * 300,
        index: i,
        totalCards: OUTCOME_DATA.length,
        navLabels: item.navLabels,
        onNavClick: handleNavClickRef.current,
        connector: "WBG Scorecard",
        // Wire "down" nav on outcome-1 (Protection for Poorest) to reveal data cards
        ...(item.id === "outcome-1" ? { onNavDown: handleShowDataCards } : {}),
      },
      draggable: true,
      selectable: true,
    }));
    setCanvasNodes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNodes = outcomeNodes.filter((n) => !existingIds.has(n.id));
      return newNodes.length > 0 ? [...prev, ...newNodes] : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcomeCardsShown, handleShowDataCards]);

  // Add data drill-down cards when triggered
  useEffect(() => {
    if (!dataCardsShown) return;
    const dataNodes: Node[] = DATA_CARDS.map((card) => ({
      id: card.id,
      type: "dataCard",
      position: { x: DATA_CARD_X, y: card.y },
      data: {
        title: card.title,
        description: card.description,
        category: card.category,
        chartType: card.chartType,
        portfolioText: card.portfolioText,
        connector: "WBG Scorecard",
      },
      draggable: true,
      selectable: true,
    }));
    setCanvasNodes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNodes = dataNodes.filter((n) => !existingIds.has(n.id));
      return newNodes.length > 0 ? [...prev, ...newNodes] : prev;
    });
  }, [dataCardsShown]);

  // chatBottom = PROMPT_BOTTOM + promptBarHeight + PILLS_GAP_BOTTOM + PILLS_H + PILLS_GAP_TOP
  // Asymmetric gaps: bottom gap is larger to visually clear the prompt bar shadow.
  const chatBottom = PROMPT_BOTTOM + promptBarHeight + PILLS_GAP_BOTTOM + PILLS_H + PILLS_GAP_TOP + (selectedCard ? 48 : 0);

  // Phase 1: "Confirm connectors" button — triggers reasoning + canvas build
  const handleAction = (label: string) => {
    if (submissionPhase.current === 1 && label === "Confirm connectors") {
      submissionPhase.current = 2;

      const confirmMsg: Message = {
        id: `msg-confirm-${Date.now()}`,
        role: "user",
        content: "Confirm connectors",
        timestamp: "Just now",
      };
      setMessages((m) => [...m, confirmMsg, TYPING_MESSAGE]);
      setCanvasLoading(true);

      if (flowTypeRef.current === 'ida-social-protection') {
        const sectionNodes: Node[] = [
          {
            id: "ida-section-context", type: "idaCard",
            position: { x: 80, y: 40 }, draggable: true, selectable: true,
            data: {
              title: "The Challenge",
              stats: [{ value: "79.6%", label: "W&C Africa learning poverty" }, { value: "90.3%", label: "FCS contexts globally" }],
              body: "Sub-Saharan Africa is home to the world's deepest learning crisis. In Western and Central Africa, 79.6% of children cannot read by end of primary school age. In fragile and conflict-affected states globally, learning poverty reaches 90.3% — a threshold that defines much of Sub-Saharan Africa, where 7 of the 10 highest-burden FCS countries are IDA-eligible. A critical systemic barrier is the absence of reliable education data — without functioning EMIS and accountable governance structures, policymakers cannot identify where children are falling behind or direct resources effectively. Data from 2019, the most recent available.",
              sourcesCount: 3, cta: "Pull country-level breakdown", connector: "IDA",
            },
          },
          {
            id: "ida-section-intervention", type: "idaCard",
            position: { x: 551, y: 40 }, draggable: true, selectable: true,
            data: {
              title: "Pathways to Outcomes",
              stats: [{ value: "$29.2B", label: "committed across SSA" }, { value: "150", label: "IDA education projects" }],
              body: "IDA's response targets the governance and data systems that underpin education quality. Three interlocking mechanisms are deployed across the portfolio:",
              listItems: [
                "Modernised EMIS enabling real-time data flows from schools to policymakers",
                "Direct school grants tied to evidence-based School Improvement Plans",
                "Performance-based conditions incentivising systemic reform at national level",
              ],
              sourcesCount: 3, cta: "Show me how each individual outcome areas are derived", connector: "IDA",
            },
          },
          {
            id: "ida-section-evidence", type: "idaCard",
            position: { x: 1022, y: 40 }, draggable: true, selectable: true,
            data: {
              title: "Country Examples",
              stats: [{ value: "42M", label: "students reached · SSA" }, { value: "60%", label: "of portfolio target" }],
              progressItems: [
                { label: "Achieved vs target", displayValue: "42M / 70.6M", pct: 60 },
                { label: "Kenya PEELP", displayValue: "7.6M / 8M", note: "96%", pct: 95 },
                { label: "Ethiopia GEQIP-E", displayValue: "18M students", pct: 75 },
                { label: "Tanzania HEET", displayValue: "224K / 100K", note: "exceeded", pct: 100, exceeded: true },
              ],
              sourcesCount: 3, cta: "Find actual vs achieved by region", connector: "IDA",
            },
          },
          {
            id: "ida-section-impact", type: "idaCard",
            position: { x: 1493, y: 40 }, draggable: true, selectable: true,
            data: {
              title: "Lessons Learned",
              stats: [{ value: "53.6%", label: "global learning poverty" }, { value: "#1", label: "SSA highest-burden region" }],
              body: "Where IDA has strengthened governance systems, results follow at scale. The pathway is clear:",
              showFlow: true,
              bodyAfter: "SSA's trajectory depends on sustained system-level reform. IDA's portfolio is building the institutional infrastructure that will convert future financing into lasting results — not for one cohort, but for the generation entering school today.",
              sourcesCount: 1, cta: "Link to IDA21 vision indicators", connector: "IDA",
            },
          },
        ];

        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setCanvasNodes(sectionNodes.slice(0, 1)), 2300));
        timers.push(setTimeout(() => setCanvasNodes(sectionNodes.slice(0, 2)), 2600));
        timers.push(setTimeout(() => setCanvasNodes(sectionNodes.slice(0, 3)), 2900));
        timers.push(setTimeout(() => setCanvasNodes(sectionNodes),             3100));
        timers.push(setTimeout(() => { setFitViewTrigger((t) => t + 1); setCanvasLoading(false); }, 3400));
        timers.push(setTimeout(() => {
          setMessages((m) => [...m.filter((msg) => msg.role !== "typing"), IDA_AI_MESSAGE]);
        }, 4000));

        return () => timers.forEach(clearTimeout);
      }

      // CPF Mexico flow
      const overviewNode: Node = {
        id: "card-overview", type: "overview", position: { x: 80, y: 40 },
        data: { onShowOutcomeAreas: handleShowOutcomeAreas, connector: "WBG Scorecard" }, draggable: true, selectable: true,
      };
      const narrativeNode: Node = {
        id: "card-narrative", type: "narrative", position: { x: 80, y: 760 },
        data: { connector: "WBG Scorecard" }, draggable: true, selectable: true,
      };
      const newsNode: Node = {
        id: "card-news", type: "news", position: { x: 540, y: 760 },
        data: { connector: "WB Operations Portal" }, draggable: true, selectable: true,
      };

      const timers: ReturnType<typeof setTimeout>[] = [];
      timers.push(setTimeout(() => setCanvasNodes([overviewNode]),                           2300));
      timers.push(setTimeout(() => setCanvasNodes([overviewNode, narrativeNode]),            2600));
      timers.push(setTimeout(() => setCanvasNodes([overviewNode, narrativeNode, newsNode]),  2900));
      timers.push(setTimeout(() => { setFitViewTrigger((t) => t + 1); setCanvasLoading(false); }, 3200));
      timers.push(setTimeout(() => {
        setMessages((m) => [...m.filter((msg) => msg.role !== "typing"), AI_MESSAGE]);
      }, 3800));

      return () => timers.forEach(clearTimeout);
    }
  };

  const handleUserSubmit = (text: string) => {
    // Phase 0: First submission — show user prompt + ask for connectors
    if (submissionPhase.current === 0) {
      submissionPhase.current = 1;

      // Detect flow type from input text
      const isCPFMexico = /cpf\s*for\s*mexico/i.test(text) || /operations\s+officer.*cpf/i.test(text);
      const isIDA = /\bida\b/i.test(text);
      flowTypeRef.current = isCPFMexico ? 'cpf-mexico' : isIDA ? 'ida-social-protection' : 'cpf-mexico';
      setCanvasFlowType(flowTypeRef.current);

      // Summarise title
      const summary = (() => {
        if (flowTypeRef.current === 'ida-social-protection') {
          return "IDA Social Protection Impact";
        }
        const cpfMatch = text.match(/CPF\s+for\s+(\w+)/i);
        const fyMatch = text.match(/FY\s*(\d{2,4})/i);
        if (cpfMatch) {
          const country = cpfMatch[1];
          const fy = fyMatch ? ` FY${fyMatch[1]}` : "";
          return `CPF for ${country}${fy}`;
        }
        const stripped = text.replace(/^(i (am|want|need|would like|'m)|please|can you|could you)\s+/i, "");
        const words = stripped.trim().split(/\s+/);
        const short = words.slice(0, 7).join(" ");
        return (short.length < stripped.length ? short + "…" : short)
          .replace(/^./, (c) => c.toUpperCase());
      })();
      setWorkspaceTitle(summary);

      const connectorMsg = flowTypeRef.current === 'ida-social-protection' ? IDA_CONNECTOR_MESSAGE : CONNECTOR_MESSAGE;
      const userMsg: Message = { ...USER_MESSAGE, content: text };
      setChatOpen(true);
      setMessages([userMsg, connectorMsg]);
      return;
    }

    // Phase 2: Card-chat submission — show data cards + AI narrative
    if (submissionPhase.current === 2) {
      submissionPhase.current = 3;

      const userMsg: Message = {
        id: `msg-user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: "Just now",
      };
      setSelectedCard(null);
      setMessages((m) => [...m, userMsg, TYPING_MESSAGE]);

      const timers: ReturnType<typeof setTimeout>[] = [];

      if (flowTypeRef.current === 'ida-social-protection') {
        timers.push(setTimeout(() => {
          setMessages((m) => [...m.filter((msg) => msg.role !== "typing"), { ...IDA_DATA_CARDS_MESSAGE, id: `msg-ida-data-${Date.now()}` }]);
        }, 1200));
      } else {
        timers.push(setTimeout(() => {
          setDataCardsShown(true);
        }, 1200));
        timers.push(setTimeout(() => {
          setMessages((m) => [...m.filter((msg) => msg.role !== "typing"), { ...DATA_CARDS_MESSAGE, id: `msg-data-cards-${Date.now()}` }]);
        }, 2000));
      }

      return () => timers.forEach(clearTimeout);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        fontFamily: "'Open Sans', sans-serif",
        background: "#FFFFFF",
      }}
    >
      <CanvasLoader nodes={processedNodes} orderedNodes={orderedNodes} playActive={playActive} fitViewTrigger={fitViewTrigger} focusTarget={focusTarget} loading={canvasLoading} nodesDraggable={!panMode} onCardSelect={handleCardSelect} onNodesDelete={(ids) => setCanvasNodes((prev) => prev.filter((n) => !ids.includes(n.id)))} />
      {!playActive && <FloatingTitle mode={mode} initialTitle={empty ? "" : undefined} titleOverride={workspaceTitle} />}
      {!playActive && <CanvasNavPane nodes={orderedNodes} activeNodeId={activeNavNodeId} onFocus={(id) => { setActiveNavNodeId(id); setFocusTarget((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 })); }} />}
      {!playActive && <FloatingActions mode={mode} onPlay={() => { setPlayActive(true); setCurrentCardIndex(0); }} />}
      {!playActive && <FloatingControls mode={mode} onModeChange={(m) => setPanMode(m === "pan")} />}
      {!playActive && <RightNavDots />}
      {!playActive && <PromptBar mode={mode} onSubmit={handleUserSubmit} onHeightChange={setPromptBarHeight} selectedCard={selectedCard} onClearSelection={() => setSelectedCard(null)} confirmedConnectorIds={confirmedConnectorIds} />}
      {!playActive && <AIChatPanel open={chatOpen} messages={messages} chatBottom={chatBottom} onAction={handleAction} onConfirmConnectors={setConfirmedConnectorIds} />}


      {/* Play mode HUD */}
      {playActive && (
        <>
          {/* Backdrop */}
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 45 }} />

          {/* Spotlight card */}
          {playOrderedNodes[currentCardIndex] && (
            <PlayModeCard
              node={playOrderedNodes[currentCardIndex]}
              index={currentCardIndex}
              total={playOrderedNodes.length}
              onAdvance={handleAdvance}
              onPrev={handlePrev}
            />
          )}

          {/* HUD */}
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50, display: "flex", alignItems: "center", gap: 12, background: "white", border: "1px solid #e5e5e5", borderRadius: 16, boxShadow: "0px 2px 4px 0px rgba(12,35,60,0.08)", padding: "8px 16px", height: 64 }}>
            <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 13, color: "#616161" }}>
              {currentCardIndex + 1} / {playOrderedNodes.length || 1}
            </span>
            <button
              onClick={() => setPlayActive(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, border: "none", background: "transparent", cursor: "pointer", fontFamily: "'Open Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#616161" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              ✕ End
            </button>
          </div>
        </>
      )}
    </div>
  );
}
