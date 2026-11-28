/*
 * File Location: shivanyams/src/components/portal/saved/SavedPostsPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 */
"use client";

import "./../../../styles/legacy/components/portal/saved/SavedPostsPage.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "shivanya-auth";

import {
  categoryConfig,
  CategoryBadge,
  getCategorySlugForType,
  getCategoryTitle,
  getLocalizedCategoryLabel,
  getPortalApiUrl,
  normalizeCategorySlug,
  type Category,
  type Language,
} from "../category/CategoryGrid";
import {
  mapPost,
  type ApiPost,
  type Item,
  type ItemType,
} from "../data/portal-data";
import { formatJobApplicationDeadline, getJobApplicationDeadline, getJobDeadlineStatus } from "../utils/job-deadline";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { usePortalAuth } from "../context/PortalAuthContext";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";

const CATEGORY_ORDER = [
  "jobs",
  "schemes",
  "articles-guides",
  "admit-cards",
  "examination",
  "results",
  "videos",
  "tools",
];

const copy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    description: string;
    all: string;
    empty: string;
    emptyFiltered: string;
    loading: string;
    loginTitle: string;
    loginDescription: string;
    login: string;
    posts: string;
  }
> = {
  en: {
    eyebrow: "YOUR PERSONAL COLLECTION",
    title: "Saved posts",
    description: "Keep important jobs, schemes and updates in one place.",
    all: "All",
    empty: "You have not saved any posts yet.",
    emptyFiltered: "There are no saved posts in this category.",
    loading: "Loading your saved posts...",
    loginTitle: "Sign in to view your saved posts",
    loginDescription: "Your saved posts are available whenever you sign in to your account.",
    login: "Sign in",
    posts: "saved posts",
  },
  mr: {
    eyebrow: "तुमचा वैयक्तिक संग्रह",
    title: "जतन केलेल्या पोस्ट",
    description: "महत्त्वाच्या नोकऱ्या, योजना आणि अपडेट्स एकाच ठिकाणी ठेवा.",
    all: "सर्व",
    empty: "तुम्ही अजून कोणतीही पोस्ट जतन केलेली नाही.",
    emptyFiltered: "या विभागात जतन केलेल्या पोस्ट नाहीत.",
    loading: "जतन केलेल्या पोस्ट लोड होत आहेत...",
    loginTitle: "जतन केलेल्या पोस्ट पाहण्यासाठी लॉगिन करा",
    loginDescription: "लॉगिन केल्यानंतर तुमच्या जतन केलेल्या पोस्ट येथे उपलब्ध असतील.",
    login: "लॉगिन",
    posts: "जतन केलेल्या पोस्ट",
  },
  hi: {
    eyebrow: "आपका निजी संग्रह",
    title: "सहेजी गई पोस्ट",
    description: "महत्वपूर्ण नौकरियाँ, योजनाएँ और अपडेट एक जगह रखें।",
    all: "सभी",
    empty: "आपने अभी तक कोई पोस्ट सेव नहीं की है।",
    emptyFiltered: "इस श्रेणी में कोई सेव की गई पोस्ट नहीं है।",
    loading: "आपकी सेव की गई पोस्ट लोड हो रही हैं...",
    loginTitle: "सेव की गई पोस्ट देखने के लिए लॉगिन करें",
    loginDescription: "लॉगिन करने के बाद आपकी सेव की गई पोस्ट यहाँ उपलब्ध रहेंगी।",
    login: "लॉगिन",
    posts: "सेव की गई पोस्ट",
  },
};

function getPostHref(item: Item) {
  const slug = item.slug || item.id;

  switch (item.type) {
    case "job":
      return `/jobs/${slug}`;
    case "scheme":
      return `/schemes/${slug}`;
    case "examination":
    case "exam":
      return `/examination/${slug}`;
    case "result":
      return `/results/${slug}`;
    case "admit":
      return `/admit-cards/${slug}`;
    case "guide":
      return `/guides/${slug}`;
    case "video":
      return `/videos/${slug}`;
    case "tool":
      return `/tools/${slug}`;
    default:
      return "/";
  }
}

function getLocalized(
  language: Language,
  values: { en?: string; mr?: string; hi?: string },
) {
  return (
    values[language]?.trim() ||
    values.en?.trim() ||
    values.mr?.trim() ||
    values.hi?.trim() ||
    ""
  );
}

