"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, ConfirmDialog, Modal, RefreshIcon, Select, TagIcon } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber, slugify } from "../admin-utils";
import "../admin.css";
import "./tags.css";

type TagRow = { name: string; count: number };
type TagSort = "popular" | "least" | "az" | "za";


function AnimatedNumber({ value, replayKey = 0 }: { value: number; replayKey?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? Math.max(0, value) : 0;
    if (target === 0) { setDisplayValue(0); return; }
    let frame = 0;
    let startTime = 0;
    const duration = 850;
    setDisplayValue(0);
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [value, replayKey]);

  return <>{formatCompactNumber(displayValue)}</>;
}

export default function AdminTagsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [tags, setTags] = useState<TagRow[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<TagSort>("popular");
  const [loadingTags, setLoadingTags] = useState(true);
  const [error, setError] = useState("");
  const [busyTag, setBusyTag] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [animationKey, setAnimationKey] = useState(0);
  const pageSize = 15;

  const loadTags = useCallback(async () => {
    setLoadingTags(true);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, { cache: "no-store" });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload.detail || `Unable to load tags (${response.status}).`);
      setTags(Array.isArray(payload) ? payload : []);
      setAnimationKey((value) => value + 1);
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
    const rows = tags.filter((tag) => !query || tag.name.toLocaleLowerCase().includes(query));
    return [...rows].sort((a, b) => {
      if (sort === "least") return a.count - b.count || a.name.localeCompare(b.name);
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "za") return b.name.localeCompare(a.name);
      return b.count - a.count || a.name.localeCompare(b.name);
    });
  }, [tags, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredTags.length / pageSize));

  const visibleTags = filteredTags.slice((page - 1) * pageSize, page * pageSize);
  const firstTag = filteredTags.length ? (page - 1) * pageSize + 1 : 0;
  const lastTag = Math.min(page * pageSize, filteredTags.length);

  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function openEdit(tag: TagRow) {
    setEditingTag(tag);
    setEditName(tag.name);
    setError("");
  }

  async function renameTag() {
    if (!editingTag) return;
    const nextName = editName.trim();
    if (!nextName) {
      setError("Please enter a tag name.");
      return;
    }
    if (nextName.length > 100) {
      setError("Tag names must be 100 characters or fewer.");
      return;
    }
    if (nextName === editingTag.name) {
      setEditingTag(null);
      return;
    }

    setBusyTag(editingTag.name);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/tags/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_name: editingTag.name, new_name: nextName }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.new_name || `Rename failed (${response.status}).`);
      if (Array.isArray(payload.tags)) setTags(payload.tags);
      setEditingTag(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to rename tag.");
    } finally {
      setBusyTag(null);
    }
  }

  async function deleteTag() {
    if (!deleteTarget) return;
    const name = deleteTarget;
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
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete tag.");
    } finally {
      setBusyTag(null);
    }
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page admin-tags-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">SHIVANYAMS CONTENT MANAGEMENT</span>
            <h1>Manage Tags</h1>
            <p>Rename or delete tags used across jobs, schemes, articles and other content.</p>
          </div>
          <div className="admin-top-actions admin-tags-header-actions">
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
          <div className="admin-panel-heading admin-tags-panel-heading">
            <div>
              <h2><TagIcon size={18} /> All tags</h2>
              <p>Changes apply to every post using the tag.</p>
            </div>
            <div className="admin-tags-total" aria-label={`${tags.length} total tags`}>
              <strong><AnimatedNumber value={tags.length} replayKey={animationKey} /></strong>
              <span>Total tags</span>
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
            <Select
              size="sm"
              fullWidth
              value={sort}
              onChange={(event) => setSort(event.target.value as TagSort)}
              aria-label="Sort tags"
              options={[
                { value: "popular", label: "Most used" },
                { value: "least", label: "Least used" },
                { value: "az", label: "Name: A to Z" },
                { value: "za", label: "Name: Z to A" },
              ]}
            />
          </div>

          {error && !editingTag && deleteTarget === null ? <div className="admin-error" role="alert">{error}</div> : null}

          {loadingTags ? (
            <div className="admin-empty">Loading tags...</div>
          ) : visibleTags.length ? (
            <div className="admin-table-wrap admin-tags-table-wrap">
              <table className="admin-post-table admin-tags-table">
                <thead>
                  <tr>
                    <th scope="col">Tag</th>
                    <th scope="col">Posts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTags.map((tag) => {
                    const slug = slugify(tag.name);
                    return (
                      <tr key={tag.name}>
                        <td>
                          <Link href={`/tags/${slug}`} target="_blank" className="admin-tag-name">{tag.name}</Link>
                        </td>
                        <td>{formatCompactNumber(tag.count)}</td>
                        <td>
                          <div className="admin-tag-actions">
                            <button type="button" disabled={busyTag !== null} onClick={() => openEdit(tag)}>Edit</button>
                            <button type="button" className="danger" disabled={busyTag !== null} onClick={() => setDeleteTarget(tag.name)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">{search.trim() ? "No tags match your search." : "No tags are available yet."}</div>
          )}

          {!loadingTags && filteredTags.length > 0 ? (
            <div className="admin-table-footer">
              <span>Showing {firstTag}–{lastTag} of {formatCompactNumber(filteredTags.length)} tags</span>
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

      <Modal
        open={editingTag !== null}
        title="Edit tag"
        size="sm"
        onClose={() => {
          if (busyTag === null) setEditingTag(null);
        }}
        closeOnOverlayClick={busyTag === null}
        closeOnEscape={busyTag === null}
        footer={
          <div className="admin-tags-modal-actions">
            <button type="button" className="admin-secondary-button" disabled={busyTag !== null} onClick={() => setEditingTag(null)}>Cancel</button>
            <button type="button" className="admin-primary-button" disabled={busyTag !== null || !editName.trim() || editName.trim() === editingTag?.name} onClick={() => void renameTag()}>
              {busyTag !== null ? "Saving..." : "Save changes"}
            </button>
          </div>
        }
      >
        <div className="admin-tags-edit-field">
          {error ? <div className="admin-error" role="alert">{error}</div> : null}
          <label htmlFor="admin-edit-tag-name">Tag name</label>
          <input
            id="admin-edit-tag-name"
            autoFocus
            maxLength={100}
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void renameTag();
            }}
            placeholder="Enter tag name"
          />
          <small>Changing this name updates the tag on all posts that use it.</small>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete tag?"
        message={
          <div>
            {deleteTarget ? `Delete “${deleteTarget}” from every post that uses it? This action cannot be undone.` : ""}
            {error ? <p className="admin-tags-dialog-error" role="alert">{error}</p> : null}
          </div>
        }
        confirmText="Delete tag"
        cancelText="Cancel"
        variant="danger"
        loading={deleteTarget !== null && busyTag === deleteTarget}
        closeOnOverlayClick={busyTag === null}
        closeOnEscape={busyTag === null}
        onCancel={() => {
          if (busyTag === null) setDeleteTarget(null);
        }}
        onConfirm={() => void deleteTag()}
      />
    </main>
  );
}
