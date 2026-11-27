/**
 * File Location: shivanyams/src/data/portal/categories.ts
 * Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
 * Checked Repository: adityathute/shivanyams @ shiv-v2
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 21 audit; review complete, follow-up work remains tracked in PROJECT_STRUCTURE.md.
 */
/**
 * Canonical frontend category translations and presentation metadata.
 *
 * The backend category definitions are the database seed source of truth.
 * Keep these translations in sync with backend/apps/portal/data/categories.py.
 * Category names are also used as their post badges in the selected language.
 */

export type PortalLanguage = "en" | "mr" | "hi";

export interface PortalCategoryTranslation {
  name: string;
  badge: string;
  description: string;
}

export interface PortalCategoryDefinition {
  sortOrder: number;
  slug: string;
  legacySlugs: string[];
  href: string;
  type: string;
  translations: Record<PortalLanguage, PortalCategoryTranslation>;
}

export const PORTAL_CATEGORIES: PortalCategoryDefinition[] = [
  {
    sortOrder: 1,
    slug: "jobs",
    legacySlugs: [],
    href: "/jobs",
    type: "job",
    translations: {
      en: {
        name: "Jobs",
        badge: "Jobs",
        description: "Find the latest government and private job vacancies, recruitment notifications, eligibility, application dates, fees and official application links.",
      },
      mr: {
        name: "नोकरी",
        badge: "नोकरी",
        description: "सरकारी आणि खासगी नोकऱ्यांच्या नवीन भरती, भरतीच्या जाहिराती, पात्रता, अर्जाच्या तारखा, शुल्क आणि अधिकृत अर्ज लिंकची माहिती मिळवा.",
      },
      hi: {
        name: "नौकरी",
        badge: "नौकरी",
        description: "सरकारी और निजी नौकरियों की नई भर्तियों, भर्ती सूचनाओं, योग्यता, आवेदन की तारीखों, शुल्क और आधिकारिक आवेदन लिंक की जानकारी पाएँ।",
      },
    },
  },
  {
    sortOrder: 2,
    slug: "schemes",
    legacySlugs: [],
    href: "/schemes",
    type: "scheme",
    translations: {
      en: {
        name: "Schemes",
        badge: "Schemes",
        description: "Explore government schemes, subsidies, scholarships, financial assistance, eligibility, required documents and official application links.",
      },
      mr: {
        name: "योजना",
        badge: "योजना",
        description: "सरकारी योजना, अनुदाने, शिष्यवृत्ती, आर्थिक मदत, पात्रता, आवश्यक कागदपत्रे आणि अधिकृत अर्ज लिंकची माहिती मिळवा.",
      },
      hi: {
        name: "योजनाएँ",
        badge: "योजनाएँ",
        description: "सरकारी योजनाओं, सब्सिडी, छात्रवृत्ति, आर्थिक सहायता, पात्रता, जरूरी दस्तावेज़ों और आधिकारिक आवेदन लिंक की जानकारी पाएँ।",
      },
    },
  },
  {
    sortOrder: 3,
    slug: "exams",
    legacySlugs: ["examination"],
    href: "/examination",
    type: "examination",
    translations: {
      en: {
        name: "Exams",
        badge: "Exams",
        description: "Get examination notifications, schedules, application updates, syllabus, exam patterns, answer keys and official exam links.",
      },
      mr: {
        name: "परीक्षा",
        badge: "परीक्षा",
        description: "परीक्षांच्या सूचना, वेळापत्रक, अर्जासंबंधी अपडेट, अभ्यासक्रम, परीक्षेचे स्वरूप, उत्तरतालिका आणि अधिकृत परीक्षा लिंकची माहिती मिळवा.",
      },
      hi: {
        name: "परीक्षाएँ",
        badge: "परीक्षाएँ",
        description: "परीक्षाओं की सूचनाएँ, समय-सारणी, आवेदन अपडेट, पाठ्यक्रम, परीक्षा पैटर्न, उत्तर कुंजी और आधिकारिक परीक्षा लिंक की जानकारी पाएँ।",
      },
    },
  },
  {
    sortOrder: 4,
    slug: "admit-cards",
    legacySlugs: ["admit-card"],
    href: "/admit-cards",
    type: "admit",
    translations: {
      en: {
        name: "Admit Cards",
        badge: "Admit Cards",
        description: "Find admit card announcements, release dates, download instructions and official hall ticket links.",
      },
      mr: {
        name: "हॉल तिकीट",
        badge: "हॉल तिकीट",
        description: "प्रवेशपत्राच्या सूचना, प्रसिद्ध होण्याच्या तारखा, डाउनलोड करण्याची पद्धत आणि अधिकृत हॉल तिकीट लिंक मिळवा.",
      },
      hi: {
        name: "एडमिट कार्ड",
        badge: "एडमिट कार्ड",
        description: "एडमिट कार्ड की सूचनाएँ, जारी होने की तारीखें, डाउनलोड करने का तरीका और आधिकारिक लिंक पाएँ।",
      },
    },
  },
  {
    sortOrder: 5,
    slug: "results",
    legacySlugs: [],
    href: "/results",
    type: "result",
    translations: {
      en: {
        name: "Results",
        badge: "Results",
        description: "Check government recruitment and examination results, merit lists, cut-off marks, selection lists and official result links.",
      },
      mr: {
        name: "निकाल",
        badge: "निकाल",
        description: "सरकारी भरती आणि परीक्षांचे निकाल, गुणवत्ता याद्या, कट-ऑफ गुण, निवड याद्या आणि अधिकृत निकाल लिंक तपासा.",
      },
      hi: {
        name: "रिजल्ट",
        badge: "रिजल्ट",
        description: "सरकारी भर्ती और परीक्षाओं के रिजल्ट, मेरिट लिस्ट, कट-ऑफ अंक, चयन सूची और आधिकारिक रिजल्ट लिंक देखें।",
      },
    },
  },
  {
    sortOrder: 6,
    slug: "guides",
    legacySlugs: ["articles-guides"],
    href: "/guides",
    type: "guide",
    translations: {
      en: {
        name: "Guides",
        badge: "Guides",
        description: "Learn step by step how to download or update Aadhaar, apply for a passport, use online services, download documents and complete other digital tasks.",
      },
      mr: {
        name: "मार्गदर्शन",
        badge: "मार्गदर्शन",
        description: "आधार डाउनलोड किंवा अपडेट करणे, पासपोर्टसाठी अर्ज करणे, ऑनलाइन सेवा वापरणे, कागदपत्रे डाउनलोड करणे आणि इतर डिजिटल कामे करण्याची टप्प्याटप्प्याने माहिती मिळवा.",
      },
      hi: {
        name: "मार्गदर्शन",
        badge: "मार्गदर्शन",
        description: "आधार डाउनलोड या अपडेट करना, पासपोर्ट के लिए आवेदन करना, ऑनलाइन सेवाओं का उपयोग करना, दस्तावेज़ डाउनलोड करना और अन्य डिजिटल काम करना सीखें।",
      },
    },
  },
  {
    sortOrder: 7,
    slug: "videos",
    legacySlugs: [],
    href: "/videos",
    type: "video",
    translations: {
      en: {
        name: "Videos",
        badge: "Videos",
        description: "Watch useful video tutorials, job updates, scheme explanations, admit card guides and other helpful videos from our YouTube channel.",
      },
      mr: {
        name: "व्हिडिओ",
        badge: "व्हिडिओ",
        description: "नोकरी अपडेट, योजनांची माहिती, हॉल तिकीट डाउनलोड करण्याच्या सूचना आणि आमच्या YouTube चॅनेलवरील इतर उपयुक्त व्हिडिओ पाहा.",
      },
      hi: {
        name: "वीडियो",
        badge: "वीडियो",
        description: "नौकरी अपडेट, योजनाओं की जानकारी, एडमिट कार्ड डाउनलोड करने के तरीके और हमारे YouTube चैनल के अन्य उपयोगी वीडियो देखें।",
      },
    },
  },
  {
    sortOrder: 8,
    slug: "tools",
    legacySlugs: [],
    href: "/tools",
    type: "tool",
    translations: {
      en: {
        name: "Tools",
        badge: "Tools",
        description: "Use free online tools for image compression, photo and signature resizing, age calculation, PDF processing and document conversion.",
      },
      mr: {
        name: "टूल्स",
        badge: "टूल्स",
        description: "फोटो कॉम्प्रेस करणे, फोटो व स्वाक्षरीचा आकार बदलणे, वय मोजणे, PDF वापरणे आणि कागदपत्रांचे रूपांतर करणे यासाठी मोफत ऑनलाइन टूल्स वापरा.",
      },
      hi: {
        name: "टूल्स",
        badge: "टूल्स",
        description: "फोटो कंप्रेस करने, फोटो और हस्ताक्षर का आकार बदलने, उम्र की गणना करने, PDF से जुड़े काम और दस्तावेज़ बदलने के लिए मुफ्त ऑनलाइन टूल्स इस्तेमाल करें।",
      },
    },
  },
];

export const PORTAL_CATEGORY_ORDER = PORTAL_CATEGORIES.map(
  (category) => category.slug,
);

const categorySlugAliases: Record<string, string> = Object.fromEntries(
  PORTAL_CATEGORIES.flatMap((category) =>
    category.legacySlugs.map((legacySlug) => [legacySlug, category.slug]),
  ),
);

export function normalizePortalCategorySlug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, "-");
  return categorySlugAliases[normalized] ?? normalized;
}

export function getPortalCategoryDefinition(slug: string) {
  const normalized = normalizePortalCategorySlug(slug);
  return PORTAL_CATEGORIES.find((category) => category.slug === normalized);
}
