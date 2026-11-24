"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, Avatar, ConfirmDialog, RefreshIcon, ReportIcon, Select } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "../admin-utils";
import "../admin.css";
import "./reports.css";

type Report = { id: number; reporter_auth_id: string; reporter_name?: string; reporter_avatar?: string; reason: string; details: string; status: string; created_at: string; report_type?: "post" | "comment" | "reply"; target_id?: number; target_title?: string; target_content?: string; };
type CommentWithReports = { id: number; post: number; post_title: string; parent: number | null; author_name: string; content: string; reports?: Report[]; };
type ReportRow = Report & { comment_id: number | null; post_id: number; post_title: string; parent: number | null; author_name: string; content: string; };
type SortKey = "id" | "reason" | "content" | "reporter" | "status" | "date";
type SortDirection = "asc" | "desc";


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

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [comments, setComments] = useState<CommentWithReports[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<{ reportId: number; type: "post" | "comment" | "reply"; status: "reviewed" | "dismissed" } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [animationKey, setAnimationKey] = useState(0);

  const loadReports = useCallback(async () => {
    setLoadingRows(true); setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/?status=all&include_post_reports=true`, { cache: "no-store" });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || "Unable to load reports."); }
      const payload = await response.json(); setComments(Array.isArray(payload) ? payload : []); setAnimationKey((value) => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load reports."); }
    finally { setLoadingRows(false); }
  }, []);

  useEffect(() => { if (!loading && !isAdmin) router.replace("/"); }, [loading, isAdmin, router]);
  useEffect(() => { if (isAdmin) void loadReports(); }, [isAdmin, loadReports]);

  const reports = useMemo<ReportRow[]>(() => comments.flatMap((comment) => (comment.reports || []).map((report) => ({
    ...report,
    comment_id: report.report_type === "post" ? null : comment.id,
    post_id: comment.post,
    post_title: comment.post_title,
    parent: comment.parent,
    author_name: comment.author_name,
    content: report.target_content ?? comment.content,
    report_type: report.report_type ?? (comment.parent === null ? "comment" : "reply"),
    target_id: report.target_id ?? comment.id,
    target_title: report.target_title ?? comment.post_title,
  }))), [comments]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = reports.filter((report) => {
      const isReply = report.report_type === "reply";
      const matchesStatus = statusFilter === "all" || String(report.status || "").trim().toLowerCase() === statusFilter;
      const matchesType = typeFilter === "all" || (typeFilter === "posts" ? report.report_type === "post" : typeFilter === "replies" ? isReply : report.report_type === "comment");
      const matchesSearch = !query || [report.reason, report.details, report.reporter_name, report.reporter_auth_id, report.post_title, report.author_name, report.content, report.status, String(report.id), String(report.comment_id), String(report.post_id), report.report_type || (isReply ? "reply" : "comment")].some((value) => String(value ?? "").trim().toLowerCase().includes(query));
      return matchesStatus && matchesType && matchesSearch;
    });
    const value = (row: ReportRow) => ({ id: row.id, reason: row.reason || "", content: row.content || "", reporter: row.reporter_auth_id || "", status: row.status || "", date: new Date(row.created_at).getTime() || 0 })[sortKey];
    return rows.sort((a, b) => {
      const av = value(a), bv = value(b);
      const comparison = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [reports, search, statusFilter, typeFilter, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const visibleReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);
  const postsWithReports = new Set(reports.map((report) => report.post_id)).size;
  const reportedComments = reports.filter((report) => report.report_type === "comment").length;
  const reportedReplies = reports.filter((report) => report.report_type === "reply").length;

  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  async function updateReportStatus(reportId: number, reportStatus: "reviewed" | "dismissed", reportType: "post" | "comment" | "reply"): Promise<boolean> {
    setBusyId(reportId);
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [reportType === "post" ? "post_report_id" : "report_id"]: reportId, report_status: reportStatus }) });
      if (!response.ok) throw new Error("Unable to update report.");
      await loadReports();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update report.");
      return false;
    } finally { setBusyId(null); }
  }

  if (loading || !isAdmin) return null;
  return (
    <main className="admin-page admin-reports-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div><span className="admin-eyebrow">SHIVANYAMS COMMUNITY</span><h1>Reports</h1><p>Review and manage reports submitted against posts, comments, and replies.</p></div>
          <div className="admin-top-actions admin-reports-header-actions">
            <Link href="/admin" className="admin-secondary-button"><ArrowLeftIcon size={16} /><span>Back to dashboard</span></Link>
            <button type="button" className="admin-secondary-button" onClick={() => void loadReports()} disabled={loadingRows} aria-label="Refresh reports"><RefreshIcon size={16} /><span>Refresh</span></button>
          </div>
        </header>
        <section className="admin-post-panel admin-reports-panel">
          <div className="admin-panel-heading admin-reports-panel-heading">
            <div><h2><ReportIcon size={18} /> Report activity</h2><p>Review report reasons, related discussions, and take action on open reports.</p></div>
            <div className="admin-reports-totals" aria-label={`${reports.length} reports across ${postsWithReports} posts, including ${reportedComments} comments and ${reportedReplies} replies`}>
              <div className="admin-reports-total"><strong><AnimatedNumber value={reports.length} replayKey={animationKey} /></strong><span>Total reports</span></div>
              <div className="admin-reports-total"><strong><AnimatedNumber value={postsWithReports} replayKey={animationKey} /></strong><span>Posts reported</span></div>
              <div className="admin-reports-total"><strong><AnimatedNumber value={reportedComments} replayKey={animationKey} /></strong><span>Comments reported</span></div>
              <div className="admin-reports-total"><strong><AnimatedNumber value={reportedReplies} replayKey={animationKey} /></strong><span>Replies reported</span></div>
            </div>
          </div>
          <div className="admin-filters admin-reports-filters">
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search report, reason, user or post..." aria-label="Search reports" />
            <Select size="sm" fullWidth value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filter status" options={[{ value: "all", label: "All statuses" }, { value: "open", label: "Open" }, { value: "reviewed", label: "Reviewed" }, { value: "dismissed", label: "Dismissed" }]} />
            <Select size="sm" fullWidth value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }} aria-label="Filter reported content type" options={[{ value: "all", label: "All types" }, { value: "posts", label: "Posts only" }, { value: "comments", label: "Comments only" }, { value: "replies", label: "Replies only" }]} />
          </div>
          {error ? <div className="admin-error" role="alert">{error}</div> : null}
          {loadingRows ? <div className="admin-empty">Loading reports...</div> : filteredReports.length === 0 ? <div className="admin-empty">No reports match these filters.</div> : (
            <div className="admin-table-wrap admin-reports-table-wrap">
              <table className="admin-post-table admin-reports-table">
                <thead><tr><th>ID</th><th>Reason</th><th>Reported item</th><th>Reported content</th><th>User</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>{visibleReports.map((report) => (
                  <tr key={`${report.report_type || "comment"}-${report.id}`}>
                    <td className="admin-reports-id">#{report.id}</td>
                    <td><strong className="admin-reports-reason">{report.reason ? report.reason.charAt(0).toUpperCase() + report.reason.slice(1) : "Community report"}</strong><small className="admin-reports-related">{report.report_type === "post" ? "Post report" : report.report_type === "reply" ? "Reply report" : "Comment report"}</small>{report.details ? <p className="admin-reports-details">{report.details}</p> : null}</td>
                    <td className="admin-reports-target"><strong>{report.report_type === "post" ? "Post" : report.report_type === "reply" ? "Reply" : "Comment"}</strong><span>{report.target_title || report.post_title || "Untitled post"}</span></td><td className="admin-reports-content"><span title={report.content || "No content available."}>{report.content || "No content available."}</span></td>
                    <td><div className="admin-reports-user"><Avatar size="sm" name={report.reporter_name || "Unknown user"} src={report.reporter_avatar?.trim() || undefined} /><span>{report.reporter_name || "Unknown user"}</span></div></td>
                    <td><span className={`admin-status status-${report.status}`}>{report.status}</span></td>
                    <td className="admin-reports-date">{new Date(report.created_at).toLocaleString()}</td>
                    <td>{report.status === "open" ? <div className="admin-reports-actions"><button type="button" disabled={busyId === report.id} onClick={() => setPendingAction({ reportId: report.id, type: report.report_type || "comment", status: "reviewed" })}>Review</button><button type="button" className="danger" disabled={busyId === report.id} onClick={() => setPendingAction({ reportId: report.id, type: report.report_type || "comment", status: "dismissed" })}>Dismiss</button></div> : <span className="admin-reports-complete">—</span>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="admin-table-footer"><span>Showing {filteredReports.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredReports.length)} of {formatCompactNumber(filteredReports.length)} reports</span>
            <div className="admin-pagination"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page"><option value={10}>10 rows</option><option value={15}>15 rows</option><option value={25}>25 rows</option><option value={50}>50 rows</option></select><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button></div>
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.status === "reviewed" ? "Mark report as reviewed?" : "Dismiss this report?"}
        message={pendingAction?.status === "reviewed" ? "Confirm that you have reviewed this report. Its status will be updated." : "Are you sure you want to dismiss this report? Its status will be updated to dismissed."}
        confirmText={pendingAction?.status === "reviewed" ? "Mark as reviewed" : "Dismiss report"}
        cancelText="Cancel"
        variant={pendingAction?.status === "dismissed" ? "danger" : "warning"}
        loading={pendingAction !== null && busyId === pendingAction.reportId}
        onCancel={() => { if (busyId === null) setPendingAction(null); }}
        onConfirm={async () => {
          if (!pendingAction) return;
          const succeeded = await updateReportStatus(pendingAction.reportId, pendingAction.status, pendingAction.type);
          if (succeeded) setPendingAction(null);
        }}
      />
      <footer className="admin-footer">ShivanyaMS · Community Reports</footer>
    </main>
  );
}
