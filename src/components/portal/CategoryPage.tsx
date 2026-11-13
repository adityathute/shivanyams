"use client";

import "./CategoryPage.css";

import { useEffect, useMemo, useState } from "react";
import { usePortalData, type ItemType } from "./portal-data";
import {
  categoriesApi,
  normalizeCategorySlug,
  getCategoryDescription,
  getCategoryTitle,
  type Category,
  type Language,
} from "./CategoryGrid";
import { usePortalLanguage } from "./PortalLanguageContext";

const categorySlugByType: Record<ItemType, string> = {
  job: "jobs",
  scheme: "schemes",
  examination: "examination",
  exam: "examination",
  result: "results",
  admit: "admit-cards",
  guide: "articles-guides",
  video: "videos",
};

const categoryTypeBySlug: Record<string, ItemType> = {
  jobs: "job",
  schemes: "scheme",
  examination: "examination",
  results: "result",
  "admit-cards": "admit",
  "articles-guides": "guide",
  videos: "video",
};

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

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(categoriesApi, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Category request failed: ${response.status}`);
        }

        const payload: Category[] | { results?: Category[] } =
          await response.json();

        setCategories(Array.isArray(payload) ? payload : payload.results ?? []);
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

  const category = useMemo(
    () =>
      categories.find(
        (entry) =>
          entry.active &&
          normalizeCategorySlug(entry.slug) === normalizeCategorySlug(categorySlug),
      ),
    [categories, categorySlug],
  );

  const title = category ? getCategoryTitle(category, language) : "";
  const subtitle = category ? getDescription(category, language) : "";

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      const itemType = categoryTypeBySlug[item.type] || (item.type === "guide" ? "guide" : undefined);
      if (itemType !== type) return false;

      return (
        !term ||
        [item.title, item.category, item.description].some((value) =>
          value.toLowerCase().includes(term),
        )
      );
    });
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
              <button type="submit">{copy.searchButton}</button>
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
              <div className="empty-state">Loading...</div>
            ) : filtered.length ? (
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
                  <time>{formatDate(item.date, language)}</time>
                  <span className="new-pill">{copy.newest}</span>
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
