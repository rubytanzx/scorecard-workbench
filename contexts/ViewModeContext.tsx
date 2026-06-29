import { createContext, useContext, useState, useEffect } from "react";

type ViewMode = "internal" | "external";

interface ViewModeContextValue {
  isInternal: boolean;
  signOut: () => void;
  signIn: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue>({
  isInternal: true,
  signOut: () => {},
  signIn: () => {},
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem("viewMode") as ViewMode) ?? "internal";
    } catch {
      return "internal";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("viewMode", mode);
    } catch {}
  }, [mode]);

  return (
    <ViewModeContext.Provider
      value={{
        isInternal: mode === "internal",
        signOut: () => setMode("external"),
        signIn: () => setMode("internal"),
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
