"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import type { Category } from "../../components/portal/category/CategoryGrid";

import "./admin.css";

type PaginatedPosts = { results?: AdminPost[]; next?: string | null };

type AdminPost = {
  id: number;
  slug: string;
  title_en: string;
  title_mr?: string;
  category: Category;
  status: string;
  published_at?: string | null;
  created_at?: string;
  views_count?: number;
  is_active?: boolean;
};

const CONTENT_KINDS = [
  { slug: "jobs", label: "Jobs", api: "jobs" },
  { slug: "schemes", label: "Schemes", api: "schemes" },
  { slug: "examination", label: "Examination", api: "examination" },
  { slug: "admit-cards", label: "Admit Cards", api: "admit-card" },
  { slug: "results", label: "Results", api: "results" },
  { slug: "articles-guides", label: "Articles & Guides", api: "articles" },
  { slug: "videos", label: "Videos", api: "videos" },
  { slug: "tools", label: "Tools", api: "tools" },
];

const STATUS_OPTIONS = [
  "all", "draft", "pending_review", "changes_requested",
  "approved", "published", "rejected", "archived",
];

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, getAccessToken } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyPost, setBusyPost] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortOrder, setSortOrder] = useState("newest");

  const loadPosts = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setError("Your session token was not found. Please sign in again.");
      setPostsLoading(false);
      return;
    }

    setPostsLoading(true);
    setError("");
    try {
      const responses = await Promise.all(
        CONTENT_KINDS.map(async (kind) => {
          let url: string | null = `${API_URL}/admin/content/${kind.api}/`;
          const rows: AdminPost[] = [];
          while (url) {
            const requestUrl: string = url;
            const response: Response = await fetch(requestUrl, {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            });
            if (!response.ok) {
              const body = await response.json().catch(() => ({}));
              throw new Error(body.detail || `Unable to load ${kind.label} (${response.status}).`);
            }
            const payload: AdminPost[] | PaginatedPosts = await response.json();
            const isPaginated = !Array.isArray(payload);
            const pageRows: AdminPost[] = isPaginated
              ? (payload as PaginatedPosts).results ?? []
              : payload as AdminPost[];
            rows.push(...pageRows);
            const nextPage = isPaginated ? (payload as PaginatedPosts).next : null;
            url = nextPage ? new URL(nextPage, API_URL).toString() : null;
          }
          return rows.map((post) => ({ ...post, category: post.category ?? ({
            id: 0, slug: kind.slug, name_en: kind.label,
            name_mr: kind.label, name_hi: kind.label,
            description_en: "", description_mr: "", description_hi: "",
          } as Category) }));
        }),
      );
      setPosts(responses.flat().sort((a, b) =>
        new Date(b.created_at || b.published_at || 0).getTime() -
        new Date(a.created_at || a.published_at || 0).getTime()
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load posts.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) void loadPosts();
  }, [isAdmin, loadPosts, refreshKey]);

  const filteredPosts = useMemo(() => posts.filter((post) => {
    const categoryMatch = categoryFilter === "all" || post.category.slug === categoryFilter;
    const statusMatch = statusFilter === "all" || post.status === statusFilter;
    const query = search.trim().toLowerCase();
    const searchMatch = !query || [post.title_en, post.title_mr, post.slug]
      .some((value) => value?.toLowerCase().includes(query));
    return categoryMatch && statusMatch && searchMatch;
  }), [posts, categoryFilter, statusFilter, search]);

  const sortedPosts = useMemo(() => [...filteredPosts].sort((a, b) => {
    const aDate = new Date(a.created_at || a.published_at || 0).getTime();
    const bDate = new Date(b.created_at || b.published_at || 0).getTime();
    if (sortOrder === "oldest") return aDate - bDate;
    if (sortOrder === "title") return (a.title_en || "").localeCompare(b.title_en || "");
    if (sortOrder === "views") return (b.views_count || 0) - (a.views_count || 0);
    return bDate - aDate;
  }), [filteredPosts, sortOrder]);
  const pageCount = Math.max(1, Math.ceil(sortedPosts.length / pageSize));
  const visiblePosts = sortedPosts.slice((page - 1) * pageSize, page * pageSize);
  const visibleIds = visiblePosts.map((post) => post.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const counts = useMemo(() => ({
    total: posts.length,
    published: posts.filter((post) => post.status === "published").length,
    drafts: posts.filter((post) => post.status === "draft").length,
    review: posts.filter((post) => post.status === "pending_review").length,
    views: posts.reduce((sum, post) => sum + (post.views_count || 0), 0),
  }), [posts]);

  async function deletePost(post: AdminPost) {
    if (!window.confirm(`Delete "${post.title_en}"? This cannot be undone.`)) return;
    const kind = CONTENT_KINDS.find((item) => item.slug === post.category.slug);
    if (!kind) return;
    setBusyPost(post.id);
    try {
      const response = await fetch(`${API_URL}/admin/content/${kind.api}/${post.slug}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await getAccessToken()}` },
      });
      if (!response.ok) throw new Error(`Delete failed (${response.status}).`);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete post.");
    } finally {
      setBusyPost(null);
    }
  }

  async function changeStatus(post: AdminPost, status: string) {
    setBusyPost(post.id);
    try {
      const response = await fetch(`${API_URL}/admin/content/${post.id}/review/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Status update failed (${response.status}).`);
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, status: payload.status || status, published_at: payload.published_at ?? item.published_at } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update post status.");
    } finally {
      setBusyPost(null);
    }
  }

  async function bulkChangeStatus(status: "published" | "archived") {
    const targets = posts.filter((post) => selectedIds.includes(post.id));
    if (!targets.length) return;
    if (!window.confirm(`${status === "published" ? "Publish" : "Archive"} ${targets.length} selected posts?`)) return;
    setBusyPost(-1);
    try {
      const results = await Promise.all(targets.map(async (post) => {
        const response = await fetch(`${API_URL}/admin/content/${post.id}/review/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAccessToken()}` },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error(`Could not update "${post.title_en}".`);
        return post.id;
      }));
      setPosts((current) => current.map((post) => results.includes(post.id) ? { ...post, status } : post));
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk update failed.");
      void loadPosts();
    } finally {
      setBusyPost(null);
    }
  }

  function exportCsv() {
    const columns = ["title_en", "slug", "category", "status", "views_count", "created_at"];
    const rows = sortedPosts.map((post) => [
      post.title_en, post.slug, post.category.name_en, post.status,
      post.views_count ?? 0, post.created_at ?? "",
    ]);
    const csv = [columns, ...rows].map((row) => row.map((value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`
    ).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shivanyams-posts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">SHIVANYAMS CONTENT MANAGEMENT</span>
            <h1>Admin Dashboard</h1>
            <p>Manage posts, publishing status and website content.</p>
          </div>
          <div className="admin-top-actions">
            <Link href="/" target="_blank" className="admin-secondary-button">View website ↗</Link>
            <Link href="/admin/add-post" className="admin-primary-button">＋ Add New Post</Link>
          </div>
        </header>

        <section className="admin-stats">
          <article><span>Total posts</span><strong>{counts.total}</strong></article>
          <article><span>Published</span><strong>{counts.published}</strong></article>
          <article><span>Drafts</span><strong>{counts.drafts}</strong></article>
          <article><span>Pending review</span><strong>{counts.review}</strong></article>
          <article><span>Total views</span><strong>{counts.views.toLocaleString()}</strong></article>
        </section>

        <section className="admin-post-panel">
          <div className="admin-panel-heading">
            <div><h2>All Posts</h2><p>View, search, edit and manage every category.</p></div>
            <div className="admin-toolbar-actions"><button type="button" className="admin-refresh-button" onClick={exportCsv}>↓ Export CSV</button><button type="button" className="admin-refresh-button" onClick={() => setRefreshKey((value) => value + 1)}>↻ Refresh</button></div>
          </div>

          <div className="admin-filters">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by post title or slug..." aria-label="Search posts" />
            <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }} aria-label="Filter by category">
              <option value="all">All categories</option>
              {CONTENT_KINDS.map((kind) => <option key={kind.slug} value={kind.slug}>{kind.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filter by status">
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : statusLabel(status)}</option>)}
            </select>
            <select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setPage(1); }} aria-label="Sort posts">
              <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option><option value="views">Most views</option>
            </select>
          </div>

          {error && <div className="admin-error">{error}</div>}
          {postsLoading ? <div className="admin-empty">Loading posts...</div> : filteredPosts.length === 0 ? (
            <div className="admin-empty">No posts found for these filters.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-post-table">
                <thead><tr><th><input type="checkbox" aria-label="Select visible posts" checked={allVisibleSelected} onChange={(event) => setSelectedIds(event.target.checked ? Array.from(new Set([...selectedIds, ...visibleIds])) : selectedIds.filter((id) => !visibleIds.includes(id)))} /></th><th>Post</th><th>Category</th><th>Status</th><th>Views</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {visiblePosts.map((post) => {
                    const kind = CONTENT_KINDS.find((item) => item.slug === post.category.slug);
                    return (
                      <tr key={post.id}>
                        <td><input type="checkbox" aria-label={`Select ${post.title_en}`} checked={selectedIds.includes(post.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, post.id] : current.filter((id) => id !== post.id))} /></td>
                        <td><strong>{post.title_en || post.slug}</strong><small>/{post.slug}</small></td>
                        <td>{kind?.label || post.category.name_en}</td>
                        <td><span className={`admin-status status-${post.status}`}>{statusLabel(post.status)}</span></td>
                        <td>{(post.views_count || 0).toLocaleString()}</td>
                        <td>{post.created_at ? new Date(post.created_at).toLocaleDateString() : "—"}</td>
                        <td>
                          <div className="admin-row-actions">
                            <Link href={`/${kind?.slug === "admit-cards" ? "admit-cards" : kind?.slug === "articles-guides" ? "guides" : kind?.slug || "jobs"}/${post.slug}`} target="_blank">View</Link>
                            <Link href={`/admin/edit-post/${kind?.api || "jobs"}/${post.slug}`}>Edit</Link>
                            {post.status !== "published" && <button disabled={busyPost === post.id} onClick={() => void changeStatus(post, "published")}>Publish</button>}
                            <button className="danger" disabled={busyPost === post.id} onClick={() => void deletePost(post)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="admin-table-footer">
            <span>Showing {sortedPosts.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, sortedPosts.length)} of {sortedPosts.length} filtered posts · {posts.length} total</span>
            <div className="admin-pagination">
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page"><option value={10}>10 rows</option><option value={15}>15 rows</option><option value={25}>25 rows</option><option value={50}>50 rows</option></select>
              <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>
          </div>
          {selectedIds.length > 0 && <div className="admin-bulk-bar"><strong>{selectedIds.length} selected</strong><button disabled={busyPost === -1} onClick={() => void bulkChangeStatus("published")}>Publish selected</button><button disabled={busyPost === -1} onClick={() => void bulkChangeStatus("archived")}>Archive selected</button><button onClick={() => setSelectedIds([])}>Clear selection</button></div>}
        </section>
      </div>
      <footer className="admin-footer">ShivanyaMS · Content Administration</footer>
    </main>
  );
}
