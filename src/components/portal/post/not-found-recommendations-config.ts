export const NOT_FOUND_RECOMMENDATIONS_LIMIT = 5;

export const NOT_FOUND_RECOMMENDATIONS_TEXT = {
  mostViewed: {
    en: "Most Viewed",
    hi: "सबसे ज़्यादा देखे गए",
    mr: "सर्वाधिक पाहिलेले",
  },
  latest: {
    en: "Latest",
    hi: "नवीनतम",
    mr: "नवीनतम",
  },
  popularPosts: {
    en: "Popular posts",
    hi: "लोकप्रिय पोस्ट",
    mr: "लोकप्रिय पोस्ट",
  },
  recentPosts: {
    en: "Recent posts",
    hi: "हाल की पोस्ट",
    mr: "अलीकडील पोस्ट",
  },
  views: {
    en: "views",
    hi: "बार देखा गया",
    mr: "वेळा पाहिले",
  },
} as const;

export function getNotFoundRecommendationText(
  key: keyof typeof NOT_FOUND_RECOMMENDATIONS_TEXT,
  language: string,
) {
  const translations = NOT_FOUND_RECOMMENDATIONS_TEXT[key];
  return translations[language as keyof typeof translations] || translations.en;
}
