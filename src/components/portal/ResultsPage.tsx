"use client";

import "./UpdatesSection.css";
import "./ResultsPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

export function ResultsPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "result") return false;

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
      <div className="results-page">
        <main>
          <section className="results-hero">
            <div className="results-hero-content">
              <span className="results-eyebrow">SHIVANYAMS · EXAM RESULTS</span>

              <h1>
                परीक्षेचा निकाल पाहा,
                <br />
                <span>यशाची पुढची पायरी गाठा.</span>
              </h1>

              <p>
                Maharashtra and Central Government Exam Results, Merit Lists,
                Scorecards and Result Notifications.
              </p>

              <form
                className="results-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="परीक्षा, विभाग किंवा निकाल शोधा..."
                />

                <button type="submit">Search</button>
              </form>

              <div className="results-hero-tags">
                <span>Latest Results</span>
                <span>Merit Lists</span>
                <span>Exam Updates</span>
              </div>
            </div>

            <div className="results-hero-visual" aria-hidden="true">
              <div className="results-visual-circle">
                <div className="results-visual-card">
                  <span className="results-visual-icon">▣</span>
                  <strong>Exam Results</strong>
                  <small>Check your performance</small>

                  <div className="results-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="results-visual-status">
                    <span />
                    Result Updates
                  </div>
                </div>
              </div>

              <div className="results-floating-icon results-floating-one">
                ✓
              </div>

              <div className="results-floating-icon results-floating-two">
                ★
              </div>
            </div>
          </section>

          <section className="results-updates panel" id="updates">
            <div className="section-heading">
              <h2>Latest Exam Results</h2>
              <span>{results.length} updates</span>
            </div>

            <div className="update-list">
              {results.length ? (
                results.map((item) => (
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
                  सध्या परीक्षा निकाल अपडेट्स उपलब्ध नाहीत.
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
