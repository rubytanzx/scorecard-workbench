
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconCheck, IconChevronDown, IconArrowsMaximize } from "@tabler/icons-react";
import type { NarrativeBuilderResult } from "./NarrativeBuilderWizard";
import { challengeSets, getGapTips, type GapTip } from "@/lib/challengeData";

// ─── Shared primitives (mirrors NarrativeBuilderWizard) ───────────────────────
const F = "'Open Sans', sans-serif";

interface ThoughtStep { text: string; detail?: string; }

function WizardThoughtProcess({ steps, onComplete }: { steps: ThoughtStep[]; onComplete?: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startTime = useRef(Date.now());
  const done = visibleCount >= steps.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), 420);
    return () => clearTimeout(t);
  }, [visibleCount, done]);

  useEffect(() => {
    if (!done) return;
    setElapsedSec(Math.max(1, Math.round((Date.now() - startTime.current) / 1000)));
    const t = setTimeout(() => { setOpen(false); onCompleteRef.current?.(); }, 500);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <div className="narrative-content-enter" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        onClick={() => done && setOpen((v) => !v)}
        disabled={!done}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: done ? "pointer" : "default", padding: 0, width: "fit-content" }}
      >
        {done ? <IconCheck size={13} color="#34D399" /> : (
          <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.35)", display: "inline-block", animation: "nbDotPulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
            ))}
          </span>
        )}
        <span style={{ fontSize: 12.5, fontFamily: F, color: done ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.40)", fontStyle: done ? "normal" : "italic" }}>
          {done ? `Thought for ${elapsedSec}s` : "Thinking…"}
        </span>
        {done && <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><IconChevronDown size={13} color="rgba(255,255,255,0.35)" /></span>}
      </button>
      {open && (
        <div style={{ marginLeft: 4, paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.10)", display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", fontFamily: F, lineHeight: 1.5, opacity: i < visibleCount ? 1 : 0, transition: "opacity 0.3s ease" }}>
              {step.text}
              {step.detail && i < visibleCount && <span style={{ marginLeft: 6, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", fontSize: 10.5 }}>→ {step.detail}</span>}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes nbDotPulse { 0%,80%,100%{opacity:.25;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

function AiBlock({ children }: { children: React.ReactNode }) {
  return <div className="narrative-content-enter" style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>;
}

function AiText({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: "1.6", fontFamily: F, margin: 0 }}>{children}</p>;
}

function UserBubble({ text }: { text: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [radius, setRadius] = React.useState(9999);
  React.useLayoutEffect(() => {
    if (ref.current) setRadius(ref.current.offsetHeight > 44 ? 18 : 9999);
  }, [text]);
  return (
    <div className="self-end narrative-content-enter" style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: "72%" }}>
      <div ref={ref} style={{ background: "rgba(100,116,139,0.35)", borderRadius: radius, padding: "10px 16px", fontSize: 13.5, color: "rgba(226,232,240,0.95)", fontFamily: F, lineHeight: 1.5 }}>
        {text}
      </div>
    </div>
  );
}

// Small inline action chips — ghost pill style
function ActionChips({ options, onSelect, disabled }: {
  options: { id: string; label: string }[];
  onSelect: (id: string, label: string) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onSelect(o.id, o.label)}
          style={{
            padding: "5px 13px", borderRadius: 100, fontSize: 12.5, fontFamily: F,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.82)",
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.45 : 1,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "rgba(255,255,255,0.97)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.82)"; }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── 3-point length slider ────────────────────────────────────────────────────
const LENGTH_OPTIONS = [
  { label: "Short",    readTime: "~1.5 min read", desc: "Quick brief"       },
  { label: "Standard", readTime: "~2.5 min read", desc: "Recommended"       },
  { label: "In-depth", readTime: "~4 min read",   desc: "Full evidence"     },
];

function LengthSlider({ onSelect }: { onSelect: (label: string) => void }) {
  const [selected, setSelected] = useState(1); // default: Standard

  const handlePick = (i: number) => {
    setSelected(i);
    setTimeout(() => onSelect(LENGTH_OPTIONS[i].label), 280);
  };

  const pct = (selected / (LENGTH_OPTIONS.length - 1)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 4 }}>
      {/* Track */}
      <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "0 8px" }}>
        <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: "100%", background: "rgba(129,140,248,0.75)", borderRadius: 2, transition: "width 0.22s ease" }} />
        {LENGTH_OPTIONS.map((_, i) => {
          const pos = (i / (LENGTH_OPTIONS.length - 1)) * 100;
          const active = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handlePick(i)}
              style={{
                position: "absolute",
                left: `${pos}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: active ? 18 : 12,
                height: active ? 18 : 12,
                borderRadius: "50%",
                background: i <= selected ? "rgba(129,140,248,0.90)" : "rgba(255,255,255,0.18)",
                border: active ? "2px solid rgba(199,210,254,0.70)" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.18s ease",
                zIndex: 2,
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", margin: "0 0px" }}>
        {LENGTH_OPTIONS.map((opt, i) => {
          const active = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handlePick(i)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", textAlign: i === 0 ? "left" : i === LENGTH_OPTIONS.length - 1 ? "right" : "center", flex: 1 }}
            >
              <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.42)", fontFamily: F, transition: "color 0.18s" }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 11, color: active ? "rgba(199,210,254,0.70)" : "rgba(255,255,255,0.25)", fontFamily: F, marginTop: 2, transition: "color 0.18s" }}>
                {opt.readTime}
              </div>
              {active && (
                <div style={{ fontSize: 10, color: "rgba(129,140,248,0.65)", fontFamily: F, marginTop: 1, letterSpacing: "0.02em" }}>
                  {opt.desc}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Maps Authenticity Rubric dimension numbers → donor narrative section names
const DIM_SECTION_LABELS: Record<number, string> = {
  1: "Challenge",
  2: "Response",
  3: "Challenge",
  4: "Response",
  5: "Lessons Learned",
};

function NarrativeGuidanceWidget({
  tip, onDismiss, onAddToNarrative, buttonsHidden,
}: {
  tip: GapTip;
  onDismiss: (id: string) => void;
  onAddToNarrative: (tip: GapTip) => void;
  buttonsHidden?: boolean;
}) {
  const sectionLabel = DIM_SECTION_LABELS[tip.dimensionNum];
  return (
    <div className="narrative-content-enter" style={{
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(12, 20, 30, 0.72)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)",
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 11,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.28)", fontFamily: F, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Narrative Guidance
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(52,211,153,0.75)", fontFamily: F, letterSpacing: "0.02em" }}>
            {tip.dimensionLabel}
          </span>
          {sectionLabel && (
            <>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontFamily: F }}>→</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.38)", fontFamily: F, letterSpacing: "0.01em" }}>
                {sectionLabel}
              </span>
            </>
          )}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 13, fontFamily: F, lineHeight: 1.65, color: "rgba(255,255,255,0.75)" }}>
        {tip.tip}
      </p>
      {!buttonsHidden && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 2 }}>
          <button
            type="button"
            onClick={() => onDismiss(tip.id)}
            style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 500,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: F,
              transition: "background 120ms, color 120ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "rgba(255,255,255,0.80)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => onAddToNarrative(tip)}
            style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
              background: "#0288D1", border: "none", color: "#fff",
              cursor: "pointer", fontFamily: F,
            }}
          >
            Add to Narrative
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Phase state machine ───────────────────────────────────────────────────────
type Phase =
  | "q0-thinking"   // initial indexing
  | "q1"            // country/region focus
  | "q1-thinking"
  | "q2"            // gender disaggregation
  | "q2-thinking"
  | "q3"            // audience
  | "q3-thinking"
  | "q5"            // length selection (tone derived automatically from audience)
  | "q5-thinking"   // brief pause before showing section structure
  | "q5-confirmed"; // section structure shown → triggers onComplete

interface Props {
  onComplete: (result: NarrativeBuilderResult) => void;
  inputRef?: React.MutableRefObject<((text: string) => void) | null>;
  onContextChipsChange?: (chips: { id: string; label: string }[]) => void;
  contextActionRef?: React.MutableRefObject<((actionId: string) => void) | null>;
  onSetGuidanceReply?: (label: string | null) => void;
  onGuidanceDimension?: (dimensionNum: number) => void;
  /** Called when the user clicks the Preview button. */
  onPreview?: () => void;
}

export default function DonorNarrativeWizard({ onComplete, inputRef, onContextChipsChange, contextActionRef, onSetGuidanceReply, onGuidanceDimension, onPreview }: Props) {
  const [phase, setPhase] = useState<Phase>("q0-thinking");
  const phaseRef = useRef<Phase>("q0-thinking");
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Collected answers
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Answer, setQ2Answer] = useState<string | null>(null);
  const [q3Answer, setQ3Answer] = useState<string | null>(null);
  const [q5Answer, setQ5Answer] = useState<string | null>(null);

  // Derive tone from audience (no explicit Q4 step)
  const derivedTone = (q3Answer ?? "").toLowerCase().includes("senior")
    ? "Strategic" : "Accountability";

  // Fixed challenge for this donor flow
  const donorChallenge = useMemo(() => challengeSets.find((c) => c.id === "cr-3") ?? challengeSets[0], []);

  // ── Guidance mechanics ───────────────────────────────────────────────────────
  const [showGuidance, setShowGuidance] = useState(false);
  const [dismissedGaps, setDismissedGaps] = useState<Set<string>>(new Set());
  const [guidanceRounds, setGuidanceRounds] = useState<Array<{ userText: string; dimNum: number; thinking: boolean; nextTip: GapTip | null }>>([]);
  const [pendingGapDimNum, setPendingGapDimNum] = useState<number | null>(null);
  const pendingGapDimNumRef = useRef<number | null>(null);
  const pendingNextTipRef = useRef<GapTip | null>(null);
  const pendingTipIdRef = useRef<string | null>(null);
  const onGuidanceDimensionRef = useRef(onGuidanceDimension);
  const onSetGuidanceReplyRef = useRef(onSetGuidanceReply);
  useEffect(() => { onGuidanceDimensionRef.current = onGuidanceDimension; }, [onGuidanceDimension]);
  useEffect(() => { onSetGuidanceReplyRef.current = onSetGuidanceReply; }, [onSetGuidanceReply]);
  useEffect(() => { pendingGapDimNumRef.current = pendingGapDimNum; }, [pendingGapDimNum]);

  // ── Thought steps ────────────────────────────────────────────────────────────
  const q0Steps = useMemo<ThoughtStep[]>(() => [
    { text: "Parsing prompt — Norway, food security, IDA21",       detail: "Donor + theme detected" },
    { text: "Connecting to IDA21 food security commitments",        detail: "IDA21 Replenishment database" },
    { text: "Loading FY25 Agriculture & Food results",              detail: "IDA_Scorecard_Metadata_1.xlsx" },
  ], []);

  const q1Steps = useMemo<ThoughtStep[]>(() => [
    { text: "Filtering IDA21 commitments by geography",             detail: q1Answer ?? "" },
    { text: "Cross-referencing FCV food security indicators",       detail: "FY25 portfolio" },
  ], [q1Answer]);

  const q2Steps = useMemo<ThoughtStep[]>(() => [
    { text: "Confirming indicator disaggregation scope",            detail: q2Answer ?? "" },
  ], [q2Answer]);

  const q3Steps = useMemo<ThoughtStep[]>(() => [
    { text: "Identifying audience framing requirements",            detail: q3Answer ?? "" },
    { text: "Deriving tone from audience",                          detail: `${(q3Answer ?? "").toLowerCase().includes("senior") ? "Strategic" : "Accountability"} — auto-selected` },
  ], [q3Answer]);

  const q5Steps = useMemo<ThoughtStep[]>(() => [
    { text: "Confirming section structure",                         detail: "US030 fixed sections applied" },
    { text: "Applying source constraints",                          detail: "Pre-empt narrative repository" },
  ], []);

  // ── Single input handler dispatches by current phase ─────────────────────────
  const handleInput = useCallback((text: string) => {
    const p = phaseRef.current;
    if (p === "q1") {
      setQ1Answer(text);
      setPhase("q1-thinking");
      setTimeout(() => setPhase("q2"), 1600);
    } else if (p === "q2") {
      setQ2Answer(text);
      setPhase("q2-thinking");
      setTimeout(() => setPhase("q3"), 1200);
    } else if (p === "q3") {
      setQ3Answer(text);
      setPhase("q3-thinking");
      setTimeout(() => setPhase("q5"), 1800);
    } else if (p === "q5") {
      setQ5Answer(text);
      setPhase("q5-thinking");
      setTimeout(() => {
        const lengthToReadTime: Record<string, string> = { "Standard": "~2.5 min", "In-depth": "~4 min", "Short": "~1.5 min" };
        const tone = (q3Answer ?? "").toLowerCase().includes("senior") ? "Strategic" : "Accountability";
        setPhase("q5-confirmed");
        onComplete({
          outcomeAreaIds: ["green-blue-planet"],
          countrySubset: "fcv",
          challenge: challengeSets.find((c) => c.id === "cr-3") ?? challengeSets[0],
          narrativeMeta: {
            title: "IDA21 Donor Report · Norway",
            audience: (q3Answer ?? "Donor delegation").replace(/\b\w/g, (c) => c.toUpperCase()),
            tonality: tone,
            readTime: lengthToReadTime[text] ?? "~2.5 min",
          },
        });
      }, 1400);
    }
  }, [onComplete]);

  const handleGapResponse = useCallback((text: string) => {
    const dim = pendingGapDimNumRef.current;
    const nextTip = pendingNextTipRef.current;
    const tipId = pendingTipIdRef.current;
    if (dim === null) return;
    setPendingGapDimNum(null);
    pendingNextTipRef.current = null;
    pendingTipIdRef.current = null;
    onSetGuidanceReplyRef.current?.(null);
    if (tipId) setDismissedGaps((prev) => new Set([...prev, tipId]));
    setGuidanceRounds((prev) => [...prev, { userText: text, dimNum: dim, thinking: true, nextTip }]);
    onGuidanceDimensionRef.current?.(dim);
    setTimeout(() => {
      setGuidanceRounds((prev) => prev.map((r, i) => i === prev.length - 1 ? { ...r, thinking: false } : r));
    }, 2200);
  }, []);

  const handleAddToNarrative = (tip: GapTip) => {
    const allGapsList = getGapTips(donorChallenge, "donor");
    const hypotheticalDismissed = new Set([...dismissedGaps, tip.id]);
    const nextTip = allGapsList.find((g) => !hypotheticalDismissed.has(g.id)) ?? null;
    pendingNextTipRef.current = nextTip;
    pendingTipIdRef.current = tip.id;
    setPendingGapDimNum(tip.dimensionNum);
    onSetGuidanceReplyRef.current?.(tip.dimensionLabel);
  };

  // Show guidance after narrative panel has finished loading (~4.5s)
  useEffect(() => {
    if (phase !== "q5-confirmed") return;
    const t = setTimeout(() => setShowGuidance(true), 4600);
    return () => clearTimeout(t);
  }, [phase]);

  // Wire inputRef — gap response takes priority over wizard phases
  useEffect(() => {
    if (!inputRef) return;
    if (pendingGapDimNum !== null) {
      inputRef.current = handleGapResponse;
    } else {
      const waiting: Phase[] = ["q1", "q2", "q3", "q5"];
      inputRef.current = waiting.includes(phase) ? handleInput : null;
    }
    return () => { inputRef.current = null; };
  }, [phase, inputRef, handleInput, handleGapResponse, pendingGapDimNum]);

  useEffect(() => {
    onContextChipsChange?.([]);
    if (contextActionRef) contextActionRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const past = (p: Phase) => {
    const order: Phase[] = ["q0-thinking","q1","q1-thinking","q2","q2-thinking","q3","q3-thinking","q5","q5-thinking","q5-confirmed"];
    return order.indexOf(phase) > order.indexOf(p);
  };
  const atOrPast = (p: Phase) => phase === p || past(p);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: F }}>

      {/* Initial thought process */}
      <WizardThoughtProcess
        steps={q0Steps}
        onComplete={() => setPhase((p) => p === "q0-thinking" ? "q1" : p)}
      />

      {/* Q1: country / region */}
      {atOrPast("q1") && (
        <AiBlock>
          <AiText>
            For this narrative are you focused on the results within a specific country or region, or would you like this to cover IDA countries broadly?
          </AiText>
          {phase === "q1" && (
            <ActionChips
              options={[
                { id: "all-ida", label: "All IDA Countries" },
                { id: "ssa",     label: "Sub-Saharan Africa" },
                { id: "sas",     label: "South Asia" },
                { id: "fcv",     label: "FCV Countries" },
                { id: "sids",    label: "SIDS" },
                { id: "lac",     label: "Latin America & Caribbean" },
              ]}
              onSelect={(_, label) => handleInput(label)}
            />
          )}
        </AiBlock>
      )}

      {q1Answer && <UserBubble text={q1Answer} />}
      {phase === "q1-thinking" && <WizardThoughtProcess steps={q1Steps} />}

      {/* Q2: gender disaggregation */}
      {atOrPast("q2") && (
        <AiBlock>
          <AiText>Got it. Should this narrative include a gender disaggregation lens, or is the focus on overall population results?</AiText>
          {phase === "q2" && (
            <ActionChips
              options={[
                { id: "overall", label: "Overall population" },
                { id: "gender",  label: "Include gender disaggregation" },
              ]}
              onSelect={(_, label) => handleInput(label)}
            />
          )}
        </AiBlock>
      )}

      {q2Answer && <UserBubble text={q2Answer} />}
      {phase === "q2-thinking" && <WizardThoughtProcess steps={q2Steps} />}

      {/* Q3: audience */}
      {atOrPast("q3") && (
        <AiBlock>
          <AiText>Who is the primary audience for this narrative?</AiText>
        </AiBlock>
      )}

      {q3Answer && <UserBubble text={q3Answer} />}
      {phase === "q3-thinking" && <WizardThoughtProcess steps={q3Steps} />}

      {/* Q5: length selection via 3-point slider */}
      {atOrPast("q5") && (
        <AiBlock>
          <AiText>
            For length, given the scope — one outcome area, one region, FCV focus — I&apos;d suggest <strong style={{ color: "rgba(199,210,254,0.90)" }}>Standard</strong>. Use the slider to choose your preferred read time.
          </AiText>
          {phase === "q5" && (
            <LengthSlider onSelect={(label) => handleInput(label)} />
          )}
        </AiBlock>
      )}

      {q5Answer && <UserBubble text={q5Answer} />}

      {phase === "q5-thinking" && <WizardThoughtProcess steps={q5Steps} />}

      {/* Section structure confirmation (US030) */}
      {atOrPast("q5-confirmed") && (
        <AiBlock>
          <AiText>Your narrative draft is ready. I&apos;ve structured it across 5 sections:</AiText>
          <ul style={{ margin: "4px 0 0", padding: "0 0 0 4px", listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { label: "Headline",        body: "Core result claim — what the data shows and why it matters for this donor" },
              { label: "Summary",         body: "Overview of the outcome area and country context, with headline figures" },
              { label: "Challenge",       body: "Structural blockers to progress, with constraints named explicitly" },
              { label: "Response",        body: "Theory of change with evidence — on-track and off-track indicators, IDA support" },
              { label: "Lessons Learned", body: "What worked, what didn't, and where donor attention should go next" },
            ].map(({ label, body }) => (
              <li key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 2, width: 5, height: 5, borderRadius: "50%", background: "rgba(52,211,153,0.55)", display: "inline-block" }} />
                <p style={{ margin: 0, fontSize: 13, fontFamily: F, lineHeight: 1.6, color: "rgba(255,255,255,0.70)" }}>
                  <strong style={{ color: "rgba(255,255,255,0.88)", fontWeight: 600 }}>{label}</strong>
                  {" — "}
                  {body}
                </p>
              </li>
            ))}
          </ul>
          <p style={{ margin: "8px 0 0", fontSize: 13, fontFamily: F, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>
            Review each section in the panel to the right as the narrative generates.
          </p>
        </AiBlock>
      )}

      {/* Guidance — appears after the narrative panel has loaded */}
      {showGuidance && (() => {
        const allGaps = getGapTips(donorChallenge, "donor");
        const visibleGaps = allGaps.filter((g) => !dismissedGaps.has(g.id));
        return (
          <>
            {guidanceRounds.length === 0 && (
              <AiBlock>
                {visibleGaps.length > 0 ? (
                  <>
                    <AiText>
                      I&apos;ve identified{" "}
                      <strong style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{allGaps.length} area{allGaps.length > 1 ? "s" : ""}</strong>{" "}
                      where the narrative can be strengthened. Click <strong style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>Add to Narrative</strong>, then type what you want to change in the prompt bar and send.
                    </AiText>
                    <NarrativeGuidanceWidget
                      key={visibleGaps[0].id}
                      tip={visibleGaps[0]}
                      onDismiss={(id) => setDismissedGaps((prev) => new Set([...prev, id]))}
                      onAddToNarrative={handleAddToNarrative}
                    />
                  </>
                ) : (
                  <AiText>
                    All {allGaps.length} guidance checks have been addressed. Your narrative meets the Authenticity Rubric across all five dimensions and is ready to share.
                  </AiText>
                )}
              </AiBlock>
            )}

            {guidanceRounds.map((round, i) => {
              const allGapsCur = getGapTips(donorChallenge, "donor");
              const visibleGapsCur = allGapsCur.filter((g) => !dismissedGaps.has(g.id));
              const isLast = i === guidanceRounds.length - 1;
              return (
                <React.Fragment key={i}>
                  <UserBubble text={round.userText} />
                  {round.thinking ? (
                    <AiBlock>
                      <p style={{ fontSize: 13, fontFamily: F, color: "rgba(255,255,255,0.45)", fontStyle: "italic", margin: 0 }}>
                        Updating narrative…
                      </p>
                    </AiBlock>
                  ) : (
                    <AiBlock>
                      <AiText>
                        {DIM_SECTION_LABELS[round.dimNum] ? (
                          <>Updated the <strong style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{DIM_SECTION_LABELS[round.dimNum]}</strong> section.</>
                        ) : "Narrative updated."}
                        {" "}The Narrative Strength score has been recalculated.
                      </AiText>
                      {isLast && round.nextTip && (
                        <NarrativeGuidanceWidget
                          key={round.nextTip.id}
                          tip={round.nextTip}
                          onDismiss={(id) => setDismissedGaps((prev) => new Set([...prev, id]))}
                          onAddToNarrative={handleAddToNarrative}
                        />
                      )}
                      {isLast && !round.nextTip && visibleGapsCur.length === 0 && (
                        <AiText>
                          All guidance checks have been addressed. Your narrative is ready to share.
                        </AiText>
                      )}
                    </AiBlock>
                  )}
                </React.Fragment>
              );
            })}
          </>
        );
      })()}

    </div>
  );
}
