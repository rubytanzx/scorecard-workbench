
import { useEffect, useRef } from "react";
import { useNarrativeConverse } from "@/hooks/useNarrativeConverse";
import type { ConverseSkeleton } from "@/lib/converse";

// Avatars (matching the existing SC/NT pattern used by GuidedDiscovery/etc.).
function Avatar({ kind }: { kind: "assistant" | "user" }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
      style={{ background: "#0288D1" }}
    >
      {kind === "assistant" ? "SC" : "NT"}
    </div>
  );
}

function AssistantBubble({ text, streaming }: { text: string; streaming?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar kind="assistant" />
      <div className="text-[14px] leading-relaxed text-gray-100 whitespace-pre-wrap">
        {text}
        {streaming && (
          <span className="inline-block ml-0.5 w-[2px] h-[1em] align-text-bottom bg-gray-300 animate-pulse" />
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  // Dark-mode bubble — matches the styling of the initial prompt bubble at
  // the top of the conversation (dark translucent bg, white text), so all
  // user turns read consistently against the navy conversation background.
  return (
    <div className="self-end flex items-center gap-3 max-w-[85%] ml-auto">
      <div
        className="px-4 py-3 rounded-2xl text-[14px] whitespace-pre-wrap"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {text}
      </div>
      <Avatar kind="user" />
    </div>
  );
}

export interface NarrativeConverseProps {
  sessionId: string | null;
  /** Seeds the conversation — sent as the first user message. */
  initialUserMessage: string;
  /** Fires once the LLM emits a parseable <skeleton> block. */
  onSkeleton: (skeleton: ConverseSkeleton) => void;
  /** Lets the parent drive new user turns from outside (e.g. when the user
   *  types in the bottom prompt bar). Returns the latest sendMessage so the
   *  parent can call it from PromptBar's onSubmit. */
  onReady?: (api: { sendMessage: (text: string) => void; isStreaming: boolean }) => void;
}

export default function NarrativeConverse({
  sessionId,
  initialUserMessage,
  onSkeleton,
  onReady,
}: NarrativeConverseProps) {
  const { messages, partialAssistant, isStreaming, error, sendMessage } =
    useNarrativeConverse({
      sessionId,
      initialUserMessage,
      onSkeleton,
    });

  // Surface sendMessage to the parent so the bottom PromptBar can drive
  // follow-up turns from outside this component.
  useEffect(() => {
    onReady?.({ sendMessage, isStreaming });
  }, [sendMessage, isStreaming, onReady]);

  // Auto-scroll to the bottom on new content.
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, partialAssistant]);

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {messages.map((m, i) =>
        m.role === "assistant" ? (
          <AssistantBubble key={i} text={m.content} />
        ) : (
          <UserBubble key={i} text={m.content} />
        ),
      )}
      {partialAssistant !== null && (
        <AssistantBubble text={partialAssistant} streaming />
      )}
      {error && (
        <div
          role="alert"
          className="text-[12px] px-3 py-2 rounded-md"
          style={{ background: "rgba(248,113,113,0.12)", color: "rgba(252,165,165,0.95)", border: "1px solid rgba(248,113,113,0.35)" }}
        >
          {error}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
