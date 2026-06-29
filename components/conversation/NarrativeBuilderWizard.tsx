
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconCheck, IconArrowRight, IconSparkles,
  IconArrowsMaximize, IconChevronLeft, IconChevronRight, IconChevronDown,
} from "@tabler/icons-react";
import { outcomeAreas } from "@/lib/mockData";
import { challengeSets, narrativeStrength, narrativeScore, getGapTips, getDimensionScores, ARCHETYPE_META, NARRATIVE_STRENGTH_META, type ChallengeSet, type GapTip, type DimensionScores } from "@/lib/challengeData";

// Map challengeData slugs → outcomeArea names
const OUTCOME_SLUG_MAP: Record<string, string> = {
  "protection-for-the-poorest": "Protection for the Poorest",
  "green-blue-planet":          "Green & Blue Planet",
  "digital-services":           "Digital Services",
  "more-private-investment":    "More Private Investment",
};

export interface NarrativeMeta {
  audience?: string;
  readTime?: string;
  tonality?: string;
  title?: string;
}

export interface NarrativeBuilderResult {
  outcomeAreaIds: string[];
  countrySubset: string;
  challenge: ChallengeSet;
  narrativeMeta?: NarrativeMeta;
}

interface Props {
  onComplete: (result: NarrativeBuilderResult) => void;
  inputRef?: React.MutableRefObject<((text: string) => void) | null>;
  initialOutcomeArea?: string | null;
  initialCountrySubset?: string | null;
  /** Called when the wizard wants to surface contextual action chips above the prompt bar. */
  onContextChipsChange?: (chips: { id: string; label: string }[]) => void;
  /** Ref the parent can call to dispatch a named wizard action (e.g. "proceed"). */
  contextActionRef?: React.MutableRefObject<((actionId: string) => void) | null>;
  onPrefillPrompt?: (text: string) => void;
  /** Called when the user clicks "Add to Narrative" to set a reply chip above the
   *  prompt bar. Pass null to clear it (after the user sends). */
  onSetGuidanceReply?: (label: string | null) => void;
  /** Called when the user clicks "Add to Narrative" on a guidance tip — triggers
   *  the section shimmer + score bump in the right-hand NarrativePanel. */
  onGuidanceDimension?: (dimensionNum: number) => void;
}

function mapGeographyToCountryId(geo: string): string {
  const lower = geo.toLowerCase();
  if (lower.includes("sub-saharan") || lower === "ssa") return "ssa";
  if (lower.includes("mena") || lower.includes("middle east")) return "mena";
  if (lower.includes("eca") || lower.includes("europe") || lower.includes("central asia")) return "eca";
  if (lower.includes("lac") || lower.includes("latin america")) return "lac";
  if (lower.includes("fcv") || lower.includes("fragile")) return "fcv";
  if (lower.includes("sids")) return "sids";
  return "all-ida";
}

// ── Dark-mode thought process (mirrors the Q&A ThoughtProcess component) ──
interface WizardThoughtStep { text: string; detail?: string; }

function WizardThoughtProcess({ steps, onComplete }: {
  steps: WizardThoughtStep[];
  onComplete?: () => void;
}) {
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
        {done ? (
          <IconCheck size={13} color="#34D399" />
        ) : (
          <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.35)", display: "inline-block", animation: "nbDotPulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
            ))}
          </span>
        )}
        <span style={{ fontSize: 12.5, fontFamily: "'Open Sans', sans-serif", color: done ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.40)", fontStyle: done ? "normal" : "italic" }}>
          {done ? `Thought for ${elapsedSec}s` : "Thinking…"}
        </span>
        {done && (
          <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <IconChevronDown size={13} color="rgba(255,255,255,0.35)" />
          </span>
        )}
      </button>

      {open && (
        <div style={{ marginLeft: 4, paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.10)", display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", fontFamily: "'Open Sans', sans-serif", lineHeight: 1.5, opacity: i < visibleCount ? 1 : 0, transition: "opacity 0.3s ease" }}>
              {step.text}
              {step.detail && i < visibleCount && (
                <span style={{ marginLeft: 6, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", fontSize: 10.5 }}>
                  → {step.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes nbDotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%            { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────
function AiBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="narrative-content-enter" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {children}
    </div>
  );
}

function AiText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: "1.6", fontFamily: "'Open Sans', sans-serif", margin: 0 }}>
      {children}
    </p>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="self-end narrative-content-enter" style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: "72%" }}>
      <div style={{
        background: "rgba(100, 116, 139, 0.35)",
        borderRadius: 20,
        padding: "10px 16px",
        fontSize: 13.5,
        color: "rgba(226, 232, 240, 0.95)",
        fontFamily: "'Open Sans', sans-serif",
        lineHeight: 1.5,
        fontWeight: 400,
      }}>
        {text}
      </div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0288D1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'Open Sans', sans-serif", letterSpacing: "0.02em" }}>
        NT
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <IconSparkles size={11} color="rgba(139,92,246,0.7)" />
      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'Open Sans', sans-serif" }}>
        {children}
      </span>
    </div>
  );
}

const DIM_SECTION_LABELS: Record<number, string> = {
  1: "Constraints and Challenges",
  2: "Pathways to Outcomes",
  3: "Constraints and Challenges",
  4: "Impact",
  5: "Lessons Learnt",
};

