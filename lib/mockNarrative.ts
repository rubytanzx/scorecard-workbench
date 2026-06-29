/**
 * Mock responses for the narrative builder flow.
 * Activated by NEXT_PUBLIC_MOCK=1 — the real LLM routes stay intact.
 * Fill in the stubs below once the flow is confirmed.
 */

import type { ExtractedParams } from "./narrativeApi";
import type { NarrativeSkeleton } from "@/components/conversation/NarrativeSkeletons";
import type { GenerateResult } from "./narrativeApi";

// ─── Call 0: extract ─────────────────────────────────────────────────────────

export const MOCK_EXTRACTED_PARAMS: ExtractedParams = {
  geography: null,
  sector: null,
  outcome_area: null,
  institution: null,
  intent: "mock intent — replace me",
};

// ─── Call 1: match ───────────────────────────────────────────────────────────

export const MOCK_SKELETONS: NarrativeSkeleton[] = [
  {
    id: "mock-narrative-1",
    marker: "I",
    title: "Mock Narrative — replace me",
    outcomeArea: { code: "OA-1", label: "Protection for the Poorest" },
    openingClaim: "Placeholder opening claim.",
    keyResults: [
      { value: "0M", consequence: "placeholder result" },
    ],
    challengeText: "Placeholder challenge text.",
    interventionText: "Placeholder intervention text.",
    countryExamples: [
      { name: "Country A", flag: "🌍", description: "Placeholder description." },
      { name: "Country B", flag: "🌍", description: "Placeholder description." },
    ],
    extraCountryExample: { name: "Global", flag: "🌍", description: "" },
    extraCountryReasoning: "Placeholder reasoning.",
    pathways: {
      challenge: "Placeholder challenge.",
      wbgApproach: "Placeholder approach.",
      outcomes: "Placeholder outcomes.",
      longTermImpact: "Placeholder long-term impact.",
    },
    lessonsText: "Placeholder lessons.",
    sourceCounts: { pads: 0, isrs: 0, icrs: 0 },
  },
];

// ─── Call 2: generate ─────────────────────────────────────────────────────────

export const MOCK_GENERATE_RESULT: GenerateResult = {
  skeleton: MOCK_SKELETONS[0],
  narrative: {
    opening_line: "Placeholder opening line.",
    key_results: ["Placeholder key result 1.", "Placeholder key result 2."],
    challenge: "Placeholder challenge.",
    intervention: "Placeholder intervention.",
    pathway_to_outcome: "Placeholder pathway to outcome.",
    lessons_learned: ["Placeholder lesson 1.", "Placeholder lesson 2."],
  },
};

// ─── Converse ────────────────────────────────────────────────────────────────

export const MOCK_CONVERSE_RESPONSE = "This is a mock assistant response. Replace me with the real flow.";
