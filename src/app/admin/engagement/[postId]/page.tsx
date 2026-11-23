"use client";

import { useEffect, useMemo, useState } from "react";\nimport type { ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { AllStatisticsIcon, BookmarkIcon, CommentIcon, DislikeIcon, LikeIcon, ReportIcon, ShareIcon, SubscribeIcon } from "shivanya-ui";
import { API_URL } from "../../../../components/portal/category/CategoryGrid";
import { adminFetch } from "../../admin-utils";
import "../../admin.css";
import "./engagement.css";

type DetailRow = Record<string, string | number | boolean | null | undefined>;
type EngagementPayload = {
  post: { id: number; title: string };
  likes: { total: number; post: number; comments_and_replies: number };
  dislikes: { total: number; post: number; comments_and_replies: number };
  comments: { total: number; approved: number; hidden: number };
  shares: number;
  saved: number;
  subscribers: number;
  reports: number;
  details: {
    post_reactions: DetailRow[];
    comment_reactions: DetailRow[];
    comments: DetailRow[];
    shares: DetailRow[];
    saved: DetailRow[];
    subscribers: DetailRow[];
    reports: DetailRow[];
  };
};

type StatKey = "all" | "likes" | "dislikes" | "comments" | "shares" | "saved" | "subscribers" | "reports";

const statLabels: { key: StatKey; label: string; color: string; icon: ReactNode }[] = [
  { key: "all", label: "All Statistics", color: "all", icon: <AllStatisticsIcon size={18} /> },
  { key: "likes", label: "Likes", color: "likes", icon: <LikeIcon size={18} /> },
  { key: "dislikes", label: "Dislikes", color: "dislikes", icon: <DislikeIcon size={18} /> },
  { key: "comments", label: "Comments", color: "comments", icon: <CommentIcon size={18} /> },
  { key: "shares", label: "Shares", color: "shares", icon: <ShareIcon size={18} /> },
  { key: "saved", label: "Saved", color: "saved", icon: <BookmarkIcon size={18} /> },
  { key: "subscribers", label: "Subscribers", color: "subscribers", icon: <SubscribeIcon size={18} /> },
  { key: "reports", label: "Reports", color: "reports", icon: <ReportIcon size={18} /> },
];

const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

function formatCompactNumber(value: number) {
  return compactNumberFormat.format(Number(value) || 0);
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return formatCompactNumber(value);\n  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }
  return String(value);
}

