"use client";

import type { Language } from "shivanya-i18n";
import { useAuth } from "shivanya-auth";
import { Dropdown, Select } from "shivanya-ui";

import { usePortalLanguage } from "../context/PortalLanguageContext";
import "./LanguageDropdown.css";

function persistLanguage(language: Language) {
  try {
    localStorage.setItem("shivanya-language", language);
    document.cookie =
      `shivanya-language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {}

  document.documentElement.lang = language;
}

const desktopLanguages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "mr", label: "मराठी" },
  { value: "hi", label: "हिंदी" },
];

const mobileLanguages: { value: Language; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "mr", label: "मराठी", short: "मर" },
  { value: "hi", label: "हिंदी", short: "हि" },
];

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

  const selectedLanguage =
    mobileLanguages.find((item) => item.value === language) ?? mobileLanguages[0];

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
        <Dropdown
          placement="bottom-end"
          closeOnSelect
          closeOnEscape
          closeOnOutsideClick
          className="language-menu"
        >
          <Dropdown.Trigger
            className="language-menu-trigger"
            aria-label={`Language: ${selectedLanguage.label}`}
          >
            <span>{selectedLanguage.short}</span>
            <span className="language-menu-trigger-arrow" aria-hidden="true" />
          </Dropdown.Trigger>

          <Dropdown.Content className="language-menu-content">
            <span className="language-menu-pointer" aria-hidden="true" />
            <div className="language-menu-heading">Choose language</div>
            {mobileLanguages.map((item) => (
              <Dropdown.Item
                key={item.value}
                className="language-menu-item"
                active={language === item.value}
                rightSection={
                  language === item.value ? (
                    <span className="language-menu-check" aria-hidden="true">✓</span>
                  ) : undefined
                }
                onClick={() => void handleChange(item.value)}
              >
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      </div>
    </>
  );
}
