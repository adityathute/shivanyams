"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, RefreshIcon } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "../admin-utils";
import "../admin.css";
import "../comments/comments.css";

type Report = {
  id: number;
  reporter_auth_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
};
type CommentWithReports = {
  id: number;
  post: number;
  post_title: string;
  parent: number | null;
  author_name: string;
  content: string;
  reports?: Report[];
};
type ReportRow = Report & {
  comment_id: number;
  post_id: number;
  post_title: string;
  parent: number | null;
  author_name: string;
  content: string;
};

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [comments, setComments] = useState<CommentWithReports[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadReports = useCallback(async () => {
    setLoadingRows(true);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/?status=all`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Unable to load reports.");
      }
      const payload = await response.json();
      setComments(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) void loadReports();
  }, [isAdmin, loadReports]);

  const reports = useMemo<ReportRow[]>(() => comments.flatMap((comment) =>
    (comment.reports || []).map((report) => ({
      ...report,
      comment_id: comment.id,
      post_id: comment.post,
      post_title: comment.post_title,
      parent: comment.parent,
      author_name: comment.author_name,
      content: comment.content,
    }))
  ), [comments]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesSearch = !query || [
        report.reason, report.details, report.reporter_auth_id, report.post_title,
        report.author_name, report.content, String(report.id), String(report.comment_id),
      ].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [reports, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const visibleReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  async function updateReportStatus(reportId: number, reportStatus: string) {
    setBusyId(reportId);
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId, report_status: reportStatus }),
      });
      if (!response.ok) throw new Error("Unable to update report.");
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update report.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">SHIVANYAMS COMMUNITY</span>
            <h1>Reports</h1>
            <p>Review and manage reports submitted against community comments and replies.</p>
          </div>
          <div className="admin-top-actions admin-comments-header-actions">
            <Link href="/admin" className="admin-secondary-button">
              <ArrowLeftIcon size={16} />
              <span>Back to dashboard</span>
            </Link>
            <button type="button" className="admin-secondary-button" onClick={() => void loadReports()} disabled={loadingRows} aria-label="Refresh reports" title="Refresh">
              <RefreshIcon size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <section className="admin-post-panel admin-comments-panel">
          <div className="admin-panel-heading admin-comments-panel-heading">
            <div>
              <h2>Report activity</h2>
              <p>Review report reasons, related discussions, and take action on open reports.</p>
            </div>
            <div className="admin-comments-totals" aria-label={`${comments.length} comments and ${reports.length} reports`}>
              <div className="admin-comments-total">
                <strong>{formatCompactNumber(comments.length)}</strong>
                <span>Total comments</span>
              </div>
              <div className="admin-comments-total">
                <strong>{formatCompactNumber(reports.length)}</strong>
                <span>Total reports</span>
              </div>
            </div>
          </div>

          <div className="admin-filters admin-comments-filters">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search report, reason, user or post..." aria-label="Search reports" />
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filter report status">
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          {error ? <div className="admin-error">{error}</div> : null}
          {loadingRows ? <div className="admin-empty">Loading reports...</div> : filteredReports.length === 0 ? <div className="admin-empty">No reports match these filters.</div> : (
            <div className="admin-comments-list">
              {visibleReports.map((report) => (
                <article className="admin-comment-card" key={report.id}>
                  <div className="admin-comment-card-head">
                    <div>
                      <strong>{report.reason || "Community report"}</strong>
                      <span>{report.post_title || "Post"} · {report.parent ? `Reply #${report.comment_id}` : `Comment #${report.comment_id}`} · Report #{report.id}</span>
                    </div>
                    <span className={`admin-status status-${report.status}`}>{report.status}</span>
                  </div>
                  <p className="admin-comment-text">{report.details || "No additional details provided."}</p>
                  <div className="admin-comment-meta">
                    <span>Reported by {report.reporter_auth_id || "Unknown user"}</span>
                    <span>{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                  <div className="admin-comment-reply">
                    <strong>Reported content</strong>
                    <p className="admin-comment-text">{report.content}</p>
                  </div>
                  {report.status === "open" ? (
                    <div className="admin-comment-actions">
                      <button type="button" disabled={busyId === report.id} onClick={() => void updateReportStatus(report.id, "reviewed")}>Mark reviewed</button>
                      <button type="button" disabled={busyId === report.id} onClick={() => void updateReportStatus(report.id, "dismissed")}>Dismiss</button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}

          <div className="admin-table-footer">
            <span>Showing {filteredReports.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredReports.length)} of {formatCompactNumber(filteredReports.length)} reports</span>
            <div className="admin-pagination">
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Reports per page">
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
              <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>
          </div>
        </section>
      </div>
      <footer className="admin-footer">ShivanyaMS · Community Reports</footer>
    </main>
  );
}
