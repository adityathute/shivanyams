/* File Location: shivanyams/src/components/portal/category/CategoryPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 13 audit. UI Audit: CategoryBadge from the shared CategoryGrid module and app-local PortalEmptyState. CSS mapping: CategoryPage.css. Invalid dates now fall back to localized “New” text; legacy CSS, category fetch fallback and search submit semantics require follow-up.
 */
"use client";

import "./../../../styles/legacy/components/portal/category/CategoryPage.css";

import { useEffect, useMemo, useState } from "react";
import { usePortalData, type Item, type ItemType } from "../data/portal-data";
import {
  getPortalApiUrl,
  CategoryBadge,
  getCategorySlugForType,
  normalizeCategorySlug,
  getCategoryDescription,
  getCategoryTitle,
  type Category,
  type Language,
  STATIC_PORTAL_CATEGORIES,
} from "./CategoryGrid";
import { PortalEmptyState } from "./PortalEmptyState";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";

const categorySlugByType: Record<ItemType, string> = {
  job: "jobs",
  scheme: "schemes",
  examination: "examination",
  exam: "examination",
  result: "results",
  admit: "admit-cards",
  guide: "articles-guides",
  video: "videos",
  tool: "tools",
};

const categoryTypeBySlug: Record<string, ItemType> = {
  job: "job",
  jobs: "job",
  scheme: "scheme",
  schemes: "scheme",
  examination: "examination",
  exam: "examination",
  result: "result",
  results: "result",
  admit: "admit",
  "admit-cards": "admit",
  guide: "guide",
  "articles-guides": "guide",
  video: "video",
  videos: "video",
  tool: "tool",
  tools: "tool",
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

const pageCopy: Record<
  Language,
  {
    eyebrow: string;
    search: string;
    updates: string;
    updateCount: string;
    empty: string;
    newest: string;
    searchButton: string;
  }
> = {
  en: {
    eyebrow: "SHIVANYAMS • INFORMATION PORTAL",
    search: "Search",
    updates: "Latest Updates",
    updateCount: "updates",
    empty: "No updates are currently available in this category.",
    newest: "New",
    searchButton: "⌕ Search",
  },
  mr: {
    eyebrow: "SHIVANYAMS • माहिती पोर्टल",
    search: "शोधा",
    updates: "नवीनतम अपडेट्स",
    updateCount: "अपडेट्स",
    empty: "या श्रेणीमध्ये सध्या अपडेट्स उपलब्ध नाहीत.",
    newest: "नवीन",
    searchButton: "⌕ शोधा",
  },
  hi: {
    eyebrow: "SHIVANYAMS • सूचना पोर्टल",
    search: "खोजें",
    updates: "नवीनतम अपडेट",
    updateCount: "अपडेट",
    empty: "इस श्रेणी में अभी कोई अपडेट उपलब्ध नहीं है।",
    newest: "नया",
    searchButton: "⌕ खोजें",
  },
};

function getLocalizedValue(
  language: Language,
  en?: string,
  mr?: string,
  hi?: string,
) {
  const values: Record<Language, string> = {
    en: en?.trim() || "",
    mr: mr?.trim() || "",
    hi: hi?.trim() || "",
  };

  return values[language] || values.en || values.mr || values.hi || "";
}

function getItemCategory(item: Item, language: Language) {
  return getLocalizedValue(
    language,
    item.category_en,
    item.category_mr,
    item.category_hi,
  ) || item.category;
}

function getItemTitle(item: Item, language: Language) {
  return getLocalizedValue(
    language,
    item.title_en,
    item.title_mr,
    item.title_hi,
  ) || item.title;
}

function getItemDescription(item: Item, language: Language) {
  return getLocalizedValue(
    language,
    item.summary_en,
    item.summary_mr,
    item.summary_hi,
  ) || item.description;
}

function getDescription(category: Category, language: Language) {
  return getCategoryDescription(category, language);
}

function formatDate(date: string, language: Language) {
  if (!date) return pageCopy[language].newest;

  const locale = {
    en: "en-IN",
    mr: "mr-IN",
    hi: "hi-IN",
  }[language];

  const parsedDate = new Date(`${date.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return pageCopy[language].newest;

  return parsedDate.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CategoryPage({ type }: { type: ItemType }) {
  const { language } = usePortalLanguage();
  const copy = pageCopy[language];

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>(STATIC_PORTAL_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { data } = usePortalData();

  const categorySlug = categorySlugByType[type] ?? type;

  // Load categories
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await authenticatedFetch(getPortalApiUrl("categories/"), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Category request failed: ${response.status}`);
        }

        const payload: Category[] | { results?: Category[] } =
          await response.json();

        const result = Array.isArray(payload)
          ? payload
          : payload.results ?? [];

        setCategories(result.length ? result : STATIC_PORTAL_CATEGORIES);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category metadata loading failed:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  // Sort categories in sidebar sequence
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(
        normalizeCategorySlug(a.slug),
      );

      const indexB = CATEGORY_ORDER.indexOf(
        normalizeCategorySlug(b.slug),
      );

      return (
        (indexA === -1 ? Infinity : indexA) -
        (indexB === -1 ? Infinity : indexB)
      );
    });
  }, [categories]);

  // Get current category
  const category = useMemo(
    () =>
      sortedCategories.find(
        (entry) =>
          (entry.is_active ?? entry.active ?? false) &&
          normalizeCategorySlug(entry.slug) ===
            normalizeCategorySlug(categorySlug),
      ),
    [sortedCategories, categorySlug],
  );

  const title = category ? getCategoryTitle(category, language) : "";
  const subtitle = category
    ? getDescription(category, language)
    : "";

  // Filter category updates
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items
      .filter((item) => {
        const itemType =
          categoryTypeBySlug[normalizeCategorySlug(item.type)];

        if (itemType !== type) return false;

        return (
          !term ||
          [
            getItemTitle(item, language),
            getItemCategory(item, language),
            getItemDescription(item, language),
          ].some((value) => value.toLowerCase().includes(term))
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date || "").getTime() -
          new Date(a.date || "").getTime(),
      );
  }, [data.items, query, type, language]);

  return (
    <div className="portal">
      <main>
        <section className="hero category-hero">
          <div className="hero-copy">
            <span className="eyebrow">{copy.eyebrow}</span>

            <h1>{title}</h1>

            <p>{subtitle}</p>

            <form
              className="search-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`${title} ${copy.search}...`}
              />

              <button type="submit">
                {copy.searchButton}
              </button>
            </form>
          </div>
        </section>

        <section className="updates-panel panel" id="updates">
          <div className="section-heading">
            <h2>
              {type === "examination"
                ? language === "en"
                  ? "Latest Examination Updates"
                  : language === "mr"
                    ? "नवीनतम परीक्षा अपडेट्स"
                    : "नवीनतम परीक्षा अपडेट"
                : `${title} – ${copy.updates}`}
            </h2>

            <span>
              {filtered.length} {copy.updateCount}
            </span>
          </div>

          <div className="update-list">
            {data.loading || categoriesLoading ? (
              <div className="update-skeleton-list" aria-label="Loading updates" aria-busy="true">
                {Array.from({ length: 2 }, (_, index) => (
                  <div className="update-skeleton-row" key={index} aria-hidden="true">
                    <span className="update-skeleton-badge" />
                    <span className="update-skeleton-copy">
                      <span className="update-skeleton-title" />
                      <span className="update-skeleton-summary" />
                    </span>
                    <span className="update-skeleton-date" />
                    <span className="update-skeleton-pill" />
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <a
                  className="update-row"
                  key={item.id}
                  href={item.link || "#"}
                  target={item.link ? "_blank" : undefined}
                  rel={item.link ? "noreferrer" : undefined}
                >
                  <CategoryBadge
                    category={getCategorySlugForType(item.type)}
                    label={getItemCategory(item, language)}
                  />

                  <span className="update-title">
                    {getItemTitle(item, language)}
                    {getItemDescription(item, language) && (
                      <small>{getItemDescription(item, language)}</small>
                    )}
                  </span>

                  <time>
                    {formatDate(item.date, language)}
                  </time>

                  <span className="new-pill">
                    {copy.newest}
                  </span>
                </a>
              ))
            ) : (
              <PortalEmptyState title={data.error || copy.empty} description={language === "en" ? "Check back soon — new information is added regularly." : language === "mr" ? "नवीन माहिती नियमितपणे जोडली जाते. कृपया पुन्हा भेट द्या." : "नई जानकारी नियमित रूप से जोड़ी जाती है। कृपया फिर देखें।"} icon="✦" />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
