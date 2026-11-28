/*
 * File Location: shivanyams/src/components/portal/data/portal-data.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { mapPost } from "../../../lib/portal-content";
import { getPortalCategoryForType, isPortalCategoryEnabled } from "../../../features/category-access";

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

export type JobPostEducation = {
  id?: number;
  qualification_en: string;
  qualification_mr: string;
  qualification_hi: string;
  sort_order?: number;
};

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
  educations: JobPostEducation[];
};

export type JobDetails = {
  posts?: JobPost[];
  education_mode?: "common" | "per_post";
  education_is_common_field?: boolean;
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
    action_text_en: string;
    action_text_mr: string;
    action_text_hi: string;
    url: string;
  }[];
};

export type RequiredDocument = {
  id?: number;
  name_en?: string; name_mr?: string; name_hi?: string;
  description_en?: string; description_mr?: string; description_hi?: string;
  category?: string; requirement?: string; original_required?: boolean | null;
  photocopy_required?: boolean | null; number_of_copies?: number | null; quantity?: number | null;
  instructions_en?: string; instructions_mr?: string; instructions_hi?: string;
};
export type PhotoRequirement = {
  id?: number;
  photo_type?: string; photo_size?: string; photo_quantity?: number | null; photo_background?: string;
  other_specifications?: string; instructions_en?: string; instructions_mr?: string; instructions_hi?: string;
};
export type SignatureRequirement = {
  id?: number;
  signature_type?: string; signature_format?: string; signature_size?: string;
  other_specifications?: string; instructions_en?: string; instructions_mr?: string; instructions_hi?: string;
};

export type Item = {
  id: string;
  title: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  category: string;
  updated_date?: string;
  created_at?: string;
  updated_at?: string;
  category_en?: string;
  category_mr?: string;
  category_hi?: string;

  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  date: string;
  views_count?: number;
  comments_enabled?: boolean;
  description: string;
  link: string;
  embedUrl?: string;
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
  important_links?: ApiLink[];
  faqs?: PostFAQ[];
  required_documents?: RequiredDocument[];
  photo_requirements?: PhotoRequirement[];
  signature_requirements?: SignatureRequirement[];
  extra?: Record<string, unknown>;
  /** Complete public API payload retained for exhaustive client-side search. */
  search_index?: string;
  job_details?: JobDetails;
  related_posts?: { relation_type: string; sort_order?: number; post: { id: number; title_en?: string; title_mr?: string; title_hi?: string; summary_en?: string; summary_mr?: string; summary_hi?: string; meta_keywords?: string[]; slug: string; featured_image_url?: string; video_details?: { video_url?: string; embed_url?: string; thumbnail_url?: string } | null } }[];
};

export type Video = {
  id: string;
  title: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  url: string;
  embed_url?: string;
  thumbnail: string;
  language: string;
  slug?: string;
  views_count?: number;
  date?: string;
  published_at?: string;
};

export type PortalData = {
  items: Item[];
  videos: Video[];
  loading: boolean;
  error: string;
  failedTypes?: ItemType[];
};
 
export function getLocalizedPostTitle(
  item: Pick<Item, "title" | "title_en" | "title_mr" | "title_hi">,
  language: "en" | "mr" | "hi",
) {
  const titles = {
    en: item.title_en,
    mr: item.title_mr,
    hi: item.title_hi,
  };
  return titles[language]?.trim() || item.title_en?.trim() || item.title_mr?.trim() || item.title_hi?.trim() || item.title;
}

export function getLocalizedPostSummary(
  item: Pick<Item, "description" | "summary_en" | "summary_mr" | "summary_hi">,
  language: "en" | "mr" | "hi",
) {
  const summaries = {
    en: item.summary_en,
    mr: item.summary_mr,
    hi: item.summary_hi,
  };
  return summaries[language]?.trim() || item.summary_en?.trim() || item.summary_mr?.trim() || item.summary_hi?.trim() || item.description;
}


