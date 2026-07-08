
import { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconLogout, IconSettings, IconLogin, IconPencil, IconSun, IconMoon } from "@tabler/icons-react";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import WBGLogo from "@/components/WBGLogo";

const SCORECARD_DATA_ITEMS = [
  { id: "outcomes",  label: "Outcomes" },
  { id: "data",      label: "Data"     },
  { id: "targets",   label: "Targets"  },
];

const NAV_TABS = [
  { id: "for-you",       label: "For You"                            },
  { id: "scorecard-data",label: "Scorecard Data", hasDropdown: true  },
  { id: "about",         label: "About",          noActive: true     },
  { id: "api",           label: "API",            noActive: true     },
] as const;

interface Props {
  workspaceCount?: number;
  onOpenWorkspace?: () => void;
  /** True once the page has scrolled — transitions nav from transparent to frosted solid. */
  scrolled?: boolean;
  /** When set, replaces "Scorecard Workbench" with an editable narrative title. */
  narrativeTitle?: string;
  onNarrativeTitleChange?: (title: string) => void;
  onLogoClick?: () => void;
}


export default function AppHeader({ workspaceCount = 0, onOpenWorkspace, scrolled = false, narrativeTitle, onNarrativeTitleChange, onLogoClick }: Props) {
  const { isInternal, signOut, signIn } = useViewMode();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("for-you");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close nav dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handle = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [profileOpen]);

  const startTitleEdit = () => {
    setTitleDraft(narrativeTitle ?? "");
    setTitleEditing(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const commitTitleEdit = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) onNarrativeTitleChange?.(trimmed);
    setTitleEditing(false);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full h-[72px] relative"
      style={{
        background: scrolled ? "var(--header-bg-scrolled)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        transition: "background 420ms ease, backdrop-filter 420ms ease",
      }}
    >
      {/* Gradient divider — horizontal glow, sharpens when scrolled */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
          background: isDark
            ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(100,210,235,0.22) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(0,80,140,0.08) 20%, rgba(0,100,160,0.18) 50%, rgba(0,80,140,0.08) 80%, transparent 100%)",
          opacity: scrolled ? 1 : 0.35,
          transition: "opacity 420ms ease",
          pointerEvents: "none",
        }}
      />
      <div className="max-w-[1440px] mx-auto px-[24px] h-[72px] grid grid-cols-[1fr_auto_1fr] items-end gap-4">
        {/* Brand */}
        <div className="justify-self-start self-center flex items-center gap-3 shrink-0">
          <button
            onClick={onLogoClick}
            className="flex items-center shrink-0 bg-transparent border-none cursor-pointer p-0"
            aria-label="Go to home"
          >
            <WBGLogo isDark={isDark} />
          </button>
          {!narrativeTitle && (
            <>
              <div className="w-px h-4" style={{ background: "var(--divider)" }} />
              <span className="text-[13px] font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>Scorecard Workbench</span>
            </>
          )}
        </div>

        {/* Center: editable narrative title OR nav tabs */}
        {narrativeTitle ? (
          <div className="justify-self-center self-center">
            {titleEditing ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitleEdit}
                onKeyDown={(e) => { if (e.key === "Enter") commitTitleEdit(); if (e.key === "Escape") setTitleEditing(false); }}
                autoFocus
                className="bg-transparent text-[15px] font-semibold text-white tracking-tight outline-none border-b border-white/40 focus:border-white/70 text-center"
                style={{ minWidth: 120, maxWidth: 480 }}
              />
            ) : (
              <button
                onClick={startTitleEdit}
                title="Click to rename"
                className="group flex items-center gap-2 text-[15px] font-semibold text-white tracking-tight hover:text-white/90 transition-colors"
              >
                <span className="border-b border-transparent group-hover:border-white/30 transition-colors">{narrativeTitle}</span>
                <IconPencil size={12} className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
              </button>
            )}
          </div>
        ) : (
        <nav className="justify-self-center flex items-end gap-1" aria-label="Main navigation">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDropdown = "hasDropdown" in tab;

            if (isDropdown) {
              return (
                <div key={tab.id} ref={dropdownRef} className="relative">
                  <button
                    onClick={() => { setDropdownOpen((v) => !v); }}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                    className="relative flex items-center gap-1 px-4 h-[72px] text-[16px] font-semibold leading-[140%] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    style={{ color: isActive ? "var(--nav-text-active)" : "var(--nav-text)" }}
                  >
                    {tab.label}
                    <IconChevronDown
                      size={12}
                      className={`opacity-70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                    <span className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ background: "var(--nav-underline)" }} />
                  </button>

                  {dropdownOpen && (
                    <div
                      role="menu"
                      className="absolute top-[calc(100%+4px)] left-0 min-w-[160px] py-1.5 rounded-xl overflow-hidden"
                      style={{
                        background: isDark ? "rgba(14,28,42,0.96)" : "rgba(255,255,255,0.97)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,57,107,0.12)",
                        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.45)" : "0 8px 32px rgba(0,30,80,0.12)",
                      }}
                    >
                      {SCORECARD_DATA_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          className={`w-full flex items-center px-4 py-2.5 text-[14px] transition-colors text-left ${isDark ? "text-white/80 hover:text-white hover:bg-white/10" : "text-[#15353F]/80 hover:text-[#15353F] hover:bg-[#004972]/08"}`}
                          style={isDark ? {} : { "--tw-bg-opacity": "1" } as React.CSSProperties}
                          onMouseEnter={e => { if (!isDark) e.currentTarget.style.background = "rgba(0,73,114,0.06)"; }}
                          onMouseLeave={e => { if (!isDark) e.currentTarget.style.background = ""; }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => { if (!("noActive" in tab)) setActiveTab(tab.id); setDropdownOpen(false); }}
                className="relative flex items-center gap-1 px-4 h-[72px] text-[16px] font-semibold leading-[140%] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                style={{ color: isActive ? "var(--nav-text-active)" : "var(--nav-text)" }}
              >
                {tab.label}
                <span className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ background: "var(--nav-underline)" }} />
              </button>
            );
          })}
        </nav>
        )}

        {/* Right side: theme toggle + user/sign-in */}
        <div className="justify-self-end self-center flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "var(--nav-text)" }}
          >
            {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

        {/* User profile / Sign In */}
        {isInternal ? (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="User menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="w-9 h-9 rounded-full bg-[#0288D1] flex items-center justify-center text-white text-[13px] font-bold tracking-wide hover:ring-2 hover:ring-white/30 transition-all"
            >
              JD
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute top-[calc(100%+8px)] right-0 w-[220px] rounded-2xl overflow-hidden"
                style={{
                  background: isDark ? "rgba(14,28,42,0.97)" : "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,57,107,0.12)",
                  boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)" : "0 12px 40px rgba(0,30,80,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                {/* User info */}
                <div className="px-4 pt-4 pb-3" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,57,107,0.10)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0288D1] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                      JD
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold truncate" style={{ color: isDark ? "#fff" : "#15353F" }}>Jane Doe</p>
                      <p className="text-[11.5px] truncate" style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(21,53,63,0.50)" }}>ITSEF</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {[
                    { label: "My Workspace", icon: null, count: workspaceCount > 0 ? workspaceCount : null, onClick: () => { setProfileOpen(false); onOpenWorkspace?.(); } },
                    { label: "Settings", icon: <IconSettings size={15} aria-hidden="true" />, count: null, onClick: () => setProfileOpen(false) },
                  ].map(({ label, icon, count, onClick }) => (
                    <button key={label} role="menuitem" onClick={onClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] transition-colors text-left"
                      style={{ color: isDark ? "rgba(255,255,255,0.80)" : "rgba(21,53,63,0.80)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,73,114,0.06)"; e.currentTarget.style.color = isDark ? "#fff" : "#15353F"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.80)" : "rgba(21,53,63,0.80)"; }}
                    >
                      {icon && <span style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(21,53,63,0.40)" }}>{icon}</span>}
                      {label}
                      {count != null && <span className="ml-auto text-[11px] font-medium" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(21,53,63,0.40)" }}>{count}</span>}
                    </button>
                  ))}
                </div>

                {/* Divider + Sign out */}
                <div className="py-1.5" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,57,107,0.10)" }}>
                  <button
                    role="menuitem"
                    onClick={() => { setProfileOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] transition-colors text-left"
                    style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(21,53,63,0.60)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,73,114,0.06)"; e.currentTarget.style.color = isDark ? "#fff" : "#15353F"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.60)" : "rgba(21,53,63,0.60)"; }}
                  >
                    <span style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(21,53,63,0.40)" }}><IconLogout size={15} aria-hidden="true" /></span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={signIn}
            aria-label="Sign in"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all"
            style={{
              color: "var(--nav-text)",
              border: "1px solid var(--card-border)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--card-bg)"; e.currentTarget.style.borderColor = "var(--card-border-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
          >
            <IconLogin size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} aria-hidden="true" />
            Sign In
          </button>
        )}
        </div>{/* /right-side wrapper */}
      </div>{/* /grid */}
    </header>
  );
}
