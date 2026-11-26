"use client";

import "./../../../styles/legacy/components/portal/home/UpdatesSection.css";

import { useEffect, useMemo, useState } from "react";

import {
  getPortalApiUrl,
  CategoryBadge,
  getCategorySlugForType,
  categoryConfig,
  getCategoryTitle,
  normalizeCategorySlug,
  STATIC_PORTAL_CATEGORIES,
  type Category,
  type Language,
} from "../category/CategoryGrid";

import { getPortalText } from "../../../i18n/dictionaries/portal-dictionary";

import type { Item, ItemType } from "../data/portal-data";
import { usePortalData } from "../data/portal-data";
import { createPostSlug } from "../post/PortalPostDetail";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { PortalEmptyState } from "../category/PortalEmptyState";

type Props = {
  type?: ItemType | "all";
  title?: string;
  query?: string;
  language?: Language;
  onQueryChange?: (value: string) => void;
  onTypeChange?: (value: ItemType | "all") => void;
  showFilters?: boolean;
  showDateAndNewBadge?: boolean;
};

interface CategoryApiResponse {
  results?: Category[];
}

function getLocalizedValue(
  language: Language,
  en?: string,
  mr?: string,
  hi?: string,
): string {
  const values: Record<Language, string> = {
    en: en?.trim() || "",
    mr: mr?.trim() || "",
    hi: hi?.trim() || "",
  };

  return values[language] || values.en || values.mr || values.hi || "";
}

function getItemTitle(item: Item, language: Language): string {
  return (
    getLocalizedValue(language, item.title_en, item.title_mr, item.title_hi) ||
    item.title?.trim() ||
    ""
  );
}

function getItemDescription(item: Item, language: Language): string {
  return (
    getLocalizedValue(
      language,
      item.summary_en,
      item.summary_mr,
      item.summary_hi,
    ) ||
    item.description?.trim() ||
    ""
  );
}

function getItemCategory(item: Item, language: Language): string {
  return getLocalizedValue(
    language,
    item.category_en,
    item.category_mr,
    item.category_hi,
  );
}

function getJobApplicationDeadline(item: Item): string {
  const applicationEnd = item.important_dates?.find(
    (entry) => entry.date_type === "application_end",
  );

  if (applicationEnd) {
    if (applicationEnd.date_format === "revised" || applicationEnd.date_format === "revised_with_time") {
      return applicationEnd.new_date || applicationEnd.date || applicationEnd.end_date || "";
    }
    if (applicationEnd.date_format === "range") {
      return applicationEnd.end_date || applicationEnd.date || "";
    }
    return applicationEnd.date || applicationEnd.end_date || "";
  }

  return item.end_date || "";
}

function getDeadlineStatus(dateValue: string): "urgent" | "soon" | "open" {
  const [year, month, day] = dateValue.slice(0, 10).split("-").map(Number);
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);

  if (daysRemaining <= 3) return "urgent";
  if (daysRemaining <= 7) return "soon";
  return "open";
}

function formatApplicationDeadline(dateValue: string): string {
  const [year, month, day] = dateValue.slice(0, 10).split("-");
  return [day, month, year].join("/");
}

function getPostHref(item: Item): string {
  const slug = item.slug || createPostSlug(item.title);

  switch (item.type) {
    case "job":
      return `/jobs/${slug}`;

    case "scheme":
      return `/schemes/${slug}`;

    case "examination":
    case "exam":
      return `/examination/${slug}`;

    case "admit":
      return `/admit-cards/${slug}`;

    case "result":
      return `/results/${slug}`;

    case "guide":
      return `/guides/${slug}`;

    case "video":
      return `/videos/${slug}`;

    case "tool":
      return `/tools/${slug}`;

    default:
      return "#";
  }
}

