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

import type { ItemType } from "./portal-data";

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

export function getCategorySubtitle(category: Category, language: Language) {
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
    type: "examination" as ItemType,
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
};

const categoryOrder = [
  "jobs",
  "schemes",
  "examination",
  "results",
  "admit-cards",
  "guides",
  "videos",
];

const categorySlugAliases: Record<string, string> = {
  job: "jobs",
  "government-jobs": "jobs",
  scheme: "schemes",
  "government-schemes": "schemes",
  result: "results",
  "admit-card": "admit-cards",
  admitcards: "admit-cards",
  guide: "guides",
  article: "guides",
  articles: "guides",
  "article-guide": "guides",
  "article-guides": "guides",
  "articles-guide": "guides",
  "articles-guides": "guides",
  video: "videos",
};

const fallbackCategories: Category[] = [
  {
    id: -1,
    slug: "jobs",
    name_en: "Jobs",
    name_mr: "नोकरी",
    name_hi: "नौकरियां",
    description_en: "",
    description_mr: "",
    description_hi: "",
    active: true,
  },
  {
    id: -2,
    slug: "schemes",
    name_en: "Schemes",
    name_mr: "योजना",
    name_hi: "योजनाएं",
    description_en: "",
    description_mr: "",
    description_hi: "",
    active: true,
  },
  {
    id: -3,
    slug: "examination",
    name_en: "Examination",
    name_mr: "परीक्षा",
    name_hi: "परीक्षा",
    description_en: "",
    description_mr: "",
    description_hi: "",
    active: true,
  },
  {
    id: -4,
    slug: "results",
    name_en: "Results",
    name_mr: "निकाल",
    name_hi: "परिणाम",
    description_en: "",
    description_mr: "",
    description_hi: "",
    active: true,
  },
  {
    id: -5,
    slug: "admit-cards",
    name_en: "Admit Cards",
    name_mr: "प्रवेशपत्र",
    name_hi: "प्रवेश पत्र",
    description_en: "",
    description_mr: "",
    description_hi: "",
    active: true,
  },
  {
    id: -6,
    slug: "guides",
    name_en: "Articles & Guides",
    name_mr: "लेख आणि मार्गदर्शक",
    name_hi: "लेख और मार्गदर्शिकाएँ",
    description_en: "",
    description_mr: "",
    description_hi: "",
    active: true,
  },
  {
    id: -7,
    slug: "videos",
    name_en: "Videos",
    name_mr: "व्हिडिओ",
    name_hi: "वीडियो",
    description_en: "",
    description_mr: "",
    description_hi: "",
    active: true,
  },
];

const API_URL =
  process.env.NEXT_PUBLIC_PORTAL_API_URL ??
  "http://localhost:8001/api/v1/portal";

export const categoriesApi = `${API_URL}/categories/`;

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

function normalizeCategorySlug(slug: string) {
  const normalized = slug.trim().toLowerCase().replace(/[_\s]+/g, "-");
  return categorySlugAliases[normalized] ?? normalized;
}

function mergeCategories(apiCategories: Category[]) {
  const categoriesBySlug = new Map<string, Category>();

  apiCategories
    .filter((category) => category.active)
    .forEach((category) => {
      const slug = normalizeCategorySlug(category.slug);

      if (categoryConfig[slug] && !categoriesBySlug.has(slug)) {
        categoriesBySlug.set(slug, { ...category, slug });
      }
    });

  return categoryOrder.map((slug, index) => {
    return categoriesBySlug.get(slug) ?? fallbackCategories[index];
  });
}

export function CategoryGrid({ language = "mr" }: { language?: Language }) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(categoriesApi, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const payload: Category[] | CategoryApiResponse = await response.json();
        const data = Array.isArray(payload) ? payload : (payload.results ?? []);

        setCategories(mergeCategories(data));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category loading failed:", error);
          setCategories(fallbackCategories);
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
            <span className="category-icon">{config.icon}</span>

            <span className="category-content">
              <strong>{getCategoryTitle(category, language)}</strong>
              <small>{getCategorySubtitle(category, language)}</small>
            </span>
          </button>
        );
      })}
    </section>
  );
}
