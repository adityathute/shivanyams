/*
 * File Location: shivanyams/src/i18n/dictionaries/portal-dictionary.ts
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Portal translation data and typed getter; UI Components: 0; CSS Selectors: 0. Uses the shared i18n Language type. Locale wording review remains pending.
 */
import type { Language } from "../types";

export const portalDictionary = {
  updatesTitle: {
    en: "Latest Updates",
    mr: "ताज्या अपडेट्स",
    hi: "ताज़ा अपडेट्स",
  },
  viewAll: {
    en: "View All",
    mr: "सर्व पहा",
    hi: "सभी देखें",
  },
  all: {
    en: "All",
    mr: "सर्व",
    hi: "सभी",
  },
  new: {
    en: "New",
    mr: "नवीन",
    hi: "नया",
  },
  emptyUpdates: {
    en: "No updates found for this search.",
    mr: "या शोधासाठी अपडेट्स सापडले नाहीत.",
    hi: "इस खोज के लिए कोई अपडेट नहीं मिला।",
  },
} satisfies Record<string, Record<Language, string>>;

export function getPortalText(
  key: keyof typeof portalDictionary,
  language: Language,
): string {
  return portalDictionary[key][language];
}