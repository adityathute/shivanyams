"use client";

// File Location: shivanyams/src/components/portal/context/PortalLanguageContext.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shivanya-i18n Language type); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Memoized the language context value to prevent unrelated provider consumers from receiving a new object on every render; preserved document language synchronization and SDK Language typing. No CSS required.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Language } from "shivanya-i18n";

type PortalLanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const PortalLanguageContext =
  createContext<PortalLanguageContextValue | null>(null);

export function PortalLanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language],
  );

  return (
    <PortalLanguageContext.Provider value={value}>
      {children}
    </PortalLanguageContext.Provider>
  );
}

export function usePortalLanguage() {
  const context = useContext(PortalLanguageContext);

  if (!context) {
    throw new Error(
      "usePortalLanguage must be used inside PortalLanguageProvider",
    );
  }

  return context;
}
