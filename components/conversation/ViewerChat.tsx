
import { useEffect, useRef, useState } from "react";
import {
  IconArrowUp,
  IconMicrophone,
  IconPlus,
  IconUser,
  IconNotebook,
} from "@tabler/icons-react";

interface Props {
  prompt: string;
  onOpenNarrative?: () => void;
}

// ─── Flow detection ─────────────────────────────────────────────────────────

type FlowId = "africa-poverty" | "health-gap";
function detectFlow(p: string): FlowId {
  const t = p.toLowerCase();
  if (
    t.includes("health services target") ||
    t.includes("health & nutrition") ||
    t.includes("global") ||
    t.includes("countries")
  ) return "health-gap";
  return "africa-poverty";
}

// ─── Welcome + suggestions ──────────────────────────────────────────────────

interface WelcomeContent {
  summary: string;
  suggested: string[];
}

const WELCOME: Record<FlowId, WelcomeContent> = {
  "africa-poverty": {
    summary:
      "Quick recap — IDA reached 939M direct beneficiaries across People-pillar programs in FY25. Infrastructure (41%) and Planet (45%) are the verticals lagging the pipeline most.",
    suggested: [
      "What's behind this data?",
      "Why is Infrastructure lagging?",
      "Which countries drove the 244M number?",
    ],
  },
  "health-gap": {
    summary:
      "Quick recap — five IDA-FCS countries (Yemen, Sudan, Afghanistan, South Sudan, Myanmar) account for ~37% of the FY25 HNP shortfall. Workforce + supply chain dominate the driver decomposition.",
    suggested: [
      "What's behind this data?",
      "Why is Yemen the worst performer?",
      "How does this compare to FY24?",
    ],
  },
};

// ─── Data-context response ──────────────────────────────────────────────────

interface DataContextContent {
  intro: string;
  filterLabel: string;
  filters: string[];
  followUp: string;
}

const DATA_CONTEXT: Record<FlowId, DataContextContent> = {
  "africa-poverty": {
    intro:
      "Sure — figures are from the active FY2025 portfolio (end-June 2025). Aggregates pulled from IDA Results data (WBG global, June 2025 cut-off), joined with Client Context indicators for the geographic lens.",
    filterLabel: "Filter by theme:",
    filters: ["People", "Prosperity", "Planet", "Infrastructure", "Digital"],
    followUp: "Do you want to build a narrative from this infographic?",
  },
  "health-gap": {
    intro:
      "Sure — figures are from the active FY2025 health portfolio (end-June 2025). Pulled from Health Services results · project-level data (FY2025, FCS countries), then ranked countries by achievement ratio.",
    filterLabel: "Filter by status:",
    filters: ["All countries", "FCS", "Behind target"],
    followUp: "Do you want to build a narrative from this infographic?",
  },
};

// ─── Conversation turn shape ────────────────────────────────────────────────

type Turn =
  | { key: string; role: "user"; type: "text"; text: string }
  | { key: string; role: "ai";   type: "text"; text: string }
  | { key: string; role: "ai";   type: "data-context" }
  | { key: string; role: "ai";   type: "thinking" }
  | { key: string; role: "ai";   type: "narrative-card" };

