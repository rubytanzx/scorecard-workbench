
import { useState, useRef, useEffect } from "react";
import {
  IconArrowUp, IconX, IconPlus,
  IconPaperclip, IconPhoto, IconPlugConnected,
  IconChevronRight, IconSettings, IconTool,
} from "@tabler/icons-react";
import { MCP_CONNECTORS } from "@/data/mockInteraction";

const F = "'Open Sans', sans-serif";

const pillStyle: React.CSSProperties = {
  fontFamily: F,
  fontSize: 13,
  fontWeight: 500,
  color: "#424242",
  background: "#FFFFFF",
  border: "1px solid #E0E0E0",
  borderRadius: 100,
  padding: "6px 14px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0px 1px 3px 0px rgba(12,35,60,0.06)",
};

export const PROMPT_BOTTOM = 22;
export const PILLS_GAP_BOTTOM = 20;
export const PILLS_GAP_TOP = 12;
export const PILLS_H = 30;
const PADDING_V = 16;
const LINE_H = 24;
const MAX_LINES = 3;
const BANNER_H = 48;

const CONNECTOR_META: Record<string, { color: string; initial: string }> = {
  "wbg-scorecard": { color: "#003366", initial: "WB"  },
  "ifc":           { color: "#F5A623", initial: "IFC" },
  "miga":          { color: "#1565C0", initial: "M"   },
  "wb-operations": { color: "#0288D1", initial: "OP"  },
  "wdi":           { color: "#2E7D32", initial: "WD"  },
  "cpf":           { color: "#6A1B9A", initial: "CP"  },
  "open-data":     { color: "#C62828", initial: "OD"  },
};

// ─── Toggle (light mode) ──────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? "#0b6fd3" : "#D1D5DB",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.18s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.18s",
        }}
      />
    </div>
  );
}

// ─── Connector icon ───────────────────────────────────────────────────────────

function ConnectorIcon({ id }: { id: string }) {
  const meta = CONNECTOR_META[id] ?? { color: "#616161", initial: "?" };
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        background: meta.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: F, fontSize: 8, fontWeight: 700, color: "#FFFFFF", letterSpacing: 0.2 }}>
        {meta.initial}
      </span>
    </div>
  );
}

// ─── Shared menu shell ────────────────────────────────────────────────────────

const menuShell: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

const menuRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 14px",
  cursor: "pointer",
  transition: "background 0.1s",
  userSelect: "none",
};

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onSubmit?: (text: string) => void;
  onHeightChange?: (height: number) => void;
  selectedCard?: string | null;
  onClearSelection?: () => void;
  mode?: "edit" | "view";
  locked?: boolean;
  confirmedConnectorIds?: Set<string>;
}

