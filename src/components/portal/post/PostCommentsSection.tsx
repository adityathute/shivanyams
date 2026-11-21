"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "shivanya-auth";
import { Button } from "shivanya-ui";
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

function countComments(items: CommentItem[]): number {
  return items.reduce((total, item) => total + 1 + countComments(item.replies || []), 0);
}

function CommentThread({
  item,
  depth,
  onReply,
  onReact,
  onReport,
}: {
  item: CommentItem;
  depth: number;
  onReply: (id: number) => void;
  onReact: (id: number, reaction: "like" | "dislike") => void;
  onReport: (id: number) => void;
}) {
  const date = new Date(item.created_at);
  const dateLabel = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  return (
    <article className={`portal-comment-item${depth >= 3 ? " is-deep" : ""}`}>
      <div className="portal-comment-main">
        <div className="portal-comment-avatar" aria-hidden="true">U</div>
        <div className="portal-comment-content">
          <div className="portal-comment-author-row">
            <strong>{item.is_admin_reply ? "ShivanyaMS Admin" : "Member"}</strong>
            {item.is_admin_reply ? <span className="portal-comment-admin-badge">Admin</span> : null}
            <time dateTime={item.created_at}>{dateLabel}</time>
          </div>
          <p>{item.content}</p>
          <div className="portal-comment-actions">
            <button type="button" className={item.user_reaction === "like" ? "is-active" : ""} onClick={() => onReact(item.id, "like")}>
              <span aria-hidden="true">↑</span> {item.likes_count}
            </button>
            <button type="button" className={item.user_reaction === "dislike" ? "is-active" : ""} onClick={() => onReact(item.id, "dislike")}>
              <span aria-hidden="true">↓</span> {item.dislikes_count}
            </button>
            <button type="button" onClick={() => onReply(item.id)}>Reply</button>
            <button type="button" className="portal-comment-report" onClick={() => onReport(item.id)}>Report</button>
          </div>
        </div>
      </div>
      {item.replies?.length ? (
        <div className="portal-comment-replies">
          {item.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              item={reply}
              depth={depth + 1}
              onReply={onReply}
              onReact={onReact}
              onReport={onReport}
            />
          ))}
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

  async function submitComment(content: string, parentId: number | null) {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    if (!user) {
      openLogin(() => { void submitComment(trimmed, parentId); });
      return;
    }
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

  async function reactToComment(commentId: number, reaction: "like" | "dislike") {
    if (!user) {
      openLogin(() => { void reactToComment(commentId, reaction); });
      return;
    }
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

  async function reportComment(commentId: number) {
    if (!user) {
      openLogin(() => { void reportComment(commentId); });
      return;
    }
    const reason = window.prompt("Why are you reporting this comment? (spam, abuse, misinformation, other)");
    if (!reason?.trim()) return;
    const response = await authenticatedFetch(getPortalApiUrl(`comments/${commentId}/reports/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() }),
    });
    if (!response.ok) {
      setError("Unable to report this comment.");
      return;
    }
    const payload = await response.json();
    if (payload.hidden) await loadComments();
    setError(payload.hidden ? "This comment was hidden after multiple reports." : "Thank you. Your report was submitted.");
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
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a comment..." rows={3} maxLength={10000} />
        <div className="portal-comment-composer-footer">
          <span>{draft.length}/10000</span>
          <Button size="sm" variant="primary" disabled={!draft.trim() || submitting} onClick={() => void submitComment(draft, null)}>
            {submitting ? "Posting..." : "Post comment"}
          </Button>
        </div>
      </div>

      {replyTarget ? (
        <div className="portal-comment-reply-composer">
          <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="Write your reply..." rows={2} maxLength={10000} />
          <div className="portal-comment-composer-footer">
            <button type="button" onClick={() => { setReplyTarget(null); setReplyDraft(""); }}>Cancel</button>
            <Button size="sm" variant="primary" disabled={!replyDraft.trim() || submitting} onClick={() => void submitComment(replyDraft, replyTarget)}>
              Reply
            </Button>
          </div>
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
            onReport={(id) => void reportComment(id)}
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
