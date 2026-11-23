"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "shivanya-auth";
import { API_URL } from "./category/CategoryGrid";
import { adminFetch } from "../../app/admin/admin-utils";
import { usePortalData } from "./data/portal-data";
import { usePortalLanguage } from "./context/PortalLanguageContext";
import "./saved/SavedPostsPage.css";

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
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [adminTags, setAdminTags] = useState<{ name: string; count: number }[]>([]);
  const [tagActionError, setTagActionError] = useState("");
  const [busyTag, setBusyTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const panelRef = useRef<HTMLElement | null>(null);

  const loadAdminTags = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load tags (${response.status}).`);
      setAdminTags(await response.json());
      setTagActionError("");
    } catch (error) {
      setTagActionError(error instanceof Error ? error.message : "Unable to load tags.");
    }
  }, [isAdmin]);

  useEffect(() => { void loadAdminTags(); }, [loadAdminTags]);

  async function renameTag(name: string) {
    const nextName = window.prompt("Enter the new tag name:", name)?.trim();
    if (!nextName || nextName === name) return;
    setBusyTag(name);
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_name: name, new_name: nextName }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Rename failed (${response.status}).`);
      setAdminTags(payload.tags || []);
      setTagActionError("");
    } catch (error) {
      setTagActionError(error instanceof Error ? error.message : "Unable to rename tag.");
    } finally { setBusyTag(null); }
  }

  async function deleteTag(name: string) {
    if (!window.confirm(`Delete the tag “${name}” from all posts? This cannot be undone.`)) return;
    setBusyTag(name);
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Delete failed (${response.status}).`);
      setAdminTags(payload.tags || []);
      setTagActionError("");
    } catch (error) {
      setTagActionError(error instanceof Error ? error.message : "Unable to delete tag.");
    } finally { setBusyTag(null); }
  }
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

  const tagRows = isAdmin
    ? adminTags.map((tag) => ({ name: tag.name, slug: slugify(tag.name), count: tag.count }))
    : tags.map(([slug, tag]) => ({ name: tag.label, slug, count: tag.count }));
  const pageCount = Math.max(1, Math.ceil(tagRows.length / pageSize));
  const visibleTags = tagRows.slice((page - 1) * pageSize, page * pageSize);
  const firstTag = tagRows.length ? (page - 1) * pageSize + 1 : 0;
  const lastTag = Math.min(page * pageSize, tagRows.length);

  useEffect(() => {
    const updatePageSize = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const width = panel.clientWidth;
      const top = panel.getBoundingClientRect().top;
      const availableHeight = Math.max(150, window.innerHeight - top - 150);
      const columns = Math.max(1, Math.floor((width - 36) / (isAdmin ? 270 : 155)));
      const rowHeight = isAdmin ? 58 : 54;
      const rows = Math.max(1, Math.floor(availableHeight / rowHeight));
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
  }, [isAdmin]);

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
          <span>{isAdmin ? adminTags.length : tags.length} {text.count}</span>
        </div>

        {isAdmin && tagActionError ? <div className="saved-empty-state" role="alert">{tagActionError}</div> : null}

        {isAdmin ? (
          visibleTags.length ? (
            <div className="admin-managed-tags-list">
              {visibleTags.map((tag) => (
                <div className="admin-managed-tag-row" key={tag.slug}>
                  <Link className="related-tag-chip" href={`/tags/${tag.slug}`}><span>{tag.name}</span><small>{tag.count}</small></Link>
                  <div className="admin-managed-tag-actions">
                    <button type="button" disabled={busyTag === tag.name} onClick={() => void renameTag(tag.name)}>Edit</button>
                    <button type="button" className="danger" disabled={busyTag === tag.name} onClick={() => void deleteTag(tag.name)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="saved-empty-state saved-list-empty">No tags are available yet.</div>
        ) : data.loading ? (
          <div className="saved-empty-state saved-list-empty" role="status">{text.loading}</div>
        ) : visibleTags.length ? (
          <div className="related-tag-list">
            {visibleTags.map((tag) => (
              <Link className="related-tag-chip" href={`/tags/${tag.slug}`} key={tag.slug}>
                <span>{tag.name}</span>
                <small>{tag.count}</small>
              </Link>
            ))}
          </div>
        ) : (
          <div className="saved-empty-state saved-list-empty">{text.empty}</div>
        )}

        {tagRows.length > pageSize && (
          <div className="admin-table-footer tags-auto-pagination">
            <span>Showing {firstTag}–{lastTag} of {tagRows.length} tags</span>
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
