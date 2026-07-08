// components/LoadingScreen.tsx

import { useEffect, useRef, useState } from "react";
import D3Globe from "./D3Globe";
import { useTheme } from "@/contexts/ThemeContext";
import WBGLogo from "@/components/WBGLogo";

const F = "'Open Sans', sans-serif";


interface LoadingScreenProps {
  isReady: boolean;
  progress: number; // 0–1
}

export default function LoadingScreen({ isReady, progress }: LoadingScreenProps) {
  const { isDark } = useTheme();
  const bg = isDark ? "#1F3A4A" : "#F0F7FE";
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure viewport for the globe size
  useEffect(() => {
    const measure = () => {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Enforce minimum 3 s display so the globe has time to initialize
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Exit once both page is ready AND minimum time has elapsed
  useEffect(() => {
    if (!isReady || !minElapsed || exiting) return;
    setExiting(true);
    const timer = setTimeout(() => setVisible(false), 650);
    return () => clearTimeout(timer);
  }, [isReady, minElapsed, exiting]);

  if (!visible) return null;

  const barWidth = Math.round(progress * 320);

  return (
    <div
      ref={containerRef}
      className={exiting ? "loading-exit" : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: bg,
        overflow: "hidden",
      }}
    >
      {/* Subtle bottom gradient so globe fades into background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: `linear-gradient(to top, ${bg} 0%, transparent 100%)`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Branding block — upper ~38% of screen */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "clamp(48px, 9vh, 100px)",
          gap: 0,
        }}
      >
        {/* Logo row */}
        <div style={{ marginBottom: 28, opacity: isDark ? 0.75 : 0.88 }}>
          <WBGLogo isDark={isDark} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: F,
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 300,
            color: isDark ? "#FFFFFF" : "#004972",
            margin: 0,
            lineHeight: 1.15,
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          The World Bank Group
        </h1>
        <h1
          style={{
            fontFamily: F,
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            color: isDark ? "#FFFFFF" : "#15353F",
            margin: 0,
            lineHeight: 1.15,
            textAlign: "center",
            letterSpacing: "-0.02em",
            marginBottom: 36,
          }}
        >
          Scorecard
        </h1>

        {/* Progress bar */}
        <div
          style={{
            width: 320,
            height: 8,
            borderRadius: 9999,
            background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,57,107,0.12)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: barWidth,
              maxWidth: 320,
              borderRadius: 9999,
              background: isDark ? "rgba(255,255,255,0.75)" : "#0071BC",
              transition: "width 400ms ease-out",
            }}
          />
        </div>

        {/* Status label */}
        <span
          style={{
            fontFamily: F,
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.45)" : "#5A6B7C",
            letterSpacing: "0.04em",
          }}
        >
          {isReady ? "Ready" : "Initializing…"}
        </span>
      </div>

      {/* Globe — flows below branding, crops naturally at viewport bottom */}
      {dimensions.w > 0 && (
        <div
          style={{
            position: "absolute",
            top: 360,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.8,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <D3Globe
            width={Math.round(dimensions.w * 0.88)}
            height={Math.round(dimensions.w * 0.88)}
            autoRotate
            rotationSpeed={0.15}
          />
        </div>
      )}
    </div>
  );
}
