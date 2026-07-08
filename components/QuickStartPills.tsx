
import { useState, useEffect, useRef } from "react";
import {
  IconSearch,
  IconChartBar,
  IconSitemap,
  IconBook2,
  IconPencil,
  IconCompass,
} from "@tabler/icons-react";
import { ACTION_MENUS } from "@/data/goldenPrompts";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useTheme } from "@/contexts/ThemeContext";

const F = "'Open Sans', sans-serif";

// Only used when not in inline mode (legacy fixed positioning)
const PROMPT_BAR_BOTTOM = 424 + 48; // 472
const PILLS_TOP  = PROMPT_BAR_BOTTOM + 16; // 488
const DROPDOWN_TOP = PROMPT_BAR_BOTTOM + 8; // 480


const MENU_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  "explore-scorecard": IconCompass,
  analytics:          IconChartBar,
  methods:            IconBook2,
  insights:           IconSearch,
  "narrative-builder": IconSitemap,
  narrative:          IconPencil,
};

interface Props {
  visible: boolean;
  inline?: boolean;
  onPillClick: (prompt: string) => void;
  onCreateResultsNarrative: () => void;
  onNarrativePromptClick?: (prompt: string) => void;
}

export default function QuickStartPills({ visible, inline = false, onPillClick, onCreateResultsNarrative, onNarrativePromptClick }: Props) {
  const { isInternal } = useViewMode();
  const { isDark } = useTheme();
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
    <div ref={containerRef} style={inline ? { position: "relative", width: "100%" } : undefined}>
      {/* Dropdown — positions below pills row */}
      {activeMenu && (
        <div
          role="menu"
          aria-label={`${activeMenu.label} prompts`}
          className="rounded-2xl overflow-hidden"
          style={{
            position: inline ? "absolute" : "fixed",
            ...(inline ? { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" } : { top: DROPDOWN_TOP, left: "50%", transform: "translateX(-50%)" }),
            zIndex: 52,
            width: "min(580px, calc(100% - 32px))",
            background: isDark ? "rgba(14,28,42,0.92)" : "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: isDark ? "1px solid rgba(255,255,255,0.13)" : "1px solid rgba(0,57,107,0.14)",
            boxShadow: isDark
              ? "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)"
              : "0 8px 32px rgba(0,57,107,0.12), 0 2px 8px rgba(0,57,107,0.06)",
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
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/40"
                style={{
                  display: "block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: 1.55,
                  color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,13,26,0.75)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 120ms ease, color 120ms ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,57,107,0.06)";
                  e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,13,26,0.90)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,13,26,0.75)";
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pills row */}
      <div
        style={inline ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
          width: "100%",
          marginTop: 12,
          zIndex: 51,
        } : {
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
        {ACTION_MENUS.filter((menu) => menu.id !== "narrative" && menu.id !== "narrative-builder").map((menu) => {
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
                color: isOpen
                  ? "#ffffff"
                  : isDark ? "rgba(255,255,255,0.88)" : "rgba(0,13,26,0.75)",
                background: isOpen
                  ? "#0288D1"
                  : isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.82)",
                border: `1px solid ${isOpen ? "#0288D1" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,57,107,0.18)"}`,
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
              style={{
                fontFamily: F,
                color: isDark ? "rgba(180,255,240,0.95)" : "#0b6b5a",
                background: isDark ? "rgba(10,32,30,0.88)" : "rgba(255,255,255,0.92)",
              }}
            >
              <IconBook2 size={12} style={{ color: isDark ? "rgba(100,240,210,0.85)" : "#0b8c72", flexShrink: 0 }} />
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
