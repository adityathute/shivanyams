/*
 * File Location: shivanyams/src/i18n/organized/dictionaries/sidebar.ts
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
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
