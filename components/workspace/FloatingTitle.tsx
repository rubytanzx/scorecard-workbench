
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconCheck,
  IconSparkles,
  IconArrowBigUp,
  IconArrowBigDown,
  IconDotsVertical,
  IconMenu2,
  IconLayoutDashboard,
  IconBriefcase,
  IconStar,
  IconBook,
  IconTable,
} from "@tabler/icons-react";

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: "'Open Sans', sans-serif",
  fontSize: 18,
  fontWeight: 600,
  color: "#616161",
  lineHeight: "140%",
  whiteSpace: "nowrap",
};

const PLACEHOLDER = "Name your notebook";
const F = "'Open Sans', sans-serif";

const NAV_ITEMS = [
  { icon: IconStar,              label: "For You" },
  { icon: IconBook,              label: "Explore Notebooks" },
  { icon: IconTable,             label: "Scorecard Data" },
  { icon: IconLayoutDashboard,   label: "Workspace" },
  { icon: IconBriefcase,         label: "Projects" },
];

function TertiaryBtn({
  onClick,
  label,
  children,
  active,
  activeColor,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        height: 32,
        padding: "0 8px",
        border: "none",
        borderRadius: 8,
        background: "transparent",
        fontFamily: F,
        fontSize: 13,
        fontWeight: 600,
        color: active && activeColor ? activeColor : "#616161",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

interface Props {
  initialTitle?: string;
  titleOverride?: string;
  mode?: "edit" | "view";
}

export default function FloatingTitle({ initialTitle = "Country Partnership Framework for Mexico FY25", titleOverride, mode = "edit" }: Props) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(312);
  const [downvotes, setDownvotes] = useState(11);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!titleOverride) return;
    setTitleVisible(false);
    setTitleLoading(true);
    const t1 = setTimeout(() => { setTitle(titleOverride); setTitleLoading(false); }, 1400);
    const t2 = setTimeout(() => setTitleVisible(true), 1450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [titleOverride]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!summaryOpen) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSummaryOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [summaryOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  function commit() {
    setEditing(false);
    setTitle((t) => t.trim());
  }

  function handleVote(dir: "up" | "down") {
    if (vote === dir) {
      setVote(null);
      if (dir === "up") setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (vote === "up") setUpvotes((v) => v - 1);
      if (vote === "down") setDownvotes((v) => v - 1);
      setVote(dir);
      if (dir === "up") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }
  }

  return (
    <>
      <style>{`
        #floating-title-input::placeholder { color: #bdbdbd; }
        @keyframes title-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
      <div ref={containerRef} style={{ position: "fixed", left: 16, top: 16, zIndex: 40 }}>

        {/* Title pill */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: "white",
            border: `1px solid ${editing ? "#0b6fd3" : hovered ? "#bdbdbd" : "#e5e5e5"}`,
            borderRadius: 16,
            boxShadow: editing
              ? "0px 0px 0px 3px rgba(11,111,211,0.12), 0px 2px 4px 0px rgba(12,35,60,0.08)"
              : "0px 2px 4px 0px rgba(12,35,60,0.08)",
            padding: "8px 8px 8px 8px",
            display: "flex",
            alignItems: "center",
            gap: 0,
            height: 64,
            cursor: "default",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        >
          {/* Globe logo */}
          <button
            aria-label="Home"
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 6px",
              flexShrink: 0,
            }}
          >
            <img src="/globe.svg" alt="World Bank" width={28} height={28} />
          </button>

          {/* Hamburger + flyout */}
          <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              aria-label="Main menu"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              style={{
                width: 32,
                height: 32,
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
              <IconMenu2 size={18} stroke={1.5} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
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

          {editing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px", marginLeft: 24 }}>
              <input
                id="floating-title-input"
                ref={inputRef}
                value={title}
                placeholder={PLACEHOLDER}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(false);
                }}
                style={{
                  ...TEXT_STYLE,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  width: Math.max(200, Math.max(title.length, PLACEHOLDER.length) * 11),
                }}
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={commit}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "none",
                  background: "#0b6fd3",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <IconCheck size={16} stroke={2.5} />
              </button>
            </div>
          ) : (
            <>
              {/* Title — 24px gap after the nav group */}
              {titleLoading ? (
                <div
                  style={{
                    width: 180,
                    height: 16,
                    borderRadius: 6,
                    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e8f4 50%, #f0f0f0 75%)",
                    backgroundSize: "400px 100%",
                    animation: "title-shimmer 2s ease-in-out infinite",
                    marginLeft: 24,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span
                  onClick={mode === "edit" ? () => setEditing(true) : undefined}
                  onMouseEnter={mode === "edit" ? () => setTitleHovered(true) : undefined}
                  onMouseLeave={mode === "edit" ? () => setTitleHovered(false) : undefined}
                  style={{
                    ...TEXT_STYLE,
                    color: titleHovered ? "#212121" : (title ? "#616161" : "#bdbdbd"),
                    background: titleHovered ? "#f5f5f5" : "transparent",
                    padding: "4px 8px",
                    marginLeft: 18,
                    borderRadius: 8,
                    cursor: mode === "edit" ? "text" : "default",
                    opacity: titleVisible ? 1 : 0,
                    transition: "opacity 0.25s ease, background 0.15s, color 0.15s",
                  }}
                >
                  {title || PLACEHOLDER}
                </span>
              )}

              {mode === "view" && (
                <>
                  <TertiaryBtn label="Upvote this notebook" onClick={() => handleVote("up")} active={vote === "up"} activeColor="#16a34a">
                    <IconArrowBigUp size={15} stroke={vote === "up" ? 2.2 : 1.6} color={vote === "up" ? "#16a34a" : "#616161"} />
                    <span style={{ color: vote === "up" ? "#16a34a" : "#616161" }}>{upvotes}</span>
                  </TertiaryBtn>
                  <TertiaryBtn label="Downvote this notebook" onClick={() => handleVote("down")} active={vote === "down"} activeColor="#dc2626">
                    <IconArrowBigDown size={15} stroke={vote === "down" ? 2.2 : 1.6} color={vote === "down" ? "#dc2626" : "#616161"} />
                    <span style={{ color: vote === "down" ? "#dc2626" : "#616161" }}>{downvotes}</span>
                  </TertiaryBtn>
                </>
              )}

              {/* Sparkles + kebab — 24px gap after title group */}
              <div style={{ display: "flex", alignItems: "center", marginLeft: 24 }}>
                <TertiaryBtn
                  label="Generate AI context summary"
                  onClick={() => setSummaryOpen((v) => !v)}
                  active={summaryOpen}
                  activeColor="#0b6fd3"
                >
                  <IconSparkles
                    size={18}
                    stroke={1.6}
                    color={summaryOpen ? "#0b6fd3" : "#616161"}
                  />
                </TertiaryBtn>

                <TertiaryBtn label="More options" onClick={() => {}}>
                  <IconDotsVertical size={17} stroke={1.6} color="#616161" />
                </TertiaryBtn>
              </div>
            </>
          )}
        </div>

        {/* Summary dropdown */}
        {summaryOpen && (
          <div
            style={{
              position: "absolute",
              top: 72,
              left: 0,
              width: 380,
              background: "#FFFFFF",
              border: "1px solid rgba(11, 111, 211, 0.18)",
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(11, 111, 211, 0.12), 0 1px 4px rgba(12,35,60,0.08)",
              padding: "14px 16px",
              zIndex: 60,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <IconSparkles size={15} stroke={1.6} color="#0b6fd3" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: "#0b6fd3", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Notebook Context Summary
                </p>
                <p style={{ fontFamily: F, fontSize: 13, color: "#374151", lineHeight: "1.6", margin: 0 }}>
                  Analyzes Mexico&apos;s FY25 Country Partnership Framework outcomes vs. 4 LAC peers — Chile, Brazil, Colombia, and Peru — across 8 connectors including the WBG Scorecard Explorer, Operations Portal, and IFC project data. Focus areas: poverty, education, health, and climate indicators.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
