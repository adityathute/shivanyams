"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "shivanya-auth";
import {
  ConfirmDialog,
  IconButton,
  ArrowLeftIcon,
  CloseIcon,
  Select,
  DownloadIcon,
  RefreshIcon,
  PlusIcon,
  GlobeIcon,
  MessagesIcon,
  TagIcon
} from "shivanya-ui";
import {
  API_URL,
  categoryConfig,
  normalizeCategorySlug,
} from "../../components/portal/category/CategoryGrid";
import { adminFetch, formatCompactNumber } from "./admin-utils";
import type { Category } from "../../components/portal/category/CategoryGrid";

import "./admin.css";

type PaginatedPosts = { results?: AdminPost[]; next?: string | null };

type WebsiteAnalyticsPage = {
  path: string;
  views: number;
  unique_visitors: number;
  last_viewed: string | null;
};
type PostAnalyticsPage = { id: number; title: string; slug: string; views: number; unique_visitors: number; last_viewed: string | null; };
type PostViewEvent = { viewed_at: string; visitor_type: "user" | "anonymous"; full_name: string; visitor_id: string; browser: string; device: string; language: string; referrer_url: string; };
type SavedPostAnalyticsRow = { post_id: number; post_title: string; post_slug: string; saves: number; users: number; };
type SubscriberAnalyticsRow = { id: number; full_name: string; email: string; subscribed_at: string; visitor_id?: string; event_type?: "subscribed" | "unsubscribed"; };
type SubscriberAnalyticsTotals = { total: number; registered: number; subscriptions: number; resubscriptions: number; unsubscriptions: number };
type TagAnalyticsTotals = { total: number; used: number; unused: number };
type ShareAnalyticsEvent = { post_id: number; post__title_en: string; post__slug: string; user_auth_id: string; visitor_id: string; channel: string; created_at: string; user_name: string; visitor_type: "user" | "anonymous"; visitor_label: string };
type ShareAnalyticsPayload = { total: number; unique_visitors: number; posts_shared: number; channels: Record<string, number>; events: ShareAnalyticsEvent[] };
type ReportAnalyticsEvent = {
  id: string; report_id: number; target_type: "post" | "comment" | "reply";
  post_id: number; post_title: string; post_slug: string; content: string;
  parent_content?: string; reason: string; details: string; status: string;
  reporter_name: string; reporter_email: string; visitor_id: string; created_at: string;
};
type LikeAnalyticsEvent = {
  id: string;
  target_type: "post" | "comment" | "reply";
  post_id: number;
  post_title: string;
  post_slug: string;
  content: string;
  parent_content: string;
  user_name: string;
  user_email: string;
  visitor_id: string;
  created_at: string;
  comment_id?: number | null;
  parent_id?: number | null;
};
type WebsiteVisitorRow = {
  visitor_id: string;
  visitor_type: "user" | "anonymous";
  full_name: string;
  ip_address: string | null;
  first_seen: string;
  last_seen: string;
  last_viewed: string | null;
  total_views: number;
  total_pages: number;
  device: string;
  browser: string;
  language: string;
};
type WebsiteViewEvent = {
  viewed_at: string;
  visitor_type: "user" | "anonymous";
  full_name: string;
  ip_address: string | null;
  visitor_id: string;
  device: string;
  browser: string;
  language: string;
  referrer_url: string;
};

type AnalyticsPaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
  alwaysShow?: boolean;
  showPageSize?: boolean;
};

function AnalyticsPagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
  alwaysShow = false,
  showPageSize = true,
}: AnalyticsPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (!alwaysShow && total <= pageSize) return null;
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
  return (
    <div className={`admin-table-footer admin-analytics-pagination ${className || ""}`.trim()}>
      <span>
        Showing {firstItem.toLocaleString("en-IN")}–{lastItem.toLocaleString("en-IN")} of {formatCompactNumber(total)}
      </span>
      <div className="admin-pagination">
        {showPageSize && (
          <label>
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Rows per page"
            >
              {[10, 15, 25, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        )}
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>Page {page} of {pageCount}</span>
        <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}

type AdminPost = {
  id: number;
  slug: string;
  title_en: string;
  title_mr?: string;
  category: Category;
  status: string;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  views_count?: number;
  unique_visitors_count?: number;
  users_count?: number;
  is_active?: boolean;
};

const CONTENT_KINDS = [
  { slug: "jobs", label: "Jobs", api: "jobs" },
  { slug: "schemes", label: "Schemes", api: "schemes" },
  { slug: "examination", label: "Examination", api: "examination" },
  { slug: "admit-cards", label: "Admit Cards", api: "admit-card" },
  { slug: "results", label: "Results", api: "results" },
  { slug: "articles-guides", label: "Articles & Guides", api: "articles" },
  { slug: "videos", label: "Videos", api: "videos" },
  { slug: "tools", label: "Tools", api: "tools" },
];

const STATUS_OPTIONS = [
  "all",
  "draft",
  "pending_review",
  "changes_requested",
  "approved",
  "published",
  "rejected",
  "archived",
];

function formatPersonName(name: string | null | undefined) {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(
      /(^|[\\s'-])([a-z])/g,
      (_match, separator, letter) => separator + letter.toUpperCase(),
    );
}

function statusLabel(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAdminDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdmin = user?.roles?.includes("admin") === true;
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [websiteViewsCount, setWebsiteViewsCount] = useState(0);
  const [websiteVisitorsCount, setWebsiteVisitorsCount] = useState(0);
  const [postVisitorsCount, setPostVisitorsCount] = useState(0);
  const [engagementStats, setEngagementStats] = useState({
    likes: 0,
    dislikes: 0,
    comments: 0,
    replies: 0,
    tags: 0,
    shares: 0,
    saved: 0,
    reports: 0,
    subscribers: 0,
  });
  const [analyticsType, setAnalyticsType] = useState<
    "views" | "visitors" | "users" | "posts" | "drafts" | "review" | "likes" | "dislikes" | "comments" | "replies" | "reports" | "saved" | "subscribers" | "tags" | "shares" | null
  >(null);
  const [analyticsPages, setAnalyticsPages] = useState<WebsiteAnalyticsPage[]>(
    [],
  );
  const [postAnalyticsPages, setPostAnalyticsPages] = useState<PostAnalyticsPage[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostAnalyticsPage | null>(null);
  const [postAnalyticsEvents, setPostAnalyticsEvents] = useState<PostViewEvent[]>([]);
  const [likeAnalyticsEvents, setLikeAnalyticsEvents] = useState<LikeAnalyticsEvent[]>([]);
  const [reportAnalyticsEvents, setReportAnalyticsEvents] = useState<ReportAnalyticsEvent[]>([]);
  const [savedPostRows, setSavedPostRows] = useState<SavedPostAnalyticsRow[]>([]);
  const [savedPostTotals, setSavedPostTotals] = useState({ posts: 0, saves: 0, users: 0 });
  const [savedPostsPage, setSavedPostsPage] = useState(1);
  const [subscriberRows, setSubscriberRows] = useState<SubscriberAnalyticsRow[]>([]);
  const [subscriberView, setSubscriberView] = useState<"active" | "registered" | "subscriptions" | "resubscriptions" | "unsubscriptions">("active");
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [subscriberTotals, setSubscriberTotals] = useState<SubscriberAnalyticsTotals>({ total: 0, registered: 0, subscriptions: 0, resubscriptions: 0, unsubscriptions: 0 });
  const [tagTotals, setTagTotals] = useState<TagAnalyticsTotals>({ total: 0, used: 0, unused: 0 });
  const [shareAnalytics, setShareAnalytics] = useState<ShareAnalyticsPayload>({ total: 0, unique_visitors: 0, posts_shared: 0, channels: {}, events: [] });
  const [shareAnalyticsPage, setShareAnalyticsPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<ReportAnalyticsEvent | null>(null);
  const [reportsAnalyticsPage, setReportsAnalyticsPage] = useState(1);
  const [selectedLikeComment, setSelectedLikeComment] = useState<any>(null);
  const [likeAnalyticsPage, setLikeAnalyticsPage] = useState(1);
  const [commentsAnalyticsPage, setCommentsAnalyticsPage] = useState(1);
  const [repliesAnalyticsPage, setRepliesAnalyticsPage] = useState(1);
  const [reactionPostsOnly, setReactionPostsOnly] = useState(false);
  const likeContentRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const likePostRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsVisitors, setAnalyticsVisitors] = useState<
    WebsiteVisitorRow[]
  >([]);
  const [selectedVisitor, setSelectedVisitor] =
    useState<WebsiteVisitorRow | null>(null);
  const [visitorReturnState, setVisitorReturnState] =
    useState<WebsiteVisitorRow | null>(null);
  const [visitorPages, setVisitorPages] = useState<WebsiteAnalyticsPage[]>([]);
  const [selectedAnalyticsPath, setSelectedAnalyticsPath] = useState<
    string | null
  >(null);
  const [analyticsEvents, setAnalyticsEvents] = useState<WebsiteViewEvent[]>(
    [],
  );
  const [analyticsPagesPage, setAnalyticsPagesPage] = useState(1);
  const [analyticsVisitorsPage, setAnalyticsVisitorsPage] = useState(1);
  const [visitorPagesPage, setVisitorPagesPage] = useState(1);
  const [analyticsEventsPage, setAnalyticsEventsPage] = useState(1);
  const [analyticsPageSize, setAnalyticsPageSize] = useState(10);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatedWithin, setUpdatedWithin] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyPost, setBusyPost] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if ((analyticsType !== "likes" && analyticsType !== "dislikes" && analyticsType !== "comments" && analyticsType !== "replies") || selectedPost || selectedVisitor || selectedLikeComment) return;

    const measureLikeRows = () => {
      const visibleLikes = likeAnalyticsEvents.slice(
        (likeAnalyticsPage - 1) * analyticsPageSize,
        likeAnalyticsPage * analyticsPageSize,
      );

      visibleLikes.forEach((item) => {
        if (item.target_type === "post") return;
        const content = likeContentRefs.current.get(item.id);
        const post = likePostRefs.current.get(item.id);
        if (!content || !post) return;

        const styles = window.getComputedStyle(content);
        const lineHeight = Number.parseFloat(styles.lineHeight);
        const measuredHeight = content.getBoundingClientRect().height;
        const lines = Number.isFinite(lineHeight) && lineHeight > 0
          ? Math.max(1, Math.min(3, Math.round(measuredHeight / lineHeight)))
          : 3;

        post.style.setProperty("--like-title-lines", String(lines));
      });
    };

    measureLikeRows();
    const observer = new ResizeObserver(measureLikeRows);
    likeContentRefs.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [analyticsType, likeAnalyticsEvents, likeAnalyticsPage, analyticsPageSize, selectedPost, selectedVisitor, selectedLikeComment]);


  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setError("");
    try {
      const responses = await Promise.all(
        CONTENT_KINDS.map(async (kind) => {
          let url: string | null = `${API_URL}/admin/content/${kind.api}/`;
          const rows: AdminPost[] = [];
          while (url) {
            const requestUrl: string = url;
            const response: Response = await adminFetch(requestUrl, {
              cache: "no-store",
            });
            if (!response.ok) {
              const body = await response.json().catch(() => ({}));
              throw new Error(
                body.detail ||
                  `Unable to load ${kind.label} (${response.status}).`,
              );
            }
            const payload: AdminPost[] | PaginatedPosts = await response.json();
            const isPaginated = !Array.isArray(payload);
            const pageRows: AdminPost[] = isPaginated
              ? ((payload as PaginatedPosts).results ?? [])
              : (payload as AdminPost[]);
            rows.push(...pageRows);
            const nextPage = isPaginated
              ? (payload as PaginatedPosts).next
              : null;
            url = nextPage ? new URL(nextPage, API_URL).toString() : null;
          }
          return rows.map((post) => ({
            ...post,
            category:
              post.category ??
              ({
                id: 0,
                slug: kind.slug,
                name_en: kind.label,
                name_mr: kind.label,
                name_hi: kind.label,
                description_en: "",
                description_mr: "",
                description_hi: "",
              } as Category),
          }));
        }),
      );
      setPosts(
        responses
          .flat()
          .sort(
            (a, b) =>
              new Date(b.created_at || b.published_at || 0).getTime() -
              new Date(a.created_at || a.published_at || 0).getTime(),
          ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load posts.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    let active = true;
    adminFetch(API_URL + "/admin/stats/", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            body.detail ||
              "Unable to load user statistics (" + response.status + ").",
          );
        }
        return response.json();
      })
      .then(
        (payload: {
          users_count?: number;
          website_views_count?: number;
          website_visitors_count?: number;
          post_visitors_count?: number;
          likes_count?: number;
          dislikes_count?: number;
          comments_count?: number;
          replies_count?: number;
          tags_count?: number;
          shares_count?: number;
          saved_count?: number;
          reports_count?: number;
          newsletter_subscribers_count?: number;
        }) => {
          if (active) {
            setUsersCount(Number(payload.users_count) || 0);
            setWebsiteViewsCount(Number(payload.website_views_count) || 0);
            setWebsiteVisitorsCount(
              Number(payload.website_visitors_count) || 0,
            );
            setPostVisitorsCount(Number(payload.post_visitors_count) || 0);
            setEngagementStats({
              likes: Number(payload.likes_count) || 0,
              dislikes: Number(payload.dislikes_count) || 0,
              comments: Number(payload.comments_count) || 0,
              replies: Number(payload.replies_count) || 0,
              tags: Number(payload.tags_count) || 0,
              shares: Number(payload.shares_count) || 0,
              saved: Number(payload.saved_count) || 0,
              reports: Number(payload.reports_count) || 0,
              subscribers: Number(payload.newsletter_subscribers_count) || 0,
            });
          }
        },
      )
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load user statistics.",
          );
      });

    return () => {
      active = false;
    };
  }, [isAdmin, refreshKey]);

  useEffect(() => {
    if (isAdmin) void loadPosts();
  }, [isAdmin, loadPosts, refreshKey]);

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const categoryMatch =
          categoryFilter === "all" || post.category.slug === categoryFilter;
        const statusMatch =
          statusFilter === "all" || post.status === statusFilter;
        const activeMatch =
          activeFilter === "all" ||
          (activeFilter === "active"
            ? post.is_active !== false
            : post.is_active === false);
        const updatedAt = post.updated_at
          ? new Date(post.updated_at).getTime()
          : 0;
        const age = Date.now() - updatedAt;
        const updatedMatch =
          updatedWithin === "all" ||
          (updatedAt > 0 && age <= Number(updatedWithin) * 24 * 60 * 60 * 1000);
        const query = search.trim().toLowerCase();
        const searchMatch =
          !query ||
          [post.title_en, post.title_mr, post.slug].some((value) =>
            value?.toLowerCase().includes(query),
          );
        return (
          categoryMatch &&
          statusMatch &&
          activeMatch &&
          updatedMatch &&
          searchMatch
        );
      }),
    [posts, categoryFilter, statusFilter, activeFilter, updatedWithin, search],
  );

  const sortedPosts = useMemo(
    () =>
      [...filteredPosts].sort((a, b) => {
        const aCreated = new Date(
          a.created_at || a.published_at || 0,
        ).getTime();
        const bCreated = new Date(
          b.created_at || b.published_at || 0,
        ).getTime();
        const aUpdated = new Date(a.updated_at || a.created_at || 0).getTime();
        const bUpdated = new Date(b.updated_at || b.created_at || 0).getTime();
        if (sortOrder === "oldest") return aCreated - bCreated;
        if (sortOrder === "updated") return bUpdated - aUpdated;
        if (sortOrder === "updated_oldest") return aUpdated - bUpdated;
        if (sortOrder === "title")
          return (a.title_en || "").localeCompare(b.title_en || "");
        if (sortOrder === "views")
          return (b.views_count || 0) - (a.views_count || 0);
        if (sortOrder === "visitors")
          return (
            (b.unique_visitors_count || 0) - (a.unique_visitors_count || 0)
          );
        return bCreated - aCreated;
      }),
    [filteredPosts, sortOrder],
  );
  const latestUpdatedPost = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at || 0).getTime() -
          new Date(a.updated_at || a.created_at || 0).getTime(),
      )[0] ?? null,
    [posts],
  );
  const latestUpdatedKind = latestUpdatedPost
    ? CONTENT_KINDS.find(
        (item) => item.slug === latestUpdatedPost.category.slug,
      )
    : undefined;
  const visibleAnalyticsPages = [...analyticsPages]
    .sort((a, b) => b.views - a.views)
    .slice((analyticsPagesPage - 1) * analyticsPageSize, analyticsPagesPage * analyticsPageSize);
  const visibleAnalyticsVisitors = analyticsVisitors.slice(
    (analyticsVisitorsPage - 1) * analyticsPageSize,
    analyticsVisitorsPage * analyticsPageSize,
  );
  const visitorPageSize = 10;
  const visibleVisitorPages = visitorPages.slice(
    (visitorPagesPage - 1) * visitorPageSize,
    visitorPagesPage * visitorPageSize,
  );
  const visibleAnalyticsEvents = analyticsEvents.slice(
    (analyticsEventsPage - 1) * analyticsPageSize,
    analyticsEventsPage * analyticsPageSize,
  );
  const pageCount = Math.max(1, Math.ceil(sortedPosts.length / pageSize));
  const visiblePosts = sortedPosts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const counts = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((post) => post.status === "published").length,
      drafts: posts.filter((post) => post.status === "draft").length,
      review: posts.filter((post) => post.status === "pending_review").length,
      views: posts.reduce((sum, post) => sum + (post.views_count || 0), 0),
    }),
    [posts],
  );
  const reactionPostRows = useMemo(() => {
    const grouped = new Map<number, { id: number; title: string; slug: string; reactions: number }>();
    likeAnalyticsEvents.forEach((event) => {
      if (event.target_type !== "post") return;
      const current = grouped.get(event.post_id);
      if (current) {
        current.reactions += 1;
      } else {
        grouped.set(event.post_id, {
          id: event.post_id,
          title: event.post_title,
          slug: event.post_slug,
          reactions: 1,
        });
      }
    });
    const viewsByPost = new Map(postAnalyticsPages.map((post) => [post.id, post.views]));
    return Array.from(grouped.values())
      .map((post) => ({ ...post, views: viewsByPost.get(post.id) || 0 }))
      .sort((a, b) => b.reactions - a.reactions || a.title.localeCompare(b.title));
  }, [likeAnalyticsEvents, postAnalyticsPages]);
  const visibleReactionPostRows = reactionPostRows.slice(
    (likeAnalyticsPage - 1) * analyticsPageSize,
    likeAnalyticsPage * analyticsPageSize,
  );
  const commentPostRows = useMemo(() => {
    const grouped = new Map<number, { id: number; title: string; slug: string; comments: number; replies: number }>();
    likeAnalyticsEvents.forEach((event) => {
      const current = grouped.get(event.post_id) || {
        id: event.post_id, title: event.post_title, slug: event.post_slug, comments: 0, replies: 0,
      };
      if (event.target_type === "reply") current.replies += 1;
      else current.comments += 1;
      grouped.set(event.post_id, current);
    });
    const viewsByPost = new Map(postAnalyticsPages.map((post) => [post.id, post.views]));
    return Array.from(grouped.values())
      .map((post) => ({ ...post, views: viewsByPost.get(post.id) || 0 }))
      .sort((a, b) => (b.comments + b.replies) - (a.comments + a.replies) || a.title.localeCompare(b.title));
  }, [likeAnalyticsEvents, postAnalyticsPages]);
  const commentReplyPage = analyticsType === "replies" ? repliesAnalyticsPage : commentsAnalyticsPage;
  const setCommentReplyPage = (nextPage: number) => {
    if (analyticsType === "replies") setRepliesAnalyticsPage(nextPage);
    else setCommentsAnalyticsPage(nextPage);
  };
  const visibleCommentPostRows = commentPostRows.slice(
    (commentReplyPage - 1) * analyticsPageSize,
    commentReplyPage * analyticsPageSize,
  );
  const commentReplyEvents = useMemo(
    () => likeAnalyticsEvents.filter((event) => event.target_type === (analyticsType === "replies" ? "reply" : "comment")),
    [likeAnalyticsEvents, analyticsType],
  );
  const visibleCommentReplyEvents = commentReplyEvents.slice(
    (commentReplyPage - 1) * analyticsPageSize,
    commentReplyPage * analyticsPageSize,
  );
  const reportPostRows = useMemo(() => {
    const grouped = new Map<number, {
      id: number; title: string; slug: string;
      postReports: number; commentReports: number; replyReports: number;
    }>();
    reportAnalyticsEvents.forEach((event) => {
      const current = grouped.get(event.post_id) || {
        id: event.post_id,
        title: event.post_title,
        slug: event.post_slug,
        postReports: 0,
        commentReports: 0,
        replyReports: 0,
      };
      if (event.target_type === "post") current.postReports += 1;
      else if (event.target_type === "reply") current.replyReports += 1;
      else current.commentReports += 1;
      grouped.set(event.post_id, current);
    });
    const viewsByPost = new Map(postAnalyticsPages.map((post) => [post.id, post.views]));
    return Array.from(grouped.values())
      .map((post) => ({ ...post, views: viewsByPost.get(post.id) || 0 }))
      .sort((a, b) =>
        (b.postReports + b.commentReports + b.replyReports) -
        (a.postReports + a.commentReports + a.replyReports) ||
        a.title.localeCompare(b.title)
      );
  }, [reportAnalyticsEvents, postAnalyticsPages]);
  const visibleReportPostRows = reportPostRows.slice((reportsAnalyticsPage - 1) * analyticsPageSize, reportsAnalyticsPage * analyticsPageSize);
  const visibleReportEvents = reportAnalyticsEvents.slice((reportsAnalyticsPage - 1) * analyticsPageSize, reportsAnalyticsPage * analyticsPageSize);
  const statusAnalyticsPosts = useMemo(
    () => analyticsType === "drafts"
      ? posts.filter((post) => post.status === "draft")
      : analyticsType === "review"
        ? posts.filter((post) => post.status === "pending_review")
        : [],
    [analyticsType, posts],
  );

  function openContentStatusAnalytics(type: "drafts" | "review") {
    setAnalyticsType(type);
    setSelectedPost(null);
    setPostAnalyticsEvents([]);
    setSelectedVisitor(null);
    setVisitorPages([]);
    setSelectedAnalyticsPath(null);
    setAnalyticsEvents([]);
    setAnalyticsPagesPage(1);
    setAnalyticsVisitorsPage(1);
    setVisitorPagesPage(1);
    setAnalyticsEventsPage(1);
    setAnalyticsLoading(false);
  }

  function openWebsiteAnalytics(type: "views" | "visitors" | "users") {
    setAnalyticsType(type);
    setSelectedPost(null);
    setPostAnalyticsEvents([]);
    setSelectedVisitor(null);
    setVisitorPages([]);
    setSelectedAnalyticsPath(null);
    setAnalyticsEvents([]);
    setAnalyticsPagesPage(1);
    setAnalyticsVisitorsPage(1);
    setVisitorPagesPage(1);
    setAnalyticsEventsPage(1);
    setAnalyticsLoading(true);
    const query =
      type === "views"
        ? ""
        : `?type=visitors${type === "users" ? "&authenticated=true" : ""}`;
    adminFetch(API_URL + "/admin/website-analytics/" + query, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            `Unable to load website analytics (${response.status}).`,
          );
        return response.json();
      })
      .then(
        (payload: {
          pages?: WebsiteAnalyticsPage[];
          visitors?: WebsiteVisitorRow[];
        }) => {
          setAnalyticsPages(payload.pages ?? []);
          setAnalyticsVisitors(payload.visitors ?? []);
        },
      )
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load website analytics.",
        ),
      )
      .finally(() => setAnalyticsLoading(false));
  }

  async function showReactionPostsOnly(show: boolean) {
    setLikeAnalyticsPage(1);
    setCommentsAnalyticsPage(1);
    setRepliesAnalyticsPage(1);
    setReportsAnalyticsPage(1);
    setReactionPostsOnly(show);
    if (!show) return;

    setAnalyticsLoading(true);
    try {
      const response = await adminFetch(API_URL + "/admin/website-analytics/?type=posts", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load post views (" + response.status + ").");
      const payload = await response.json();
      setPostAnalyticsPages(payload.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load post views.");
      setReactionPostsOnly(false);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  function openSavedPostsAnalytics() {
    setAnalyticsType("saved" as any);
    setSelectedPost(null); setSelectedVisitor(null); setSavedPostsPage(1); setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/stats/?type=saved", { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error(`Unable to load saved posts analytics (${response.status}).`); return response.json(); })
      .then((payload: { total_posts?: number; total_saved?: number; total_users?: number; results?: SavedPostAnalyticsRow[] }) => {
        setSavedPostTotals({ posts: Number(payload.total_posts) || 0, saves: Number(payload.total_saved) || 0, users: Number(payload.total_users) || 0 });
        setSavedPostRows(payload.results ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load saved posts analytics."))
      .finally(() => setAnalyticsLoading(false));
  }

  function loadSubscriberView(view: "active" | "registered" | "subscriptions" | "resubscriptions" | "unsubscriptions") {
    setSubscriberView(view);
    setSubscribersPage(1);
    setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/stats/?type=subscribers&view=" + view, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load subscriber details (${response.status}).`);
        return response.json();
      })
      .then((payload: { total_subscribers?: number; registered_users?: number; total_subscriptions?: number; total_resubscriptions?: number; total_unsubscriptions?: number; results?: SubscriberAnalyticsRow[] }) => {
        setSubscriberTotals({
          total: Number(payload.total_subscribers) || 0,
          registered: Number(payload.registered_users) || 0,
          subscriptions: Number(payload.total_subscriptions) || 0,
          resubscriptions: Number(payload.total_resubscriptions) || 0,
          unsubscriptions: Number(payload.total_unsubscriptions) || 0,
        });
        setSubscriberRows(payload.results ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load subscribers."))
      .finally(() => setAnalyticsLoading(false));
  }

  function openSubscribersAnalytics() {
    setAnalyticsType("subscribers");
    setSelectedPost(null);
    setSelectedVisitor(null);
    setSelectedAnalyticsPath(null);
    loadSubscriberView("subscriptions");
  }

  function openTagsAnalytics() {
    setAnalyticsType("tags");
    setSelectedPost(null);
    setSelectedVisitor(null);
    setSelectedAnalyticsPath(null);
    setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/tags/", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load tag statistics (${response.status}).`);
        return response.json();
      })
      .then((payload: { name: string; count: number }[]) => {
        const tags = Array.isArray(payload) ? payload : [];
        const used = tags.filter((tag) => Number(tag.count) > 0).length;
        setTagTotals({ total: tags.length, used, unused: tags.length - used });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load tag statistics."))
      .finally(() => setAnalyticsLoading(false));
  }

  function openSharesAnalytics() {
    setAnalyticsType("shares");
    setSelectedPost(null);
    setSelectedVisitor(null);
    setSelectedAnalyticsPath(null);
    setShareAnalyticsPage(1);
    setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/shares/", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load share analytics (${response.status}).`);
        return response.json();
      })
      .then((payload: ShareAnalyticsPayload) => {
        setShareAnalytics({
          total: Number(payload.total) || 0,
          unique_visitors: Number(payload.unique_visitors) || 0,
          posts_shared: Number(payload.posts_shared) || 0,
          channels: payload.channels || {},
          events: Array.isArray(payload.events) ? payload.events : [],
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load share analytics."))
      .finally(() => setAnalyticsLoading(false));
  }

  function openLikesAnalytics(type: "likes" | "dislikes" = "likes") {
    setSelectedLikeComment(null);
    setAnalyticsType(type);
    setSelectedPost(null);
    setPostAnalyticsEvents([]);
    setSelectedVisitor(null);
    setVisitorPages([]);
    setSelectedAnalyticsPath(null);
    setAnalyticsEvents([]);
    setLikeAnalyticsEvents([]);
    setLikeAnalyticsPage(1);
    setReactionPostsOnly(false);
    setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/stats/?type=" + type, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Unable to load ${type} analytics (${response.status}).`);
        return response.json();
      })
      .then((payload: { results?: LikeAnalyticsEvent[] }) => {
        setLikeAnalyticsEvents(payload.results ?? []);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load reaction analytics."),
      )
      .finally(() => setAnalyticsLoading(false));
  }

  function openCommentsAnalytics(type: "comments" | "replies" = "comments") {
    setSelectedLikeComment(null);
    setAnalyticsType(type);
    if (type === "comments") setCommentsAnalyticsPage(1);
    else setRepliesAnalyticsPage(1);
    setSelectedPost(null);
    setPostAnalyticsEvents([]);
    setSelectedVisitor(null);
    setVisitorPages([]);
    setSelectedAnalyticsPath(null);
    setAnalyticsEvents([]);
    setLikeAnalyticsEvents([]);
    setLikeAnalyticsPage(1);
    setReactionPostsOnly(false);
    setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/stats/?type=comments", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load comments analytics (" + response.status + ").");
        return response.json();
      })
      .then((payload: { results?: LikeAnalyticsEvent[] }) => setLikeAnalyticsEvents(payload.results ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load comments analytics."))
      .finally(() => setAnalyticsLoading(false));
  }

  function openReportsAnalytics() {
    setSelectedReport(null); setAnalyticsType("reports");
    setSelectedPost(null); setPostAnalyticsEvents([]);
    setSelectedVisitor(null); setVisitorPages([]);
    setSelectedAnalyticsPath(null); setAnalyticsEvents([]);
    setReportAnalyticsEvents([]); setReportsAnalyticsPage(1);
    setReactionPostsOnly(false); setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/stats/?type=reports", { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Unable to load reports analytics (" + response.status + ")."); return response.json(); })
      .then((payload: { results?: ReportAnalyticsEvent[] }) => setReportAnalyticsEvents(payload.results ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load reports analytics."))
      .finally(() => setAnalyticsLoading(false));
  }

  function openPostAnalytics() {
    setAnalyticsType("posts"); setSelectedPost(null); setSelectedVisitor(null); setSelectedAnalyticsPath(null);
    setAnalyticsPagesPage(1); setAnalyticsLoading(true);
    adminFetch(API_URL + "/admin/website-analytics/?type=posts", { cache: "no-store" })
      .then(async (r) => { if (!r.ok) throw new Error("Unable to load post analytics (" + r.status + ")."); return r.json(); })
      .then((data: { posts?: PostAnalyticsPage[] }) => setPostAnalyticsPages(data.posts ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load post analytics."))
      .finally(() => setAnalyticsLoading(false));
  }

  async function openLikeComment(item: LikeAnalyticsEvent, target: "comment" | "reply") {
    const commentId = target === "comment" ? (item.parent_id || item.comment_id) : item.comment_id;
    if (!commentId) { setError("Comment details are not available for this reaction."); return; }
    setAnalyticsLoading(true);
    try {
      const response = await adminFetch(API_URL + "/admin/comments/?post=" + item.post_id, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load comment details (" + response.status + ").");
      const comments = await response.json();
      const findComment = (rows: any[], id: number): any => {
        for (const row of rows) {
          if (Number(row.id) === Number(id)) return row;
          const nested = findComment(row.replies || [], id);
          if (nested) return nested;
        }
        return null;
      };
      const selected = findComment(comments, Number(commentId));
      if (!selected) throw new Error("This comment is no longer available.");
      const parent = selected.parent ? findComment(comments, Number(selected.parent)) : null;
      setSelectedLikeComment({ ...selected, parent_comment: parent, post_title: item.post_title, liked_target: target });
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load comment details."); }
    finally { setAnalyticsLoading(false); }
  }
  async function openPostEvents(post: PostAnalyticsPage) {
    setSelectedPost(post); setSelectedAnalyticsPath(null); setAnalyticsEventsPage(1); setAnalyticsLoading(true);
    try {
      const r = await adminFetch(API_URL + "/admin/website-analytics/?type=posts&post_id=" + post.id, { cache: "no-store" });
      if (!r.ok) throw new Error("Unable to load post views (" + r.status + ").");
      const data = await r.json(); setPostAnalyticsEvents(data.events ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load post views."); }
    finally { setAnalyticsLoading(false); }
  }

  async function openVisitorDetails(visitor: WebsiteVisitorRow) {
    setSelectedVisitor(visitor);
    setSelectedAnalyticsPath(null);
    setVisitorPagesPage(1);
    setAnalyticsLoading(true);
    try {
      const response = await adminFetch(
        API_URL +
          "/admin/website-analytics/?type=visitors&visitor_id=" +
          encodeURIComponent(visitor.visitor_id),
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error(`Unable to load visitor pages (${response.status}).`);
      const payload = await response.json();
      setVisitorPages(payload.pages ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load visitor pages.",
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function openPostEventVisitor(visitorId: string, postId?: number) {
    setAnalyticsLoading(true);
    setSelectedVisitor(null);
    setVisitorPages([]);
    setVisitorPagesPage(1);
    try {
      const query = postId
        ? `type=visitors&post_visitor_id=${encodeURIComponent(visitorId)}&post_id=${postId}`
        : `type=visitors&visitor_id=${encodeURIComponent(visitorId)}`;
      const response = await adminFetch(
        API_URL + "/admin/website-analytics/?" + query,
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error(`Unable to load visitor details (${response.status}).`);
      const payload: { visitor?: WebsiteVisitorRow | null; pages?: WebsiteAnalyticsPage[] } = await response.json();
      if (!payload.visitor) throw new Error("Visitor details are not available.");
      setSelectedVisitor(payload.visitor);
      setSelectedAnalyticsPath(null);
      setVisitorPages(payload.pages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open visitor details.");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function openPageEvents(path: string) {
    setSelectedAnalyticsPath(path);
    setAnalyticsEventsPage(1);
    setAnalyticsLoading(true);
    try {
      const response = await adminFetch(
        API_URL + "/admin/website-analytics/?path=" + encodeURIComponent(path),
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error(`Unable to load page views (${response.status}).`);
      const payload = await response.json();
      setAnalyticsEvents(payload.events ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load page views.",
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function openVisitorPageEvents(path: string) {
    if (selectedVisitor) {
      setVisitorReturnState(selectedVisitor);
      setSelectedVisitor(null);
    }
    await openPageEvents(path);
  }

  function deletePost(post: AdminPost) {
    setError("");
    setDeleteTarget(post);
  }

  async function confirmDeletePost() {
    if (!deleteTarget) return;
    const post = deleteTarget;
    const kind = CONTENT_KINDS.find((item) => item.slug === post.category.slug);
    if (!kind) return;

    setBusyPost(post.id);
    try {
      const response = await adminFetch(
        `${API_URL}/admin/content/${kind.api}/${post.slug}/`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error(`Delete failed (${response.status}).`);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setSelectedIds((current) => current.filter((id) => id !== post.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete post.");
    } finally {
      setBusyPost(null);
    }
  }

  async function changeStatus(post: AdminPost, status: string) {
    setBusyPost(post.id);
    try {
      const response = await adminFetch(
        `${API_URL}/admin/content/${post.id}/review/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          payload.detail || `Status update failed (${response.status}).`,
        );
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                status: payload.status || status,
                published_at: payload.published_at ?? item.published_at,
              }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update post status.",
      );
    } finally {
      setBusyPost(null);
    }
  }

  function exportCsv() {
    const columns = [
      "id",
      "title_en",
      "slug",
      "category",
      "category_slug",
      "status",
      "is_active",
      "views_count",
      "unique_visitors_count",
      "users_count",
      "published_at",
      "created_at",
      "updated_at",
    ];
    const rows = sortedPosts.map((post) => [
      post.id,
      post.title_en,
      post.slug,
      post.category.name_en,
      post.category.slug,
      post.status,
      post.is_active ?? "",
      post.views_count ?? 0,
      post.unique_visitors_count ?? 0,
      post.users_count ?? 0,
      post.published_at ?? "",
      post.created_at ?? "",
      post.updated_at ?? "",
    ]);
    const csv = [columns, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");

    // UTF-8 BOM helps Excel correctly recognize Marathi/Hindi and other Unicode text.
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shivanyams-posts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !isAdmin) return null;

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">SHIVANYAMS CONTENT MANAGEMENT</span>
            <h1>Admin Dashboard</h1>
            <p>Manage posts, publishing status and website content.</p>
          </div>
          <div className="admin-top-actions admin-dashboard-header-actions">
            <Link href="/admin/tags" className="admin-secondary-button">
              <TagIcon size={16} />
              <span>Tags</span>
            </Link>
            <Link href="/admin/comments" className="admin-secondary-button">
              <MessagesIcon size={16} />
              <span>Comments & reports</span>
            </Link>
            <Link href="/" target="_blank" className="admin-secondary-button">
              <GlobeIcon size={16} />
              <span>View website</span>
            </Link>
            <Link href="/admin/add-post" className="admin-primary-button">
              <PlusIcon size={16} />
              <span>Add New Post</span>
            </Link>
          </div>
        </header>

        {(() => {
          const statItems: {
            label: string;
            value: number;
            analytics?: "views" | "visitors" | "users" | "posts" | "drafts" | "review";
            group: "users" | "website" | "posts" | "content";
          }[] = [
            {
              label: "Portal users",
              value: usersCount,
              analytics: "users",
              group: "users",
            },
            {
              label: "Website views",
              value: websiteViewsCount,
              analytics: "views",
              group: "website",
            },
            {
              label: "Website visitors",
              value: websiteVisitorsCount,
              analytics: "visitors",
              group: "website",
            },
            { label: "Post views", value: counts.views, analytics: "posts", group: "posts" },
            {
              label: "Post visitors",
              value: postVisitorsCount,
              group: "posts",
            },
            {
              label: "Published posts",
              value: counts.published,
              group: "content",
            },
            { label: "Total posts", value: counts.total, group: "content" },
            { label: "Drafts", value: counts.drafts, analytics: "drafts", group: "content" },
            { label: "Pending review", value: counts.review, analytics: "review", group: "content" },
          ];

          const engagementItems = [
            { label: "Likes", value: engagementStats.likes, analytics: "likes" as const },
            { label: "Dislikes", value: engagementStats.dislikes, analytics: "dislikes" as const },
            { label: "Comments", value: engagementStats.comments, analytics: "comments" as const },
            { label: "Replies", value: engagementStats.replies, analytics: "replies" as const },
            { label: "Tags", value: engagementStats.tags, analytics: "tags" as const },
            { label: "Shares", value: engagementStats.shares, analytics: "shares" as const },
            { label: "Saved posts", value: engagementStats.saved, analytics: "saved" as const },
            { label: "Reports", value: engagementStats.reports, analytics: "reports" as const },
            { label: "Subscribers", value: engagementStats.subscribers, analytics: "subscribers" as const },
          ];

          return (
            <div className="admin-stats-stack">
              <section className="admin-stats">
                {statItems.map((item) => (
                  <article
                    key={item.label}
                    className={`admin-stat-card admin-stat-${item.group}${item.analytics ? " admin-stat-clickable" : ""}`}
                  >
                    {item.analytics ? (
                      <button
                        type="button"
                        onClick={() => item.analytics === "posts" ? openPostAnalytics() : openWebsiteAnalytics(item.analytics!)}
                        aria-label={`View ${item.label.toLowerCase()} details`}
                      >
                        <span>
                          {item.label}
                          <small
                            className="admin-stat-open-indicator"
                            aria-hidden="true"
                          >
                            ↗
                          </small>
                        </span>
                        <strong>
                          {formatCompactNumber(item.value)}
                        </strong>
                      </button>
                    ) : (
                      <>
                        <span>{item.label}</span>
                        <strong>
                          {formatCompactNumber(item.value)}
                        </strong>
                      </>
                    )}
                  </article>
                ))}
              </section>
              <section
                className="admin-stats admin-stats-secondary"
                aria-label="Engagement statistics"
              >
                {engagementItems.map((item) => (
                  <article
                    key={item.label}
                    className={`admin-stat-card admin-stat-posts${item.analytics ? " admin-stat-clickable" : ""}`}
                  >
                    {item.analytics === "likes" || item.analytics === "dislikes" || item.analytics === "comments" || item.analytics === "replies" || item.analytics === "reports" || item.analytics === "saved" || item.analytics === "subscribers" || item.analytics === "tags" || item.analytics === "shares" ? (
                      <button
                        type="button"
                        onClick={() => item.analytics === "comments" || item.analytics === "replies" ? openCommentsAnalytics(item.analytics) : item.analytics === "reports" ? openReportsAnalytics() : item.analytics === "saved" ? openSavedPostsAnalytics() : item.analytics === "subscribers" ? openSubscribersAnalytics() : item.analytics === "tags" ? openTagsAnalytics() : item.analytics === "shares" ? openSharesAnalytics() : openLikesAnalytics(item.analytics as "likes" | "dislikes")}
                        aria-label={`View ${item.label.toLowerCase()} details`}
                      >
                        <span>
                          {item.label}
                          <small className="admin-stat-open-indicator" aria-hidden="true">↗</small>
                        </span>
                        <strong>{formatCompactNumber(item.value)}</strong>
                      </button>
                    ) : (
                      <>
                        <span>{item.label}</span>
                        <strong>{formatCompactNumber(item.value)}</strong>
                      </>
                    )}
                  </article>
                ))}
              </section>
            </div>
          );
        })()}

        {/* {latestUpdatedPost && (
          <section className="admin-latest-updated">
            <div className="admin-latest-updated-copy">
              <span className="admin-latest-updated-label">LATEST UPDATED POST</span>
              <strong>{latestUpdatedPost.title_en || latestUpdatedPost.slug}</strong>
              <small>{latestUpdatedKind?.label || latestUpdatedPost.category.name_en} · Updated {latestUpdatedPost.updated_at ? formatAdminDateTime(latestUpdatedPost.updated_at) : "date unavailable"}</small>
            </div>
            <Link href={`/admin/edit-post/${latestUpdatedKind?.api || "jobs"}/${latestUpdatedPost.slug}`}>Open post ↗</Link>
          </section>
        )} */}

        <section className="admin-post-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>All Posts</h2>
              <p>View, search, edit and manage every category.</p>
            </div>
            <div className="admin-toolbar-actions">
              <button
                type="button"
                className="admin-refresh-button admin-toolbar-action"
                onClick={exportCsv}
                aria-label="Export posts as CSV"
                title="Export CSV"
              >
                <DownloadIcon size={16} />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                className="admin-refresh-button admin-toolbar-action"
                onClick={() => setRefreshKey((value) => value + 1)}
                disabled={postsLoading}
                aria-label="Refresh admin posts"
                title="Refresh"
              >
                <RefreshIcon size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="admin-filters">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by post title or slug..."
              aria-label="Search posts"
            />
            <Select
              size="sm"
              fullWidth
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              options={[
                { value: "all", label: "All categories" },
                ...CONTENT_KINDS.map((kind) => ({
                  value: kind.slug,
                  label: kind.label,
                })),
              ]}
            />
            <Select
              size="sm"
              fullWidth
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by publishing status"
              options={STATUS_OPTIONS.map((status) => ({
                value: status,
                label:
                  status === "all"
                    ? "All publishing statuses"
                    : statusLabel(status),
              }))}
            />
            <Select
              size="sm"
              fullWidth
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by active status"
              options={[
                { value: "all", label: "Active & inactive" },
                { value: "active", label: "Active posts" },
                { value: "inactive", label: "Inactive posts" },
              ]}
            />
            <Select
              size="sm"
              fullWidth
              value={updatedWithin}
              onChange={(event) => {
                setUpdatedWithin(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by update date"
              options={[
                { value: "all", label: "Updated any time" },
                { value: "1", label: "Updated in 24 hours" },
                { value: "7", label: "Updated in 7 days" },
                { value: "30", label: "Updated in 30 days" },
              ]}
            />
            <Select
              size="sm"
              fullWidth
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setPage(1);
              }}
              aria-label="Sort posts"
              options={[
                { value: "newest", label: "Created: newest" },
                { value: "oldest", label: "Created: oldest" },
                { value: "updated", label: "Updated: newest" },
                { value: "updated_oldest", label: "Updated: oldest" },
                { value: "title", label: "Title A–Z" },
                { value: "views", label: "Most views" },
                { value: "visitors", label: "Most visitors" },
              ]}
            />
          </div>

          {error && <div className="admin-error">{error}</div>}
          {postsLoading ? (
            <div className="admin-empty">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="admin-empty">No posts found for these filters.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-post-table">
                <thead>
                  <tr>
                    <th>Post</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Activity</th>
                    <th>Views</th>
                    <th>Visitors</th>
                    <th>Users</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePosts.map((post) => {
                    const kind = CONTENT_KINDS.find(
                      (item) => item.slug === post.category.slug,
                    );
                    return (
                      <tr key={post.id}>
                        <td>
                          <strong>{post.title_en || post.slug}</strong>
                          <small>/{post.slug}</small>
                        </td>
                        <td>
                          <span
                            className={`admin-category-badge ${categoryConfig[normalizeCategorySlug(post.category.slug)]?.type || "tool"}`}
                          >
                            {kind?.label || post.category.name_en}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status status-${post.status}`}>
                            {statusLabel(post.status)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-activity-badge ${post.is_active === false ? "inactive" : "active"}`}
                          >
                            {post.is_active === false ? "Inactive" : "Active"}
                          </span>
                        </td>
                        <td>{formatCompactNumber(post.views_count)}</td>
                        <td>
                          {formatCompactNumber(post.unique_visitors_count)}
                        </td>
                        <td>{formatCompactNumber(post.users_count)}</td>
                        <td>
                          {post.created_at
                            ? formatAdminDateTime(post.created_at)
                            : "—"}
                        </td>
                        <td>
                          {post.updated_at
                            ? formatAdminDateTime(post.updated_at)
                            : "—"}
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <Link
                              href={
                                post.status === "published" &&
                                post.is_active !== false &&
                                Boolean(post.published_at)
                                  ? `/${kind?.slug === "admit-cards" ? "admit-cards" : kind?.slug === "articles-guides" ? "guides" : kind?.slug || "jobs"}/${post.slug}`
                                  : `/admin/preview/${kind?.slug === "admit-cards" ? "admit-cards" : kind?.slug === "articles-guides" ? "guides" : kind?.slug || "jobs"}/${post.slug}`
                              }
                              target="_blank"
                            >
                              {post.status === "published" &&
                              post.is_active !== false &&
                              Boolean(post.published_at)
                                ? "View"
                                : "Preview"}
                            </Link>
                            <Link
                              href={`/admin/edit-post/${kind?.api || "jobs"}/${post.slug}`}
                            >
                              Edit
                            </Link>
                            {post.status === "published" && (
                              <Link href={`/admin/engagement/${post.id}`}>
                                Stats
                              </Link>
                            )}
                            {post.status !== "published" && (
                              <button
                                disabled={busyPost === post.id}
                                onClick={() =>
                                  void changeStatus(post, "published")
                                }
                              >
                                Publish
                              </button>
                            )}
                            <button
                              className="danger"
                              disabled={busyPost === post.id}
                              onClick={() => void deletePost(post)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="admin-table-footer">
            <span>
              Showing {sortedPosts.length ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, sortedPosts.length)} of{" "}
              {formatCompactNumber(sortedPosts.length)} filtered posts ·{" "}
              {formatCompactNumber(posts.filter((post) => post.is_active !== false).length)} active ·{" "}
              {formatCompactNumber(posts.filter((post) => post.is_active === false).length)} inactive
              · {formatCompactNumber(posts.length)} total
            </span>
            <div className="admin-pagination">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
              >
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
              <button
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {pageCount}
              </span>
              <button
                disabled={page >= pageCount}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
      {analyticsType && (
        <div
          className="admin-analytics-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) { setAnalyticsType(null); setSelectedLikeComment(null); setSelectedReport(null); }
          }}
        >
          <section
            className={`admin-analytics-modal${selectedVisitor ? " admin-analytics-modal-visitor" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-analytics-title"
          >
            <header className="admin-analytics-header">
              {(selectedVisitor || selectedAnalyticsPath || selectedPost || selectedLikeComment || selectedReport) && (
                <IconButton
                  size="lg"
                  variant="ghost"
                  className="admin-analytics-back-icon"
                  onClick={() => {
                    if (selectedReport) { setSelectedReport(null); return; }
                    if (selectedLikeComment) { setSelectedLikeComment(null); return; }
                    if (visitorReturnState) {
                      setSelectedAnalyticsPath(null);
                      setAnalyticsEvents([]);
                      setAnalyticsEventsPage(1);
                      setSelectedVisitor(visitorReturnState);
                      setVisitorReturnState(null);
                      return;
                    }
                    if (selectedVisitor) {
                      setSelectedVisitor(null);
                      setVisitorPages([]);
                      setVisitorPagesPage(1);
                      return;
                    }
                    if (selectedPost) {
                      setSelectedPost(null);
                      setPostAnalyticsEvents([]);
                      setAnalyticsEventsPage(1);
                      return;
                    }
                    setSelectedAnalyticsPath(null);
                    setAnalyticsEvents([]);
                  }}
                  aria-label="Back to list"
                  title="Back to list"
                >
                  <ArrowLeftIcon />
                </IconButton>
              )}
              <div>
                <h2 id="admin-analytics-title">
                  {selectedLikeComment
                    ? `${selectedLikeComment.liked_target === "reply" ? "Reply" : "Comment"} details`
                    : selectedReport
                    ? "Report details"
                    : selectedVisitor
                    ? `Visitor details (${formatCompactNumber(visitorPages.length)})`
                    : selectedPost
                      ? selectedPost.title + " (" + formatCompactNumber(postAnalyticsEvents.length) + " views)"
                      : selectedAnalyticsPath
                        ? `Page view details (${formatCompactNumber(analyticsEvents.length)})`
                        : analyticsType === "likes"
                          ? `Likes (${formatCompactNumber(likeAnalyticsEvents.length)})`
                          : analyticsType === "dislikes"
                            ? `Dislikes (${formatCompactNumber(likeAnalyticsEvents.length)})`
                            : analyticsType === "comments"
                              ? `Comments (${formatCompactNumber(commentReplyEvents.length)})`
                              : analyticsType === "replies"
                                ? `Replies (${formatCompactNumber(commentReplyEvents.length)})`
                          : analyticsType === "reports"
                             ? `Reports (${formatCompactNumber(reportAnalyticsEvents.length)})`
                           : analyticsType === "saved"
                             ? `Saved posts (${formatCompactNumber(savedPostTotals.saves)})`
                           : analyticsType === "subscribers"
                             ? `Subscribers (${formatCompactNumber(subscriberTotals.total)})`
                           : analyticsType === "tags"
                             ? `Tags (${formatCompactNumber(tagTotals.total)})`
                           : analyticsType === "shares"
                             ? `Shares (${formatCompactNumber(shareAnalytics.total)})`
                           : analyticsType === "posts"
                            ? `Post Views (${formatCompactNumber(counts.views)})`
                            : analyticsType === "drafts"
                            ? `Drafts (${formatCompactNumber(counts.drafts)})`
                            : analyticsType === "review"
                              ? `Pending review (${formatCompactNumber(counts.review)})`
                              : analyticsType === "views"
                        ? `Website Views (${formatCompactNumber(websiteViewsCount)})`
                        : analyticsType === "users"
                          ? `Portal Users (${formatCompactNumber(usersCount)})`
                          : `Website Visitors (${formatCompactNumber(websiteVisitorsCount)})`}
                </h2>
                <p>
                  {selectedLikeComment
                    ? `Comment on ${selectedLikeComment.post_title}`
                    : selectedReport
                    ? `Report submitted for ${selectedReport.post_title}.`
                    : selectedVisitor
                    ? "Pages visited by this browser or device."
                    : selectedPost
                      ? "Individual visits recorded for this post."
                      : selectedAnalyticsPath
                        ? "Individual visits recorded for this page."
                        : analyticsType === "likes"
                          ? reactionPostsOnly ? "Posts with likes and their total views." : "Individual likes across posts, comments, and replies."
                          : analyticsType === "dislikes"
                            ? reactionPostsOnly ? "Posts with dislikes and their total views." : "Individual dislikes across posts, comments, and replies."
                            : analyticsType === "comments"
                              ? reactionPostsOnly ? "Posts with their comment and reply counts, plus total views." : "Individual comments across all posts."
                              : analyticsType === "replies"
                                ? reactionPostsOnly ? "Posts with their comment and reply counts, plus total views." : "Individual replies across all posts."
                          : analyticsType === "reports"
                            ? reactionPostsOnly ? "Posts with their report counts, plus total views." : "Individual reports across posts and comments."
                          : analyticsType === "saved"
                            ? "Saved post totals, total saves, and unique users who saved posts."
                          : analyticsType === "subscribers"
                            ? "Users who subscribed to ShivanyaMS updates, with their email and subscription date."
                          : analyticsType === "tags"
                            ? "Overview of all tags and how many are assigned to posts."
                          : analyticsType === "shares"
                            ? "Share activity across all posts, including the sharing method and visitor details."
                          : analyticsType === "posts"
                            ? "Select a post to inspect its individual views."
                            : analyticsType === "drafts"
                            ? "Draft posts saved but not yet submitted for review."
                            : analyticsType === "review"
                              ? "Posts waiting for an administrator to review."
                              : analyticsType === "views"
                            ? "Select a page to inspect its individual page views."
                            : "Unique browser/device visitors. IP address is informational and does not determine visitor identity."}
                </p>
              </div>
              {analyticsType === "tags" && !selectedPost && !selectedVisitor ? (
                <div className="admin-reaction-view-toggle">
                  <Link href="/admin/tags" className="admin-reaction-view-button">
                    Manage Tags
                  </Link>
                </div>
              ) : null}
              {(analyticsType === "likes" || analyticsType === "dislikes" || analyticsType === "comments" || analyticsType === "replies" || analyticsType === "reports") && !selectedVisitor && !selectedAnalyticsPath && !selectedPost && !selectedLikeComment && !selectedReport ? (
                <div className="admin-reaction-view-toggle">
                  <button
                    type="button"
                    className={`admin-reaction-view-button${reactionPostsOnly ? " is-active" : ""}`}
                    aria-pressed={reactionPostsOnly}
                    onClick={() => void showReactionPostsOnly(!reactionPostsOnly)}
                  >
                    {reactionPostsOnly ? "Show all" : "Posts only"}
                  </button>
                </div>
              ) : null}
              <IconButton
                size="lg"
                variant="ghost"
                iconRotateOnHover
                className="admin-analytics-close"
                onClick={() => {
                  setAnalyticsType(null);
                  setAnalyticsLoading(false);
                  setReactionPostsOnly(false);
                  setSelectedPost(null);
                  setPostAnalyticsEvents([]);
                  setSelectedVisitor(null);
                  setVisitorPages([]);
                  setSelectedAnalyticsPath(null);
                  setAnalyticsEvents([]);
                  setSelectedLikeComment(null);
                  setSelectedReport(null);
                }}
                aria-label="Close"
                title="Close analytics"
              >
                <CloseIcon />
              </IconButton>
            </header>
            {analyticsLoading ? (
              <div className="admin-empty">Loading analytics...</div>
            ) : selectedReport ? (
              <div className="admin-analytics-detail admin-like-comment-detail">
                <section className="admin-like-comment-section">
                  <h3>{selectedReport.target_type === "post" ? "Reported post" : selectedReport.target_type === "reply" ? "Reported reply" : "Reported comment"}</h3>
                  <p>{selectedReport.content}</p>
                  <div className="admin-like-comment-meta"><span>{selectedReport.post_title}</span><span>{formatAdminDateTime(selectedReport.created_at)}</span><span>Status: {statusLabel(selectedReport.status)}</span></div>
                </section>
                <section className="admin-like-comment-section">
                  <h3>Report details</h3>
                  <p><strong>Reason:</strong> {statusLabel(selectedReport.reason)}</p>
                  <p>{selectedReport.details || "No additional details provided."}</p>
                  <div className="admin-like-comment-meta"><span>Reported by: {selectedReport.reporter_name || selectedReport.reporter_email || "Registered user"}</span></div>
                </section>
              </div>
            ) : selectedLikeComment ? (
              <div className="admin-analytics-detail admin-like-comment-detail">
                {selectedLikeComment.parent_comment ? <section className="admin-like-comment-section"><h3>Parent comment</h3><p>{selectedLikeComment.parent_comment.content}</p><div className="admin-like-comment-meta"><span>{selectedLikeComment.parent_comment.author_name || "User"}</span><span>{formatAdminDateTime(selectedLikeComment.parent_comment.created_at)}</span></div></section> : null}
                <section className="admin-like-comment-section">
                  <h3>{selectedLikeComment.parent ? "Reply" : "Comment"}</h3>
                  <p>{selectedLikeComment.content}</p>
                  <div className="admin-like-comment-meta"><span>{selectedLikeComment.author_name || "User"}</span><span>{formatAdminDateTime(selectedLikeComment.created_at)}</span><span>Status: {statusLabel(selectedLikeComment.status || "unknown")}</span>{selectedLikeComment.edited ? <span>Edited</span> : null}{selectedLikeComment.is_admin_reply ? <span>Admin reply</span> : null}</div>
                  <div className="admin-like-comment-stats"><span>{formatCompactNumber(selectedLikeComment.likes_count || 0)} likes</span><span>{formatCompactNumber(selectedLikeComment.dislikes_count || 0)} dislikes</span><span>{formatCompactNumber(selectedLikeComment.report_count || 0)} reports</span></div>
                </section>
                {!selectedLikeComment.parent && selectedLikeComment.replies?.length ? <section className="admin-like-comment-section"><h3>Replies ({selectedLikeComment.replies.length})</h3><div className="admin-like-comment-replies">{selectedLikeComment.replies.map((reply: any) => <article key={reply.id}><p>{reply.content}</p><div className="admin-like-comment-meta"><span>{reply.author_name || "User"}</span><span>{formatAdminDateTime(reply.created_at)}</span>{reply.is_admin_reply ? <span>Admin reply</span> : null}</div></article>)}</div></section> : null}
              </div>
             ) : analyticsType === "tags" && !selectedPost && !selectedVisitor ? (
                analyticsLoading ? (
                  <div className="admin-empty">Loading tag statistics...</div>
                ) : (
                  <div className="admin-tags-summary">
                    <article><span>Total tags</span><strong>{formatCompactNumber(tagTotals.total)}</strong><small>All created tags</small></article>
                    <article><span>Used tags</span><strong>{formatCompactNumber(tagTotals.used)}</strong><small>Used in at least one post</small></article>
                    <article><span>Unused tags</span><strong>{formatCompactNumber(tagTotals.unused)}</strong><small>Not assigned to any post</small></article>
                  </div>
                )
             ) : analyticsType === "shares" && !selectedPost && !selectedVisitor ? (
                analyticsLoading ? (
                  <div className="admin-empty">Loading share analytics...</div>
                ) : (
                  <>
                    <div className="admin-shares-summary">
                      <article><span>Total shares</span><strong>{formatCompactNumber(shareAnalytics.total)}</strong><small>All recorded share actions</small></article>
                      <article><span>Unique visitors</span><strong>{formatCompactNumber(shareAnalytics.unique_visitors)}</strong><small>Users and anonymous visitors</small></article>
                      <article><span>Posts shared</span><strong>{formatCompactNumber(shareAnalytics.posts_shared)}</strong><small>Posts with at least one share</small></article>
                    </div>
                    {shareAnalytics.events.length === 0 ? <div className="admin-empty">No shares recorded yet.</div> : <>
                    <div className="admin-analytics-table-wrap">
                      <table className="admin-analytics-table admin-likes-analytics-table admin-shares-table">
                        <thead><tr><th>Post</th><th>Visitor</th><th>Sharing method</th><th>Date</th></tr></thead>
                        <tbody>{shareAnalytics.events.slice((shareAnalyticsPage - 1) * analyticsPageSize, shareAnalyticsPage * analyticsPageSize).map((item, index) => {
                          const channelLabels: Record<string, string> = { copy: "Copy Link", native: "Native Share", dismissed: "Share Menu Closed", whatsapp: "WhatsApp", facebook: "Facebook", telegram: "Telegram", x: "X", twitter: "X", linkedin: "LinkedIn", email: "Email" };
                          return <tr key={`${item.post_id}-${item.created_at}-${index}`}>
                            <td><span className="admin-likes-post-link" title={item.post__title_en}>{item.post__title_en}</span></td>
                            <td className="admin-shares-visitor-cell">
                              {item.visitor_id ? (
                                <button
                                  type="button"
                                  className="admin-analytics-link admin-likes-user-link"
                                  title={item.user_name ? formatPersonName(item.user_name) : item.visitor_id}
                                  onClick={() => void openPostEventVisitor(item.visitor_id)}
                                >
                                  {item.user_name ? formatPersonName(item.user_name) : item.user_auth_id ? "Registered user" : `Anonymous (${item.visitor_id.slice(0, 8)})`}
                                </button>
                              ) : item.user_name ? formatPersonName(item.user_name) : item.user_auth_id ? "Registered user" : "Anonymous visitor"}
                            </td>
                            <td>{channelLabels[item.channel] || statusLabel(item.channel || "other")}</td>
                            <td>{formatAdminDateTime(item.created_at)}</td>
                          </tr>;
                        })}</tbody>
                      </table>
                    </div>
                    <AnalyticsPagination total={shareAnalytics.events.length} page={shareAnalyticsPage} pageSize={analyticsPageSize} onPageChange={setShareAnalyticsPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setShareAnalyticsPage(1); }} />
                    </>}
                  </>
                )
             ) : analyticsType === "saved" && !selectedPost && !selectedVisitor ? (
                savedPostRows.length === 0 ? <div className="admin-empty">No saved posts recorded yet.</div> : (
                  <>
                    <div className="admin-saved-posts-summary">
                      <article><span>Total posts</span><strong>{formatCompactNumber(savedPostTotals.posts)}</strong></article>
                      <article><span>Total saved</span><strong>{formatCompactNumber(savedPostTotals.saves)}</strong></article>
                      <article><span>Total users</span><strong>{formatCompactNumber(savedPostTotals.users)}</strong></article>
                    </div>
                    <div className="admin-analytics-table-wrap">
                      <table className="admin-analytics-table admin-likes-analytics-table admin-saved-posts-table">
                        <thead><tr><th>Post</th><th>Total saves</th><th>Total users</th></tr></thead>
                        <tbody>{savedPostRows.slice((savedPostsPage - 1) * analyticsPageSize, savedPostsPage * analyticsPageSize).map((item) => (
                          <tr key={item.post_id}>
                            <td><button type="button" className="admin-analytics-link admin-likes-post-link" title={item.post_title} onClick={() => void openPostEvents({ id: item.post_id, title: item.post_title, slug: item.post_slug, views: 0, unique_visitors: 0, last_viewed: null })}>{item.post_title}</button></td>
                            <td>{formatCompactNumber(item.saves)}</td><td>{formatCompactNumber(item.users)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <AnalyticsPagination total={savedPostRows.length} page={savedPostsPage} pageSize={analyticsPageSize} onPageChange={setSavedPostsPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setSavedPostsPage(1); }} />
                  </>
                )
             ) : analyticsType === "subscribers" && !selectedPost && !selectedVisitor ? (
                analyticsLoading ? (
                  <div className="admin-empty admin-subscribers-loading">Refreshing subscriber analytics...</div>
                ) : (
                  <>
                    <div className="admin-subscribers-summary">
                      <button type="button" className={subscriberView === "active" ? "is-active" : ""} aria-pressed={subscriberView === "active"} onClick={() => loadSubscriberView("active")}><span>Active subscribers</span><strong>{formatCompactNumber(subscriberTotals.total)}</strong></button>
                      <button type="button" className={subscriberView === "registered" ? "is-active" : ""} aria-pressed={subscriberView === "registered"} onClick={() => loadSubscriberView("registered")}><span>Registered users</span><strong>{formatCompactNumber(subscriberTotals.registered)}</strong></button>
                      <button type="button" className={subscriberView === "subscriptions" ? "is-active" : ""} aria-pressed={subscriberView === "subscriptions"} onClick={() => loadSubscriberView("subscriptions")}><span>Total subscriptions</span><strong>{formatCompactNumber(subscriberTotals.subscriptions)}</strong></button>
                      <button type="button" className={subscriberView === "resubscriptions" ? "is-active" : ""} aria-pressed={subscriberView === "resubscriptions"} onClick={() => loadSubscriberView("resubscriptions")}><span>Resubscriptions</span><strong>{formatCompactNumber(subscriberTotals.resubscriptions)}</strong></button>
                      <button type="button" className={subscriberView === "unsubscriptions" ? "is-active" : ""} aria-pressed={subscriberView === "unsubscriptions"} onClick={() => loadSubscriberView("unsubscriptions")}><span>Unsubscriptions</span><strong>{formatCompactNumber(subscriberTotals.unsubscriptions)}</strong></button>
                    </div>
                    {subscriberRows.length === 0 ? (
                      <div className="admin-empty">No {subscriberView === "active" ? "active subscribers" : subscriberView === "registered" ? "registered subscribers" : subscriberView} found.</div>
                    ) : (() => {
                      const filteredSubscribers = subscriberRows;
                      const isHistory = subscriberView === "subscriptions" || subscriberView === "resubscriptions" || subscriberView === "unsubscriptions";
                      return filteredSubscribers.length === 0 ? <div className="admin-empty">No subscribers match your search.</div> : (
                        <>
                          <div className="admin-analytics-table-wrap">
                            <table className={`admin-analytics-table admin-likes-analytics-table admin-subscribers-table${isHistory ? " is-history" : ""}`}>
                              <thead><tr><th>Full name</th><th>Email</th>{isHistory ? <><th>Activity</th><th>Date</th></> : <th>Subscribed at</th>}</tr></thead>
                              <tbody>{filteredSubscribers.slice((subscribersPage - 1) * analyticsPageSize, subscribersPage * analyticsPageSize).map((item) => {
                                const dateTime = formatAdminDateTime(item.subscribed_at);
                                return <tr key={item.id}>
                                  <td>
                                    {item.full_name ? (
                                      <button type="button" className="admin-analytics-link admin-likes-user-link" title={formatPersonName(item.full_name)}
                                        onClick={() => item.visitor_id ? void openPostEventVisitor(item.visitor_id) : window.location.href = `mailto:${encodeURIComponent(item.email)}`}>
                                        {formatPersonName(item.full_name)}
                                      </button>
                                    ) : "—"}
                                  </td>
                                  <td>{item.email}</td>
                                  {isHistory ? <><td>{item.event_type === "unsubscribed" ? "Unsubscribed" : "Subscribed"}</td><td>{dateTime}</td></> : <td>{dateTime}</td>}
                                </tr>;
                              })}</tbody>
                            </table>
                          </div>
                          <AnalyticsPagination total={filteredSubscribers.length} page={subscribersPage} pageSize={analyticsPageSize} onPageChange={setSubscribersPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setSubscribersPage(1); }} />
                        </>
                      );
                    })()}
                  </>
                )
             ) : analyticsType === "reports" && !selectedPost && !selectedVisitor ? (
                reactionPostsOnly ? (
                  reportPostRows.length === 0 ? <div className="admin-empty">No reports recorded yet.</div> : (
                    <>
                      <div className="admin-analytics-table-wrap">
                        <table className="admin-analytics-table admin-reaction-posts-table admin-report-posts-summary-table">
                          <thead><tr><th>Post</th><th>Views</th><th>Post reports</th><th>Comment reports</th><th>Reply reports</th><th>Total reports</th></tr></thead>
                          <tbody>{visibleReportPostRows.map((post) => (
                            <tr key={post.id}>
                              <td><button type="button" className="admin-analytics-link" title={post.title} onClick={() => void openPostEvents({ id: post.id, title: post.title, slug: post.slug, views: post.views, unique_visitors: 0, last_viewed: null })}>{post.title}</button></td>
                              <td>{formatCompactNumber(post.views)}</td>
                              <td>{formatCompactNumber(post.postReports)}</td>
                              <td>{formatCompactNumber(post.commentReports)}</td>
                              <td>{formatCompactNumber(post.replyReports)}</td>
                              <td>{formatCompactNumber(post.postReports + post.commentReports + post.replyReports)}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                      <AnalyticsPagination total={reportPostRows.length} page={reportsAnalyticsPage} pageSize={analyticsPageSize} onPageChange={setReportsAnalyticsPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setReportsAnalyticsPage(1); }} />
                    </>
                  )
                ) : reportAnalyticsEvents.length === 0 ? <div className="admin-empty">No reports recorded yet.</div> : (
                  <>
                    <div className="admin-analytics-table-wrap">
                      <table className="admin-analytics-table admin-reports-analytics-table">
                        <thead><tr><th>Type</th><th>Post</th><th>Reported content</th><th>Reason</th><th>Reported by</th><th>Reported at</th></tr></thead>
                        <tbody>{visibleReportEvents.map((item) => (
                          <tr key={item.id}>
                            <td><span className="admin-analytics-type-label">{item.target_type === "post" ? "Post" : item.target_type === "reply" ? "Reply" : "Comment"}</span></td>
                            <td><button type="button" className="admin-analytics-link admin-likes-post-link" title={item.post_title} onClick={() => void openPostEvents({ id: item.post_id, title: item.post_title, slug: item.post_slug, views: 0, unique_visitors: 0, last_viewed: null })}>{item.post_title}</button></td>
                            <td><button type="button" className="admin-likes-content-link is-comment" onClick={() => setSelectedReport(item)}><span className="admin-analytics-like-content">{item.content}</span></button></td>
                            <td>{statusLabel(item.reason)}</td>
                            <td className="admin-reports-reporter-cell">
                              {item.visitor_id ? (
                                <button
                                  type="button"
                                  className="admin-analytics-link admin-likes-user-link"
                                  title={item.reporter_name || item.reporter_email || "Registered user"}
                                  onClick={() => { setSelectedReport(null); void openPostEventVisitor(item.visitor_id); }}
                                >
                                  {item.reporter_name ? formatPersonName(item.reporter_name) : item.reporter_email || "Registered user"}
                                </button>
                              ) : (
                                item.reporter_name ? formatPersonName(item.reporter_name) : item.reporter_email || "Registered user"
                              )}
                            </td>
                            <td className="admin-reports-date-cell">
                              {formatAdminDateTime(item.created_at)}
                            </td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <AnalyticsPagination total={reportAnalyticsEvents.length} page={reportsAnalyticsPage} pageSize={analyticsPageSize} onPageChange={setReportsAnalyticsPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setReportsAnalyticsPage(1); }} />
                  </>
                )
             ) : (analyticsType === "comments" || analyticsType === "replies") && !selectedPost && !selectedVisitor ? (
               reactionPostsOnly ? (
                 commentPostRows.length === 0 ? (
                   <div className="admin-empty">No posts with comments or replies recorded yet.</div>
                 ) : (
                   <>
                     <div className="admin-analytics-table-wrap">
                       <table className="admin-analytics-table admin-reaction-posts-table">
                         <thead><tr><th>Post</th><th>Views</th><th>Comments</th><th>Replies</th></tr></thead>
                         <tbody>
                           {visibleCommentPostRows.map((post) => (
                             <tr key={post.id}>
                               <td><button type="button" className="admin-analytics-link" title={post.title} onClick={() => void openPostEvents({ id: post.id, title: post.title, slug: post.slug, views: post.views, unique_visitors: 0, last_viewed: null })}>{post.title}</button></td>
                               <td>{formatCompactNumber(post.views)}</td>
                               <td>{formatCompactNumber(post.comments)}</td>
                               <td>{formatCompactNumber(post.replies)}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                     <AnalyticsPagination total={commentPostRows.length} page={commentReplyPage} pageSize={analyticsPageSize} onPageChange={setCommentReplyPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setCommentReplyPage(1); }} />
                   </>
                 )
               ) : commentReplyEvents.length === 0 ? (
                  <div className="admin-empty">No {analyticsType === "replies" ? "replies" : "comments"} recorded yet.</div>
               ) : (
                 <>
                   <div className="admin-analytics-table-wrap">
                     <table className="admin-analytics-table admin-likes-analytics-table">
                       <thead><tr><th>{analyticsType === "replies" ? "Reply" : "Comment"}</th><th>Post</th><th>Content</th><th>{analyticsType === "replies" ? "Replied by" : "Commented by"}</th><th>{analyticsType === "replies" ? "Replied at" : "Commented at"}</th></tr></thead>
                       <tbody>
                         {visibleCommentReplyEvents.map((item) => (
                            <tr key={item.id}>
                              <td><span className="admin-analytics-type-label">{analyticsType === "replies" ? "Reply" : "Comment"}</span></td>
                             <td>
                               <button type="button" className="admin-analytics-link admin-likes-post-link" title={item.post_title} onClick={() => void openPostEvents({ id: item.post_id, title: item.post_title, slug: item.post_slug, views: 0, unique_visitors: 0, last_viewed: null })}>{item.post_title}</button>
                             </td>
                             <td title={item.target_type === "reply" ? `Reply: ${item.content}` : item.content}>
                               {item.target_type === "reply" ? (
                                 <div className="admin-likes-reply-content">
                                   <button type="button" className="admin-likes-content-link is-reply-content" onClick={() => void openLikeComment(item, analyticsType === "replies" ? "reply" : "comment")} aria-label={analyticsType === "replies" ? "Open reply details" : "Open comment details"}>
                                     <span className="admin-analytics-like-content">{item.content}</span>
                                   </button>
                                 </div>
                               ) : (
                                 <button type="button" className="admin-likes-content-link is-comment" onClick={() => void openLikeComment(item, analyticsType === "replies" ? "reply" : "comment")} aria-label={analyticsType === "replies" ? "Open reply details" : "Open comment details"}>
                                   <span className="admin-analytics-like-content">{item.content}</span>
                                 </button>
                               )}
                             </td>
                             <td className="admin-likes-user-cell">
                               {item.visitor_id ? (
                                 <button type="button" className="admin-analytics-link admin-likes-user-link" onClick={() => void openPostEventVisitor(item.visitor_id)} title={item.user_name || item.user_email || "Registered user"}>
                                   {item.user_name ? formatPersonName(item.user_name) : item.user_email || "Registered user"}
                                 </button>
                               ) : item.user_name ? formatPersonName(item.user_name) : item.user_email || "Registered user"}
                             </td>
                             <td>{formatAdminDateTime(item.created_at)}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                   <AnalyticsPagination total={commentReplyEvents.length} page={commentReplyPage} pageSize={analyticsPageSize} onPageChange={setCommentReplyPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setCommentReplyPage(1); }} />
                 </>
               )
             ) : (analyticsType === "likes" || analyticsType === "dislikes") && !selectedPost && !selectedVisitor ? (
              reactionPostsOnly ? (
                reactionPostRows.length === 0 ? (
                  <div className="admin-empty">No posts with {analyticsType === "dislikes" ? "dislikes" : "likes"} recorded yet.</div>
                ) : (
                  <>
                    <div className="admin-analytics-table-wrap">
                      <table className="admin-analytics-table admin-reaction-posts-table">
                        <thead>
                          <tr>
                            <th>Post</th>
                            <th>Views</th>
                            <th>{analyticsType === "dislikes" ? "Dislikes" : "Likes"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleReactionPostRows.map((post) => (
                            <tr key={post.id}>
                              <td>
                                <button
                                  type="button"
                                  className="admin-analytics-link"
                                  title={post.title}
                                  onClick={() => void openPostEvents({
                                    id: post.id,
                                    title: post.title,
                                    slug: post.slug,
                                    views: post.views,
                                    unique_visitors: 0,
                                    last_viewed: null,
                                  })}
                                >
                                  {post.title}
                                </button>
                              </td>
                              <td>{formatCompactNumber(post.views)}</td>
                              <td>{formatCompactNumber(post.reactions)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <AnalyticsPagination
                      total={reactionPostRows.length}
                      page={likeAnalyticsPage}
                      pageSize={analyticsPageSize}
                      onPageChange={setLikeAnalyticsPage}
                      onPageSizeChange={(size) => {
                        setAnalyticsPageSize(size);
                        setLikeAnalyticsPage(1);
                      }}
                    />
                  </>
                )
              ) : likeAnalyticsEvents.length === 0 ? (
                <div className="admin-empty">No {analyticsType === "dislikes" ? "dislikes" : "likes"} recorded yet.</div>
              ) : (
                <>
                  <div className="admin-analytics-table-wrap">
                    <table className="admin-analytics-table admin-likes-analytics-table">
                      <thead>
                        <tr>
                          <th>{analyticsType === "dislikes" ? "Disliked item" : "Liked item"}</th>
                          <th>Post</th>
                          <th>Content</th>
                          <th>{analyticsType === "dislikes" ? "Disliked by" : "Liked by"}</th>
                          <th>{analyticsType === "dislikes" ? "Disliked at" : "Liked at"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {likeAnalyticsEvents.slice((likeAnalyticsPage - 1) * analyticsPageSize, likeAnalyticsPage * analyticsPageSize).map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className="admin-analytics-type-label">
                                {item.target_type === "post" ? "Post" : item.target_type === "comment" ? "Comment" : "Reply"}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-analytics-link admin-likes-post-link"
                                ref={(element) => {
                                  if (element) likePostRefs.current.set(item.id, element);
                                  else likePostRefs.current.delete(item.id);
                                }}
                                title={item.post_title}
                                onClick={() => void openPostEvents({
                                  id: item.post_id,
                                  title: item.post_title,
                                  slug: item.post_slug,
                                  views: 0,
                                  unique_visitors: 0,
                                  last_viewed: null,
                                })}
                              >
                                {item.post_title}
                              </button>
                            </td>
                            <td title={item.target_type === "reply" ? `Reply: ${item.content}` : item.content}>
                              {item.target_type === "post" ? (
                                <span className="admin-analytics-like-content">{analyticsType === "dislikes" ? "Disliked this post" : "Liked this post"}</span>
                              ) : item.target_type === "comment" ? (
                                <button
                                  type="button"
                                  className="admin-likes-content-link is-comment"
                                  onClick={() => void openLikeComment(item, "comment")}
                                  aria-label="Open comment details"
                                >
                                  <span className="admin-analytics-like-content" ref={(element) => { if (element) likeContentRefs.current.set(item.id, element); else likeContentRefs.current.delete(item.id); }}>{item.content}</span>
                                </button>
                              ) : (
                                <div className="admin-likes-reply-content">
                                  <button
                                    type="button"
                                    className="admin-likes-content-link is-reply-content"
                                    onClick={() => void openLikeComment(item, "reply")}
                                    aria-label="Open reply details"
                                  >
                                    <span className="admin-analytics-like-content">{item.content}</span>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="admin-likes-user-cell">
                              {item.visitor_id ? (
                                <button
                                  type="button"
                                  className="admin-analytics-link admin-likes-user-link"
                                  onClick={() => void openPostEventVisitor(item.visitor_id)}
                                  title={item.user_name || item.user_email || "Registered user"}
                                >
                                  {item.user_name
                                    ? formatPersonName(item.user_name)
                                    : item.user_email || "Registered user"}
                                </button>
                              ) : (
                                item.user_name
                                  ? formatPersonName(item.user_name)
                                  : item.user_email || "Registered user"
                              )}
                            </td>
                            <td>{formatAdminDateTime(item.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <AnalyticsPagination
                    total={likeAnalyticsEvents.length}
                    page={likeAnalyticsPage}
                    pageSize={analyticsPageSize}
                    onPageChange={setLikeAnalyticsPage}
                    onPageSizeChange={(size) => {
                      setAnalyticsPageSize(size);
                      setLikeAnalyticsPage(1);
                    }}
                  />
                </>
              )
            ) : selectedVisitor ? (
              <div className="admin-analytics-detail">
                <div className="admin-visitor-summary">
                  <strong>
                    {selectedVisitor.visitor_type === "user"
                      ? formatPersonName(selectedVisitor.full_name) ||
                        "Registered user"
                      : "Anonymous"}
                  </strong>
                  <span>
                    IP: {selectedVisitor.ip_address || "Not available"}
                  </span>
                  <span>
                    {formatCompactNumber(selectedVisitor.total_pages)} pages ·{" "}
                    {formatCompactNumber(selectedVisitor.total_views)} total views
                  </span>
                  <span>
                    First visit:{" "}
                    {formatAdminDateTime(selectedVisitor.first_seen)}
                  </span>
                  <span>
                    Last visit:{" "}
                    {formatAdminDateTime(selectedVisitor.last_seen)}
                  </span>
                  <span>Browser: {selectedVisitor.browser || "Unknown"}</span>
                  <span>
                    Device: {selectedVisitor.device} · Language:{" "}
                    {selectedVisitor.language || "—"}
                  </span>
                </div>
                <div className="admin-analytics-table-wrap admin-visitor-details-table-wrap">
                  <table className="admin-analytics-table admin-visitor-details-table">
                    <thead>
                      <tr>
                        <th>Page visited</th>
                        <th>Views</th>
                        <th>Last viewed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleVisitorPages.map((item) => (
                        <tr key={item.path}>
                          <td>
                            <button
                              type="button"
                              className="admin-analytics-link"
                              title={item.path}
                              aria-label={`Open analytics for ${item.path}`}
                              onClick={() => void openVisitorPageEvents(item.path)}
                            >
                              {item.path}
                            </button>
                          </td>
                          <td>{formatCompactNumber(item.views)}</td>
                          <td>
                            {item.last_viewed
                              ? formatAdminDateTime(item.last_viewed)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <AnalyticsPagination
                  className="admin-visitor-details-pagination"
                  total={visitorPages.length}
                  page={visitorPagesPage}
                  pageSize={visitorPageSize}
                  onPageChange={setVisitorPagesPage}
                  onPageSizeChange={() => setVisitorPagesPage(1)}
                  alwaysShow
                  showPageSize={false}
                />
              </div>
            ) : selectedPost ? (
              <>
                <div className="admin-analytics-table-wrap">
                  <table className="admin-analytics-table">
                    <thead><tr><th>Visitor</th><th>Browser</th><th>Device</th><th>Language</th><th>Referrer</th><th>Viewed at</th></tr></thead>
                    <tbody>
                      {postAnalyticsEvents.slice((analyticsEventsPage - 1) * analyticsPageSize, analyticsEventsPage * analyticsPageSize).map((event, index) => (
                        <tr key={event.visitor_id + event.viewed_at + index}>
                          <td>
                            <button
                              type="button"
                              className="admin-analytics-link"
                              onClick={() => void openPostEventVisitor(event.visitor_id, selectedPost?.id)}
                            >
                              {event.visitor_type === "user"
                                ? formatPersonName(event.full_name) || "Registered user"
                                : "Anonymous"}
                            </button>
                          </td>
                          <td>{event.browser || "Unknown"}</td><td>{event.device}</td><td>{event.language || "—"}</td>
                          <td className="admin-analytics-referrer"><span>{event.referrer_url || "Direct"}</span></td>
                          <td>{formatAdminDateTime(event.viewed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <AnalyticsPagination total={postAnalyticsEvents.length} page={analyticsEventsPage} pageSize={analyticsPageSize} onPageChange={setAnalyticsEventsPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setAnalyticsEventsPage(1); }} />
              </>
            ) : selectedAnalyticsPath ? (
              <>
              <div className="admin-analytics-table-wrap">
                <table className="admin-analytics-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>IP address</th>
                      <th>Browser</th>
                      <th>Device</th>
                      <th>Language</th>
                      <th>Referrer</th>
                      <th>Viewed at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAnalyticsEvents.map((event, index) => (
                      <tr key={event.visitor_id + event.viewed_at + index}>
                        <td>
                          <button
                            type="button"
                            className="admin-analytics-link"
                            onClick={() => void openPostEventVisitor(event.visitor_id)}
                          >
                            {event.visitor_type === "user"
                              ? formatPersonName(event.full_name) || "Registered user"
                              : "Anonymous"}
                          </button>
                        </td>
                        <td>{event.ip_address || "—"}</td>
                        <td>{event.browser || "Unknown"}</td>
                        <td>{event.device}</td>
                        <td>{event.language || "—"}</td>
                        <td className="admin-analytics-referrer">
                          <span>{event.referrer_url || "Direct"}</span>
                        </td>
                        <td>{formatAdminDateTime(event.viewed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AnalyticsPagination
                total={analyticsEvents.length}
                page={analyticsEventsPage}
                pageSize={analyticsPageSize}
                onPageChange={setAnalyticsEventsPage}
                onPageSizeChange={(size) => {
                  setAnalyticsPageSize(size);
                  setAnalyticsEventsPage(1);
                }}
              />
              </>
            ) : analyticsType === "drafts" || analyticsType === "review" ? (
              statusAnalyticsPosts.length === 0 ? (
                <div className="admin-empty">
                  {analyticsType === "drafts" ? "No draft posts found." : "No posts are waiting for review."}
                </div>
              ) : (
                <>
                  <div className="admin-analytics-table-wrap">
                    <table className="admin-analytics-table admin-post-views-table admin-content-status-table">
                      <thead><tr><th>Post</th><th>Category</th><th>Last updated</th><th>Status</th></tr></thead>
                      <tbody>
                        {statusAnalyticsPosts.slice((analyticsPagesPage - 1) * analyticsPageSize, analyticsPagesPage * analyticsPageSize).map((post) => {
                          const kind = CONTENT_KINDS.find((item) => item.slug === post.category?.slug);
                          return (
                            <tr key={post.id}>
                              <td><Link className="admin-analytics-link" href={`/admin/edit-post/${kind?.api || "jobs"}/${post.slug}`} title={post.title_en}>{post.title_en}</Link></td>
                              <td>{kind?.label || post.category?.name_en || "—"}</td>
                              <td>{post.updated_at ? formatAdminDateTime(post.updated_at) : "—"}</td>
                              <td>{statusLabel(post.status)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <AnalyticsPagination total={statusAnalyticsPosts.length} page={analyticsPagesPage} pageSize={analyticsPageSize} onPageChange={setAnalyticsPagesPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setAnalyticsPagesPage(1); }} />
                </>
              )
            ) : analyticsType === "posts" ? (
              postAnalyticsPages.length === 0 ? (
                <div className="admin-empty">No post views recorded yet.</div>
              ) : (
                <>
                  <div className="admin-analytics-table-wrap">
                    <table className="admin-analytics-table admin-post-views-table">
                      <thead><tr><th>Post</th><th>Total views</th><th>Unique visitors</th><th>Last viewed</th></tr></thead>
                      <tbody>
                        {postAnalyticsPages.slice((analyticsPagesPage - 1) * analyticsPageSize, analyticsPagesPage * analyticsPageSize).map((item) => (
                          <tr key={item.id}>
                            <td><button type="button" className="admin-analytics-link" title={item.title} aria-label={"View details for " + item.title} onClick={() => void openPostEvents(item)}>{item.title}</button></td>
                            <td>{formatCompactNumber(item.views)}</td><td>{formatCompactNumber(item.unique_visitors)}</td>
                            <td>{item.last_viewed ? formatAdminDateTime(item.last_viewed) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <AnalyticsPagination total={postAnalyticsPages.length} page={analyticsPagesPage} pageSize={analyticsPageSize} onPageChange={setAnalyticsPagesPage} onPageSizeChange={(size) => { setAnalyticsPageSize(size); setAnalyticsPagesPage(1); }} />
                </>
              )
            ) : analyticsType === "views" ? (
              analyticsPages.length === 0 ? (
                <div className="admin-empty">
                  No website views recorded yet.
                </div>
              ) : (
                <>
                <div className="admin-analytics-table-wrap">
                  <table className="admin-analytics-table admin-website-views-table">
                    <thead>
                      <tr>
                        <th>Page link</th>
                        <th>Total views</th>
                        <th>Unique visitors</th>
                        <th>Last viewed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAnalyticsPages.map((item) => (
                          <tr key={item.path}>
                            <td>
                              <button
                                type="button"
                                className="admin-analytics-link"
                                title={item.path}
                                aria-label={`View details for ${item.path}`}
                                onClick={() => void openPageEvents(item.path)}
                              >
                                {item.path}
                              </button>
                            </td>
                            <td>{formatCompactNumber(item.views)}</td>
                            <td>
                              {formatCompactNumber(item.unique_visitors)}
                            </td>
                            <td>
                              {item.last_viewed
                                ? formatAdminDateTime(item.last_viewed)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <AnalyticsPagination
                  total={analyticsPages.length}
                  page={analyticsPagesPage}
                  pageSize={analyticsPageSize}
                  onPageChange={setAnalyticsPagesPage}
                  onPageSizeChange={(size) => {
                    setAnalyticsPageSize(size);
                    setAnalyticsPagesPage(1);
                  }}
                />
                </>
              )
            ) : analyticsVisitors.length === 0 ? (
              <div className="admin-empty">No visitors recorded yet.</div>
            ) : (
              <>
              <div className="admin-analytics-table-wrap">
                <table className="admin-analytics-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>IP address</th>
                      <th>Browser</th>
                      <th>Device</th>
                      <th>Pages</th>
                      <th>Total views</th>
                      <th>Language</th>
                      <th>First visit</th>
                      <th>Last visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAnalyticsVisitors.map((visitor) => (
                      <tr key={visitor.visitor_id}>
                        <td>
                          <button
                            type="button"
                            className="admin-analytics-link"
                            onClick={() => void openVisitorDetails(visitor)}
                          >
                            {visitor.visitor_type === "user"
                              ? formatPersonName(visitor.full_name) ||
                                "Registered user"
                              : "Anonymous"}
                          </button>
                        </td>
                        <td>{visitor.ip_address || "—"}</td>
                        <td>{visitor.browser || "Unknown"}</td>
                        <td>{visitor.device}</td>
                        <td>{formatCompactNumber(visitor.total_pages)}</td>
                        <td>{formatCompactNumber(visitor.total_views)}</td>
                        <td>{visitor.language || "—"}</td>
                        <td>{formatAdminDateTime(visitor.first_seen)}</td>
                        <td>{formatAdminDateTime(visitor.last_seen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AnalyticsPagination
                total={analyticsVisitors.length}
                page={analyticsVisitorsPage}
                pageSize={analyticsPageSize}
                onPageChange={setAnalyticsVisitorsPage}
                onPageSizeChange={(size) => {
                  setAnalyticsPageSize(size);
                  setAnalyticsVisitorsPage(1);
                }}
              />
              </>
            )}
            <footer>
              <span>
                {selectedVisitor
                  ? formatCompactNumber(visitorPages.length) + " pages visited"
                  : selectedPost
                    ? formatCompactNumber(postAnalyticsEvents.length) + " post view events"
                    : selectedAnalyticsPath
                      ? analyticsEvents.length + " recent view events"
                      : analyticsType === "likes"
                        ? formatCompactNumber(likeAnalyticsEvents.length) + " like events"
                        : analyticsType === "reports"
                          ? formatCompactNumber(reportAnalyticsEvents.length) + " reports"
                        : analyticsType === "dislikes"
                          ? formatCompactNumber(likeAnalyticsEvents.length) + " dislike events"
                          : analyticsType === "comments"
                            ? formatCompactNumber(commentReplyEvents.length) + " comment events"
                            : analyticsType === "replies"
                              ? formatCompactNumber(commentReplyEvents.length) + " reply events"
                        : analyticsType === "drafts" || analyticsType === "review"
                          ? formatCompactNumber(statusAnalyticsPosts.length) + " posts"
                        : analyticsType === "posts"
                          ? formatCompactNumber(postAnalyticsPages.length) + " posts tracked"
                          : analyticsType === "views"
                          ? formatCompactNumber(analyticsPages.length) + " pages tracked"
                          : formatCompactNumber(analyticsVisitors.length) + " unique browsers/devices"}
              </span>
            </footer>
          </section>
        </div>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete post?"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.title_en}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmText="Delete post"
        cancelText="Cancel"
        variant="danger"
        size="md"
        loading={deleteTarget !== null && busyPost === deleteTarget.id}
        closeOnOverlayClick={busyPost === null}
        closeOnEscape={busyPost === null}
        onCancel={() => {
          if (busyPost === null) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDeletePost()}
      />
      <footer className="admin-footer">
        ShivanyaMS · Content Administration
      </footer>
    </main>
  );
}
