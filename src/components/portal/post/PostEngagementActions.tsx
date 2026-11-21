"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "shivanya-auth";
import { Button } from "shivanya-ui";
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
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState("");
  const [message, setMessage] = useState("");

  const loadPostReaction = useCallback(async () => {
    const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/reactions/`), { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setReaction(data.reaction || null);
    setLikes(Number(data.likes_count) || 0);
    setDislikes(Number(data.dislikes_count) || 0);
  }, [postId]);

  const loadUserActions = useCallback(async () => {
    if (!user) {
      setSaved(false);
      setSubscribed(false);
      setSubscriptionEmail("");
      return;
    }
    const [savedResponse, subscriptionResponse] = await Promise.all([
      authenticatedFetch(getPortalApiUrl("saved-posts/"), { cache: "no-store" }),
      authenticatedFetch(getPortalApiUrl(`content/${postId}/subscribe/`), { cache: "no-store" }),
    ]);
    if (savedResponse.ok) {
      const payload = await savedResponse.json();
      const rows = Array.isArray(payload) ? payload : payload.results || [];
      setSaved(rows.some((item: { id?: number; post?: { id?: number } }) => Number(item.id ?? item.post?.id) === postId));
    }
    if (subscriptionResponse.ok) {
      const payload = await subscriptionResponse.json();
      setSubscribed(Boolean(payload.subscribed));
      setSubscriptionEmail(payload.email || "");
    }
  }, [user, postId]);

  useEffect(() => {
    void loadPostReaction();
  }, [loadPostReaction]);

  useEffect(() => {
    void loadUserActions();
  }, [loadUserActions]);

  async function changeReaction(next: "like" | "dislike") {
    if (!user) {
      openLogin(() => { void changeReaction(next); });
      return;
    }
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

  async function toggleSaved() {
    if (!user) {
      openLogin(() => { void toggleSaved(); });
      return;
    }
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

  async function toggleSubscription() {
    if (!user) {
      openLogin(() => { void toggleSubscription(); });
      return;
    }
    const response = await authenticatedFetch(getPortalApiUrl(`content/${postId}/subscribe/`), {
      method: subscribed ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.email?.[0] || payload.detail || "Unable to update subscription.");
      return;
    }
    setSubscribed(Boolean(payload.subscribed));
    setSubscriptionEmail(payload.email || "");
    setMessage(payload.subscribed ? `Subscribed with ${payload.email}.` : "You have unsubscribed from this post.");
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
    const visitorId = window.localStorage.getItem("shivanyams-visitor-id") || "";
    await authenticatedFetch(getPortalApiUrl(`content/${postId}/shares/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, visitor_id: visitorId }),
    }).catch(() => undefined);
  }

  return (
    <section className="portal-post-engagement-actions" aria-label="Post actions">
      <div className="portal-post-reaction-actions">
        <button type="button" className={reaction === "like" ? "is-active" : ""} onClick={() => void changeReaction("like")}>
          <span aria-hidden="true">↑</span> Like <strong>{likes.toLocaleString()}</strong>
        </button>
        <button type="button" className={reaction === "dislike" ? "is-active" : ""} onClick={() => void changeReaction("dislike")}>
          <span aria-hidden="true">↓</span> Dislike <strong>{dislikes.toLocaleString()}</strong>
        </button>
        <button type="button" onClick={() => void sharePost()}><span aria-hidden="true">↗</span> Share</button>
        <button type="button" className={saved ? "is-active" : ""} onClick={() => void toggleSaved()}><span aria-hidden="true">▣</span> {saved ? "Saved" : "Save"}</button>
      </div>
      <div id="post-subscribe" className="portal-post-subscribe-action">
        <div>
          <strong>{subscribed ? "Post updates enabled" : "Get post updates"}</strong>
          <span>{subscribed ? subscriptionEmail : "Receive email when this post is updated."}</span>
        </div>
        <Button size="sm" variant="primary" onClick={() => void toggleSubscription()}>
          {subscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}
