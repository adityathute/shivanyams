"use client";

import type { Language } from "shivanya-i18n";
import { useAuth } from "shivanya-auth";
import { Select } from "shivanya-ui";

import { usePortalLanguage } from "./PortalLanguageContext";

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "mr", label: "मराठी" },
  { value: "hi", label: "हिंदी" },
];

function persistLanguage(language: Language) {
  try {
    localStorage.setItem("shivanya-language", language);

    document.cookie =
      `shivanya-language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    // The in-memory language still applies for this session.
  }

  document.documentElement.lang = language;
}

export function LanguageDropdown() {
  const { language, setLanguage } = usePortalLanguage();
  const { isAuthenticated, loading, updateSettings } = useAuth();

  async function handleChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
    persistLanguage(nextLanguage);

    if (!loading && isAuthenticated) {
      try {
        await updateSettings({ language: nextLanguage });
      } catch (error) {
        console.error(
          "Failed to save account language preference:",
          error,
        );
      }
    }
  }

  return (
    <Select
      value={language}
      options={languages}
      onChange={(event) =>
        void handleChange(event.target.value as Language)
      }
      aria-label="Select language"
    />
  );
}