export function SavedPostsPage() {
  const { user, loading: authLoading } = useAuth();
  const { openLogin } = usePortalAuth();
  const { language } = usePortalLanguage();
  const text = copy[language];

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<ItemType | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadSavedPosts = useCallback(async (signal?: AbortSignal) => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(
        getPortalApiUrl("saved-posts/"),
        { cache: "no-store", signal },
      );

      if (!response.ok) {
        throw new Error(`Saved posts request failed (${response.status}).`);
      }

      const payload: ApiPost[] | { results?: ApiPost[] } =
        await response.json();
      const posts = Array.isArray(payload) ? payload : payload.results ?? [];

      const savedItems = posts.flatMap((post) => {
        const slug = normalizeCategorySlug(post.category?.slug || "");
        const config = categoryConfig[slug];
        return config ? [mapPost(post, config.type)] : [];
      });

      setItems(savedItems);
    } catch (loadError) {
      if (signal?.aborted) return;
      console.error("Saved posts loading failed:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load saved posts.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    if (authLoading) return () => controller.abort();

    void loadSavedPosts(controller.signal);
    return () => controller.abort();
  }, [authLoading, loadSavedPosts]);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }

    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await authenticatedFetch(
          getPortalApiUrl("categories/"),
          { signal: controller.signal },
        );
        if (!response.ok) return;

        const payload: Category[] | { results?: Category[] } =
          await response.json();
        const rows = Array.isArray(payload) ? payload : payload.results ?? [];

        const active = rows
          .filter((category) => category.is_active ?? category.active ?? false)
          .map((category) => ({
            ...category,
            slug: normalizeCategorySlug(category.slug),
          }))
          .filter((category) => Boolean(categoryConfig[category.slug]))
          .sort(
            (a, b) =>
              CATEGORY_ORDER.indexOf(a.slug) -
              CATEGORY_ORDER.indexOf(b.slug),
          );

        setCategories(active);
      } catch (categoryError) {
        if (!controller.signal.aborted) {
          console.error("Saved post categories loading failed:", categoryError);
        }
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, [user]);

  const filteredItems = useMemo(
    () => (selectedType === "all" ? items : items.filter((item) => item.type === selectedType))
      .slice()
      .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()),
    [items, selectedType],
  );
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  const firstItem = filteredItems.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, filteredItems.length);

  useEffect(() => { setPage(1); }, [selectedType, pageSize]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  if (authLoading || (user && loading)) {
    return (
      <div className="saved-page">
        <div className="saved-empty-state" role="status">{text.loading}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="saved-page">
        <header className="saved-page-heading">
          <span className="saved-eyebrow">{text.eyebrow}</span>
          <h1>{text.title}</h1>
          <p>{text.description}</p>
        </header>
        <section className="saved-empty-state">
          <div className="saved-empty-icon" aria-hidden="true">▱</div>
          <h2>{text.loginTitle}</h2>
          <p>{text.loginDescription}</p>
          <button type="button" className="saved-login-button" onClick={() => openLogin()}>
            {text.login}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <header className="saved-page-heading">
        <span className="saved-eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </header>

      <section className="saved-panel">
        <div className="saved-section-heading">
          <h2>{text.title}</h2>
          <span>{items.length} {text.posts}</span>
        </div>

        <div className="saved-category-tabs" aria-label="Filter saved posts by category">
          <button
            type="button"
            className={selectedType === "all" ? "selected" : ""}
            onClick={() => setSelectedType("all")}
          >
            {text.all}
            <span>{items.length}</span>
          </button>
          {categories.map((category) => {
            const config = categoryConfig[category.slug];
            if (!config) return null;

            const count = items.filter((item) => item.type === config.type).length;

            return (
              <button
                type="button"
                key={category.id}
                className={selectedType === config.type ? "selected" : ""}
                onClick={() => setSelectedType(config.type)}
              >
                {getCategoryTitle(category, language)}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="saved-error" role="alert">{error}</p>}

        <div className="saved-post-list update-list">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => {
              const title = getLocalized(language, {
                en: item.title_en,
                mr: item.title_mr,
                hi: item.title_hi,
              }) || item.title;
              const summary = getLocalized(language, {
                en: item.summary_en,
                mr: item.summary_mr,
                hi: item.summary_hi,
              }) || item.description;
              const category = getLocalizedCategoryLabel(item, language);
              const hasRevisedDeadline = item.important_dates?.some(
                (entry) => entry.date_type === "application_end" &&
                  (entry.date_format === "revised" || entry.date_format === "revised_with_time"),
              ) ?? false;
              const applicationDeadline = item.type === "job" && hasRevisedDeadline
                ? getJobApplicationDeadline(item)
                : "";
              const deadlineStatus = applicationDeadline
                ? getJobDeadlineStatus(applicationDeadline)
                : "";

              return (
                <article className="saved-update-row" key={item.id}>
                  <CategoryBadge
                    category={getCategorySlugForType(item.type)}
                    label={category || item.category}
                  />
                  <div className="saved-update-content">
                    <Link className="saved-update-title" href={getPostHref(item)}>
                      {title}
                      {summary && <small>{summary}</small>}
                    </Link>
                  </div>
                  {applicationDeadline ? (
                    <span className="update-deadline-group">
                      <span className="update-deadline-extended">
                        {language === "mr" ? "मुदतवाढ" : language === "hi" ? "तिथि बढ़ाई गई" : "Date Extended"}
                      </span>
                      <time className={`update-application-deadline deadline-${deadlineStatus}`}>
                        {formatJobApplicationDeadline(applicationDeadline)}
                      </time>
                    </span>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="saved-empty-state saved-list-empty">
              {items.length === 0 ? text.empty : text.emptyFiltered}
            </div>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="updates-admin-pagination admin-table-footer saved-pagination">
            <span>
              Showing {firstItem.toLocaleString("en-IN")}–{lastItem.toLocaleString("en-IN")} of {filteredItems.length.toLocaleString("en-IN")}
            </span>
            <div className="admin-pagination">
              <label>
                Rows
                <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} aria-label="Rows per page">
                  {[10, 15, 25, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
