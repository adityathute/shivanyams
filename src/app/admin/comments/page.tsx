"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, Avatar, ConfirmDialog, DislikeIcon, LikeIcon, RefreshIcon, Select } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "../admin-utils";
import "../admin.css";
import "./comments.css";

type CommentRow = {
  id: number; post: number; post_title: string; parent: number | null;
  user_auth_id: string; author_name: string; author_avatar: string; content: string;
  status: string; is_admin_reply: boolean; likes_count: number; dislikes_count: number; created_at: string;
};
type SortKey = "id" | "content" | "author" | "post" | "type" | "status" | "date";
type SortDirection = "asc" | "desc";

export default function AdminCommentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [allComments, setAllComments] = useState<CommentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [replyTarget, setReplyTarget] = useState<CommentRow | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [pendingAction, setPendingAction] = useState<{ comment: CommentRow; status: "approved" | "rejected" } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const totalComments = allComments.filter((row) => row.parent === null).length;
  const totalReplies = allComments.filter((row) => row.parent !== null).length;
  const postsWithComments = new Set(allComments.filter((row) => row.parent === null).map((row) => row.post)).size;
  const postsWithReplies = new Set(allComments.filter((row) => row.parent !== null).map((row) => row.post)).size;

  const filteredComments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = allComments.filter((comment) => {
      const isReply = comment.parent !== null;
      const matchesStatus = statusFilter === "all" || String(comment.status || "").trim().toLowerCase() === statusFilter;
      const matchesType = typeFilter === "all" || (typeFilter === "replies" ? isReply : !isReply);
      const matchesSearch = !query || [
        comment.content, comment.post_title, comment.author_name, comment.user_auth_id,
        comment.status, String(comment.id), String(comment.post), String(comment.parent ?? ""),
        isReply ? "reply" : "comment",
      ].some((value) => String(value ?? "").toLowerCase().includes(query));
      return matchesStatus && matchesType && matchesSearch;
    });
    const value = (row: CommentRow) => ({
      id: row.id, content: row.content, author: row.author_name || row.user_auth_id,
      post: row.post_title || String(row.post), type: row.parent === null ? "Comment" : "Reply",
      status: row.status, date: new Date(row.created_at).getTime() || 0,
    })[sortKey];
    return rows.sort((a, b) => {
      const av = value(a), bv = value(b);
      const comparison = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [allComments, search, statusFilter, typeFilter, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const visibleComments = filteredComments.slice((page - 1) * pageSize, page * pageSize);

  const loadComments = useCallback(async () => {
    setLoadingRows(true); setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/?status=all`, { cache: "no-store" });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || "Unable to load comments."); }
      const payload = await response.json();
      setAllComments(Array.isArray(payload) ? payload : []);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load comments."); }
    finally { setLoadingRows(false); }
  }, []);

  useEffect(() => { if (!loading && !isAdmin) router.replace("/"); }, [loading, isAdmin, router]);
  useEffect(() => { if (isAdmin) void loadComments(); }, [isAdmin, loadComments]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  async function updateStatus(comment: CommentRow, status: "approved" | "rejected" | "hidden"): Promise<boolean> {
    setBusyId(comment.id);
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: comment.id, status }) });
      if (!response.ok) throw new Error("Unable to update comment status.");
      await loadComments();
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update comment."); return false; }
    finally { setBusyId(null); }
  }

  async function sendAdminReply() {
    if (!replyTarget || !replyDraft.trim()) return;
    setBusyId(replyTarget.id);
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post: replyTarget.post, parent: replyTarget.id, content: replyDraft.trim() }) });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || "Unable to send admin reply."); }
      setReplyDraft(""); setReplyTarget(null); await loadComments();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to send reply."); }
    finally { setBusyId(null); }
  }

  if (loading || !isAdmin) return null;
  return (
    <main className="admin-page admin-comments-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div><span className="admin-eyebrow">SHIVANYAMS COMMUNITY</span><h1>Comments & Replies</h1><p>Review community discussions and reply as ShivanyaMS.</p></div>
          <div className="admin-top-actions admin-comments-header-actions">
            <Link href="/admin" className="admin-secondary-button"><ArrowLeftIcon size={16} /><span>Back to dashboard</span></Link>
            <button type="button" className="admin-secondary-button" onClick={() => void loadComments()} disabled={loadingRows} aria-label="Refresh comments and replies"><RefreshIcon size={16} /><span>Refresh</span></button>
          </div>
        </header>
        <section className="admin-post-panel admin-comments-panel">
          <div className="admin-panel-heading admin-comments-panel-heading">
            <div><h2>Community Discussions</h2><p>Monitor community conversations and manage member comments and replies.</p></div>
            <div className="admin-comments-totals" aria-label={`${totalComments} comments across ${postsWithComments} posts and ${totalReplies} replies across ${postsWithReplies} posts`}>
              <div className="admin-comments-total"><strong>{formatCompactNumber(totalComments)}</strong><span>Total comments</span><small>{formatCompactNumber(postsWithComments)} posts</small></div>
              <div className="admin-comments-total"><strong>{formatCompactNumber(totalReplies)}</strong><span>Total replies</span><small>{formatCompactNumber(postsWithReplies)} posts</small></div>
            </div>
          </div>
          <div className="admin-filters admin-comments-filters">
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search comment, reply, user ID or post..." aria-label="Search comments and replies" />
            <Select size="sm" fullWidth value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filter status" options={[{ value: "all", label: "All statuses" }, { value: "approved", label: "Approved" }, { value: "pending", label: "Pending" }, { value: "hidden", label: "Hidden" }, { value: "rejected", label: "Rejected" }]} />
            <Select size="sm" fullWidth value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }} aria-label="Filter type" options={[{ value: "all", label: "All types" }, { value: "comments", label: "Comments only" }, { value: "replies", label: "Replies only" }]} />
          </div>
          {error ? <div className="admin-error" role="alert">{error}</div> : null}
          {loadingRows ? <div className="admin-empty">Loading comments...</div> : filteredComments.length === 0 ? <div className="admin-empty">No comments or replies match these filters.</div> : (
            <div className="admin-table-wrap admin-comments-table-wrap">
              <table className="admin-post-table admin-comments-table">
                <thead><tr><th>Type</th><th>Content</th><th>Author</th><th>Post</th><th>Status</th><th>Date</th><th>Reactions</th><th>Actions</th></tr></thead>
                <tbody>{visibleComments.map((comment) => (
                  <tr key={comment.id}>
                    <td><span className={`admin-comments-type ${comment.parent === null ? "is-comment" : "is-reply"}`}>{comment.parent === null ? "Comment" : "Reply"}</span></td>
                    <td className="admin-comments-content"><span title={comment.content || "No content available."}>{comment.content || "No content available."}</span></td>
                    <td><div className="admin-comments-author"><Avatar size="sm" name={comment.author_name || (comment.is_admin_reply ? "ShivanyaMS Admin" : "Member")} src={comment.author_avatar?.trim() || undefined} /><span>{comment.author_name || (comment.is_admin_reply ? "ShivanyaMS Admin" : `User ${comment.user_auth_id}`)}</span></div></td>
                    <td className="admin-comments-post"><span title={comment.post_title || `Post #${comment.post}`}>{comment.post_title || `Post #${comment.post}`}</span></td>
                    <td><span className={`admin-status status-${comment.status}`}>{comment.status}</span></td>
                    <td className="admin-comments-date">{new Date(comment.created_at).toLocaleString()}</td>
                    <td className="admin-comments-reactions"><span><LikeIcon size={13} /> {formatCompactNumber(comment.likes_count)}</span><span><DislikeIcon size={13} /> {formatCompactNumber(comment.dislikes_count)}</span></td>
                    <td><div className="admin-comments-actions">
                      {comment.status !== "approved" ? <button type="button" className="approve" disabled={busyId === comment.id} onClick={() => setPendingAction({ comment, status: "approved" })}>Approve</button> : null}
                      {comment.status !== "hidden" ? <button type="button" disabled={busyId === comment.id} onClick={() => void updateStatus(comment, "hidden")}>Hide</button> : null}
                      {comment.status !== "rejected" ? <button type="button" className="danger" disabled={busyId === comment.id} onClick={() => setPendingAction({ comment, status: "rejected" })}>Reject</button> : null}
                      {comment.parent === null ? <button type="button" className="reply" onClick={() => { setReplyTarget(comment); setReplyDraft(""); }}>Reply</button> : null}
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="admin-table-footer"><span>Showing {filteredComments.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredComments.length)} of {formatCompactNumber(filteredComments.length)} discussions</span>
            <div className="admin-pagination"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page"><option value={10}>10 rows</option><option value={15}>15 rows</option><option value={25}>25 rows</option><option value={50}>50 rows</option></select><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button></div>
          </div>
        </section>
      </div>
      {replyTarget ? (
        <div className="admin-comments-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && busyId !== replyTarget.id) setReplyTarget(null); }}>
          <section className="admin-comments-reply-modal" role="dialog" aria-modal="true" aria-labelledby="admin-comments-reply-title">
            <div className="admin-comments-reply-modal-head"><div><span className="admin-eyebrow">SHIVANYAMS COMMUNITY</span><h2 id="admin-comments-reply-title">Reply to comment</h2><p>Respond officially as ShivanyaMS.</p></div><button type="button" aria-label="Close reply dialog" onClick={() => setReplyTarget(null)} disabled={busyId === replyTarget.id}>×</button></div>
            <div className="admin-comments-reply-context"><strong>{replyTarget.author_name || "Community member"}</strong><p>{replyTarget.content}</p></div>
            <label className="admin-comments-reply-label" htmlFor="admin-comments-reply-input">Your reply</label>
            <textarea id="admin-comments-reply-input" value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} rows={5} maxLength={10000} placeholder="Write an official reply..." autoFocus />
            <div className="admin-comments-reply-modal-actions"><button type="button" className="cancel" onClick={() => setReplyTarget(null)} disabled={busyId === replyTarget.id}>Cancel</button><button type="button" className="send" disabled={!replyDraft.trim() || busyId === replyTarget.id} onClick={() => void sendAdminReply()}>{busyId === replyTarget.id ? "Sending..." : "Send reply"}</button></div>
          </section>
        </div>
      ) : null}
      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.status === "approved" ? "Approve this comment?" : "Reject this comment?"}
        message={pendingAction?.status === "approved" ? "This comment will be approved and visible to the community." : "This comment will be rejected and will not be visible to the community."}
        confirmText={pendingAction?.status === "approved" ? "Approve comment" : "Reject comment"}
        cancelText="Cancel"
        variant={pendingAction?.status === "rejected" ? "danger" : "warning"}
        loading={pendingAction !== null && busyId === pendingAction.comment.id}
        onCancel={() => { if (busyId === null) setPendingAction(null); }}
        onConfirm={async () => {
          if (!pendingAction) return;
          const succeeded = await updateStatus(pendingAction.comment, pendingAction.status);
          if (succeeded) setPendingAction(null);
        }}
      />
      <footer className="admin-footer">ShivanyaMS · Comments & Replies</footer>
    </main>
  );
}
