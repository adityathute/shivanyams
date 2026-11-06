import type { Language } from "../../components/portal/CategoryGrid";

export const baseDictionary = {
  importantSections: {
    en: "Important Sections",
    mr: "महत्त्वाचे विभाग",
    hi: "महत्वपूर्ण अनुभाग",
  },

  footerDescription: {
    en: "Information about government jobs, schemes, examinations, results, admit cards, articles, guides, and important updates in Marathi, Hindi, and English.",
    mr: "सरकारी नोकरी, योजना, परीक्षा, निकाल, प्रवेशपत्र, लेख, मार्गदर्शक आणि महत्त्वाच्या अपडेट्सची माहिती – मराठी, हिंदी आणि इंग्रजीमध्ये.",
    hi: "सरकारी नौकरी, योजनाओं, परीक्षाओं, परिणामों, प्रवेश पत्रों, लेखों, मार्गदर्शिकाओं और महत्वपूर्ण अपडेट्स की जानकारी – मराठी, हिंदी और अंग्रेज़ी में।",
  },
} satisfies Record<string, Record<Language, string>>;

export function getBaseText(
  key: keyof typeof baseDictionary,
  language: Language,
): string {
  return baseDictionary[key][language];
}