// ── Narrative Guidance widget ──────────────────────────────────────────────
function NarrativeGuidanceWidget({
  tip, onDismiss, onAddToNarrative, buttonsHidden,
}: {
  tip: GapTip;
  onDismiss: (id: string) => void;
  onAddToNarrative: (tip: GapTip) => void;
  buttonsHidden?: boolean;
}) {
  const F = "'Open Sans', sans-serif";
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

// ── Selection chips ────────────────────────────────────────────────────────
function SelectionChips({
  label,
  options,
  selected,
  multi,
  onSelect,
  onSubmit,
  disabled,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  multi?: boolean;
  onSelect: (id: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <SectionLabel>{label}</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 100, fontSize: 13,
                fontFamily: "'Open Sans', sans-serif",
                border: `1px solid ${isSelected ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.18)"}`,
                background: isSelected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                color: isSelected ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.82)",
                cursor: "pointer", transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "rgba(255,255,255,0.97)"; }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isSelected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = isSelected ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.82)";
              }}
            >
              {isSelected && <IconCheck size={11} color="rgba(255,255,255,0.90)" />}
              {opt.label}
            </button>
          );
        })}
      </div>
      {multi && onSubmit && selected.length > 0 && (
        <button
          type="button"
          onClick={onSubmit}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
            fontFamily: "'Open Sans', sans-serif",
            background: "#0288D1", color: "#fff", border: "none", cursor: "pointer",
            width: "fit-content",
          }}
        >
          Continue <IconArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

// ── Narrative Strength Panel ────────────────────────────────────────────────
const STRENGTH_DIMS = [
  { key: "d1" as keyof DimensionScores, num: 1, label: "Challenge framing" },
  { key: "d2" as keyof DimensionScores, num: 2, label: "Causal humility" },
  { key: "d3" as keyof DimensionScores, num: 3, label: "Obstacles & gaps" },
  { key: "d4" as keyof DimensionScores, num: 4, label: "Evidence quality" },
  { key: "d5" as keyof DimensionScores, num: 5, label: "Lessons learned" },
];