export default function AdminPostEngagementPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [payload, setPayload] = useState<EngagementPayload | null>(null);
  const [selected, setSelected] = useState<StatKey>("likes");
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin || !params.postId) return;
    let active = true;
    setLoadingData(true);
    adminFetch(`${API_URL}/admin/content/${params.postId}/engagement/?details=1`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || "Unable to load engagement details.");
        }
        return response.json();
      })
      .then((data: EngagementPayload) => { if (active) setPayload(data); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load engagement."); })
      .finally(() => { if (active) setLoadingData(false); });
    return () => { active = false; };
  }, [isAdmin, params.postId]);

  const selectedRows = useMemo<DetailRow[]>(() => {
    if (!payload) return [];
    const details = payload.details;
    const reactionRows = (reaction: "like" | "dislike") => [
      ...details.post_reactions.filter((row) => row.reaction === reaction).map((row) => ({ ...row, target: "Post", activity: reaction === "like" ? "Like" : "Dislike" })),
      ...details.comment_reactions.filter((row) => row.reaction === reaction).map((row) => ({ ...row, target: `Comment #${row.comment_id}`, activity: reaction === "like" ? "Like" : "Dislike" })),
    ];
    if (selected === "likes") return reactionRows("like");
    if (selected === "dislikes") return reactionRows("dislike");
    if (selected === "all") {
      return [
        ...reactionRows("like"),
        ...reactionRows("dislike"),
        ...details.comments.map((row) => ({ ...row, activity: "Comment" })),
        ...details.shares.map((row) => ({ ...row, activity: "Share" })),
        ...details.saved.map((row) => ({ ...row, activity: "Saved" })),
        ...details.subscribers.map((row) => ({ ...row, activity: "Subscriber" })),
        ...details.reports.map((row) => ({ ...row, activity: "Report" })),
      ];
    }
    return details[selected] || [];            <section className="admin-engagement-stats" aria-label="Post statistics">
              {statLabels.map((item) => {
                const raw = item.key === "all" ? allStatsTotal : payload[item.key];
                const value = typeof raw === "number" ? raw : raw.total;
                return (
                  <button type="button" key={item.key} className={`admin-engagement-stat stat-${item.color}${selected === item.key ? " is-selected" : ""}`} onClick={() => setSelected(item.key)}>
                    <span><i>{item.icon}</i>{item.label}</span>
                    <strong>{formatCompactNumber(value)}</strong>
                  </button>
                );
              })}
            </section>nt";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import { AllStatisticsIcon, BookmarkIcon, CommentIcon, DislikeIcon, LikeIcon, ReportIcon, ShareIcon, SubscribeIcon } from "shivanya-ui";
import { API_URL } from "../../../../components/portal/category/CategoryGrid";
import { adminFetch } from "../../admin-utils";
import "../../admin.css";
import "./engagement.css";

type DetailRow = Record<string, string | number | boolean | null | undefined>;
type EngagementPayload = {
  post: { id: number; title: string };
  likes: { total: number; post: number; comments_and_replies: number };
  dislikes: { total: number; post: number; comments_and_replies: number };
  comments: { total: number; approved: number; hidden: number };
  shares: number;
  saved: number;
  subscribers: number;
  reports: number;
  details: {
    post_reactions: DetailRow[];
    comment_reactions: DetailRow[];
    comments: DetailRow[];
    shares: DetailRow[];
    saved: DetailRow[];
    subscribers: DetailRow[];
    reports: DetailRow[];
  };
};

type StatKey = "all" | "likes" | "dislikes" | "comments" | "shares" | "saved" | "subscribers" | "reports";

const statLabels: { key: StatKey; label: string; color: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All Statistics", color: "all", icon: <AllStatisticsIcon size={18} /> },
  { key: "likes", label: "Likes", color: "likes", icon: <LikeIcon size={18} /> },
  { key: "dislikes", label: "Dislikes", color: "dislikes", icon: <DislikeIcon size={18} /> },
  { key: "comments", label: "Comments", color: "comments", icon: <CommentIcon size={18} /> },
  { key: "shares", label: "Shares", color: "shares", icon: <ShareIcon size={18} /> },
  { key: "saved", label: "Saved", color: "saved", icon: <BookmarkIcon size={18} /> },
  { key: "subscribers", label: "Subscribers", color: "subscribers", icon: <SubscribeIcon size={18} /> },
  { key: "reports", label: "Reports", color: "reports", icon: <ReportIcon size={18} /> },
];

const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

function formatCompactNumber(value: number) {
  return compactNumberFormat.format(Number(value) || 0);
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return formatCompactNumber(value);\n  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }
  return String(value);
}

export default function AdminPostEngagementPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [payload, setPayload] = useState<EngagementPayload | null>(null);
  const [selected, setSelected] = useState<StatKey>("likes");
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin || !params.postId) return;
    let active = true;
    setLoadingData(true);
    adminFetch(`${API_URL}/admin/content/${params.postId}/engagement/?details=1`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || "Unable to load engagement details.");
        }
        return response.json();
      })
      .then((data: EngagementPayload) => { if (active) setPayload(data); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load engagement."); })
      .finally(() => { if (active) setLoadingData(false); });
    return () => { active = false; };
  }, [isAdmin, params.postId]);

  const selectedRows = useMemo<DetailRow[]>(() => {
    if (!payload) return [];
    const details = payload.details;
    const reactionRows = (reaction: "like" | "dislike") => [
      ...details.post_reactions.filter((row) => row.reaction === reaction).map((row) => ({ ...row, target: "Post", activity: reaction === "like" ? "Like" : "Dislike" })),
      ...details.comment_reactions.filter((row) => row.reaction === reaction).map((row) => ({ ...row, target: `Comment #${row.comment_id}`, activity: reaction === "like" ? "Like" : "Dislike" })),
    ];
    if (selected === "likes") return reactionRows("like");
    if (selected === "dislikes") return reactionRows("dislike");
    if (selected === "all") {
      return [
        ...reactionRows("like"),
        ...reactionRows("dislike"),
        ...details.comments.map((row) => ({ ...row, activity: "Comment" })),
        ...details.shares.map((row) => ({ ...row, activity: "Share" })),
        ...details.saved.map((row) => ({ ...row, activity: "Saved" })),
        ...details.subscribers.map((row) => ({ ...row, activity: "Subscriber" })),
        ...details.reports.map((row) => ({ ...row, activity: "Report" })),
      ];
    }
    return details[selected] || [];
