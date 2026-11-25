
"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  GovernmentJobIcon,
  GovernmentSchemeIcon,
  ResultIcon,
  AdmitCardIcon,
  GuideIcon,
  VideoIcon,
  ExaminationIcon,
  ToolsIcon,
} from "shivanya-ui";

import type { ItemType } from "../data/portal-data";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import {
  getPortalCategoryDefinition,
  normalizePortalCategorySlug,
  PORTAL_CATEGORY_ORDER,
} from "../../../data/portal/categories";

export type Language = "en" | "mr" | "hi";

export interface Category {
  id: number;
  name_en: string;
  name_mr: string;
  name_hi: string;
  slug: string;
  description_en: string;
  description_mr: string;
  description_hi: string;
  is_active?: boolean;
  active?: boolean;
}

export function getCategorySubtitle(
  category: Category,
  language: Language,
) {
  // Keep the secondary label bilingual without repeating the selected title.
  return language === "en" ? category.name_mr : category.name_en;
}

interface CategoryConfig {
  type: ItemType;
  color: string;
  icon: ReactNode;
  href: string;
}

export const categoryConfig: Record<string, CategoryConfig> = {
  jobs: {
    type: "job",
    color: "blue",
    icon: <GovernmentJobIcon />,
    href: "/jobs",
  },
  schemes: {
    type: "scheme",
    color: "green",
    icon: <GovernmentSchemeIcon />,
    href: "/schemes",
  },
  exams: {
    type: "examination",
    color: "indigo",
    icon: <ExaminationIcon />,
    href: "/examination",
  },
  results: {
    type: "result",
    color: "purple",
    icon: <ResultIcon />,
    href: "/results",
  },
  "admit-cards": {
    type: "admit",
    color: "cyan",
    icon: <AdmitCardIcon />,
    href: "/admit-cards",
  },
  guides: {
    type: "guide",
    color: "orange",
    icon: <GuideIcon />,
    href: "/guides",
  },
  videos: {
    type: "video",
    color: "red",
    icon: <VideoIcon />,
    href: "/videos",
  },
  tools: {
    type: "tool",
    color: "gray",
    icon: <ToolsIcon />,
    href: "/tools",
  },
};

const configuredPortalApiUrl = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();

export const API_URL = (
  configuredPortalApiUrl ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8001/api/v1/portal"
    : "")
).replace(/\\/+$/, "");

