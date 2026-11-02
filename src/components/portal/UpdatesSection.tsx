"use client";
import "./UpdatesSection.css";

import { useMemo } from "react";
import { categories } from "./CategoryGrid";
import type { ItemType } from "./portal-data";
import { usePortalData } from "./portal-data";

type Props = {
  type?: ItemType | "all";
  title?: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  onTypeChange?: (value: ItemType | "all") => void;
  showFilters?: boolean;
};

export function UpdatesSection({
  type = "all",
  title = "ताज्या अपडेट्स",
  query = "",
  onQueryChange,
  onTypeChange,
  showFilters = true,
}: Props) {
  const { data } = usePortalData();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items
      .filter((item) => {
        const matchesType = type === "all" || item.type === type;
        const matchesQuery =
          !term ||
          [item.title, item.category, item.description].some((value) =>
            value.toLowerCase().includes(term),
          );

        return matchesType && matchesQuery;
      })
      .sort((a, b) => {
        // Latest date first
        return (
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
        );
      })
      .slice(0, 20);
  }, [data.items, query, type]);

  return (
    <section className="updates-panel panelin" id="updates">
      <div className="section-heading">
        <h2>{title}</h2>
        <button
          onClick={() => {
            onQueryChange?.("");
            onTypeChange?.("all");
          }}
        >
          सर्व पहा →
        </button>
      </div>

      {showFilters && (
        <div className="filter-row">
          <button
            className={type === "all" ? "selected" : ""}
            onClick={() => onTypeChange?.("all")}
          >
            सर्व
          </button>
          {categories.map((category) => (
            <button
              key={category.type}
              className={type === category.type ? "selected" : ""}
              onClick={() => onTypeChange?.(category.type)}
            >
              {category.title}
            </button>
          ))}
        </div>
      )}

      <div className="update-list">
        {filtered.length > 0 ? (
          filtered.map((item) => (
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
          <div className="empty-state">या शोधासाठी अपडेट्स सापडले नाहीत.</div>
        )}
      </div>
    </section>
  );
}
