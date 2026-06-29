
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IconArrowRight, IconChartLine, IconX, IconArrowBigUp, IconArrowBigDown, IconPlugConnected } from "@tabler/icons-react";
import { type Story, story3Notebooks, story3PeerBoards } from "@/lib/mockData";
import StoryTagBadge from "./StoryTagBadge";
import StoryCard from "./StoryCard";
import InstitutionLogos from "./InstitutionLogos";
import AuthorChip from "./AuthorChip";

interface Props {
  story: Story;
  onClose: () => void;
}

export default function StoryDetailModal({ story, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Panel */}
      <div className="relative w-full max-w-[1080px] max-h-[92vh] bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-white hover:bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors shadow-sm"
        >
          <IconX size={18} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Featured story card */}
          <div className="px-6 pt-6 pb-8">
            <Link
              href={story.ctaHref}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 h-[540px] hover:shadow-lg transition-all duration-300 cursor-pointer bg-gray-900"
            >
              {/* Image */}
              {story.imageSrc && (
                <img
                  src={story.imageSrc}
                  alt={story.imageAlt ?? ""} 
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
              {/* Content overlaid at bottom */}
              <div className="absolute inset-0 flex items-end p-6">
                <div className="flex flex-col gap-2.5 w-full">
                  <StoryTagBadge tag={story.tag} />
                  <h2 className="text-[22px] font-semibold text-white leading-[1.35] tracking-[-0.25px]">
                    {story.headline}
                  </h2>
                  <div className="flex items-center gap-[2px]">
                    <span className="text-[13px] italic text-white/70">Workspace Type: </span>
                    <span className="text-[13px] text-[#60a5fa]">{story.workspaceType}</span>
                    <IconChartLine size={11} className="text-[#60a5fa] ml-[2px]" />
                  </div>
                  {/* Meta row: connectors · last updated · votes */}
                  {(story.connectors != null || story.lastUpdated || story.upvotes != null) && (
                    <div className="flex items-center gap-3">
                      {story.connectors != null && (
                        <span className="flex items-center gap-1 text-[12px] text-white/60">
                          <IconPlugConnected size={12} />
                          {story.connectors} connectors
                        </span>
                      )}
                      {story.lastUpdated && (
                        <span className="text-[12px] text-white/60">Updated {story.lastUpdated}</span>
                      )}
                      {story.upvotes != null && (
                        <span className="flex items-center gap-2 ml-auto">
                          <span className="flex items-center gap-0.5">
                            <IconArrowBigUp size={14} className="text-emerald-400" />
                            <span className="text-[12px] text-emerald-400">{story.upvotes}</span>
                          </span>
                          <span className="flex items-center gap-0.5">
                            <IconArrowBigDown size={14} className="text-red-400" />
                            <span className="text-[12px] text-red-400">{story.downvotes ?? 0}</span>
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  {/* Sources + author */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <InstitutionLogos institutions={story.institutions} onDark />
                    <AuthorChip author={story.author} onDark />
                  </div>
                  {/* Divider + CTA */}
                  <div className="pt-2 border-t border-white/20">
                    {story.ctaLabel && (
                      <span className="flex items-center gap-1 text-[13px] font-semibold text-[#93c5fd] w-fit">
                        {story.ctaLabel}
                        <IconArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Body */}
          <div className="px-9 pt-0 pb-8 flex flex-col gap-10">
            {/* Related notebooks */}
            <section>
              <h2 className="text-[20px] font-semibold text-[#212121] leading-[1.4] tracking-[-0.25px] mb-5">
                You might be interested in these
              </h2>
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {story3Notebooks.map((s) => (
                    <div key={s.id} className="w-[240px] flex-shrink-0">
                      <StoryCard story={s} overlay />
                    </div>
                  ))}
                </div>
                {/* Overflow affordance fade */}
                <div className="absolute right-0 top-0 bottom-1 w-20 bg-gradient-to-l from-white/70 to-transparent pointer-events-none" />
              </div>
            </section>

            {/* Peer country boards */}
            <section>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#212121] leading-[1.4] tracking-[-0.25px]">
                    How do LAC peers compare?
                  </h2>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    Open a peer country board to benchmark Mexico&apos;s outcomes directly
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap pb-1"
                >
                  View all boards
                  <IconArrowRight size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {story3PeerBoards.map((s) => (
                  <StoryCard key={s.id} story={s} overlay />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
