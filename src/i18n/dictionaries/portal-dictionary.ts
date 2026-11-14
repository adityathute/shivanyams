import type { Language } from "../../components/portal/category/CategoryGrid";

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