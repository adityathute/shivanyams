"use client";

import "./UpdatesSection.css";
import "./ResultsPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { ResultsCharacters } from "./ResultsCharacters";
import { usePortalData } from "./portal-data";
import { createPostSlug } from "./PortalPostDetail";
import { usePortalLanguage } from "./PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function ResultsPage() {
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
                    <span className={`update-badge ${item.type}`}>
                      {item.category}
                    </span>

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
              ) : (
                <div className="empty-state">{t("noResultsAvailable")}</div>
              )}
            </div>
          </section>
        </main>
      </div>

      <PortalFooter />
    </>
  );
}
