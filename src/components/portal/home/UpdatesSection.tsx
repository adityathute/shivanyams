"use client";

import "./UpdatesSection.css";

import { useEffect, useMemo, useState } from "react";

import {
  getPortalApiUrl,
  categoryConfig,
  getCategoryTitle,
  normalizeCategorySlug,
  type Category,
  type Language,
} from "../category/CategoryGrid";

import { getPortalText } from "../../../i18n/dictionaries/portal-dictionary";

import type { Item, ItemType } from "../data/portal-data";
import { usePortalData } from "../data/portal-data";
import { createPostSlug } from "../post/PortalPostDetail";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";

type Props = {
  type?: ItemType | "all";
  title?: string;
  query?: string;
  language?: Language;
  onQueryChange?: (value: string) => void;
  onTypeChange?: (value: ItemType | "all") => void;
  showFilters?: boolean;
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

function getPostHref(item: Item): string {
  const slug = item.slug || createPostSlug(item.title);

  switch (item.type) {
    case "job":
      return `/jobs/${slug}`;

    case "scheme":
      return `/schemes/${slug}`;

    case "examination":
    case "exam":
      return `/examinations/${slug}`;

    case "admit":
      return `/admit-card/${slug}`;

    case "result":
      return `/results/${slug}`;

    case "guide":
      return `/articles/${slug}`;

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
}: Props) {
  const { data } = usePortalData();

  const [categories, setCategories] = useState<Category[]>([]);

  const sectionTitle = title ?? getPortalText("updatesTitle", language);

  // Load actual categories from Django API
  useEffect(() => {
    const controller = new AbortController();

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

        setCategories(
          result.filter(
            (category) => category.is_active ?? category.active ?? false,
          ),
        );
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
    <section className="updates-panel panelin" id="updates">
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
        {data.loading ? (
          <div className="empty-state">Loading updates...</div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => {
            const itemTitle = getItemTitle(item, language);
            const itemDescription = getItemDescription(item, language);
            const itemCategory = getItemCategory(item, language);

            return (
              <a className="update-row" key={item.id} href={getPostHref(item)}>
                <span className={`update-badge ${item.type}`}>
                  {itemCategory}
                </span>

                <span className="update-title">
                  {itemTitle}
                  {itemDescription && <small>{itemDescription}</small>}
                </span>

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
              </a>
            );
          })
        ) : (
          <div className="empty-state">
            {getPortalText("emptyUpdates", language)}
          </div>
        )}
      </div>
    </section>
  );
}
