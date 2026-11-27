# File Location: shivanyams/backend/apps/portal/data/categories.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
# Repository Commit: feb778ec5c752dbb3a47b56dec4caf79b64ebb01
# Both repositories are read-only references.
# Cleanup Status: Clean
# Cleanup Info: Batch 15 audit. Verified canonical English/Marathi/Hindi category labels, stable slugs, ordering and legacy-slug migration mapping; data remains centralized.

"""Canonical multilingual category definitions for the public portal.

Keep category names, descriptions, order and canonical slugs here.
The seed_portal_categories command applies these definitions to the database.
"""

PORTAL_CATEGORIES = (
    {
        "sort_order": 1,
        "name_en": "Jobs",
        "name_mr": "नोकरी",
        "name_hi": "नौकरी",
        "slug": "jobs",
        "description_en": "Find the latest government and private job vacancies, recruitment notifications, eligibility, application dates, fees and official application links.",
        "description_mr": "सरकारी आणि खासगी नोकऱ्यांच्या नवीन भरती, भरतीच्या जाहिराती, पात्रता, अर्जाच्या तारखा, शुल्क आणि अधिकृत अर्ज लिंकची माहिती मिळवा.",
        "description_hi": "सरकारी और निजी नौकरियों की नई भर्तियों, भर्ती सूचनाओं, योग्यता, आवेदन की तारीखों, शुल्क और आधिकारिक आवेदन लिंक की जानकारी पाएँ।",
    },
    {
        "sort_order": 2,
        "name_en": "Schemes",
        "name_mr": "योजना",
        "name_hi": "योजनाएँ",
        "slug": "schemes",
        "description_en": "Explore government schemes, subsidies, scholarships, financial assistance, eligibility, required documents and official application links.",
        "description_mr": "सरकारी योजना, अनुदाने, शिष्यवृत्ती, आर्थिक मदत, पात्रता, आवश्यक कागदपत्रे आणि अधिकृत अर्ज लिंकची माहिती मिळवा.",
        "description_hi": "सरकारी योजनाओं, सब्सिडी, छात्रवृत्ति, आर्थिक सहायता, पात्रता, जरूरी दस्तावेज़ों और आधिकारिक आवेदन लिंक की जानकारी पाएँ।",
    },
    {
        "sort_order": 3,
        "name_en": "Exams",
        "name_mr": "परीक्षा",
        "name_hi": "परीक्षाएँ",
        "slug": "exams",
        "description_en": "Get examination notifications, schedules, application updates, syllabus, exam patterns, answer keys and official exam links.",
        "description_mr": "परीक्षांच्या सूचना, वेळापत्रक, अर्जासंबंधी अपडेट, अभ्यासक्रम, परीक्षेचे स्वरूप, उत्तरतालिका आणि अधिकृत परीक्षा लिंकची माहिती मिळवा.",
        "description_hi": "परीक्षाओं की सूचनाएँ, समय-सारणी, आवेदन अपडेट, पाठ्यक्रम, परीक्षा पैटर्न, उत्तर कुंजी और आधिकारिक परीक्षा लिंक की जानकारी पाएँ।",
    },
    {
        "sort_order": 4,
        "name_en": "Admit Cards",
        "name_mr": "हॉल तिकीट",
        "name_hi": "एडमिट कार्ड",
        "slug": "admit-cards",
        "description_en": "Find admit card announcements, release dates, download instructions and official hall ticket links.",
        "description_mr": "प्रवेशपत्राच्या सूचना, प्रसिद्ध होण्याच्या तारखा, डाउनलोड करण्याची पद्धत आणि अधिकृत हॉल तिकीट लिंक मिळवा.",
        "description_hi": "एडमिट कार्ड की सूचनाएँ, जारी होने की तारीखें, डाउनलोड करने का तरीका और आधिकारिक लिंक पाएँ।",
    },
    {
        "sort_order": 5,
        "name_en": "Results",
        "name_mr": "निकाल",
        "name_hi": "रिजल्ट",
        "slug": "results",
        "description_en": "Check government recruitment and examination results, merit lists, cut-off marks, selection lists and official result links.",
        "description_mr": "सरकारी भरती आणि परीक्षांचे निकाल, गुणवत्ता याद्या, कट-ऑफ गुण, निवड याद्या आणि अधिकृत निकाल लिंक तपासा.",
        "description_hi": "सरकारी भर्ती और परीक्षाओं के रिजल्ट, मेरिट लिस्ट, कट-ऑफ अंक, चयन सूची और आधिकारिक रिजल्ट लिंक देखें।",
    },
    {
        "sort_order": 6,
        "name_en": "Guides",
        "name_mr": "मार्गदर्शन",
        "name_hi": "मार्गदर्शन",
        "slug": "guides",
        "description_en": "Learn step by step how to download or update Aadhaar, apply for a passport, use online services, download documents and complete other digital tasks.",
        "description_mr": "आधार डाउनलोड किंवा अपडेट करणे, पासपोर्टसाठी अर्ज करणे, ऑनलाइन सेवा वापरणे, कागदपत्रे डाउनलोड करणे आणि इतर डिजिटल कामे करण्याची टप्प्याटप्प्याने माहिती मिळवा.",
        "description_hi": "आधार डाउनलोड या अपडेट करना, पासपोर्ट के लिए आवेदन करना, ऑनलाइन सेवाओं का उपयोग करना, दस्तावेज़ डाउनलोड करना और अन्य डिजिटल काम करना सीखें।",
    },
    {
        "sort_order": 7,
        "name_en": "Videos",
        "name_mr": "व्हिडिओ",
        "name_hi": "वीडियो",
        "slug": "videos",
        "description_en": "Watch useful video tutorials, job updates, scheme explanations, admit card guides and other helpful videos from our YouTube channel.",
        "description_mr": "नोकरी अपडेट, योजनांची माहिती, हॉल तिकीट डाउनलोड करण्याच्या सूचना आणि आमच्या YouTube चॅनेलवरील इतर उपयुक्त व्हिडिओ पाहा.",
        "description_hi": "नौकरी अपडेट, योजनाओं की जानकारी, एडमिट कार्ड डाउनलोड करने के तरीके और हमारे YouTube चैनल के अन्य उपयोगी वीडियो देखें।",
    },
    {
        "sort_order": 8,
        "name_en": "Tools",
        "name_mr": "टूल्स",
        "name_hi": "टूल्स",
        "slug": "tools",
        "description_en": "Use free online tools for image compression, photo and signature resizing, age calculation, PDF processing and document conversion.",
        "description_mr": "फोटो कॉम्प्रेस करणे, फोटो व स्वाक्षरीचा आकार बदलणे, वय मोजणे, PDF वापरणे आणि कागदपत्रांचे रूपांतर करणे यासाठी मोफत ऑनलाइन टूल्स वापरा.",
        "description_hi": "फोटो कंप्रेस करने, फोटो और हस्ताक्षर का आकार बदलने, उम्र की गणना करने, PDF से जुड़े काम और दस्तावेज़ बदलने के लिए मुफ्त ऑनलाइन टूल्स इस्तेमाल करें।",
    },
)

# These are the old database slugs that identify the same existing category rows.
# The seed command updates those rows in place, preserving their primary keys
# and all Post foreign-key relationships.
LEGACY_CATEGORY_SLUGS = {
    "exams": "examination",
    "guides": "articles-guides",
}
