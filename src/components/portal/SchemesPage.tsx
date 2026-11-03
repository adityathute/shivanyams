"use client";

import "./UpdatesSection.css";
import "./SchemesPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

export function SchemesPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();

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

  return (
    <>
      <div className="schemes-page">
        <main>
          <section className="schemes-hero">
            <div className="schemes-hero-content">
              <span className="schemes-eyebrow">
                SHIVANYAMS · GOVERNMENT SCHEMES
              </span>

              <h1>
                शासकीय योजना शोधा,
                <br />
                <span>प्रगतीची संधी मिळवा.</span>
              </h1>

              <p>
                Maharashtra and Central Government Schemes, Benefits,
                Eligibility and Application Updates.
              </p>

              <form
                className="schemes-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="योजना, विभाग किंवा लाभ शोधा..."
                />

                <button type="submit">Search</button>
              </form>

              <div className="schemes-hero-tags">
                <span>Latest Schemes</span>
                <span>Government Benefits</span>
                <span>Application Updates</span>
              </div>
            </div>

            <div className="schemes-hero-visual" aria-hidden="true">
              <div className="schemes-visual-circle">
                <div className="schemes-visual-card">
                  <span className="schemes-visual-icon">▣</span>
                  <strong>Government Schemes</strong>
                  <small>Explore benefits</small>

                  <div className="schemes-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="schemes-visual-status">
                    <span />
                    Scheme Updates
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
              <h2>Latest Government Schemes</h2>
              <span>{schemes.length} updates</span>
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
                  सध्या शासकीय योजना अपडेट्स उपलब्ध नाहीत.
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
