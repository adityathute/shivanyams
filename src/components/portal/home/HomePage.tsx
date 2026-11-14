"use client";

import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { CategoryGrid } from "../category/CategoryGrid";
import { UpdatesSection } from "./UpdatesSection";
import { VideosSection } from "../../videos/VideosSection";
import type { ItemType } from "../data/portal-data";
import { usePortalData } from "../data/portal-data";
import { PortalFooter } from "../layout/footer/PortalFooter";
import { MailIcon, Button } from "shivanya-ui";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { useImportantLinks } from "../utils/useImportantLinks";
import { getBaseText } from "../../../i18n/dictionaries/base";
import { useRouter } from "next/navigation";

export function HomePage() {
  const { language: selectedLanguage } = usePortalLanguage();
  const [active, setActive] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const { data } = usePortalData();
  const { links, getLinkTitle } = useImportantLinks();
  const router = useRouter();

  const t = (key: Parameters<typeof getBaseText>[0]) =>
    getBaseText(key, selectedLanguage);

  return (
    <div className="portal">
      {data.items && data.items.length > 0 && (
        <div className="ticker">
          <span className="ticker-label">⚑ Latest Updates</span>

          <div className="ticker-track">
            {data.items.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSearch(item.title);
                  setActive("all");
                }}
              >
                {item.title}
              </button>
            ))}
          </div>

          <button
            className="ticker-arrow"
            aria-label="Show all updates"
            onClick={() => {
              setActive("all");
              setSearch("");
            }}
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
                <h2>{t("importantSections")}</h2>
                <span>{t("usefulLinks")}</span>
              </div>

              {links.map((link) => (
                <a
                  className="important-link"
                  href={link.url}
                  key={link.id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>✦</span>
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