export function UpdatesSection({
  type = "all",
  title,
  query = "",
  language = "mr",
  onQueryChange,
  onTypeChange,
  showFilters = true,
  showDateAndNewBadge = true,
}: Props) {
  const { data } = usePortalData();

  const [categories, setCategories] = useState<Category[]>(STATIC_PORTAL_CATEGORIES);

  const sectionTitle = title ?? getPortalText("updatesTitle", language);

  // Load actual categories from Django API
  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = "shivanyams-portal-categories";

    // Show the last successful category list immediately, before revalidating.
    try {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Category[];
        if (Array.isArray(parsed) && parsed.length) setCategories(parsed);
      }
    } catch {
      // Keep the locally defined categories if the browser cache is unavailable.
    }

    async function fetchCategories() {
      try {
        const response = await authenticatedFetch(getPortalApiUrl("categories/"), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Category request failed (${response.status})`);
        }

        const payload: Category[] | CategoryApiResponse = await response.json();

        const result = Array.isArray(payload)
          ? payload
          : (payload.results ?? []);

        const activeCategories = result.filter(
          (category) => category.is_active ?? category.active ?? false,
        );

        if (activeCategories.length) {
          setCategories(activeCategories);
          try {
            window.sessionStorage.setItem(cacheKey, JSON.stringify(activeCategories));
          } catch {
            // Category navigation remains available from the local fallback.
          }
        } else {
          setCategories(STATIC_PORTAL_CATEGORIES);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category loading failed:", error);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  // Localized database content and search
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    return data.items
      .filter((item) => {
        const matchesType = type === "all" || item.type === type;

        const title = getItemTitle(item, language);
        const description = getItemDescription(item, language);
        const category = getItemCategory(item, language);

        const matchesQuery =
          !term ||
          [title, description, category].some((value) =>
            value.toLocaleLowerCase().includes(term),
          );

        return matchesType && matchesQuery;
      })
      .sort((a, b) => {
        return (
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
        );
      })
      .slice(0, 20);
  }, [data.items, query, type, language]);

  const dateLocale =
    language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : "mr-IN";

  return (
    <section className={`updates-panel updates-panel-language-${language}${showDateAndNewBadge ? "" : " updates-panel-home"} panelin`} id="updates">
      <div className="section-heading">
        <h2>{sectionTitle}</h2>

        <button
          type="button"
          onClick={() => {
            onQueryChange?.("");
            onTypeChange?.("all");
          }}
        >
          {getPortalText("viewAll", language)} →
        </button>
      </div>

      {showFilters && (
        <div className="filter-row">
          <button
            type="button"
            className={type === "all" ? "selected" : ""}
            onClick={() => onTypeChange?.("all")}
          >
            {getPortalText("all", language)}
          </button>

          {categories.map((category) => {
            const slug = normalizeCategorySlug(category.slug);
            const config = categoryConfig[slug];

            if (!config) return null;

            return (
              <button
                type="button"
                key={category.id}
                className={type === config.type ? "selected" : ""}
                onClick={() => onTypeChange?.(config.type)}
              >
                {getCategoryTitle(category, language)}
              </button>
            );
          })}
        </div>
      )}

      <div className="update-list">
        {data.loading && filtered.length === 0 ? (
          <div className="update-skeleton-list" aria-label="Loading updates" aria-busy="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="update-skeleton-row" key={index} aria-hidden="true">
                <span className="update-skeleton-badge" />
                <span className="update-skeleton-copy">
                  <span className="update-skeleton-title" />
                  <span className="update-skeleton-summary" />
                </span>
                {showDateAndNewBadge && <>
                  <span className="update-skeleton-date" />
                  <span className="update-skeleton-pill" />
                </>}
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => {
            const itemTitle = getItemTitle(item, language);
            const itemDescription = getItemDescription(item, language);
            const itemCategory = getItemCategory(item, language);
            const applicationDeadline =
              !showDateAndNewBadge && item.type === "job"
                ? getJobApplicationDeadline(item)
                : "";
            const deadlineStatus = applicationDeadline
              ? getDeadlineStatus(applicationDeadline)
              : "";

            return (
              <a
                className={`update-row${applicationDeadline ? " update-row-has-deadline" : ""}`}
                key={item.id}
                href={getPostHref(item)}
              >
                <CategoryBadge category={getCategorySlugForType(item.type)} label={itemCategory} />

                <span className="update-title">
                  {itemTitle}
                  {itemDescription && <small>{itemDescription}</small>}
                </span>

                {applicationDeadline ? (
                  <time className={`update-application-deadline deadline-${deadlineStatus}`}>
                    {formatApplicationDeadline(applicationDeadline)}
                  </time>
                ) : showDateAndNewBadge ? (
                  <>
                    <time>
                      {item.date
                        ? new Date(`${item.date}T12:00:00`).toLocaleDateString(
                            dateLocale,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : getPortalText("new", language)}
                    </time>
                    <span className="new-pill">
                      {getPortalText("new", language)}
                    </span>
                  </>
                ) : null}
              </a>
            );
          })
        ) : (
          <PortalEmptyState title={getPortalText("emptyUpdates", language)} description={language === "en" ? "Fresh announcements and updates will appear here." : language === "mr" ? "नवीन घोषणा आणि अपडेट्स येथे दिसतील." : "नई घोषणाएँ और अपडेट यहाँ दिखाई देंगे।"} icon="✦" />
        )}
      </div>
    </section>
  );
}
