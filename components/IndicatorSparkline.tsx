
interface Props {
  points: number[];   // 0–1 normalised values
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export default function IndicatorSparkline({
  points,
  width = 60,
  height = 16,
  color = "#10B981",
  strokeWidth = 1.5,
}: Props) {
  if (points.length < 2) return null;

  const stepX = width / (points.length - 1);
  const polyline = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - p * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
