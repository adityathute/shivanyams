import type { Language } from "../../components/portal/CategoryGrid";

export const baseDictionary = {
  importantSections: {
    en: "Important Sections",
    mr: "महत्त्वाचे विभाग",
    hi: "महत्वपूर्ण अनुभाग",
  },
} satisfies Record<string, Record<Language, string>>;

export function getBaseText(
  key: keyof typeof baseDictionary,
  language: Language,
): string {
  return baseDictionary[key][language];
}