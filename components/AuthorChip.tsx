import { type Author } from "@/lib/mockData";

interface Props {
  author: Author;
  size?: "sm" | "xs";
  onDark?: boolean;
}

export default function AuthorChip({ author, size, onDark }: Props) {
  const small = size === "xs";
  return (
    <div className="flex items-center gap-1 shrink-0">
      <div
        className={`${small ? "w-[18px] h-[18px] text-[7px]" : "w-[22px] h-[22px] text-[8px]"} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
        style={{ backgroundColor: author.color }}
        aria-hidden="true"
      >
        {author.initials}
      </div>
      <span className={`line-clamp-2 ${small ? "text-[9.5px]" : "text-[11px]"} ${onDark ? "text-white/85" : "text-gray-600"}`}>{author.name}</span>
    </div>
  );
}
