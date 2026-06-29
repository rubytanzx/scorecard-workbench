
import { useState } from "react";
import {
  IconArrowUp,
  IconSparkles,
  IconUser,
  IconMap,
  IconChartBar,
  IconBulb,
} from "@tabler/icons-react";

interface Props {
  prompt: string;
}

// ─── Flow detection (mirrors NarrativePanel / InfographicPanel) ─────────

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

// ─── Per-flow welcome content ──────────────────────────────────────────────
// The AI greets a *fresh* viewer (different user from the original creator)
// and walks them through what they're looking at on the narrative pane.
// Three highlight rows act as a visual TOC; suggested questions seed the
// first few clicks.

interface IntroContent {
  greeting: string;
  body: string;
  highlights: { icon: typeof IconMap; label: string }[];
  suggested: string[];
}

const INTRO: Record<FlowId, IntroContent> = {
  "africa-poverty": {
    greeting: "Welcome — let me walk you through what you're looking at.",
    body:
      "On the right is the structured narrative behind IDA's FY25 cross-pillar delivery. The world map shows all 7 WBG regions, with Sub-Saharan Africa (AFE + AFW) as the focal scope. The four expandable sections — Context, Intervention, Evidence, Impact — step through how the 939M-beneficiary headline breaks down by pillar, country, and result type.",
    highlights: [
      { icon: IconMap,      label: "Map: 7 WBG regions, AFE + AFW in focus" },
      { icon: IconChartBar, label: "4 sections: Context → Intervention → Evidence → Impact" },
      { icon: IconBulb,     label: "Headline: People at 68% of plan, Infrastructure at 41%" },
    ],
    suggested: [
      "Why is Infrastructure lagging the most?",
      "Show me the Sub-Saharan Africa breakdown",
      "What's in the Evidence section?",
      "How does FY25 compare to FY24?",
    ],
  },
  "health-gap": {
    greeting: "Welcome — let me walk you through what you're looking at.",
    body:
      "On the right is the data behind the FY25 health-services delivery gap. The map flags the 5 conflict-affected IDA countries driving the shortfall (Yemen, Sudan, Afghanistan, South Sudan, Myanmar — spread across MENAAP, AFE, and EAP). The four expandable sections unpack the gap: Context shows UHC trends, Intervention is the project-type mix, Evidence is the bottom-5 country breakdown, and Impact decomposes the gap by driver.",
    highlights: [
      { icon: IconMap,      label: "Map: bottom-5 countries flagged across 3 regions" },
      { icon: IconChartBar, label: "4 sections: Context → Intervention → Evidence → Impact" },
      { icon: IconBulb,     label: "Drivers: 38% supply · 27% workforce · 18% access" },
    ],
    suggested: [
      "Why is Yemen the worst performer?",
      "What's the driver breakdown?",
      "How does this compare to FY24?",
      "Which IDA programs target the workforce gap?",
    ],
  },
};

interface Turn {
  role: "ai" | "user";
  text: string;
}

export default function DataIntroChat({ prompt }: Props) {
  const flow = detectFlow(prompt);
  const intro = INTRO[flow];
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const send = (text: string) => {
    const v = text.trim();
    if (!v) return;
    setTurns((prev) => [...prev, { role: "user", text: v }]);
    setDraft("");
    // Mock AI response that nudges the user toward the narrative panel —
    // keeps the chat feeling responsive without wiring a real backend.
    setTimeout(() => {
      setTurns((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "Great question. The supporting numbers live on the right — open the section that matches your question (Context, Intervention, Evidence, or Impact) to see the underlying data, or hover the map to filter by region.",
        },
      ]);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Conversation log */}
      <div className="flex-1 overflow-y-auto scrollbar-auto-hide">
        <div className="max-w-[680px] mx-auto px-6 py-8 pb-32 flex flex-col gap-6">
          {/* AI welcome — generous, framing-style intro */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0288D1] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              SC
            </div>
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900 leading-relaxed">
                {intro.greeting}
              </p>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                {intro.body}
              </p>

              {/* Visual TOC — points at what to expect on the right rail */}
              <ul className="flex flex-col gap-1.5 mt-1">
                {intro.highlights.map((h) => {
                  const Icon = h.icon;
                  return (
                    <li
                      key={h.label}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-px">
                        <Icon size={13} className="text-gray-600" />
                      </span>
                      <span className="text-[12.5px] text-gray-700 leading-snug pt-0.5">
                        {h.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Suggested first questions */}
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Try asking
                </span>
                <div className="flex flex-wrap gap-2">
                  {intro.suggested.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 text-[12.5px] text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live turns */}
          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="self-end flex items-center gap-3 max-w-[85%]">
                <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
                  {t.text}
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                  <IconUser size={14} />
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0288D1] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  SC
                </div>
                <div className="flex-1 text-[14px] text-gray-700 leading-relaxed">
                  {t.text}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Input — sticky at the bottom of the canvas, no top divider so it
          floats over the conversation flow rather than feeling docked. */}
      <div className="shrink-0 bg-white px-6 py-4">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus-within:border-gray-400 transition-colors">
            <IconSparkles size={15} className="text-blue-400 shrink-0" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Ask about this data..."
              className="flex-1 bg-transparent text-[13.5px] text-gray-900 placeholder-gray-400 focus:outline-none min-w-0"
            />
            <button
              onClick={() => send(draft)}
              disabled={!draft.trim()}
              aria-label="Send"
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                draft.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <IconArrowUp size={14} stroke={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
