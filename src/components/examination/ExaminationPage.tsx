"use client";

import "./../../styles/legacy/components/portal/home/UpdatesSection.css";
import "./../../styles/legacy/components/jobs/JobsPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { ExaminationCharacters } from "./ExaminationCharacters";
import { usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getCategorySlugForType, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function ExaminationPage() {
  useRefreshPortalDataOnMount();
  const [query, setQuery] = useState("");

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const examinations = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "examination") return false;

      return (
        !term ||
        [item.title, item.category, item.description].some((value) =>
          value.toLowerCase().includes(term),
        )
      );
    });
  }, [data.items, query]);

  const dateLocale =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";

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

              <form
                className="jobs-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("examinationSearchPlaceholder")}
                />

                <button type="submit">{t("search")}</button>
              </form>
            </div>

            <div className="jobs-hero-visual" aria-hidden="true">
              <ExaminationCharacters />
            </div>
          </section>

          <section className="jobs-updates panel" id="updates">
            <div className="section-heading">
              <h2>{t("latestExaminationUpdates")}</h2>
              <span>
                {examinations.length} {t("updatesCount")}
              </span>
            </div>

            <div className="update-list">
              {examinations.length ? (
                examinations.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/examination/${item.slug || createPostSlug(item.title)}`}
                  >
                    <CategoryBadge
                      category={getCategorySlugForType(item.type)}
                      label={getLocalizedCategoryLabel(item, language)}
                    />

                    <span className="update-title">
                      {item.title}
                      <small>{item.description}</small>
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
                <div className="empty-state empty-exam">Loading...</div>
              ) : data.error ? (
                <div className="empty-state empty-exam">{data.error}</div>
              ) : (
                <div className="empty-state empty-exam">
                   {t("noExaminationUpdates")}
                </div>
              )
            </div>
          </section>
        </main>
      </div>

      <PortalFooter />
    </>
  );
}
