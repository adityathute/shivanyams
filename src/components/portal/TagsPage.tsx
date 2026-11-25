"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePortalData } from "./data/portal-data";
import { usePortalLanguage } from "./context/PortalLanguageContext";
import "../../styles/legacy/components/portal/saved/SavedPostsPage.css";

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const panelRef = useRef<HTMLElement | null>(null);

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

  const pageCount = Math.max(1, Math.ceil(tags.length / pageSize));
  const visibleTags = tags.slice((page - 1) * pageSize, page * pageSize);
  const firstTag = tags.length ? (page - 1) * pageSize + 1 : 0;
  const lastTag = Math.min(page * pageSize, tags.length);

  useEffect(() => {
    const updatePageSize = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const width = panel.clientWidth;
      const top = panel.getBoundingClientRect().top;
      const availableHeight = Math.max(150, window.innerHeight - top - 150);
      const columns = Math.max(1, Math.floor((width - 36) / 155));
      const rows = Math.max(1, Math.floor(availableHeight / 54));
      setPageSize(Math.max(1, columns * rows));
    };
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    const observer = typeof ResizeObserver !== "undefined" && panelRef.current
      ? new ResizeObserver(updatePageSize)
      : null;
    if (observer && panelRef.current) observer.observe(panelRef.current);
    return () => {
      window.removeEventListener("resize", updatePageSize);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <div className="saved-page related-saved-page">
      <header className="saved-page-heading">
        <span className="saved-eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </header>

      <section ref={panelRef} className="saved-panel related-tag-suggestions">
        <div className="saved-section-heading">
          <h2>{text.tags}</h2>
          <span>{tags.length} {text.count}</span>
        </div>

        {data.loading ? (
          <div className="saved-empty-state saved-list-empty" role="status">{text.loading}</div>
        ) : visibleTags.length ? (
          <div className="related-tag-list">
            {visibleTags.map(([slug, tag]) => (
              <Link className="related-tag-chip" href={`/tags/${slug}`} key={slug}>
                <span className="related-tag-label">{tag.label}</span>
                <small>{tag.count}</small>
              </Link>
            ))}
          </div>
        ) : (
          <div className="saved-empty-state saved-list-empty">{text.empty}</div>
        )}

        {tags.length > pageSize && (
          <div className="admin-table-footer tags-auto-pagination">
            <span>Showing {firstTag}–{lastTag} of {tags.length} tags</span>
            <div className="admin-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
