/**
 * Narrative Builder API — mock-only client.
 * All calls return static mock data from lib/mockNarrative.ts.
 */

import {
  MOCK_EXTRACTED_PARAMS,
  MOCK_SKELETONS,
  MOCK_GENERATE_RESULT,
  MOCK_CONVERSE_RESPONSE,
} from "./mockNarrative";

import type {
  NarrativeSkeleton,
  OutcomeAreaTag,
} from "@/components/conversation/NarrativeSkeletons";
import type { NarrativeFilters } from "./narrativeTypes";

export type { NarrativeFilters };

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ExistingChips {
  geography?: string | null;
  sector?: string | null;
  outcome_area?: string | null;
  institution?: string | null;
}

export interface ExtractedParams {
  geography: string | null;
  sector: string | null;
  outcome_area: string | null;
  institution: string | null;
  intent: string | null;
}

export interface GeneratedNarrativeContent {
  opening_line: string;
  key_results: string[];
  challenge: string;
  intervention: string;
  pathway_to_outcome: string;
  lessons_learned: string[];
  hero_stat?: { value: string; caption: string };
  indicators?: { label: string; value: string }[];
}

export interface GenerateResult {
  skeleton: NarrativeSkeleton;
  narrative: GeneratedNarrativeContent;
}

export interface WBGNarrative {
  slug: string;
  url: string;
  category: string;
  shortLabel: string;
  title: string;
  summary: string;
  iconPath: string;
  countries: string[];
  topStats: { value: string; label: string }[];
}

export interface ConverseMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Mock implementations ─────────────────────────────────────────────────────

export async function extractNarrativeParams(
  _freeText: string,
  _existingChips: ExistingChips = {},
  _sessionId?: string,
): Promise<ExtractedParams | null> {
  return { ...MOCK_EXTRACTED_PARAMS };
}

export async function fetchMatchedSkeletons(
  _query: string,
  _filters?: NarrativeFilters,
  _sessionId?: string,
  _intent?: string | null,
): Promise<NarrativeSkeleton[] | null> {
  return [...MOCK_SKELETONS];
}

export async function generateNarrativeSkeleton(
  _slug: string,
  _sessionId?: string,
): Promise<GenerateResult | null> {
  return { ...MOCK_GENERATE_RESULT };
}

export async function fetchNarrativeDetails(
  _sessionId?: string,
): Promise<WBGNarrative[] | null> {
  return null;
}

export async function fetchNarrativeDetail(
  _slug: string,
  _sessionId?: string,
): Promise<WBGNarrative | null> {
  return null;
}

export async function streamConverse(
  _messages: ConverseMessage[],
  _sessionId: string | null | undefined,
  onChunk: (text: string, accumulated: string) => void,
  _signal?: AbortSignal,
): Promise<string> {
  onChunk(MOCK_CONVERSE_RESPONSE, MOCK_CONVERSE_RESPONSE);
  return MOCK_CONVERSE_RESPONSE;
}

export async function fetchNarrativeTopics(
  _sessionId?: string,
): Promise<Array<{ slug: string; category: string; title: string; url: string }> | null> {
  return null;
}
