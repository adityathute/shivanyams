"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPortalApiUrl, API_URL } from "../category/CategoryGrid";

export type ItemType =
  | "job"
  | "scheme"
  | "examination"
  | "result"
  | "admit"
  | "exam"
  | "guide"
  | "video"
  | "tool";

export type JobDetails = {
  advertisement_no: string;
  total_posts: string;
  examination_name: string;
  post_details: string;
  educational_qualification: string;
  location: string;
  age_limit: string;
  application_fee: string;
  application_mode: string;
  interview_venue: string;
  important_dates: { label: string; date: string }[];
  important_links: { label: string; url: string }[];
};

export type Item = {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  link: string;
  type: ItemType;
  slug?: string;
  body?: string;
  image?: string;
  organization?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  event_date?: string;
  extra?: Record<string, unknown>;
  job_details?: JobDetails;
};

export type Video = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  language: string;
  slug?: string;
};

export type PortalData = {
  items: Item[];
  videos: Video[];
  loading: boolean;
  error: string;
};

type ApiLink = {
  name_en?: string;
  name_mr?: string;
  name_hi?: string;
  url: string;
  is_active?: boolean;
};

type ApiPost = {
  id: number | string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  slug: string;
  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  body_en?: string;
  body_mr?: string;
  body_hi?: string;
  category?: {
    name_en?: string;
    name_mr?: string;
    name_hi?: string;
    slug?: string;
  } | null;
  organization?: { name_en?: string; name_mr?: string; name_hi?: string } | null;
  location?: string;
  start_date?: string | null;
  end_date?: string | null;
  event_date?: string | null;
  featured_image_url?: string;
  published_at?: string | null;
  important_links?: ApiLink[];
  job_details?: {
    advertisement_no?: string;
    total_vacancies?: number | null;
    designation?: string;
    post_details?: string;
    educational_qualification?: string;
    age_min?: number | null;
    age_max?: number | null;
    age_limit_note?: string;
    application_fee?: string;
    application_mode?: string;
    apply_url?: string;
    official_notification_url?: string;
    official_website?: string;
    interview_details?: string;
  } | null;
  scheme_details?: {
    application_url?: string;
    official_website?: string;
  } | null;
  examination_details?: { official_website?: string } | null;
  admit_card_details?: {
    download_url?: string;
    login_url?: string;
    official_website?: string;
  } | null;
  result_details?: {
    result_url?: string;
    merit_list_url?: string;
    official_website?: string;
  } | null;
  article_guide_details?: { source_url?: string } | null;
  video_details?: {
    video_url?: string;
    thumbnail_url?: string;
    available_languages?: string[];
  } | null;
  tool_details?: { tool_key?: string } | null;
};

export const STORAGE_KEY = "shivanyams-portal-data";

const emptyData: PortalData = {
  items: [],
  videos: [],
  loading: true,
  error: "",
};

function getDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getPostTitle(post: ApiPost) {
  return post.title_en || post.title_mr || post.title_hi || "";
}

function getPostSummary(post: ApiPost) {
  return post.summary_en || post.summary_mr || post.summary_hi || "";
}

function getPostBody(post: ApiPost) {
  return post.body_en || post.body_mr || post.body_hi || "";
}

function getPostLink(post: ApiPost) {
  return (
    post.job_details?.apply_url ||
    post.job_details?.official_notification_url ||
    post.scheme_details?.application_url ||
    post.admit_card_details?.download_url ||
    post.admit_card_details?.login_url ||
    post.result_details?.result_url ||
    post.result_details?.merit_list_url ||
    post.video_details?.video_url ||
    post.examination_details?.official_website ||
    post.scheme_details?.official_website ||
    post.admit_card_details?.official_website ||
    post.result_details?.official_website ||
    post.job_details?.official_website ||
    post.article_guide_details?.source_url ||
    post.important_links?.find((link) => link.is_active !== false)?.url ||
    ""
  );
}

function mapPost(post: ApiPost, type: ItemType): Item {
  const job = post.job_details;

  return {
    id: String(post.id),
    slug: post.slug,
    title: getPostTitle(post),
    category:
      post.category?.name_en ||
      post.category?.name_mr ||
      post.category?.name_hi ||
      "",
    date: getDate(post.published_at || post.event_date || post.start_date),
    description: getPostSummary(post),
    link: getPostLink(post),
    type,
    body: getPostBody(post),
    image: post.featured_image_url || post.video_details?.thumbnail_url || "",
    organization:
      post.organization?.name_en ||
      post.organization?.name_mr ||
      post.organization?.name_hi ||
      "",
    location: post.location || "",
    start_date: getDate(post.start_date),
    end_date: getDate(post.end_date),
    event_date: getDate(post.event_date),
    job_details: job
      ? {
          advertisement_no: job.advertisement_no || "",
          total_posts: job.total_vacancies == null ? "" : String(job.total_vacancies),
          examination_name: "",
          post_details: job.post_details || job.designation || "",
          educational_qualification: job.educational_qualification || "",
          location: post.location || "",
          age_limit:
            job.age_limit_note ||
            [job.age_min, job.age_max].filter((value) => value != null).join(" - "),
          application_fee: job.application_fee || "",
          application_mode: job.application_mode || "",
          interview_venue: job.interview_details || "",
          important_dates: [],
          important_links: (post.important_links || []).map((link) => ({
            label: link.name_en || link.name_mr || link.name_hi || "",
            url: link.url,
          })),
        }
      : undefined,
  };
}

