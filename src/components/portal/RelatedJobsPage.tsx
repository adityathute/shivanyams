"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePortalData } from "../portal/data/portal-data";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import "./saved/SavedPostsPage.css";

const organizationLabels: Record<string, Record<string, string>> = {
  central: { en: "Central Government", mr: "केंद्र सरकार", hi: "केंद्र सरकार" },
  state: { en: "State Government", mr: "राज्य सरकार", hi: "राज्य सरकार" },
  district: { en: "District Administration", mr: "जिल्हा प्रशासन", hi: "जिला प्रशासन" },
  local: { en: "Local Government", mr: "स्थानिक स्वराज्य संस्था", hi: "स्थानीय शासन" },
  psu: { en: "Public Sector Undertaking", mr: "सार्वजनिक क्षेत्रातील उपक्रम", hi: "सार्वजनिक क्षेत्र का उपक्रम" },
  university: { en: "Government University", mr: "शासकीय विद्यापीठ", hi: "सरकारी विश्वविद्यालय" },
  bank: { en: "Government Bank", mr: "शासकीय बँक", hi: "सरकारी बैंक" },
  court: { en: "Court", mr: "न्यायालय", hi: "न्यायालय" },
  other: { en: "Other Government Organization", mr: "इतर शासकीय संस्था", hi: "अन्य सरकारी संगठन" },
};

const TAG_CATEGORIES = [
  { label: "Jobs", types: ["job"] },
  { label: "Schemes", types: ["scheme"] },
  { label: "Articles & Guides", types: ["guide"] },
  { label: "Admit Cards", types: ["admit"] },
  { label: "Examination", types: ["examination", "exam"] },
  { label: "Results", types: ["result"] },
  { label: "Videos", types: ["video"] },
  { label: "Tools", types: ["tool"] },
] as const;

const copy = {
  en: { eyebrow: "SHIVANYAMS • DISCOVER", title: "Related Content", description: "Explore jobs, schemes and updates matching this tag.", count: "posts found", loading: "Loading related content...", empty: "No published content was found for this selection.", more: "Explore more tags", allTags: "View all tags" },
  mr: { eyebrow: "SHIVANYAMS • शोधा", title: "संबंधित माहिती", description: "या टॅगशी संबंधित नोकऱ्या, योजना आणि अपडेट्स पहा.", count: "पोस्ट मिळाल्या", loading: "संबंधित माहिती लोड होत आहे...", empty: "या टॅगसाठी प्रकाशित माहिती उपलब्ध नाही.", more: "आणखी टॅग शोधा", allTags: "सर्व टॅग पहा" },
  hi: { eyebrow: "SHIVANYAMS • खोजें", title: "संबंधित सामग्री", description: "इस टैग से जुड़ी नौकरियाँ, योजनाएँ और अपडेट देखें।", count: "पोस्ट मिलीं", loading: "संबंधित सामग्री लोड हो रही है...", empty: "इस टैग के लिए कोई प्रकाशित सामग्री नहीं मिली।", more: "और टैग खोजें", allTags: "सभी टैग देखें" },
};

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

function localized(value: { en?: string; mr?: string; hi?: string }, language: string) {
  return value[language as "en" | "mr" | "hi"] || value.en || value.mr || value.hi || "";
}

