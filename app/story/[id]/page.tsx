import { useParams, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IconArrowRight, IconChartLine } from "@tabler/icons-react";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import StoryCard from "@/components/StoryCard";
import StoryTagBadge from "@/components/StoryTagBadge";
import { secondaryStories, featuredStory, story3Notebooks, story3PeerBoards } from "@/lib/mockData";

const allStories = [featuredStory, ...secondaryStories];

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const story = allStories.find((s) => s.id === id);
  if (!story) return <Navigate to="/" replace />;

  const related = secondaryStories.filter((s) => s.id !== story.id);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col gap-12">

        {/* ── Hero overlay card ── */}
        <div className="relative w-full h-[605px] rounded-[16px] overflow-hidden">
          {/* Background image */}
          {story.imageSrc && (
            <img
              src={story.imageSrc}
              alt={story.imageAlt ?? ""}
              className="object-cover absolute inset-0 w-full h-full"
            />
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.35)] to-[rgba(0,0,0,0.72)]" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end pb-[48px] px-[33px]">
            <div className="flex flex-col gap-[16px] w-full max-w-[640px]">

              {/* Tag + headline + workspace type */}
              <div className="flex flex-col gap-[4px] overflow-hidden">
                <div className="mb-1">
                  <StoryTagBadge tag={story.tag} />
                </div>
                <h1 className="text-[38px] font-semibold text-white leading-[1.4] tracking-[-1.5px]">
                  {story.headline}
                </h1>
                <div className="flex items-center gap-[2px] mt-1">
                  <span className="text-[14px] italic text-white leading-[1.4]">
                    {"Workspace Type: "}
                  </span>
                  <span className="text-[14px] text-[#60a5fa] leading-[1.4]">
                    {story.workspaceType}
                  </span>
                  <IconChartLine size={12} className="text-[#60a5fa] ml-[2px]" />
                </div>
              </div>

              {/* Institutions + Author */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-[8px]">
                  <span className="text-[16px] font-semibold text-white leading-[1.4]">
                    {story.institutions.join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-[4px]">
                  <div
                    className="size-[16px] rounded-full flex items-center justify-center text-[5px] text-white font-normal shrink-0"
                    style={{ backgroundColor: story.author.color }}
                  >
                    {story.author.initials}
                  </div>
                  <span className="text-[16px] font-semibold text-[#b3e5fc] leading-[1.4] whitespace-nowrap">
                    {story.author.name}
                  </span>
                </div>
              </div>

              {/* CTA */}
              {story.ctaLabel && (
                <Link
                  to={story.ctaHref}
                  className="flex items-center gap-[4px] text-[16px] font-semibold text-[#c9e1ff] hover:text-white transition-colors w-fit"
                >
                  {story.ctaLabel}
                  <IconArrowRight size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── You might be interested in these ── */}
        <section>
          <h2 className="text-[24px] font-semibold text-[#212121] leading-[1.4] tracking-[-0.25px] mb-5">
            You might be interested in these
          </h2>
          {story.id === "story-3" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {story3Notebooks.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-[16px] overflow-x-auto pb-2 scrollbar-hide">
                {related.map((s) => (
                  <div key={s.id} className="w-[302px] shrink-0">
                    <StoryCard story={s} />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-[100px] bg-gradient-to-l from-white to-transparent" />
            </div>
          )}
        </section>

        {/* ── Peer country boards (story-3 only) ── */}
        {story.id === "story-3" && (
          <section>
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-[24px] font-semibold text-[#212121] leading-[1.4] tracking-[-0.25px]">
                  How do LAC peers compare?
                </h2>
                <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">
                  Open a peer country board to benchmark Mexico&apos;s outcomes directly
                </p>
              </div>
              <Link
                to="/projects"
                className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap pb-1"
              >
                View all boards
                <IconArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {story3PeerBoards.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </section>
        )}

      </main>

      <AppFooter />
    </div>
  );
}
