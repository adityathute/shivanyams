"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "shivanya-auth";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
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
  const [message, setMessage] = useState("");

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

  async function sendPostReaction(next: "like" | "dislike") {
    const method = reaction === next ? "DELETE" : "POST";
    const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/reactions/`), {
      method,
      headers: { "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify({ reaction: next }) } : {}),
    });
    if (!response.ok) {
      setMessage("Unable to update your reaction.");
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
      setMessage("Unable to update saved posts.");
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
    setMessage(payload.already_reported ? "You have already reported this post." : "Thank you. Your report has been submitted.");
  }

  function requestReport() {
    if (!user) {
      openLogin(() => { void reportPost(); });
      return;
    }
    void reportPost();
  }

  async function sharePost() {
    const url = window.location.href;
    let channel = "copy";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        channel = "native";
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMessage("Post link copied.");
      } else {
        setMessage("Sharing is not available in this browser.");
        return;
      }
    } catch {
      return;
    }
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

  return (
    <section className="portal-post-engagement-actions" aria-label="Post actions">
      <div className="portal-post-reaction-actions">
        <button type="button" className={reaction === "like" ? "is-active" : ""} onClick={() => void changeReaction("like")} aria-label={`Like, ${likes} likes`}>
          <span aria-hidden="true">↑</span><span>Like</span><strong>{likes.toLocaleString()}</strong>
        </button>
        <button type="button" className={reaction === "dislike" ? "is-active" : ""} onClick={() => void changeReaction("dislike")} aria-label={`Dislike, ${dislikes} dislikes`}>
          <span aria-hidden="true">↓</span><span>Dislike</span><strong>{dislikes.toLocaleString()}</strong>
        </button>
        <button type="button" onClick={() => void sharePost()}><span aria-hidden="true">↗</span><span>Share</span></button>
        <button type="button" className={saved ? "is-active" : ""} onClick={() => void toggleSaved()}><span aria-hidden="true">▣</span><span>{saved ? "Saved" : "Save"}</span></button>
        <button type="button" onClick={requestReport}><span aria-hidden="true">⚑</span><span>Report</span></button>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}
