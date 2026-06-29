// components/conversation/SkeletonRefinedMessage.tsx
//
// Renders each refinement turn as a user bubble + an AI reply that explains
// WHY a particular country was added to the skeleton. The reasoning is
// hand-authored per skeleton (see NarrativeSkeletons.extraCountryReasoning).


import { useEffect, useState } from "react";
import { type NarrativeSkeleton } from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";

interface Props {
  flow: FlowId;
  skeletonId: string;
  turns: string[];
  active: boolean;
  extraCountryApplied?: boolean;
  onProceed: () => void;
  onMakeChanges: () => void;
  /** Guided-flow skeletons — searched before FLOW_SKELETONS. */
  guidedSkeletons?: NarrativeSkeleton[];
}

export default function SkeletonRefinedMessage({
  flow,
  skeletonId,
  turns,
  guidedSkeletons = [],
}: Props) {
  void flow;
  const skeleton =
    guidedSkeletons.find((s) => s.id === skeletonId) ?? null;

  const [loadingForCount, setLoadingForCount] = useState<number | null>(null);
  useEffect(() => {
    if (turns.length === 0) return;
    setLoadingForCount(turns.length);
    const t = setTimeout(() => setLoadingForCount(null), 1000);
    return () => clearTimeout(t);
  }, [turns.length]);

  if (!skeleton) return null;
  const extra = skeleton.extraCountryExample;
  const reasoning = skeleton.extraCountryReasoning;

  return (
    <>
      {turns.map((text, i) => {
        const isLast = i === turns.length - 1;
        const isLoading = isLast && loadingForCount === turns.length;
        return (
          <div key={i} className="flex flex-col gap-4 narrative-content-enter">
            {/* User bubble */}
            <div className="self-end flex items-center gap-3 max-w-[85%]">
              <div className="bg-blue-50 text-gray-900 px-4 py-3 rounded-2xl text-[14px] leading-relaxed">
                {text}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                NT
              </div>
            </div>

            {/* AI response — explains the rationale for the added country */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
                SC
              </div>
              <div className="flex-1 min-w-0 pt-1">
                {isLoading ? (
                  <div className="flex items-center gap-1.5" aria-label="Assistant is thinking">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[13.5px] text-gray-700 leading-relaxed">
                      Added{" "}
                      <span className="inline-flex items-center gap-1 align-baseline px-1.5 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-900 font-semibold">
                        <span aria-hidden>{extra.flag}</span>
                        {extra.name}
                      </span>{" "}
                      to the country examples. {reasoning}
                    </p>
                    <p className="text-[12.5px] text-gray-500 leading-relaxed">
                      You&apos;ll see it in the preview panel under{" "}
                      <span className="text-violet-700 font-medium">Country Examples</span>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
