"use client";

import "./UpdatesSection.css";
import "./JobsPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

export function JobsPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();

  const jobs = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "job") return false;

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
      <div className="jobs-page">
        <main>
          <section className="jobs-hero">
            <div className="jobs-hero-content">
              <span className="jobs-eyebrow">
                SHIVANYAMS · CAREER & RECRUITMENT
              </span>

              <h1>
                सरकारी नोकरी शोधा,
                <br />
                <span>आपलं भविष्य घडवा.</span>
              </h1>

              <p>
                Maharashtra and Central Government Jobs, Recruitment,
                Notifications and Exam Updates.
              </p>

              <form
                className="jobs-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="नोकरी, विभाग किंवा भरती शोधा..."
                />

                <button type="submit">Search</button>
              </form>

              <div className="jobs-hero-tags">
                <span>Latest Recruitment</span>
                <span>Government Jobs</span>
                <span>Exam Updates</span>
              </div>
            </div>

            <div className="jobs-hero-visual" aria-hidden="true">
              <div className="jobs-visual-circle">
                <div className="jobs-visual-card">
                  <span className="jobs-visual-icon">▣</span>
                  <strong>Government Jobs</strong>
                  <small>Explore opportunities</small>

                  <div className="jobs-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="jobs-visual-status">
                    <span />
                    Recruitment Updates
                  </div>
                </div>
              </div>

              <div className="jobs-floating-icon jobs-floating-one">✓</div>

              <div className="jobs-floating-icon jobs-floating-two">₹</div>
            </div>
          </section>

          <section className="jobs-updates panel" id="updates">
            <div className="section-heading">
              <h2>Latest Government Jobs</h2>
              <span>{jobs.length} updates</span>
            </div>

            <div className="update-list">
              {jobs.length ? (
                jobs.map((item) => (
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
                  सध्या सरकारी नोकरी अपडेट्स उपलब्ध नाहीत.
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
