"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePortalData } from "./data/portal-data";
import { usePortalLanguage } from "./context/PortalLanguageContext";
import "./saved/SavedPostsPage.css";

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().trim().replace(/[^\\p{L}\\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

const copy = {
  en: {
    eyebrow: "SHIVANYAMS • DISCOVER",
    title: "Explore Tags",
    description: "Browse all tags used across jobs, schemes, articles and other content.",
    tags: "All tags",
    count: "tags",
    loading: "Loading tags...",
    empty: "No tags are available yet.",
  },
  mr: {
    eyebrow: "SHIVANYAMS • शोधा",
    title: "टॅग शोधा",
    description: "नोकऱ्या, योजना, लेख आणि इतर माहितीमधील सर्व टॅग पहा.",
    tags: "सर्व टॅग",
    count: "टॅग",
    loading: "टॅग लोड होत आहेत...",
    empty: "अद्याप कोणतेही टॅग उपलब्ध नाहीत.",
  },
  hi: {
    eyebrow: "SHIVANYAMS • खोजें",
    title: "टैग खोजें",
    description: "नौकरियों, योजनाओं, लेखों और अन्य सामग्री में उपयोग किए गए सभी टैग देखें।",
    tags: "सभी टैग",
    count: "टैग",
    loading: "टैग लोड हो रहे हैं...",
    empty: "अभी कोई टैग उपलब्ध नहीं है।",
  },
};

export function TagsPage() {
  const { data } = usePortalData();
  const { language } = usePortalLanguage();
  const text = copy[language];

  const tags = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();

    data.items.forEach((item) => {
      const seen = new Set<string>();
      (item.tags || []).forEach((rawTag) => {
        const label = rawTag.trim();
        const slug = slugify(label);
        if (!slug || seen.has(slug)) return;
        seen.add(slug);
        const current = counts.get(slug);
        counts.set(slug, {
          label: current?.label || label,
          count: (current?.count || 0) + 1,
        });
      });
    });

    return [...counts.entries()].sort(
      (a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label),
    );
  }, [data.items]);

  return (
    <div className="saved-page related-saved-page">
      <header className="saved-page-heading">
        <span className="saved-eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </header>

      <section className="saved-panel related-tag-suggestions">
        <div className="saved-section-heading">
          <h2>{text.tags}</h2>
          <span>{tags.length} {text.count}</span>
        </div>

        {data.loading ? (
          <div className="saved-empty-state saved-list-empty" role="status">{text.loading}</div>
        ) : tags.length ? (
          <div className="related-tag-list">
            {tags.map(([slug, tag]) => (
              <Link className="related-tag-chip" href={`/tags/${slug}`} key={slug}>
                <span>{tag.label}</span>
                <small>{tag.count}</small>
              </Link>
            ))}
          </div>
        ) : (
          <div className="saved-empty-state saved-list-empty">{text.empty}</div>
        )}
      </section>
    </div>
  );
}
