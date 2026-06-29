
import { Link } from "react-router-dom";
import { IconArrowRight, IconChartLine, IconArrowBigUp, IconArrowBigDown, IconPlugConnected } from "@tabler/icons-react";
import { type Story } from "@/lib/mockData";
import StoryTagBadge from "./StoryTagBadge";
import StoryThumbnail from "./StoryThumbnail";
import AuthorChip from "./AuthorChip";
import InstitutionLogos from "./InstitutionLogos";

interface Props {
  story: Story;
  overlay?: boolean;
  noImage?: boolean;
}

const cardClass =
  "group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300";

export default function StoryCard({ story, overlay, noImage }: Props) {
  const inner = overlay ? (
    <div className="relative h-[280px] bg-gray-900">
      {story.imageSrc && (
        <img
          src={story.imageSrc}
          alt={story.imageAlt ?? ""} 
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black/95" />
      <div className="absolute inset-0 flex items-end p-3">
        <div className="flex flex-col gap-1.5 w-full">
          <StoryTagBadge tag={story.tag} />
          <h3 className="text-[13px] font-semibold text-white leading-snug line-clamp-2 min-h-[36px]">
            {story.headline}
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/85">Workspace Type: {story.workspaceType}</span>
            <IconChartLine size={9} className="text-white/85" />
          </div>
          {story.connectors != null && (
            <div className="flex items-center gap-1">
              <IconPlugConnected size={9} className="text-white/70" />
              <span className="text-[10px] text-white/70">{story.connectors} connectors</span>
            </div>
          )}
          {(story.lastUpdated || story.upvotes != null) && (
            <div className="flex items-center justify-between gap-2">
              {story.lastUpdated && (
                <span className="text-[10px] text-white/60">Updated {story.lastUpdated}</span>
              )}
              {story.upvotes != null && (
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    <IconArrowBigUp size={11} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">{story.upvotes}</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <IconArrowBigDown size={11} className="text-red-400" />
                    <span className="text-[10px] text-red-400">{story.downvotes ?? 0}</span>
                  </span>
                </span>
              )}
            </div>
          )}
          {/* Sources + author */}
          <div className="flex items-center justify-between gap-1 w-full min-h-[28px]">
            <InstitutionLogos institutions={story.institutions} onDark small />
            <AuthorChip author={story.author} size="xs" onDark />
          </div>
          {/* Divider + CTA */}
          {story.ctaLabel && (
            <div className="pt-1.5 border-t border-white/25">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#93c5fd] w-fit">
                {story.ctaLabel}
                <IconArrowRight size={10} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <>
      {/* Image / Thumbnail */}
      {!noImage && (story.thumbVariant ? (
        <StoryThumbnail variant={story.thumbVariant} className="h-[168px]" />
      ) : story.imageSrc ? (
        <div className="relative h-[168px] overflow-hidden bg-gray-100">
          <img
            src={story.imageSrc}
            alt={story.imageAlt ?? ""} 
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-[168px] bg-gradient-to-br from-slate-100 to-slate-200" />
      ))}

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-col gap-2 flex-1">
          <StoryTagBadge tag={story.tag} />
          <h3 className="text-[13.5px] font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-3">
            {story.headline}
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-[10.5px] text-gray-400">Workspace Type: {story.workspaceType}</span>
            <IconChartLine size={10} className="text-gray-400" />
          </div>
        </div>

        {/* Sources + author */}
        <div className="flex items-center justify-between mt-3">
          <InstitutionLogos institutions={story.institutions} />
          <AuthorChip author={story.author} size="xs" />
        </div>

        {/* Divider + CTA */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {story.ctaLabel && (
            <span className="group/cta flex items-center gap-1 text-[11.5px] text-blue-600 font-semibold hover:text-blue-700 transition-colors w-fit">
              {story.ctaLabel}
              <IconArrowRight size={11} className="group-hover/cta:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (story.href) {
    return <Link to={story.href} className={cardClass}>{inner}</Link>;
  }
  return <article className={cardClass}>{inner}</article>;
}
