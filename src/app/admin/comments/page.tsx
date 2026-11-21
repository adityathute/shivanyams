"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { Avatar } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch } from "../admin-utils";
import "../admin.css";
import "./comments.css";

type Report = {
  id: number;
  reporter_auth_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
};

type CommentRow = {
  id: number;
  post: number;
  post_title: string;
  parent: number | null;
  user_auth_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  status: string;
  is_admin_reply: boolean;
  likes_count: number;
  dislikes_count: number;
  report_count: number;
  reports: Report[];
  created_at: string;
};

export default function AdminCommentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportedOnly, setReportedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [replyTarget, setReplyTarget] = useState<CommentRow | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const loadComments = useCallback(async () => {
    setLoadingRows(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      if (reportedOnly) params.set("reported", "true");
      if (search.trim()) params.set("search", search.trim());
      const response = await adminFetch(`${API_URL}/admin/comments/?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Unable to load comments.");
      }
      const payload = await response.json();
      setComments(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load comments.");
    } finally {
      setLoadingRows(false);
    }
  }, [statusFilter, reportedOnly, search]);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) void loadComments();
  }, [isAdmin, loadComments]);

  async function updateStatus(comment: CommentRow, status: string) {
    setBusyId(comment.id);
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comment.id, status }),
      });
      if (!response.ok) throw new Error("Unable to update comment status.");
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update comment.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateReportStatus(reportId: number, reportStatus: string) {
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId, report_status: reportStatus }),
      });
      if (!response.ok) throw new Error("Unable to update report.");
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update report.");
    }
  }

  async function sendAdminReply() {
    if (!replyTarget || !replyDraft.trim()) return;
    setBusyId(replyTarget.id);
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: replyTarget.post,
          parent: replyTarget.id,
          content: replyDraft.trim(),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Unable to send admin reply.");
      }
      setReplyDraft("");
      setReplyTarget(null);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reply.");
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
            <h1>Comments & reports</h1>
            <p>Review discussions, handle reports and reply as ShivanyaMS.</p>
          </div>
          <div className="admin-top-actions">
            <Link href="/admin" className="admin-secondary-button">← Back to posts</Link>
            <button type="button" className="admin-secondary-button" onClick={() => void loadComments()}>↻ Refresh</button>
          </div>
        </header>

        <section className="admin-post-panel admin-comments-panel">
          <div className="admin-panel-heading">
            <div><h2>Discussion activity</h2><p>{comments.length} comments in this result</p></div>
          </div>
          <div className="admin-filters admin-comments-filters">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search comment, user ID or post..." aria-label="Search comments" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter comment status">
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="hidden">Hidden</option>
              <option value="rejected">Rejected</option>
            </select>
            <label className="admin-comments-reported-filter">
              <input type="checkbox" checked={reportedOnly} onChange={(event) => setReportedOnly(event.target.checked)} />
              Reported only
            </label>
          </div>

          {error ? <div className="admin-error">{error}</div> : null}
          {loadingRows ? <div className="admin-empty">Loading comments...</div> : comments.length === 0 ? <div className="admin-empty">No comments match these filters.</div> : (
            <div className="admin-comments-list">
              {comments.map((comment) => (
                <article className="admin-comment-card" key={comment.id}>
                  <div className="admin-comment-card-head">
                    <div className="admin-comment-author">
                      <Avatar size="sm" name={comment.author_name || (comment.is_admin_reply ? "ShivanyaMS Admin" : "Member")} src={comment.author_avatar?.trim() || undefined} />
                      <div>
                        <strong>{comment.author_name || (comment.is_admin_reply ? "ShivanyaMS Admin" : `User ${comment.user_auth_id}`)}</strong>
                        <span>{comment.post_title} · #{comment.id}{comment.parent ? ` · Reply to #${comment.parent}` : ""}</span>
                      </div>
                    </div>
                    <span className={`admin-status status-${comment.status}`}>{comment.status}</span>
                  </div>
                  <p className="admin-comment-text">{comment.content}</p>
                  <div className="admin-comment-meta">
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                    <span>↑ {comment.likes_count} · ↓ {comment.dislikes_count}</span>
                    <span className={comment.report_count ? "has-reports" : ""}>{comment.report_count} reports</span>
                  </div>
                  {comment.reports?.length ? (
                    <div className="admin-comment-reports">
                      <strong>Reports</strong>
                      {comment.reports.map((report) => (
                        <div key={report.id}>
                          <span>{report.reason}</span>
                          {report.details ? <p>{report.details}</p> : null}
                          <small>{report.status} · {new Date(report.created_at).toLocaleString()}</small>
                          {report.status === "open" ? <div className="admin-report-actions"><button type="button" onClick={() => void updateReportStatus(report.id, "reviewed")}>Mark reviewed</button><button type="button" onClick={() => void updateReportStatus(report.id, "dismissed")}>Dismiss</button></div> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="admin-comment-actions">
                    {comment.status !== "approved" ? <button type="button" disabled={busyId === comment.id} onClick={() => void updateStatus(comment, "approved")}>Approve / restore</button> : null}
                    {comment.status !== "hidden" ? <button type="button" disabled={busyId === comment.id} onClick={() => void updateStatus(comment, "hidden")}>Hide</button> : null}
                    {comment.status !== "rejected" ? <button type="button" className="danger" disabled={busyId === comment.id} onClick={() => void updateStatus(comment, "rejected")}>Reject</button> : null}
                    <button type="button" onClick={() => { setReplyTarget(comment); setReplyDraft(""); }}>Reply as admin</button>
                  </div>
                  {replyTarget?.id === comment.id ? (
                    <div className="admin-comment-reply">
                      <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} rows={3} maxLength={10000} placeholder="Write an official reply..." />
                      <div>
                        <button type="button" onClick={() => setReplyTarget(null)}>Cancel</button>
                        <button type="button" disabled={!replyDraft.trim() || busyId === comment.id} onClick={() => void sendAdminReply()}>Send reply</button>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <footer className="admin-footer">ShivanyaMS · Community Management</footer>
    </main>
  );
}
