// components/conversation/SkeletonPreviewPanel.tsx
//
// Temporary right-side panel that previews the full 5-section skeleton for a
// chosen narrative angle. Mounts in the same right-pane slot as NarrativePanel
// but renders read-only preview content. Closes via the X button or via the
// "Select this angle" CTA, which also marks the skeleton as selected.


import { useEffect, useRef, useState } from "react";
import { IconX, IconNotebook, IconCheck, IconGripVertical, IconSparkles } from "@tabler/icons-react";
import {
  type NarrativeSkeleton,
  type Pathways,
} from "./NarrativeSkeletons";
import {
  NARRATIVE_PANEL_DEFAULT_WIDTH,
  NARRATIVE_PANEL_MIN_WIDTH,
  NARRATIVE_PANEL_MAX_WIDTH,
} from "./NarrativePanel";
import type { FlowId } from "./ConversationView";
import type { ConverseSkeleton } from "@/lib/converse";
import type { ChallengeSet } from "@/lib/challengeData";
import { ARCHETYPE_META } from "@/lib/challengeData";

interface Props {
  open: boolean;
  flow: FlowId;
  /** Which skeleton to preview. When null, the panel hides regardless of `open`. */
  skeletonId: string | null;
  width: number;
  onResize: (width: number, dragging: boolean) => void;
  onClose: () => void;
  /** Called when the user clicks "Proceed to Create Full Narrative". */
  onProceed: (id: string) => void;
  /** Called when the user clicks "Make changes". */
  onMakeChanges: (id: string) => void;
  /** Refinement-turn history. */
  refinementTurns?: string[];
  /** When true, render the skeleton's extra country example. */
  extraCountryApplied?: boolean;
  /** Guided-flow skeletons — searched before FLOW_SKELETONS so generated
   *  angles (e.g. "gender-equality-results") resolve correctly. */
  guidedSkeletons?: NarrativeSkeleton[];
  /** When set, takes precedence over skeletonId/guidedSkeletons and renders
   *  the new converse-flow shape (theme, audience, interventions,
   *  country_examples, pathways_to_outcomes, lessons_learned). */
  converseSkeleton?: ConverseSkeleton | null;
  /** When set (wizard path), renders the selected challenge's real data
   *  immediately — no skeleton lookup required. */
  wizardChallenge?: ChallengeSet | null;
}