const isWhatsBehindQuestion = (text: string) => {
  const t = text.toLowerCase();
  return (
    t.includes("behind this data") ||
    t.includes("what's behind") ||
    t.includes("whats behind") ||
    t.includes("what data")
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ViewerChat({ prompt, onOpenNarrative }: Props) {
  const flow = detectFlow(prompt);
  const w = WELCOME[flow];
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [showBuildChip, setShowBuildChip] = useState(false);
  const idRef = useRef(0);
  const newKey = () => `t-${++idRef.current}`;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const send = (text: string) => {
    const v = text.trim();
    if (!v) return;
    setTurns((prev) => [...prev, { key: newKey(), role: "user", type: "text", text: v }]);
    setDraft("");
    // Hide the build chip if the user sends a regular message
    setShowBuildChip(false);

    window.setTimeout(() => {
      if (isWhatsBehindQuestion(v)) {
        setTurns((prev) => [...prev, { key: newKey(), role: "ai", type: "data-context" }]);
        setShowBuildChip(true);
      } else {
        setTurns((prev) => [...prev, {
          key: newKey(),
          role: "ai",
          type: "text",
          text: "Good question. To dig into the underlying data, ask 'What's behind this data?' — I'll walk you through what drove this infographic.",
        }]);
      }
    }, 500);
  };

  const sendYes = () => {
    setShowBuildChip(false);
    const yesKey   = newKey();
    const thinkKey = newKey();
    setTurns((prev) => [
      ...prev,
      { key: yesKey,   role: "user", type: "text", text: "Yes" },
      { key: thinkKey, role: "ai",   type: "thinking" },
    ]);
    window.setTimeout(() => {
      setTurns((prev) =>
        prev.map((t) =>
          t.key === thinkKey
            ? { key: t.key, role: "ai", type: "narrative-card" }
            : t
        )
      );
    }, 2400);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-auto-hide">
        <div className="max-w-[680px] mx-auto px-6 py-6 flex flex-col gap-6">
          {/* AI welcome */}
          <AiRow>{w.summary}</AiRow>

          {/* Suggested follow-ups */}
          {turns.length === 0 && (
            <div className="flex flex-col gap-1.5 -mt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 pl-11">
                Suggested
              </span>
              {w.suggested.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="ml-11 self-start text-left px-3 py-1.5 rounded-full border border-gray-200 text-[12.5px] text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors max-w-[460px]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Live turns */}
          {turns.map((t) => {
            if (t.type === "text" && t.role === "user")
              return <UserBubble key={t.key} text={t.text} />;
            if (t.type === "text" && t.role === "ai")
              return <AiRow key={t.key}>{t.text}</AiRow>;
            if (t.type === "data-context")
              return <DataContextRow key={t.key} flow={flow} />;
            if (t.type === "thinking")
              return <ThinkingRow key={t.key} />;
            if (t.type === "narrative-card")
              return <NarrativeCardRow key={t.key} flow={flow} onOpen={onOpenNarrative} />;
            return null;
          })}
        </div>
      </div>

      {/* Build-narrative chip — sits above the input bar, right-aligned */}
      {showBuildChip && (
        <div className="shrink-0 px-6 pb-1 flex justify-end">
          <button
            onClick={sendYes}
            className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-colors"
          >
            Yes
          </button>
        </div>
      )}

      {/* Prompt bar — matches PromptBar pill styling */}
      <div className="shrink-0 px-6 py-4">
        <form
          onSubmit={(e) => { e.preventDefault(); send(draft); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 focus-within:border-blue-400 focus-within:shadow-md focus-within:ring-[3px] focus-within:ring-blue-50"
        >
          <IconPlus size={15} className="text-gray-400 shrink-0" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder="Ask a follow-up..."
            className="flex-1 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 outline-none min-w-0"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Voice input"
            >
              <IconMicrophone size={16} />
            </button>
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send"
              className="w-7 h-7 flex items-center justify-center rounded-full text-white transition-colors"
              style={{ background: draft.trim() ? "#111" : "#BDBDBD" }}
            >
              <IconArrowUp size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SCAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#0288D1] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
      SC
    </div>
  );
}

function AiRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <SCAvatar />
      <div className="flex-1 min-w-0 text-[13.5px] leading-relaxed text-gray-700 pt-0.5">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-blue-50 text-gray-900 rounded-2xl px-4 py-3 text-[14px] leading-relaxed max-w-[85%]">
        {text}
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
        <IconUser size={14} />
      </div>
    </div>
  );
}

function DataContextRow({ flow }: { flow: FlowId }) {
  const c = DATA_CONTEXT[flow];
  return (
    <div className="flex items-start gap-3">
      <SCAvatar />
      <div className="flex-1 min-w-0 flex flex-col gap-3 pt-0.5">
        <p className="text-[13.5px] leading-relaxed text-gray-700">{c.intro}</p>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            {c.filterLabel}
          </span>
          <div className="flex flex-wrap gap-1">
            {c.filters.map((f) => (
              <span
                key={f}
                className="px-2.5 py-0.5 rounded-full border border-gray-200 text-[12px] text-gray-700 bg-white"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[13.5px] leading-relaxed text-gray-700">{c.followUp}</p>
      </div>
    </div>
  );
}

const THINKING_STAGES = [
  "Pulling FY25 portfolio data",
  "Structuring analysis",
  "Drafting The Challenge · Pathways to Outcomes · Country Examples · Lessons Learned",
];

function ThinkingRow() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, THINKING_STAGES.length - 1));
    }, 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-start gap-3">
      <SCAvatar />
      <div className="flex-1 min-w-0 text-[13.5px] leading-relaxed text-gray-500 pt-0.5">
        {THINKING_STAGES[stage]}
        <span className="stream-cursor ml-0.5">·</span>
      </div>
    </div>
  );
}

function NarrativeCardRow({
  flow,
  onOpen,
}: {
  flow: FlowId;
  onOpen?: () => void;
}) {
  const subtitle =
    flow === "health-gap"
      ? "Health-services delivery gap"
      : "FY25 IDA cross-pillar analysis";
  return (
    <div
      className="flex items-start gap-3"
      style={{ animation: "card-enter 350ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      <SCAvatar />
      <div className="flex-1 min-w-0 max-w-[400px] pt-0.5">
        <p className="text-[13.5px] leading-relaxed text-gray-700 mb-3">
          Here&rsquo;s the narrative behind this infographic.
        </p>
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-3 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <IconNotebook size={14} className="text-blue-600" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 truncate">
                Structured analysis
              </div>
              <div className="text-[11px] text-gray-500 truncate">
                {subtitle} · 4 sections
              </div>
            </div>
          </div>
          <button
            onClick={onOpen}
            className="w-full px-3 py-2 rounded-lg text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
