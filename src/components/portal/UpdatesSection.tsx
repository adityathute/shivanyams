"use client";

import "./UpdatesSection.css";

import { useEffect, useMemo, useState } from "react";

import {
  categoriesApi,
  categoryConfig,
  getCategoryTitle,
  normalizeCategorySlug,
  type Category,
  type Language,
} from "./CategoryGrid";

import { getPortalText } from "../../i18n/dictionaries/portal-dictionary";

import type { ItemType } from "./portal-data";
import { usePortalData } from "./portal-data";

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

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(categoriesApi, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const payload: Category[] | CategoryApiResponse = await response.json();

        const result = Array.isArray(payload)
          ? payload
          : (payload.results ?? []);

        setCategories(result.filter((category) => category.active));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category loading failed:", error);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items
      .filter((item) => {
        const matchesType = type === "all" || item.type === type;

        const matchesQuery =
          !term ||
          [item.title, item.category, item.description].some((value) =>
            value.toLowerCase().includes(term),
          );

        return matchesType && matchesQuery;
      })
      .sort(
        (a, b) =>
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
      )
      .slice(0, 20);
  }, [data.items, query, type]);

  const dateLocale =
    language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : "mr-IN";

  return (
    <section className="updates-panel panelin" id="updates">
      <div className="section-heading">
        <h2>{sectionTitle}</h2>

        <button
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
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <a
              className="update-row"
              key={item.id}
              href={item.link || "#"}
              target={item.link ? "_blank" : undefined}
              rel={item.link ? "noreferrer" : undefined}
            >
              <span className={`update-badge ${item.type}`}>
                {item.category}
              </span>

              <span className="update-title">
                {item.title}
                <small>{item.description}</small>
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

              <span className="new-pill">{getPortalText("new", language)}</span>
            </a>
          ))
        ) : (
          <div className="empty-state">
            {getPortalText("emptyUpdates", language)}
          </div>
        )}
      </div>
    </section>
  );
}
