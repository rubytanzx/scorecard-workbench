
import { useCallback, useRef, useState } from "react";
import {
  extractNarrativeParams,
  type ExistingChips,
  type ExtractedParams,
} from "@/lib/narrativeApi";

/**
 * One narrative-building session: a UUID, the LLM-extracted params, and the
 * 1-sentence intent. Lazily creates the UUID on first runExtract so we don't
 * cut session boundaries until the user actually hits send.
 */
export function useNarrativeSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [extractedParams, setExtractedParams] = useState<ExtractedParams | null>(null);
  const [vague, setVague] = useState(false);
  // Track whether the most recent extract call is still in-flight, so the
  // submit handler can await a clean state before transitioning.
  const inFlight = useRef<Promise<ExtractedParams | null> | null>(null);

  const intent = extractedParams?.intent ?? null;

  /** Generate (or reuse) the session UUID and fire Call 0. Returns the
   *  extracted params or null on failure. Also stores them in state. */
  const runExtract = useCallback(
    async (freeText: string, existingChips: ExistingChips = {}): Promise<ExtractedParams | null> => {
      const sid = sessionId ?? (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      if (!sessionId) setSessionId(sid);

      const p = extractNarrativeParams(freeText, existingChips, sid);
      inFlight.current = p;
      const params = await p;
      // Ignore stale responses if another extract started in the meantime.
      if (inFlight.current !== p) return params;
      inFlight.current = null;

      if (!params) {
        setExtractedParams(null);
        setVague(false);
        return null;
      }
      setExtractedParams(params);
      const noneOf3 =
        params.geography == null && params.sector == null && params.outcome_area == null;
      setVague(noneOf3);
      return params;
    },
    [sessionId],
  );

  /** Reset everything — call when the user closes the narrative or hits the X. */
  const clearSession = useCallback(() => {
    setSessionId(null);
    setExtractedParams(null);
    setVague(false);
    inFlight.current = null;
  }, []);

  return {
    sessionId,
    extractedParams,
    intent,
    vague,
    runExtract,
    clearSession,
  };
}
