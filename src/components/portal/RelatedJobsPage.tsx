/*
 * File Location: shivanyams/src/components/portal/RelatedJobsPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 13 audit. UI Audit: Next.js Link plus semantic/UI elements; 0 shivanya-ui imports. Reuses shared portal data/language contexts; CSS mapping reuses SavedPostsPage.css. Responsive pagination and tag recommendations reviewed; shared slugify extraction and legacy CSS migration pending.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePortalData } from "../portal/data/portal-data";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { formatJobApplicationDeadline, getJobApplicationDeadline, getJobDeadlineStatus } from "../portal/utils/job-deadline";
import "./../../styles/legacy/components/portal/saved/SavedPostsPage.css";
import "./../../styles/legacy/components/jobs/JobsPage.css";

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
  en: { eyebrow: "SHIVANYAMS • DISCOVER", title: "Related Content", description: "Explore jobs, schemes and updates matching this tag.", count: "posts", loading: "Loading related content...", empty: "No published content was found for this selection.", more: "Explore more tags", allTags: "View all tags" },
  mr: { eyebrow: "SHIVANYAMS • शोधा", title: "संबंधित माहिती", description: "या टॅगशी संबंधित नोकऱ्या, योजना आणि अपडेट्स पहा.", count: "पोस्ट मिळाल्या", loading: "संबंधित माहिती लोड होत आहे...", empty: "या टॅगसाठी प्रकाशित माहिती उपलब्ध नाही.", more: "आणखी टॅग शोधा", allTags: "सर्व टॅग पहा" },
  hi: { eyebrow: "SHIVANYAMS • खोजें", title: "संबंधित सामग्री", description: "इस टैग से जुड़ी नौकरियाँ, योजनाएँ और अपडेट देखें।", count: "पोस्ट मिलीं", loading: "संबंधित सामग्री लोड हो रही है...", empty: "इस टैग के लिए कोई प्रकाशित सामग्री नहीं मिली।", more: "और टैग खोजें", allTags: "सभी टैग देखें" },
};

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

function localized(value: { en?: string; mr?: string; hi?: string }, language: string) {
  return value[language as "en" | "mr" | "hi"] || value.en || value.mr || value.hi || "";
}

function getExtendedDeadlineLabel(language: string) {
  if (language === "mr") return "मुदतवाढ";
  if (language === "hi") return "तिथि बढ़ाई गई";
  return "Date Extended";
}

function isJobDeadlineRevised(item: import("../portal/data/portal-data").Item) {
  const applicationEnd = item.important_dates?.find((entry) => entry.date_type === "application_end");
  return applicationEnd?.date_format === "revised" || applicationEnd?.date_format === "revised_with_time";
}


export function RelatedJobsPage() {
  const params = useParams<{ filterType: string; slug: string }>();
  const filterType = params.filterType || "tag";
  const slug = decodeURIComponent(params.slug || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const resultsPanelRef = useRef<HTMLElement | null>(null);
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

  const pageCount = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const paginatedItems = visibleItems.slice((page - 1) * pageSize, page * pageSize);
  const firstItem = visibleItems.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, visibleItems.length);

  useEffect(() => {
    const updatePageSize = () => {
      const panel = resultsPanelRef.current;
      if (!panel) return;
      const top = panel.getBoundingClientRect().top;
      const availableHeight = Math.max(160, window.innerHeight - top - 155);
      const rowHeight = window.innerWidth <= 760 ? 94 : 78;
      setPageSize(Math.max(10, Math.floor(availableHeight / rowHeight)));
    };

    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    const observer = typeof ResizeObserver !== "undefined" && resultsPanelRef.current
      ? new ResizeObserver(updatePageSize)
      : null;
    if (observer && resultsPanelRef.current) observer.observe(resultsPanelRef.current);
    return () => {
      window.removeEventListener("resize", updatePageSize);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, slug]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const suggestedTags = useMemo(() => {
    if (filterType !== "tag") return [];

    const counts = new Map<string, { label: string; count: number; relatedCount: number }>();
    const addTags = (items: typeof data.items, related: boolean) => {
      items.forEach((item) => {
        const seen = new Set<string>();
        (item.tags || []).forEach((tag) => {
          const key = slugify(tag);
          if (seen.has(key)) return;
          seen.add(key);
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
      <header className="portal-page-heading saved-page-heading">
        <span className="saved-eyebrow">{labels.eyebrow}</span>
        <h1>{labels.title}</h1>
        <p>{filterType === "organization" ? (language === "mr" ? `${heading} मधील नोकऱ्या आणि अपडेट्स पहा.` : language === "hi" ? `${heading} की नौकरियाँ और अपडेट देखें।` : `Explore jobs and updates from ${heading}.`) : labels.description}</p>
      </header>

      <section ref={resultsPanelRef} className={`updates-panel panel jobs-updates updates-panel-language-${language}`}>
        <div className="section-heading">
          <h2>{filterType === "tag" ? `# ${heading}` : heading}</h2>
          <span>{visibleItems.length} {labels.count}</span>
        </div>

        {filterType === "tag" && (
          <div className="saved-category-tabs" aria-label="Filter related content by category">
            <button
              type="button"
              className={selectedCategory === "all" ? "selected" : ""}
              onClick={() => { setSelectedCategory("all"); setPage(1); }}
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
                  onClick={() => { setSelectedCategory(category.label); setPage(1); }}
                >
                  {category.label} <span>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {data.loading ? (
          <div className="related-post-skeleton-list" role="status" aria-label={labels.loading}>
            {Array.from({ length: 5 }, (_, index) => (
              <div className="related-post-skeleton-row" key={index} aria-hidden="true">
                <span className="related-post-skeleton-badge" />
                <span className="related-post-skeleton-copy">
                  <span className="related-post-skeleton-title" />
                  <span className="related-post-skeleton-summary" />
                </span>
                <span className="related-post-skeleton-date" />
              </div>
            ))}
          </div>
        ) : visibleItems.length ? (
          <div className="update-list">
            {paginatedItems.map((item) => {
              const title = localized({ en: item.title_en || item.title, mr: item.title_mr, hi: item.title_hi }, language);
              const summary = localized({ en: item.summary_en || item.description, mr: item.summary_mr, hi: item.summary_hi }, language);
              const categorySlug = getCategorySlugForType(item.type);
              const categoryLabel = getLocalizedCategoryLabel(item, language);
              const applicationDeadline = item.type === "job" ? getJobApplicationDeadline(item) : "";
              const deadlineStatus = applicationDeadline ? getJobDeadlineStatus(applicationDeadline) : "";
              const deadlineRevised = Boolean(applicationDeadline && isJobDeadlineRevised(item));

              const hrefByType: Record<string, string> = {
                job: "/jobs", scheme: "/schemes", examination: "/examination", exam: "/examination",
                admit: "/admit-cards", result: "/results", guide: "/guides", video: "/videos", tool: "/tools",
              };
              const href = `${hrefByType[item.type] || "/"}/${item.slug || slugify(item.title)}`;
              return (
                <Link className={`update-row related-job-row${applicationDeadline ? " update-row-has-deadline" : ""}`} href={href} key={`${item.type}-${item.id}`}>
                  <CategoryBadge category={categorySlug} label={categoryLabel} />
                  <span className="update-title">
                    {title}
                    {summary ? <small>{summary}</small> : null}
                  </span>
                  {applicationDeadline ? (
                    <span className="update-deadline-group">
                      {deadlineRevised ? <span className="update-deadline-extended">{getExtendedDeadlineLabel(language)}</span> : null}
                      <time className={`update-application-deadline deadline-${deadlineStatus}`} dateTime={applicationDeadline}>{formatJobApplicationDeadline(applicationDeadline)}</time>
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="saved-empty-state saved-list-empty">{labels.empty}</div>
        )}

        {visibleItems.length > pageSize && (
          <div className="related-content-pagination">
            <span>Showing {firstItem}–{lastItem} of {visibleItems.length} posts</span>
            <div className="related-content-pagination-controls">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
            </div>
          </div>
        )}
      </section>

      {filterType === "tag" && suggestedTags.length > 0 && (
        <section className="updates-panel panel related-tag-suggestions">
          <div className="section-heading">
            <h2>{labels.more}</h2>
            <Link className="related-tag-view-all" href="/tags">{labels.allTags}</Link>
          </div>
          <div className="related-tag-list">
            {suggestedTags.map(([tagSlug, tag]) => (
              <Link className="related-tag-chip" href={`/tags/${tagSlug}`} key={tagSlug}>
                <span className="related-tag-label">{tag.label}</span>
                <small>{tag.count}</small>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
