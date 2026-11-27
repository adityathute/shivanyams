/**
 * File Location: shivanyams/src/components/scheme/SchemesPage.tsx
 * Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
 * Checked Repository: adityathute/shivanyams @ shiv-v2
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 20 audit; review complete, follow-up work remains tracked in PROJECT_STRUCTURE.md.
 */
"use client";

import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/scheme/SchemesPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { SchemesCharacters } from "./SchemesCharacters";
import { getLocalizedPostSummary, getLocalizedPostTitle, usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";

import {
  baseDictionary,
  getBaseText,
} from "../../i18n/dictionaries/base";

export function SchemesPage() {
  useRefreshPortalDataOnMount();
  const [query, setQuery] = useState("");

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const schemes = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "scheme") return false;

      return (
        !term ||
        [item.title, item.title_en, item.title_mr, item.title_hi, item.category, item.description, item.summary_en, item.summary_mr, item.summary_hi].some((value) =>
          String(value || "").toLowerCase().includes(term),
        )
      );
    });
  }, [data.items, query]);

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

              <form
                className="schemes-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("schemesSearchPlaceholder")}
                />

                <button type="submit">{t("search")}</button>
              </form>
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
                      <span className="update-skeleton-date" />
                      <span className="update-skeleton-pill" />
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

                    <time>
                      {item.date
                        ? new Date(
                            `${item.date}T12:00:00`,
                          ).toLocaleDateString(dateLocale, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : t("new")}
                    </time>

                    <span className="new-pill">{t("new")}</span>
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