/* File Location: shivanyams/src/components/portal/category/CategoryGrid.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 13 and 24 audit. UI Audit: 8 SDK category icon components (GovernmentJobIcon, GovernmentSchemeIcon, ResultIcon, AdmitCardIcon, GuideIcon, VideoIcon, ExaminationIcon, ToolsIcon); CategoryGrid and CategoryBadge are app-local. Language type moved to src/i18n/types.ts and re-exported for compatibility. Large mixed config/helper/component module and paired CSS modernization remain pending.
 */
"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { Language } from "../../../i18n/types";

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
import { isPortalCategoryEnabled } from "../../../features/category-access";

import {
  getPortalCategoryDefinition,
  normalizePortalCategorySlug,
  PORTAL_CATEGORIES,
} from "../../../data/portal/categories";

export type { Language } from "../../../i18n/types";

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
  jobs: { type: "job", color: "blue", icon: <GovernmentJobIcon />, href: "/jobs" },
  schemes: { type: "scheme", color: "green", icon: <GovernmentSchemeIcon />, href: "/schemes" },
  exams: { type: "examination", color: "indigo", icon: <ExaminationIcon />, href: "/exams" },
  results: { type: "result", color: "purple", icon: <ResultIcon />, href: "/results" },
  "admit-cards": { type: "admit", color: "cyan", icon: <AdmitCardIcon />, href: "/admit-cards" },
  guides: { type: "guide", color: "orange", icon: <GuideIcon />, href: "/guides" },
  videos: { type: "video", color: "red", icon: <VideoIcon />, href: "/videos" },
  tools: { type: "tool", color: "gray", icon: <ToolsIcon />, href: "/tools" },
};

export function getCategoryTitle(category: Category, language: Language = "mr") {
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
  item: { category?: string; category_en?: string; category_mr?: string; category_hi?: string },
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
        <span className="portal-post-category-icon" aria-hidden="true">{config.icon}</span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}

export function getCategoryDescription(category: Category, language: Language = "mr") {
  const definition = getPortalCategoryDefinition(category.slug);
  const fallback = definition?.translations[language].description || "";
  return ({ en: category.description_en, mr: category.description_mr, hi: category.description_hi }[language] || fallback);
}

export function normalizeCategorySlug(slug: string) {
  return normalizePortalCategorySlug(slug.trim().toLowerCase().replace(/[_\s]+/g, "-"));
}

const configuredPortalApiUrl = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();

export const API_URL = (
  configuredPortalApiUrl ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8001/api/v1/portal"
    : "")
).replace(/\/+$/, "");

export function getPortalApiUrl(path: string) {
  if (!API_URL) {
    throw new Error(
      "Portal API is not configured. Set NEXT_PUBLIC_PORTAL_API_URL to the deployed Portal API base URL.",
    );
  }

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

// Stable navigation categories are sourced locally; no category API request is needed.
export const STATIC_PORTAL_CATEGORIES: Category[] = PORTAL_CATEGORIES.map((category) => ({
  id: category.sortOrder,
  name_en: category.translations.en.name,
  name_mr: category.translations.mr.name,
  name_hi: category.translations.hi.name,
  slug: category.slug,
  description_en: category.translations.en.description,
  description_mr: category.translations.mr.description,
  description_hi: category.translations.hi.description,
  is_active: true,
  active: true,
}));

export function CategoryGrid({ language = "mr" }: { language?: Language }) {
  const router = useRouter();

  const enabledCategories = STATIC_PORTAL_CATEGORIES.filter((category) =>
    isPortalCategoryEnabled(category.slug),
  );

  if (enabledCategories.length === 0) return null;

  return (
    <section
      className={`category-grid${enabledCategories.length === 1 ? " category-grid-single" : ""}`}
    >
      {enabledCategories.map((category) => {
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