async function fetchList<T>(url: string, signal: AbortSignal): Promise<T[]> {
  const results: T[] = [];
  const visited = new Set<string>();
  const apiOrigin = new URL(API_URL).origin;
  let nextUrl: string | null = url;

  while (nextUrl) {
    if (visited.has(nextUrl)) {
      throw new Error("Pagination returned a repeated URL.");
    }
    visited.add(nextUrl);

    const response = await fetch(nextUrl, { signal });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}): ${nextUrl}`);
    }

    const payload: T[] | { results?: T[]; next?: string | null } =
      await response.json();

    if (Array.isArray(payload)) {
      results.push(...payload);
      break;
    }

    results.push(...(payload.results ?? []));
    if (!payload.next) {
      nextUrl = null;
      continue;
    }

    const resolvedNext = new URL(payload.next, url);
    if (resolvedNext.origin !== apiOrigin) {
      throw new Error("Pagination returned a URL outside the portal API.");
    }
    nextUrl = resolvedNext.toString();
  }

  return results;
}

async function loadPortalData(signal: AbortSignal): Promise<PortalData> {
  const contentKinds: { endpoint: string; type: ItemType }[] = [
    { endpoint: "jobs", type: "job" },
    { endpoint: "schemes", type: "scheme" },
    { endpoint: "examination", type: "examination" },
    { endpoint: "admit-card", type: "admit" },
    { endpoint: "results", type: "result" },
    { endpoint: "articles", type: "guide" },
    { endpoint: "videos", type: "video" },
    { endpoint: "tools", type: "tool" },
  ];

  const responses = await Promise.allSettled(
    contentKinds.map(({ endpoint }) =>
      fetchList<ApiPost>(getPortalApiUrl(`content/${endpoint}/`), signal),
    ),
  );

  if (responses.every((response) => response.status === "rejected")) {
    const firstError = responses.find(
      (response): response is PromiseRejectedResult =>
        response.status === "rejected",
    );
    throw firstError?.reason || new Error("Unable to load portal content.");
  }

  const items: Item[] = [];
  const videos: Video[] = [];
  const errors: string[] = [];

  responses.forEach((response, index) => {
    const { type } = contentKinds[index];

    if (response.status === "rejected") {
      if (!signal.aborted) {
        errors.push(`${contentKinds[index].endpoint}: ${String(response.reason)}`);
      }
      return;
    }

    response.value.forEach((post) => {
      const item = mapPost(post, type);

      if (type === "video") {
        videos.push({
          id: item.id,
          slug: item.slug,
          title: item.title,
          url: post.video_details?.video_url || item.link,
          thumbnail: post.video_details?.thumbnail_url || item.image || "",
          language: post.video_details?.available_languages?.join(", ") || "",
        });
      }

      items.push(item);
    });
  });

  return {
    items: items.sort((a, b) => b.date.localeCompare(a.date)),
    videos,
    loading: false,
    error: errors.join("\n"),
  };
}

type PortalDataContextValue = {
  data: PortalData;
  refresh: () => Promise<void>;
};

const PortalDataContext = createContext<PortalDataContextValue | null>(null);

export function PortalDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortalData>(emptyData);

  useEffect(() => {
    const controller = new AbortController();

    loadPortalData(controller.signal)
      .then(setData)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setData({
            items: [],
            videos: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load portal content.",
          });
        }
      });

    return () => controller.abort();
  }, []);

  async function refresh() {
    const controller = new AbortController();
    setData((current) => ({ ...current, loading: true, error: "" }));

    try {
      setData(await loadPortalData(controller.signal));
    } catch (error) {
      setData((current) => ({
        ...current,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load portal content.",
      }));
    }
  }

  return (
    <PortalDataContext.Provider value={{ data, refresh }}>
      {children}
    </PortalDataContext.Provider>
  );
}

export function usePortalData() {
  const context = useContext(PortalDataContext);
  if (!context) {
    throw new Error("usePortalData must be used inside PortalDataProvider");
  }
  return context;
}
