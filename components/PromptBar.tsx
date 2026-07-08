
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  IconArrowUp,
  IconPlus,
  IconNotebook,
  IconCheck,
  IconX,
  IconSparkles,
  IconPaperclip,
  IconPhoto,
} from "@tabler/icons-react";
import MadLibsInput, { type PopulateChips } from "./MadLibsInput";
import type { NarrativePhase } from "../app/page";
import { useTheme } from "@/contexts/ThemeContext";


type Mode = "hero" | "bottom";
type WidthMode = "compact" | "wide";

interface Props {
  mode: Mode;
  /** "compact" = 580px (home), "wide" = 680px (conversation —
   * matches the DataIntroChat input column). */
  widthMode?: WidthMode;
  /** Forwarded to parent ~3s after submit so it can swap into conversation view. */
  onComplete?: (text: string) => void;
  /** External value control (so action pills on the home page can fill the bar). */
  value: string;
  onChange: (v: string) => void;
  holdMs?: number;
  /** Fires when the "Create narrative" chip is clicked (only in conversation mode). */
  onCreateNarrative?: () => void;
  /** When true, shift the bar left to leave room for an open right-side panel. */
  panelOpen?: boolean;
  /** Width of the right-side panel (used to compute the shifted center). */
  panelWidth?: number;
  /** When dragging the panel resize handle, skip CSS transitions for live feedback. */
  suppressTransition?: boolean;
  /** Show the "Create narrative" chip (only in conversation mode). */
  showCreateChip?: boolean;
  /** Current phase of the narrative creation flow — controls which chips to show. */
  narrativePhase?: NarrativePhase;
  /** Fires when the user clicks "Yes, create narrative" in skeleton-ready phase. */
  onNarrativeConfirm?: () => void;
  /** Fires when the user clicks "Make changes" in skeleton-ready phase. */
  onNarrativeMakeChanges?: () => void;
  /** When true, the "Yes, create narrative" button is disabled (no skeleton picked yet). */
  narrativeConfirmDisabled?: boolean;
  /** When set, renders a "Refining: <title>" reference chip above the input.
   * Submits route to `onRefineSubmit` instead of being no-ops. */
  refiningChip?: { title: string; onDismiss: () => void };
  /** Called when the user hits Enter / clicks Submit while a refining chip
   *  is active. Receives the typed text and is expected to clear the field. */
  onRefineSubmit?: (text: string) => void;
  /** When set, renders a "Create narrative" tag chip above the input. The
   *  next submit routes to onCreateNarrativeSubmit instead of starting a
   *  regular conversation. Mutually exclusive with refiningChip. */
  createNarrativeChip?: { onDismiss: () => void };
  /** Called when the user hits Enter / clicks Submit while the
   *  create-narrative tag is active. */
  onCreateNarrativeSubmit?: (text: string) => void;
  /** When true, submit doesn't trigger a new conversation transition. */
  inConversation?: boolean;
  /** Fires immediately when the user hits Enter / clicks send. Lets the parent
   *  scroll the home view back to the hero before the beam runs. */
  onSubmit?: () => void;
  /** When set, renders an "Editing: [excerpt]" chip above the input and routes
   *  submit to onContentModifySubmit. Mutually exclusive with other chips. */
  contentModifyChip?: { text: string; onDismiss: () => void };
  onContentModifySubmit?: (instruction: string) => void;
  /** When set, renders a teal "Replying to: [label]" chip above the input
   *  to indicate the user is responding to a Narrative Guidance tip. */
  guidanceReplyChip?: { label: string; onDismiss: () => void };
  /** Optional ref forwarded to the underlying text input so parent can call .focus(). */
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Contextual action chips surfaced dynamically by the wizard above the bar. */
  contextChips?: { id: string; label: string }[];
  /** Called when a context chip is clicked. */
  onContextChipClick?: (id: string) => void;
  /** Async pre-flight (Call 0) the parent runs before submission completes.
   *  Return proceed=false to keep the bar visible and render `message` inline
   *  below the input (e.g. "Could you be more specific?"). When proceed=true,
   *  the normal beam + onComplete pipeline runs. Receives the raw prompt; the
   *  parent is responsible for chip-population side effects via populateChips. */
  beforeSubmit?: (prompt: string) => Promise<{ proceed: boolean; message?: string | null }>;
  /** Threaded into MadLibsInput so the parent can auto-fill empty chips after
   *  Call 0 returns. Pass a NEW object reference to retrigger the populate effect. */
  populateChips?: PopulateChips | null;
  /** When true, renders in normal document flow instead of position:fixed.
   *  Used on the home page so the bar scrolls with the page content. */
  inline?: boolean;
}

