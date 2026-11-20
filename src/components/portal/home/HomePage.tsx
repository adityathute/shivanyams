"use client";

import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { CategoryGrid } from "../category/CategoryGrid";
import { UpdatesSection } from "./UpdatesSection";
import { VideosSection } from "../../videos/VideosSection";
import type { Item, ItemType } from "../data/portal-data";
import { usePortalData } from "../data/portal-data";
import { PortalFooter } from "../layout/footer/PortalFooter";
import { MailIcon, Button } from "shivanya-ui";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { useImportantLinks } from "../utils/useImportantLinks";
import { getBaseText } from "../../../i18n/dictionaries/base";
import { useRouter } from "next/navigation";
import { LinkIcon } from "shivanya-ui";
import { HOMEPAGE_USEFUL_LINKS_DISPLAY_LIMIT } from "../utils/important-links-config";
import { createPostSlug } from "../post/PortalPostDetail";

export function HomePage() {
  const { language: selectedLanguage } = usePortalLanguage();
  const [active, setActive] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const { data } = usePortalData();
  const tickerItems = data.items.slice(0, 20);
  const { links, getLinkTitle } = useImportantLinks();
  const router = useRouter();

  const t = (key: Parameters<typeof getBaseText>[0]) =>
    getBaseText(key, selectedLanguage);

  const [tickerIndex, setTickerIndex] = useState(0);

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
    const maxIndex = Math.max(0, tickerItems.length - 5);

    setTickerIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <div className="portal">
      {data.items && data.items.length > 0 && (
        <div className="ticker">
          <span className="ticker-label">
            <span className="ticker-label-icon">⚑</span>
            Latest Updates
          </span>

          <div className="ticker-track">
            <div
              className="ticker-slides"
              style={{
                transform: `translateX(-${tickerIndex * 20}%)`,
              }}
            >
              {tickerItems.map((item) => (
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
                            ? `/admit-card/${item.slug || createPostSlug(item.title)}`
                            : item.type === "video"
                              ? `/videos/${item.slug || createPostSlug(item.title)}`
                              : item.type === "guide"
                                ? `/articles/${item.slug || createPostSlug(item.title)}`
                                : `/examinations/${item.slug || createPostSlug(item.title)}`
                  }
                  className="ticker-item"
                >
                  <span className="ticker-dot">•</span>
                  <span className="ticker-item-title">
                    {getPostTitle(item)}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <button
            className="ticker-arrow"
            type="button"
            aria-label="Show next update"
            onClick={handleNextTicker}
          >
            ›
          </button>
        </div>
      )}

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

              <div className="subscribe-content">
                <h3>{t("subscribeTitle")}</h3>
                <p>{t("subscribeDescription")}</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/contact")}
              >
                {t("contactButton")}
              </Button>
            </section>
          </aside>
        </div>

        <VideosSection />
      </main>

      <PortalFooter />
    </div>
  );
}
