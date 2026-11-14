
"use client";

import "./CategoryGrid.css";

import { useEffect, useState } from "react";
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
} from "shivanya-ui";

import type { ItemType } from "../data/portal-data";

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
  active: boolean;
}

export function getCategorySubtitle(
  category: Category,
  language: Language,
) {
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
  examination: {
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
  "articles-guides": {
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
};

const CATEGORY_ORDER = [
  "jobs",
  "schemes",
  "articles-guides",
  "admit-cards",
  "examination",
  "results",
  "videos",
];

const categorySlugAliases: Record<string, string> = {
  job: "jobs",
  "government-jobs": "jobs",
  scheme: "schemes",
  "government-schemes": "schemes",
  result: "results",
  admit: "admit-cards",
  "admit-card": "admit-cards",
  admitcards: "admit-cards",
  guide: "articles-guides",
  guides: "articles-guides",
  article: "articles-guides",
  articles: "articles-guides",
  "article-guide": "articles-guides",
  "article-guides": "articles-guides",
  "articles-guide": "articles-guides",
  video: "videos",
};

export const API_URL =
  process.env.NEXT_PUBLIC_PORTAL_API_URL ??
  "http://localhost:8001/api/v1/portal";

export const categoriesApi = `${API_URL}/categories/`;
export const importantLinksApi = `${API_URL}/important-links/`;

export function getCategoryTitle(
  category: Category,
  language: Language = "mr",
) {
  return {
    en: category.name_en,
    mr: category.name_mr,
    hi: category.name_hi,
  }[language];
}

export function getCategoryDescription(
  category: Category,
  language: Language = "mr",
) {
  return {
    en: category.description_en,
    mr: category.description_mr,
    hi: category.description_hi,
  }[language];
}

interface CategoryApiResponse {
  results?: Category[];
}

export function normalizeCategorySlug(slug: string) {
  const normalized = slug
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  return categorySlugAliases[normalized] ?? normalized;
}

export function CategoryGrid({
  language = "mr",
}: {
  language?: Language;
}) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(categoriesApi, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch categories: ${response.status}`,
          );
        }

        const payload: Category[] | CategoryApiResponse =
          await response.json();

        const data = Array.isArray(payload)
          ? payload
          : payload.results ?? [];

        const activeCategories = data
          .filter((category) => category.active)
          .map((category) => ({
            ...category,
            slug: normalizeCategorySlug(category.slug),
          }))
          .filter((category) =>
            Boolean(categoryConfig[category.slug]),
          );

        // Always follow the defined category sequence
        const sortedCategories = [...activeCategories].sort(
          (a, b) =>
            CATEGORY_ORDER.indexOf(a.slug) -
            CATEGORY_ORDER.indexOf(b.slug),
        );

        setCategories(sortedCategories);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category loading failed:", error);
          setCategories([]);
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
      {categories.map((category) => {
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
