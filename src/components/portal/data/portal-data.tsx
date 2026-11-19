"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPortalApiUrl } from "../category/CategoryGrid";

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

export type JobPostFee = {
  id?: number;
  category_name_en: string;
  category_name_mr: string;
  category_name_hi: string;
  fee_amount: string;
  fee_note_en: string;
  fee_note_mr: string;
  fee_note_hi: string;
  sort_order?: number;
};

export type JobPost = {
  id: number;
  post_number: string;
  post_name_en: string;
  post_name_mr: string;
  post_name_hi: string;
  department_en: string;
  department_mr: string;
  department_hi: string;
  vacancies: number | null;
  educational_qualification_en: string;
  educational_qualification_mr: string;
  educational_qualification_hi: string;
  age_criteria_type: string;
  age_min: number | null;
  age_max: number | null;
  age_as_on_date: string | null;
  eligible_dob_from: string | null;
  eligible_dob_to: string | null;
  age_limit_note_en: string;
  age_limit_note_mr: string;
  age_limit_note_hi: string;
  sort_order?: number;
  fees: JobPostFee[];
};

export type JobDetails = {
  posts?: JobPost[];
  education_mode?: "common" | "per_post";
  age_mode?: "common" | "per_post";
  fee_mode?: "common" | "per_post";
  advertisement_no: string;
  total_posts: string;
  examination_name: string;
  post_details: string;
  educational_qualification: string;
  location: string;
  age_limit: string;
  age_criteria_type?: string;
  age_min?: number | null;
  age_max?: number | null;
  age_as_on_date?: string | null;
  eligible_dob_from?: string | null;
  eligible_dob_to?: string | null;
  age_limit_note_en: string;
  age_limit_note_mr: string;
  age_limit_note_hi: string;
  application_fee: string;
  application_fee_note_en: string;
  application_fee_note_mr: string;
  application_fee_note_hi: string;
  application_mode: string;
  interview_venue: string;
  important_dates: { label: string; date: string }[];
  important_links: {
    label_en: string;
    label_mr: string;
    label_hi: string;
    url: string;
  }[];
};

export type Item = {
  id: string;
  title: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  category: string;
  updated_date?: string;
  category_en?: string;
  category_mr?: string;
  category_hi?: string;

  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  date: string;
  description: string;
  link: string;
  type: ItemType;
  slug?: string;
  body?: string;
  body_en?: string;
  body_mr?: string;
  body_hi?: string;
  image?: string;
  organization?: string;
  organization_type?: string;
  tags: string[];
  location?: string;
  start_date?: string;
  end_date?: string;
  event_date?: string;
  important_dates?: ImportantDate[];
  extra?: Record<string, unknown>;
  job_details?: JobDetails;
};

