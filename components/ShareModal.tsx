
import React, { useEffect, useRef, useState } from "react";
import {
  IconLink,
  IconCheck,
  IconX,
  IconShare,
  IconWorld,
} from "@tabler/icons-react";
import { useTheme } from "@/contexts/ThemeContext";

const F = "'Open Sans', sans-serif";

// ─── Mock internal directory ──────────────────────────────────────────────────
interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
}

const DIRECTORY: DirectoryUser[] = [
  { id: "u1",  name: "Amara Diallo",      email: "a.diallo@worldbank.org",    role: "Senior Economist, IDA",         initials: "AD", avatarColor: "#0F766E" },
  { id: "u2",  name: "Jonas Weber",       email: "j.weber@worldbank.org",     role: "Operations Manager, OPCS",      initials: "JW", avatarColor: "#0284C7" },
  { id: "u3",  name: "Priya Krishnan",    email: "p.krishnan@worldbank.org",  role: "Results Analyst, DEC",          initials: "PK", avatarColor: "#7C3AED" },
  { id: "u4",  name: "Carlos Mendoza",    email: "c.mendoza@worldbank.org",   role: "Task Team Leader, AFCE2",       initials: "CM", avatarColor: "#B45309" },
  { id: "u5",  name: "Fatou Ba",          email: "f.ba@worldbank.org",        role: "Economist, Africa Region",      initials: "FB", avatarColor: "#0F766E" },
  { id: "u6",  name: "Sun Li",            email: "s.li@worldbank.org",        role: "Senior Data Scientist, WBG",    initials: "SL", avatarColor: "#0284C7" },
  { id: "u7",  name: "Elena Popescu",     email: "e.popescu@worldbank.org",   role: "Program Manager, ECA",          initials: "EP", avatarColor: "#BE185D" },
  { id: "u8",  name: "Kwame Asante",      email: "k.asante@worldbank.org",    role: "Portfolio Advisor, IDA",        initials: "KA", avatarColor: "#0F766E" },
  { id: "u9",  name: "Nadia Hassan",      email: "n.hassan@worldbank.org",    role: "Senior Specialist, MENA",       initials: "NH", avatarColor: "#7C3AED" },
  { id: "u10", name: "Tom Eriksson",      email: "t.eriksson@worldbank.org",  role: "Results Measurement Advisor",   initials: "TE", avatarColor: "#0284C7" },
];

interface SharedRecipient extends DirectoryUser {
  sharedAt: string;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 28 }: { user: DirectoryUser; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user.avatarColor,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      fontFamily: F, flexShrink: 0,
      userSelect: "none",
    }}>
      {user.initials}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  /** "internal" → recipient search + WBG directory (Results Narrative)
   *  "external" → copy-link only, anyone with link (Narrative Builder) */
  variant: "internal" | "external";
  conversationTitle?: string;
}

