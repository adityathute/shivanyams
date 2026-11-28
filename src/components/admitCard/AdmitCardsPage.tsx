/* File Location: shivanyams/src/components/admitCard/AdmitCardsPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

// Cleanup Status: Cleanup Pending
// Cleanup Info: Audited localized filtering, loading/error/empty states, category badges, navigation and shared portal data dependencies. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.



import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/admitCard/AdmitCardsPage.css";

import { useMemo } from "react";
import type { Language } from "shivanya-i18n";
import { AdmitCardsCharacters } from "./AdmitCardsCharacters";
import { getLocalizedPostSummary, getLocalizedPostTitle, usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";

import { PortalFooter } from "../portal/layout/footer/PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function AdmitCardsPage() {
  useRefreshPortalDataOnMount();

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const admitCards = useMemo(
    () => data.items.filter((item) => item.type === "admit"),
    [data.items],
  );

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    admitCards.forEach((item) => {
      (Array.isArray(item.tags) ? item.tags : []).forEach((tag) => {
        const cleanTag = String(tag || "").trim();
        if (!cleanTag) return;
        const normalized = cleanTag.toLocaleLowerCase();
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [admitCards]);


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

              {popularTags.length > 0 ? (
                <div className="admit-popular-tags portal-post-taxonomy" aria-label="Popular admit-card tags">
                  {popularTags.map((tag) => (
                    <a className="portal-custom-tag" href={`/tags/${createPostSlug(tag)}`} key={tag}>{tag}</a>
                  ))}
                </div>
              ) : null}
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
