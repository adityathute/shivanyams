"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import { getAccessToken } from "./admin-utils";
import type { Category } from "../../components/portal/category/CategoryGrid";

import "./admin.css";

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
  return status.replaceAll("_", " ").replace(/w/g, (letter) => letter.toUpperCase());
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyPost, setBusyPost] = useState<number | null>(null);

  const loadPosts = useCallback(async () => {
    const token = getAccessToken();
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
          const response = await fetch(`${API_URL}/admin/content/${kind.api}/`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.detail || `Unable to load ${kind.label} (${response.status}).`);
          }
          const payload = await response.json();
          const rows: AdminPost[] = Array.isArray(payload) ? payload : payload.results ?? [];
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
        headers: { Authorization: `Bearer ${getAccessToken()}` },
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
          Authorization: `Bearer ${getAccessToken()}`,
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
            <button type="button" className="admin-refresh-button" onClick={() => setRefreshKey((value) => value + 1)}>↻ Refresh</button>
          </div>

          <div className="admin-filters">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by post title or slug..." aria-label="Search posts" />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {CONTENT_KINDS.map((kind) => <option key={kind.slug} value={kind.slug}>{kind.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : statusLabel(status)}</option>)}
            </select>
          </div>

          {error && <div className="admin-error">{error}</div>}
          {postsLoading ? <div className="admin-empty">Loading posts...</div> : filteredPosts.length === 0 ? (
            <div className="admin-empty">No posts found for these filters.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-post-table">
                <thead><tr><th>Post</th><th>Category</th><th>Status</th><th>Views</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const kind = CONTENT_KINDS.find((item) => item.slug === post.category.slug);
                    return (
                      <tr key={post.id}>
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
          <div className="admin-table-footer">Showing {filteredPosts.length} of {posts.length} posts</div>
        </section>
      </div>
      <footer className="admin-footer">ShivanyaMS · Content Administration</footer>
    </main>
  );
}
