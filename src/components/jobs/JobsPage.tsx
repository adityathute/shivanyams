"use client";

import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/jobs/JobsPage.css";
import { useMemo, useState } from "react";
import { getLocalizedPostSummary, getLocalizedPostTitle, usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";
import type { Language } from "shivanya-i18n";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";
import { JobsCharacters } from "./JobsCharacters";
import { PortalEmptyState } from "../portal/category/PortalEmptyState";

export function JobsPage() {
  useRefreshPortalDataOnMount();
  const [query, setQuery] = useState("");
  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const jobs = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "job") return false;

      return (
        !term ||
        [item.title, item.title_en, item.title_mr, item.title_hi, item.category, item.description, item.summary_en, item.summary_mr, item.summary_hi].some((value) =>
          String(value || "").toLowerCase().includes(term),
        )
      );
    });
  }, [data.items, query]);

  return (
    <>
      <div className="jobs-page">
        <main>
          <section className="jobs-hero">
            <div className="jobs-hero-content">
              <span className="jobs-eyebrow">{t("jobsEyebrow")}</span>

              <h1>
                {t("jobsHeroTitleLine1")}
                <br />
                <span>{t("jobsHeroTitleLine2")}</span>
              </h1>

              <p>{t("jobsHeroDescription")}</p>

              <form
                className="jobs-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("jobsSearchPlaceholder")}
                />

                <button type="submit">{t("search")}</button>
              </form>
            </div>

            <div className="jobs-hero-visual" aria-hidden="true">
              <JobsCharacters />
            </div>
          </section>

          <section className="jobs-updates panel" id="updates">
            <div className="section-heading">
              <h2>{t("latestGovernmentJobs")}</h2>

              <span>
                {jobs.length} {t("updatesCount")}
              </span>
            </div>

            <div className="update-list">
              {data.loading && jobs.length === 0 ? (
                <div className="update-skeleton-list" aria-label="Loading jobs" aria-busy="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div className="update-skeleton-row" key={index} aria-hidden="true">
                      <span className="update-skeleton-badge" />
                      <span className="update-skeleton-copy"><span className="update-skeleton-title" /><span className="update-skeleton-summary" /></span>
                      <span className="update-skeleton-date" /><span className="update-skeleton-pill" />
                    </div>
                  ))}
                </div>
              ) : null}
              {!data.loading && jobs.length === 0 && data.failedTypes?.includes("job") && data.error ? <div className="empty-state empty-job">{data.error}</div> : null}
              {jobs.length ? (
                jobs.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/jobs/${item.slug || createPostSlug(item.title)}`}
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
                            language === "mr"
                              ? "mr-IN"
                              : language === "hi"
                                ? "hi-IN"
                                : "en-IN",
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
              ) : !data.loading && !data.failedTypes?.includes("job") ? (
                <PortalEmptyState title={t("noJobsAvailable")} description={language === "en" ? "New opportunities will appear here as soon as they are published." : language === "mr" ? "नवीन संधी प्रकाशित झाल्यावर येथे दिसतील." : "नई भर्तियां प्रकाशित होते ही यहाँ दिखाई देंगी।"} icon="⌕" />
              ) : null}
            </div>
          </section>
        </main>
      </div>

      <PortalFooter />
    </>
  );
}
