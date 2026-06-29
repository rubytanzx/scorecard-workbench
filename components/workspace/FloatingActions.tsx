
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconLock,
  IconSparkles,
  IconPlayerPlay,
  IconX,
  IconClipboardText,
  IconFileText,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconMicrophone,
} from "@tabler/icons-react";

const F = "'Open Sans', sans-serif";

const GENERATE_OPTIONS = [
  { icon: IconClipboardText, label: "Summarized One-Pager" },
  { icon: IconFileText,      label: "Structured Document" },
  { icon: IconFileSpreadsheet, label: "Data Sheet" },
  { icon: IconFileTypePdf,   label: "Board as PDF" },
  { icon: IconMicrophone,    label: "Podcast" },
];

interface Props {
  mode?: "edit" | "view";
  onPlay?: () => void;
}

export default function FloatingActions({ mode = "edit", onPlay }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <div ref={containerRef} style={{ position: "fixed", right: 16, top: 16, zIndex: 40 }}>
      {/* Action bar */}
      <div
        style={{
          background: "white",
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          boxShadow: "0px 2px 4px 0px rgba(12,35,60,0.08)",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 64,
        }}
      >
        {/* Share and Access (edit only) */}
        {mode === "edit" && (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 999,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: F,
              fontSize: 14,
              fontWeight: 600,
              color: "#0b6fd3",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            <IconLock size={20} stroke={1.5} />
            Share and Access
          </button>
        )}

        {/* Remix (view only) */}
        {mode === "view" && (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 999,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            <IconSparkles size={20} stroke={1.5} color="#ae5ded" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontFamily: F,
                fontSize: 14,
                fontWeight: 600,
                background: "linear-gradient(to left, #68c5ea 19%, #ae5ded 123%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Remix
            </span>
          </button>
        )}

        {/* Generate — opens dropdown */}
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 999,
            border: dropdownOpen ? "1px solid #0b6fd3" : "1px solid #e0e0e0",
            background: dropdownOpen ? "#f0f6ff" : "white",
            cursor: "pointer",
            fontFamily: F,
            fontSize: 14,
            fontWeight: 600,
            color: "#0b6fd3",
            whiteSpace: "nowrap",
            lineHeight: 1.4,
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <IconSparkles size={20} stroke={1.5} />
          Generate
        </button>

        {/* Play (edit mode) */}
        {mode === "edit" && (
          <button
            onClick={onPlay}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 999,
              border: "1px solid #0b6fd3",
              background: "#0b6fd3",
              cursor: "pointer",
              fontFamily: F,
              fontSize: 14,
              fontWeight: 600,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            <IconPlayerPlay size={20} stroke={1.5} />
            Play
          </button>
        )}

        {/* Play (view only) */}
        {mode === "view" && (
          <button
            onClick={onPlay}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 999,
              border: "1px solid #0b6fd3",
              background: "#0b6fd3",
              cursor: "pointer",
              fontFamily: F,
              fontSize: 14,
              fontWeight: 600,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            <IconPlayerPlay size={20} stroke={1.5} />
            Play
          </button>
        )}

        {/* Close */}
        <button
          onClick={() => navigate("/")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#616161",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <IconX size={20} stroke={1.5} />
        </button>
      </div>

      {/* Generate dropdown */}
      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 468,
            background: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
            boxShadow: "0px 8px 20px 0px rgba(0,0,0,0.10)",
            overflow: "hidden",
            animation: "card-enter 200ms ease-out both",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <IconSparkles size={16} stroke={1.5} style={{ color: "#616161", flexShrink: 0 }} />
            <span
              style={{
                flex: 1,
                fontFamily: F,
                fontSize: 14,
                fontWeight: 600,
                color: "#616161",
                lineHeight: 1.4,
              }}
            >
              Generate as
            </span>
            <button
              onClick={() => setDropdownOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#616161",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <IconX size={16} stroke={1.5} />
            </button>
          </div>

          {/* Options */}
          {GENERATE_OPTIONS.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              onClick={() => setDropdownOpen(false)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                border: "none",
                borderBottom: i < GENERATE_OPTIONS.length - 1 ? "1px solid #F3F4F6" : "none",
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
              <span style={{ color: "#616161", display: "flex", flexShrink: 0 }}>
                <Icon size={16} stroke={1.5} />
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
