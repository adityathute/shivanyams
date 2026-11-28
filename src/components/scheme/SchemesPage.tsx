/*
 * File Location: shivanyams/src/components/scheme/SchemesPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 20 audit; review complete, follow-up work remains tracked in PROJECT_STRUCTURE.md.
 */
"use client";

import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/scheme/SchemesPage.css";

import { useMemo } from "react";
import type { Language } from "shivanya-i18n";
import { SchemesCharacters } from "./SchemesCharacters";
import { getLocalizedPostSummary, getLocalizedPostTitle, usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";

import { PortalFooter } from "../portal/layout/footer/PortalFooter";

import {
  baseDictionary,
  getBaseText,
} from "../../i18n/dictionaries/base";

export function SchemesPage() {
  useRefreshPortalDataOnMount();
  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const schemes = useMemo(
    () => data.items.filter((item) => item.type === "scheme"),
    [data.items],
  );

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    schemes.forEach((item) => {
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
  }, [schemes]);

  const dateLocale =
    language === "mr"
      ? "mr-IN"
      : language === "hi"
        ? "hi-IN"
        : "en-IN";

  return (
    <>
      <div className="schemes-page">
        <main>
          <section className="schemes-hero">
            <div className="schemes-hero-content">
              <span className="schemes-eyebrow">
                {t("schemesEyebrow")}
              </span>

              <h1>
                {t("schemesHeroTitleLine1")}
                <br />
                <span>{t("schemesHeroTitleLine2")}</span>
              </h1>

              <p>{t("schemesHeroDescription")}</p>

              {popularTags.length > 0 ? (
                <div className="schemes-popular-tags portal-post-taxonomy" aria-label="Popular scheme tags">
                  {popularTags.map((tag) => (
                    <a className="portal-custom-tag" href={`/tags/${createPostSlug(tag)}`} key={tag}>{tag}</a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="schemes-hero-visual" aria-hidden="true">
  <SchemesCharacters />

            </div>
          </section>

          <section className="schemes-updates panel" id="updates">
            <div className="section-heading">
              <h2>{t("latestGovernmentSchemes")}</h2>
              <span>
                {schemes.length} {t("updatesCount")}
              </span>
            </div>

            <div className="update-list">
              {data.loading && schemes.length === 0 ? (
                <div className="update-skeleton-list" aria-label="Loading schemes" aria-busy="true">
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
              ) : schemes.length ? (
                schemes.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/schemes/${item.slug || createPostSlug(item.title)}`}
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
              ) : data.failedTypes?.includes("scheme") && data.error ? (
                <div className="empty-state empty-scheme">{data.error}</div>
              ) : (
                <div className="empty-state empty-scheme">
                   {t("noSchemesAvailable")}
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