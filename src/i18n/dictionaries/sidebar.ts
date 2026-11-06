export const sidebarTranslations = {
  en: {
    home: "Home",
    jobs: "Jobs",
    schemes: "Schemes",
    examination: "Examination",
    results: "Results",
    admitCards: "Admit Cards",
    guides: "Articles & Guides",
    videos: "Videos",
    contact: "Contact",
  },
  mr: {
    home: "मुख्यपृष्ठ",
    jobs: "सरकारी नोकरी",
    schemes: "सरकारी योजना",
    examination: "परीक्षा",
    results: "निकाल",
    admitCards: "प्रवेशपत्र",
    guides: "लेख आणि मार्गदर्शक",
    videos: "व्हिडिओ",
    contact: "संपर्क",
  },
  hi: {
    home: "मुखपृष्ठ",
    jobs: "सरकारी नौकरी",
    schemes: "सरकारी योजनाएँ",
    examination: "परीक्षा",
    results: "परिणाम",
    admitCards: "प्रवेशपत्र",
    guides: "लेख और मार्गदर्शक",
    videos: "वीडियो",
    contact: "संपर्क",
  },
} as const;

export type SidebarTranslationKey = keyof typeof sidebarTranslations.en;