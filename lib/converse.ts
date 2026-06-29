export type ConverseSkeleton = {
  theme: string;
  audience: string;
  interventions: string;
  country_examples: Array<{ country: string; flag: string; detail: string }>;
  pathways_to_outcomes: {
    challenge: string;
    wbg_approach: string;
    outcomes: string;
    long_term_impact: string;
  };
  lessons_learned: string;
};

export function extractSkeletonBlock(text: string): string | null {
  const open = text.indexOf("<skeleton>");
  if (open === -1) return null;
  const close = text.indexOf("</skeleton>", open + 10);
  if (close === -1) return null;
  return text.slice(open + 10, close).trim();
}

export function stripSkeletonBlock(text: string): string {
  return text
    .replace(/<skeleton>[\s\S]*?<\/skeleton>/g, "")
    .replace(/<skeleton>[\s\S]*$/g, "")
    .trimEnd();
}