type ApiLink = {
  group_key?: string;
  name_en?: string;
  name_mr?: string;
  name_hi?: string;
  action_text_en?: string;
  action_text_mr?: string;
  action_text_hi?: string;
  url: string;
  is_active?: boolean;
};

export type PostFAQ = {
  id?: number; question_en: string; question_mr?: string; question_hi?: string;
  answer_en: string; answer_mr?: string; answer_hi?: string; sort_order?: number; is_active?: boolean; status?: "under_review"; visibility?: "public" | "private" | "hidden"; author_name?: string; is_mine?: boolean; helpful_count?: number;
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
  educations?: {
    id?: number;
    qualification_en?: string;
    qualification_mr?: string;
    qualification_hi?: string;
    sort_order?: number;
  }[];
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

export export type ApiPost = {
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
  created_at?: string | null;
  updated_at?: string | null;
  views_count?: number;
  comments_enabled?: boolean;
  related_posts?: { relation_type: string; sort_order?: number; post: { id: number; title_en?: string; title_mr?: string; title_hi?: string; slug: string; featured_image_url?: string; video_thumbnail_url?: string } }[];
  important_links?: ApiLink[];
  important_dates?: ImportantDate[];
  faqs?: PostFAQ[];
  required_documents?: (RequiredDocument & { is_active?: boolean })[];
  photo_requirements?: (PhotoRequirement & { is_active?: boolean })[];
  signature_requirements?: (SignatureRequirement & { is_active?: boolean })[];
  job_details?: {
    advertisement_no?: string;
    education_mode?: "common" | "per_post";
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
    embed_url?: string;
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
  failedTypes: [],
};


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

    const response: Response = await authenticatedFetch(nextUrl, {
      signal,
      // Published content must be fetched fresh when navigating between portal
      // routes; the tab cache is only an instant-render snapshot, not authority.
      cache: "no-store",
    });
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
    { endpoint: "exams", type: "examination" },
    { endpoint: "admit-cards", type: "admit" },
    { endpoint: "results", type: "result" },
    { endpoint: "guides", type: "guide" },
    { endpoint: "videos", type: "video" },
    { endpoint: "tools", type: "tool" },
  ];

  const enabledContentKinds = contentKinds.filter(({ type }) =>
    isPortalCategoryEnabled(getPortalCategoryForType(type)),
  );

  const responses = await Promise.allSettled(
    enabledContentKinds.map(({ endpoint }) =>
      fetchList<ApiPost>(getPortalApiUrl(`content/${endpoint}/`), signal),
    ),
  );

  const items: Item[] = [];
  const videos: Video[] = [];
  const errors: string[] = [];
  const failedTypes: ItemType[] = [];

  responses.forEach((response, index) => {
    const { type } = enabledContentKinds[index];

    if (response.status === "rejected") {
      failedTypes.push(type);
      if (!signal.aborted) {
        errors.push(
          `${enabledContentKinds[index].endpoint}: ${String(response.reason)}`,
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
          embed_url: post.video_details?.embed_url || "",
          thumbnail: post.video_details?.thumbnail_url || item.image || "",
          language: post.video_details?.available_languages?.join(", ") || "",
          views_count: item.views_count,
          date: item.date,
          published_at: post.published_at || "",
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
    failedTypes,
  };
}

type PortalDataContextValue = {
  data: PortalData;
  refresh: () => Promise<void>;
};

const PortalDataContext = createContext<PortalDataContextValue | null>(null);

const PORTAL_DATA_CACHE_VERSION = 2;

type CachedPortalData = {
  version: number;
  savedAt: number;
  items: Item[];
  videos: Video[];
};

/**
 * Public portal content is safe to keep for the lifetime of the current tab.
 * On a reload, render this snapshot immediately and revalidate it from Django.
 */
function readPortalDataCache(): CachedPortalData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw) as Partial<CachedPortalData>;
    if (
      cached.version !== PORTAL_DATA_CACHE_VERSION ||
      !Array.isArray(cached.items) ||
      !Array.isArray(cached.videos) ||
      typeof cached.savedAt !== "number" ||
      !Number.isFinite(cached.savedAt)
    ) {
      return null;
    }

    return {
      version: PORTAL_DATA_CACHE_VERSION,
      savedAt: cached.savedAt,
      items: cached.items as Item[],
      videos: cached.videos as Video[],
    };
  } catch {
    // Storage may be unavailable, full, or contain invalid JSON. Network
    // loading remains the source of truth and must continue normally.
    return null;
  }
}

function writePortalDataCache(data: PortalData) {
  if (typeof window === "undefined") return;

  try {
    const cached: CachedPortalData = {
      version: PORTAL_DATA_CACHE_VERSION,
      savedAt: Date.now(),
      items: data.items,
      videos: data.videos,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // A storage quota/private-mode failure must never break portal rendering.
  }
}

function hasSamePortalContent(left: PortalData, right: PortalData) {
  return (
    JSON.stringify(left.items) === JSON.stringify(right.items) &&
    JSON.stringify(left.videos) === JSON.stringify(right.videos)
  );
}

/**
 * One failed endpoint must not block fresh content from the other categories.
 * Keep the previous snapshot only for the category whose request failed.
 */
function mergePartialPortalData(current: PortalData, next: PortalData): PortalData {
  const failedTypes = new Set(next.failedTypes || []);
  const items = [
    ...current.items.filter((item) => failedTypes.has(item.type)),
    ...next.items.filter((item) => !failedTypes.has(item.type)),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return {
    ...next,
    items,
    videos: failedTypes.has("video") ? current.videos : next.videos,
  };
}

export function PortalDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: PortalData | null;
}) {
  const [data, setData] = useState<PortalData>(() => initialData ?? emptyData);
  const activeLoadRef = useRef<Promise<PortalData> | null>(null);

  // Share an in-flight request between the initial page load and a category
  // page's explicit refresh so navigation never creates competing snapshots.
  const fetchFreshPortalData = useCallback(() => {
    if (activeLoadRef.current) return activeLoadRef.current;

    const controller = new AbortController();
    const request = loadPortalData(controller.signal).finally(() => {
      if (activeLoadRef.current === request) activeLoadRef.current = null;
    });
    activeLoadRef.current = request;
    return request;
  }, []);

  const applyFreshData = useCallback(async () => {
    try {
      const nextData = await fetchFreshPortalData();
      if (!nextData.error) writePortalDataCache(nextData);

      setData((current) => {
        const resolvedData = nextData.error
          ? mergePartialPortalData(current, nextData)
          : nextData;

        return hasSamePortalContent(current, resolvedData)
          ? { ...current, loading: false, error: nextData.error, failedTypes: nextData.failedTypes || [] }
          : { ...resolvedData, loading: false, error: nextData.error };
      });
    } catch (error) {
      setData((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load portal content.",
      }));
    }
  }, [fetchFreshPortalData]);

  useLayoutEffect(() => {
    const cachedData = readPortalDataCache();
    if (cachedData) {
      setData({
        items: cachedData.items,
        videos: cachedData.videos,
        loading: false,
        error: "",
      });
    }
    void applyFreshData();
  }, [applyFreshData]);

  const refresh = useCallback(async () => {
    setData((current) => ({
      ...current,
      // Mark the category revalidation as active even when another category
      // already has cached posts; empty category pages should not flash "empty".
      loading: current.items.length === 0 && current.videos.length === 0,
      error: "",
    }));
    await applyFreshData();
  }, [applyFreshData]);

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


/**
 * Category pages revalidate when entered, even when the shared provider stays
 * mounted during client-side navigation. The initial request is de-duplicated.
 */
export function useRefreshPortalDataOnMount() {
  const { refresh } = usePortalData();
  useEffect(() => {
    void refresh();
  }, [refresh]);
}
