
import { IconChartLine, IconArrowRight } from "@tabler/icons-react";
import { type FeaturedStory } from "@/lib/mockData";
import StoryThumbnail from "./StoryThumbnail";
import AuthorChip from "./AuthorChip";
import InstitutionLogos from "./InstitutionLogos";

interface Props {
  story: FeaturedStory;
  noImage?: boolean;
}

export default function FeaturedStoryCard({ story, noImage }: Props) {
  return (
    <article className="group relative flex overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300">
      {/* Content side */}
      <div className="flex-1 flex flex-col justify-between p-5 min-w-0">
        <div className="flex flex-col gap-3">
          <h3 className="text-[19px] font-bold text-gray-900 leading-[1.3] tracking-tight group-hover:text-blue-700 transition-colors">
            {story.headline}
          </h3>
          <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-4">
            {story.description}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-gray-400">Workspace Type: {story.workspaceType}</span>
            <IconChartLine size={11} className="text-gray-400" />
          </div>
        </div>

        {/* Sources + author */}
        <div className="flex items-center justify-between mt-4">
          <InstitutionLogos institutions={story.institutions} />
          <AuthorChip author={story.author} />
        </div>

        {/* Divider + CTA */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {story.ctaLabel && (
            <span className="group/cta flex items-center gap-1 text-[12px] text-blue-600 font-semibold hover:text-blue-700 transition-colors w-fit">
              {story.ctaLabel}
              <IconArrowRight size={12} className="group-hover/cta:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>

      {/* Image / Thumbnail side */}
      {!noImage && (story.thumbVariant ? (
        <StoryThumbnail
          variant={story.thumbVariant}
          className="hidden sm:block w-[280px] lg:w-[320px] shrink-0"
        />
      ) : story.imageSrc ? (
        <div className="hidden sm:block relative w-[280px] lg:w-[320px] shrink-0 overflow-hidden">
          <img
            src={story.imageSrc}
            alt={story.imageAlt ?? ""} 
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      ) : null)}
    </article>
  );
}
