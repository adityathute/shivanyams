"use client";

import "./UpdatesSection.css";
import "./JobsPage.css";
import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { createPostSlug } from "./PortalPostDetail";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";
import type { Language } from "shivanya-i18n";
import { usePortalLanguage } from "./PortalLanguageContext";
import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";
import { JobsCharacters } from "./JobsCharacters";

export function JobsPage() {
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
        [item.title, item.category, item.description].some((value) =>
          value.toLowerCase().includes(term),
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
              {data.loading ? <div className="empty-state">Loading...</div> : null}
              {!data.loading && data.error ? <div className="empty-state">{data.error}</div> : null}
              {!data.loading && !data.error && jobs.length ? (
                jobs.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/jobs/${item.slug || createPostSlug(item.title)}`}
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
              ) : !data.loading && !data.error ? (
                <div className="empty-state">{t("noJobsAvailable")}</div>
              ) : null}
            </div>
          </section>
        </main>
      </div>

      <PortalFooter />
    </>
  );
}
