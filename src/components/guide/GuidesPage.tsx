"use client";

import "../portal/home/UpdatesSection.css";
import "./GuidesPage.css";

import { useMemo, useState } from "react";
import type { Language } from "shivanya-i18n";
import { GuidesCharacters } from "./GuidesCharacters";
import { usePortalData } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";

import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

export function GuidesPage() {
  const [query, setQuery] = useState("");

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const guides = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "guide") return false;

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
      <div className="guides-page">
        <main>
          <section className="guides-hero">
            <div className="guides-hero-content">
              <span className="guides-eyebrow">{t("guidesEyebrow")}</span>

              <h1>
                {t("guidesHeroTitleLine1")}
                <br />
                <span>{t("guidesHeroTitleLine2")}</span>
              </h1>

              <p>{t("guidesHeroDescription")}</p>

              <form
                className="guides-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("guidesSearchPlaceholder")}
                />

                <button type="submit">{t("search")}</button>
              </form>
            </div>

            <div className="guides-hero-visual" aria-hidden="true">
              <GuidesCharacters />
            </div>
          </section>

          <section className="guides-updates panel" id="updates">
            <div className="section-heading">
              <h2>{t("latestGuidesArticles")}</h2>
              <span>
                {guides.length} {t("updatesCount")}
              </span>
            </div>

            <div className="update-list">
              {guides.length ? (
                guides.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/guides/${item.slug || createPostSlug(item.title)}`}
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
                <div className="empty-state empty-guide">{t("noGuidesAvailable")}</div>
              )}
            </div>
          </section>
        </main>
      </div>

      <PortalFooter />
    </>
  );
}
