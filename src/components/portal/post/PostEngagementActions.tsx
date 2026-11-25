"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "shivanya-auth";
import { BookmarkIcon, Button, CopyIcon, DislikeIcon, FacebookIcon, InstagramIcon, LikeIcon, MailIcon, MoreVerticalIcon, ReportIcon, Select, ShareIcon, TelegramIcon, Textarea, ThreadsIcon, TwitterIcon, WhatsappIcon, LinkedInIcon } from "shivanya-ui";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { formatCompactNumber } from "../../../lib/format-number";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { usePortalAuth } from "../context/PortalAuthContext";
import "./PostEngagementActions.css";

type Props = {
  postId: number;
  title: string;
  placement?: "header" | "footer";
};

type Reaction = "like" | "dislike" | null;

export function PostEngagementActions({ postId, title, placement = "footer" }: Props) {
  const { user } = useAuth();
  const { openLogin } = usePortalAuth();
  const [reaction, setReaction] = useState<Reaction>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userReportCount, setUserReportCount] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Incorrect information");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [message, setMessage] = useState("");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLElement | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = useCallback((nextMessage: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage(nextMessage);
    messageTimerRef.current = setTimeout(() => {
      setMessage("");
      messageTimerRef.current = null;
    }, 5000);
  }, []);

  useEffect(() => () => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
  }, []);

  const loadPostReaction = useCallback(async () => {
    const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/reactions/`), { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setReaction(data.reaction || null);
    setLikes(Number(data.likes_count) || 0);
    setDislikes(Number(data.dislikes_count) || 0);
  }, [postId]);

  const loadSavedState = useCallback(async () => {
    if (!user) {
      setSaved(false);
      return;
    }
    const response = await authenticatedFetch(getPortalApiUrl("saved-posts/"), { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : payload.results || [];
    setSaved(rows.some((item: { id?: number; post?: { id?: number } }) => Number(item.id ?? item.post?.id) === postId));
  }, [user, postId]);

  useEffect(() => { void loadPostReaction(); }, [loadPostReaction]);
  useEffect(() => { void loadSavedState(); }, [loadSavedState]);

  useEffect(() => {
    const syncSavedState = (event: Event) => {
      const detail = (event as CustomEvent<{ postId: number; saved: boolean }>).detail;
      if (detail?.postId === postId) setSaved(detail.saved);
    };
    window.addEventListener("portal-post-saved-state", syncSavedState);
    return () => window.removeEventListener("portal-post-saved-state", syncSavedState);
  }, [postId]);

  const loadPostReportState = useCallback(async () => {
    if (!user) {
      setUserReportCount(0);
      return;
    }
    const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/reports/`), { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    setUserReportCount(Number(payload.user_report_count) || 0);
  }, [user, postId]);

  useEffect(() => { void loadPostReportState(); }, [loadPostReportState]);

  async function sendPostReaction(next: "like" | "dislike") {
    const method = reaction === next ? "DELETE" : "POST";
    const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/reactions/`), {
      method,
      headers: { "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify({ reaction: next }) } : {}),
    });
    if (!response.ok) {
      showMessage("Unable to update your reaction.");
      return;
    }
    const payload = await response.json();
    setReaction(payload.reaction || null);
    setLikes(Number(payload.likes_count) || 0);
    setDislikes(Number(payload.dislikes_count) || 0);
    setMessage("");
  }

  function changeReaction(next: "like" | "dislike") {
    if (!user) {
      openLogin(() => { void sendPostReaction(next); });
      return;
    }
    void sendPostReaction(next);
  }

  async function sendSavedToggle() {
    const response = saved
      ? await authenticatedFetch(getPortalApiUrl(`saved-posts/${postId}/`), { method: "DELETE" })
      : await authenticatedFetch(getPortalApiUrl("saved-posts/"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: postId }),
        });
    if (!response.ok) {
      showMessage("Unable to update saved posts.");
      return;
    }
    const nextSaved = !saved;
    setSaved(nextSaved);
    window.dispatchEvent(new CustomEvent("portal-post-saved-state", { detail: { postId, saved: nextSaved } }));
    setMessage("");
  }

  function toggleSaved() {
    if (!user) {
      openLogin(() => { void sendSavedToggle(); });
      return;
    }
    void sendSavedToggle();
  }

  function closeReport() {
    if (reporting) return;
    setReportOpen(false);
    setReportDetails("");
  }

  async function submitPostReport() {
    if (!reportReason.trim() || reporting) return;
    setReporting(true);
    try {
      const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/reports/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason.trim(),
          details: reportDetails.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showMessage(payload.detail || "Unable to submit your report.");
        return;
      }
      setUserReportCount(Number(payload.user_report_count) || 0);
      setReportOpen(false);
      setReportDetails("");
      showMessage(payload.report_limit_reached
        ? "You have used all 3 reports for this post."
        : "Thank you. Your report has been submitted.");
    } catch {
      showMessage("Unable to submit your report. Please try again.");
    } finally {
      setReporting(false);
    }
  }

  function requestReport() {
    const openReportForm = () => {
      setReportReason("Incorrect information");
      setReportDetails("");
      setReportOpen(true);
    };
    if (!user) {
      openLogin(openReportForm);
      return;
    }
    openReportForm();
  }

  useEffect(() => {
    if (!reportOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReport();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [reportOpen, reporting]);

  async function recordShare(channel: string) {
    let visitorId = "";
    try {
      visitorId = window.localStorage.getItem("shivanyams-visitor-id") || "";
    } catch {
      visitorId = "";
    }
    await authenticatedFetch(getPortalApiUrl(`content/${postId}/shares/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, visitor_id: visitorId }),
    }).catch(() => undefined);
  }

  async function shareTo(channel: string) {
    const url = window.location.href;
    setShareMenuOpen(false);

    if (channel === "native") {
      showMessage("Opening share options...");
      // Count the user's share intent immediately, including when the native
      // share sheet is dismissed without choosing a destination.
      void recordShare("native");
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
        } catch {
          // A dismissed share sheet is still a recorded share action.
        }
      } else if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          showMessage("Post link copied.");
        } catch {
          showMessage("Unable to copy the post link.");
        }
      }
      return;
    }

    if (channel === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        void recordShare("copy");
        showMessage("Post link copied.");
      } catch {
        showMessage("Unable to copy the post link.");
      }
      return;
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const destinations: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      threads: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
    const destination = destinations[channel];
    if (channel === "instagram") {
      try {
        await navigator.clipboard.writeText(url);
        void recordShare("instagram");
        showMessage("Post link copied. Paste it into Instagram to share.");
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      } catch {
        showMessage("Unable to copy the post link for Instagram.");
      }
      return;
    }
    if (!destination) return;
    const labels: Record<string, string> = { whatsapp: "WhatsApp", facebook: "Facebook", telegram: "Telegram", x: "X/Twitter", threads: "Threads", linkedin: "LinkedIn", email: "Email" };
    showMessage(`Opening ${labels[channel] || "share"}...`);
    void recordShare(channel);
    window.open(destination, "_blank", "noopener,noreferrer");
  }
  useEffect(() => {
    if (!shareMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShareMenuOpen(false);
        void recordShare("dismissed");
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShareMenuOpen(false);
        void recordShare("dismissed");
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [shareMenuOpen, postId]);

  return (
    <section ref={shareMenuRef} className={`portal-post-engagement-actions ${placement === "header" ? "is-header" : "is-footer"}`} aria-label="Post actions">
      <div className="portal-post-reaction-actions">
        <button
          type="button"
          className={`portal-action-like${reaction === "like" ? " is-active" : ""}`}
          onClick={() => void changeReaction("like")}
          title="Like"
          aria-label={`Like, ${formatCompactNumber(likes)} likes`}
        >
          <LikeIcon size={19} />
          <strong>{formatCompactNumber(likes)}</strong>
        </button>
        <button
          type="button"
          className={`portal-action-dislike${reaction === "dislike" ? " is-active" : ""}`}
          onClick={() => void changeReaction("dislike")}
          title="Dislike"
          aria-label={`Dislike, ${formatCompactNumber(dislikes)} dislikes`}
        >
          <DislikeIcon size={19} />
        </button>
        <div className="portal-action-share-wrap">
          <button type="button" className="portal-action-share" onClick={() => { if (shareMenuOpen) { setShareMenuOpen(false); void recordShare("dismissed"); } else { setShareMenuOpen(true); } }} title="Share" aria-label="Share post" aria-expanded={shareMenuOpen}>
            <ShareIcon size={19} />
          </button>
          {shareMenuOpen ? (
            <div className="portal-share-menu" role="menu" aria-label="Share this post">
              <button type="button" role="menuitem" onClick={() => void shareTo("copy")} className="portal-share-copy"><CopyIcon size={17} /><span>Copy link</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("whatsapp")} className="portal-share-whatsapp"><WhatsappIcon size={17} /><span>WhatsApp</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("facebook")} className="portal-share-facebook"><FacebookIcon size={17} /><span>Facebook</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("telegram")} className="portal-share-telegram"><TelegramIcon size={17} /><span>Telegram</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("x")} className="portal-share-x"><TwitterIcon size={17} /><span>X/Twitter</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("threads")} className="portal-share-threads"><ThreadsIcon size={17} /><span>Threads</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("instagram")} className="portal-share-instagram"><InstagramIcon size={17} /><span>Instagram</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("linkedin")} className="portal-share-linkedin"><LinkedInIcon size={17} /><span>LinkedIn</span></button>
              <button type="button" role="menuitem" onClick={() => void shareTo("email")} className="portal-share-email"><MailIcon size={17} /><span>Email</span></button>
              {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
                <button type="button" role="menuitem" onClick={() => void shareTo("native")} className="portal-share-more"><MoreVerticalIcon size={17} /><span>More options</span></button>
              ) : null}
            </div>
          ) : null}
        </div>
        <button type="button" className={`portal-action-bookmark${saved ? " is-active" : ""}`} onClick={() => void toggleSaved()} title={saved ? "Saved" : "Save"} aria-label={saved ? "Remove saved post" : "Save post"}>
          <BookmarkIcon size={19} />
        </button>
      </div>
      {placement === "footer" && userReportCount < 3 ? (
        <button type="button" className="portal-action-report" onClick={requestReport} title="Report" aria-label="Report post">
          <ReportIcon size={18} />
          <span>Report</span>
        </button>
      ) : null}
      {message ? <p className="portal-engagement-message" role="status" aria-live="polite">{message}</p> : null}
      {placement === "footer" && reportOpen ? (
        <div
          className="portal-post-report-modal"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeReport();
          }}
        >
          <div
            className="portal-post-report-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-post-report-modal-title"
          >
            <div className="portal-post-report-modal-header">
              <div>
                <strong id="portal-post-report-modal-title">Report post</strong>
                <span>{title}</span>
              </div>
              <button
                type="button"
                className="portal-post-report-modal-close"
                onClick={closeReport}
                disabled={reporting}
                aria-label="Close report"
              >
                ×
              </button>
            </div>
            <div className="portal-post-report-modal-reason">
              <label htmlFor="portal-post-report-reason">Reason for reporting</label>
              <Select
                aria-label="Report reason"
                size="sm"
                fullWidth
                options={[
                  { label: "Incorrect information", value: "Incorrect information" },
                  { label: "Outdated information", value: "Outdated information" },
                  { label: "Inappropriate content", value: "Inappropriate content" },
                  { label: "Broken link", value: "Broken link" },
                  { label: "Other", value: "Other" },
                ]}
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              />
            </div>
            <Textarea
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              placeholder="Additional details (optional)"
              rows={4}
              maxLength={500}
              fullWidth
              size="sm"
              autoFocus
            />
            <div className="portal-post-report-modal-footer">
              <span>{reportDetails.length}/500</span>
              <Button type="button" size="sm" variant="outline" disabled={reporting} onClick={closeReport}>Cancel</Button>
              <Button type="button" size="sm" variant="primary" disabled={reporting} onClick={() => void submitPostReport()}>{reporting ? "Sending..." : "Submit report"}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
