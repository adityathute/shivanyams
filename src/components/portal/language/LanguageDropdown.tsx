"use client";

import type { Language } from "shivanya-i18n";
import { useAuth } from "shivanya-auth";
import { Select } from "shivanya-ui";

import { usePortalLanguage } from "../context/PortalLanguageContext";
import "./LanguageDropdown.css";

const desktopLanguages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "mr", label: "मराठी" },
  { value: "hi", label: "हिंदी" },
];

const mobileLanguages: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "mr", label: "मराठी" },
  { value: "hi", label: "हिंदी" },
];

function persistLanguage(language: Language) {
  try {
    localStorage.setItem("shivanya-language", language);
    document.cookie =
      `shivanya-language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {}

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
        console.error("Failed to save account language preference:", error);
      }
    }
  }

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) =>
    void handleChange(event.target.value as Language);

  return (
    <>
      <div className="language-dropdown-desktop">
        <Select
          value={language}
          options={desktopLanguages}
          onChange={handleSelect}
          aria-label="Select language"
        />
      </div>

      <div className="language-dropdown-mobile">
        <Select
          size="sm"
          className="language-select-mobile"
          value={language}
          options={mobileLanguages}
          onChange={handleSelect}
          aria-label="Select language"
        />
      </div>
    </>
  );
}