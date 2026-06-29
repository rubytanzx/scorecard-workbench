
/**
 * Small uppercase tag label used to mark AI-generated cards across
 * the landing page (Trending Across IDA, Counter Intuitive Findings).
 * Flat #EBEEF2 background, medium gray uppercase text — no border,
 * no animation, no gleam.
 */

interface Props {
  label: string;
  /** Override the text colour. Defaults to a neutral medium gray. */
  color?: string;
}

export default function AiTagPill({ label, color = "#4B5563" }: Props) {
  return (
    <span
      style={{
        alignSelf: "flex-start",
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "'Open Sans', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color,
        background: "#EBEEF2",
        borderRadius: 5,
        padding: "5px 14px",
        lineHeight: 1.3,
      }}
    >
      {label}
    </span>
  );
}
