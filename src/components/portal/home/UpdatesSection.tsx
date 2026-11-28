/*
 * File Location: shivanyams/src/components/portal/home/UpdatesSection.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Clean
 * Cleanup Info: Clean. Removed duplicate job-deadline extraction, status and date-format helpers; now reuses shared ../utils/job-deadline utilities. Keeps the revised-deadline label logic local. Uses shared PortalEmptyState and CategoryBadge; legacy CSS migration remains separately tracked in stylesheet inventory.
 */
"use client";

import "./../../../styles/legacy/components/portal/home/UpdatesSection.css";
import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";

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
import { getJobApplicationDeadline, getJobDeadlineStatus, formatJobApplicationDeadline } from "../utils/job-deadline";

type Props = {
  type?: ItemType | "all";
  title?: string;
  query?: string;
  language?: Language;
  onQueryChange?: (value: string) => void;
  onTypeChange?: (value: ItemType | "all") => void;
  showFilters?: boolean;
  showDateAndNewBadge?: boolean;
  limit?: number | null;
  showViewAll?: boolean;
  viewAllHref?: string;
  paginate?: boolean;
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

function isJobDeadlineRevised(item: Item): boolean {
  const applicationEnd = item.important_dates?.find(
    (entry) => entry.date_type === "application_end",
  );

  return (
    applicationEnd?.date_format === "revised" ||
    applicationEnd?.date_format === "revised_with_time"
  );
}

function getExtendedDeadlineLabel(language: Language): string {
  if (language === "mr") return "मुदतवाढ";
  if (language === "hi") return "तिथि बढ़ाई गई";
  return "Date Extended";
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
  limit = 20,
  showViewAll = true,
  viewAllHref = "/updates",
  paginate = false,
}: Props) {
  const { data } = usePortalData();

  const [categories, setCategories] = useState<Category[]>(STATIC_PORTAL_CATEGORIES);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const resultsPanelRef = useRef<HTMLElement | null>(null);

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

    const sorted = data.items
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
      });

    return limit == null ? sorted : sorted.slice(0, limit);
  }, [data.items, query, type, language, limit]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleItems = paginate
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;
  const firstItem = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, filtered.length);

  useEffect(() => {
    if (!paginate) return;
    const updatePageSize = () => {
      const panel = resultsPanelRef.current;
      if (!panel) return;
      const top = panel.getBoundingClientRect().top;
      const availableHeight = Math.max(160, window.innerHeight - top - 155);
      const rowHeight = window.innerWidth <= 760 ? 94 : 78;
      setPageSize(Math.max(10, Math.floor(availableHeight / rowHeight)));
    };
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    const observer = typeof ResizeObserver !== "undefined" && resultsPanelRef.current
      ? new ResizeObserver(updatePageSize)
      : null;
    if (observer && resultsPanelRef.current) observer.observe(resultsPanelRef.current);
    return () => {
      window.removeEventListener("resize", updatePageSize);
      observer?.disconnect();
    };
  }, [paginate]);

  useEffect(() => {
    setPage(1);
  }, [type, query]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const dateLocale =
    language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : "mr-IN";

  return (
    <section ref={resultsPanelRef} className={`updates-panel updates-panel-language-${language}${showDateAndNewBadge ? "" : " updates-panel-home"}${paginate ? " jobs-updates" : ""} panelin`} id="updates">
      <div className="section-heading">
        <h2>{sectionTitle}</h2>

        {showViewAll ? (
          <Link href={viewAllHref}>
            {getPortalText("viewAll", language)} →
          </Link>
        ) : null}
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
          visibleItems.map((item) => {
            const itemTitle = getItemTitle(item, language);
            const itemDescription = getItemDescription(item, language);
            const itemCategory = getItemCategory(item, language);
            const applicationDeadline =
              !showDateAndNewBadge && item.type === "job"
                ? getJobApplicationDeadline(item)
                : "";
            const deadlineStatus = applicationDeadline
              ? getJobDeadlineStatus(applicationDeadline)
              : "";
            const deadlineRevised =
              applicationDeadline && isJobDeadlineRevised(item);

            return (
              <Link
                className={`update-row${paginate ? " related-job-row" : ""}${applicationDeadline ? " update-row-has-deadline" : ""}`}
                key={item.id}
                href={getPostHref(item)}
              >
                <CategoryBadge category={getCategorySlugForType(item.type)} label={itemCategory} />

                <span className="update-title">
                  {itemTitle}
                  {itemDescription && <small>{itemDescription}</small>}
                </span>

                {applicationDeadline ? (
                  <span className="update-deadline-group">
                    {deadlineRevised && (
                      <span className="update-deadline-extended">
                        {getExtendedDeadlineLabel(language)}
                      </span>
                    )}
                    <time className={`update-application-deadline deadline-${deadlineStatus}`}>
                      {formatJobApplicationDeadline(applicationDeadline)}
                    </time>
                  </span>
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
              </Link>
            );
          })
        ) : (
          <PortalEmptyState title={getPortalText("emptyUpdates", language)} description={language === "en" ? "Fresh announcements and updates will appear here." : language === "mr" ? "नवीन घोषणा आणि अपडेट्स येथे दिसतील." : "नई घोषणाएँ और अपडेट यहाँ दिखाई देंगे।"} icon="✦" />
        )}
      </div>

      {paginate && filtered.length > pageSize && (
        <div className="related-content-pagination">
          <span>Showing {firstItem}–{lastItem} of {filtered.length} posts</span>
          <div className="related-content-pagination-controls">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <span>Page {page} of {pageCount}</span>
            <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
          </div>
        </div>
      )}
    </section>
  );
}
