"use client";

import "./UpdatesSection.css";
import "./SchemesPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";

import { usePortalData } from "./portal-data";
import { usePortalLanguage } from "./PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

import {
  baseDictionary,
  getBaseText,
} from "../../i18n/dictionaries/base";

export function SchemesPage() {
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
        [item.title, item.category, item.description].some((value) =>
          value.toLowerCase().includes(term),
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
              <div className="schemes-visual-circle">
                <div className="schemes-visual-card">
                  <span className="schemes-visual-icon">▣</span>
                  <strong>{t("governmentSchemes")}</strong>
                  <small>{t("exploreBenefits")}</small>

                  <div className="schemes-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="schemes-visual-status">
                    <span />
                    {t("schemeUpdates")}
                  </div>
                </div>
              </div>

              <div className="schemes-floating-icon schemes-floating-one">
                ✓
              </div>

              <div className="schemes-floating-icon schemes-floating-two">
                ₹
              </div>
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
              {schemes.length ? (
                schemes.map((item) => (
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
              ) : (
                <div className="empty-state">
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