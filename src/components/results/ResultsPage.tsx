/*
 * File Location: shivanyams/src/components/results/ResultsPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Audited localized filtering, loading/error/empty states, category badges, navigation and shared portal data dependencies. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.
 */
"use client";

// File Location: shivanyams/src/components/results/ResultsPage.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shivanya-ui icons and shivanya-i18n types reused where applicable); shivanya-auth (private, version not verified)



import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/results/ResultsPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { ResultsCharacters } from "./ResultsCharacters";
import { getLocalizedPostSummary, getLocalizedPostTitle, usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function ResultsPage() {
  useRefreshPortalDataOnMount();
  const [query, setQuery] = useState("");

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "result") return false;

      return (
        !term ||
        [item.title, item.title_en, item.title_mr, item.title_hi, item.category, item.description, item.summary_en, item.summary_mr, item.summary_hi].some((value) =>
          String(value || "").toLowerCase().includes(term),
        )
      );
    });
  }, [data.items, query]);

  const dateLocale =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";

  return (
    <>
      <div className="results-page">
        <main>
          <section className="results-hero">
            <div className="results-hero-content">
              <span className="results-eyebrow">{t("resultsEyebrow")}</span>

              <h1>
                {t("resultsHeroTitleLine1")}
                <br />
                <span>{t("resultsHeroTitleLine2")}</span>
              </h1>

              <p>{t("resultsHeroDescription")}</p>

              <form
                className="results-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("resultsSearchPlaceholder")}
                />

                <button type="submit">{t("search")}</button>
              </form>
            </div>

            <div className="results-hero-visual" aria-hidden="true">
              <ResultsCharacters />
            </div>
          </section>

          <section className="results-updates panel" id="updates">
            <div className="section-heading">
              <h2>{t("latestExamResults")}</h2>
              <span>
                {results.length} {t("updatesCount")}
              </span>
            </div>

            <div className="update-list">
              {results.length ? (
                results.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/results/${item.slug || createPostSlug(item.title)}`}
                  >
                    <CategoryBadge
                      category={getCategorySlugForType(item.type)}
                      label={getLocalizedCategoryLabel(item, language)}
                    />

                    <span className="update-title">
                      {getLocalizedPostTitle(item, language)}
                      <small>{getLocalizedPostSummary(item, language)}</small>
                    </span>
                  </a>
                ))
               ) : data.loading ? (
<div className="update-skeleton-list" aria-label="Loading exam results" aria-busy="true">
                  {Array.from({ length: 2 }, (_, index) => (
                    <div className="update-skeleton-row" key={index} aria-hidden="true">
                      <span className="update-skeleton-badge" />
                      <span className="update-skeleton-copy">
                        <span className="update-skeleton-title" />
                        <span className="update-skeleton-summary" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : data.failedTypes?.includes("result") && data.error ? (
                <div className="empty-state empty-result">{data.error}</div>
              ) : (
                <div className="empty-state empty-result">
                   {t("noResultsAvailable")}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <PortalFooter />
    </>
  );
}
