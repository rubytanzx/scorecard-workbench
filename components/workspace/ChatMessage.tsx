
import { useState, useEffect } from "react";
import { IconCheck, IconSparkles } from "@tabler/icons-react";
import type { Message, ConnectorItem } from "@/data/mockInteraction";

const F = "'Open Sans', sans-serif";

// ─── Reasoning animation ─────────────────────────────────────────────────────

const STEPS: { label: string; source?: string; delay: number }[] = [
  { label: "Creating analysis plan",                                  delay: 0    },
  { label: "Navigating WBG Scorecard FY25 data",  source: "FY25 Explorer", delay: 500  },
  { label: "Benchmarking Mexico against 4 peers", source: "LAC Region",    delay: 1050 },
  { label: "Identifying priority gap areas",                          delay: 1650 },
  { label: "Generating insight cards",                                delay: 2200 },
];

function Dots({ color = "#0b6fd3" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: color,
            animation: `typing-dot 1.2s ease-in-out ${i * 133}ms infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ReasoningAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.slice(1).forEach((step, idx) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(idx + 2);
          setActiveStep(idx + 1);
        }, step.delay)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {STEPS.slice(0, visibleCount).map((step, idx) => {
        const isDone = idx < activeStep;
        const isActive = idx === activeStep;

        return (
          <div
            key={idx}
            className={idx > 0 ? "card-enter" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: isDone ? 0.5 : 1,
              transition: "opacity 0.3s",
            }}
          >
            {/* Indicator — fixed 16px wide so labels stay aligned */}
            <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {isDone ? (
                <IconCheck size={13} stroke={2.5} color="#16a34a" />
              ) : isActive ? (
                <Dots />
              ) : null}
            </div>

            {/* Label */}
            <span
              style={{
                fontFamily: F,
                fontSize: 13,
                color: isDone ? "#9CA3AF" : "#1F2937",
                lineHeight: "18px",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {step.label}
              {isActive && "…"}
            </span>

            {/* Source badge */}
            {step.source && (
              <span
                style={{
                  fontFamily: F,
                  fontSize: 11,
                  color: isDone ? "#C4C4C4" : "#0b6fd3",
                  background: isDone ? "#F5F5F5" : "#EBF3FC",
                  borderRadius: 4,
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {step.source}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Content renderer (bold markdown) ────────────────────────────────────────

function renderContent(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ fontWeight: 600 }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// ─── Connector checklist ──────────────────────────────────────────────────────

function ConnectorChecklist({
  connectors,
  checkedIds,
  onToggle,
}: {
  connectors: ConnectorItem[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      {connectors.map((c, i) => (
        <label
          key={c.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderBottom: i < connectors.length - 1 ? "1px solid #F3F4F6" : "none",
            cursor: "pointer",
            background: checkedIds.has(c.id) ? "#F8FBFF" : "#FFFFFF",
            transition: "background 0.1s",
          }}
        >
          <input
            type="checkbox"
            checked={checkedIds.has(c.id)}
            onChange={() => onToggle(c.id)}
            style={{ width: 15, height: 15, accentColor: "#0b6fd3", flexShrink: 0, cursor: "pointer" }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#1F2937", lineHeight: "18px" }}>
              {c.name}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: "#9CA3AF", lineHeight: "15px", marginTop: 1 }}>
              {c.description}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatMessage({
  message,
  onAction,
  onConfirmConnectors,
}: {
  message: Message;
  onAction?: (label: string) => void;
  onConfirmConnectors?: (ids: Set<string>) => void;
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set((message.connectors ?? []).map((c) => c.id))
  );

  const toggleConnector = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (message.role === "user") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <div
          style={{
            background: "#002244",
            borderRadius: "20px 20px 0px 20px",
            padding: 16,
            maxWidth: "100%",
            fontFamily: F,
            fontSize: 14,
            color: "#FFFFFF",
            lineHeight: "20px",
          }}
        >
          {message.content}
        </div>
        {message.timestamp && (
          <span style={{ fontFamily: F, fontSize: 11, color: "#BDBDBD" }}>{message.timestamp}</span>
        )}
      </div>
    );
  }

  if (message.role === "typing") {
    return <ReasoningAnimation />;
  }

  // assistant
  const isConfirmAction = (label: string) => label === "Confirm connectors";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontFamily: F,
          fontSize: 14,
          color: "#1F2937",
          lineHeight: "20px",
          whiteSpace: "pre-line",
        }}
      >
        {renderContent(message.content)}
      </div>

      {message.connectors && (
        <ConnectorChecklist
          connectors={message.connectors}
          checkedIds={checkedIds}
          onToggle={toggleConnector}
        />
      )}

      {message.actions && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Header — "Confirm connectors" gets its own CTA style; others get the AI suggestion style */}
          {message.actions.some((a) => !isConfirmAction(a.label)) && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IconSparkles size={14} stroke={1.5} style={{ color: "#ae5ded", flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: F,
                  background: "linear-gradient(to left, #68c5ea 19%, #ae5ded 123%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: "16px",
                }}
              >
                Would you like to:
              </span>
            </div>
          )}

          {message.actions.map((action) =>
            isConfirmAction(action.label) ? (
              <button
                key={action.label}
                onClick={() => {
                  onAction?.(action.label);
                  onConfirmConnectors?.(new Set(checkedIds));
                }}
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: 8,
                  background: checkedIds.size > 0 ? "#0b6fd3" : "#BDBDBD",
                  cursor: checkedIds.size > 0 ? "pointer" : "default",
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  lineHeight: "18px",
                  marginTop: 4,
                  transition: "background 0.15s",
                }}
              >
                {action.label} {checkedIds.size > 0 ? `(${checkedIds.size})` : ""}
              </button>
            ) : (
              <button
                key={action.label}
                onClick={() => onAction?.(action.label)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 9,
                  border: "1px solid #68c5ea",
                  borderRadius: 4,
                  background: "linear-gradient(to left, rgba(104,197,234,0.1) 19%, rgba(174,93,237,0.1) 123%)",
                  cursor: "pointer",
                  fontFamily: F,
                  fontSize: 12,
                  fontWeight: 400,
                  color: "#202020",
                  lineHeight: "16px",
                }}
              >
                {action.label}
              </button>
            )
          )}
        </div>
      )}
      {message.timestamp && (
        <span style={{ fontFamily: F, fontSize: 11, color: "#BDBDBD" }}>{message.timestamp}</span>
      )}
    </div>
  );
}
