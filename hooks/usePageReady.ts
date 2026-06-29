// hooks/usePageReady.ts
import { useEffect, useState } from "react";

interface PageReadyState {
  isReady: boolean;
  progress: number; // 0–1
}

export function usePageReady(): PageReadyState {
  const [progress, setProgress] = useState<number>(0.1);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    let settled = false;

    const markComplete = () => {
      if (settled) return;
      setProgress(0.9);
      setTimeout(() => {
        if (!settled) {
          settled = true;
          setProgress(1);
          setIsReady(true);
        }
      }, 500);
    };

    const update = () => {
      const rs = document.readyState;
      if (rs === "loading") {
        setProgress(0.1);
      } else if (rs === "interactive") {
        setProgress(0.6);
      } else if (rs === "complete") {
        markComplete();
      }
    };

    update();
    document.addEventListener("readystatechange", update);

    // Fallback: if already complete when the hook mounts (e.g. fast machines)
    if (document.readyState === "complete") markComplete();

    return () => document.removeEventListener("readystatechange", update);
  }, []);

  return { isReady, progress };
}
