import { useState, useEffect } from "react";
import type { NodeProps } from "reactflow";
import { IconThumbUp, IconThumbDown } from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";
const HEADER_BLUE = "#1247C8";

interface Stat { value: string; label: string; }

interface ProgressItem {
  label: string;
  displayValue: string;
  pct: number;
  note?: string;
  exceeded?: boolean;
}

// ─── Evidence: animated + interactive progress bars ───────────────────────────

function InteractiveProgressBars({ items }: { items: ProgressItem[] }) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {items.map((item, i) => {
        const isHovered = hovered === item.label;
        const barColor = item.exceeded ? "#16A34A" : isHovered ? HEADER_BLUE : "#1B3FC4";
        return (
          <div
            key={item.label}
            onMouseEnter={() => setHovered(item.label)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "default" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{
                fontSize: 13, fontFamily: F, fontWeight: 500,
                color: isHovered ? HEADER_BLUE : "#424242",
                transition: "color 0.15s",
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: 13, fontFamily: F,
                color: item.exceeded ? "#16A34A" : isHovered ? HEADER_BLUE : "#616161",
                fontWeight: isHovered ? 600 : 400,
                transition: "color 0.15s, font-weight 0.1s",
              }}>
                {item.displayValue}
                {item.note && (
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 700,
                    color: item.exceeded ? "#16A34A" : "#1B3FC4",
                    background: item.exceeded ? "#DCFCE7" : "#EEF3FF",
                    padding: "1px 5px", borderRadius: 3,
                  }}>
                    {item.note}
                  </span>
                )}
              </span>
            </div>
            {/* Track */}
            <div style={{ height: 7, borderRadius: 4, background: "#E8ECF5", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: mounted ? `${Math.min(item.pct, 100)}%` : "0%",
                background: barColor,
                borderRadius: 4,
                transition: `width ${0.5 + i * 0.12}s cubic-bezier(0.4,0,0.2,1), background 0.18s`,
                boxShadow: isHovered ? `0 0 8px ${barColor}55` : "none",
              }} />
            </div>
            {/* Percentage label on hover */}
            <div style={{
              marginTop: 4, textAlign: "right",
              height: 14,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.15s",
            }}>
              <span style={{ fontSize: 11, color: barColor, fontFamily: F, fontWeight: 600 }}>
                {item.pct}%{item.exceeded ? " — target exceeded" : " of target"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Impact: interactive flow diagram with hover details ──────────────────────

const FLOW_NODES = [
  {
    id: "emis",
    label: "Functional EMIS",
    green: false,
    detail: "Real-time data from 47,000+ schools gives policymakers live visibility into attendance, learning outcomes, and resource gaps — eliminating the 2–3 year lag that previously made planning reactive.",
  },
  {
    id: "planning",
    label: "Evidence-based planning",
    green: false,
    detail: "Annual school-level benchmarking directly informs teacher deployment, textbook allocation, and infrastructure spend at district level — replacing ad-hoc budgeting with data-driven prioritisation.",
  },
  {
    id: "investment",
    label: "Targeted investment",
    green: false,
    detail: "$29.2B in IDA commitments are tied to evidence of improved planning capacity, ensuring funds follow demonstrated need rather than historical allocations.",
  },
  {
    id: "outcomes",
    label: "Improved outcomes",
    green: true,
    detail: "42M students reached across SSA. Seven countries exceeded their learning poverty reduction targets ahead of schedule — proof that governance-first investment converts into sustained results.",
  },
] as const;

function InteractiveFlowDiagram() {
  const [active, setActive] = useState<string | null>(null);
  const activeNode = FLOW_NODES.find((n) => n.id === active);

  return (
    <div style={{
      background: "#F0F4FF", borderRadius: 8,
      padding: "14px 16px", margin: "16px 0",
      border: "1px solid #D9E3F8",
    }}>
      {/* Row 1 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {([FLOW_NODES[0], FLOW_NODES[1]] as typeof FLOW_NODES[number][]).map((node, i) => (
          <div key={node.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span style={{ color: "#9BAFE8", fontSize: 13 }}>→</span>}
            <button
              className="nodrag"
              onMouseEnter={() => setActive(node.id)}
              onMouseLeave={() => setActive(null)}
              style={{
                background: active === node.id ? HEADER_BLUE : "#FFFFFF",
                border: `1px solid ${active === node.id ? HEADER_BLUE : "#C8D9F5"}`,
                borderRadius: 5, padding: "4px 10px", cursor: "pointer",
                color: active === node.id ? "#FFFFFF" : HEADER_BLUE,
                fontSize: 12, fontWeight: 600, fontFamily: F,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {node.label}
            </button>
          </div>
        ))}
      </div>
      {/* Row 2 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "#9BAFE8", fontSize: 13 }}>→</span>
        {([FLOW_NODES[2], FLOW_NODES[3]] as typeof FLOW_NODES[number][]).map((node, i) => (
          <div key={node.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span style={{ color: "#9BAFE8", fontSize: 13 }}>→</span>}
            <button
              className="nodrag"
              onMouseEnter={() => setActive(node.id)}
              onMouseLeave={() => setActive(null)}
              style={{
                background: active === node.id
                  ? (node.green ? "#16A34A" : HEADER_BLUE)
                  : (node.green ? "#DCFCE7" : "#FFFFFF"),
                border: `1px solid ${active === node.id
                  ? (node.green ? "#16A34A" : HEADER_BLUE)
                  : (node.green ? "#BBF7D0" : "#C8D9F5")}`,
                borderRadius: 5, padding: "4px 10px", cursor: "pointer",
                color: active === node.id
                  ? "#FFFFFF"
                  : (node.green ? "#15803D" : HEADER_BLUE),
                fontSize: 12, fontWeight: 600, fontFamily: F,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {node.label}
            </button>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <div style={{
        overflow: "hidden",
        maxHeight: activeNode ? 120 : 0,
        marginTop: activeNode ? 12 : 0,
        transition: "max-height 0.22s ease, margin-top 0.22s ease",
        borderTop: activeNode ? "1px solid #D9E3F8" : "1px solid transparent",
        paddingTop: activeNode ? 10 : 0,
        transition2: "border-color 0.22s, padding-top 0.22s",
      } as React.CSSProperties}>
        <p style={{ margin: 0, fontSize: 12, color: "#374151", lineHeight: "1.55", fontFamily: F }}>
          {activeNode?.detail}
        </p>
      </div>
    </div>
  );
}

// ─── Main IDACard ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IDACard({ data, selected }: NodeProps<any>) {
  const title: string                 = data.title ?? "";
  const stats: Stat[]                 = data.stats ?? [];
  const body: string                  = data.body ?? "";
  const bodyAfter: string             = data.bodyAfter ?? "";
  const listItems: string[]           = data.listItems ?? [];
  const progressItems: ProgressItem[] = data.progressItems ?? [];
  const showFlow: boolean             = data.showFlow ?? false;
  const cta: string | undefined       = data.cta;
  const sourcesCount: number          = data.sourcesCount ?? 3;

  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card-enter"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 411,
        background: "#FFFFFF",
        border: selected ? "1px solid #0b6fd3" : hovered ? "1px solid #BDBDBD" : "1px solid #E5E5E5",
        borderRadius: 8,
        boxShadow: selected
          ? "0px 0px 0px 3px rgba(11,111,211,0.12)"
          : hovered
          ? "0px 4px 12px rgba(0,0,0,0.08)"
          : "0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -1px rgba(0,0,0,0.03)",
        overflow: "hidden",
        fontFamily: F,
        cursor: "grab",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {/* Blue header */}
      <div style={{ background: HEADER_BLUE, padding: "20px 24px 24px" }}>
        <div style={{
          fontSize: 22, fontWeight: 700, color: "#FFFFFF",
          marginBottom: stats.length > 0 ? 18 : 0,
          lineHeight: "1.2", fontFamily: F,
        }}>
          {title}
        </div>
        {stats.length > 0 && (
          <div style={{ display: "flex", gap: 36 }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", lineHeight: "1.1", fontFamily: F }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 5, lineHeight: "1.35", fontFamily: F }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px" }}>
        {body && (
          <p style={{ margin: 0, fontSize: 15, color: "rgba(0,13,26,0.62)", lineHeight: "1.6", fontFamily: F }}>
            {body}
          </p>
        )}

        {listItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: body ? 16 : 0 }}>
            {listItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                  background: "#EEF3FF", color: HEADER_BLUE,
                  fontSize: 12, fontWeight: 700, fontFamily: F,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 15, color: "rgba(0,13,26,0.62)", lineHeight: "1.5", fontFamily: F }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}

        {progressItems.length > 0 && (
          <div style={{ marginTop: body ? 16 : 0 }}>
            <InteractiveProgressBars items={progressItems} />
          </div>
        )}

        {showFlow && <InteractiveFlowDiagram />}

        {bodyAfter && (
          <p style={{ margin: 0, marginTop: showFlow ? 0 : 16, fontSize: 15, color: "rgba(0,13,26,0.62)", lineHeight: "1.6", fontFamily: F }}>
            {bodyAfter}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #E5E5E5", padding: "12px 24px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex" }}>
              {Array.from({ length: Math.min(sourcesCount, 3) }).map((_, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i === 0 ? "#C4D9F5" : i === 1 ? "#BDD5EE" : "#D4D4D4",
                  border: "2px solid white", marginLeft: i > 0 ? -8 : 0,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: "#616161", fontFamily: F }}>{sourcesCount} Source(s)</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            <button className="nodrag" style={{ background: "none", border: "none", padding: "3.5px", cursor: "pointer", color: "#9E9E9E", display: "flex", alignItems: "center", borderRadius: 100 }}>
              <IconThumbUp size={17} stroke={1.5} />
            </button>
            <button className="nodrag" style={{ background: "none", border: "none", padding: "3.5px", cursor: "pointer", color: "#9E9E9E", display: "flex", alignItems: "center", borderRadius: 100 }}>
              <IconThumbDown size={17} stroke={1.5} />
            </button>
          </div>
        </div>
        {cta && (
          <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 10, textAlign: "right" }}>
            <button
              className="nodrag"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: "#0b6fd3", fontFamily: F, fontSize: 14, fontWeight: 600 }}
            >
              <span style={{ color: "#BDBDBD", fontWeight: 400 }}>|→</span> {cta}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IDACard;
