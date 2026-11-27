"use client";

// File Location: shivanyams/src/components/admitCard/AdmitCardsPage.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shivanya-ui icons and shivanya-i18n types reused where applicable); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Audited localized filtering, loading/error/empty states, category badges, navigation and shared portal data dependencies. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.



import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/admitCard/AdmitCardsPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { AdmitCardsCharacters } from "./AdmitCardsCharacters";
import { getLocalizedPostSummary, getLocalizedPostTitle, usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function AdmitCardsPage() {
  useRefreshPortalDataOnMount();
  const [query, setQuery] = useState("");

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const admitCards = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "admit") return false;

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
      <div className="admit-page">
        <main>
          <section className="admit-hero">
            <div className="admit-hero-content">
              <span className="admit-eyebrow">{t("admitEyebrow")}</span>

              <h1>
                {t("admitHeroTitleLine1")}
                <br />
                <span>{t("admitHeroTitleLine2")}</span>
              </h1>

              <p>{t("admitHeroDescription")}</p>

              <form
                className="admit-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("admitSearchPlaceholder")}
                />

                <button type="submit">{t("search")}</button>
              </form>
            </div>

            <div className="admit-hero-visual" aria-hidden="true">
              <AdmitCardsCharacters />
            </div>
          </section>

          <section className="admit-updates panel" id="updates">
            <div className="section-heading">
              <h2>{t("latestAdmitCards")}</h2>
              <span>
                {admitCards.length} {t("updatesCount")}
              </span>
            </div>

            <div className="update-list">
              {admitCards.length ? (
                admitCards.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/admit-cards/${item.slug || createPostSlug(item.title)}`}
                  >
                    <CategoryBadge
                      category={getCategorySlugForType(item.type)}
                      label={getLocalizedCategoryLabel(item, language)}
                    />

                    <span className="update-title">
                      {getLocalizedPostTitle(item, language)}
                      <small>{getLocalizedPostSummary(item, language)}</small>
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
                        : t("new")}
                    </time>

                    <span className="new-pill">{t("new")}</span>
                  </a>
                ))
               ) : data.loading ? (
                <div className="update-skeleton-list" aria-label="Loading admit cards" aria-busy="true">
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
              ) : data.failedTypes?.includes("admit") && data.error ? (
                <div className="empty-state empty-admit">{data.error}</div>
              ) : (
                <div className="empty-state empty-admit">
                   {t("noAdmitCardsAvailable")}
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