export default function ShareModal({ open, onClose, variant, conversationTitle }: ShareModalProps) {
  const { isDark } = useTheme();
  const shareUrl = `https://scorecard-workbench.worldbank.org/share/${Math.random().toString(36).slice(2, 10)}`;

  // Theme helpers
  const bg        = isDark ? "#0D1B2A"                        : "#FFFFFF";
  const border    = isDark ? "rgba(255,255,255,0.09)"         : "rgba(0,57,107,0.12)";
  const divider   = isDark ? "rgba(255,255,255,0.07)"         : "rgba(0,57,107,0.08)";
  const textHigh  = isDark ? "rgba(255,255,255,0.92)"         : "rgba(0,13,26,0.88)";
  const textMid   = isDark ? "rgba(255,255,255,0.55)"         : "rgba(0,13,26,0.55)";
  const textLow   = isDark ? "rgba(255,255,255,0.35)"         : "rgba(0,13,26,0.38)";
  const inputBg   = isDark ? "rgba(255,255,255,0.05)"         : "rgba(0,57,107,0.03)";
  const inputBdr  = isDark ? "rgba(255,255,255,0.14)"         : "rgba(0,57,107,0.14)";
  const hoverBg   = isDark ? "rgba(255,255,255,0.07)"         : "rgba(0,57,107,0.05)";
  const avatarBdr = isDark ? "#0D1B2A"                        : "#FFFFFF";
  const footerBg  = isDark ? "rgba(0,0,0,0.15)"              : "rgba(0,57,107,0.03)";
  const btnBdr    = isDark ? "rgba(255,255,255,0.12)"         : "rgba(0,57,107,0.16)";
  const btnBg     = isDark ? "rgba(255,255,255,0.06)"         : "rgba(0,57,107,0.04)";
  const btnColor  = isDark ? "rgba(255,255,255,0.65)"         : "rgba(0,13,26,0.65)";

  const [copied, setCopied]             = useState(false);
  const [search, setSearch]             = useState("");
  const [staged, setStaged]             = useState<DirectoryUser[]>([]);
  const [shared, setShared]             = useState<SharedRecipient[]>([]);
  const [shareSuccess, setShareSuccess] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setCopied(false);
      setSearch("");
      setStaged([]);
      setShareSuccess(false);
      if (variant === "internal") setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [open, variant]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const suggestions = search.trim().length > 0
    ? DIRECTORY.filter((u) =>
        !staged.some((s) => s.id === u.id) &&
        !shared.some((s) => s.id === u.id) &&
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleAddToStaged = (user: DirectoryUser) => {
    setStaged((prev) => [...prev, user]);
    setSearch("");
    searchRef.current?.focus();
  };

  const handleRemoveStaged = (id: string) => {
    setStaged((prev) => prev.filter((u) => u.id !== id));
  };

  const handleShare = () => {
    if (staged.length === 0) return;
    const now = new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    const newRecipients: SharedRecipient[] = staged.map((u) => ({ ...u, sharedAt: now }));
    setShared((prev) => [...newRecipients, ...prev]);
    setStaged([]);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.30)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={variant === "internal" ? "Share conversation" : "Share link"}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2001,
          width: "min(520px, calc(100vw - 32px))",
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 16,
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.55), 0 4px 20px rgba(0,0,0,0.35)"
            : "0 20px 60px rgba(0,57,107,0.14), 0 4px 16px rgba(0,57,107,0.08)",
          overflow: "hidden",
          fontFamily: F,
          animation: "smFadeIn 0.18s ease",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px 16px",
          borderBottom: `1px solid ${divider}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: variant === "internal" ? "rgba(37,99,235,0.18)" : "rgba(5,150,105,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <IconShare size={15} color={variant === "internal" ? "#60A5FA" : "#2DA870"} />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: textHigh, lineHeight: 1.25 }}>
                Share conversation
              </div>
              {conversationTitle && (
                <div style={{ fontSize: 11.5, color: textMid, marginTop: 1, maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conversationTitle}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: "50%",
              border: "none", background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: textLow,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = hoverBg;
              e.currentTarget.style.color = textHigh;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = textLow;
            }}
          >
            <IconX size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

          {variant === "internal" ? (
            <>
              {/* Subtitle */}
              <p style={{ margin: 0, fontSize: 13, color: textMid, lineHeight: 1.55 }}>
                Everyone you invite can view your narrative.
              </p>

              {/* Invite viewers: combined chip + input field + Share button */}
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: textMid, marginBottom: 7, letterSpacing: "0.01em" }}>
                  Invite viewers
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {/* Combined chip + input box */}
                  <div style={{ position: "relative", flex: 1 }}>
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
                      minHeight: 42, padding: "6px 10px",
                      border: `1px solid ${inputBdr}`,
                      borderRadius: suggestions.length > 0 ? "8px 8px 0 0" : 8,
                      background: inputBg,
                    }}>
                      {staged.map((u) => (
                        <div key={u.id} style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "3px 8px 3px 6px",
                          background: "rgba(37,99,235,0.15)", border: "1px solid rgba(96,165,250,0.30)",
                          borderRadius: 999, fontSize: 12.5, color: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,13,26,0.80)", fontWeight: 500,
                        }}>
                          <span>{u.name}</span>
                          <button
                            onClick={() => handleRemoveStaged(u.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, color: textMid, lineHeight: 1 }}
                            aria-label={`Remove ${u.name}`}
                          >
                            <IconX size={11} />
                          </button>
                        </div>
                      ))}
                      <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={staged.length === 0 ? "Add people by name or email…" : ""}
                        className="sm-input"
                        style={{
                          flex: 1, minWidth: 80, border: "none", outline: "none",
                          fontSize: 13, color: textHigh, background: "transparent",
                          fontFamily: F, padding: "2px 0",
                        }}
                      />
                    </div>

                    {/* Dropdown suggestions */}
                    {suggestions.length > 0 && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0,
                        background: isDark ? "#0B1929" : "#FFFFFF",
                        border: `1px solid ${border}`, borderTop: "none",
                        borderRadius: "0 0 8px 8px",
                        boxShadow: isDark ? "0 12px 32px rgba(0,0,0,0.50)" : "0 8px 24px rgba(0,57,107,0.12)",
                        zIndex: 10,
                        maxHeight: 200, overflowY: "auto",
                      }}>
                        {suggestions.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleAddToStaged(u)}
                            style={{
                              width: "100%", display: "flex", alignItems: "center", gap: 10,
                              padding: "9px 12px", border: "none", background: "transparent",
                              cursor: "pointer", textAlign: "left", fontFamily: F,
                              transition: "background 0.1s",
                              borderBottom: `1px solid ${divider}`,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Avatar user={u} size={28} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: textHigh }}>{u.name}</div>
                              <div style={{ fontSize: 11.5, color: textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {u.email}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Share button — to the right of the field */}
                  <button
                    onClick={handleShare}
                    disabled={staged.length === 0}
                    style={{
                      padding: "10px 18px", borderRadius: 8,
                      border: "none",
                      background: staged.length > 0 ? "#2563EB" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,57,107,0.06)"),
                      color: staged.length > 0 ? "#fff" : textLow,
                      cursor: staged.length > 0 ? "pointer" : "not-allowed",
                      fontSize: 13.5, fontWeight: 700,
                      transition: "all 0.15s", fontFamily: F,
                      flexShrink: 0, whiteSpace: "nowrap",
                    }}
                  >
                    {shareSuccess ? "Shared!" : "Share"}
                  </button>
                </div>
              </div>

              {/* "This chat has been shared with" */}
              <div>
                <div style={{ fontSize: 13, color: textMid, marginBottom: 14 }}>
                  This narrative has been shared with
                </div>

                {/* Owner row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "#0288D1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                    fontFamily: F,
                  }}>JD</div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: textHigh }}>
                    Jane Doe <span style={{ fontWeight: 400, color: textLow }}>(You)</span>
                  </span>
                  <span style={{ fontSize: 13, color: textLow }}>Owner</span>
                </div>

                {/* Shared recipients row */}
                {shared.length > 0 && (() => {
                  const visible = shared.slice(0, 3);
                  const overflow = shared.length - 3;
                  const names = shared.slice(0, 3).map((u) => u.name);
                  const label = overflow > 0
                    ? `${names.join(", ")} and ${overflow} other${overflow > 1 ? "s" : ""}`
                    : names.join(", ");
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Stacked avatars */}
                      <div style={{ display: "flex", flexDirection: "row-reverse", marginLeft: overflow > 0 ? 0 : 0 }}>
                        {overflow > 0 && (
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,57,107,0.10)",
                            border: `2px solid ${avatarBdr}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: textMid,
                            flexShrink: 0, fontFamily: F, marginLeft: -10,
                          }}>+{overflow}</div>
                        )}
                        {[...visible].reverse().map((u, i) => (
                          <div key={u.id} style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: u.avatarColor, border: `2px solid ${avatarBdr}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                            fontFamily: F, marginLeft: i > 0 ? -10 : 0,
                          }}>{u.initials}</div>
                        ))}
                      </div>
                      <span style={{ flex: 1, fontSize: 13.5, color: textMid }}>{label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Share link — bottom */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px",
                border: `1px solid ${border}`,
                borderRadius: 8, background: inputBg,
              }}>
                <span style={{ flex: 1, fontSize: 12, color: textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                  {shareUrl}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 6,
                    border: `1px solid ${copied ? "rgba(45,168,112,0.35)" : btnBdr}`,
                    background: copied ? "rgba(5,150,105,0.12)" : btnBg,
                    cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                    color: copied ? "#2DA870" : btnColor,
                    transition: "all 0.15s", flexShrink: 0,
                    fontFamily: F,
                  }}
                >
                  {copied ? <IconCheck size={12} /> : <IconLink size={12} />}
                  {copied ? "Copied!" : "Copy share link"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* External: access badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 8,
                background: "rgba(5,150,105,0.12)",
                border: "1px solid rgba(45,168,112,0.28)",
              }}>
                <IconWorld size={13} color="#4DB896" />
                <span style={{ fontSize: 12.5, color: "#4DB896", fontWeight: 500 }}>
                  Anyone with the link can view
                </span>
              </div>

              {/* Copy link */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: textMid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                  Conversation link
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px",
                  border: `1px solid ${border}`,
                  borderRadius: 8, background: inputBg,
                }}>
                  <IconLink size={13} color={textLow} />
                  <span style={{ flex: 1, fontSize: 12, color: textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                    {shareUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 11px", borderRadius: 6,
                      border: `1px solid ${copied ? "rgba(45,168,112,0.35)" : btnBdr}`,
                      background: copied ? "rgba(5,150,105,0.12)" : btnBg,
                      cursor: "pointer", fontSize: 12, fontWeight: 600,
                      color: copied ? "#2DA870" : btnColor,
                      transition: "all 0.15s", flexShrink: 0,
                      fontFamily: F,
                    }}
                  >
                    {copied ? <IconCheck size={12} /> : <IconLink size={12} />}
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 12.5, color: textMid, lineHeight: 1.65 }}>
                Recipients land in a read-only copy of this conversation. They can continue independently without affecting the original.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "12px 20px",
          borderTop: `1px solid ${divider}`,
          background: footerBg,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px", borderRadius: 8,
              border: `1px solid ${btnBdr}`, background: btnBg,
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: btnColor, fontFamily: F,
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = hoverBg;
              e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.20)" : "rgba(0,57,107,0.24)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = btnBg;
              e.currentTarget.style.borderColor = btnBdr;
            }}
          >
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes smFadeIn {
          from { opacity: 0; transform: translate(-50%, -48%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        .sm-input::placeholder { color: ${isDark ? "rgba(255,255,255,0.22)" : "rgba(0,13,26,0.35)"} !important; }
      `}</style>
    </>
  );
}

