// components/conversation/InteractiveElementsMessage.tsx
//
// AI message that confirms which interactive elements have already been
// added to the narrative draft. The user no longer picks visuals here —
// the AI announces what it added, and any changes go through the chat.


import { IconCheck } from "@tabler/icons-react";
import { type NarrativeSkeleton } from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";
import type { InteractiveElement } from "../../app/page";

interface Props {
  /** Flow + skeleton id let us reference the chosen angle specifically in
   *  the recommendation copy. */
  flow: FlowId;
  skeletonId: string | null;
  /** Real matched skeletons (grounded). Used to resolve the chosen angle. */
  skeletons: NarrativeSkeleton[];
  /** Kept for API compatibility with the previous toggleable picker — the
   *  AI now bakes the recommendation into the prose so this prop is unused
   *  at render time. */
  selected?: InteractiveElement[];
  active: boolean;
  /** Kept for API compatibility — see `selected`. */
  onToggle?: (el: InteractiveElement) => void;
  onProceed: () => void;
}

export default function InteractiveElementsMessage({
  flow,
  skeletonId,
  active,
  onProceed,
  skeletons,
}: Props) {
  void flow;
  const skeleton =
    skeletonId == null
      ? null
      : skeletons.find((s) => s.id === skeletonId) ?? null;

  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          {skeleton ? (
            <>
              For{" "}
              <span className="font-semibold text-gray-900">
                &ldquo;{skeleton.title}&rdquo;
              </span>
              {" "}across{" "}
              <span className="font-medium text-gray-900">
                {skeleton.countryExamples[0].flag} {skeleton.countryExamples[0].name}
              </span>{" "}
              and{" "}
              <span className="font-medium text-gray-900">
                {skeleton.countryExamples[1].flag} {skeleton.countryExamples[1].name}
              </span>
              {" "}({skeleton.sourceCounts.icrs} ICRs over multiple project cycles),
              I&apos;ve added an{" "}
              <span className="font-semibold text-gray-900">interactive map</span>{" "}
              — country-level coverage compares directly — and a{" "}
              <span className="font-semibold text-gray-900">time-series chart</span>{" "}
              to show how outcomes evolved across cohorts. Both are wired into the
              draft below.
            </>
          ) : (
            <>
              I&apos;ve added the recommended interactive elements to the draft below.
            </>
          )}
        </p>

        <p className="text-[12.5px] text-gray-500 leading-relaxed">
          If you&apos;d like to swap, remove, or add anything, just let me know — otherwise hit proceed.
        </p>

        {active && (
          <div>
            <button
              type="button"
              onClick={onProceed}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-1.5 rounded-full bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-colors"
            >
              <IconCheck size={12} stroke={3} />
              Proceed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
