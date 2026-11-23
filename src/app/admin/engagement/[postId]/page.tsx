"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import {
  StocksIcon,
  BookmarkIcon,
  MessagesIcon,
  DislikeIcon,
  LikeIcon,
  ReportIcon,
  ShareIcon,
  UsersIcon,
  RefreshIcon,
} from "shivanya-ui";
import { API_URL } from "../../../../components/portal/category/CategoryGrid";
import { adminFetch } from "../../admin-utils";
import "../../admin.css";
import "./engagement.css";

type DetailRow = Record<string, unknown>;
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
  { key: "all", label: "All Statistics", color: "all", icon: <StocksIcon size={18} /> },
  { key: "likes", label: "Likes", color: "likes", icon: <LikeIcon size={18} /> },
  { key: "dislikes", label: "Dislikes", color: "dislikes", icon: <DislikeIcon size={18} /> },
  { key: "comments", label: "Comments", color: "comments", icon: <MessagesIcon size={18} /> },
  { key: "shares", label: "Shares", color: "shares", icon: <ShareIcon size={18} /> },
  { key: "saved", label: "Saved", color: "saved", icon: <BookmarkIcon size={18} /> },
  { key: "subscribers", label: "Subscribers", color: "subscribers", icon: <UsersIcon size={18} /> },
  { key: "reports", label: "Reports", color: "reports", icon: <ReportIcon size={18} /> },
];

const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

function formatCompactNumber(value: number) {
  return compactNumberFormat.format(Number(value) || 0).replace("K", "k").replace("M", "m").replace("B", "b");
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return formatCompactNumber(value);
  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }
  return String(value);
}

function isContentColumn(column: string) {
  return /(^|_)(content|body|message|text|description|comment)(_|$)/i.test(column) ||
    /comment.*(content|text|body)|^(content|body|message|text|description)$/i.test(column);
}

function getRowContent(row: DetailRow) {
  const contentEntries = Object.entries(row)
    .filter(([key, value]) => isContentColumn(key) && typeof value === "string" && value.trim())
    .sort(([a], [b]) => {
      const priority = (key: string) => /comment.*(content|text|body)|^(comment|comment_content)$/i.test(key) ? 0
        : /^(content|body|message|text|description)$/i.test(key) ? 1 : 2;
      return priority(a) - priority(b);
    });
  return contentEntries.length ? String(contentEntries[0][1]) : "";
}

