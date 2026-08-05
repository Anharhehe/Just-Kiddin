"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Audience = "newborns" | "toddlers";

type AudienceContextValue = {
  audience: Audience | null;
  setAudience: (value: Audience) => void;
  clearAudience: () => void;
};

const AudienceContext = createContext<AudienceContextValue | undefined>(undefined);

const STORAGE_KEY = "jk-audience";

export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [audience, setAudienceState] = useState<Audience | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "newborns" || saved === "toddlers") {
      setAudienceState(saved);
    }
  }, []);

  const value = useMemo<AudienceContextValue>(() => ({
    audience,
    setAudience: (next) => {
      setAudienceState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    },
    clearAudience: () => {
      setAudienceState(null);
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }), [audience]);

  return <AudienceContext.Provider value={value}>{children}</AudienceContext.Provider>;
}

export function useAudience() {
  const context = useContext(AudienceContext);
  if (!context) {
    throw new Error("useAudience must be used inside AudienceProvider");
  }
  return context;
}
