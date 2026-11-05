"use client";
import "./CategoryPage.css";

import { useMemo, useState } from "react";
import { usePortalData, type ItemType } from "./portal-data";

const pageInfo: Record<ItemType, { title: string; subtitle: string }> = {
  job: {
    title: "सरकारी नोकरी",
    subtitle: "Latest Government Jobs and Recruitment Updates",
  },
  scheme: {
    title: "शासकीय योजना",
    subtitle: "Government Schemes, Eligibility and Application Updates",
  },
  result: {
    title: "निकाल",
    subtitle: "Exam Results, Merit Lists and Official Notifications",
  },
  admit: {
    title: "प्रवेशपत्र",
    subtitle: "Admit Cards and Examination Instructions",
  },
  guide: {
    title: "लेख / मार्गदर्शक",
    subtitle: "Useful Guides, Tutorials and Articles",
  },
  video: {
    title: "व्हिडिओ",
    subtitle: "सरकारी योजना, नोकरी आणि ऑनलाइन सेवांचे व्हिडिओ मार्गदर्शन",
  },
};

export function CategoryPage({ type }: { type: ItemType }) {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();
  const info = pageInfo[type];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.items.filter((item) => {
      if (item.type !== type) return false;
      return !term || [item.title, item.category, item.description].some((value) =>
        value.toLowerCase().includes(term),
      );
    });
  }, [data.items, query, type]);

  return (
    <div className="portal">
      <main>
        <section className="hero category-hero">
          <div className="hero-copy">
            <span className="eyebrow">SHIVANYAMS • INFORMATION PORTAL</span>
            <h1>{info.title}</h1>
            <p>{info.subtitle}</p>
            <form className="search-form" onSubmit={(event) => event.preventDefault()}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`${info.title} शोधा...`}
              />
              <button type="submit">⌕ Search</button>
            </form>
          </div>
        </section>

        <section className="updates-panel panel" id="updates">
          <div className="section-heading">
            <h2>{info.title} – नवीन अपडेट्स</h2>
            <span>{filtered.length} updates</span>
          </div>
          <div className="update-list">
            {filtered.length ? filtered.map((item) => (
              <a
                className="update-row"
                key={item.id}
                href={item.link || "#"}
                target={item.link ? "_blank" : undefined}
                rel={item.link ? "noreferrer" : undefined}
              >
                <span className={`update-badge ${item.type}`}>{item.category}</span>
                <span className="update-title">
                  {item.title}
                  <small>{item.description}</small>
                </span>
                <time>
                  {item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString("mr-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  }) : "नवीन"}
                </time>
                <span className="new-pill">New</span>
              </a>
            )) : <div className="empty-state">या श्रेणीमध्ये सध्या अपडेट्स उपलब्ध नाहीत.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
