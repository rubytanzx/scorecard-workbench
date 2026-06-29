export type ThumbVariant = "people" | "digital" | "planet" | "fcs";

interface Props {
  variant: ThumbVariant;
  className?: string;
}

const PALETTE = {
  people:  { bg: "linear-gradient(135deg, #E8F5EE 0%, #D0EBDA 100%)", stroke: "#2E8B57" },
  digital: { bg: "linear-gradient(135deg, #E6F6FD 0%, #CAE8F9 100%)", stroke: "#00A0DF" },
  planet:  { bg: "linear-gradient(135deg, #F0F7E8 0%, #D8EEC4 100%)", stroke: "#3B7A2E" },
  fcs:     { bg: "linear-gradient(135deg, #0A5189 0%, #1A6B9A 50%, #2E8B57 100%)", stroke: "#FFFFFF" },
};

function PeopleIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="18" r="8" fill={stroke} />
      <path
        d="M8 40c0-8.84 7.16-16 16-16s16 7.16 16 16"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function DigitalIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="68" height="68" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="12" width="32" height="22" rx="2" stroke={stroke} strokeWidth="2.5" fill="none" />
      <path d="M17 34l14 0M24 34v6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <rect x="14" y="18" width="6" height="6" rx="1" fill={stroke} opacity=".4" />
      <rect x="22" y="18" width="12" height="2" rx="1" fill={stroke} opacity=".3" />
      <rect x="22" y="22" width="8" height="2" rx="1" fill={stroke} opacity=".25" />
      <rect x="22" y="26" width="10" height="2" rx="1" fill={stroke} opacity=".2" />
    </svg>
  );
}

function PlanetIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="68" height="68" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="14" stroke={stroke} strokeWidth="2.5" fill="none" />
      <path
        d="M24 10c-4 4-7 10-7 14s3 10 7 14M24 10c4 4 7 10 7 14s-3 10-7 14"
        stroke={stroke}
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M10 24h28" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function FcsIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0 }}
    >
      <circle cx="50" cy="80" r="60" fill="rgba(255,255,255,0.06)" />
      <circle cx="160" cy="40" r="40" fill="rgba(255,255,255,0.04)" />
      <circle cx="120" cy="160" r="70" fill="rgba(0,160,223,0.10)" />
      {/* Mini bar chart */}
      <g transform="translate(64 120)">
        <rect x="0"  y="40" width="12" height="20" rx="2" fill="rgba(255,255,255,0.30)" />
        <rect x="16" y="32" width="12" height="28" rx="2" fill="rgba(255,255,255,0.30)" />
        <rect x="32" y="36" width="12" height="24" rx="2" fill="rgba(255,255,255,0.30)" />
        <rect x="48" y="16" width="12" height="44" rx="2" fill="#00A0DF" />
        <rect x="64" y="8"  width="12" height="52" rx="2" fill="#00A0DF" />
        <rect x="80" y="0"  width="12" height="60" rx="2" fill="#00A0DF" />
      </g>
    </svg>
  );
}

export default function StoryThumbnail({ variant, className = "" }: Props) {
  const { bg, stroke } = PALETTE[variant];

  const Icon =
    variant === "people"  ? <PeopleIcon stroke={stroke} /> :
    variant === "digital" ? <DigitalIcon stroke={stroke} /> :
    variant === "planet"  ? <PlanetIcon stroke={stroke} /> :
    null;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: bg }}
    >
      {variant === "fcs" ? <FcsIllustration /> : <div style={{ opacity: 0.55 }}>{Icon}</div>}
    </div>
  );
}
