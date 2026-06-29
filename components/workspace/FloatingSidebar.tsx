
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconMenu2,
  IconLayoutDashboard,
  IconBriefcase,
  IconSettings,
  IconStar,
  IconBook,
  IconTable,
} from "@tabler/icons-react";

const CARD_SHADOW = "0px 2px 4px 0px rgba(12,35,60,0.08)";
const BORDER = "1px solid #e5e5e5";
const F = "'Open Sans', sans-serif";

const NAV_ITEMS = [
  { icon: IconStar,  label: "For You" },
  { icon: IconBook,  label: "Explore Notebooks" },
  { icon: IconTable, label: "Scorecard Data" },
];

function SidebarBtn({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        border: "none",
        background: active ? "#d7d7d7" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: active ? "#27251e" : "#616161",
        flexShrink: 0,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f5f5f5"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon size={20} stroke={1.5} />
    </button>
  );
}

export default function FloatingSidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isProjects = pathname === "/projects";
  const isWorkspace = pathname.startsWith("/workspace");

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        top: 16,
        bottom: 16,
        width: 80,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top section — globe logo */}
      <div
        style={{
          background: "white",
          border: BORDER,
          borderBottom: "none",
          borderRadius: "12px 12px 0 0",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: CARD_SHADOW,
        }}
      >
        <button
          aria-label="Home"
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
        >
          <img src="/globe.svg" alt="World Bank" width={36} height={36} />
        </button>
      </div>

      {/* Main section */}
      <div
        style={{
          background: "white",
          border: BORDER,
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 24px",
          boxShadow: CARD_SHADOW,
          minHeight: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", alignItems: "center" }}>

          {/* Hamburger menu + flyout */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              aria-label="Main menu"
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                border: "none",
                background: menuOpen ? "#EBF3FC" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: menuOpen ? "#0b6fd3" : "#616161",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.background = "#f5f5f5"; }}
              onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.background = menuOpen ? "#EBF3FC" : "transparent"; }}
            >
              <IconMenu2 size={20} stroke={1.5} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "calc(100% + 8px)",
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: 12,
                  boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.10)",
                  minWidth: 200,
                  overflow: "hidden",
                  animation: "card-enter 200ms ease-out both",
                  zIndex: 100,
                }}
              >
                {NAV_ITEMS.map(({ icon: Icon, label }, i) => (
                  <button
                    key={label}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      border: "none",
                      borderBottom: i < NAV_ITEMS.length - 1 ? "1px solid #F3F4F6" : "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: F,
                      fontSize: 14,
                      color: "#212121",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ color: "#616161", display: "flex", flexShrink: 0 }}>
                      <Icon size={16} stroke={1.5} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 32, height: 1, background: "#e5e5e5", margin: "8px 0" }} />

          {/* Workspace icons */}
          <SidebarBtn icon={IconLayoutDashboard} label="Workspace" active={isWorkspace} onClick={() => navigate("/workspace/mexico-fy25")} />
          <SidebarBtn icon={IconBriefcase} label="Projects" active={isProjects} onClick={() => navigate("/projects")} />
        </div>

        {/* Profile section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <SidebarBtn icon={IconSettings} label="Settings" />

          {/* Divider */}
          <div style={{ width: "100%", height: 1, background: "#e5e5e5" }} />

          {/* Avatar */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#2b7f9b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F,
              fontSize: 14,
              fontWeight: 700,
              color: "#FFFFFF",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            NT
          </div>
        </div>
      </div>
    </div>
  );
}
