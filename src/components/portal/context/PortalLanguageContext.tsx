/* File Location: shivanyams/src/components/portal/context/PortalLanguageContext.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

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