export function getPortalApiUrl(path: string) {
  if (!API_URL) {
    throw new Error(
      "Portal API is not configured. Set NEXT_PUBLIC_PORTAL_API_URL to the deployed Portal API base URL."
    );
  }

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

export function getCategoryTitle(
  category: Category,
  language: Language = "mr",
) {
  const definition = getPortalCategoryDefinition(category.slug);
  const fallback = definition?.translations[language].name || category.name_en;
  return ({ en: category.name_en, mr: category.name_mr, hi: category.name_hi }[language] || fallback);
}

export function getCategorySlugForType(type: string) {
  const slugs: Record<string, string> = {
    job: "jobs", scheme: "schemes", examination: "exams", exam: "exams",
    result: "results", admit: "admit-cards", guide: "guides",
    video: "videos", tool: "tools",
  };
  return slugs[type] || normalizeCategorySlug(type);
}

export function getLocalizedCategoryLabel(
  item: {
    category?: string;
    category_en?: string;
    category_mr?: string;
    category_hi?: string;
  },
  language: Language,
) {
  const labels: Record<Language, string> = {
    en: item.category_en?.trim() || "",
    mr: item.category_mr?.trim() || "",
    hi: item.category_hi?.trim() || "",
  };

  return labels[language] || labels.en || labels.mr || labels.hi || item.category || "";
}

export function CategoryBadge({ category, label }: { category: string; label: string }) {
  const slug = normalizeCategorySlug(category);
  const badgeSlug =
    slug === "exams" ? "examination" :
    slug === "articles-guides" ? "guides" :
    slug;
  const configSlug = badgeSlug === "examination" ? "exams" : badgeSlug;
  const config = categoryConfig[configSlug];

  return (
    <span className={`portal-post-category-badge portal-post-category-badge-${badgeSlug}`}>
      {config?.icon ? (
        <span className="portal-post-category-icon" aria-hidden="true">
          {config.icon}
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}

export function getCategoryDescription(
  category: Category,
  language: Language = "mr",
) {
  const definition = getPortalCategoryDefinition(category.slug);
  const fallback = definition?.translations[language].description || "";
  return ({ en: category.description_en, mr: category.description_mr, hi: category.description_hi }[language] || fallback);
}

interface CategoryApiResponse {
  results?: Category[];
}

export function normalizeCategorySlug(slug: string) {
  const normalized = slug
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  return normalizePortalCategorySlug(normalized);
}

const CATEGORY_CACHE_KEY = "shivanyams-portal-categories";
const CATEGORY_CACHE_VERSION = 1;
const CATEGORY_CACHE_TTL = 60_000;

interface CachedCategories {
  version: number;
  savedAt: number;
  categories: Category[];
}

function readCategoryCache(): CachedCategories | null {
  try {
    const raw = window.sessionStorage.getItem(CATEGORY_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw) as Partial<CachedCategories>;
    if (
      cached.version !== CATEGORY_CACHE_VERSION ||
      !Array.isArray(cached.categories) ||
      typeof cached.savedAt !== "number" ||
      !Number.isFinite(cached.savedAt)
    ) {
      return null;
    }

    return {
      version: CATEGORY_CACHE_VERSION,
      savedAt: cached.savedAt,
      categories: cached.categories as Category[],
    };
  } catch {
    return null;
  }
}

function writeCategoryCache(categories: Category[]) {
  try {
    window.sessionStorage.setItem(
      CATEGORY_CACHE_KEY,
      JSON.stringify({
        version: CATEGORY_CACHE_VERSION,
        savedAt: Date.now(),
        categories,
      } satisfies CachedCategories),
    );
  } catch {
    // Storage failures must not prevent category loading.
  }
}

function normalizeActiveCategories(data: Category[]) {
  return data
    .filter((category) => category.is_active ?? category.active ?? false)
    .map((category) => ({
      ...category,
      slug: normalizeCategorySlug(category.slug),
    }))
    .filter((category) => Boolean(categoryConfig[category.slug]))
    .sort(
      (a, b) =>
        PORTAL_CATEGORY_ORDER.indexOf(a.slug) -
        PORTAL_CATEGORY_ORDER.indexOf(b.slug),
    );
}


export function CategoryGrid({
  language = "mr",
}: {
  language?: Language;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const cached = readCategoryCache();

    if (cached) {
      setCategories(cached.categories);
      setLoading(false);

      // Reuse a fresh tab snapshot without another API request.
      if (Date.now() - cached.savedAt < CATEGORY_CACHE_TTL) {
        return;
      }
    }

    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await authenticatedFetch(getPortalApiUrl("categories/"), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const payload: Category[] | CategoryApiResponse = await response.json();
        const data = Array.isArray(payload) ? payload : payload.results ?? [];
        const nextCategories = normalizeActiveCategories(data);

        if (!controller.signal.aborted) {
          writeCategoryCache(nextCategories);
          setCategories((current) =>
            JSON.stringify(current) === JSON.stringify(nextCategories)
              ? current
              : nextCategories,
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category loading failed:", error);
          // Keep the cached cards visible if revalidation fails.
          if (!cached) setCategories([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();
    return () => controller.abort();
  }, []);

  return (
    <section className="category-grid" aria-busy={loading}>
      {loading
        ? Array.from({ length: 8 }, (_, index) => (
            <div
              key={`category-skeleton-${index}`}
              className="category-card category-skeleton"
              aria-hidden="true"
            >
              <span className="category-icon category-skeleton-icon" />
              <span className="category-content category-skeleton-content">
                <span className="category-skeleton-title" />
                <span className="category-skeleton-subtitle" />
              </span>
            </div>
          ))
        : categories.map((category) => {
            const config = categoryConfig[category.slug];

            return (
              <button
                key={category.slug}
                className={`category-card ${config.color}`}
                onClick={() => router.push(config.href)}
              >
                <span className="category-icon">
                  {config.icon}
                </span>

                <span className="category-content">
                  <strong>
                    {getCategoryTitle(category, language)}
                  </strong>

                  <small>
                    {getCategorySubtitle(category, language)}
                  </small>
                </span>
              </button>
            );
          })}
    </section>
  );
}
