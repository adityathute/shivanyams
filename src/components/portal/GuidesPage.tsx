"use client";

import "./UpdatesSection.css";
import "./GuidesPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

export function GuidesPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();

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

  return (
    <>
      <div className="guides-page">
        <main>
          <section className="guides-hero">
            <div className="guides-hero-content">
              <span className="guides-eyebrow">
                SHIVANYAMS · GUIDES & INFORMATION
              </span>

              <h1>
                योग्य मार्गदर्शन मिळवा,
                <br />
                <span>ज्ञानाने पुढे चला.</span>
              </h1>

              <p>
                Useful Guides, Tutorials, Online Services and Step-by-Step
                Information for Government Applications and Exams.
              </p>

              <form
                className="guides-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="लेख, मार्गदर्शक किंवा विषय शोधा..."
                />

                <button type="submit">Search</button>
              </form>

              <div className="guides-hero-tags">
                <span>Useful Guides</span>
                <span>Step-by-Step Tutorials</span>
                <span>Online Services</span>
              </div>
            </div>

            <div className="guides-hero-visual" aria-hidden="true">
              <div className="guides-visual-circle">
                <div className="guides-visual-card">
                  <span className="guides-visual-icon">▣</span>
                  <strong>Helpful Guides</strong>
                  <small>Learn step by step</small>

                  <div className="guides-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="guides-visual-status">
                    <span />
                    Knowledge Updates
                  </div>
                </div>
              </div>

              <div className="guides-floating-icon guides-floating-one">✓</div>

              <div className="guides-floating-icon guides-floating-two">?</div>
            </div>
          </section>

          <section className="guides-updates panel" id="updates">
            <div className="section-heading">
              <h2>Latest Guides & Articles</h2>
              <span>{guides.length} updates</span>
            </div>

            <div className="update-list">
              {guides.length ? (
                guides.map((item) => (
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
                        ? new Date(`${item.date}T12:00:00`).toLocaleDateString(
                            "mr-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "नवीन"}
                    </time>

                    <span className="new-pill">New</span>
                  </a>
                ))
              ) : (
                <div className="empty-state">
                  सध्या मार्गदर्शक आणि लेख उपलब्ध नाहीत.
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
