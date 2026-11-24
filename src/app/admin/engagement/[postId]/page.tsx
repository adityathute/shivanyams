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
  ArrowLeftIcon,
} from "shivanya-ui";
import { API_URL } from "../../../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "../../admin-utils";
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
  users: number;
  reports: number;
  details: {
    post_reactions: DetailRow[];
    comment_reactions: DetailRow[];
    comments: DetailRow[];
    shares: DetailRow[];
    saved: DetailRow[];
    reports: DetailRow[];
  };
};

type StatKey = "all" | "likes" | "dislikes" | "comments" | "shares" | "saved" | "reports" | "users";

const statLabels: { key: StatKey; label: string; color: string; icon: ReactNode }[] = [
  { key: "all", label: "All Statistics", color: "all", icon: <StocksIcon size={18} /> },
  { key: "likes", label: "Likes", color: "likes", icon: <LikeIcon size={18} /> },
  { key: "dislikes", label: "Dislikes", color: "dislikes", icon: <DislikeIcon size={18} /> },
  { key: "comments", label: "Comments", color: "comments", icon: <MessagesIcon size={18} /> },
  { key: "shares", label: "Shares", color: "shares", icon: <ShareIcon size={18} /> },
  { key: "saved", label: "Saved", color: "saved", icon: <BookmarkIcon size={18} /> },
  { key: "reports", label: "Reports", color: "reports", icon: <ReportIcon size={18} /> },
  { key: "users", label: "Users", color: "users", icon: <UsersIcon size={18} /> },
];

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

function shareChannelLabel(value: unknown) {
  const channel = String(value || "other").trim().toLowerCase();
  const labels: Record<string, string> = {
    copy: "Copy Link",
    native: "Native Share",
    dismissed: "Share Menu Closed",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    telegram: "Telegram",
    x: "X",
    twitter: "X",
    linkedin: "LinkedIn",
    email: "Email",
  };
  return labels[channel] || (channel === "other" ? "Other" : channel.charAt(0).toUpperCase() + channel.slice(1));
}

function titleCaseName(value: string) {
  return value.trim().toLocaleLowerCase().replace(/(^|[\s'-])([\p{L}])/gu, (_, separator, letter) => separator + letter.toLocaleUpperCase());
}

function getUserLabel(row: DetailRow) {
  const identityObjects: Record<string, unknown>[] = [row];
  for (const key of ["user", "author", "reporter", "profile", "created_by"]) {
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
  return readText(row, ["user__email", "author__email", "reporter__email"]) || (readText(row, ["visitor_id"]) ? "Anonymous visitor" : "—");
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


function AnimatedNumber({ value, replayKey = 0 }: { value: number; replayKey?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? Math.max(0, value) : 0;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }
    let frame = 0;
    let startTime = 0;
    const duration = 850;
    setDisplayValue(0);
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [value, replayKey]);

  return <>{formatCompactNumber(displayValue)}</>;
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
      .then((data: EngagementPayload) => {
        if (active) {
          setPayload(data);
            }
      })
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
        ...details.shares.map((row) => ({ ...row, channel: shareChannelLabel(row.channel), activity: "Share" })),
        ...details.saved.map((row) => ({ ...row, activity: "Saved" })),
        ...details.reports.map((row) => ({ ...row, activity: "Report" })),
      ];
    }
    if (selected === "users") return [];
    if (selected === "shares") return details.shares.map((row) => ({ ...row, channel: shareChannelLabel(row.channel) }));
    return details[selected] || [];
  }, [payload, selected]);

  const shareChannelBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    (payload?.details?.shares || []).forEach((row) => {
      const label = shareChannelLabel(row.channel);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts, ([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count || a.channel.localeCompare(b.channel));
  }, [payload]);

  if (loading || !isAdmin) return null;

  const tableRows: DetailRow[] = selectedRows.map((row) => {
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
        return "All post activity.";
      case "likes":
        return "Post and comment likes.";
      case "dislikes":
        return "Post and comment dislikes.";
      case "comments":
        return "Comments on this post.";
      case "shares":
        return "Post shares.";
      case "saved":
        return "Post saves.";
      case "reports":
        return `${formatCompactNumber(payload?.reports || 0)} user reports and ${formatCompactNumber(Math.max(0, selectedRows.length - (payload?.reports || 0)))} admin review records.`;
      default:
        return "Post activity.";
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
    ? payload.likes.total + payload.dislikes.total + payload.comments.total + payload.shares + payload.saved + payload.reports
    : 0;

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-engagement-header-copy">
            <span className="admin-eyebrow">POST ENGAGEMENT</span>
            <h1>{payload?.post.title || "Post statistics"}</h1>
            <p>Overall post and discussion engagement, with individual activity records.</p>
          </div>
          <div className="admin-top-actions admin-engagement-header-actions">
            <Link href="/admin" className="admin-secondary-button"><ArrowLeftIcon size={16} /><span>Back to dashboard</span></Link>
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
        {!payload && loadingData ? <div className="admin-empty">Loading engagement...</div> : payload ? (
          <>
            <section className="admin-engagement-stats" aria-label="Post statistics">
              {statLabels.map((item) => {
                const raw = item.key === "all" ? allStatsTotal : payload[item.key];
                const value = typeof raw === "number" ? raw : raw.total;
                const content = (
                  <>
                    <span><i>{item.icon}</i>{item.label}</span>
                    <strong><AnimatedNumber value={value} replayKey={refreshKey} /></strong>
                  </>
                );
                return item.key === "users" ? (
                  <div key={item.key} className="admin-engagement-stat stat-users" aria-label={`Total users: ${formatCompactNumber(value)}`}>
                    {content}
                  </div>
                ) : (
                  <button
                    type="button"
                    key={item.key}
                    className={"admin-engagement-stat stat-" + item.color + (selected === item.key ? " is-selected" : "")}
                    onClick={() => { setSelected(item.key); setPage(1); }}
                  >
                    {content}
                  </button>
                );
              })}
            </section>

            <section className="admin-post-panel admin-engagement-details">
              <div className="admin-panel-heading">
                <div>
                  <h2 className={"admin-engagement-details-title stat-" + selectedStat.color}><i>{selectedStat.icon}</i><span>{selectedLabel} details</span></h2>
                  <p>{detailDescription} <AnimatedNumber value={selectedRows.length} replayKey={refreshKey} /> {selectedRows.length === 1 ? "record" : "records"} shown below.</p>
                </div>
              </div>
              {selected === "shares" ? (
                <section className="admin-share-breakdown" aria-label="Share platform breakdown">
                  <div className="admin-share-breakdown-heading">
                    <strong>Shares by platform</strong>
                    <span>{formatCompactNumber(payload.shares)} total share actions</span>
                  </div>
                  {shareChannelBreakdown.length ? (
                    <div className="admin-share-breakdown-grid">
                      {shareChannelBreakdown.map((item) => (
                        <div className="admin-share-breakdown-card" key={item.channel}>
                          <span>{item.channel}</span>
                          <strong>{formatCompactNumber(item.count)}</strong>
                          <small>{payload.shares ? Math.round((item.count / payload.shares) * 100) : 0}% of shares</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-share-breakdown-empty">No platform share activity recorded yet.</div>
                  )}
                </section>
              ) : null}
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
                    Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, selectedRows.length)} of {formatCompactNumber(selectedRows.length)} records
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