function titleCaseName(value: string) {
  return value.trim().toLocaleLowerCase().replace(/(^|[\s'-])([\p{L}])/gu, (_, separator, letter) => separator + letter.toLocaleUpperCase());
}

function getUserLabel(row: DetailRow) {
  const identityObjects: Record<string, unknown>[] = [row];
  for (const key of ["user", "author", "reporter", "profile", "created_by", "subscriber"]) {
    const value = row[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      identityObjects.push(value as Record<string, unknown>);
    }
  }

  const readText = (source: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  };

  const firstNameKeys = ["first_name", "firstName", "user_first_name", "author_first_name", "reporter_first_name"];
  const lastNameKeys = ["last_name", "lastName", "user_last_name", "author_last_name", "reporter_last_name"];
  const fullNameKeys = ["full_name", "fullname", "display_name", "displayName", "name", "user_name", "author_name", "reporter_name"];

  for (const identity of identityObjects) {
    const firstName = readText(identity, firstNameKeys);
    const lastName = readText(identity, lastNameKeys);
    const fullName = [firstName, lastName].filter(Boolean).join(" ") ||
      readText(identity, fullNameKeys);
    if (fullName) return titleCaseName(fullName);
  }

  // Some API responses flatten related fields with prefixes or double underscores.
  const flatFirstName = readText(row, ["user__first_name", "author__first_name", "reporter__first_name"]);
  const flatLastName = readText(row, ["user__last_name", "author__last_name", "reporter__last_name"]);
  const flatFullName = [flatFirstName, flatLastName].filter(Boolean).join(" ") ||
    readText(row, ["user__full_name", "user__name", "author__name", "reporter__name"]);
  if (flatFullName) return titleCaseName(flatFullName);

  for (const identity of identityObjects) {
    const email = readText(identity, ["email", "email_address", "user_email", "author_email", "reporter_email"]);
    if (email) return email;
  }
  return readText(row, ["user__email", "author__email", "reporter__email"]) || "—";
}

function isUserIdentityColumn(column: string) {
  return /(^|_)(first_name|last_name|name|email|email_address)$/i.test(column) ||
    /^(author|reporter)_(first_name|last_name|name)$/i.test(column);
}

function getColumnWidth(column: string, rows: DetailRow[]) {
  const key = column.toLowerCase();
  if (isContentColumn(column)) return 520;
  if (key === "activity") return 190;
  if (key === "user") return 360;
  if (key === "target") return 240;
  if (key === "status") return 190;
  if (key === "details" || key === "detail") return 480;
  const values = rows.map((row) => String(row[column] ?? ""));
  const longest = Math.min(36, Math.max(column.length, ...values.map((value) => value.length)));
  if (/date|time|created|updated|at$/.test(key)) return 190;
  if (/url|link/.test(key)) return 240;
  return Math.min(220, Math.max(110, longest * 7 + 36));
}

export default function AdminPostEngagementPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [payload, setPayload] = useState<EngagementPayload | null>(null);
  const [selected, setSelected] = useState<StatKey>("all");
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin || !params.postId) return;
    let active = true;
    setLoadingData(true);
    setError("");
    adminFetch(API_URL + "/admin/content/" + params.postId + "/engagement/?details=1", { cache: "no-store" })
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
  }, [isAdmin, params.postId, refreshKey]);

  const selectedRows = useMemo<DetailRow[]>(() => {
    if (!payload) return [];
    const details = payload.details;
    const reactionRows = (reaction: "like" | "dislike") => [
      ...details.post_reactions.filter((row) => row.reaction === reaction).map((row) => ({ ...row, target: "Post", activity: reaction === "like" ? "Like" : "Dislike" })),
      ...details.comment_reactions.filter((row) => row.reaction === reaction).map((row) => ({ ...row, target: "Comment", activity: reaction === "like" ? "Like" : "Dislike" })),
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
  }, [payload, selected]);

  if (loading || !isAdmin) return null;

  const tableRows = selectedRows.map((row) => {
    const content = getRowContent(row);
    const normalized = Object.fromEntries(
      Object.entries(row).filter(([key]) => !isContentColumn(key))
    );
    return {
      ...normalized,
      user: getUserLabel(row),
      ...(content ? { content } : {}),
    };
  });
  const pageCount = Math.max(1, Math.ceil(tableRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRows = tableRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const selectedStat = statLabels.find((item) => item.key === selected) || statLabels[0];
  const selectedLabel = selectedStat.label;
  const detailDescription = (() => {
    switch (selected) {
      case "all":
        return "A complete overview of every recorded interaction with this post, including likes, dislikes, comments, shares, saves, subscribers, and reports.";
      case "likes":
        return `People who liked this post or its comments and replies. ${formatCompactNumber(payload?.likes.post || 0)} post likes · ${formatCompactNumber(payload?.likes.comments_and_replies || 0)} comment and reply likes.`;
      case "dislikes":
        return `People who disliked this post or its comments and replies. ${formatCompactNumber(payload?.dislikes.post || 0)} post dislikes · ${formatCompactNumber(payload?.dislikes.comments_and_replies || 0)} comment and reply dislikes.`;
      case "comments":
        return `Comments submitted on this post. ${formatCompactNumber(payload?.comments.approved || 0)} approved · ${formatCompactNumber(payload?.comments.hidden || 0)} hidden.`;
      case "shares":
        return "People who shared this post, with the available sharing details and timestamps.";
      case "saved":
        return "People who saved this post to revisit it later.";
      case "subscribers":
        return "People who subscribed to updates from this post or its publisher.";
      case "reports":
        return "Reports submitted about this post, including the available reason and review details.";
      default:
        return "A record of activity associated with this post.";
    }
  })();
  const columns = tableRows.length
    ? Array.from(new Set(tableRows.flatMap((row) => Object.keys(row))))
      .filter((column) => column === "activity" || column === "user" || column === "content" ||
        (column.toLowerCase() !== "id" &&
          !column.toLowerCase().endsWith("_id") &&
          column.toLowerCase() !== "reaction" &&
          !isContentColumn(column) &&
          !isUserIdentityColumn(column)))
      .sort((a, b) => {
        const order = ["activity", "user", "target", "status", "details"];
        const aKey = a.toLowerCase();
        const bKey = b.toLowerCase();
        const aIndex = order.indexOf(aKey);
        const bIndex = order.indexOf(bKey);
        if (aIndex !== -1 || bIndex !== -1) {
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        }
        const aCreated = /^(created_at|created|date_created)$/i.test(a);
        const bCreated = /^(created_at|created|date_created)$/i.test(b);
        if (aCreated !== bCreated) return aCreated ? 1 : -1;
        return 0;
      })
    : [];
  const allStatsTotal = payload
    ? payload.likes.total + payload.dislikes.total + payload.comments.total + payload.shares + payload.saved + payload.subscribers + payload.reports
    : 0;

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
            <Link href="/admin" className="admin-secondary-button">← Back to dashboard</Link>
            <button
              type="button"
              className="admin-refresh-button"
              onClick={() => setRefreshKey((value) => value + 1)}
              disabled={loadingData}
              aria-label="Refresh engagement data"
              title="Refresh"
            >
              <RefreshIcon size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {error ? <div className="admin-error">{error}</div> : null}
        {loadingData ? <div className="admin-empty">Loading engagement...</div> : payload ? (
          <>
            <section className="admin-engagement-stats" aria-label="Post statistics">
              {statLabels.map((item) => {
                const raw = item.key === "all" ? allStatsTotal : payload[item.key];
                const value = typeof raw === "number" ? raw : raw.total;
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={"admin-engagement-stat stat-" + item.color + (selected === item.key ? " is-selected" : "")}
                    onClick={() => { setSelected(item.key); setPage(1); }}
                  >
                    <span><i>{item.icon}</i>{item.label}</span>
                    <strong>{formatCompactNumber(value)}</strong>
                  </button>
                );
              })}
            </section>

            <section className="admin-post-panel admin-engagement-details">
              <div className="admin-panel-heading">
                <div>
                  <h2 className={"admin-engagement-details-title stat-" + selectedStat.color}><i>{selectedStat.icon}</i><span>{selectedLabel} details</span></h2>
                  <p>{detailDescription} {formatCompactNumber(selectedRows.length)} {selectedRows.length === 1 ? "record" : "records"} shown below.</p>
                </div>
              </div>
              {!selectedRows.length ? (
                <div className="admin-empty admin-engagement-empty">No {selectedLabel.toLowerCase()} recorded yet.</div>
              ) : (
                <div className="admin-engagement-table-wrap">
                  <table className="admin-engagement-data-table">
                    <colgroup>{columns.map((column) => <col key={column} style={{ width: getColumnWidth(column, selectedRows) }} />)}</colgroup>
                    <thead><tr>{columns.map((column) => <th key={column}>{column === "content" ? "Content" : column === "user" ? "User" : column.replaceAll("_", " ")}</th>)}</tr></thead>
                    <tbody>
                      {visibleRows.map((row, index) => (
                        <tr key={String(row.id ?? row.user_auth_id ?? row.reporter_auth_id ?? index) + "-" + index}>
                          {columns.map((column) => {
                            const value = displayValue(row[column]);
                            return <td key={column} className={column === "user" ? "admin-engagement-user-cell" : isContentColumn(column) ? "admin-engagement-content-cell" : undefined}><span className={"admin-engagement-cell-value" + (isContentColumn(column) ? " is-content" : "")} title={value}>{value}</span></td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedRows.length > 0 && (
                <div className="admin-engagement-table-footer">
                  <span>
                    Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, selectedRows.length)} of {selectedRows.length} records
                  </span>
                  <div className="admin-engagement-pagination">
                    <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page">
                      <option value={10}>10 rows</option>
                      <option value={15}>15 rows</option>
                      <option value={25}>25 rows</option>
                      <option value={50}>50 rows</option>
                    </select>
                    <button type="button" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
                    <span>Page {safePage} of {pageCount}</span>
                    <button type="button" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
                  </div>
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
