export interface InsightCard {
  id: string;
  question: string;
  outcome_area: string;
  indicator_code: string | null;
  accent: string;
  headline: string;
  insight: string;
  hero_stat: { value: string; caption: string } | null;
  follow_ups: string[];
  generated_at: string;
  insight_type?: "Performance Pattern" | "Benchmark Comparison" | "Tension Finding" | "Methodology Note";
  engagement_count?: number;
}
