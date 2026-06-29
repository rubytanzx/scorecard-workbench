
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingSidebar from "./FloatingSidebar";
import {
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconShare,
  IconCopy,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

// ─── Mock data ────────────────────────────────────────────────────────────────

interface Board {
  id: string;
  title: string;
  region: string;
  cardCount: number;
  modifiedLabel: string;
  isShared?: boolean;
  thumbnailVariant: 0 | 1 | 2 | 3 | 4 | 5;
}

const BOARDS: Board[] = [
  {
    id: "mexico-fy25",
    title: "Mexico Country Scorecard",
    region: "LAC Region",
    cardCount: 8,
    modifiedLabel: "2 days ago",
    isShared: true,
    thumbnailVariant: 0,
  },
  {
    id: "brazil-lac-fy25",
    title: "Brazil LAC Portfolio Review",
    region: "LAC Region",
    cardCount: 6,
    modifiedLabel: "5 days ago",
    thumbnailVariant: 1,
  },
  {
    id: "chile-education",
    title: "Chile Education Outcomes",
    region: "LAC Region",
    cardCount: 4,
    modifiedLabel: "1 week ago",
    thumbnailVariant: 2,
  },
  {
    id: "colombia-uhc",
    title: "Colombia UHC Assessment",
    region: "LAC Region",
    cardCount: 5,
    modifiedLabel: "2 weeks ago",
    isShared: true,
    thumbnailVariant: 3,
  },
  {
    id: "peru-climate",
    title: "Peru Climate Portfolio",
    region: "LAC Region",
    cardCount: 3,
    modifiedLabel: "3 weeks ago",
    thumbnailVariant: 4,
  },
  {
    id: "lac-regional-fy25",
    title: "LAC Regional Overview FY25",
    region: "LAC Region",
    cardCount: 11,
    modifiedLabel: "1 month ago",
    isShared: true,
    thumbnailVariant: 5,
  },
];

// ─── Thumbnail variants ───────────────────────────────────────────────────────

const THUMBNAIL_CONFIGS = [
  // 0 — Mexico (blue)
  { bg: "#EBF3FC", accent: "#0b6fd3", secondary: "#68C5EA" },
  // 1 — Brazil (green)
  { bg: "#ECFDF5", accent: "#16a34a", secondary: "#4ade80" },
  // 2 — Chile (orange)
  { bg: "#FFF7ED", accent: "#ea580c", secondary: "#fb923c" },
  // 3 — Colombia (purple)
  { bg: "#F5F3FF", accent: "#7c3aed", secondary: "#a78bfa" },
  // 4 — Peru (teal)
  { bg: "#F0FDFA", accent: "#0d9488", secondary: "#2dd4bf" },
  // 5 — Regional (navy)
  { bg: "#EFF6FF", accent: "#1e3a5f", secondary: "#2b7f9b" },
];

function BoardThumbnail({ variant }: { variant: 0 | 1 | 2 | 3 | 4 | 5 }) {
  const { bg, accent, secondary } = THUMBNAIL_CONFIGS[variant];
  // Different card layout per variant to make each look distinct
  const layouts = [
    // 0: wide card left + two small right
    <svg key={0} width="100%" height="100%" viewBox="0 0 280 160">
      <rect x="16" y="20" width="120" height="72" rx="6" fill={secondary} opacity={0.5} />
      <rect x="16" y="100" width="120" height="40" rx="6" fill={accent} opacity={0.3} />
      <rect x="148" y="20" width="116" height="52" rx="6" fill={accent} opacity={0.4} />
      <rect x="148" y="80" width="116" height="60" rx="6" fill={secondary} opacity={0.35} />
    </svg>,
    // 1: three cards stacked left + one tall right
    <svg key={1} width="100%" height="100%" viewBox="0 0 280 160">
      <rect x="16" y="16" width="148" height="36" rx="6" fill={accent} opacity={0.4} />
      <rect x="16" y="60" width="148" height="36" rx="6" fill={secondary} opacity={0.45} />
      <rect x="16" y="104" width="148" height="40" rx="6" fill={accent} opacity={0.25} />
      <rect x="176" y="16" width="88" height="128" rx="6" fill={secondary} opacity={0.5} />
    </svg>,
    // 2: 2×2 grid
    <svg key={2} width="100%" height="100%" viewBox="0 0 280 160">
      <rect x="16" y="16" width="116" height="60" rx="6" fill={accent} opacity={0.4} />
      <rect x="148" y="16" width="116" height="60" rx="6" fill={secondary} opacity={0.45} />
      <rect x="16" y="84" width="116" height="60" rx="6" fill={secondary} opacity={0.3} />
      <rect x="148" y="84" width="116" height="60" rx="6" fill={accent} opacity={0.35} />
    </svg>,
    // 3: one wide top + two bottom
    <svg key={3} width="100%" height="100%" viewBox="0 0 280 160">
      <rect x="16" y="16" width="248" height="68" rx="6" fill={accent} opacity={0.4} />
      <rect x="16" y="92" width="116" height="52" rx="6" fill={secondary} opacity={0.5} />
      <rect x="148" y="92" width="116" height="52" rx="6" fill={accent} opacity={0.3} />
    </svg>,
    // 4: column of three narrow cards
    <svg key={4} width="100%" height="100%" viewBox="0 0 280 160">
      <rect x="16" y="16" width="72" height="128" rx="6" fill={secondary} opacity={0.45} />
      <rect x="104" y="16" width="72" height="128" rx="6" fill={accent} opacity={0.4} />
      <rect x="192" y="16" width="72" height="128" rx="6" fill={secondary} opacity={0.3} />
    </svg>,
    // 5: large + scattered (more complex board)
    <svg key={5} width="100%" height="100%" viewBox="0 0 280 160">
      <rect x="16" y="16" width="100" height="56" rx="6" fill={accent} opacity={0.45} />
      <rect x="16" y="80" width="100" height="64" rx="6" fill={secondary} opacity={0.4} />
      <rect x="128" y="16" width="136" height="36" rx="6" fill={secondary} opacity={0.5} />
      <rect x="128" y="60" width="64" height="36" rx="6" fill={accent} opacity={0.3} />
      <rect x="200" y="60" width="64" height="36" rx="6" fill={accent} opacity={0.3} />
      <rect x="128" y="104" width="136" height="40" rx="6" fill={secondary} opacity={0.35} />
    </svg>,
  ];

  return (
    <div
      style={{
        width: "100%",
        height: 168,
        background: bg,
        borderRadius: "8px 8px 0 0",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {layouts[variant]}
    </div>
  );
}

// ─── Board card context menu ──────────────────────────────────────────────────

const MENU_ITEMS = [
  { icon: IconEdit,   label: "Rename" },
  { icon: IconCopy,   label: "Duplicate" },
  { icon: IconShare,  label: "Share" },
  { icon: IconTrash,  label: "Delete", danger: true },
];

function BoardCard({ board, onClick }: { board: Board; onClick: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 8,
        boxShadow: "0px 2px 4px 0px rgba(12,35,60,0.06)",
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
        overflow: "visible",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0px 6px 16px 0px rgba(12,35,60,0.12)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#d0d0d0";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0px 2px 4px 0px rgba(12,35,60,0.06)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E5E5";
      }}
      onClick={onClick}
    >
      <BoardThumbnail variant={board.thumbnailVariant} />

      {/* Card info row */}
      <div
        style={{
          padding: "14px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
        }}
      >
        {/* Title + menu button */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span
            style={{
              flex: 1,
              fontFamily: F,
              fontSize: 14,
              fontWeight: 600,
              color: "#212121",
              lineHeight: "1.4",
            }}
          >
            {board.title}
          </span>

          {/* Three-dot menu */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "none",
                background: menuOpen ? "#F5F5F5" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#616161",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                e.currentTarget.style.background = "#F5F5F5";
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                if (!menuOpen) e.currentTarget.style.background = "transparent";
              }}
            >
              <IconDotsVertical size={16} stroke={1.5} />
            </button>

            {menuOpen && (
              <>
                {/* Click-outside overlay */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 90 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    zIndex: 100,
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: 10,
                    boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.10)",
                    minWidth: 160,
                    overflow: "hidden",
                    animation: "card-enter 150ms ease-out both",
                  }}
                >
                  {MENU_ITEMS.map(({ icon: Icon, label, danger }, i) => (
                    <button
                      key={label}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 14px",
                        border: "none",
                        borderBottom:
                          i < MENU_ITEMS.length - 1 ? "1px solid #F3F4F6" : "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontFamily: F,
                        fontSize: 13,
                        color: danger ? "#dc2626" : "#212121",
                        textAlign: "left",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = danger ? "#FFF5F5" : "#F5F5F5")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Icon size={14} stroke={1.5} style={{ flexShrink: 0 }} />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: F,
            fontSize: 12,
            color: "#9E9E9E",
            lineHeight: "1.4",
          }}
        >
          <span>{board.region}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#D4D4D4", flexShrink: 0 }} />
          <span>{board.cardCount} cards</span>
          {board.isShared && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#D4D4D4", flexShrink: 0 }} />
              <span style={{ color: "#0b6fd3", fontWeight: 600 }}>Shared</span>
            </>
          )}
        </div>

        {/* Modified */}
        <span
          style={{
            fontFamily: F,
            fontSize: 11,
            color: "#BDBDBD",
            lineHeight: "1.4",
          }}
        >
          Modified {board.modifiedLabel}
        </span>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ["All boards", "Recent", "Shared with me"];

function Tabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #E5E5E5" }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            background: "none",
            border: "none",
            borderBottom: active === tab ? "2px solid #0b6fd3" : "2px solid transparent",
            padding: "10px 16px",
            fontFamily: F,
            fontSize: 13,
            fontWeight: active === tab ? 600 : 400,
            color: active === tab ? "#0b6fd3" : "#616161",
            cursor: "pointer",
            marginBottom: -1,
            whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export default function ProjectsShell() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All boards");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = BOARDS.filter((b) => {
    if (activeTab === "Shared with me" && !b.isShared) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#F8F9FA",
        fontFamily: F,
        display: "flex",
      }}
    >
      <FloatingSidebar />

      {/* Content area — offset from sidebar */}
      <div
        style={{
          marginLeft: 112, // 16 sidebar offset + 80 sidebar width + 16 gap
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Page header */}
        <div
          style={{
            padding: "32px 32px 0",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: F,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#212121",
                  lineHeight: "1.3",
                }}
              >
                My Boards
              </h1>
              <p
                style={{
                  margin: "4px 0 0",
                  fontFamily: F,
                  fontSize: 13,
                  color: "#9E9E9E",
                  lineHeight: "1.4",
                }}
              >
                {BOARDS.length} boards saved
              </p>
            </div>

            {/* Search + view toggle + new board */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <IconSearch
                  size={15}
                  stroke={1.5}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9E9E9E",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    height: 36,
                    paddingLeft: 32,
                    paddingRight: 12,
                    border: "1px solid #E5E5E5",
                    borderRadius: 8,
                    fontFamily: F,
                    fontSize: 13,
                    color: "#212121",
                    background: "#FFFFFF",
                    outline: "none",
                    width: 220,
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0b6fd3")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
                />
              </div>

              {/* View mode toggle */}
              <div
                style={{
                  display: "flex",
                  border: "1px solid #E5E5E5",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#FFFFFF",
                }}
              >
                {(["grid", "list"] as const).map((mode) => {
                  const Icon = mode === "grid" ? IconLayoutGrid : IconList;
                  return (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{
                        width: 36,
                        height: 36,
                        border: "none",
                        borderRight: mode === "grid" ? "1px solid #E5E5E5" : "none",
                        background: viewMode === mode ? "#F5F5F5" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: viewMode === mode ? "#212121" : "#9E9E9E",
                        transition: "background 0.15s",
                      }}
                    >
                      <Icon size={16} stroke={1.5} />
                    </button>
                  );
                })}
              </div>

              {/* New board */}
              <button
                onClick={() => navigate("/workspace/new")}
                style={{
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 16px",
                  border: "none",
                  borderRadius: 8,
                  background: "#0b6fd3",
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#0961bb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#0b6fd3")
                }
              >
                <IconPlus size={16} stroke={2} />
                New board
              </button>
            </div>
          </div>

          <Tabs active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Board grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 32px 32px",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                gap: 12,
                color: "#9E9E9E",
                fontFamily: F,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 40 }}>📋</span>
              <span>No boards found</span>
            </div>
          ) : viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {/* New board placeholder card */}
              <button
                onClick={() => navigate("/workspace/new")}
                style={{
                  background: "transparent",
                  border: "2px dashed #E5E5E5",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 260,
                  transition: "border-color 0.15s, background 0.15s",
                  fontFamily: F,
                  fontSize: 13,
                  color: "#9E9E9E",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0b6fd3";
                  e.currentTarget.style.background = "#F0F6FF";
                  e.currentTarget.style.color = "#0b6fd3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E5E5";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9E9E9E";
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "2px dashed currentColor",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconPlus size={20} stroke={1.5} />
                </div>
                <span style={{ fontWeight: 600 }}>New board</span>
              </button>

              {filtered.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onClick={() => navigate(`/workspace/${board.id}`)}
                />
              ))}
            </div>
          ) : (
            /* List view */
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* List header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 80px 100px 36px",
                  padding: "10px 20px",
                  borderBottom: "1px solid #F3F4F6",
                  background: "#FAFAFA",
                  fontFamily: F,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9E9E9E",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <span>Name</span>
                <span>Region</span>
                <span>Cards</span>
                <span>Modified</span>
                <span />
              </div>

              {filtered.map((board, i) => {
                const { accent } = THUMBNAIL_CONFIGS[board.thumbnailVariant];
                return (
                  <div
                    key={board.id}
                    onClick={() => navigate(`/workspace/${board.id}`)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 80px 100px 36px",
                      padding: "12px 20px",
                      borderBottom:
                        i < filtered.length - 1 ? "1px solid #F3F4F6" : "none",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = "#F8F9FA")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                    }
                  >
                    {/* Name with color dot */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: accent,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#212121" }}>
                        {board.title}
                      </span>
                      {board.isShared && (
                        <span
                          style={{
                            fontFamily: F,
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#0b6fd3",
                            background: "#EBF3FC",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          Shared
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: F, fontSize: 12, color: "#9E9E9E" }}>{board.region}</span>
                    <span style={{ fontFamily: F, fontSize: 12, color: "#9E9E9E" }}>{board.cardCount}</span>
                    <span style={{ fontFamily: F, fontSize: 12, color: "#9E9E9E" }}>{board.modifiedLabel}</span>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#9E9E9E",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F5F5F5";
                        e.currentTarget.style.color = "#616161";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#9E9E9E";
                      }}
                    >
                      <IconDotsVertical size={14} stroke={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
