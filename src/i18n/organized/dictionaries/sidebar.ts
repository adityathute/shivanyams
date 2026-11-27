/* File Location: shivanyams/src/i18n/organized/dictionaries/sidebar.ts
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Sidebar labels only; UI Components: 0; CSS Selectors: 0. Enforces supported locale keys with the shared i18n Language type. Translation quality review remains pending.
 */
import type { Language } from "../../types";

export const sidebarTranslations = {
  en: {
    home: "Home",
    jobs: "Jobs",
    schemes: "Schemes",
    exams: "Exams",
    admitCards: "Admit Cards",
    results: "Results",
    guides: "Guides",
    videos: "Videos",
    tools: "Tools",
    saved: "Saved",
    tags: "Tags",
    admin: "Admin",
    contact: "Contact",
  },
  mr: {
    home: "मुख्यपृष्ठ",
    jobs: "नोकरी",
    schemes: "योजना",
    exams: "परीक्षा",
    admitCards: "हॉल तिकीट",
    results: "निकाल",
    guides: "मार्गदर्शन",
    videos: "व्हिडिओ",
    tools: "टूल्स",
    saved: "सेव्ह",
    tags: "टॅग",
    admin: "Admin",
    contact: "संपर्क",
  },
  hi: {
    home: "मुखपृष्ठ",
    jobs: "नौकरी",
    schemes: "योजनाएँ",
    exams: "परीक्षाएँ",
    admitCards: "एडमिट कार्ड",
    results: "रिजल्ट",
    guides: "मार्गदर्शन",
    videos: "वीडियो",
    tools: "टूल्स",
    saved: "सेव",
    tags: "टैग",
    admin: "Admin",
    contact: "संपर्क",
  },
} satisfies Record<Language, Record<string, string>>;

export type SidebarTranslationKey = keyof typeof sidebarTranslations.en;
