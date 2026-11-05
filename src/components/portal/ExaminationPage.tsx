"use client";

import "./UpdatesSection.css";
import "./JobsPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "./portal-data";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "./PortalFooter";

export function ExaminationPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();

  const examinations = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items.filter((item) => {
      if (item.type !== "examination") return false;

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
                SHIVANYAMS · EXAMINATION & PREPARATION
              </span>

              <h1>
                परीक्षेची तयारी करा,
                <br />
                <span>यशाची संधी मिळवा.</span>
              </h1>

              <p>
                Maharashtra and Central Government Exam Notifications,
                Syllabus, Exam Dates and Preparation Updates.
              </p>

              <form
                className="jobs-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="परीक्षा, विभाग किंवा अभ्यासक्रम शोधा..."
                />

                <button type="submit">Search</button>
              </form>

              <div className="jobs-hero-tags">
                <span>Exam Notifications</span>
                <span>Exam Dates</span>
                <span>Syllabus & Preparation</span>
              </div>
            </div>

            <div className="jobs-hero-visual" aria-hidden="true">
              <div className="jobs-visual-circle">
                <div className="jobs-visual-card">
                  <span className="jobs-visual-icon">▤</span>
                  <strong>Examination</strong>
                  <small>Prepare for success</small>

                  <div className="jobs-visual-lines">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="jobs-visual-status">
                    <span />
                    Exam Updates
                  </div>
                </div>
              </div>

              <div className="jobs-floating-icon jobs-floating-one">✓</div>
              <div className="jobs-floating-icon jobs-floating-two">A+</div>
            </div>
          </section>

          <section className="jobs-updates panel" id="updates">
            <div className="section-heading">
              <h2>Latest Examination Updates</h2>
              <span>{examinations.length} updates</span>
            </div>

            <div className="update-list">
              {examinations.length ? (
                examinations.map((item) => (
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
                  सध्या परीक्षा अपडेट्स उपलब्ध नाहीत.
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