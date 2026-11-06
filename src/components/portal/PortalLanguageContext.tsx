"use client";

import {
  createContext,
  useContext,
  useState,
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

  return (
    <PortalLanguageContext.Provider value={{ language, setLanguage }}>
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
