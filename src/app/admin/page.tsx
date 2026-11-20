"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { AnimatedNumber, ConfirmDialog, IconButton, ArrowLeftIcon, CloseIcon } from "shivanya-ui";
import { API_URL } from "../../components/portal/category/CategoryGrid";
import { adminFetch } from "./admin-utils";
import type { Category } from "../../components/portal/category/CategoryGrid";

import "./admin.css";

type PaginatedPosts = { results?: AdminPost[]; next?: string | null };

type WebsiteAnalyticsPage = { path: string; views: number; unique_visitors: number; last_viewed: string | null };
type WebsiteVisitorRow = {
  visitor_id: string; visitor_type: "user" | "anonymous"; full_name: string;
  ip_address: string | null; first_seen: string; last_seen: string; last_viewed: string | null;
  total_views: number; total_pages: number; device: string; browser: string; language: string;
};
type WebsiteViewEvent = {
  viewed_at: string; visitor_type: "user" | "anonymous"; full_name: string;
  ip_address: string | null; visitor_id: string; device: string; browser: string; language: string; referrer_url: string;
};

type AdminPost = {
  id: number;
  slug: string;
  title_en: string;
  title_mr?: string;
  category: Category;
  status: string;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  views_count?: number;
  unique_visitors_count?: number;
  users_count?: number;
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

function formatPersonName(name: string | null | undefined) {
  return (name || "").trim().toLowerCase().replace(/(^|[\\s'-])([a-z])/g, (_match, separator, letter) =>
    separator + letter.toUpperCase()
  );
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

function formatCompactNumber(value: number | undefined) {
  return compactNumberFormat.format(Number(value) || 0);
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [websiteViewsCount, setWebsiteViewsCount] = useState(0);
  const [websiteVisitorsCount, setWebsiteVisitorsCount] = useState(0);
  const [postVisitorsCount, setPostVisitorsCount] = useState(0);
  const [analyticsType, setAnalyticsType] = useState<"views" | "visitors" | "users" | null>(null);
  const [analyticsPages, setAnalyticsPages] = useState<WebsiteAnalyticsPage[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsVisitors, setAnalyticsVisitors] = useState<WebsiteVisitorRow[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<WebsiteVisitorRow | null>(null);
  const [visitorPages, setVisitorPages] = useState<WebsiteAnalyticsPage[]>([]);
  const [selectedAnalyticsPath, setSelectedAnalyticsPath] = useState<string | null>(null);
  const [analyticsEvents, setAnalyticsEvents] = useState<WebsiteViewEvent[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [statsAnimationKey, setStatsAnimationKey] = useState(0);
  const [busyPost, setBusyPost] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortOrder, setSortOrder] = useState("newest");

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setError("");
    try {
      const responses = await Promise.all(
        CONTENT_KINDS.map(async (kind) => {
          let url: string | null = `${API_URL}/admin/content/${kind.api}/`;
          const rows: AdminPost[] = [];
          while (url) {
            const requestUrl: string = url;
            const response: Response = await adminFetch(requestUrl, {
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
      setStatsAnimationKey((value) => value + 1);
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
    if (!isAdmin) return;

    let active = true;
    adminFetch(API_URL + "/admin/stats/", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || "Unable to load user statistics (" + response.status + ").");
        }
        return response.json();
      })
      .then((payload: { users_count?: number; website_views_count?: number; website_visitors_count?: number; post_visitors_count?: number }) => {
        if (active) {
          setUsersCount(Number(payload.users_count) || 0);
          setWebsiteViewsCount(Number(payload.website_views_count) || 0);
          setWebsiteVisitorsCount(Number(payload.website_visitors_count) || 0);
          setPostVisitorsCount(Number(payload.post_visitors_count) || 0);
          setStatsAnimationKey((value) => value + 1);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load user statistics.");
      });

    return () => { active = false; };
  }, [isAdmin, refreshKey]);

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

  function openWebsiteAnalytics(type: "views" | "visitors" | "users") {
    setAnalyticsType(type);
    setSelectedVisitor(null);
    setVisitorPages([]);
    setSelectedAnalyticsPath(null);
    setAnalyticsEvents([]);
    setAnalyticsLoading(true);
    const query = type === "views" ? "" : `?type=visitors${type === "users" ? "&authenticated=true" : ""}`;
    adminFetch(API_URL + "/admin/website-analytics/" + query, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load website analytics (${response.status}).`);
        return response.json();
      })
      .then((payload: { pages?: WebsiteAnalyticsPage[]; visitors?: WebsiteVisitorRow[] }) => {
        setAnalyticsPages(payload.pages ?? []);
        setAnalyticsVisitors(payload.visitors ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load website analytics."))
      .finally(() => setAnalyticsLoading(false));
  }

  async function openVisitorDetails(visitor: WebsiteVisitorRow) {
    setSelectedVisitor(visitor);
    setSelectedAnalyticsPath(null);
    setAnalyticsLoading(true);
    try {
      const response = await adminFetch(API_URL + "/admin/website-analytics/?type=visitors&visitor_id=" + encodeURIComponent(visitor.visitor_id), { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load visitor pages (${response.status}).`);
      const payload = await response.json();
      setVisitorPages(payload.pages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load visitor pages.");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function openPageEvents(path: string) {
    setSelectedAnalyticsPath(path);
    setAnalyticsLoading(true);
    try {
      const response = await adminFetch(API_URL + "/admin/website-analytics/?path=" + encodeURIComponent(path), { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load page views (${response.status}).`);
      const payload = await response.json();
      setAnalyticsEvents(payload.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load page views.");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  function deletePost(post: AdminPost) {
    setError("");
    setDeleteTarget(post);
  }

  async function confirmDeletePost() {
    if (!deleteTarget) return;
    const post = deleteTarget;
    const kind = CONTENT_KINDS.find((item) => item.slug === post.category.slug);
    if (!kind) return;

    setBusyPost(post.id);
    try {
      const response = await adminFetch(`${API_URL}/admin/content/${kind.api}/${post.slug}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Delete failed (${response.status}).`);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setSelectedIds((current) => current.filter((id) => id !== post.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete post.");
    } finally {
      setBusyPost(null);
    }
  }

  async function changeStatus(post: AdminPost, status: string) {
    setBusyPost(post.id);
    try {
      const response = await adminFetch(`${API_URL}/admin/content/${post.id}/review/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const response = await adminFetch(`${API_URL}/admin/content/${post.id}/review/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
    const columns = [
      "id",
      "title_en",
      "slug",
      "category",
      "category_slug",
      "status",
      "is_active",
      "views_count",
      "unique_visitors_count",
      "users_count",
      "published_at",
      "created_at",
      "updated_at",
    ];
    const rows = sortedPosts.map((post) => [
      post.id,
      post.title_en,
      post.slug,
      post.category.name_en,
      post.category.slug,
      post.status,
      post.is_active ?? "",
      post.views_count ?? 0,
      post.unique_visitors_count ?? 0,
      post.users_count ?? 0,
      post.published_at ?? "",
      post.created_at ?? "",
      post.updated_at ?? "",
    ]);
    const csv = [columns, ...rows].map((row) => row.map((value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`
    ).join(",")).join("\r\n");
    // UTF-8 BOM helps Excel correctly recognize Marathi/Hindi and other Unicode text.
    const blob = new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
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

        {(() => {
          const statItems: { label: string; value: number; analytics?: "views" | "visitors" | "users"; group: "users" | "website" | "posts" | "content" }[] = [
            { label: "Portal users", value: usersCount, analytics: "users", group: "users" },
            { label: "Website views", value: websiteViewsCount, analytics: "views", group: "website" },
            { label: "Website visitors", value: websiteVisitorsCount, analytics: "visitors", group: "website" },
            { label: "Post views", value: counts.views, group: "posts" },
            { label: "Post visitors", value: postVisitorsCount, group: "posts" },
            { label: "Published posts", value: counts.published, group: "content" },
            { label: "Total posts", value: counts.total, group: "content" },
            { label: "Drafts", value: counts.drafts, group: "content" },
            { label: "Pending review", value: counts.review, group: "content" },
          ];

          return (
            <section className="admin-stats">
              {statItems.map((item) => (
                <article key={item.label} className={`admin-stat-card admin-stat-${item.group}${item.analytics ? " admin-stat-clickable" : ""}`}>
                  {item.analytics ? (
                    <button type="button" onClick={() => openWebsiteAnalytics(item.analytics!)} aria-label={`View ${item.label.toLowerCase()} details`}>
                      <span>{item.label}<small className="admin-stat-open-indicator" aria-hidden="true">↗</small></span>
                      <strong><AnimatedNumber key={`${item.label}-${statsAnimationKey}`} value={item.value} /></strong>
                    </button>
                  ) : (
                    <><span>{item.label}</span><strong><AnimatedNumber value={item.value} /></strong></>
                  )}
                </article>
              ))}
            </section>
          );
        })()}

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
                <thead><tr><th><input type="checkbox" aria-label="Select visible posts" checked={allVisibleSelected} onChange={(event) => setSelectedIds(event.target.checked ? Array.from(new Set([...selectedIds, ...visibleIds])) : selectedIds.filter((id) => !visibleIds.includes(id)))} /></th><th>Post</th><th>Category</th><th>Status</th><th>Views</th><th>Visitors</th><th>Users</th><th>Created</th><th>Updated</th><th>Actions</th></tr></thead>
                <tbody>
                  {visiblePosts.map((post) => {
                    const kind = CONTENT_KINDS.find((item) => item.slug === post.category.slug);
                    return (
                      <tr key={post.id}>
                        <td><input type="checkbox" aria-label={`Select ${post.title_en}`} checked={selectedIds.includes(post.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, post.id] : current.filter((id) => id !== post.id))} /></td>
                        <td><strong>{post.title_en || post.slug}</strong><small>/{post.slug}</small></td>
                        <td>{kind?.label || post.category.name_en}</td>
                        <td><span className={`admin-status status-${post.status}`}>{statusLabel(post.status)}</span></td>
                        <td>{formatCompactNumber(post.views_count)}</td>
                        <td>{formatCompactNumber(post.unique_visitors_count)}</td>
                        <td>{formatCompactNumber(post.users_count)}</td>
                        <td>{post.created_at ? new Date(post.created_at).toLocaleDateString() : "—"}</td>
                        <td>{post.updated_at ? new Date(post.updated_at).toLocaleDateString() : "—"}</td>
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
      {analyticsType && (
        <div className="admin-analytics-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAnalyticsType(null);
        }}>
          <section className={`admin-analytics-modal${selectedVisitor ? " admin-analytics-modal-visitor" : ""}`} role="dialog" aria-modal="true" aria-labelledby="admin-analytics-title">
            <header className="admin-analytics-header">
              {(selectedVisitor || selectedAnalyticsPath) && (
                <IconButton
                  size="lg"
                  variant="ghost"
                  className="admin-analytics-back-icon"
                  onClick={() => { setSelectedVisitor(null); setVisitorPages([]); setSelectedAnalyticsPath(null); setAnalyticsEvents([]); }}
                  aria-label="Back to list"
                  title="Back to list"
                >
                  <ArrowLeftIcon />
                </IconButton>
              )}
              <div>
                <h2 id="admin-analytics-title">{selectedVisitor ? "Visitor details" : selectedAnalyticsPath ? "Page view details" : analyticsType === "views" ? "Website Views" : analyticsType === "users" ? "Portal Users" : "Website Visitors"}</h2>
                <p>{selectedVisitor ? "Pages visited by this browser or device." : selectedAnalyticsPath ? "Individual visits recorded for this page." : analyticsType === "views" ? "Select a page to inspect its individual page views." : "Unique browser/device visitors. IP address is informational and does not determine visitor identity."}</p>
              </div>
              <IconButton
                size="lg"
                variant="ghost"
                iconRotateOnHover
                className="admin-analytics-close"
                onClick={() => setAnalyticsType(null)}
                aria-label="Close"
                title="Close analytics"
              >
                <CloseIcon />
              </IconButton>
            </header>
            {analyticsLoading ? <div className="admin-empty">Loading analytics...</div> : selectedVisitor ? (
              <div className="admin-analytics-detail">
                <div className="admin-visitor-summary">
                  <strong>{selectedVisitor.visitor_type === "user" ? formatPersonName(selectedVisitor.full_name) || "Registered user" : "Anonymous"}</strong>
                  <span>IP: {selectedVisitor.ip_address || "Not available"}</span>
                  <span>{selectedVisitor.total_pages} pages · {selectedVisitor.total_views} total views</span>
                  <span>First visit: {new Date(selectedVisitor.first_seen).toLocaleString()}</span>
                  <span>Last visit: {new Date(selectedVisitor.last_seen).toLocaleString()}</span>
                  <span>Browser: {selectedVisitor.browser || "Unknown"}</span>
                  <span>Device: {selectedVisitor.device} · Language: {selectedVisitor.language || "—"}</span>
                </div>
                <div className="admin-analytics-table-wrap"><table className="admin-analytics-table">
                  <thead><tr><th>Page visited</th><th>Views</th><th>Last viewed</th></tr></thead>
                  <tbody>{visitorPages.map((item) => <tr key={item.path}><td><a href={item.path} target="_blank" rel="noreferrer">{item.path}</a></td><td>{item.views.toLocaleString("en-IN")}</td><td>{item.last_viewed ? new Date(item.last_viewed).toLocaleString() : "—"}</td></tr>)}</tbody>
                </table></div>
              </div>
            ) : selectedAnalyticsPath ? (
              <div className="admin-analytics-table-wrap"><table className="admin-analytics-table">
                <thead><tr><th>Visitor</th><th>IP address</th><th>Browser</th><th>Device</th><th>Language</th><th>Referrer</th><th>Viewed at</th></tr></thead>
                <tbody>{analyticsEvents.map((event, index) => <tr key={event.visitor_id + event.viewed_at + index}><td>{event.visitor_type === "user" ? formatPersonName(event.full_name) || "Registered user" : "Anonymous"}</td><td>{event.ip_address || "—"}</td><td>{event.browser || "Unknown"}</td><td>{event.device}</td><td>{event.language || "—"}</td><td className="admin-analytics-referrer">{event.referrer_url || "Direct"}</td><td>{new Date(event.viewed_at).toLocaleString()}</td></tr>)}</tbody>
              </table></div>
            ) : analyticsType === "views" ? (
              analyticsPages.length === 0 ? <div className="admin-empty">No website views recorded yet.</div> : (
                <div className="admin-analytics-table-wrap"><table className="admin-analytics-table">
                  <thead><tr><th>Page link</th><th>Total views</th><th>Unique visitors</th><th>Last viewed</th></tr></thead>
                  <tbody>{[...analyticsPages].sort((a, b) => b.views - a.views).map((item) => <tr key={item.path}>
                    <td><button type="button" className="admin-analytics-link" onClick={() => void openPageEvents(item.path)}>{item.path}</button></td>
                    <td>{item.views.toLocaleString("en-IN")}</td><td>{item.unique_visitors.toLocaleString("en-IN")}</td><td>{item.last_viewed ? new Date(item.last_viewed).toLocaleString() : "—"}</td>
                  </tr>)}</tbody>
                </table></div>
              )
            ) : (
              analyticsVisitors.length === 0 ? <div className="admin-empty">No visitors recorded yet.</div> : (
                <div className="admin-analytics-table-wrap"><table className="admin-analytics-table">
                  <thead><tr><th>Visitor</th><th>IP address</th><th>Browser</th><th>Device</th><th>Pages</th><th>Total views</th><th>Language</th><th>First visit</th><th>Last visit</th></tr></thead>
                  <tbody>{analyticsVisitors.map((visitor) => <tr key={visitor.visitor_id}>
                    <td><button type="button" className="admin-analytics-link" onClick={() => void openVisitorDetails(visitor)}>{visitor.visitor_type === "user" ? formatPersonName(visitor.full_name) || "Registered user" : "Anonymous"}</button></td>
                    <td>{visitor.ip_address || "—"}</td><td>{visitor.browser || "Unknown"}</td><td>{visitor.device}</td><td>{visitor.total_pages}</td><td>{visitor.total_views}</td><td>{visitor.language || "—"}</td>
                    <td>{new Date(visitor.first_seen).toLocaleString()}</td><td>{new Date(visitor.last_seen).toLocaleString()}</td>
                  </tr>)}</tbody>
                </table></div>
              )
            )}
            <footer><span>{selectedVisitor ? visitorPages.length + " pages visited" : selectedAnalyticsPath ? analyticsEvents.length + " recent view events" : analyticsType === "views" ? analyticsPages.length + " pages tracked" : analyticsVisitors.length + " unique browsers/devices"}</span></footer>
          </section>
        </div>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete post?"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.title_en}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmText="Delete post"
        cancelText="Cancel"
        variant="danger"
        size="md"
        loading={deleteTarget !== null && busyPost === deleteTarget.id}
        closeOnOverlayClick={busyPost === null}
        closeOnEscape={busyPost === null}
        onCancel={() => {
          if (busyPost === null) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDeletePost()}
      />
      <footer className="admin-footer">ShivanyaMS · Content Administration</footer>
    </main>
  );
}