const HERO_TOP = 424;
const PILL_HEIGHT = 48;
// Extra height added to the docked bar when a refining chip is rendered above
// the input row. Used to shift the bar (and its accessory chips/glow) upward
// so the bottom edge stays within the viewport.
const REFINING_EXTRA = 38;
const BOTTOM_GAP = 40;

export default function PromptBar({
  mode,
  widthMode = "compact",
  onComplete,
  value,
  onChange,
  holdMs = 3000,
  onCreateNarrative,
  panelOpen = false,
  panelWidth = 0,
  suppressTransition = false,
  showCreateChip = false,
  narrativePhase = "idle" as NarrativePhase,
  onNarrativeConfirm,
  onNarrativeMakeChanges,
  narrativeConfirmDisabled = false,
  inline = false,
  refiningChip,
  onRefineSubmit,
  createNarrativeChip,
  onCreateNarrativeSubmit,
  inConversation = false,
  onSubmit,
  contentModifyChip,
  onContentModifySubmit,
  guidanceReplyChip,
  inputRef,
  beforeSubmit,
  populateChips,
  contextChips = [],
  onContextChipClick,
}: Props) {
  // Inline "be more specific" message shown when Call 0 returns all-nulls.
  const [vagueMessage, setVagueMessage] = useState<string | null>(null);
  // True while Call 0 is in flight — prevents double-submit + lets the parent
  // animate a subtle spinner state if it wants to.
  const [preflightInFlight, setPreflightInFlight] = useState(false);
  // Run the parent's Call 0 pre-flight. Returns true if submission should
  // proceed, false if it should be cancelled (e.g. vague input).
  const runPreflight = async (prompt: string): Promise<boolean> => {
    if (!beforeSubmit) return true;
    if (preflightInFlight) return false;
    setVagueMessage(null);
    setPreflightInFlight(true);
    try {
      const r = await beforeSubmit(prompt);
      if (!r.proceed) {
        setVagueMessage(r.message ?? "Could you be more specific? Try adding a region, sector, or topic.");
        return false;
      }
      return true;
    } finally {
      setPreflightInFlight(false);
    }
  };
  // Clear the vagueness message as soon as the user edits the input again.
  useEffect(() => {
    if (vagueMessage) setVagueMessage(null);
    // intentionally only watches `value` — clearing on user typing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const widthCss = widthMode === "wide"
    ? `min(1020px, calc(100vw - ${panelWidth}px - 48px))`
    : "min(580px, calc(100% - 32px))";
  const expandedWidthCss = "min(1020px, calc(100% - 48px))";

  const leftCss = panelOpen
    ? `calc((100vw - ${panelWidth}px) / 2)`
    : "50%";

  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [narrativeSuffix, setNarrativeSuffix] = useState("");
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  // ── Suggestions dropdown ──────────────────────────────────────────────────
  const formRef = useRef<HTMLFormElement | null>(null);

  const isBottom = mode === "bottom";
  const hasChip = !!refiningChip || !!createNarrativeChip || !!contentModifyChip || !!guidanceReplyChip;
  const extraHeight = hasChip ? REFINING_EXTRA : 0;

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const triggerBeam = (v: string) => {
    onSubmit?.();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    timers.current.push(setTimeout(() => {
      setSubmitted(false);
      requestAnimationFrame(() => setSubmitted(true));
    }, 0));
    timers.current.push(setTimeout(() => onComplete?.(v), holdMs));
  };

  const submitDirect = (text: string) => {
    if (!text.trim() || isBottom) return;
    onChange(text);
    onSubmit?.();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    timers.current.push(setTimeout(() => {
      setSubmitted(false);
      requestAnimationFrame(() => setSubmitted(true));
    }, 0));
    timers.current.push(setTimeout(() => onComplete?.(text), holdMs));
  };

  const submit = async () => {
    const v = value.trim();
    if (!v) return;
    // Content-modify flow: hand the instruction to the panel and exit.
    if (onContentModifySubmit) {
      onContentModifySubmit(v);
      onChange("");
      return;
    }
    // Refining flow: short-circuit the new-conversation path and hand the
    // text to the parent's refinement handler instead.
    if (onRefineSubmit) {
      onRefineSubmit(v);
      return;
    }
    // Landing-page "Create a narrative" flow: open the conversation directly
    // in the planning phase instead of running the AI Q&A path.
    if (onCreateNarrativeSubmit) {
      if (!(await runPreflight(v))) return;
      onSubmit?.();
      const beamDelay = isBottom ? 700 : 0;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      timers.current.push(setTimeout(() => {
        setSubmitted(false);
        requestAnimationFrame(() => setSubmitted(true));
      }, beamDelay));
      timers.current.push(setTimeout(() => onCreateNarrativeSubmit(v), beamDelay + holdMs));
      return;
    }
    if (inConversation) return;
    if (!(await runPreflight(v))) return;
    onSubmit?.();
    const beamDelay = isBottom ? 700 : 0;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    timers.current.push(setTimeout(() => {
      setSubmitted(false);
      requestAnimationFrame(() => setSubmitted(true));
    }, beamDelay));
    timers.current.push(setTimeout(() => onComplete?.(v), beamDelay + holdMs));
  };

  useEffect(() => {
    if (mode !== "hero") { setSubmitted(false); setExpanded(false); }
  }, [mode]);

  // When the create-narrative chip activates in bottom-bar mode, pre-fill the
  // parent value with the fixed prefix and reset the local suffix field.
  // Dependency is the boolean coercion so this only fires on activate/deactivate.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!createNarrativeChip) { setNarrativeSuffix(""); return; }
    setNarrativeSuffix("");
    onChange("Create a narrative ");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!createNarrativeChip]);

  // Close expanded when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is inside the expanded card
      const card = document.getElementById("madlibs-card");
      if (card && !card.contains(target)) setExpanded(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [expanded]);

  // Close plus menu on outside click
  useEffect(() => {
    if (!plusMenuOpen) return;
    const handle = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [plusMenuOpen]);

  const handleMadLibsSubmit = async (prompt: string) => {
    if (!(await runPreflight(prompt))) {
      // Keep the MadLibs card open so the user can edit; populated chips
      // will already be visible (parent sets populateChips on extract).
      onChange(prompt);
      return;
    }
    setExpanded(false);
    onChange(prompt);
    // Landing-page create-narrative mode owns its own completion callback —
    // run the beam visualisation, then dispatch to it instead of onComplete.
    if (onCreateNarrativeSubmit) {
      onSubmit?.();
      timers.current.forEach(clearTimeout);
      timers.current = [];
      timers.current.push(setTimeout(() => {
        setSubmitted(false);
        requestAnimationFrame(() => setSubmitted(true));
      }, 0));
      timers.current.push(setTimeout(() => onCreateNarrativeSubmit(prompt), holdMs));
      return;
    }
    triggerBeam(prompt);
  };

  const handleMadLibsAllPlaced = (prompt: string) => {
    onChange(prompt);
    // In create-narrative mode we keep MadLibs visible so the user can still
    // add or remove pills; let the explicit submit drive completion.
    if (onCreateNarrativeSubmit) return;
    setExpanded(false);
  };

  return (
    <>
      <style>{`
        .dark-pb input::placeholder,
        .dark-pb textarea::placeholder { color: rgba(255,255,255,0.38); }
        .light-pb input::placeholder,
        .light-pb textarea::placeholder { color: rgba(0,13,26,0.38); }
        .light-pb input, .light-pb textarea { color: rgba(0,13,26,0.90); }
        .dark-pb-menu-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; cursor: pointer;
          transition: background 0.1s; user-select: none;
          font-family: 'Open Sans', sans-serif; font-size: 14px;
          color: rgba(255,255,255,0.88);
        }
        .dark-pb-menu-row:hover { background: rgba(255,255,255,0.1); }
        .dark-pb-menu-row:last-child { border-bottom: none; }
        .light-pb-menu-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; cursor: pointer;
          transition: background 0.1s; user-select: none;
          font-family: 'Open Sans', sans-serif; font-size: 14px;
          color: #3D5166;
        }
        .light-pb-menu-row:hover { background: rgba(0,57,107,0.06); }
        .light-pb-menu-row:last-child { border-bottom: none; }
      `}</style>
      {/* BEAM */}
      {submitted && !isBottom && (
        <div
          aria-hidden
          className="fixed pointer-events-none overflow-hidden"
          style={{ top: 75, left: 0, right: 0, height: 360, zIndex: 45 }}
        >
          <div
            className="prompt-beam absolute"
            style={{
              top: 0,
              left: "50%",
              width: "min(1400px, 100vw)",
              height: 280,
              transform: "translateX(-50%)",
              borderRadius: "50%",
            }}
          />
        </div>
      )}
      {submitted && !isBottom && (
        <div
          aria-hidden
          className="prompt-stroke fixed left-0 right-0"
          style={{ top: 72, height: 3, zIndex: 55 }}
        />
      )}
      {submitted && !isBottom && isDark && (
        <div
          aria-hidden
          className="prompt-dim-overlay fixed left-0 right-0 bottom-0"
          style={{ top: 72, zIndex: 40 }}
        />
      )}

      {/* Contextual wizard chips — appear above the bar when the wizard
          surfaces an action (e.g. "Proceed with results narrative"). */}
      {isBottom && contextChips.length > 0 && (
        <div
          className={`fixed flex justify-end gap-2 ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
          style={{
            left: leftCss,
            transform: "translateX(-50%)",
            top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 36 + extraHeight}px)`,
            width: widthCss,
            zIndex: 50,
            transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {contextChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onContextChipClick?.(chip.id)}
              className="flex items-center gap-1.5 active:scale-[0.98]"
              style={{
                padding: "5px 13px",
                borderRadius: 100,
                fontSize: 12.5,
                fontFamily: "'Open Sans', sans-serif",
                border: isDark ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(0,57,107,0.20)",
                background: isDark ? "rgba(80,90,105,0.88)" : "rgba(255,255,255,0.92)",
                color: isDark ? "rgba(255,255,255,0.90)" : "rgba(0,13,26,0.80)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isDark ? undefined : "0 2px 8px rgba(0,57,107,0.10)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Narrative chips — "Yes / Make changes" pair shown only in
          skeleton-ready phase after a card is selected. The earlier
          "Create narrative" entry point now lives on the landing page. */}
      {isBottom && showCreateChip && narrativePhase === "skeleton-ready" && (
        <div
          className={`fixed flex justify-end gap-2 ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
          style={{
            left: leftCss,
            transform: "translateX(-50%)",
            top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 36 + extraHeight}px)`,
            width: widthCss,
            zIndex: 50,
            transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <button
            type="button"
            onClick={() => onNarrativeMakeChanges?.()}
            className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-full active:scale-[0.98] transition-colors"
            style={{ color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            Make changes
          </button>
          <button
            type="button"
            onClick={() => onNarrativeConfirm?.()}
            disabled={narrativeConfirmDisabled}
            aria-disabled={narrativeConfirmDisabled}
            className={
              "flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-full shadow-sm transition-colors" +
              (narrativeConfirmDisabled
                ? " cursor-not-allowed"
                : " active:scale-[0.98]")
            }
            style={narrativeConfirmDisabled
              ? { color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.10)" }
              : { color: "#ffffff", background: "#0b6fd3", border: "1px solid #0b6fd3" }
            }
          >
            <IconCheck size={12} />
            Yes, create narrative
          </button>
        </div>
      )}

      {/* Mild ambient glow behind the docked prompt bar on the home
          view. Hidden in conversation/viewer/workspace flows. */}
      {isBottom && !inConversation && (
        <div
          aria-hidden
          className="prompt-bottom-glow fixed pointer-events-none"
          style={{
            left: leftCss,
            top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 40 + extraHeight}px)`,
            width: widthCss,
            height: PILL_HEIGHT + 80 + extraHeight,
            zIndex: 49,
          }}
        />
      )}

      {/* ── Single bar — same pill, grows taller when expanded ── */}
      <form
        ref={formRef}
        id="madlibs-card"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        onDoubleClick={!isBottom ? () => submitDirect("What proportion of Scorecard results in IDA countries is being achieved with Norway's money?") : undefined}
        className={inline ? "" : `fixed ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
        style={inline ? {
          position: "relative",
          width: "100%",
          maxWidth: widthCss,
          margin: "0 auto",
          zIndex: 50,
        } : {
          left: leftCss,
          transform: "translateX(-50%)",
          top: isBottom
            ? `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + extraHeight}px)`
            : `${HERO_TOP}px`,
          width: !isBottom && expanded ? expandedWidthCss : widthCss,
          zIndex: 50,
          transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
          className={`${isDark ? "dark-pb" : "light-pb"} ${
            (!isBottom && expanded) || hasChip
              ? "rounded-[28px]"
              : "rounded-full cursor-text"
          }`}
          style={{
            background: isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.16)" : "1px solid rgba(0, 57, 107, 0.20)",
            transitionProperty: "border-radius, box-shadow, border-color",
            transitionDuration: "200ms",
            boxShadow: inConversation
              ? isDark ? "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)" : "0 4px 24px rgba(0,57,107,0.12)"
              : isDark ? "0 0 0 1px rgba(255,255,255,0.08), 0 0 32px rgba(180,220,255,0.10), 0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 4px 24px rgba(0,57,107,0.10), 0 1px 4px rgba(0,57,107,0.08)",
          }}
          onClick={() => {
            if (refiningChip) return;
            // Create-narrative mode: expand to MadLibs as before.
            if (createNarrativeChip) {
              if (!expanded) setExpanded(true);
              return;
            }
            if (inConversation) return;
          }}
        >
          <div className="flex flex-col">
            {refiningChip && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium max-w-full ${isDark ? "bg-[rgba(167,139,250,0.18)] border border-violet-400/60 text-violet-200" : "bg-[rgba(109,68,207,0.08)] border border-violet-300 text-violet-700"}`}>
                  <span className="opacity-70 shrink-0">Refining:</span>
                  <span className="truncate">{refiningChip.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      refiningChip.onDismiss();
                    }}
                    aria-label="Cancel refining"
                    className="ml-0.5 -mr-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-violet-200/70 transition-colors shrink-0"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              </div>
            )}
            {guidanceReplyChip && !refiningChip && !contentModifyChip && !createNarrativeChip && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium max-w-full ${isDark ? "bg-[rgba(52,211,153,0.12)] border border-emerald-400/40 text-emerald-200" : "bg-[rgba(16,185,129,0.08)] border border-emerald-300 text-emerald-700"}`}>
                  <span className="opacity-60 shrink-0">Replying to:</span>
                  <span className="truncate max-w-[220px]">{guidanceReplyChip.label}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); guidanceReplyChip.onDismiss(); }}
                    aria-label="Cancel reply"
                    className="ml-0.5 -mr-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-emerald-200/40 transition-colors shrink-0"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              </div>
            )}
            {contentModifyChip && !refiningChip && !createNarrativeChip && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium max-w-full ${isDark ? "bg-[rgba(167,139,250,0.18)] border border-violet-400/60 text-violet-200" : "bg-[rgba(109,68,207,0.08)] border border-violet-300 text-violet-700"}`}>
                  <IconSparkles size={11} className={`shrink-0 ${isDark ? "text-violet-300" : "text-violet-500"}`} />
                  <span className="opacity-60 shrink-0">Editing:</span>
                  <span className="truncate max-w-[200px]">{contentModifyChip.text}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); contentModifyChip.onDismiss(); }}
                    aria-label="Cancel editing"
                    className="ml-0.5 -mr-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-violet-200/70 transition-colors shrink-0"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              </div>
            )}
            {createNarrativeChip && !refiningChip && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold max-w-full ${isDark ? "bg-[rgba(167,139,250,0.18)] border border-violet-400/60 text-violet-200" : "bg-[rgba(109,68,207,0.08)] border border-violet-300 text-violet-700"}`}>
                  <IconNotebook size={11} className="shrink-0" />
                  <span className="truncate">Create narrative</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      createNarrativeChip.onDismiss();
                    }}
                    aria-label="Cancel create narrative"
                    className="ml-0.5 -mr-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-violet-200/70 transition-colors shrink-0"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              </div>
            )}
            {!isBottom && (expanded || createNarrativeChip) ? (
              <MadLibsInput
                initialText={value}
                onSubmit={handleMadLibsSubmit}
                onDismiss={() => {
                  // In create-narrative mode there's no separate "collapse"
                  // state to fall back to — leave the bar in MadLibs so the
                  // user can keep editing. In regular mode, dismiss as usual.
                  if (!createNarrativeChip) setExpanded(false);
                }}
                onAllPlaced={handleMadLibsAllPlaced}
                includeOutcomeArea={!!createNarrativeChip}
                placeholder={
                  createNarrativeChip
                    ? "Which outcome area, country scope, and challenge type should the narrative cover?"
                    : undefined
                }
                populateChips={populateChips}
              />
            ) : (
            <div className={`flex items-center gap-2 px-4 ${hasChip ? "pb-3 pt-1" : "py-2.5"}`}>
              {isBottom && createNarrativeChip ? (
                <IconNotebook aria-hidden="true" size={15} className="text-violet-400 shrink-0" />
              ) : (
                <div ref={plusMenuRef} style={{ position: "relative", flexShrink: 0 }}>
                  <button
                    type="button"
                    aria-label="Add attachment"
                    aria-haspopup="menu"
                    aria-expanded={plusMenuOpen}
                    onClick={(e) => { e.stopPropagation(); setPlusMenuOpen(v => !v); }}
                    style={{
                      width: 26, height: 26, borderRadius: "50%", border: "none",
                      background: plusMenuOpen ? (isDark ? "rgba(255,255,255,0.18)" : "rgba(0,57,107,0.10)") : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: isDark ? "rgba(255,255,255,0.55)" : "#3D5166",
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={e => { if (!plusMenuOpen) e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,13,26,0.90)"; }}
                    onMouseLeave={e => { if (!plusMenuOpen) e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.55)" : "#3D5166"; }}
                  >
                    <IconPlus size={15} stroke={2} />
                  </button>
                  {plusMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Attachment options"
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 10px)",
                        left: 0,
                        width: 172,
                        background: isDark ? "rgba(14,28,42,0.92)" : "rgba(255,255,255,0.97)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: isDark ? "1px solid rgba(255,255,255,0.13)" : "1px solid rgba(0,57,107,0.14)",
                        borderRadius: 12,
                        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)" : "0 8px 32px rgba(0,57,107,0.14)",
                        overflow: "hidden",
                        zIndex: 60,
                      }}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className={isDark ? "dark-pb-menu-row" : "light-pb-menu-row"}
                        style={{ width: "100%", background: "none", border: "none", textAlign: "left", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,57,107,0.08)" }}
                        onClick={() => setPlusMenuOpen(false)}
                      >
                        <IconPaperclip aria-hidden="true" size={15} stroke={1.6} style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4E6174", flexShrink: 0 }} />
                        Add File
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={isDark ? "dark-pb-menu-row" : "light-pb-menu-row"}
                        style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
                        onClick={() => setPlusMenuOpen(false)}
                      >
                        <IconPhoto aria-hidden="true" size={15} stroke={1.6} style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4E6174", flexShrink: 0 }} />
                        Add Photo
                      </button>
                    </div>
                  )}
                </div>
              )}
              {isBottom && createNarrativeChip ? (
                <>
                  <span aria-hidden="true" className="text-[14px] font-medium shrink-0 select-none" style={{ color: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,13,26,0.80)" }}>
                    Create a narrative
                  </span>
                  <input
                    type="text"
                    value={narrativeSuffix}
                    onChange={(e) => {
                      setNarrativeSuffix(e.target.value);
                      onChange("Create a narrative " + e.target.value);
                      if (submitted) setSubmitted(false);
                    }}
                    placeholder="for protection for the poorest in Sub-Saharan Africa"
                    className="flex-1 bg-transparent text-[14px] outline-none"
                    style={{ color: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,13,26,0.88)" }}
                    aria-label="Create a narrative – add topic or region"
                    autoFocus
                  />
                </>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    if (submitted) setSubmitted(false);
                  }}
                  onFocus={() => {}}
                  placeholder={
                    guidanceReplyChip
                      ? "Describe the change you want to apply to this section…"
                      : contentModifyChip
                      ? "Describe the change you want to make to this passage…"
                      : refiningChip
                      ? "Describe the changes you want to make…"
                      : isBottom
                      ? "Ask a follow-up question"
                      : "What do you want to learn about the Scorecard?"
                  }
                  className="flex-1 bg-transparent text-[14px] outline-none"
                  style={{ color: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,13,26,0.88)" }}
                  aria-label="Search the scorecard"
                  autoFocus={!!contentModifyChip}
                />
              )}
              <div className="flex items-center gap-1.5 shrink-0">
                {value.trim() && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChange(""); if (submitted) setSubmitted(false); }}
                    className="p-1.5 rounded-full transition-colors"
                    style={{ color: isDark ? "rgba(255,255,255,0.40)" : "#4E6174" }}
                    onMouseEnter={e => { e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.80)" : "rgba(0,13,26,0.85)"; e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,57,107,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.40)" : "#4E6174"; e.currentTarget.style.background = "transparent"; }}
                    aria-label="Clear input"
                  >
                    <IconX size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                  style={{
                    background: value.trim()
                      ? (isDark ? "rgba(255,255,255,0.92)" : "#0071BC")
                      : (isDark ? "rgba(255,255,255,0.18)" : "rgba(0,57,107,0.10)"),
                    color: value.trim()
                      ? (isDark ? "#0f2030" : "#ffffff")
                      : (isDark ? "rgba(255,255,255,0.45)" : "rgba(0,13,26,0.35)"),
                  }}
                  aria-label="Submit"
                >
                  <IconArrowUp size={14} />
                </button>
              </div>
            </div>
            )}
          </div>
        </motion.div>
        {vagueMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 px-4 py-2 text-[12.5px] rounded-lg"
            style={{
              background: "rgba(252, 211, 77, 0.12)",
              border: "1px solid rgba(252, 211, 77, 0.35)",
              color: "rgba(254, 240, 138, 0.95)",
            }}
          >
            {vagueMessage}
          </div>
        )}
      </form>

      {/* ── Bottom scrim + disclaimer (bottom mode only) ── */}
      {isBottom && !inline && (
        <>
          {/* Gradient scrim — prevents scrolled content showing through the bar area */}
          <div
            aria-hidden
            className="fixed pointer-events-none"
            style={{
              left: 0,
              right: panelOpen ? panelWidth : 0,
              bottom: 0,
              height: PILL_HEIGHT + BOTTOM_GAP + 48,
              zIndex: 48,
              background: `linear-gradient(to bottom, transparent 0%, var(--pg-bg-solid) 36%)`,
            }}
          />
          {/* Disclaimer text — centred under the bar, same width/left as the bar */}
          <div
            aria-hidden
            className="fixed pointer-events-none"
            style={{
              left: leftCss,
              transform: "translateX(-50%)",
              width: widthCss,
              bottom: 0,
              height: BOTTOM_GAP,
              zIndex: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{
              fontSize: 11,
              color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,57,107,0.38)",
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "0.01em",
              textAlign: "center",
            }}>
              AI-generated analysis based on IDA Scorecard FY25 data. Verify figures against official WBG publications before citing.
            </span>
          </div>
        </>
      )}

    </>
  );
}
