import { type StoryTag } from "@/lib/mockData";

const VARIANT_STYLES: Record<StoryTag["variant"], string> = {
  "structural-break":   "bg-orange-50 text-orange-700",
  "peer-divergence":    "bg-teal-50 text-teal-700",
  "methodology-gap":    "bg-purple-50 text-purple-700",
  "concentration-risk": "bg-rose-50 text-rose-700",
  "trend":              "bg-blue-50 text-blue-700",
  "signal":             "bg-emerald-50 text-emerald-700",
  "evidence-gap":       "bg-amber-50 text-amber-700",
};

interface Props {
  tag: StoryTag;
}

export default function StoryTagBadge({ tag }: Props) {
  return (
    <span
      className={`w-fit text-[10.5px] font-medium px-2 py-0.5 rounded-[4px] leading-tight ${VARIANT_STYLES[tag.variant]}`}
    >
      {tag.label}
    </span>
  );
}
