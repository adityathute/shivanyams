"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "./HeroSection";
import { CategoryGrid, categoryConfig, getCategorySlugForType } from "../category/CategoryGrid";
import { UpdatesSection } from "./UpdatesSection";
import { VideosSection } from "../../videos/VideosSection";
import type { Item, ItemType } from "../data/portal-data";
import { usePortalData, useRefreshPortalDataOnMount } from "../data/portal-data";
import { PortalFooter } from "../layout/footer/PortalFooter";
import { MailIcon } from "shivanya-ui";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { useImportantLinks } from "../utils/useImportantLinks";
import { getBaseText } from "../../../i18n/dictionaries/base";
import { LinkIcon } from "shivanya-ui";
import { HOMEPAGE_USEFUL_LINKS_DISPLAY_LIMIT } from "../utils/important-links-config";
import { createPostSlug } from "../post/PortalPostDetail";
import { NewsletterSubscribeButton } from "../post/NewsletterSubscribeButton";

export function HomePage() {
  useRefreshPortalDataOnMount();
  const { language: selectedLanguage } = usePortalLanguage();
  const [active, setActive] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const { data } = usePortalData();
  const tickerItems = data.items.slice(0, 20);
  const { links, getLinkTitle } = useImportantLinks();

  const t = (key: Parameters<typeof getBaseText>[0]) =>
    getBaseText(key, selectedLanguage);

  const [tickerIndex, setTickerIndex] = useState(0);
  const [visibleTickerCount, setVisibleTickerCount] = useState(6);

  useEffect(() => {
    const tabletQuery = window.matchMedia("(min-width: 761px) and (max-width: 1100px)");
    const ultraWideQuery = window.matchMedia("(min-width: 1920px)");
    const updateVisibleCount = () => {
      setVisibleTickerCount(
        tabletQuery.matches ? 4 : 6,
      );
      setTickerIndex(0);
    };

    updateVisibleCount();
    tabletQuery.addEventListener("change", updateVisibleCount);
    ultraWideQuery.addEventListener("change", updateVisibleCount);
    return () => {
      tabletQuery.removeEventListener("change", updateVisibleCount);
      ultraWideQuery.removeEventListener("change", updateVisibleCount);
    };
  }, []);

  const getPostTitle = (item: Item): string => {
    const titles: Record<string, string | undefined> = {
      en: item.title_en,
      mr: item.title_mr,
      hi: item.title_hi,
    };

    return (
      titles[selectedLanguage]?.trim() ||
      item.title_en?.trim() ||
      item.title_mr?.trim() ||
      item.title_hi?.trim() ||
      ""
    );
  };

  const handleNextTicker = () => {
    const maxIndex = Math.max(0, tickerItems.length - visibleTickerCount);

    setTickerIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <div className="portal">
      <div className="ticker" aria-label="Latest updates">
        <span className="ticker-label">
          <span className="ticker-label-icon">⚑</span>
          Latest Updates
        </span>

        <div className="ticker-track" aria-live="polite">
          <div
            className="ticker-slides"
            style={{
              transform: `translateX(-${tickerIndex * (100 / visibleTickerCount)}%)`,
            } as React.CSSProperties}
          >
            {tickerItems.length > 0 ? tickerItems.map((item) => {
                const categorySlug = getCategorySlugForType(item.type);
                const categoryIcon = categoryConfig[categorySlug]?.icon;

                return (
                  <a
                    key={item.id}
                    href={
                      item.type === "job"
                        ? `/jobs/${item.slug || createPostSlug(item.title)}`
                        : item.type === "scheme"
                          ? `/schemes/${item.slug || createPostSlug(item.title)}`
                          : item.type === "result"
                            ? `/results/${item.slug || createPostSlug(item.title)}`
                            : item.type === "admit"
                              ? `/admit-cards/${item.slug || createPostSlug(item.title)}`
                              : item.type === "video"
                                ? `/videos/${item.slug || createPostSlug(item.title)}`
                                : item.type === "guide"
                                  ? `/guides/${item.slug || createPostSlug(item.title)}`
                                  : `/examinations/${item.slug || createPostSlug(item.title)}`
                    }
                    className="ticker-item"
                  >
                    <span className="ticker-dot" aria-hidden="true">
                      {categoryIcon}
                    </span>
                    <span className="ticker-item-title">
                      {getPostTitle(item)}
                    </span>
                  </a>
                );
            }
            ) : data.loading ? (
              Array.from({ length: 8 }, (_, index) => (
                <span
                  key={`ticker-skeleton-${index}`}
                  className="ticker-item ticker-skeleton"
                  aria-hidden="true"
                >
                  <span className="ticker-skeleton-icon" />
                  <span className="ticker-skeleton-title" />
                </span>
              ))
            ) : (
              <span className="ticker-empty-state">No updates available</span>
            )}
          </div>
        </div>

        <button
          className="ticker-arrow"
          type="button"
          aria-label="Show next update"
          onClick={handleNextTicker}
          disabled={tickerItems.length <= visibleTickerCount}
        >
          ›
        </button>
      </div>

      <main>
        <HeroSection />

        <CategoryGrid language={selectedLanguage} />

        <div className="content-layout">
          <UpdatesSection
            type={active}
            language={selectedLanguage}
            query={search}
            onQueryChange={setSearch}
            onTypeChange={setActive}
          />

          <aside className="right-column">
            <section className="panelin important-panel">
              <div className="section-heading">
                <h2>{t("usefulLinks")}</h2>
                <span>{t("usefulLinks")}</span>
              </div>

              {links.slice(0, HOMEPAGE_USEFUL_LINKS_DISPLAY_LIMIT).map((link) => (
                <a
                  className="important-link"
                  href={link.url}
                  key={link.id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkIcon size={16} />
                  {getLinkTitle(link, selectedLanguage)}
                  <b>›</b>
                </a>
              ))}
            </section>

            <section className="subscribe-panel">
              <div className="subscribe-icon">
                <MailIcon />
              </div>

              <NewsletterSubscribeButton language={selectedLanguage} />
            </section>
          </aside>
        </div>

        <VideosSection />
      </main>

      <PortalFooter />
    </div>
  );
}