export default function SkeletonPreviewPanel({
  open,
  flow,
  skeletonId,
  width,
  onResize,
  onClose,
  onProceed,
  onMakeChanges,
  refinementTurns = [],
  extraCountryApplied = false,
  guidedSkeletons = [],
  converseSkeleton,
  wizardChallenge,
}: Props) {
  void flow;
  const skeleton =
    skeletonId == null
      ? null
      : (guidedSkeletons.find((s) => s.id === skeletonId) ?? null);
  // Converse output gets a stable id derived from theme so the existing
  // onProceed / onMakeChanges callbacks have something to pass back.
  const converseId = converseSkeleton
    ? `converse:${(converseSkeleton.theme || "draft").toLowerCase().replace(/\s+/g, "-")}`
    : null;

  const refinedCount = refinementTurns.length;
  const isRefined = refinedCount > 0;

  // When the refinement-turn count, the previewed skeleton, or the
  // extra-country toggle changes, briefly fade the body to 0 then back to 1
  // so the reader gets a visual cue that the panel content has been
  // re-derived (the "reload" the user asked for).
  const [bodyOpacity, setBodyOpacity] = useState(1);
  const lastReloadKeyRef = useRef<string>(
    `${skeletonId ?? ""}:${refinedCount}:${extraCountryApplied}`,
  );
  useEffect(() => {
    const key = `${skeletonId ?? ""}:${refinedCount}:${extraCountryApplied}`;
    if (lastReloadKeyRef.current === key) return;
    lastReloadKeyRef.current = key;
    setBodyOpacity(0);
    const t = setTimeout(() => setBodyOpacity(1), 180);
    return () => clearTimeout(t);
  }, [skeletonId, refinedCount, extraCountryApplied]);

  // Same drag-to-resize affordance as NarrativePanel, so the right pane
  // behaves identically across the three panel types.
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(width);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = startX.current - e.clientX;
      const next = Math.max(
        NARRATIVE_PANEL_MIN_WIDTH,
        Math.min(NARRATIVE_PANEL_MAX_WIDTH, startWidth.current + dx),
      );
      onResize(next, true);
    };
    const onUp = () => {
      setDragging(false);
      onResize(width, false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onResize, width]);

  const beginDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startWidth.current = width;
    setDragging(true);
  };

  return (
    <aside
      aria-hidden={!open}
      className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] flex flex-col ${
        dragging ? "" : "transition-transform duration-500 ease-in-out"
      }`}
      style={{
        width,
        transform: open ? "translateX(0)" : `translateX(${width}px)`,
        zIndex: 60,
      }}
    >
      {open && (
        <div
          onMouseDown={beginDrag}
          aria-label="Resize panel"
          role="separator"
          className="group absolute left-0 top-0 bottom-0 w-2 -translate-x-1/2 cursor-col-resize z-10 flex items-center justify-center"
        >
          <span
            className={`block h-12 w-1 rounded-full transition-colors ${
              dragging ? "bg-violet-500" : "bg-gray-200 group-hover:bg-gray-300"
            }`}
          />
          <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md p-0.5 text-gray-400 pointer-events-none shadow-sm">
            <IconGripVertical size={12} />
          </span>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
            <IconNotebook size={15} className="text-violet-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Preview
            </span>
            <span className="text-[14px] font-semibold text-gray-900 leading-none">
              Narrative angle
            </span>
          </div>
          {isRefined && (
            <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
              <IconSparkles size={10} stroke={2.5} />
              Refined{refinedCount > 1 ? ` ×${refinedCount}` : ""}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Close preview"
        >
          <IconX size={16} />
        </button>
      </header>

      {/* Body — fades briefly when refinement count changes to signal reload */}
      <div
        className="flex-1 overflow-y-auto transition-opacity duration-300"
        style={{ opacity: bodyOpacity }}
      >
        {wizardChallenge ? (
          <ChallengePreviewBody challenge={wizardChallenge} />
        ) : converseSkeleton ? (
          <ConversePreviewBody skeleton={converseSkeleton} />
        ) : skeleton ? (
          <PreviewBody
            skeleton={skeleton}
            latestRefinement={isRefined ? refinementTurns[refinedCount - 1] : null}
            extraCountryApplied={extraCountryApplied}
          />
        ) : (
          <div className="p-6 text-[12.5px] text-gray-400">
            No angle selected.
          </div>
        )}
      </div>

      {/* Footer CTA — primary action plus a "Make changes" secondary that
          flips the prompt bar into refining mode. */}
      {(skeleton || converseSkeleton || wizardChallenge) && (
        <footer className="shrink-0 border-t border-gray-100 px-5 py-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onMakeChanges(converseId ?? wizardChallenge?.id ?? skeleton!.id)}
            className="text-[12.5px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
          >
            Make changes
          </button>
          <button
            type="button"
            onClick={() => onProceed(converseId ?? wizardChallenge?.id ?? skeleton!.id)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-1.5 rounded-full bg-violet-600 text-white border border-violet-600 hover:bg-violet-700 active:scale-[0.98] transition-colors"
          >
            <IconCheck size={12} stroke={3} />
            Yes, create narrative
          </button>
        </footer>
      )}
    </aside>
  );
}

function PreviewBody({
  skeleton,
  latestRefinement,
  extraCountryApplied,
}: {
  skeleton: NarrativeSkeleton;
  latestRefinement: string | null;
  extraCountryApplied: boolean;
}) {
  const {
    title,
    outcomeArea,
    challengeText,
    interventionText,
    countryExamples,
    extraCountryExample,
    pathways,
    lessonsText,
    sourceCounts,
  } = skeleton;
  const countries = extraCountryApplied
    ? [...countryExamples, extraCountryExample]
    : countryExamples;

  // Scroll the freshly-added country into view the first time
  // extraCountryApplied transitions to true. The parent fades the body for
  // ~180ms when its reload-key changes, so we wait a bit longer than that
  // before kicking off the smooth scroll — the user sees the panel re-fade
  // back in already moving toward the new entry.
  const addedRef = useRef<HTMLLIElement | null>(null);
  const prevAppliedRef = useRef(extraCountryApplied);
  useEffect(() => {
    if (!prevAppliedRef.current && extraCountryApplied) {
      const t = setTimeout(() => {
        addedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 360);
      prevAppliedRef.current = extraCountryApplied;
      return () => clearTimeout(t);
    }
    prevAppliedRef.current = extraCountryApplied;
  }, [extraCountryApplied]);

  return (
    <div className="px-6 py-5 flex flex-col gap-6">
      {/* Title block — outcome-area tag, then title, then source caption. */}
      <div>
        <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">
          {outcomeArea.label}
        </span>
        <h2 className="mt-2 text-[20px] font-semibold text-gray-900 leading-tight">
          {title}
        </h2>
        <p className="mt-1 text-[12px] text-gray-500">
          Based on {sourceCounts.pads.toLocaleString()} PADs, {sourceCounts.isrs.toLocaleString()} ISRs, and {sourceCounts.icrs.toLocaleString()} ICRs.
        </p>
      </div>

      {latestRefinement && (
        <div className="rounded-lg border border-violet-200 bg-[rgba(167,139,250,0.06)] px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-violet-700">
            <IconSparkles size={11} stroke={2.5} />
            Your changes
          </div>
          <p className="mt-1 text-[12.5px] text-gray-800 leading-relaxed">
            “{latestRefinement}”
          </p>
        </div>
      )}

      <Section label="Summary" body={`${pathways.challenge} ${pathways.wbgApproach}`} />
      <Section label="The Challenge" body={challengeText} />
      <Section label="Interventions" body={interventionText} />

      {/* Country Examples — each country has a project-style description
          (real WB project ID + intervention) so the preview reads like the
          WBG narrative country-stories block. */}
      <div>
        <SectionLabel>Country Examples</SectionLabel>
        <ul className="mt-2 flex flex-col gap-2.5">
          {countries.map((c, i) => {
            const isAdded = extraCountryApplied && i === countries.length - 1;
            return (
              <li
                key={c.name}
                ref={isAdded ? addedRef : undefined}
                className={`flex items-start gap-2.5 scroll-mt-6 ${
                  isAdded
                    ? "-mx-2 px-2 py-1.5 rounded-md bg-violet-50/60 border border-violet-200"
                    : ""
                }`}
              >
                <span className="text-[18px] leading-none mt-0.5 shrink-0" aria-hidden>
                  {c.flag}
                </span>
                <p className="text-[13px] text-gray-800 leading-relaxed flex-1">
                  <span className="font-semibold text-gray-900">{c.name}:</span>{" "}
                  {c.description}
                  {isAdded && (
                    <span className="ml-1.5 inline-block align-middle text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded bg-violet-100 text-violet-700 border border-violet-200">
                      Added
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <PathwaysSection pathways={pathways} />
      <Section label="Lessons Learned" body={lessonsText} />
    </div>
  );
}

// Pathways to Outcomes — rendered as the WBG prompt's four labelled
// sub-bullets so the section structure mirrors the synthesis brief
// rather than collapsing into a single paragraph.
const PATHWAY_BULLETS: { key: keyof Pathways; label: string }[] = [
  { key: "challenge",       label: "Challenge"       },
  { key: "wbgApproach",     label: "WBG Approach"    },
  { key: "outcomes",        label: "Outcomes"        },
  { key: "longTermImpact",  label: "Long-term Impact"},
];

function PathwaysSection({ pathways }: { pathways: Pathways }) {
  return (
    <div>
      <SectionLabel>Pathways to Outcomes</SectionLabel>
      <ul className="mt-2 flex flex-col gap-2 pl-4 list-disc text-[13px] text-gray-800 leading-relaxed marker:text-gray-400">
        {PATHWAY_BULLETS.map(({ key, label }) => (
          <li key={key}>
            <span className="font-semibold text-gray-900">{label}:</span>{" "}
            {pathways[key]}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-2 text-[13px] text-gray-800 leading-relaxed">{body}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}

// ─── Converse-skeleton body (free-conversation flow) ────────────────────────

const CONVERSE_PATHWAY_LABELS: Array<{
  key: keyof ConverseSkeleton["pathways_to_outcomes"];
  label: string;
}> = [
  { key: "challenge",         label: "Challenge"         },
  { key: "wbg_approach",      label: "WBG Approach"      },
  { key: "outcomes",          label: "Outcomes"          },
  { key: "long_term_impact",  label: "Long-term Impact"  },
];

function ConversePreviewBody({ skeleton }: { skeleton: ConverseSkeleton }) {
  return (
    <div className="px-6 py-5 flex flex-col gap-6">
      <div>
        {skeleton.theme && (
          <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">
            {skeleton.theme}
          </span>
        )}
        <h2 className="mt-2 text-[20px] font-semibold text-gray-900 leading-tight">
          {skeleton.theme || "Narrative draft"}
        </h2>
        {skeleton.audience && (
          <p className="mt-1 text-[12px] text-gray-500">
            Audience: {skeleton.audience}
          </p>
        )}
      </div>

      {skeleton.interventions && (
        <Section label="Interventions" body={skeleton.interventions} />
      )}

      {skeleton.country_examples?.length > 0 && (
        <div>
          <SectionLabel>Country Examples</SectionLabel>
          <ul className="mt-2 flex flex-col gap-2.5">
            {skeleton.country_examples.map((c, i) => (
              <li key={`${c.country}-${i}`} className="flex items-start gap-2.5">
                <span className="text-[18px] leading-none mt-0.5 shrink-0" aria-hidden>
                  {c.flag || "🌍"}
                </span>
                <p className="text-[13px] text-gray-800 leading-relaxed flex-1">
                  <span className="font-semibold text-gray-900">{c.country}:</span>{" "}
                  {c.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {skeleton.pathways_to_outcomes && (
        <div>
          <SectionLabel>Pathways to Outcomes</SectionLabel>
          <ul className="mt-2 flex flex-col gap-2 pl-4 list-disc text-[13px] text-gray-800 leading-relaxed marker:text-gray-400">
            {CONVERSE_PATHWAY_LABELS.map(({ key, label }) => {
              const v = skeleton.pathways_to_outcomes[key];
              if (!v) return null;
              return (
                <li key={key}>
                  <span className="font-semibold text-gray-900">{label}:</span> {v}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {skeleton.lessons_learned && (
        <Section label="Lessons Learned" body={skeleton.lessons_learned} />
      )}
    </div>
  );
}

function ChallengePreviewBody({ challenge }: { challenge: ChallengeSet }) {
  const archMeta = ARCHETYPE_META[challenge.archetype];
  const outcomeLabel =
    challenge.outcomeAreaIds[0]
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Outcome Area";

  return (
    <div className="px-6 py-5 flex flex-col gap-6">
      {/* Header */}
      <div>
        <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">
          {outcomeLabel}
        </span>
        <h2 className="mt-2 text-[20px] font-semibold text-gray-900 leading-tight">
          {challenge.shortTitle}
        </h2>
        <p className="mt-1 text-[12px] text-gray-500">
          Based on {challenge.padCount.toLocaleString()} PADs,{" "}
          {challenge.isrCount.toLocaleString()} ISRs, and{" "}
          {challenge.icrCount.toLocaleString()} ICRs.
        </p>
      </div>

      <Section label="Summary" body={challenge.summary} />

      <div>
        <SectionLabel>Approach</SectionLabel>
        <p className="mt-1.5 text-[13px] text-gray-800 leading-relaxed">
          {archMeta.label}
        </p>
      </div>

      {challenge.countryExamples.length > 0 && (
        <div>
          <SectionLabel>Country Examples</SectionLabel>
          <ul className="mt-2 flex flex-col gap-2">
            {challenge.countryExamples.map((c) => (
              <li key={c.name} className="flex items-center gap-2.5">
                <span className="text-[18px] leading-none shrink-0" aria-hidden>
                  {c.flag}
                </span>
                <span className="text-[13px] font-semibold text-gray-900">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <SectionLabel>Evidence</SectionLabel>
        <ul className="mt-1.5 flex flex-col gap-1 text-[13px] text-gray-700">
          <li><span className="font-medium text-gray-900">{challenge.padCount.toLocaleString()}</span> PADs analysed</li>
          <li><span className="font-medium text-gray-900">{challenge.isrCount.toLocaleString()}</span> ISRs reviewed</li>
          <li><span className="font-medium text-gray-900">{challenge.icrCount.toLocaleString()}</span> ICRs included</li>
          <li><span className="font-medium text-gray-900">{challenge.countryCount}</span> countries covered</li>
        </ul>
      </div>
    </div>
  );
}

export {
  NARRATIVE_PANEL_DEFAULT_WIDTH,
  NARRATIVE_PANEL_MIN_WIDTH,
  NARRATIVE_PANEL_MAX_WIDTH,
};
