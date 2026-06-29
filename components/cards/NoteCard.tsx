
import { useEffect, useRef, useState } from "react";

const F = "'Open Sans', sans-serif";

interface Props {
  data: { title?: string; body?: string; autoFocus?: boolean };
  selected: boolean;
}

export function NoteCard({ data, selected }: Props) {
  const [title, setTitle] = useState(data.title ?? "");
  const [body, setBody] = useState(data.body ?? "");
  const [focused, setFocused] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.autoFocus) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ring = selected || focused;

  return (
    <div
      style={{
        width: 360,
        background: "#FFFFFF",
        border: `1.5px solid ${ring ? "#0b6fd3" : "#e5e5e5"}`,
        borderRadius: 16,
        padding: "18px 20px 20px",
        boxSizing: "border-box",
        fontFamily: F,
        boxShadow: ring
          ? "0 0 0 3px rgba(11,111,211,0.10), 0px 2px 8px rgba(0,0,0,0.06)"
          : "0px 2px 8px rgba(0,0,0,0.06)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <input
        ref={titleRef}
        className="nodrag"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          fontFamily: F,
          fontSize: 14,
          fontWeight: 600,
          color: title ? "#212121" : "#bdbdbd",
          background: "transparent",
          marginBottom: 10,
          padding: 0,
        }}
      />
      <textarea
        className="nodrag"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add notes…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={4}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          fontFamily: F,
          fontSize: 13,
          color: "#424242",
          background: "transparent",
          resize: "none",
          lineHeight: "1.65",
          padding: 0,
          display: "block",
        }}
      />
    </div>
  );
}
