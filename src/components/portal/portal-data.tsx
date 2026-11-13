"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_URL } from "./CategoryGrid";

export type ItemType =
  | "job"
  | "scheme"
  | "examination"
  | "result"
  | "admit"
  | "exam"
  | "guide"
  | "video";

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

type ContentApiItem = {
  id: number | string;
  kind: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  organization: string;
  location: string;
  start_date: string | null;
  end_date: string | null;
  event_date: string | null;
  source_url: string;
  image_url: string;
  extra: Record<string, unknown>;
  published_at: string | null;
};

type JobApiItem = {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  apply_url: string;
  deadline: string | null;
  published_at: string | null;
  category: { name_en: string; name_mr: string; name_hi: string; slug: string } | null;
  advertisement_no?: string;
  total_posts?: number | null;
  examination_name?: string;
  post_details?: string;
  educational_qualification?: string;
  age_limit?: string;
  application_fee?: string;
  application_mode?: string;
  interview_venue?: string;
  important_dates?: { label: string; date: string }[];
  important_links?: { label: string; url: string }[];
};

export const STORAGE_KEY = "shivanyams-portal-data";

const emptyData: PortalData = {
  items: [],
  videos: [],
  loading: true,
  error: "",
};

const kindByCategorySlug: Record<string, ItemType> = {
  schemes: "scheme",
  results: "result",
  "admit-cards": "admit",
  "articles-guides": "guide",
  examination: "examination",
  videos: "video",
};

function getDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function mapContent(content: ContentApiItem, type: ItemType): Item {
  return {
    id: String(content.id),
    slug: content.slug,
    title: content.title,
    category: "",
    date: getDate(content.published_at || content.event_date || content.start_date),
    description: content.summary,
    link: content.source_url,
    type,
  };
}

function mapJob(job: JobApiItem): Item {
  return {
    id: String(job.id),
    slug: job.slug,
    title: job.title,
    category: job.category?.name_mr || job.category?.name_en || "",
    date: getDate(job.published_at),
    description: job.description,
    link: job.apply_url,
    type: "job",
    job_details: {
      advertisement_no: job.advertisement_no || "",
      total_posts: job.total_posts == null ? "" : String(job.total_posts),
      examination_name: job.examination_name || "",
      post_details: job.post_details || "",
      educational_qualification: job.educational_qualification || job.requirements || "",
      location: job.location || "",
      age_limit: job.age_limit || "",
      application_fee: job.application_fee || "",
      application_mode: job.application_mode || "",
      interview_venue: job.interview_venue || "",
      important_dates: job.important_dates || [],
      important_links: job.important_links || [],
    },
  };
}

async function fetchList<T>(url: string, signal: AbortSignal): Promise<T[]> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.results ?? [];
}

async function loadPortalData(signal: AbortSignal): Promise<PortalData> {
  const contentKinds = [
    ["scheme", "scheme"],
    ["result", "result"],
    ["admit_card", "admit"],
    ["guide", "guide"],
    ["video", "video"],
    ["update", "examination"],
  ] as const;

  const [jobs, ...contentLists] = await Promise.all([
    fetchList<JobApiItem>(`${API_URL}/jobs/`, signal),
    ...contentKinds.map(([kind]) =>
      fetchList<ContentApiItem>(`${API_URL}/content/${kind}/`, signal),
    ),
  ]);

  const items = jobs.map(mapJob);
  const videos: Video[] = [];

  contentKinds.forEach(([kind, type], index) => {
    const entries = contentLists[index];

    entries.forEach((entry) => {
      if (type === "video") {
        videos.push({
          id: String(entry.id),
          slug: entry.slug,
          title: entry.title,
          url: entry.source_url,
          thumbnail: entry.image_url,
          language: String(entry.extra.language || ""),
        });
      } else {
        items.push(mapContent(entry, type));
      }
    });
  });

  return {
    items: items.sort((a, b) => b.date.localeCompare(a.date)),
    videos,
    loading: false,
    error: "",
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
