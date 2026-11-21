"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
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

type StatKey = "likes" | "dislikes" | "comments" | "shares" | "saved" | "subscribers" | "reports";

const statLabels: { key: StatKey; label: string; icon: string }[] = [
  { key: "likes", label: "Likes", icon: "↑" },
  { key: "dislikes", label: "Dislikes", icon: "↓" },
  { key: "comments", label: "Comments", icon: "◌" },
  { key: "shares", label: "Shares", icon: "↗" },
  { key: "saved", label: "Saved", icon: "▣" },
  { key: "subscribers", label: "Subscribers", icon: "✉" },
  { key: "reports", label: "Reports", icon: "⚑" },
];

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" && value.includes("T")) {
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

  const selectedRows = useMemo(() => {
    if (!payload) return [];
    const details = payload.details;
    if (selected === "likes") {
      return [
        ...details.post_reactions.filter((row) => row.reaction === "like").map((row) => ({ ...row, target: "Post" })),
        ...details.comment_reactions.filter((row) => row.reaction === "like").map((row) => ({ ...row, target: `Comment #${row.comment_id}` })),
      ];
    }
    if (selected === "dislikes") {
      return [
        ...details.post_reactions.filter((row) => row.reaction === "dislike").map((row) => ({ ...row, target: "Post" })),
        ...details.comment_reactions.filter((row) => row.reaction === "dislike").map((row) => ({ ...row, target: `Comment #${row.comment_id}` })),
      ];
    }
    return details[selected] || [];
  }, [payload, selected]);

  if (loading || !isAdmin) return null;

  const selectedLabel = statLabels.find((item) => item.key === selected)?.label || "Details";
  const columns = selectedRows.length ? Array.from(new Set(selectedRows.flatMap((row) => Object.keys(row)))) : [];

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">POST ENGAGEMENT</span>
            <h1>{payload?.post.title || "Post statistics"}</h1>
            <p>Overall post and discussion engagement, with individual activity records.</p>
          </div>
          <div className="admin-top-actions">
            <Link href="/admin" className="admin-secondary-button">← Back to posts</Link>
            <Link href="/admin/comments" className="admin-secondary-button">Comments & reports</Link>
          </div>
        </header>

        {error ? <div className="admin-error">{error}</div> : null}
        {loadingData ? <div className="admin-empty">Loading engagement...</div> : payload ? (
          <>
            <section className="admin-engagement-stats">
              {statLabels.map((item) => {
                const raw = payload[item.key];
                const value = typeof raw === "number" ? raw : raw.total;
                return (
                  <button type="button" key={item.key} className={`admin-engagement-stat${selected === item.key ? " is-selected" : ""}`} onClick={() => setSelected(item.key)}>
                    <span><i>{item.icon}</i>{item.label}<small>↗</small></span>
                    <strong>{Number(value || 0).toLocaleString("en-IN")}</strong>
                  </button>
                );
              })}
            </section>

            <section className="admin-post-panel admin-engagement-details">
              <div className="admin-panel-heading">
                <div>
                  <h2>{selectedLabel} details</h2>
                  {selected === "likes" || selected === "dislikes" ? (
                    <p>Post: {payload[selected].post} · Comments and replies: {payload[selected].comments_and_replies} · Overall: {payload[selected].total}</p>
                  ) : selected === "comments" ? (
                    <p>{payload.comments.approved} approved · {payload.comments.hidden} hidden · {payload.comments.total} total</p>
                  ) : <p>{selectedRows.length} records available in this detail list.</p>}
                </div>
              </div>
              {!selectedRows.length ? <div className="admin-empty">No {selectedLabel.toLowerCase()} recorded yet.</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-post-table">
                    <thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead>
                    <tbody>
                      {selectedRows.map((row, index) => (
                        <tr key={String(row.id ?? row.user_auth_id ?? row.reporter_auth_id ?? index) + "-" + index}>
                          {columns.map((column) => <td key={column}>{displayValue(row[column])}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : <div className="admin-empty">No engagement data available.</div>}
      </div>
      <footer className="admin-footer">ShivanyaMS · Post Engagement</footer>
    </main>
  );
}
