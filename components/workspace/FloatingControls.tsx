
import { useState, useRef, useEffect } from "react";
import {
  IconPointer,
  IconGridDots,
  IconHandGrab,
  IconPlus,
  IconMinus,
  IconTable,
  IconSparkles,
  IconNews,
  IconChartBar,
  IconNote,
} from "@tabler/icons-react";

type Mode = "cursor" | "pan" | "grid";

const CARD_TYPES = [
  { label: "Overview Table", icon: <IconTable size={16} stroke={1.5} />, key: "overview" },
  { label: "AI Narrative", icon: <IconSparkles size={16} stroke={1.5} />, key: "narrative" },
  { label: "News Feed", icon: <IconNews size={16} stroke={1.5} />, key: "news" },
  { label: "Chart", icon: <IconChartBar size={16} stroke={1.5} />, key: "chart" },
  { label: "Note", icon: <IconNote size={16} stroke={1.5} />, key: "note" },
];

const F = "'Open Sans', sans-serif";

interface Props {
  mode?: "edit" | "view";
  onModeChange?: (mode: Mode) => void;
}

export default function FloatingControls({ mode = "edit", onModeChange }: Props) {
  const [activeMode, setActiveMode] = useState<Mode>("cursor");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const iconBtn = (btnMode: Mode | null, icon: React.ReactNode, label: string, onClick?: () => void) => {
    const isActive = btnMode !== null && activeMode === btnMode;
    return (
      <button
        aria-label={label}
        onClick={() => {
          if (btnMode) {
            setActiveMode(btnMode);
            onModeChange?.(btnMode);
          }
          onClick?.();
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 100,
          border: "none",
          background: isActive ? "#e8e8e8" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: isActive ? "#212121" : "#616161",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f5f5f5"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        {icon}
      </button>
    );
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          #floating-controls-bar {
            left: 112px !important;
            transform: none !important;
          }
        }
      `}</style>
      <div
        id="floating-controls-bar"
        style={{
          position: "fixed",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
          background: "#FFFFFF",
          border: "1px solid #E0E0E0",
          borderRadius: 16,
          boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.05)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 64,
        }}
      >
        {mode === "edit" && (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              aria-label="Add Component"
              onClick={() => setDropdownOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 40,
                padding: "0 16px",
                borderRadius: 999,
                border: `1px solid ${dropdownOpen ? "#0b6fd3" : "#e0e0e0"}`,
                background: dropdownOpen ? "#EBF3FC" : "#FFFFFF",
                cursor: "pointer",
                fontFamily: F,
                fontSize: 14,
                fontWeight: 600,
                color: "#0b6fd3",
                whiteSpace: "nowrap",
                transition: "background 0.15s, border-color 0.15s",
                flexShrink: 0,
              }}
            >
              <IconPlus size={16} stroke={2} />
              Add Component
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: 0,
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: 12,
                  boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.10)",
                  minWidth: 200,
                  overflow: "hidden",
                  zIndex: 100,
                }}
              >
                {CARD_TYPES.map((item, i) => (
                  <button
                    key={item.key}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      border: "none",
                      borderBottom: i < CARD_TYPES.length - 1 ? "1px solid #F3F4F6" : "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: F,
                      fontSize: 14,
                      color: "#212121",
                      textAlign: "left",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ color: "#616161", display: "flex" }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {iconBtn("cursor", <IconPointer size={20} stroke={1.5} />, "Cursor")}
        {iconBtn("pan", <IconHandGrab size={20} stroke={1.5} />, "Pan")}
        {iconBtn("grid", <IconGridDots size={20} stroke={1.5} />, "Grid")}

        <div style={{ width: 1, height: 24, background: "#e0e0e0", flexShrink: 0 }} />

        {iconBtn(null, <IconPlus size={20} stroke={1.5} />, "Zoom in")}
        {iconBtn(null, <IconMinus size={20} stroke={1.5} />, "Zoom out")}
      </div>
    </>
  );
}
