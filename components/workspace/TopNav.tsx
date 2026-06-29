
import { IconHome, IconMessage, IconStack2, IconSettings } from "@tabler/icons-react";

const iconButtons = [
  { icon: IconHome, label: "Home" },
  { icon: IconMessage, label: "Chat" },
  { icon: IconStack2, label: "Layers" },
];

export default function WorkspaceTopNav() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: "#FFFFFF",
        borderBottom: "1px solid #E0E0E0",
        display: "flex",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      {/* Left icon strip */}
      <div
        style={{
          width: 56,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          flexShrink: 0,
          borderRight: "1px solid #E0E0E0",
        }}
      >
        {iconButtons.map(({ icon: Icon, label }) => (
          <button
            key={label}
            aria-label={label}
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
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <Icon size={20} stroke={1.5} />
          </button>
        ))}
        <div style={{ width: 24, height: 1, background: "#E0E0E0", margin: "4px 0" }} />
        <button
          aria-label="Settings"
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
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <IconSettings size={20} stroke={1.5} />
        </button>
      </div>

      {/* Document title */}
      <span
        style={{
          fontFamily: "'Open Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#212121",
          marginLeft: 16,
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Country Partnership Framework for Mexico FY25
      </span>

      {/* Right action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingRight: 16,
          flexShrink: 0,
        }}
      >
        <button
          style={{
            height: 32,
            padding: "0 12px",
            border: "1px solid #E0E0E0",
            borderRadius: 8,
            background: "transparent",
            fontFamily: "'Open Sans', sans-serif",
            fontSize: 14,
            color: "#616161",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Share and Access
        </button>
        <button
          style={{
            height: 32,
            padding: "0 12px",
            border: "1px solid #4A9EFF",
            borderRadius: 8,
            background: "transparent",
            fontFamily: "'Open Sans', sans-serif",
            fontSize: 14,
            color: "#4A9EFF",
            cursor: "pointer",
          }}
        >
          Generate
        </button>
        <button
          style={{
            height: 32,
            padding: "0 12px",
            border: "none",
            borderRadius: 8,
            background: "#1565C0",
            fontFamily: "'Open Sans', sans-serif",
            fontSize: 14,
            color: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          Publish
        </button>

        {/* Vertical divider */}
        <div style={{ width: 1, height: 24, background: "#E0E0E0" }} />

        {/* User avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#1565C0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Open Sans', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          NT
        </div>
      </div>
    </div>
  );
}
