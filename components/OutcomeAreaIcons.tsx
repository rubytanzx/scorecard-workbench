
import { type OutcomeAreaRef } from "@/lib/mockData";

interface Props {
  areas: OutcomeAreaRef[];
  /** Render size of each SVG. Defaults to 32. */
  size?: number;
}

/**
 * A row of brand outcome-area SVGs with a styled hover tooltip per
 * icon showing the full outcome-area name. Used by Trending Across IDA
 * and Counter Intuitive Findings cards.
 *
 * The component renders its own <style> block; React + browsers de-dupe
 * identical CSS so it's safe to mount many instances on the same page.
 */
export default function OutcomeAreaIcons({ areas, size = 32 }: Props) {
  if (areas.length === 0) return null;
  return (
    <>
      <style>{`
        .oa-icon-tt {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }
        .oa-icon-tt-bubble {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          padding: 6px 10px;
          background: #0D1A2B;
          color: #FFFFFF;
          font-family: 'Open Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.35;
          white-space: nowrap;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 120ms ease, transform 120ms ease;
          z-index: 30;
          box-shadow: 0 4px 12px rgba(13, 26, 43, 0.18);
        }
        .oa-icon-tt-bubble::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #0D1A2B;
        }
        .oa-icon-tt:hover .oa-icon-tt-bubble,
        .oa-icon-tt:focus-visible .oa-icon-tt-bubble {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {areas.map((oa) => (
          <span key={oa.iconSrc} className="oa-icon-tt" tabIndex={0}>
            <span
              aria-hidden="true"
              style={{ display: "block", width: size, height: size, backgroundImage: `url(${oa.iconSrc})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
            />
            <span className="oa-icon-tt-bubble" role="tooltip">
              {oa.name}
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
