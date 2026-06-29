import type { CSSProperties } from "react";

/**
 * "Gleam" gradient borders for the Latest Indicator Movements cards.
 *
 * Technique: two-layer background-clip — a solid tint on the
 * padding-box (the visible card surface) and a multi-stop gradient on
 * the border-box (visible through the transparent 1px border). Works
 * with `border-radius` without the seams that `border-image-slice`
 * leaves on rounded corners.
 *
 * Each variant uses one accent colour that fades to a lighter tint at
 * the diagonal opposite corner, on top of a pale group-tinted surface.
 */

function gleam(accent: string, soft: string, bg: string): CSSProperties {
  return {
    border: "1px solid transparent",
    background:
      `linear-gradient(${bg}, ${bg}) padding-box, ` +
      `linear-gradient(135deg, ${accent} 0%, ${soft} 55%, rgba(229,231,235,0.15) 100%) border-box`,
  };
}

/** Accelerating / High-Performing Indicators — green gleam on a pale green tint */
export const gleamGreen = gleam(
  "rgba(34,197,94,0.75)",
  "rgba(187,247,208,0.45)",
  "#F0FDF4",
);

/** Slowing — amber gleam on a pale amber tint */
export const gleamAmber = gleam(
  "rgba(245,158,11,0.75)",
  "rgba(253,224,170,0.45)",
  "#FFFBEB",
);

/** Emerging / Emerging Growth Areas — blue gleam on a pale blue tint */
export const gleamBlue = gleam(
  "rgba(37,99,235,0.7)",
  "rgba(191,219,254,0.45)",
  "#EFF6FF",
);
