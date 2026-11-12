"use client";

import "./UpdatesSection.css";
import "./AdmitCardsPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { AdmitCardsCharacters } from "./AdmitCardsCharacters";
import { usePortalData } from "./portal-data";
import { createPostSlug } from "./PortalPostDetail";
import { usePortalLanguage } from "./PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function AdmitCardsPage() {
  const [query, setQuery] = useState("");

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const admitCards = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "admit") return false;

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

              <form
                className="admit-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("admitSearchPlaceholder")}
                />

                <button type="submit">{t("search")}</button>
              </form>
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
                    href={`/admit-cards/${createPostSlug(item.title)}`}
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
                <div className="empty-state">{t("noAdmitCardsAvailable")}</div>
              )}
            </div>
          </section>
        </main>
      </div>

      <PortalFooter />
    </>
  );
}
