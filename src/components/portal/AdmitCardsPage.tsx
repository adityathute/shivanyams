"use client";

import "./UpdatesSection.css";
import "./AdmitCardsPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

export function AdmitCardsPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();

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

  return (
    <>
      <div className="admit-page">
        <main>
          <section className="admit-hero">
            <div className="admit-hero-content">
              <span className="admit-eyebrow">
                SHIVANYAMS · EXAM & ADMIT CARDS
              </span>

              <h1>
                प्रवेशपत्र डाउनलोड करा,
                <br />
                <span>परीक्षेसाठी सज्ज व्हा.</span>
              </h1>

              <p>
                Maharashtra and Central Government Exam Admit Cards, Hall
                Tickets, Exam Dates and Instructions.
              </p>

              <form
                className="admit-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="परीक्षा, विभाग किंवा प्रवेशपत्र शोधा..."
                />

                <button type="submit">Search</button>
              </form>

              <div className="admit-hero-tags">
                <span>Latest Admit Cards</span>
                <span>Hall Tickets</span>
                <span>Exam Instructions</span>
              </div>
            </div>

            <div className="admit-hero-visual" aria-hidden="true">
              <div className="admit-visual-circle">
                <div className="admit-visual-card">
                  <span className="admit-visual-icon">▣</span>
                  <strong>Exam Admit Card</strong>
                  <small>Ready for examination</small>

                  <div className="admit-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="admit-visual-status">
                    <span />
                    Hall Ticket Updates
                  </div>
                </div>
              </div>

              <div className="admit-floating-icon admit-floating-one">✓</div>

              <div className="admit-floating-icon admit-floating-two">↓</div>
            </div>
          </section>

          <section className="admit-updates panel" id="updates">
            <div className="section-heading">
              <h2>Latest Admit Cards</h2>
              <span>{admitCards.length} updates</span>
            </div>

            <div className="update-list">
              {admitCards.length ? (
                admitCards.map((item) => (
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
                  सध्या प्रवेशपत्र अपडेट्स उपलब्ध नाहीत.
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
