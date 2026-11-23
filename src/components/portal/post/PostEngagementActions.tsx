"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "shivanya-auth";
import { BookmarkIcon, CopyIcon, DislikeIcon, FacebookIcon, InstagramIcon, LikeIcon, MailIcon, MoreVerticalIcon, ReportIcon, ShareIcon, TelegramIcon, ThreadsIcon, TwitterIcon, WhatsappIcon } from "shivanya-ui";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { formatCompactNumber } from "../../../lib/format-number";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { usePortalAuth } from "../context/PortalAuthContext";
import "./PostEngagementActions.css";

type Props = {
  postId: number;
  title: string;
};

type Reaction = "like" | "dislike" | null;

export function PostEngagementActions({ postId, title }: Props) {
  const { user } = useAuth();
  const { openLogin } = usePortalAuth();
  const [reaction, setReaction] = useState<Reaction>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userReportCount, setUserReportCount] = useState(0);
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
    setSaved(!saved);
    setMessage("");
  }

  function toggleSaved() {
    if (!user) {
      openLogin(() => { void sendSavedToggle(); });
      return;
    }
    void sendSavedToggle();
  }

  async function reportPost() {
    const reason = window.prompt(
      "Why are you reporting this post? (Incorrect information, outdated information, inappropriate content, broken links)",
      "Incorrect information",
    );
    if (!reason?.trim()) return;

    const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/reports/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.detail || "Unable to submit your report.");
      return;
    }
    setUserReportCount(Number(payload.user_report_count) || 0);
    setMessage(payload.report_limit_reached
      ? "You have used all 3 reports for this post."
      : "Thank you. Your report has been submitted.");
  }

  function requestReport() {
    if (!user) {
      openLogin(() => { void reportPost(); });
      return;
    }
    void reportPost();
  }

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
    <section ref={shareMenuRef} className="portal-post-engagement-actions" aria-label="Post actions">
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
          <strong>{formatCompactNumber(dislikes)}</strong>
        </button>
        <button type="button" className="portal-action-share" onClick={() => { if (shareMenuOpen) { setShareMenuOpen(false); void recordShare("dismissed"); } else { setShareMenuOpen(true); } }} title="Share" aria-label="Share post" aria-expanded={shareMenuOpen}>
          <ShareIcon size={19} />
        </button>
        <button type="button" className={`portal-action-bookmark${saved ? " is-active" : ""}`} onClick={() => void toggleSaved()} title={saved ? "Saved" : "Save"} aria-label={saved ? "Remove saved post" : "Save post"}>
          <BookmarkIcon size={19} />
        </button>
        {userReportCount < 3 ? (
          <button type="button" className="portal-action-report" onClick={requestReport} title="Report" aria-label="Report post">
            <ReportIcon size={19} />
          </button>
        ) : null}
      </div>
      {shareMenuOpen ? (
        <div className="portal-share-menu" role="menu" aria-label="Share this post">
          <button type="button" role="menuitem" onClick={() => void shareTo("copy")}><CopyIcon size={17} /><span>Copy link</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("whatsapp")}><WhatsappIcon size={17} /><span>WhatsApp</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("facebook")}><FacebookIcon size={17} /><span>Facebook</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("telegram")}><TelegramIcon size={17} /><span>Telegram</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("x")}><TwitterIcon size={17} /><span>X/Twitter</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("threads")}><ThreadsIcon size={17} /><span>Threads</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("instagram")}><InstagramIcon size={17} /><span>Instagram</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("linkedin")}><InstagramIcon size={17} /><span>LinkedIn</span></button>
          <button type="button" role="menuitem" onClick={() => void shareTo("email")}><MailIcon size={17} /><span>Email</span></button>
          {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
            <button type="button" role="menuitem" onClick={() => void shareTo("native")}><MoreVerticalIcon size={17} /><span>More options</span></button>
          ) : null}
        </div>
      ) : null}
      {message ? <p className="portal-engagement-message" role="status" aria-live="polite">{message}</p> : null}
    </section>
  );
}