function formatDate(value: string, language: string) {
  if (!value) return "";
  const locale = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function RelatedJobsPage() {
  const params = useParams<{ filterType: string; slug: string }>();
  const filterType = params.filterType || "tag";
  const slug = decodeURIComponent(params.slug || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data } = usePortalData();
  const { language } = usePortalLanguage();
  const labels = copy[language];

  const relatedItems = useMemo(() => data.items.filter((item) => {
    if (filterType === "organization") {
      return item.type === "job" && slugify(item.organization_type || "") === slug;
    }
    if (filterType === "tag") {
      return (item.tags || []).some((tag) => slugify(tag) === slug);
    }
    return false;
  }), [data.items, filterType, slug]);

  const visibleItems = useMemo(() => {
    if (filterType !== "tag" || selectedCategory === "all") return relatedItems;
    const category = TAG_CATEGORIES.find((item) => item.label === selectedCategory);
    if (!category) return relatedItems;
    return relatedItems.filter((item) => (category.types as readonly string[]).includes(item.type));
  }, [relatedItems, filterType, selectedCategory]);

  const suggestedTags = useMemo(() => {
    if (filterType !== "tag") return [];

    const counts = new Map<string, { label: string; count: number; relatedCount: number }>();
    const addTags = (items: typeof data.items, related: boolean) => {
      items.forEach((item) => {
        (item.tags || []).forEach((tag) => {
          const key = slugify(tag);
          if (!key || key === slug) return;
          const current = counts.get(key) || { label: tag.trim(), count: 0, relatedCount: 0 };
          if (related) current.relatedCount += 1;
          else current.count += 1;
          counts.set(key, current);
        });
      });
    };

    // Tags appearing alongside this tag are shown first, followed by popular global tags.
    addTags(relatedItems, true);
    addTags(data.items, false);

    return [...counts.entries()]
      .sort((a, b) =>
        b[1].relatedCount - a[1].relatedCount ||
        b[1].count - a[1].count ||
        a[1].label.localeCompare(b[1].label),
      )
      .slice(0, 10);
  }, [data.items, relatedItems, filterType, slug]);

  const heading = useMemo(() => {
    if (filterType === "organization") {
      const value = relatedItems[0]?.organization_type || "";
      return localized(organizationLabels[value] || { en: value }, language) || slug.replaceAll("-", " ");
    }
    const tag = relatedItems.flatMap((item) => item.tags || []).find((value) => slugify(value) === slug);
    return tag || slug.replaceAll("-", " ");
  }, [filterType, relatedItems, language, slug]);

  return (
    <div className="saved-page related-saved-page">
      <header className="saved-page-heading">
        <span className="saved-eyebrow">{labels.eyebrow}</span>
        <h1>{labels.title}</h1>
        <p>{labels.description}</p>
      </header>

      {filterType === "tag" && suggestedTags.length > 0 && (
        <section className="saved-panel related-tag-suggestions">
          <div className="saved-section-heading">
            <h2>{labels.more}</h2>
            <Link className="related-tag-view-all" href="/tags">{labels.allTags}</Link>
          </div>
          <div className="related-tag-list">
            {suggestedTags.map(([tagSlug, tag]) => (
              <Link className="related-tag-chip" href={`/tags/${tagSlug}`} key={tagSlug}>
                <span>{tag.label}</span>
                <small>{tag.count}</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="saved-panel">
        <div className="saved-section-heading">
          <h2>{heading}</h2>
          <span>{visibleItems.length} {labels.count}</span>
        </div>

        {filterType === "tag" && (
          <div className="saved-category-tabs" aria-label="Filter related content by category">
            <button
              type="button"
              className={selectedCategory === "all" ? "selected" : ""}
              onClick={() => setSelectedCategory("all")}
            >
              All <span>{relatedItems.length}</span>
            </button>
            {TAG_CATEGORIES.map((category) => {
              const count = relatedItems.filter((item) => (category.types as readonly string[]).includes(item.type)).length;
              return (
                <button
                  type="button"
                  key={category.label}
                  className={selectedCategory === category.label ? "selected" : ""}
                  onClick={() => setSelectedCategory(category.label)}
                >
                  {category.label} <span>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {data.loading ? (
          <div className="saved-empty-state saved-list-empty" role="status">
            {labels.loading}
          </div>
        ) : visibleItems.length ? (
          <div className="saved-post-list">
            {visibleItems.map((item) => {
              const title = localized({ en: item.title_en || item.title, mr: item.title_mr, hi: item.title_hi }, language);
              const summary = localized({ en: item.summary_en || item.description, mr: item.summary_mr, hi: item.summary_hi }, language);
              const category = localized({ en: item.category_en || item.category, mr: item.category_mr, hi: item.category_hi }, language);
              const hrefByType: Record<string, string> = {
                job: "/jobs", scheme: "/schemes", examination: "/examination", exam: "/examination",
                admit: "/admit-cards", result: "/results", guide: "/guides", video: "/videos", tool: "/tools",
              };
              const href = `${hrefByType[item.type] || "/"}/${item.slug || slugify(item.title)}`;
              return (
                <article className="saved-post-row related-job-row" key={`${item.type}-${item.id}`}>
                  <Link className="saved-post-link" href={href}>
                    <span className={`update-badge ${item.type}`}>{category}</span>
                    <span className="saved-post-title">
                      {title}
                      {summary ? <small>{summary}</small> : null}
                    </span>
                    <time>{formatDate(item.date, language)}</time>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="saved-empty-state saved-list-empty">{labels.empty}</div>
        )}
      </section>


    </div>
  );
}
