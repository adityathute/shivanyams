"use client";

import { useState } from "react";
import { UpdatesSection } from "../home/UpdatesSection";
import type { ItemType } from "../data/portal-data";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import "../../../styles/legacy/components/portal/saved/SavedPostsPage.css";

const copy = {
  en: {
    eyebrow: "SHIVANYAMS • DISCOVER",
    title: "View All Posts",
    description: "Explore the latest jobs, schemes, exams, results, admit cards, guides and other updates in one place.",
    posts: "All Posts",
  },
  mr: {
    eyebrow: "SHIVANYAMS • शोधा",
    title: "सर्व पोस्ट पहा",
    description: "नोकऱ्या, योजना, परीक्षा, निकाल, प्रवेशपत्रे, मार्गदर्शक लेख आणि इतर सर्व अपडेट्स एकाच ठिकाणी पहा.",
    posts: "सर्व पोस्ट",
  },
  hi: {
    eyebrow: "SHIVANYAMS • खोजें",
    title: "सभी पोस्ट देखें",
    description: "नौकरियां, योजनाएं, परीक्षाएं, परिणाम, प्रवेश पत्र, गाइड और अन्य सभी अपडेट एक ही जगह देखें।",
    posts: "सभी पोस्ट",
  },
};

export function UpdatesPage() {
  const { language } = usePortalLanguage();
  const [activeCategory, setActiveCategory] = useState<ItemType | "all">("all");
  const text = copy[language];

  return (
    <div className="saved-page updates-directory-page">
      <header className="portal-page-heading saved-page-heading">
        <span className="saved-eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </header>

      <UpdatesSection
        type={activeCategory}
        title={text.posts}
        language={language}
        onTypeChange={setActiveCategory}
        showFilters
        showDateAndNewBadge={false}
        limit={null}
        showViewAll={false}
      />
    </div>
  );
}
