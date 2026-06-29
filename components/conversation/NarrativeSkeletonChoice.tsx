// components/conversation/NarrativeSkeletonChoice.tsx
//
// Renders the AI assistant message + 4 narrative-angle cards as a horizontal
// scroll-snap carousel in the skeleton-ready phase. Each card shows the
// Challenge in full, the Interventions with a fade-out mask, and the Country
// examples as flag chips. The expand icon top-right opens a full preview panel.


import { useEffect, useRef, useState } from "react";
import { IconArrowsMaximize, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { type NarrativeSkeleton } from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";
import type { WBGNarrative } from "@/lib/narrativeApi";

interface Props {
  flow: FlowId;
  selectedSkeletonId: string | null;
  onSelect: (id: string | null) => void;
  /** Opens the preview panel for a given skeleton id. */
  onPreview: (id: string) => void;
  /** Closes the preview panel — fired when the user clicks the selected
   *  card again to deselect. */
  onPreviewClose?: () => void;
  /** When true, animate the lead text + stagger the cards in. */
  animate: boolean;
  dark?: boolean;
  /** When provided (guided discovery flow), shows a context card above the
   *  skeleton carousel so the user sees the matched narrative data first. */
  guidedNarrative?: WBGNarrative;
  /** Real matched skeletons to render (grounded in narratives.json via /match). */
  skeletons: NarrativeSkeleton[];
  /** True while /match is in flight. */
  loading?: boolean;
  /** True when /match failed or returned nothing. */
  error?: boolean;
}

export default function NarrativeSkeletonChoice({
  flow,
  selectedSkeletonId,
  onSelect,
  onPreview,
  onPreviewClose,
  animate,
  dark = false,
  guidedNarrative,
  skeletons,
  loading = false,
  error = false,
}: Props) {
  void flow;

  // Sum source counts across the 4 skeletons for the lead-text message.
  const totals = skeletons.reduce(
    (acc, s) => ({
      pads: acc.pads + s.sourceCounts.pads,
      isrs: acc.isrs + s.sourceCounts.isrs,
      icrs: acc.icrs + s.sourceCounts.icrs,
    }),
    { pads: 0, isrs: 0, icrs: 0 },
  );

  const leadText = guidedNarrative
    ? `Based on the ${guidedNarrative.category} narrative, I found ${skeletons.length} angles you could develop. Pick one to expand.`
    : `I analysed ${totals.pads.toLocaleString()} PADs, ${totals.isrs.toLocaleString()} ISRs, and ${totals.icrs.toLocaleString()} ICRs and found ${skeletons.length} angles for this narrative. Pick one to expand.`;

  // Active index = which card is centred (focal) in the deck. Side cards
  // tilt away in 3D and are dimmed; clicking one brings it to focus.
  const [activeIndex, setActiveIndex] = useState(0);

  const goToCard = (i: number) => {
    setActiveIndex(Math.max(0, Math.min(skeletons.length - 1, i)));
  };
  const stepBy = (dir: -1 | 1) => goToCard(activeIndex + dir);

  // Mount-in transition: fade the whole deck up the first time the
  // skeleton-ready phase opens. Each card uses its own deck transform.
  const [mountedIn, setMountedIn] = useState(!animate);
  useEffect(() => {
    if (!animate) {
      setMountedIn(true);
      return;
    }
    setMountedIn(false);
    const t = setTimeout(() => setMountedIn(true), 250);
    return () => clearTimeout(t);
  }, [animate]);

  if (loading) {
    return <p className={`text-[13px] ${dark ? "text-[#94A3B8]" : "text-gray-500"}`}>Matching narratives…</p>;
  }
  if (error || skeletons.length === 0) {
    return (
      <p className={`text-[13px] ${dark ? "text-[#FCA5A5]" : "text-red-600"}`}>
        Couldn&apos;t generate narrative angles. Check that the API is configured, then retry.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 narrative-content-enter">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">{leadText}</p>

        {/* Guided narrative context card — shown when the user went through
            the guided discovery flow so they can see the matched data before
            picking an angle. */}
        {guidedNarrative && (
          <div className={`rounded-xl border overflow-hidden ${dark ? "bg-[#1E293B] border-[#334155]" : "bg-white border-gray-200"}`}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 shrink-0">
                <img
                  src={guidedNarrative.iconPath}
                  alt={guidedNarrative.category}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2 py-px rounded text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${dark ? "bg-[rgba(2,136,209,0.18)] text-[#38BDF8]" : "bg-blue-50 text-[#0288D1]"}`}>
                  {guidedNarrative.category}
                </span>
                <p className={`text-[12.5px] font-semibold leading-snug truncate ${dark ? "text-[#F1F5F9]" : "text-gray-900"}`}>
                  {guidedNarrative.title}
                </p>
              </div>
            </div>
            {/* Stats row */}
            <div className={`grid grid-cols-3 gap-px border-t ${dark ? "border-[#334155] bg-[#334155]" : "border-gray-100 bg-gray-100"}`}>
              {guidedNarrative.topStats.map((stat, i) => (
                <div key={i} className={`px-3 py-2.5 ${dark ? "bg-[#1E293B]" : "bg-white"}`}>
                  <div className={`text-[14px] font-bold leading-tight ${dark ? "text-[#38BDF8]" : "text-[#0288D1]"}`}>
                    {stat.value}
                  </div>
                  <div className={`text-[10.5px] leading-snug mt-0.5 ${dark ? "text-[#64748B]" : "text-gray-500"}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className={`px-4 py-3 border-t ${dark ? "border-[#334155]" : "border-gray-100"}`}>
              <p className={`text-[12px] leading-relaxed ${dark ? "text-[#94A3B8]" : "text-gray-600"}`}>
                {guidedNarrative.summary}
              </p>
            </div>
          </div>
        )}

        {/* Flat carousel — cards flush to the left edge. Next card peeks on
            the right and the right-edge gradient overlay fades it out. */}
        <div className="group relative h-[440px] flex items-center overflow-hidden">
          {skeletons.map((s, i) => {
            const offset = i - activeIndex;
            const abs = Math.abs(offset);
            const isFocal = offset === 0;
            const hidden = abs > 2;
            // Flat horizontal offset — no rotation, no Z, no scale.
            const cardTransform = `translateX(${offset * 340}px)`;
            return (
              <div
                key={s.id}
                style={{
                  transform: cardTransform,
                  opacity: hidden ? 0 : mountedIn ? 1 : 0,
                  pointerEvents: hidden ? "none" : "auto",
                  zIndex: 10 - abs,
                  transition:
                    "transform 500ms cubic-bezier(0.22,1,0.36,1)," +
                    " opacity 400ms ease-out",
                  willChange: "transform, opacity",
                }}
                className="absolute"
              >
                <SkeletonCard
                  skeleton={s}
                  selected={selectedSkeletonId === s.id}
                  focal={isFocal}
                  dark={dark}
                  onClick={() => {
                    // Any click rotates the card to focus; selecting also
                    // opens the preview drawer. Re-clicking the already-
                    // selected card deselects and closes the drawer.
                    goToCard(i);
                    if (selectedSkeletonId === s.id) {
                      onSelect(null);
                      onPreviewClose?.();
                    } else {
                      onSelect(s.id);
                      onPreview(s.id);
                    }
                  }}
                />
              </div>
            );
          })}

          {/* Right-edge fade overlay — dissolves the peeking next card into
              the page background. Colour matches the dark/light bg. */}
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-40 pointer-events-none z-20"
            style={{
              background: dark
                ? "linear-gradient(to left, #112531 0%, #112531 30%, rgba(17,37,49,0) 100%)"
                : "linear-gradient(to left, #fff 0%, #fff 30%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Edge arrows — fade in on container hover. Disabled at endpoints. */}
          <CarouselArrow
            direction="left"
            disabled={activeIndex === 0}
            onClick={() => stepBy(-1)}
          />
          <CarouselArrow
            direction="right"
            disabled={activeIndex >= skeletons.length - 1}
            onClick={() => stepBy(1)}
          />
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {skeletons.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to angle ${i + 1}`}
              aria-current={activeIndex === i ? "true" : undefined}
              onClick={() => goToCard(i)}
              className={
                "rounded-full transition-all duration-200" +
                (activeIndex === i
                  ? " w-4 h-1.5 bg-violet-500"
                  : " w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({
  skeleton,
  selected,
  focal,
  dark = false,
  onClick,
}: {
  skeleton: NarrativeSkeleton;
  selected: boolean;
  focal: boolean;
  dark?: boolean;
  onClick: () => void;
}) {
  const { outcomeArea, openingClaim, keyResults, challengeText, countryExamples } = skeleton;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={
        "group relative w-[320px] h-[420px] flex flex-col rounded-2xl cursor-pointer overflow-hidden" +
        " transition-[border-color,box-shadow,background-color] duration-200" +
        (selected
          ? (dark
              ? " bg-[#1E293B] border border-violet-400 shadow-[0_0_0_1px_rgba(167,139,250,0.25),0_18px_36px_-12px_rgba(139,92,246,0.30)]"
              : " bg-violet-50 border border-violet-300 shadow-[0_18px_36px_-12px_rgba(124,58,237,0.35),0_2px_6px_rgba(124,58,237,0.08)]")
          : focal
            ? (dark
                ? " bg-[#1E293B] border border-[#334155] shadow-[0_18px_36px_-12px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3)] hover:bg-[#253347] hover:border-violet-700"
                : " bg-white border border-gray-200 shadow-[0_18px_36px_-12px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)] hover:bg-violet-50 hover:border-violet-200")
            : (dark
                ? " bg-[#1E293B] border border-[#334155] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] hover:bg-[#253347]"
                : " bg-white border border-gray-200 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)] hover:bg-violet-50"))
      }
    >
      {/* Header — outcome-area tag + expand icon */}
      <div className="shrink-0 flex items-start gap-2 px-4 pt-4">
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center max-w-full text-[10.5px] font-medium px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">
            <span className="truncate">{outcomeArea.label}</span>
          </span>
        </div>
        {focal && (
          <span
            aria-hidden
            className="shrink-0 w-7 h-7 -mr-1 -mt-0.5 flex items-center justify-center rounded-md text-gray-400"
          >
            <IconArrowsMaximize size={14} />
          </span>
        )}
      </div>

      {/* Opening claim — large bold one-sentence impact statement */}
      <div className="shrink-0 px-4 pt-2">
        <p
          className={
            "text-[14.5px] font-semibold leading-snug line-clamp-3" +
            (dark ? " text-[#F1F5F9]" : " text-gray-900")
          }
        >
          {openingClaim}
        </p>
      </div>

      {/* Key results — 2-3 stat chips in a horizontal row */}
      {keyResults && keyResults.length > 0 && (
        <div className="shrink-0 px-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {keyResults.slice(0, 3).map((kr, i) => (
              <div
                key={i}
                className={
                  "inline-flex flex-col rounded-md border px-2 py-1 min-w-0 max-w-[140px]" +
                  (dark
                    ? " bg-[#0F2030] border-[#1E4060] text-[#38BDF8]"
                    : " bg-blue-50 border-blue-200 text-[#0288D1]")
                }
              >
                <span className="text-[12px] font-bold leading-tight tabular-nums truncate">
                  {kr.value}
                </span>
                <span
                  className={
                    "text-[9.5px] leading-snug mt-0.5 line-clamp-2" +
                    (dark ? " text-[#64748B]" : " text-gray-500")
                  }
                >
                  {kr.consequence}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="shrink-0 mx-4 mt-3 h-px bg-gray-200/70" />

      {/* The Challenge — truncated text with fade */}
      <div className="relative flex-1 min-h-0 px-4 pt-2.5 overflow-hidden">
        <span className={
          "block text-[10px] font-semibold uppercase tracking-wider mb-1.5" +
          (dark ? " text-[#475569]" : " text-gray-400")
        }>
          The Challenge
        </span>
        <p className={
          "text-[12px] leading-relaxed line-clamp-3" +
          (dark ? " text-[#94A3B8]" : " text-gray-600")
        }>
          {challengeText}
        </p>
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-8"
          style={{
            background: dark
              ? "linear-gradient(to bottom, transparent, #1E293B)"
              : selected
                ? "linear-gradient(to bottom, transparent, rgba(247,243,255,1))"
                : "linear-gradient(to bottom, transparent, white)",
          }}
        />
      </div>

      <div className="shrink-0 mx-4 h-px bg-gray-200/70" />

      {/* Country examples — flag emoji chips */}
      <div className="shrink-0 px-4 pt-2.5 pb-4">
        <span className={
          "block text-[10px] font-semibold uppercase tracking-wider mb-1.5" +
          (dark ? " text-[#475569]" : " text-gray-400")
        }>
          Country examples
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {countryExamples.map((c) => (
            <span
              key={c.name}
              className={
                "inline-flex items-center gap-1 text-[12px]" +
                (dark ? " text-[#CBD5E1]" : " text-gray-700")
              }
            >
              <span className="text-[13px] leading-none" aria-hidden>
                {c.flag}
              </span>
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? IconChevronLeft : IconChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Previous angle" : "Next angle"}
      onClick={onClick}
      disabled={disabled}
      className={
        "absolute top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center" +
        " rounded-full bg-white border border-gray-200 shadow-md text-gray-600" +
        " opacity-0 group-hover:opacity-100 transition-opacity" +
        " hover:text-gray-900 hover:border-gray-300" +
        " disabled:opacity-0 disabled:cursor-default" +
        (direction === "left" ? " left-2" : " right-2")
      }
    >
      <Icon size={16} />
    </button>
  );
}