export type Video = {
  id: string;
  title: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
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

export type ImportantDate = {
  id?: number;
  date_type: string;
  date_format:
    | "single"
    | "range"
    | "month_year"
    | "revised"
    | "revised_with_time"
    | string;
  label_en: string;
  label_mr?: string;
  label_hi?: string;
  date?: string | null;
  time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  month?: number | null;
  year?: number | null;
  month_years?: {
    month: number;
    year: number;
  }[];
  old_date?: string | null;
  new_date?: string | null;
  old_time?: string | null;
  new_time?: string | null;
  description_en?: string;
  description_mr?: string;
  description_hi?: string;
  sort_order?: number;
};

type ApiJobPostFee = {
  id?: number;
  category_name_en?: string;
  category_name_mr?: string;
  category_name_hi?: string;
  fee_amount?: string | number;
  fee_note_en?: string;
  fee_note_mr?: string;
  fee_note_hi?: string;
  sort_order?: number;
};

type ApiJobPost = {
  id: number;
  post_number?: string;
  post_name_en?: string;
  post_name_mr?: string;
  post_name_hi?: string;
  department_en?: string;
  department_mr?: string;
  department_hi?: string;
  vacancies?: number | null;
  educational_qualification_en?: string;
  educational_qualification_mr?: string;
  educational_qualification_hi?: string;
  age_criteria_type?: string;
  age_min?: number | null;
  age_max?: number | null;
  age_as_on_date?: string | null;
  eligible_dob_from?: string | null;
  eligible_dob_to?: string | null;
  age_limit_note_en?: string;
  age_limit_note_mr?: string;
  age_limit_note_hi?: string;
  sort_order?: number;
  fees?: ApiJobPostFee[];
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
  organization_type?: string;
  meta_keywords?: string[];
  location?: string;
  start_date?: string | null;
  end_date?: string | null;
  event_date?: string | null;
  featured_image_url?: string;
  published_at?: string | null;
  updated_at?: string | null;
  important_links?: ApiLink[];
  important_dates?: ImportantDate[];
  job_details?: {
    advertisement_no?: string;
    total_vacancies?: number | null;
    designation?: string;
    post_details?: string;
    educational_qualification?: string;
    age_criteria_type?: string;
    age_min?: number | null;
    age_max?: number | null;
    age_as_on_date?: string | null;
    eligible_dob_from?: string | null;
    eligible_dob_to?: string | null;
    age_limit_note_en?: string;
    age_limit_note_mr?: string;
    age_limit_note_hi?: string;
    application_fee?: string;
    application_fee_note_en?: string;
    application_fee_note_mr?: string;
    application_fee_note_hi?: string;
    application_mode?: string;
    apply_url?: string;
    official_notification_url?: string;
    official_website?: string;
    interview_details?: string;
    posts?: ApiJobPost[];
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

function normalizeComparable(value: unknown) {
  return value == null ? "" : String(value).trim().toLocaleLowerCase();
}

function sameForEveryPost<T>(posts: T[], getValue: (post: T) => unknown) {
  if (posts.length <= 1) return true;
  const first = JSON.stringify(getValue(posts[0]));
  return posts.slice(1).every((post) => JSON.stringify(getValue(post)) === first);
}

function mapPost(post: ApiPost, type: ItemType): Item {
  const job = post.job_details;
  const postDetailsAreCommon = sameForEveryPost(job?.posts || [], (entry) => [
    normalizeComparable(entry.educational_qualification_en),
    normalizeComparable(entry.educational_qualification_mr),
    normalizeComparable(entry.educational_qualification_hi),
    normalizeComparable(entry.age_criteria_type),
    entry.age_min ?? null,
    entry.age_max ?? null,
    getDate(entry.age_as_on_date),
    getDate(entry.eligible_dob_from),
    getDate(entry.eligible_dob_to),
    normalizeComparable(entry.age_limit_note_en),
    normalizeComparable(entry.age_limit_note_mr),
    normalizeComparable(entry.age_limit_note_hi),
    (entry.fees || [])
      .map((fee) => [
        normalizeComparable(fee.category_name_en),
        normalizeComparable(fee.category_name_mr),
        normalizeComparable(fee.category_name_hi),
        fee.fee_amount == null ? "" : String(fee.fee_amount),
        normalizeComparable(fee.fee_note_en),
        normalizeComparable(fee.fee_note_mr),
        normalizeComparable(fee.fee_note_hi),
      ])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  ]);

  return {
    id: String(post.id),
    slug: post.slug,

    // Preserve all database translations
    title_en: post.title_en || "",
    title_mr: post.title_mr || "",
    title_hi: post.title_hi || "",

    title: getPostTitle(post),

    // Default category for existing components
    category:
      post.category?.name_en ||
      post.category?.name_mr ||
      post.category?.name_hi ||
      "",
    updated_date: getDate(post.updated_at),
    // Preserve all category translations
    category_en: post.category?.name_en || "",
    category_mr: post.category?.name_mr || "",
    category_hi: post.category?.name_hi || "",

    summary_en: post.summary_en || "",
    summary_mr: post.summary_mr || "",
    summary_hi: post.summary_hi || "",

    date: getDate(post.published_at || post.event_date || post.start_date),

    description: getPostSummary(post),
    link: getPostLink(post),
    type,
    body: getPostBody(post),
    body_en: post.body_en || "",
    body_mr: post.body_mr || "",
    body_hi: post.body_hi || "",

    image: post.featured_image_url || post.video_details?.thumbnail_url || "",

    organization_type: post.organization_type || "",
    organization: post.organization_type || "",
    tags: Array.isArray(post.meta_keywords)
      ? post.meta_keywords.filter(
          (tag) => typeof tag === "string" && tag.trim(),
        )
      : [],

    location: post.location || "",
    start_date: getDate(post.start_date),
    end_date: getDate(post.end_date),
    event_date: getDate(post.event_date),
    important_dates: (post.important_dates || []).map((entry) => ({
      ...entry,
      date: entry.date || null,
      time: entry.time || null,
      start_date: entry.start_date || null,
      end_date: entry.end_date || null,
      old_date: entry.old_date || null,
      new_date: entry.new_date || null,
      old_time: entry.old_time || null,
      new_time: entry.new_time || null,
    })),

    job_details: job
      ? {
          advertisement_no: job.advertisement_no || "",
          total_posts:
            job.total_vacancies == null ? "" : String(job.total_vacancies),
          examination_name: "",
          post_details: job.post_details || job.designation || "",
          education_mode: postDetailsAreCommon ? "common" : "per_post",
          age_mode: postDetailsAreCommon ? "common" : "per_post",
          fee_mode: postDetailsAreCommon ? "common" : "per_post",
          educational_qualification:
            job.posts?.[0]?.educational_qualification_en ||
            job.educational_qualification || "",
          location: post.location || "",
          age_limit: [job.posts?.[0]?.age_min, job.posts?.[0]?.age_max]
            .filter((value) => value != null)
            .join(" - "),
          age_criteria_type:
            job.posts?.[0]?.age_criteria_type || job.age_criteria_type || "age_range",
          age_min: job.posts?.[0]?.age_min ?? job.age_min ?? null,
          age_max: job.posts?.[0]?.age_max ?? job.age_max ?? null,
          age_as_on_date:
            getDate(job.posts?.[0]?.age_as_on_date) || job.age_as_on_date || null,
          eligible_dob_from:
            getDate(job.posts?.[0]?.eligible_dob_from) || job.eligible_dob_from || null,
          eligible_dob_to:
            getDate(job.posts?.[0]?.eligible_dob_to) || job.eligible_dob_to || null,
          age_limit_note_en:
            job.posts?.[0]?.age_limit_note_en || job.age_limit_note_en || "",
          age_limit_note_mr:
            job.posts?.[0]?.age_limit_note_mr || job.age_limit_note_mr || "",
          age_limit_note_hi:
            job.posts?.[0]?.age_limit_note_hi || job.age_limit_note_hi || "",
          application_fee:
            (job.posts?.[0]?.fees || [])
              .map((fee) => {
                const category = fee.category_name_en || "";
                const amount = fee.fee_amount == null ? "" : `₹${fee.fee_amount}`;
                const note = fee.fee_note_en || "";
                return [category, amount, note].filter(Boolean).join(": ");
              })
              .join(" | ") || job.application_fee || "",
          application_fee_note_en:
            (job.posts?.[0]?.fees || []).map((fee) => fee.fee_note_en).filter(Boolean).join(" | ") ||
            job.application_fee_note_en || "",
          application_fee_note_mr:
            (job.posts?.[0]?.fees || []).map((fee) => fee.fee_note_mr).filter(Boolean).join(" | ") ||
            job.application_fee_note_mr || "",
          application_fee_note_hi:
            (job.posts?.[0]?.fees || []).map((fee) => fee.fee_note_hi).filter(Boolean).join(" | ") ||
            job.application_fee_note_hi || "",
          application_mode: job.application_mode || "",
          interview_venue: job.interview_details || "",
          important_dates: [],
          important_links: (post.important_links || []).map((link) => ({
            label_en: link.name_en || "",
            label_mr: link.name_mr || "",
            label_hi: link.name_hi || "",
            url: link.url,
          })),
          posts: (job.posts || []).map((post) => ({
            id: post.id,
            post_number: post.post_number || "",
            post_name_en: post.post_name_en || "",
            post_name_mr: post.post_name_mr || "",
            post_name_hi: post.post_name_hi || "",
            department_en: post.department_en || "",
            department_mr: post.department_mr || "",
            department_hi: post.department_hi || "",
            vacancies: post.vacancies ?? null,
            educational_qualification_en:
              post.educational_qualification_en || "",
            educational_qualification_mr:
              post.educational_qualification_mr || "",
            educational_qualification_hi:
              post.educational_qualification_hi || "",
            age_criteria_type: post.age_criteria_type || "",
            age_min: post.age_min ?? null,
            age_max: post.age_max ?? null,
            age_as_on_date: getDate(post.age_as_on_date) || "",
            eligible_dob_from: getDate(post.eligible_dob_from) || "",
            eligible_dob_to: getDate(post.eligible_dob_to) || "",
            age_limit_note_en: post.age_limit_note_en || "",
            age_limit_note_mr: post.age_limit_note_mr || "",
            age_limit_note_hi: post.age_limit_note_hi || "",
            sort_order: post.sort_order ?? 0,
            fees: (post.fees || []).map((fee) => ({
              id: fee.id,
              category_name_en: fee.category_name_en || "",
              category_name_mr: fee.category_name_mr || "",
              category_name_hi: fee.category_name_hi || "",
              fee_amount: String(fee.fee_amount ?? ""),
              fee_note_en: fee.fee_note_en || "",
              fee_note_mr: fee.fee_note_mr || "",
              fee_note_hi: fee.fee_note_hi || "",
              sort_order: fee.sort_order ?? 0,
            })),
          })),
        }
      : undefined,
  };
}

type PaginatedResponse<T> = {
  results?: T[];
  next?: string | null;
};

async function fetchList<T>(url: string, signal: AbortSignal): Promise<T[]> {
  const results: T[] = [];
  const visited = new Set<string>();
  const apiOrigin = new URL(url).origin;
  let nextUrl: string | null = url;

  while (nextUrl) {
    if (visited.has(nextUrl)) {
      throw new Error("Pagination returned a repeated URL.");
    }
    visited.add(nextUrl);

    const response: Response = await fetch(nextUrl, { signal });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}): ${nextUrl}`);
    }

    const payload: T[] | PaginatedResponse<T> = (await response.json()) as
      | T[]
      | PaginatedResponse<T>;

    if (Array.isArray(payload)) {
      results.push(...payload);
      break;
    }

    results.push(...(payload.results ?? []));
    if (!payload.next) {
      nextUrl = null;
      continue;
    }

    const resolvedNext: URL = new URL(payload.next, url);
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
        errors.push(
          `${contentKinds[index].endpoint}: ${String(response.reason)}`,
        );
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
          title_en: item.title_en || "",
          title_mr: item.title_mr || "",
          title_hi: item.title_hi || "",
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
