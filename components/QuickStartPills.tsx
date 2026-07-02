
import { useState, useEffect, useRef } from "react";
import {
  IconSearch,
  IconChartBar,
  IconSitemap,
  IconBook2,
  IconPencil,
} from "@tabler/icons-react";
import { ACTION_MENUS } from "@/data/goldenPrompts";
import { useViewMode } from "@/contexts/ViewModeContext";

const F = "'Open Sans', sans-serif";

// Matches PromptBar: HERO_TOP=424, PILL_HEIGHT=48
const PROMPT_BAR_BOTTOM = 424 + 48; // 472
const PILLS_TOP  = PROMPT_BAR_BOTTOM + 16; // 488
const DROPDOWN_TOP = PROMPT_BAR_BOTTOM + 8; // 480


const MENU_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  explore:   IconSearch,
  analyse:   IconChartBar,
  explain:   IconSitemap,
  narrative: IconPencil,
};

interface Props {
  visible: boolean;
  onPillClick: (prompt: string) => void;
  onCreateResultsNarrative: () => void;
  onNarrativePromptClick?: (prompt: string) => void;
}

export default function QuickStartPills({ visible, onPillClick, onCreateResultsNarrative, onNarrativePromptClick }: Props) {
  const { isInternal } = useViewMode();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openMenu]);

  useEffect(() => {
    if (!openMenu) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenMenu(null); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [openMenu]);

  // Close menu when hidden (e.g. user scrolls away)
  useEffect(() => { if (!visible) setOpenMenu(null); }, [visible]);

  const handlePromptClick = (prompt: string, menuId?: string) => {
    if (menuId === "narrative" && onNarrativePromptClick) {
      onNarrativePromptClick(prompt);
    } else {
      onPillClick(prompt);
    }
    setOpenMenu(null);
  };

  if (!visible) return null;

  const activeMenu = ACTION_MENUS.find((m) => m.id === openMenu);

  return (
    <div ref={containerRef}>
      {/* Dropdown — fixed, opens just below the prompt bar */}
      {activeMenu && (
        <div
          role="menu"
          aria-label={`${activeMenu.label} prompts`}
          className="rounded-2xl overflow-hidden"
          style={{
            position: "fixed",
            top: DROPDOWN_TOP,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 52,
            width: "min(580px, calc(100% - 32px))",
            background: "rgba(14,28,42,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
            animation: "qs-fadeSlide 150ms ease forwards",
          }}
        >
          <div style={{ padding: "4px 8px 8px" }}>
            {activeMenu.prompts.map((p) => (
              <button
                key={p.prompt}
                role="menuitem"
                type="button"
                onClick={() => handlePromptClick(p.prompt, activeMenu.id)}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  display: "block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.78)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 120ms ease, color 120ms ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pills row — fixed 16px below prompt bar */}
      <div
        style={{
          position: "fixed",
          top: PILLS_TOP,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 51,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
        }}
      >
        {ACTION_MENUS.filter((menu) => menu.id !== "narrative").map((menu) => {
          const Icon = MENU_ICONS[menu.id];
          const isOpen = openMenu === menu.id;
          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => setOpenMenu(isOpen ? null : menu.id)}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              className="flex items-center gap-1.5 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              style={{
                fontFamily: F,
                fontSize: 13,
                fontWeight: 500,
                padding: "6px 12px",
                color: isOpen ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.88)",
                background: isOpen ? "#0288D1" : "rgba(255,255,255,0.07)",
                border: `1px solid ${isOpen ? "#0288D1" : "rgba(255,255,255,0.12)"}`,
              }}
            >
              {Icon && <Icon size={12} style={{ opacity: 0.7, flexShrink: 0 }} />}
              {menu.label}
            </button>
          );
        })}

        {/* Build a Results Narrative — internal only */}
        {isInternal && (
          <button
            type="button"
            onClick={onCreateResultsNarrative}
            aria-label="Build a Results Narrative"
            className="group relative isolate rounded-full p-[1.5px] active:scale-[0.98] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full"
              style={{
                background: "linear-gradient(110deg, #5eead4 0%, #22d3ee 25%, #34d399 50%, #2dd4bf 75%, #5eead4 100%)",
                backgroundSize: "200% 100%",
                animation: "gleam 3s linear infinite",
              }}
            />
            <span
              className="flex items-center gap-1.5 px-4 py-1.5 text-[12.5px] font-semibold rounded-full"
              style={{ fontFamily: F, color: "rgba(180,255,240,0.95)", background: "rgba(10,32,30,0.88)" }}
            >
              <IconBook2 size={12} style={{ color: "rgba(100,240,210,0.85)", flexShrink: 0 }} />
              Build a Results Narrative
            </span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes qs-fadeSlide {
          from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
