"use client";

import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { CategoryGrid } from "./CategoryGrid";
import { UpdatesSection } from "./UpdatesSection";
import { VideosSection } from "./VideosSection";
import type { ItemType } from "./portal-data";
import { usePortalData } from "./portal-data";
import { PortalFooter } from "./PortalFooter";
import { MailIcon } from "shivanya-ui";
import { usePortalLanguage } from "./PortalLanguageContext";
import { useImportantLinks } from "./useImportantLinks";

export function HomePage() {
  const { language: selectedLanguage } = usePortalLanguage();
  const [active, setActive] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const { data } = usePortalData();
  const { links, getLinkTitle } = useImportantLinks();

  return (
    <div className="portal">
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

      <main>
        <HeroSection onSearch={setSearch} />
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
                <h2>महत्त्वाच्या लिंक्स</h2>
                <span>Useful links</span>
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
                <h3>नवीन अपडेट्ससाठी तयार राहा</h3>
                <p>महत्त्वाच्या अपडेट्ससाठी आमच्याशी जोडलेले राहा.</p>
              </div>

              <a href="#contact" className="subscribe-button">
                संपर्क साधा →
              </a>
            </section>
          </aside>
        </div>

        <VideosSection />
      </main>

      <PortalFooter />
    </div>
  );
}
