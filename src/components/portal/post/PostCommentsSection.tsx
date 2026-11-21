"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "shivanya-auth";
import { Avatar, Button, DislikeIcon, LikeIcon, Textarea } from "shivanya-ui";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { usePortalAuth } from "../context/PortalAuthContext";
import "./PostCommentsSection.css";

type Reaction = "like" | "dislike" | null;

type CommentItem = {
  id: number;
  parent: number | null;
  content: string;
  language: string;
  is_admin_reply: boolean;
  author_name: string;
  author_avatar: string;
  likes_count: number;
  dislikes_count: number;
  user_reaction: Reaction;
  created_at: string;
  replies: CommentItem[];
};

type Props = {
  postId: number;
  language: string;
};

function formatAuthorName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/(^|[\s\u2010-\u2015-]+)([\p{L}])/gu, (_match, separator, letter) => `${separator}${letter.toLocaleUpperCase()}`);
}

function countComments(items: CommentItem[]): number {
  return items.reduce((total, item) => total + 1 + countComments(item.replies || []), 0);
}

function CommentThread({
  item,
  depth,
  onReply,
  onReact,
  onReport,
  replyTarget,
  replyDraft,
  onReplyDraftChange,
  onCancelReply,
  onSubmitReply,
  submitting,
}: {
  item: CommentItem;
  depth: number;
  onReply: (id: number) => void;
  onReact: (id: number, reaction: "like" | "dislike") => void;
  onReport: (id: number) => void;
  replyTarget: number | null;
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  submitting: boolean;
}) {
  const [visibleReplies, setVisibleReplies] = useState(0);
  const replyCount = item.replies?.length || 0;
  const repliesExpanded = visibleReplies > 0;
  const visibleReplyItems = item.replies?.slice(0, visibleReplies) || [];

  function toggleReplies() {
    setVisibleReplies((current) => current > 0 ? 0 : Math.min(5, replyCount));
  }

  function showMoreReplies() {
    setVisibleReplies((current) => Math.min(replyCount, current + 5));
  }
  const date = new Date(item.created_at);
  const dateLabel = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  return (
    <article className={`portal-comment-item${depth >= 3 ? " is-deep" : ""}`}>
      <div className="portal-comment-main">
        <Avatar size="sm" name={formatAuthorName(item.author_name || (item.is_admin_reply ? "ShivanyaMS Admin" : "Member"))} src={item.author_avatar?.trim() || undefined} />
        <div className="portal-comment-content">
          <div className="portal-comment-author-row">
            <strong>{formatAuthorName(item.author_name || (item.is_admin_reply ? "ShivanyaMS Admin" : "Member"))}</strong>
            {item.is_admin_reply ? <span className="portal-comment-admin-badge">Admin</span> : null}
            <time dateTime={item.created_at}>{dateLabel}</time>
          </div>
          <p>{item.content}</p>
          <div className="portal-comment-actions">
            <button type="button" className={`portal-comment-reaction portal-comment-like${item.user_reaction === "like" ? " is-active" : ""}`} onClick={() => onReact(item.id, "like")} aria-label={`Like comment, ${item.likes_count} likes`}>
              <LikeIcon size={14} /> {item.likes_count}
            </button>
            <button type="button" className={`portal-comment-reaction portal-comment-dislike${item.user_reaction === "dislike" ? " is-active" : ""}`} onClick={() => onReact(item.id, "dislike")} aria-label={`Dislike comment, ${item.dislikes_count} dislikes`}>
              <DislikeIcon size={14} /> {item.dislikes_count}
            </button>
            <button type="button" onClick={() => onReply(item.id)}>Reply</button>
            <button type="button" className="portal-comment-report" onClick={() => onReport(item.id)}>Report</button>
          </div>
          {replyCount > 0 ? (
            <button type="button" className="portal-comment-toggle-replies" onClick={toggleReplies} aria-expanded={repliesExpanded} aria-label={repliesExpanded ? "Hide replies" : `Show ${replyCount} replies`}>
              <span className={`portal-comment-replies-chevron${repliesExpanded ? " is-expanded" : ""}`} aria-hidden="true">⌄</span>
              <span>{replyCount} {replyCount === 1 ? "reply" : "replies"}</span>
            </button>
          ) : null}
        </div>
      </div>
      {replyTarget === item.id ? (
        <div className="portal-comment-inline-reply">
          <Textarea value={replyDraft} onChange={(event) => onReplyDraftChange(event.target.value)} placeholder={`Reply to ${formatAuthorName(item.author_name || "this comment")}...`} rows={2} maxLength={250} fullWidth size="sm" autoFocus />
          <div className="portal-comment-inline-reply-footer">
            <span>{replyDraft.length}/250</span>
            <Button type="button" size="sm" variant="primary" disabled={submitting} onClick={onCancelReply}>Cancel</Button>
            <Button type="button" size="sm" variant="primary" disabled={!replyDraft.trim() || submitting} onClick={onSubmitReply}>Reply</Button>
          </div>
        </div>
      ) : null}
      {repliesExpanded ? (
        <div className="portal-comment-replies">
          {visibleReplyItems.map((reply) => (
            <CommentThread
              key={reply.id}
              item={reply}
              depth={depth + 1}
              onReply={onReply}
              onReact={onReact}
              onReport={onReport}
              replyTarget={replyTarget}
              replyDraft={replyDraft}
              onReplyDraftChange={onReplyDraftChange}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              submitting={submitting}
            />
          ))}
          {visibleReplies < replyCount ? (
            <button type="button" className="portal-comment-load-more" onClick={showMoreReplies}>
              Show {Math.min(5, replyCount - visibleReplies)} more {replyCount - visibleReplies === 1 ? "reply" : "replies"}
            </button>
          ) : (
            <button type="button" className="portal-comment-hide-replies" onClick={toggleReplies}>
              <span className="portal-comment-replies-chevron is-expanded" aria-hidden="true">⌃</span>
              Hide replies
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function PostCommentsSection({ postId, language }: Props) {
  const { user } = useAuth();
  const { openLogin } = usePortalAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [reportTarget, setReportTarget] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/comments/`), { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "Comments are not available for this post." : "Unable to load comments.");
      const payload = await response.json();
      setComments(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load comments.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const delta = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newest" ? -delta : delta;
    });
  }, [comments, sort]);

  async function postComment(content: string, parentId: number | null) {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/comments/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, parent: parentId, language }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.content?.[0] || "Unable to submit your comment.");
      }
      if (parentId) setReplyDraft("");
      else setDraft("");
      setReplyTarget(null);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your comment.");
    } finally {
      setSubmitting(false);
    }
  }

  function submitComment(content: string, parentId: number | null) {
    if (!content.trim() || submitting) return;
    if (!user) {
      openLogin(() => { void postComment(content, parentId); });
      return;
    }
    void postComment(content, parentId);
  }

  async function sendCommentReaction(commentId: number, reaction: "like" | "dislike") {
    const target = findComment(comments, commentId);
    const method = target?.user_reaction === reaction ? "DELETE" : "POST";
    const response = await authenticatedFetch(getPortalApiUrl(`comments/${commentId}/reactions/`), {
      method,
      headers: { "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify({ reaction }) } : {}),
    });
    if (!response.ok) {
      setError("Unable to update your reaction.");
      return;
    }
    const payload = await response.json();
    setComments((current) => updateComment(current, commentId, (item) => ({
      ...item,
      likes_count: payload.likes_count,
      dislikes_count: payload.dislikes_count,
      user_reaction: payload.reaction,
    })));
  }

  function reactToComment(commentId: number, reaction: "like" | "dislike") {
    if (!user) {
      openLogin(() => { void sendCommentReaction(commentId, reaction); });
      return;
    }
    void sendCommentReaction(commentId, reaction);
  }

  async function sendCommentReport() {
    if (!reportTarget || reporting) return;
    setReporting(true);
    try {
      const response = await authenticatedFetch(getPortalApiUrl(`comments/${reportTarget}/reports/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, details: reportDetails.trim() }),
      });
      if (!response.ok) {
        setError("Unable to report this comment.");
        return;
      }
      const payload = await response.json();
      setReportTarget(null);
      setReportDetails("");
      if (payload.hidden) await loadComments();
      setError(payload.hidden ? "This comment was hidden after multiple reports." : "Thank you. Your report was submitted.");
    } finally {
      setReporting(false);
    }
  }

  function reportComment(commentId: number) {
    if (!user) {
      openLogin(() => setReportTarget(commentId));
      return;
    }
    setReportReason("spam");
    setReportDetails("");
    setReportTarget(commentId);
  }

  return (
    <section className="portal-comments-section" aria-labelledby="portal-comments-heading">
      <div className="portal-comments-heading">
        <div>
          <h2 id="portal-comments-heading">Comments</h2>
          <span>{countComments(comments).toLocaleString()} comments and replies</span>
        </div>
        <select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")} aria-label="Sort comments">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="portal-comment-composer">
        <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a comment..." rows={3} maxLength={500} fullWidth size="md" />
        <div className="portal-comment-composer-footer">
          <span>{draft.length}/500</span>
          <Button size="sm" variant="primary" disabled={!draft.trim() || submitting} onClick={() => void submitComment(draft, null)}>
            {submitting ? "Posting..." : "Post comment"}
          </Button>
        </div>
      </div>


      {reportTarget ? (
        <div className="portal-comment-report-panel">
          <div><strong>Report comment</strong><span>Tell us why this comment should be reviewed.</span></div>
          <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} aria-label="Report reason">
            <option value="spam">Spam</option><option value="abuse">Abusive or harmful</option><option value="misinformation">Misinformation</option><option value="other">Other</option>
          </select>
          <Textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} rows={2} maxLength={2000} placeholder="Additional details (optional)" fullWidth size="sm" />
          <div><Button type="button" size="sm" variant="primary" disabled={reporting} onClick={() => setReportTarget(null)}>Cancel</Button><Button type="button" size="sm" variant="primary" disabled={reporting} onClick={() => void sendCommentReport()}>{reporting ? "Sending..." : "Submit report"}</Button></div>
        </div>
      ) : null}
      {error ? <p className="portal-comments-message" role="status">{error}</p> : null}
      {loading ? <p className="portal-comments-message">Loading comments...</p> : null}
      {!loading && !comments.length ? <p className="portal-comments-empty">No comments yet. Start the discussion.</p> : null}
      <div className="portal-comments-list">
        {sortedComments.map((item) => (
          <CommentThread
            key={item.id}
            item={item}
            depth={0}
            onReply={(id) => {
              if (!user) openLogin(() => setReplyTarget(id));
              else setReplyTarget(id);
            }}
            onReact={(id, reaction) => void reactToComment(id, reaction)}
            onReport={(id) => reportComment(id)}
            replyTarget={replyTarget}
            replyDraft={replyDraft}
            onReplyDraftChange={setReplyDraft}
            onCancelReply={() => { setReplyTarget(null); setReplyDraft(""); }}
            onSubmitReply={() => { if (replyTarget) void submitComment(replyDraft, replyTarget); }}
            submitting={submitting}
          />
        ))}
      </div>
    </section>
  );
}

function findComment(items: CommentItem[], id: number): CommentItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const nested = findComment(item.replies || [], id);
    if (nested) return nested;
  }
  return null;
}

function updateComment(items: CommentItem[], id: number, updater: (item: CommentItem) => CommentItem): CommentItem[] {
  return items.map((item) => item.id === id
    ? updater(item)
    : { ...item, replies: updateComment(item.replies || [], id, updater) });
}
