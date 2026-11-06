"use client";

import { createContext, useContext } from "react";
import type { Language } from "shivanya-i18n";

const PortalLanguageContext = createContext<Language>("mr");

export const PortalLanguageProvider = PortalLanguageContext.Provider;

export function usePortalLanguage() {
  return useContext(PortalLanguageContext);
}