function NarrativeStrengthPanel({
  challenge, resolvedDimensions, loadingDimensions,
}: {
  challenge: ChallengeSet;
  resolvedDimensions: Set<number>;
  loadingDimensions: Set<number>;
}) {
  const F = "'Open Sans', sans-serif";
  const base = getDimensionScores(challenge);
  const scores: DimensionScores = {
    d1: resolvedDimensions.has(1) ? Math.min(base.d1 + 18, 97) : base.d1,
    d2: resolvedDimensions.has(2) ? Math.min(base.d2 + 18, 97) : base.d2,
    d3: resolvedDimensions.has(3) ? Math.min(base.d3 + 18, 97) : base.d3,
    d4: resolvedDimensions.has(4) ? Math.min(base.d4 + 18, 97) : base.d4,
    d5: resolvedDimensions.has(5) ? Math.min(base.d5 + 18, 97) : base.d5,
  };
  const overall = Math.round((scores.d1 + scores.d2 + scores.d3 + scores.d4 + scores.d5) / 5);

  const R = 40, cx = 56, cy = 56;
  const circumference = 2 * Math.PI * R;
  const arcColor = overall >= 85 ? "#34D399" : overall >= 70 ? "#0288D1" : "#FBBF24";

  return (
    <div style={{
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(12,20,30,0.65)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontFamily: F }}>
        Narrative Strength
      </span>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {/* Donut */}
        <svg width={112} height={112} viewBox="0 0 112 112" style={{ flexShrink: 0 }} aria-hidden>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
          <circle
            cx={cx} cy={cy} r={R} fill="none"
            stroke={arcColor} strokeWidth={10} strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - overall / 100)}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dashoffset 800ms ease, stroke 400ms ease" }}
          />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fontWeight={700} fill="rgba(255,255,255,0.95)" fontFamily={F}>{overall}%</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.35)" fontFamily={F}>overall</text>
        </svg>
        {/* Dimension rows */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
          {STRENGTH_DIMS.map(({ key, num, label }) => {
            const score = scores[key];
            const isLoading = loadingDimensions.has(num);
            const color = score >= 80 ? "#34D399" : score >= 65 ? "#FBBF24" : "#F87171";
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", fontFamily: F, width: 128, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 100, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  {isLoading ? (
                    <div style={{ height: "100%", width: "55%", borderRadius: 100, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.04) 100%)", backgroundSize: "200% 100%", animation: "nbShimmer 1.4s ease-in-out infinite" }} />
                  ) : (
                    <div style={{ height: "100%", borderRadius: 100, width: `${score}%`, background: color, transition: "width 700ms ease, background 400ms ease" }} />
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: F, color: isLoading ? "rgba(255,255,255,0.20)" : color, width: 36, textAlign: "right", transition: "color 400ms ease" }}>
                  {isLoading ? "—" : `${score}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes nbShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
}

// ── Challenge card ─────────────────────────────────────────────────────────
function ChallengeCard({
  challenge, focal, selected, onClick, onExplore, hideExplore,
}: {
  challenge: ChallengeSet; focal: boolean; selected: boolean; onClick: () => void; onExplore: () => void; hideExplore?: boolean;
}) {
  const archMeta = ARCHETYPE_META[challenge.archetype];
  const strength = narrativeStrength(challenge);
  const strengthMeta = NARRATIVE_STRENGTH_META[strength];
  const score = narrativeScore(challenge);

  const borderColor = selected
    ? "rgba(255,255,255,0.28)"
    : focal ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)";

  return (
    <div
      role="button" tabIndex={0} aria-pressed={selected}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{
        width: 300, height: 420, display: "flex", flexDirection: "column",
        borderRadius: 16, border: `1px solid ${borderColor}`,
        background: selected ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        cursor: "pointer", overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s", flexShrink: 0,
      }}
    >
      {/* Header: outcome area tag(s) + expand icon */}
      <div style={{ padding: "14px 14px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {challenge.outcomeAreaIds.map((slug) => (
            <span key={slug} style={{ fontSize: 10.5, fontWeight: 500, padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)", fontFamily: "'Open Sans', sans-serif", whiteSpace: "nowrap" }}>
              {OUTCOME_SLUG_MAP[slug] ?? slug}
            </span>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "10px 14px 0" }}>
        <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: "rgba(255,255,255,0.92)", fontFamily: "'Open Sans', sans-serif", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {challenge.shortTitle}
        </p>
      </div>

      {/* Approach + evidence counts */}
      <div style={{ padding: "6px 14px 0", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.72)", fontFamily: "'Open Sans', sans-serif" }}>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>Approach: </span>{archMeta.label}
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'Open Sans', sans-serif" }}>
          Based on {challenge.padCount.toLocaleString()} PADs, {challenge.isrCount.toLocaleString()} ISRs, and {challenge.icrCount.toLocaleString()} ICRs.
        </p>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "8px 14px" }} />

      <div style={{ padding: "0 14px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontFamily: "'Open Sans', sans-serif", marginBottom: 6 }}>
          Summary
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", fontFamily: "'Open Sans', sans-serif", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {challenge.summary}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: strengthMeta.dot, flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontSize: 10.5, color: strengthMeta.color, fontFamily: "'Open Sans', sans-serif", fontWeight: 600 }}>
            {strength} narrative
          </span>
          <span style={{ fontSize: 10.5, color: strengthMeta.color, fontFamily: "'Open Sans', sans-serif", fontWeight: 700, opacity: 0.8, marginLeft: 2 }}>
            · {score}%
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "8px 14px 0" }} />

      <div style={{ padding: "8px 14px 0" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontFamily: "'Open Sans', sans-serif", marginBottom: 6 }}>
          Country examples
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {challenge.countryExamples.map((c) => (
            <span key={c.name} style={{ fontSize: 12, color: "rgba(255,255,255,0.80)", fontFamily: "'Open Sans', sans-serif" }}>
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Spacer pushes Explore to bottom */}
      <div style={{ flex: 1 }} />

      {/* Explore button with AI gradient border — hidden once exploring */}
      {!hideExplore && (
        <div style={{ padding: "0 14px 14px" }}>
          <div
            style={{
              display: "inline-flex",
              borderRadius: 100,
              padding: 1,
              background: "linear-gradient(135deg, #818CF8, #06B6D4, #8B5CF6)",
            }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onExplore(); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                borderRadius: 100,
                padding: "7px 14px",
                background: selected ? "rgba(10,20,35,0.85)" : "rgba(10,20,35,0.92)",
                border: "none", cursor: "pointer",
                fontSize: 12.5, fontWeight: 600, color: "#fff",
                fontFamily: "'Open Sans', sans-serif",
                letterSpacing: "0.01em",
                transition: "background 140ms",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(10,20,35,0.70)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = selected ? "rgba(10,20,35,0.85)" : "rgba(10,20,35,0.92)"; }}
            >
              <IconSparkles size={12} style={{ opacity: 0.85 }} />
              Explore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Challenge carousel ─────────────────────────────────────────────────────
function ChallengeCarousel({ challenges, selectedId, onSelect, onExplore, hideExplore }: {
  challenges: ChallengeSet[]; selectedId: string | null; onSelect: (id: string) => void; onExplore: (id: string) => void; hideExplore?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const goTo = (i: number) => setActiveIndex(Math.max(0, Math.min(challenges.length - 1, i)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative", height: 440, overflow: "hidden" }} className="group">
        {challenges.map((c, i) => {
          const offset = i - activeIndex;
          const abs = Math.abs(offset);
          return (
            <div key={c.id} style={{
              position: "absolute", top: "50%", left: 0,
              transform: `translateY(-50%) translateX(${offset * 320}px)`,
              opacity: abs > 2 ? 0 : mounted ? 1 : 0,
              pointerEvents: abs > 2 ? "none" : "auto",
              zIndex: 10 - abs,
              transition: "transform 500ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease-out",
            }}>
              <ChallengeCard challenge={c} focal={offset === 0} selected={selectedId === c.id} onClick={() => { goTo(i); onSelect(c.id); }} onExplore={() => onExplore(c.id)} hideExplore={hideExplore} />
            </div>
          );
        })}

        {/* Left fade */}
        <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 80, pointerEvents: "none", zIndex: 20, background: "linear-gradient(to right, #112531 0%, #112531 20%, rgba(17,37,49,0) 100%)", opacity: activeIndex > 0 ? 1 : 0, transition: "opacity 300ms ease" }} />
        {/* Right fade */}
        <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 80, pointerEvents: "none", zIndex: 20, background: "linear-gradient(to left, #112531 0%, #112531 20%, rgba(17,37,49,0) 100%)", opacity: activeIndex < challenges.length - 1 ? 1 : 0, transition: "opacity 300ms ease" }} />

        {activeIndex > 0 && (
          <button type="button" onClick={() => goTo(activeIndex - 1)} style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", zIndex: 30, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>
            <IconChevronLeft size={16} />
          </button>
        )}
        {activeIndex < challenges.length - 1 && (
          <button type="button" onClick={() => goTo(activeIndex + 1)} style={{ position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)", zIndex: 30, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>
            <IconChevronRight size={16} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {challenges.map((c, i) => (
          <button key={c.id} type="button" onClick={() => goTo(i)} style={{ borderRadius: 100, border: "none", cursor: "pointer", transition: "all 0.2s", width: activeIndex === i ? 16 : 6, height: 6, background: activeIndex === i ? "#818CF8" : "rgba(255,255,255,0.20)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Wizard state machine ───────────────────────────────────────────────────
type Phase =
  | "q0-thinking"         // initial loading state before Q1 appears
  | "q1"                  // outcome area selection
  | "q1-question"         // user typed a question, AI thinking
  | "q1-answer"           // AI responded with suggested areas
  | "q1-thinking"         // user submitted areas, AI processing
  | "q2"                  // country scope selection
  | "q2b"                 // region selection (shown after "By Region" is picked)
  | "q2-thinking"         // user picked country, AI processing
  | "q3"                  // challenge carousel
  | "q3-thinking"         // user clicked Explore — AI is processing before responding
  | "q3-exploring";       // thinking done — AI describes the challenge

function looksLikeQuestion(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (t.includes("?")) return true;
  if (/^(which|what|how|where|when|who|is |are |can |does |do |show|tell)\b/.test(t)) return true;
  // Catch free-form progress/performance questions without a leading question word
  if (/\b(progress|progressing|performing|doing well|strongest|most progress|wbg|world bank)\b/.test(t)) return true;
  return false;
}

const SUGGESTED_AREAS = [
  {
    name: "No Learning Poverty",
    stat: "325M students supported, up 12% year-on-year",
    detail: "36 IDA countries achieved measurable reductions in learning poverty rates. Foundational literacy scores improved across Sub-Saharan Africa, with Ethiopia, Niger, and Tanzania recording the steepest gains. Teacher training programs and school infrastructure investments drove the largest share of progress.",
  },
  {
    name: "Healthier Lives",
    stat: "370M people reached with HNP services",
    detail: "UHC service coverage rose 4 points to 49/100 across IDA countries. Maternal mortality declined in 24 of 34 tracked countries, while childhood immunisation coverage held above 80% in 29 countries. Primary care financing reforms in Bangladesh and Rwanda anchored the strongest results.",
  },
  {
    name: "Digital Connectivity",
    stat: "Broadband users doubled vs. FY24, reaching 217M",
    detail: "Mobile broadband penetration crossed 40% in 18 IDA countries for the first time. Infrastructure investments in Sub-Saharan Africa added 1.2M new fibre-optic connections. Digital financial inclusion rose alongside connectivity, with 85M new mobile money accounts opened in FY25.",
  },
];

const COUNTRY_OPTIONS = [
  { id: "all-ida", label: "All IDA Countries" },
  { id: "region",  label: "By Region" },
  { id: "fcv",     label: "FCV Countries" },
  { id: "sids",    label: "SIDS" },
];

const REGION_OPTIONS = [
  { id: "ssa",  label: "Sub-Saharan Africa" },
  { id: "mena", label: "Middle East & North Africa" },
  { id: "eca",  label: "Europe & Central Asia" },
  { id: "lac",  label: "Latin America & Caribbean" },
];

export default function NarrativeBuilderWizard({ onComplete, inputRef, initialOutcomeArea, initialCountrySubset, onContextChipsChange, contextActionRef, onPrefillPrompt, onSetGuidanceReply, onGuidanceDimension }: Props) {
  const initialCountryId = initialCountrySubset ? mapGeographyToCountryId(initialCountrySubset) : null;
  const initialIsRegion = initialCountryId ? REGION_OPTIONS.some((r) => r.id === initialCountryId) : false;

  const [phase, setPhase] = useState<Phase>(() => {
    if (initialOutcomeArea && initialCountryId) return "q3";
    if (initialOutcomeArea) return "q2";
    return "q0-thinking";
  });
  const [typedAreaText, setTypedAreaText] = useState<string | null>(initialOutcomeArea ?? null);
  const [questionText, setQuestionText] = useState<string | null>(null);
  const [countrySubset, setCountrySubset] = useState<string | null>(initialCountryId);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [exploringChallenge, setExploringChallenge] = useState<ChallengeSet | null>(null);
  const [exploreReturnCount, setExploreReturnCount] = useState(0);
  const [showRefinePrompt, setShowRefinePrompt] = useState(false);
  const [showGeneratePrompt, setShowGeneratePrompt] = useState(false);
  const [dismissedGaps, setDismissedGaps] = useState<Set<string>>(new Set());
  const [byRegionChosen, setByRegionChosen] = useState(initialIsRegion);
  const [loadingDimensions, setLoadingDimensions] = useState<Set<number>>(new Set());
  const [resolvedDimensions, setResolvedDimensions] = useState<Set<number>>(new Set());
  const [pendingGapDimNum, setPendingGapDimNum] = useState<number | null>(null);
  const pendingGapDimNumRef = useRef<number | null>(null);
  const [guidanceRounds, setGuidanceRounds] = useState<Array<{ userText: string; dimNum: number; thinking: boolean; nextTip: GapTip | null }>>([]);
  const pendingNextTipRef = useRef<GapTip | null>(null);
  const pendingTipIdRef = useRef<string | null>(null);

  const selectedCountryLabel =
    REGION_OPTIONS.find((r) => r.id === countrySubset)?.label
    ?? COUNTRY_OPTIONS.find((o) => o.id === countrySubset)?.label
    ?? "";

  const handleTypedAreas = useCallback((text: string) => {
    if (looksLikeQuestion(text)) {
      setQuestionText(text);
      setPhase("q1-question");
      setTimeout(() => setPhase("q1-answer"), 2200);
    } else {
      setTypedAreaText(text);
      setPhase("q1-thinking");
      setTimeout(() => setPhase("q2"), 1400);
    }
  }, []);

  // Sync refs
  useEffect(() => { pendingGapDimNumRef.current = pendingGapDimNum; }, [pendingGapDimNum]);
  const onGuidanceDimensionRef = useRef(onGuidanceDimension);
  useEffect(() => { onGuidanceDimensionRef.current = onGuidanceDimension; }, [onGuidanceDimension]);
  const onSetGuidanceReplyRef = useRef(onSetGuidanceReply);
  useEffect(() => { onSetGuidanceReplyRef.current = onSetGuidanceReply; }, [onSetGuidanceReply]);

  // Expose context chips and action when the wizard surfaces them.
  useEffect(() => {
    if (phase === "q3-exploring") {
      onContextChipsChange?.([
        { id: "explore-other", label: "Explore other narratives" },
        { id: "generate", label: "Generate Narrative" },
      ]);
      if (contextActionRef) {
        contextActionRef.current = (actionId) => {
          if (actionId === "explore-other") {
            setExploreReturnCount((c) => c + 1);
            setExploringChallenge(null);
            onContextChipsChange?.([]);
            setPhase("q3");
          } else if (actionId === "generate") {
            setShowGeneratePrompt(true);
            handleExploreCreateRef.current();
            onContextChipsChange?.([]);
          }
        };
      }
    } else {
      onContextChipsChange?.([]);
      if (contextActionRef) contextActionRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleGapResponse = useCallback((text: string) => {
    const dim = pendingGapDimNumRef.current;
    const nextTip = pendingNextTipRef.current;
    const tipId = pendingTipIdRef.current;
    if (dim === null) return;
    setPendingGapDimNum(null);
    pendingNextTipRef.current = null;
    pendingTipIdRef.current = null;
    onSetGuidanceReplyRef.current?.(null);
    // Dismiss the tip now that the user has sent their response
    if (tipId) setDismissedGaps((prev) => new Set([...prev, tipId]));
    setGuidanceRounds((prev) => [...prev, { userText: text, dimNum: dim, thinking: true, nextTip }]);
    setLoadingDimensions(new Set([dim]));
    onGuidanceDimensionRef.current?.(dim);
    setTimeout(() => {
      setLoadingDimensions(new Set());
      setResolvedDimensions((prev) => new Set([...prev, dim]));
      setGuidanceRounds((prev) => prev.map((r, i) => i === prev.length - 1 ? { ...r, thinking: false } : r));
    }, 2200);
  }, []);

  useEffect(() => {
    if (!inputRef) return;
    if (pendingGapDimNum !== null) {
      inputRef.current = handleGapResponse;
    } else if (phase === "q1" || phase === "q1-answer") {
      inputRef.current = handleTypedAreas;
    } else {
      inputRef.current = null;
    }
    return () => { if (inputRef) inputRef.current = null; };
  }, [phase, inputRef, handleTypedAreas, handleGapResponse, pendingGapDimNum]);

  const handleContinueAreas = handleTypedAreas;

  const handleCountrySelect = (id: string) => {
    if (id === "region") {
      setCountrySubset("region");
      setByRegionChosen(true);
      setPhase("q2b");
      return;
    }
    setByRegionChosen(false);
    setCountrySubset(id);
    setPhase("q2-thinking");
    setTimeout(() => setPhase("q3"), 1800);
  };

  const handleRegionSelect = (id: string) => {
    setCountrySubset(id);
    setPhase("q2-thinking");
    setTimeout(() => setPhase("q3"), 1800);
  };

  const handleChallengeSelect = (id: string) => {
    setSelectedChallengeId(id);
  };

  const handleChallengeExplore = (id: string) => {
    const challenge = challengeSets.find((c) => c.id === id)!;
    setSelectedChallengeId(id);
    setExploringChallenge(challenge);
    setShowRefinePrompt(false);
    setPhase("q3-thinking");
  };

  const handleExploreCreate = () => {
    if (!exploringChallenge) return;
    onComplete({
      outcomeAreaIds: [],
      countrySubset: countrySubset ?? "all-ida",
      challenge: exploringChallenge,
      narrativeMeta: {
        title: exploringChallenge.shortTitle,
        audience: "IDA Senior Management",
        readTime: "~3 min",
        tonality: "Evidence-based",
      },
    });
    setTimeout(() => setShowRefinePrompt(true), 4600);
  };
  const handleExploreCreateRef = useRef(handleExploreCreate);
  handleExploreCreateRef.current = handleExploreCreate;

  const totals = challengeSets.reduce(
    (acc, c) => ({ pads: acc.pads + c.padCount, isrs: acc.isrs + c.isrCount, icrs: acc.icrs + c.icrCount }),
    { pads: 0, isrs: 0, icrs: 0 }
  );

  const q0ThinkingSteps = useMemo<WizardThoughtStep[]>(() => [
    { text: "Connecting to IDA Scorecard evidence base",                       detail: "IDA_Scorecard_Metadata_1.xlsx" },
    { text: `Indexing ${totals.pads.toLocaleString()} PADs, ${totals.isrs.toLocaleString()} ISRs, and ${totals.icrs.toLocaleString()} ICRs`, detail: "Active portfolio" },
    { text: "Loading 15 outcome areas",                                        detail: "FY24–FY30 scorecard" },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const q1QuestionSteps = useMemo<WizardThoughtStep[]>(() => [
    { text: "Analysing question context",                  detail: "Intent: outcome area performance" },
    { text: "Querying FY25 headline results by outcome area", detail: "IDA_Scorecard_Metadata_1.xlsx · FY25" },
    { text: "Ranking areas by momentum and evidence density", detail: "Strong · Moderate · Developing" },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const q1ThinkingSteps = useMemo<WizardThoughtStep[]>(() => [
    { text: `Loading indicator catalogue for ${typedAreaText || "selected outcome area"}`,  detail: "IDA_Scorecard_Metadata_1.xlsx · 15 outcome areas" },
    { text: `Filtering ${totals.isrs.toLocaleString()} ISRs and ${totals.pads.toLocaleString()} PADs by outcome area`, detail: "Cross-referencing active portfolio" },
    { text: "Identifying challenge themes across PADs, ISRs, DPOs", detail: "Clustering by challenge archetype" },
    { text: "Mapping evidence density and country coverage",         detail: "Narrative strength scored per challenge set" },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [typedAreaText]);

  const q2ThinkingSteps = useMemo<WizardThoughtStep[]>(() => [
    { text: "Loading indicator catalogue for selected outcome area", detail: "IDA_Scorecard_Metadata_1.xlsx" },
    { text: `Filtering by geography: ${selectedCountryLabel}`,      detail: `${selectedCountryLabel} scope applied` },
    { text: "Identifying challenge themes across PADs, ISRs, DPOs", detail: "Clustering by archetype" },
    { text: "Ranking challenges by narrative strength",              detail: "Strong · Moderate · Developing" },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [selectedCountryLabel]);

  const q3ThinkingSteps = useMemo<WizardThoughtStep[]>(() => {
    if (!exploringChallenge) return [];
    const c = exploringChallenge;
    const total = c.padCount + c.isrCount + c.icrCount;
    return [
      { text: `Loading evidence base: "${c.shortTitle}"`,                   detail: `${total.toLocaleString()} project documents` },
      { text: `Filtering ISRs and ICRs by ${c.archetype.replace(/-/g, " ")}`, detail: `${c.countryCount} IDA countries` },
      { text: `Mapping indicator momentum across ${c.countryExamples.length} country cases`, detail: c.movementTag },
      { text: "Scoring narrative strength against Authenticity Rubric",       detail: "Challenge · Causal humility · Evidence · Lessons" },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploringChallenge?.id]);

  const handleAddToNarrative = (tip: GapTip) => {
    if (!exploringChallenge) return;
    const allGapsList = getGapTips(exploringChallenge);
    // Compute what the next tip will be after this one is dismissed (on send)
    const hypotheticalDismissed = new Set([...dismissedGaps, tip.id]);
    const nextTip = allGapsList.find((g) => !hypotheticalDismissed.has(g.id)) ?? null;
    pendingNextTipRef.current = nextTip;
    pendingTipIdRef.current = tip.id;
    setPendingGapDimNum(tip.dimensionNum);
    onPrefillPrompt?.("");
    onSetGuidanceReply?.(tip.dimensionLabel);
    // Note: dismissedGaps is NOT updated here — the widget stays visible without buttons
    // until the user actually sends the prompt (handled in handleGapResponse)
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'Open Sans', sans-serif" }}>

      {/* Initial thinking before Q1 */}
      {(phase === "q0-thinking" || phase === "q1" || phase === "q1-thinking" || phase === "q2" || phase === "q2b" || phase === "q2-thinking" || phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && (
        <WizardThoughtProcess
          steps={q0ThinkingSteps}
          onComplete={() => setPhase((p) => p === "q0-thinking" ? "q1" : p)}
        />
      )}

      {/* Q1: Outcome Areas */}
      {phase !== "q0-thinking" && (
        <AiBlock>
          <AiText>
            Hi, I&apos;m here to help you build a results narrative. To start, select an outcome area you&apos;d like to focus on, or ask me which areas the World Bank is doing well in.
          </AiText>
          <div style={{ opacity: phase === "q1" ? 1 : 0.45, pointerEvents: phase === "q1" ? "auto" : "none" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {outcomeAreas.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => phase === "q1" && handleTypedAreas(a.name)}
                  style={{
                    padding: "6px 12px", borderRadius: 100, fontSize: 13,
                    fontFamily: "'Open Sans', sans-serif",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.88)",
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </AiBlock>
      )}

      {/* User directly selected an area (no question asked first) */}
      {!questionText && phase !== "q1" && typedAreaText && <UserBubble text={typedAreaText} />}

      {/* User asked a question */}
      {questionText && phase !== "q1" && <UserBubble text={questionText} />}

      {/* Thinking while researching the question */}
      {phase === "q1-question" && <WizardThoughtProcess steps={q1QuestionSteps} />}

      {/* AI answer: suggested outcome areas */}
      {questionText && (phase === "q1-answer" || phase === "q1-thinking" || phase === "q2" || phase === "q2b" || phase === "q2-thinking" || phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && (
        <AiBlock>
          <AiText>In FY25, the World Bank has made its strongest progress in these outcome areas:</AiText>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SUGGESTED_AREAS.map((a) => (
              <div key={a.name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#34D399", fontSize: 16, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>•</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontFamily: "'Open Sans', sans-serif", lineHeight: 1.55, color: "rgba(255,255,255,0.88)" }}>
                    <strong style={{ fontWeight: 600 }}>{a.name}</strong>
                    <span style={{ color: "rgba(255,255,255,0.55)" }}>{" — "}{a.stat}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: 12.5, fontFamily: "'Open Sans', sans-serif", lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>
                    {a.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <AiText>Would you like to build your results narrative in one of these areas?</AiText>
        </AiBlock>
      )}

      {/* User types their area after seeing the AI's question-answer — renders AFTER the AI response */}
      {questionText && phase !== "q1" && typedAreaText && <UserBubble text={typedAreaText} />}

      {/* Thinking after areas — suppressed when outcome area was pre-filled from prompt */}
      {!initialOutcomeArea && (phase === "q1-thinking" || phase === "q2" || phase === "q2b" || phase === "q2-thinking" || phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && (
        <WizardThoughtProcess steps={q1ThinkingSteps} />
      )}

      {/* Q2: Country Scope */}
      {(phase === "q2" || phase === "q2b" || phase === "q2-thinking" || phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && (
        <AiBlock>
          <AiText>OK, for <strong style={{ fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>{typedAreaText}</strong> — what geographical subset would you like to focus on?</AiText>
          <SelectionChips
            label="Country Scope"
            options={COUNTRY_OPTIONS}
            selected={countrySubset ? [countrySubset] : []}
            onSelect={handleCountrySelect}
            disabled={phase !== "q2"}
          />
        </AiBlock>
      )}

      {/* By Region — follow-up region selection (suppressed when region was pre-filled) */}
      {byRegionChosen && !initialCountryId && (phase === "q2b" || phase === "q2-thinking" || phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && (
        <>
          <UserBubble text="By Region" />
          <AiBlock>
            <AiText>Which region would you like to focus on?</AiText>
            <SelectionChips
              label="Region"
              options={REGION_OPTIONS}
              selected={REGION_OPTIONS.some((r) => r.id === countrySubset) ? [countrySubset!] : []}
              onSelect={handleRegionSelect}
              disabled={phase !== "q2b"}
            />
          </AiBlock>
        </>
      )}

      {/* User submits country (or region after q2b) */}
      {(phase === "q2-thinking" || phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && (
        <UserBubble text={selectedCountryLabel} />
      )}

      {/* Thinking after country — suppressed when country was pre-filled from prompt */}
      {!initialCountryId && (phase === "q2-thinking" || phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && (
        <WizardThoughtProcess steps={q2ThinkingSteps} />
      )}

      {/* Q3: Challenge carousel — round 0 (first time) */}
      {(phase === "q3" || phase === "q3-thinking" || phase === "q3-exploring") && exploreReturnCount === 0 && (
        <AiBlock>
          <AiText>
            I analysed {totals.pads.toLocaleString()} PADs, {totals.isrs.toLocaleString()} ISRs, and {totals.icrs.toLocaleString()} ICRs and found {challengeSets.length} challenge sets for {selectedCountryLabel}. Pick one to expand into a narrative.
          </AiText>
          <ChallengeCarousel
            challenges={challengeSets}
            selectedId={selectedChallengeId}
            onSelect={handleChallengeSelect}
            onExplore={handleChallengeExplore}
            hideExplore={(phase === "q3-thinking" || phase === "q3-exploring") && exploreReturnCount === 0}
          />
        </AiBlock>
      )}

      {/* Explore: user bubble — shown immediately on click, round 0 */}
      {(phase === "q3-thinking" || phase === "q3-exploring") && exploringChallenge && exploreReturnCount === 0 && (
        <UserBubble text={`Explore: ${exploringChallenge.shortTitle}`} />
      )}

      {/* Explore: thinking animation — round 0 */}
      {phase === "q3-thinking" && exploringChallenge && exploreReturnCount === 0 && (
        <WizardThoughtProcess
          steps={q3ThinkingSteps}
          onComplete={() => setPhase("q3-exploring")}
        />
      )}

      {/* Explore detail — round 0 */}
      {phase === "q3-exploring" && exploringChallenge && exploreReturnCount === 0 && (() => {
        const c = exploringChallenge;
        const strength = narrativeStrength(c);
        return (
          <AiBlock>
            <AiText>{c.summary}</AiText>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.62)", fontFamily: "'Open Sans', sans-serif" }}>
              {`The evidence base covers ${c.padCount.toLocaleString()} PADs, ${c.isrCount.toLocaleString()} ISRs, and ${c.icrCount.toLocaleString()} ICRs across ${c.countryCount} IDA countries, with `}
              <span style={{ color: "rgba(255,255,255,0.62)" }}>{c.indicators.join(", ")}</span>
              {" as the key indicators tracked. "}
              {c.countryExamples.map((ex) => ex.name).join(", ")}
              {" are among the most active country cases. "}
              {"Indicator momentum is "}
              <strong style={{ color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>{c.movementTag}</strong>
              {" — "}
              {c.indicatorMovement.charAt(0).toLowerCase() + c.indicatorMovement.slice(1)}
              {". The challenge carries a "}
              <strong style={{ color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>{strength.toLowerCase()}</strong>
              {" narrative overall, based on evidence density and country coverage."}
            </p>
          </AiBlock>
        );
      })()}

      {/* Explore other narratives — new response with fresh carousel */}
      {exploreReturnCount > 0 && (
        <>
          <UserBubble text="Explore other narratives" />
          <AiBlock>
            <AiText>
              Here are all {challengeSets.length} narrative angles for {selectedCountryLabel}. Select another to explore in more detail.
            </AiText>
            <ChallengeCarousel
              challenges={challengeSets}
              selectedId={selectedChallengeId}
              onSelect={handleChallengeSelect}
              onExplore={handleChallengeExplore}
              hideExplore={(phase === "q3-thinking" || phase === "q3-exploring") && exploreReturnCount > 0}
            />
          </AiBlock>
        </>
      )}

      {/* Explore: user bubble — shown immediately on click, round > 0 */}
      {(phase === "q3-thinking" || phase === "q3-exploring") && exploringChallenge && exploreReturnCount > 0 && (
        <UserBubble text={`Explore: ${exploringChallenge.shortTitle}`} />
      )}

      {/* Explore: thinking animation — round > 0 */}
      {phase === "q3-thinking" && exploringChallenge && exploreReturnCount > 0 && (
        <WizardThoughtProcess
          steps={q3ThinkingSteps}
          onComplete={() => setPhase("q3-exploring")}
        />
      )}

      {/* Explore detail — after returning from first explore */}
      {phase === "q3-exploring" && exploringChallenge && exploreReturnCount > 0 && (() => {
        const c = exploringChallenge;
        const strength = narrativeStrength(c);
        return (
          <AiBlock>
            <AiText>{c.summary}</AiText>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.62)", fontFamily: "'Open Sans', sans-serif" }}>
              {`The evidence base covers ${c.padCount.toLocaleString()} PADs, ${c.isrCount.toLocaleString()} ISRs, and ${c.icrCount.toLocaleString()} ICRs across ${c.countryCount} IDA countries, with `}
              <span style={{ color: "rgba(255,255,255,0.62)" }}>{c.indicators.join(", ")}</span>
              {" as the key indicators tracked. "}
              {c.countryExamples.map((ex) => ex.name).join(", ")}
              {" are among the most active country cases. "}
              {"Indicator momentum is "}
              <strong style={{ color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>{c.movementTag}</strong>
              {" — "}
              {c.indicatorMovement.charAt(0).toLowerCase() + c.indicatorMovement.slice(1)}
              {". The challenge carries a "}
              <strong style={{ color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>{strength.toLowerCase()}</strong>
              {" narrative overall, based on evidence density and country coverage."}
            </p>
          </AiBlock>
        );
      })()}
      {showGeneratePrompt && <UserBubble text="Generate Narrative" />}
      {showRefinePrompt && exploringChallenge && (() => {
        const c = exploringChallenge;
        const allGaps = getGapTips(c);
        const visibleGaps = allGaps.filter((g) => !dismissedGaps.has(g.id));
        const F = "'Open Sans', sans-serif";
        return (
          <>
            {/* Breakdown — permanent */}
            <AiBlock>
              <AiText>
                Your narrative draft is ready. I&apos;ve structured it across five sections drawing on{" "}
                <strong style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{(c.padCount + c.isrCount + c.icrCount).toLocaleString()} project documents</strong>{" "}
                across <strong style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{c.countryCount} IDA countries</strong>:
              </AiText>
              <ul style={{ margin: "4px 0 0", padding: "0 0 0 4px", listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { label: "Opening", body: `Frames ${c.shortTitle.toLowerCase()} as a structural constraint — what the data shows and why it persists` },
                  { label: "Challenge", body: `Examines root causes behind stalled progress on ${c.indicators[0] ?? "key indicators"}, with constraints named explicitly` },
                  { label: "Pathways to Outcomes", body: "Traces the full Theory of Change: Constraint → WBG Support → Intermediate Outcome → High-Level Development Outcome" },
                  { label: "Country Examples", body: `Draws on ${c.countryExamples.slice(0, 3).map((e) => e.name).join(", ")} — co-owned by government ministries with IDA support` },
                  { label: "Lessons Learned", body: `Surfaces what ${c.icrCount} FY25 ICRs reveal about what worked, what stalled, and what the evidence recommends` },
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
                Review each section in the panel to the right. The <strong style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>Narrative Strength</strong> score tracks how well each dimension holds up against the Authenticity Rubric — it updates as you work through the guidance below.
              </p>
            </AiBlock>

            {/* First guidance tip — only before any round has been submitted */}
            {guidanceRounds.length === 0 && (
              <AiBlock>
                {visibleGaps.length > 0 ? (
                  <>
                    <AiText>
                      I&apos;ve identified{" "}
                      <strong style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{allGaps.length} area{allGaps.length > 1 ? "s" : ""}</strong>{" "}
                      where the narrative can be strengthened before sharing with senior management or shareholders.
                      {" "}Click <strong style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>Add to Narrative</strong>, then type what you want to change in the prompt bar and send.
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
                    All {allGaps.length} guidance checks have been addressed. Your narrative meets the Authenticity Rubric across all five dimensions and is ready to share with senior management or shareholders.
                  </AiText>
                )}
              </AiBlock>
            )}
          </>
        );
      })()}

      {/* Guidance rounds — one exchange per submitted response */}
      {showRefinePrompt && exploringChallenge && guidanceRounds.map((round, i) => {
        const allGaps = getGapTips(exploringChallenge);
        const F = "'Open Sans', sans-serif";
        return (
          <React.Fragment key={i}>
            <UserBubble text={round.userText} />
            {round.thinking ? (
              <AiBlock>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[62, 44, 70].map((w, j) => (
                    <div key={j} style={{ height: 12, width: `${w}%`, borderRadius: 8, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 100%)", backgroundSize: "200% 100%", animation: "nbShimmer 1.4s ease-in-out infinite", animationDelay: `${j * 0.18}s` }} />
                  ))}
                </div>
              </AiBlock>
            ) : (
              <AiBlock>
                {round.nextTip ? (
                  <>
                    <AiText>
                      Good addition — I&apos;ve woven that language in. Here&apos;s the next area to strengthen:
                    </AiText>
                    <NarrativeGuidanceWidget
                      key={round.nextTip.id}
                      tip={round.nextTip}
                      onDismiss={(id) => setDismissedGaps((prev) => new Set([...prev, id]))}
                      onAddToNarrative={handleAddToNarrative}
                      buttonsHidden={i < guidanceRounds.length - 1}
                    />
                  </>
                ) : (
                  <AiText>
                    All {allGaps.length} guidance checks have been addressed. Your narrative meets the Authenticity Rubric across all five dimensions and is ready to share with senior management or shareholders.
                  </AiText>
                )}
              </AiBlock>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
