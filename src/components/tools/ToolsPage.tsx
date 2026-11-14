
"use client";

import "../portal/home/UpdatesSection.css";
import "./ToolsPage.css";

import { useMemo, useState } from "react";
import { usePortalData } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import { ToolsCharacters } from "./ToolsCharacters";

const pageCopy = {
  en: {
    eyebrow: "SHIVANYAMS • ONLINE TOOLS",
    title1: "Useful Online",
    title2: "Tools & Calculators",
    description:
      "Explore useful online tools, calculators, and digital resources to simplify your everyday tasks.",
    search: "Search tools...",
    latest: "Latest Tools",
    count: "tools",
    empty: "No tools are currently available.",
    new: "New",
  },
  mr: {
    eyebrow: "SHIVANYAMS • ऑनलाइन टूल्स",
    title1: "उपयुक्त ऑनलाइन",
    title2: "टूल्स आणि कॅल्क्युलेटर",
    description:
      "तुमची दैनंदिन कामे सोपी करण्यासाठी उपयुक्त ऑनलाइन टूल्स, कॅल्क्युलेटर आणि डिजिटल साधने वापरा.",
    search: "टूल्स शोधा...",
    latest: "नवीनतम टूल्स",
    count: "टूल्स",
    empty: "सध्या कोणतेही टूल्स उपलब्ध नाहीत.",
    new: "नवीन",
  },
  hi: {
    eyebrow: "SHIVANYAMS • ऑनलाइन टूल्स",
    title1: "उपयोगी ऑनलाइन",
    title2: "टूल्स और कैलकुलेटर",
    description:
      "अपने दैनिक कार्यों को आसान बनाने के लिए उपयोगी ऑनलाइन टूल्स, कैलकुलेटर और डिजिटल संसाधनों का उपयोग करें।",
    search: "टूल्स खोजें...",
    latest: "नवीनतम टूल्स",
    count: "टूल्स",
    empty: "अभी कोई टूल उपलब्ध नहीं है।",
    new: "नया",
  },
};

export function ToolsPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const copy = pageCopy[language] ?? pageCopy.mr;

  const tools = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.items
      .filter((item) => {
        if (String(item.type) !== "tool") return false;

        return (
          !term ||
          [item.title, item.category, item.description].some((value) =>
            value.toLowerCase().includes(term),
          )
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date || "").getTime() -
          new Date(a.date || "").getTime(),
      );
  }, [data.items, query]);

  return (
    <>
      <div className="tools-page">
        <main>
          <section className="tools-hero">
            <div className="tools-hero-content">
              <span className="tools-eyebrow">
                {copy.eyebrow}
              </span>

              <h1>
                {copy.title1}
                <br />
                <span>{copy.title2}</span>
              </h1>

              <p>{copy.description}</p>

              <form
                className="tools-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <SearchIcon size={18} />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.search}
                />

                <button type="submit">
                  {language === "mr"
                    ? "शोधा"
                    : language === "hi"
                      ? "खोजें"
                      : "Search"}
                </button>
              </form>
            </div>

            <div className="tools-hero-visual" aria-hidden="true">
              <ToolsCharacters />
            </div>

          </section>

          <section className="tools-updates panel" id="updates">
            <div className="section-heading">
              <h2>{copy.latest}</h2>

              <span>
                {tools.length} {copy.count}
              </span>
            </div>

            <div className="update-list">
              {data.loading ? (
                <div className="empty-state empty-tool">
                  Loading...
                </div>
              ) : data.error ? (
                <div className="empty-state empty-tool">
                  {data.error}
                </div>
              ) : tools.length > 0 ? (
                tools.map((item) => (
                  <a
                    className="update-row"
                    key={item.id}
                    href={`/tools/${item.slug || createPostSlug(item.title)}`}
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
                            language === "mr"
                              ? "mr-IN"
                              : language === "hi"
                                ? "hi-IN"
                                : "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : copy.new}
                    </time>

                    <span className="new-pill">
                      {copy.new}
                    </span>
                  </a>
                ))
              ) : (
                <div className="empty-state empty-tool">
                  {copy.empty}
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