export default function PromptBar({
  onSubmit, onHeightChange, selectedCard, onClearSelection,
  mode = "edit", locked = false, confirmedConnectorIds,
}: Props) {
  const PILLS =
    mode === "view"
      ? ["Compare regions", "Continue Analysis via MCP"]
      : ["Compare regions", "Continue Analysis via MCP", "Create a notebook"];

  const [value, setValue] = useState("");
  const [taHeight, setTaHeight] = useState(LINE_H);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    () => new Set(MCP_CONNECTORS.map((c) => c.id))
  );

  // Sync with whatever the user confirmed in the chat connector widget
  useEffect(() => {
    if (confirmedConnectorIds !== undefined) {
      setEnabledIds(new Set(confirmedConnectorIds));
    }
  }, [confirmedConnectorIds]);

  const menuRef = useRef<HTMLDivElement>(null);
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSub = () => {
    if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
    setSubOpen(true);
  };
  const closeSub = () => {
    subCloseTimer.current = setTimeout(() => setSubOpen(false), 120);
  };

  // Close entire menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close submenu when main menu closes
  useEffect(() => { if (!menuOpen) setSubOpen(false); }, [menuOpen]);

  const toggleConnector = (id: string) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const adjustHeight = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    const clamped = Math.min(el.scrollHeight, LINE_H * MAX_LINES);
    el.style.height = `${clamped}px`;
    setTaHeight(clamped);
  };

  const promptBarHeight = taHeight + PADDING_V * 2;
  const bannerVisible = !!selectedCard;
  const pillsBottom = PROMPT_BOTTOM + promptBarHeight + (bannerVisible ? BANNER_H : 0) + PILLS_GAP_BOTTOM;

  useEffect(() => { onHeightChange?.(promptBarHeight); }, [promptBarHeight, onHeightChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSubmit = () => {
    const text = value.trim();
    if (!text) return;
    setValue("");
    if (taRef.current) {
      taRef.current.style.height = `${LINE_H}px`;
      setTaHeight(LINE_H);
    }
    onSubmit?.(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasText = !locked && value.trim().length > 0;
  const atMax = taHeight >= LINE_H * MAX_LINES;

  return (
    <>
      {/* Pills */}
      <div
        style={{
          position: "fixed", bottom: pillsBottom, right: 18,
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 50, transition: "bottom 0.15s ease",
        }}
      >
        {PILLS.map((label) => <button key={label} style={pillStyle}>{label}</button>)}
      </div>

      {/* Context banner */}
      {bannerVisible && (
        <div
          style={{
            position: "fixed", bottom: PROMPT_BOTTOM + promptBarHeight, right: 18, width: 468,
            background: "#0B6FD3", borderRadius: "16px 16px 0 0",
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 8,
            zIndex: 50, transition: "bottom 0.15s ease",
          }}
        >
          <button onClick={onClearSelection} style={{ background: "none", border: "none", padding: 0, lineHeight: 0, display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <IconX size={18} stroke={2} color="#FFFFFF" />
          </button>
          <span style={{ fontFamily: F, fontSize: 14, color: "#FFFFFF", lineHeight: "1.2", flex: 1 }}>
            Chat about card <strong style={{ fontWeight: 700 }}>{selectedCard}</strong>
          </span>
        </div>
      )}

      {/* Prompt bar */}
      <div
        style={{
          position: "fixed", bottom: PROMPT_BOTTOM, right: 18, width: 468,
          background: "#FFFFFF", border: "1px solid #E0E0E0",
          borderRadius: bannerVisible ? "0 0 16px 16px" : 16,
          boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.05)",
          padding: PADDING_V, display: "flex", alignItems: "center", gap: 10,
          zIndex: 50,
        }}
      >
        {/* + button + menus */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          {/* + button */}
          <button
            aria-label="Add"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "none",
              background: menuOpen ? "#EBF3FC" : "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: menuOpen ? "#0b6fd3" : "#616161", flexShrink: 0,
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { if (!menuOpen) { e.currentTarget.style.color = "#212121"; } }}
            onMouseLeave={(e) => { if (!menuOpen) { e.currentTarget.style.color = "#616161"; } }}
          >
            <IconPlus size={15} stroke={2} />
          </button>

          {/* Main menu */}
          {menuOpen && (
            <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, width: 230, zIndex: 200, ...menuShell }}>

              {/* Add files */}
              <div
                style={{ ...menuRow }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; closeSub(); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <IconPaperclip size={16} stroke={1.5} color="#616161" />
                <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Add files or photos</span>
              </div>

              {/* Add images */}
              <div
                style={{ ...menuRow, borderBottom: "1px solid #F3F4F6" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; closeSub(); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <IconPhoto size={16} stroke={1.5} color="#616161" />
                <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Add images</span>
              </div>

              {/* Connectors row — hover opens submenu (submenu is a sibling, not nested) */}
              <div
                style={{
                  ...menuRow,
                  background: subOpen ? "#F5F5F5" : "transparent",
                  justifyContent: "space-between",
                }}
                onMouseEnter={openSub}
                onMouseLeave={closeSub}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <IconPlugConnected size={16} stroke={1.5} color="#616161" />
                  <span style={{ fontFamily: F, fontSize: 14, color: "#212121" }}>Connectors</span>
                </div>
                <IconChevronRight size={14} stroke={1.5} color="#9E9E9E" />
              </div>

            </div>
          )}

          {/* Connectors submenu — sibling to main menu so it isn't clipped by overflow:hidden */}
          {menuOpen && subOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: 150,
                width: 290,
                zIndex: 201,
                ...menuShell,
              }}
              onMouseEnter={openSub}
              onMouseLeave={closeSub}
            >
              {MCP_CONNECTORS.map((c, i) => {
                const on = enabledIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleConnector(c.id)}
                    style={{
                      ...menuRow,
                      borderBottom: i < MCP_CONNECTORS.length - 1 ? "1px solid #F3F4F6" : "none",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <ConnectorIcon id={c.id} />
                    <span style={{ fontFamily: F, fontSize: 13, color: "#212121", flex: 1, lineHeight: "18px" }}>
                      {c.name}
                    </span>
                    <Toggle on={on} onToggle={() => toggleConnector(c.id)} />
                  </div>
                );
              })}

              {/* Footer */}
              <div style={{ borderTop: "1px solid #F3F4F6" }}>
                <div
                  style={{ ...menuRow, borderBottom: "1px solid #F3F4F6" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconSettings size={14} stroke={1.5} color="#616161" />
                  </div>
                  <span style={{ fontFamily: F, fontSize: 13, color: "#212121" }}>Manage connectors</span>
                </div>
                <div
                  style={{ ...menuRow }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconTool size={14} stroke={1.5} color="#616161" />
                  </div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: 13, color: "#212121" }}>Tool access</div>
                    <div style={{ fontFamily: F, fontSize: 11, color: "#9E9E9E", marginTop: 1 }}>Load tools when needed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={locked ? "Confirm your data connections above to continue" : mode === "view" ? "Ask about this notebook" : "Give me more insights"}
          readOnly={locked}
          rows={1}
          style={{
            flex: 1, border: "none", outline: "none",
            fontFamily: F, fontSize: 16, color: "#212121",
            background: "transparent", resize: "none",
            lineHeight: `${LINE_H}px`, height: LINE_H,
            overflowY: atMax ? "auto" : "hidden",
            minWidth: 0, padding: 0,
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!hasText}
          aria-label="Send"
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: hasText ? "#0b6fd3" : "#BDBDBD",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, cursor: hasText ? "pointer" : "default",
            transition: "background 0.15s",
          }}
        >
          <IconArrowUp size={16} stroke={2} color="#FFFFFF" />
        </button>
      </div>
    </>
  );
}
