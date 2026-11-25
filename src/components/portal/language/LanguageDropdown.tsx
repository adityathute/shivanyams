"use client";

import type { Language } from "shivanya-i18n";
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

export function LanguageDropdown() {
  const { language } = usePortalLanguage();

  // This selector is a display-only language indicator, not a language switcher.
  const closedLabel = language === "en" ? "मराठी" : "English";

  return (
    <>
      <div className="language-dropdown-desktop">
        <div className="language-select-display">
          <Select
            value={language}
            options={desktopLanguages}
            onChange={() => {}}
            aria-label="Select language"
          />
          <span className="language-select-closed-label" aria-hidden="true">
            {closedLabel}
          </span>
        </div>
      </div>

      <div className="language-dropdown-mobile">
        <div className="language-select-display language-select-display-mobile">
          <Select
            size="sm"
            className="language-select-mobile"
            value={language}
            options={mobileLanguages}
            onChange={() => {}}
            aria-label="Select language"
          />
          <span className="language-select-closed-label" aria-hidden="true">
            {closedLabel}
          </span>
        </div>
      </div>
    </>
  );
}
