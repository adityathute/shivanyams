/* File Location: shivanyams/src/components/portal/post/not-found-recommendations-config.ts
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Clean
 * Cleanup Info: Batch 13 audit. Config Audit: 0 UI components; 0 CSS selectors; localized labels cover en/hi/mr and fallback to English. No duplicate keys detected.
 */
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
