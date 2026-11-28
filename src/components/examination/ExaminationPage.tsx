/* File Location: shivanyams/src/components/examination/ExaminationPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Both repositories are read-only references.
 */
"use client";

import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/jobs/JobsPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { ExaminationCharacters } from "./ExaminationCharacters";
import {
  getLocalizedPostSummary,
  getLocalizedPostTitle,
  usePortalData,
  useRefreshPortalDataOnMount,
} from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import {
  CategoryBadge,
  getCategorySlugForType,
  getLocalizedCategoryLabel,
} from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";
import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function ExaminationPage() {
  useRefreshPortalDataOnMount();
  const { data } = usePortalData();
  const { language } = usePortalLanguage();
  const [query, setQuery] = useState("");

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const examinations = useMemo(
    () =>
      data.items.filter((item) => {
        if (item.type !== "examination") return false;
        const term = query.trim().toLocaleLowerCase();
        if (!term) return true;
        return [
          getLocalizedPostTitle(item, language),
          getLocalizedPostSummary(item, language),
          getLocalizedCategoryLabel(item, language),
          ...(Array.isArray(item.tags) ? item.tags : []),
        ].some((value) => String(value || "").toLocaleLowerCase().includes(term));
      }),
    [data.items, language, query],
  );

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    data.items
      .filter((item) => item.type === "examination")
      .forEach((item) => {
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
  }, [data.items]);

  return (
    <>
      <div className="jobs-page">
        <main>
          <section className="jobs-hero">
            <div className="jobs-hero-content">
              <span className="jobs-eyebrow">{t("examinationEyebrow")}</span>
              <h1>
                {t("examinationHeroTitleLine1")}
                <br />
                <span>{t("examinationHeroTitleLine2")}</span>
              </h1>
              <p>{t("examinationHeroDescription")}</p>

              <form className="jobs-search" role="search" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("examinationSearchPlaceholder")}
                  aria-label={t("examinationSearchPlaceholder")}
                />
                <button type="submit">{t("search")}</button>
              </form>

              {popularTags.length > 0 ? (
                <div className="jobs-popular-tags portal-post-taxonomy" aria-label="Popular examination tags">
                  {popularTags.map((tag) => (
                    <a className="portal-custom-tag" href={`/tags/${createPostSlug(tag)}`} key={tag}>
                      {tag}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="jobs-hero-visual" aria-hidden="true">
              <ExaminationCharacters />
            </div>
          </section>

          <section className="jobs-updates panel updates-panel-language-${language}" id="updates">
            <div className="section-heading">
              <h2>{t("latestExaminationUpdates")}</h2>
              <span>{examinations.length} {t("updatesCount")}</span>
            </div>

            <div className="update-list">
              {data.loading && examinations.length === 0 ? (
                <div className="update-skeleton-list" aria-label="Loading examination updates" aria-busy="true">
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
              ) : examinations.length ? (
                examinations.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/exams/${item.slug || createPostSlug(item.title)}`}
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
              ) : data.failedTypes?.includes("examination") && data.error ? (
                <div className="empty-state empty-exam">{data.error}</div>
              ) : (
                <div className="empty-state empty-exam">
                  {query.trim() ? t("tryAnotherSearch") : t("noExaminationUpdates")}
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
