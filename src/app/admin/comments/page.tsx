"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { ArrowLeftIcon, Avatar, DislikeIcon, LikeIcon, RefreshIcon, Select } from "shivanya-ui";
import { API_URL } from "../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "../admin-utils";
import "../admin.css";
import "./comments.css";

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
  created_at: string;
};

export default function AdminCommentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [allComments, setAllComments] = useState<CommentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [replyTarget, setReplyTarget] = useState<CommentRow | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const totalComments = allComments.filter((comment) => comment.parent === null).length;
  const totalReplies = allComments.filter((comment) => comment.parent !== null).length;
  const postsWithComments = new Set(allComments.filter((comment) => comment.parent === null).map((comment) => comment.post)).size;
  const postsWithReplies = new Set(allComments.filter((comment) => comment.parent !== null).map((comment) => comment.post)).size;
  const filteredComments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return allComments.filter((comment) => {
      const matchesStatus = statusFilter === "all" || String(comment.status || "").trim().toLowerCase() === statusFilter;
      const matchesSearch = !query || [
        comment.content, comment.post_title, comment.author_name, comment.user_auth_id,
        comment.status, String(comment.id), String(comment.post), String(comment.parent ?? ""),
      ].some((value) => String(value ?? "").toLocaleLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [allComments, search, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const visibleComments = filteredComments.slice((page - 1) * pageSize, page * pageSize);

  const loadComments = useCallback(async () => {
    setLoadingRows(true);
    setError("");
    try {
      const response = await adminFetch(`${API_URL}/admin/comments/?status=all`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Unable to load comments.");
      }
      const payload = await response.json();
      setAllComments(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load comments.");
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) void loadComments();
  }, [isAdmin, loadComments]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

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
            <h1>Comments & Replies</h1>
            <p>Review community discussions and reply as ShivanyaMS.</p>
          </div>
          <div className="admin-top-actions admin-comments-header-actions">
            <Link href="/admin" className="admin-secondary-button">
              <ArrowLeftIcon size={16} />
              <span>Back to dashboard</span>
            </Link>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => void loadComments()}
              disabled={loadingRows}
              aria-label="Refresh comments and replies"
              title="Refresh"
            >
              <RefreshIcon size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <section className="admin-post-panel admin-comments-panel">
          <div className="admin-panel-heading admin-comments-panel-heading">
            <div>
              <h2>Community discussions</h2>
              <p>Monitor community conversations and manage member comments and replies.</p>
            </div>
            <div className="admin-comments-totals" aria-label={`${totalComments} comments across ${postsWithComments} posts and ${totalReplies} replies across ${postsWithReplies} posts`}>
              <div className="admin-comments-total">
                <strong>{formatCompactNumber(totalComments)}</strong>
                <span>Total comments</span>
                <small>{formatCompactNumber(postsWithComments)} posts</small>
              </div>
              <div className="admin-comments-total">
                <strong>{formatCompactNumber(totalReplies)}</strong>
                <span>Total replies</span>
                <small>{formatCompactNumber(postsWithReplies)} posts</small>
              </div>
            </div>
          </div>
          <div className="admin-filters admin-comments-filters">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search comment, user ID or post..." aria-label="Search comments" />
            <Select
              size="sm"
              fullWidth
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter comment status"
              options={[
                { value: "all", label: "All statuses" },
                { value: "approved", label: "Approved" },
                { value: "pending", label: "Pending" },
                { value: "hidden", label: "Hidden" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>

          {error ? <div className="admin-error">{error}</div> : null}
          {loadingRows ? <div className="admin-empty">Loading comments...</div> : filteredComments.length === 0 ? <div className="admin-empty">No comments match these filters.</div> : (
            <div className="admin-comments-list">
              {visibleComments.map((comment) => (
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
                    <span className="admin-comment-reactions">
                      <LikeIcon size={14} /> {formatCompactNumber(comment.likes_count)}
                      <DislikeIcon size={14} /> {formatCompactNumber(comment.dislikes_count)}
                    </span>
                  </div>
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
          <div className="admin-table-footer">
            <span>
              Showing {comments.length ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, filteredComments.length)} of {formatCompactNumber(filteredComments.length)} comments
            </span>
            <div className="admin-pagination">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Comments per page"
              >
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
              <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                Previous
              </button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
      <footer className="admin-footer">ShivanyaMS · Comments & Replies</footer>
    </main>
  );
}
