
"use client";

import "./CategoryPage.css";

import { useEffect, useMemo, useState } from "react";
import { usePortalData, type ItemType } from "../data/portal-data";
import {
  getPortalApiUrl,
  normalizeCategorySlug,
  getCategoryDescription,
  getCategoryTitle,
  type Category,
  type Language,
} from "./CategoryGrid";
import { usePortalLanguage } from "../context/PortalLanguageContext";

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

  return new Date(`${date}T12:00:00`).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CategoryPage({ type }: { type: ItemType }) {
  const { language } = usePortalLanguage();
  const copy = pageCopy[language];

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const { data } = usePortalData();

  const categorySlug = categorySlugByType[type] ?? type;

  // Load categories
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(getPortalApiUrl("categories/"), {
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

        setCategories(result);
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
          [item.title, item.category, item.description].some((value) =>
            value.toLowerCase().includes(term),
          )
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date || "").getTime() -
          new Date(a.date || "").getTime(),
      );
  }, [data.items, query, type]);

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
              {title} – {copy.updates}
            </h2>

            <span>
              {filtered.length} {copy.updateCount}
            </span>
          </div>

          <div className="update-list">
            {data.loading || categoriesLoading ? (
              <div className="empty-state">
                Loading...
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
                  <span className={`update-badge ${item.type}`}>
                    {item.category}
                  </span>

                  <span className="update-title">
                    {item.title}
                    <small>{item.description}</small>
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
              <div className="empty-state">
                {data.error || copy.empty}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
