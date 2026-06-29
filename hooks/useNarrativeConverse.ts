
import { useCallback, useEffect, useRef, useState } from "react";
import {
  streamConverse,
  type ConverseMessage,
} from "@/lib/narrativeApi";
import {
  extractSkeletonBlock,
  stripSkeletonBlock,
  type ConverseSkeleton,
} from "@/lib/converse";

export interface UseNarrativeConverseOptions {
  sessionId: string | null;
  /** Seed user message — fires automatically on mount if provided. Subsequent
   *  re-renders DO NOT retrigger; pass null to disable auto-init. */
  initialUserMessage?: string | null;
  /** Fires once a complete <skeleton>…</skeleton> JSON parses successfully. */
  onSkeleton?: (skeleton: ConverseSkeleton) => void;
}

/**
 * Manages a free-form narrative-building chat: full message history,
 * streaming assistant turns, in-stream skeleton extraction, and re-prompt
 * support for "make changes" loops. All state lives in React; the server is
 * stateless for converse itself (session cache is grounding data only).
 */
export function useNarrativeConverse({
  sessionId,
  initialUserMessage,
  onSkeleton,
}: UseNarrativeConverseOptions) {
  // Message history visible to the user. The streaming partial assistant
  // message is held separately so we can update it on every chunk without
  // re-shuffling the array.
  const [messages, setMessages] = useState<ConverseMessage[]>([]);
  const [partialAssistant, setPartialAssistant] = useState<string | null>(null);
  const [skeleton, setSkeleton] = useState<ConverseSkeleton | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const didInitRef = useRef(false);
  const pendingTextRef = useRef<string | null>(null);
  const rafRef = useRef<number>(0);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;
      // Append the user turn and start a stream. Capture the new history
      // synchronously so the request body matches what the user sees.
      const userMsg: ConverseMessage = { role: "user", content };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setPartialAssistant("");
      setIsStreaming(true);
      setError(null);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const final = await streamConverse(
          nextHistory,
          sessionId,
          (_chunk, accumulated) => {
            // Buffer the latest text and flush to state on the next animation
            // frame — throttles re-renders to ~60fps regardless of chunk rate.
            pendingTextRef.current = stripSkeletonBlock(accumulated);
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
              if (pendingTextRef.current !== null) {
                setPartialAssistant(pendingTextRef.current);
              }
            });
          },
          ctrl.signal,
        );

        // Stream completed: cancel any pending RAF and commit the final turn.
        cancelAnimationFrame(rafRef.current);
        pendingTextRef.current = null;
        const display = stripSkeletonBlock(final);
        setMessages((prev) => [...prev, { role: "assistant", content: display }]);
        setPartialAssistant(null);

        // Parse the skeleton if present.
        const block = extractSkeletonBlock(final);
        if (block) {
          try {
            const parsed = JSON.parse(block) as ConverseSkeleton;
            setSkeleton(parsed);
            onSkeleton?.(parsed);
          } catch (e) {
            setError(`Skeleton JSON parse failed: ${String(e).slice(0, 200)}`);
          }
        }
      } catch (e) {
        cancelAnimationFrame(rafRef.current);
        pendingTextRef.current = null;
        if ((e as { name?: string })?.name === "AbortError") return;
        setError(String(e));
        setPartialAssistant(null);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, sessionId, isStreaming, onSkeleton],
  );

  // Auto-fire the seed message once. Subsequent prop changes don't retrigger;
  // call clear() then re-mount if you need a fresh conversation.
  useEffect(() => {
    if (didInitRef.current) return;
    if (!initialUserMessage?.trim()) return;
    didInitRef.current = true;
    void sendMessage(initialUserMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abort any in-flight stream on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    cancelAnimationFrame(rafRef.current);
    pendingTextRef.current = null;
    setMessages([]);
    setPartialAssistant(null);
    setSkeleton(null);
    setIsStreaming(false);
    setError(null);
    didInitRef.current = false;
  }, []);

  return {
    messages,
    partialAssistant,
    skeleton,
    isStreaming,
    error,
    sendMessage,
    clear,
  };
}
