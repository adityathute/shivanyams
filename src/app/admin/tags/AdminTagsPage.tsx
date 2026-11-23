"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, RefreshIcon, TagIcon } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch } from "../admin-utils";
import "../admin.css";
import "./tags.css";

type TagRow = { name: string; count: number };

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().trim().replace(/[^\\p{L}\\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

export default function AdminTagsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [tags, setTags] = useState<TagRow[]>([]);
  const [search, setSearch] = useState("");
  const [loadingTags, setLoadingTags] = useState(true);
  const [error, setError] = useState("");
  const [busyTag, setBusyTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const loadTags = useCallback(async () => {
    setLoadingTags(true);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, { cache: "no-store" });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload.detail || `Unable to load tags (${response.status}).`);
      setTags(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tags.");
    } finally {
      setLoadingTags(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) void loadTags();
  }, [isAdmin, loadTags]);

  const filteredTags = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return tags.filter((tag) => !query || tag.name.toLocaleLowerCase().includes(query));
  }, [tags, search]);

  const pageCount = Math.max(1, Math.ceil(filteredTags.length / pageSize));
  const visibleTags = filteredTags.slice((page - 1) * pageSize, page * pageSize);
  const firstTag = filteredTags.length ? (page - 1) * pageSize + 1 : 0;
  const lastTag = Math.min(page * pageSize, filteredTags.length);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  async function renameTag(name: string) {
    const nextName = window.prompt("Enter the new tag name:", name)?.trim();
    if (!nextName || nextName === name) return;
    if (nextName.length > 100) {
      setError("Tag names must be 100 characters or fewer.");
      return;
    }
    setBusyTag(name);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_name: name, new_name: nextName }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.new_name || `Rename failed (${response.status}).`);
      if (Array.isArray(payload.tags)) setTags(payload.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to rename tag.");
    } finally {
      setBusyTag(null);
    }
  }

  async function deleteTag(name: string) {
    if (!window.confirm(`Delete “${name}” from every post that uses it? This cannot be undone.`)) return;
    setBusyTag(name);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Delete failed (${response.status}).`);
      if (Array.isArray(payload.tags)) setTags(payload.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete tag.");
    } finally {
      setBusyTag(null);
    }
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">SHIVANYAMS CONTENT MANAGEMENT</span>
            <h1>Manage Tags</h1>
            <p>Rename or delete tags used across jobs, schemes, articles and other content.</p>
          </div>
          <div className="admin-top-actions">
            <Link href="/admin" className="admin-secondary-button">
              <ArrowLeftIcon size={16} />
              <span>Back to dashboard</span>
            </Link>
            <button type="button" className="admin-secondary-button" onClick={() => void loadTags()} disabled={loadingTags}>
              <RefreshIcon size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <section className="admin-post-panel admin-tags-panel">
          <div className="admin-panel-heading">
            <div>
              <h2><TagIcon size={18} /> All tags</h2>
              <p>{filteredTags.length} tags found · Changes apply to every post using the tag.</p>
            </div>
          </div>

          <div className="admin-filters admin-tags-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tags..."
              aria-label="Search tags"
            />
          </div>

          {error ? <div className="admin-error" role="alert">{error}</div> : null}

          {loadingTags ? (
            <div className="admin-empty">Loading tags...</div>
          ) : visibleTags.length ? (
            <div className="admin-tags-list">
              {visibleTags.map((tag) => {
                const slug = slugify(tag.name);
                return (
                  <article className="admin-tag-row" key={tag.name}>
                    <div className="admin-tag-info">
                      <Link href={`/tags/${slug}`} target="_blank" className="admin-tag-name">{tag.name}</Link>
                      <span>{tag.count} {tag.count === 1 ? "post" : "posts"}</span>
                    </div>
                    <div className="admin-tag-actions">
                      <button type="button" disabled={busyTag !== null} onClick={() => void renameTag(tag.name)}>Edit</button>
                      <button type="button" className="danger" disabled={busyTag !== null} onClick={() => void deleteTag(tag.name)}>Delete</button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty">{search.trim() ? "No tags match your search." : "No tags are available yet."}</div>
          )}

          {!loadingTags && filteredTags.length > 0 ? (
            <div className="admin-table-footer">
              <span>Showing {firstTag}–{lastTag} of {filteredTags.length} tags</span>
              <div className="admin-pagination">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                <span>Page {page} of {pageCount}</span>
                <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
      <footer className="admin-footer">ShivanyaMS · Content Administration</footer>
    </main>
  );
}
