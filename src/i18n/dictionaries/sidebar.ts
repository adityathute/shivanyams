export const sidebarTranslations = {
  en: {
    home: "Home",
    governmentJobs: "Government Jobs",
    governmentSchemes: "Government Schemes",
    results: "Results",
    admitCards: "Admit Cards",
    guides: "Articles & Guides",
    videos: "Videos",
    contact: "Contact",
  },
  mr: {
    home: "मुख्यपृष्ठ",
    governmentJobs: "सरकारी नोकरी",
    governmentSchemes: "शासकीय योजना",
    results: "निकाल",
    admitCards: "प्रवेशपत्र",
    guides: "लेख आणि मार्गदर्शक",
    videos: "व्हिडिओ",
    contact: "संपर्क",
  },
  hi: {
    home: "मुखपृष्ठ",
    governmentJobs: "सरकारी नौकरी",
    governmentSchemes: "सरकारी योजनाएँ",
    results: "परिणाम",
    admitCards: "प्रवेश पत्र",
    guides: "लेख और मार्गदर्शक",
    videos: "वीडियो",
    contact: "संपर्क",
  },
} as const;

export type SidebarTranslationKey = keyof typeof sidebarTranslations.en;
