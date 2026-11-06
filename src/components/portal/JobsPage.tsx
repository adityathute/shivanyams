"use client";

import "./UpdatesSection.css";
import "./JobsPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";
import type { Language } from "shivanya-i18n";
import { usePortalLanguage } from "./PortalLanguageContext";
import {
  baseDictionary,
  getBaseText,
} from "../../i18n/dictionaries/base";

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
              <span className="jobs-eyebrow">
                {t("jobsEyebrow")}
              </span>

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
              <div className="jobs-visual-circle">
                <div className="jobs-visual-card">
                  <span className="jobs-visual-icon">▣</span>

                  <strong>{t("governmentJobs")}</strong>

                  <small>{t("exploreOpportunities")}</small>

                  <div className="jobs-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="jobs-visual-status">
                    <span />
                    {t("recruitmentUpdates")}
                  </div>
                </div>
              </div>

              <div className="jobs-floating-icon jobs-floating-one">
                ✓
              </div>

              <div className="jobs-floating-icon jobs-floating-two">
                ₹
              </div>
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
              {jobs.length ? (
                jobs.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={item.link || "#"}
                    target={item.link ? "_blank" : undefined}
                    rel={item.link ? "noreferrer" : undefined}
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
                        ? new Date(
                            `${item.date}T12:00:00`,
                          ).toLocaleDateString(
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
              ) : (
                <div className="empty-state">
                  {t("noJobsAvailable")}
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