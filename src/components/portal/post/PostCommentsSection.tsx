/*
 * File Location: shivanyams/src/components/portal/post/PostCommentsSection.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 12 post-detail audit. UI Audit: 15 components; SDK: Avatar, Button, ConfirmDialog, DeleteIcon, DislikeIcon, EditIcon, LikeIcon, MessagesIcon, ReportIcon, Select, Textarea, ArrowDownIcon, ArrowUpIcon (13); app-local: CommentThread, CommentItem (2). CSS mapping: PostCommentsSection.css (199 selector blocks; 161 unique; 32 repeated selector names / 38 repeated occurrences). Accessibility, nested-thread and legacy-style cleanup pending.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "shivanya-auth";
import { ArrowDownIcon, ArrowUpIcon, Avatar, Button, ConfirmDialog, DeleteIcon, DislikeIcon, EditIcon, LikeIcon, MessagesIcon, ReportIcon, Select, Textarea } from "shivanya-ui";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { formatCompactNumber } from "../../../lib/format-number";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { usePortalAuth } from "../context/PortalAuthContext";
import "./../../../styles/legacy/components/portal/post/PostCommentsSection.css";
import { getCommentModerationIssue } from "./comment-moderation";

type Reaction = "like" | "dislike" | null;


function formatCommentRelativeDate(value: string) {
  if (!value) return "";
  const date = /^\\d{4}-\\d{2}-\\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const unit = (count: number, singular: string, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

  if (seconds < 60) return `${Math.max(1, seconds)} sec ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${unit(minutes, "min")} ${unit(remainingSeconds, "sec")} ago`
      : `${unit(minutes, "min")} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${unit(hours, "hour")} ${unit(remainingMinutes, "min")} ago`
      : `${unit(hours, "hour")} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${unit(days, "day")} ${unit(remainingHours, "hour")} ago`
      : `${unit(days, "day")} ago`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return remainingDays > 0
      ? `${unit(weeks, "week")} ${unit(remainingDays, "day")} ago`
      : `${unit(weeks, "week")} ago`;
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
type CommentItem = {
  id: number;
  parent: number | null;
  user_auth_id: string;
  content: string;
  reviewed_at: string | null;
  edited: boolean;
  language: string;
  is_admin_reply: boolean;
  author_name: string;
  author_avatar: string;
  likes_count: number;
  dislikes_count: number;
  user_reaction: Reaction;
  report_count: number;
  user_has_reported: boolean;
  report_limit_reached: boolean;
  created_at: string;
  updated_at: string;
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
  onEdit,
  onDelete,
  currentUserId,
  editTarget,
  editDraft,
  editing,
  onEditDraftChange,
  onCancelEdit,
  onSaveEdit,
  reportTarget,
  reportReason,
  reportDetails,
  reporting,
  onReportReasonChange,
  onReportDetailsChange,
  onCancelReport,
  onSubmitReport,
  replyTarget,
  replyDraft,
  onReplyDraftChange,
  onCancelReply,
  onSubmitReply,
  submitting,
  expandRepliesForId,
}: {
  item: CommentItem;
  depth: number;
  onReply: (id: number) => void;
  onReact: (id: number, reaction: "like" | "dislike") => void;
  onReport: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  currentUserId: string;
  editTarget: number | null;
  editDraft: string;
  editing: boolean;
  onEditDraftChange: (value: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  reportTarget: number | null;
  reportReason: string;
  reportDetails: string;
  reporting: boolean;
  onReportReasonChange: (value: string) => void;
  onReportDetailsChange: (value: string) => void;
  onCancelReport: () => void;
  onSubmitReport: () => void;
  replyTarget: number | null;
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  submitting: boolean;
  expandRepliesForId: number | null;
}) {
  const [visibleReplies, setVisibleReplies] = useState(0);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [contentCanExpand, setContentCanExpand] = useState(false);
  const commentTextRef = useRef<HTMLParagraphElement>(null);
  const replyCount = item.replies?.length || 0;
  const replyModerationIssue = getCommentModerationIssue(replyDraft);
  const editModerationIssue = getCommentModerationIssue(editDraft);
  const repliesExpanded = visibleReplies > 0;
  const visibleReplyItems = item.replies?.slice(0, visibleReplies) || [];

  useEffect(() => {
    if (expandRepliesForId === item.id && replyCount > 0) {
      setVisibleReplies(replyCount);
    }
  }, [expandRepliesForId, item.id, replyCount]);

  useEffect(() => {
    const textElement = commentTextRef.current;
    if (!textElement || editTarget === item.id) return;

    const measureContent = () => {
      // Keep the toggle visible while expanded so the user can collapse the text.
      if (contentExpanded) return;
      setContentCanExpand(textElement.scrollHeight > textElement.clientHeight + 1);
    };

    measureContent();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measureContent);
    observer.observe(textElement);
    return () => observer.disconnect();
  }, [item.content, editTarget, item.id, contentExpanded]);

  function toggleReplies() {
    setVisibleReplies((current) => current > 0 ? 0 : replyCount);
  }
  const dateLabel = formatCommentRelativeDate(item.created_at);

  return (
    <article className={`portal-comment-item${depth >= 3 ? " is-deep" : ""}${replyCount > 0 ? " has-replies" : ""}${repliesExpanded ? " is-replies-expanded" : ""}`}>
      <div className="portal-comment-main">
        <Avatar size="sm" name={formatAuthorName(item.author_name || (item.is_admin_reply ? "ShivanyaMS Admin" : "Member"))} src={item.author_avatar?.trim() || undefined} />
        <div className="portal-comment-content">
          <div className="portal-comment-author-row">
            <strong>{formatAuthorName(item.author_name || (item.is_admin_reply ? "ShivanyaMS Admin" : "Member"))}</strong>
            {item.is_admin_reply ? <span className="portal-comment-admin-badge">Admin</span> : null}
            <time dateTime={item.created_at}>{dateLabel}</time>
            {item.edited ? <span className="portal-comment-edited-label">(Edited)</span> : null}
            {item.reviewed_at && !item.is_admin_reply ? <span className="portal-comment-reviewed-badge">Reviewed</span> : null}
          </div>
          {editTarget === item.id ? (
            <div className="portal-comment-edit-form">
              <Textarea value={editDraft} onChange={(event) => onEditDraftChange(event.target.value)} rows={3} maxLength={item.parent ? 250 : 500} fullWidth size="sm" autoFocus />
              {editModerationIssue ? <p className="portal-comment-moderation-warning" role="alert">{editModerationIssue}</p> : null}
              <div className="portal-comment-edit-footer">
                <span>{editDraft.length}/{item.parent ? 250 : 500}</span>
                <Button type="button" size="sm" variant="outline" disabled={editing} onClick={onCancelEdit}>Cancel</Button>
                <Button type="button" size="sm" variant="primary" disabled={!editDraft.trim() || editDraft.trim() === item.content.trim() || Boolean(editModerationIssue) || editing} onClick={onSaveEdit}>{editing ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          ) : (
            <>
              <p
                ref={commentTextRef}
                className={contentExpanded ? "is-expanded" : undefined}
              >
                {item.content}
              </p>
              {contentCanExpand ? (
                <button
                  type="button"
                  className="portal-comment-show-more"
                  onClick={() => setContentExpanded((expanded) => !expanded)}
                  aria-expanded={contentExpanded}
                >
                  {contentExpanded ? "Hide" : "Show more"}
                </button>
              ) : null}
            </>
          )}
          <div className="portal-comment-actions">
            <button type="button" className={`portal-comment-reaction portal-comment-like${item.user_reaction === "like" ? " is-active" : ""}`} onClick={() => onReact(item.id, "like")} aria-label={`Like comment, ${formatCompactNumber(item.likes_count)} likes`}>
              <LikeIcon size={14} /> {formatCompactNumber(item.likes_count)}
            </button>
            <button type="button" className={`portal-comment-reaction portal-comment-dislike${item.user_reaction === "dislike" ? " is-active" : ""}`} onClick={() => onReact(item.id, "dislike")} aria-label={`Dislike comment, ${formatCompactNumber(item.dislikes_count)} dislikes`}>
              <DislikeIcon size={14} /> {formatCompactNumber(item.dislikes_count)}
            </button>
            {item.user_auth_id === currentUserId && !item.is_admin_reply && editTarget !== item.id ? <><button type="button" className="portal-comment-edit-action" onClick={() => onEdit(item.id)}><EditIcon size={14} /> Edit</button><button type="button" className="portal-comment-edit-action portal-comment-delete-action" onClick={() => onDelete(item.id)}><DeleteIcon size={14} /> Delete</button></> : null}
            {depth < 3 ? <button type="button" className="portal-comment-reply-action" onClick={() => onReply(item.id)}><MessagesIcon size={14} /> Reply</button> : null}
            {!item.report_limit_reached ? (
              <button type="button" className="portal-comment-report" onClick={() => onReport(item.id)}><ReportIcon size={14} /> Report</button>
            ) : null}
          </div>
          {replyCount > 0 && !repliesExpanded ? (
            <button type="button" className="portal-comment-toggle-replies" onClick={toggleReplies} aria-expanded={false} aria-label={`Show ${formatCompactNumber(replyCount)} replies`}>
              <span>{formatCompactNumber(replyCount)} {replyCount === 1 ? "reply" : "replies"}</span>
              <span className="portal-comment-toggle-arrow" aria-hidden="true"><ArrowDownIcon size={15} /></span>
            </button>
          ) : null}
        </div>
      </div>
      {reportTarget === item.id ? (
        <div className="portal-comment-report-panel portal-comment-thread-report">
          <div className="portal-comment-report-heading">
            <div><strong>Report comment</strong><span className="comment-subtitle">Tell us why this comment should be reviewed.</span></div>
            <div className="portal-comment-report-select">
              <Select
                aria-label="Report reason"
                size="sm"
                fullWidth
                options={[
                  { label: "Spam", value: "spam" },
                  { label: "Abusive", value: "abuse" },
                  { label: "Misinformation", value: "misinformation" },
                  { label: "Other", value: "other" },
                ]}
                value={reportReason}
                onChange={(event) => onReportReasonChange(event.target.value)}
              />
            </div>
          </div>
          <Textarea value={reportDetails} onChange={(event) => onReportDetailsChange(event.target.value)} rows={2} maxLength={500} placeholder="Additional details (optional)" fullWidth size="sm" autoFocus />
          <div className="portal-comment-report-footer">
            <span>{reportDetails.length}/500</span>
            <Button type="button" size="sm" variant="outline" disabled={reporting} onClick={onCancelReport}>Cancel</Button>
            <Button type="button" size="sm" variant="primary" disabled={reporting} onClick={onSubmitReport}>{reporting ? "Sending..." : "Submit report"}</Button>
          </div>
        </div>
      ) : null}
      {replyTarget === item.id ? (
        <div className="portal-comment-inline-reply">
          <Textarea value={replyDraft} onChange={(event) => onReplyDraftChange(event.target.value)} placeholder={`Reply to ${formatAuthorName(item.author_name || "this comment")}...`} rows={2} maxLength={250} fullWidth size="sm" autoFocus />
          {replyModerationIssue ? <p className="portal-comment-moderation-warning" role="alert">{replyModerationIssue}</p> : null}
          <div className="portal-comment-inline-reply-footer">
            <span>{replyDraft.length}/250</span>
            <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={onCancelReply}>Cancel</Button>
            <Button type="button" size="sm" variant="primary" disabled={!replyDraft.trim() || Boolean(replyModerationIssue) || submitting} onClick={onSubmitReply}>Reply</Button>
          </div>
        </div>
      ) : null}
      {repliesExpanded ? (
        <div className="portal-comment-replies">
          <div className="portal-comment-replies-list">
            {visibleReplyItems.map((reply) => (
              <CommentThread
                key={reply.id}
                item={reply}
                depth={depth + 1}
                onReply={onReply}
                onReact={onReact}
                onReport={onReport}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUserId={currentUserId}
                editTarget={editTarget}
                editDraft={editDraft}
                editing={editing}
                onEditDraftChange={onEditDraftChange}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                reportTarget={reportTarget}
                reportReason={reportReason}
                reportDetails={reportDetails}
                reporting={reporting}
                onReportReasonChange={onReportReasonChange}
                onReportDetailsChange={onReportDetailsChange}
                onCancelReport={onCancelReport}
                onSubmitReport={onSubmitReport}
                replyTarget={replyTarget}
                replyDraft={replyDraft}
                onReplyDraftChange={onReplyDraftChange}
                onCancelReply={onCancelReply}
                onSubmitReply={onSubmitReply}
                submitting={submitting}
                expandRepliesForId={expandRepliesForId}
              />
            ))}
          </div>
          <div className="portal-comment-replies-footer">
            <button type="button" className="portal-comment-hide-replies" onClick={toggleReplies} aria-label="Hide replies">
              Hide replies <ArrowUpIcon size={15} />
            </button>
          </div>
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
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [expandRepliesForId, setExpandRepliesForId] = useState<number | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [reportTarget, setReportTarget] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const currentUserId = String(user?.id ?? "");
  const draftModerationIssue = getCommentModerationIssue(draft);
  const replyModerationIssue = getCommentModerationIssue(replyDraft);
  const editModerationIssue = getCommentModerationIssue(editDraft);

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
    if (!trimmed || getCommentModerationIssue(trimmed) || submitting || replySubmitting) return;
    const setRequestSubmitting = parentId ? setReplySubmitting : setSubmitting;
    setRequestSubmitting(true);
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
      if (parentId) {
        setReplyDraft("");
        setExpandRepliesForId(parentId);
      } else setDraft("");
      setReplyTarget(null);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your comment.");
    } finally {
      setRequestSubmitting(false);
    }
  }

  function submitComment(content: string, parentId: number | null) {
    if (!content.trim() || getCommentModerationIssue(content) || submitting || replySubmitting) return;
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

  async function saveCommentEdit() {
    if (!editTarget || !editDraft.trim() || getCommentModerationIssue(editDraft) || editing) return;
    setEditing(true);
    try {
      const response = await authenticatedFetch(getPortalApiUrl(`comments/${editTarget}/`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editDraft.trim() }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.content?.[0] || "Unable to edit your comment.");
      }
      const updated = await response.json();
      setComments((current) => updateComment(current, editTarget, (item) => ({
        ...item,
        content: updated.content,
        edited: updated.edited,
        updated_at: updated.updated_at,
      })));
      setEditTarget(null);
      setEditDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to edit your comment.");
    } finally {
      setEditing(false);
    }
  }

  async function deleteComment() {
    if (!deleteTarget || deleting) return;
    const target = findComment(comments, deleteTarget);
    if (!target || target.user_auth_id !== currentUserId || target.is_admin_reply) {
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);
    setError("");
    try {
      const response = await authenticatedFetch(getPortalApiUrl(`comments/${deleteTarget}/`), {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Unable to delete your comment.");
      }
      setDeleteTarget(null);
      if (editTarget === deleteTarget) {
        setEditTarget(null);
        setEditDraft("");
      }
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete your comment.");
    } finally {
      setDeleting(false);
    }
  }

  function startEditing(commentId: number) {
    const item = findComment(comments, commentId);
    if (!item || item.user_auth_id !== currentUserId || item.is_admin_reply) return;
    setReplyTarget(null);
    setReplyDraft("");
    setReportTarget(null);
    setReportDetails("");
    setEditTarget(commentId);
    setEditDraft(item.content);
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
      await loadComments();
      setError(payload.report_limit_reached ? "Your 3 reports for this comment have been used. Thank you for helping keep the discussion safe." : "Thank you. Your report was submitted.");
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

  const replyTargetItem = replyTarget ? findComment(comments, replyTarget) : null;
  const reportTargetItem = reportTarget ? findComment(comments, reportTarget) : null;
  const editTargetItem = editTarget ? findComment(comments, editTarget) : null;

  useEffect(() => {
    if (!replyTarget) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setReplyTarget(null);
        setReplyDraft("");
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [replyTarget]);

  return (
    <section className="portal-comments-section" aria-labelledby="portal-comments-heading">
      <div className="portal-comments-heading">
        <div>
          <h2 id="portal-comments-heading">Comments</h2>
          <span>
            {formatCompactNumber(comments.length)} {comments.length === 1 ? "comment" : "comments"}
            {" · "}
            {formatCompactNumber(countComments(comments) - comments.length)} {(countComments(comments) - comments.length) === 1 ? "reply" : "replies"}
          </span>
        </div>
        {!loading && comments.length > 0 ? (
          <div className="portal-comments-sort">
            <Select
              aria-label="Sort comments"
              size="sm"
              fullWidth
              options={[
                { label: "Newest first", value: "newest" },
                { label: "Oldest first", value: "oldest" },
              ]}
              value={sort}
              onChange={(event) => setSort(event.target.value as "newest" | "oldest")}
            />
          </div>
        ) : null}
      </div>

      <div className="portal-comment-composer">
        <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a comment..." rows={3} maxLength={500} fullWidth size="md" />
        {draftModerationIssue ? <p className="portal-comment-moderation-warning" role="alert">{draftModerationIssue}</p> : null}
        <div className="portal-comment-composer-footer">
          <span>{draft.length}/500</span>
          <Button size="sm" variant="primary" disabled={!draft.trim() || Boolean(draftModerationIssue) || submitting || replySubmitting} onClick={() => void submitComment(draft, null)}>
            {submitting ? "Posting..." : "Post comment"}
          </Button>
        </div>
      </div>


      {error ? <p className="portal-comments-message" role="status">{error}</p> : null}
      {loading ? <p className="portal-comments-message">Loading comments...</p> : null}
      <div className="portal-comments-list">
        {!loading && !error && comments.length === 0 ? (
          <div className="portal-comments-empty" role="status">
            <span className="portal-comments-empty-icon" aria-hidden="true">✦</span>
            <strong>No comments yet</strong>
            <p>Be the first to share your thoughts.</p>
          </div>
        ) : null}
        {sortedComments.map((item) => (
          <CommentThread
            key={item.id}
            item={item}
            depth={0}
            onReply={(id) => {
              const openReply = () => {
                setReportTarget(null);
                setReportDetails("");
                setEditTarget(null);
                setEditDraft("");
                setReplyTarget(id);
              };
              if (!user) openLogin(openReply);
              else openReply();
            }}
            onReact={(id, reaction) => void reactToComment(id, reaction)}
            onEdit={startEditing}
            onDelete={(id) => setDeleteTarget(id)}
            currentUserId={currentUserId}
            editTarget={editTarget}
            editDraft={editDraft}
            editing={editing}
            onEditDraftChange={setEditDraft}
            onCancelEdit={() => { setEditTarget(null); setEditDraft(""); }}
            onSaveEdit={() => void saveCommentEdit()}
            onReport={(id) => {
              setReplyTarget(null);
              setReplyDraft("");
              setEditTarget(null);
              setEditDraft("");
              reportComment(id);
            }}
            reportTarget={reportTarget}
            reportReason={reportReason}
            reportDetails={reportDetails}
            reporting={reporting}
            onReportReasonChange={setReportReason}
            onReportDetailsChange={setReportDetails}
            onCancelReport={() => setReportTarget(null)}
            onSubmitReport={() => void sendCommentReport()}
            replyTarget={replyTarget}
            replyDraft={replyDraft}
            onReplyDraftChange={setReplyDraft}
            onCancelReply={() => { setReplyTarget(null); setReplyDraft(""); }}
            onSubmitReply={() => { if (replyTarget) void submitComment(replyDraft, replyTarget); }}
            submitting={replySubmitting}
            expandRepliesForId={expandRepliesForId}
          />
        ))}
      </div>

      {deleteTarget !== null && typeof document !== "undefined" ? createPortal(
        <ConfirmDialog
          open
          title="Delete permanently?"
          message="This comment or reply will be permanently deleted. Any replies under it will also be deleted. This action cannot be undone."
          confirmText={deleting ? "Deleting..." : "Delete permanently"}
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
          onCancel={() => { if (!deleting) setDeleteTarget(null); }}
          onConfirm={() => void deleteComment()}
        />,
        document.body,
      ) : null}

      {replyTarget && replyTargetItem ? (
        <div
          className="portal-comment-reply-modal"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setReplyTarget(null);
              setReplyDraft("");
            }
          }}
        >
          <div className="portal-comment-reply-modal-panel" role="dialog" aria-modal="true" aria-labelledby="portal-comment-reply-modal-title">
            <div className="portal-comment-reply-modal-header">
              <div>
                <strong id="portal-comment-reply-modal-title">Reply to {formatAuthorName(replyTargetItem.author_name || "this comment")}</strong>
                <span>{replyTargetItem.content}</span>
              </div>
              <button
                type="button"
                className="portal-comment-reply-modal-close"
                onClick={() => { setReplyTarget(null); setReplyDraft(""); }}
                aria-label="Close reply"
              >
                ×
              </button>
            </div>
            <Textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="Write your reply..." rows={4} maxLength={250} fullWidth size="sm" autoFocus />
            {replyModerationIssue ? <p className="portal-comment-moderation-warning" role="alert">{replyModerationIssue}</p> : null}
            <div className="portal-comment-reply-modal-footer">
              <span>{replyDraft.length}/250</span>
              <Button type="button" size="sm" variant="outline" disabled={replySubmitting} onClick={() => { setReplyTarget(null); setReplyDraft(""); }}>Cancel</Button>
              <Button type="button" size="sm" variant="primary" disabled={!replyDraft.trim() || Boolean(replyModerationIssue) || replySubmitting} onClick={() => { if (replyTarget) void submitComment(replyDraft, replyTarget); }}>
                {replySubmitting ? "Sending..." : "Reply"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editTarget && editTargetItem ? (
        <div
          className="portal-comment-edit-modal"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget && !editing) {
              setEditTarget(null);
              setEditDraft("");
            }
          }}
        >
          <div className="portal-comment-edit-modal-panel" role="dialog" aria-modal="true" aria-labelledby="portal-comment-edit-modal-title">
            <div className="portal-comment-edit-modal-header">
              <div>
                <strong id="portal-comment-edit-modal-title">Edit comment</strong>
                <span>{editTargetItem.content}</span>
              </div>
              <button
                type="button"
                className="portal-comment-reply-modal-close"
                onClick={() => { if (!editing) { setEditTarget(null); setEditDraft(""); } }}
                aria-label="Close edit"
                disabled={editing}
              >
                ×
              </button>
            </div>
            <Textarea
              value={editDraft}
              onChange={(event) => setEditDraft(event.target.value)}
              rows={4}
              maxLength={editTargetItem.parent ? 250 : 500}
              fullWidth
              size="sm"
              autoFocus
            />
            {editModerationIssue ? <p className="portal-comment-moderation-warning" role="alert">{editModerationIssue}</p> : null}
            <div className="portal-comment-reply-modal-footer">
              <span>{editDraft.length}/{editTargetItem.parent ? 250 : 500}</span>
              <Button type="button" size="sm" variant="outline" disabled={editing} onClick={() => { setEditTarget(null); setEditDraft(""); }}>Cancel</Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                disabled={!editDraft.trim() || editDraft.trim() === editTargetItem.content.trim() || Boolean(editModerationIssue) || editing}
                onClick={() => void saveCommentEdit()}
              >
                {editing ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {reportTarget && reportTargetItem ? (
        <div
          className="portal-comment-report-modal"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setReportTarget(null);
              setReportDetails("");
            }
          }}
        >
          <div className="portal-comment-report-modal-panel" role="dialog" aria-modal="true" aria-labelledby="portal-comment-report-modal-title">
            <div className="portal-comment-report-modal-header">
              <div>
                <strong id="portal-comment-report-modal-title">Report comment</strong>
                <span>{reportTargetItem.content}</span>
              </div>
              <button
                type="button"
                className="portal-comment-reply-modal-close"
                onClick={() => { setReportTarget(null); setReportDetails(""); }}
                aria-label="Close report"
              >
                ×
              </button>
            </div>
            <div className="portal-comment-report-modal-reason">
              <label htmlFor="portal-comment-report-reason">Reason for reporting</label>
              <Select
                aria-label="Report reason"
                size="sm"
                fullWidth
                options={[
                  { label: "Spam", value: "spam" },
                  { label: "Abusive", value: "abuse" },
                  { label: "Misinformation", value: "misinformation" },
                  { label: "Other", value: "other" },
                ]}
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              />
            </div>
            <Textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Additional details (optional)" rows={4} maxLength={500} fullWidth size="sm" autoFocus />
            <div className="portal-comment-reply-modal-footer">
              <span>{reportDetails.length}/500</span>
              <Button type="button" size="sm" variant="outline" disabled={reporting} onClick={() => { setReportTarget(null); setReportDetails(""); }}>Cancel</Button>
              <Button type="button" size="sm" variant="primary" disabled={reporting} onClick={() => void sendCommentReport()}>{reporting ? "Sending..." : "Submit report"}</Button>
            </div>
          </div>
        </div>
      ) : null}
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
