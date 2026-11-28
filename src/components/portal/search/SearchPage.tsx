"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UpdatesSection } from "../home/UpdatesSection";
import type { Item, ItemType } from "../data/portal-data";
import { usePortalData } from "../data/portal-data";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";
import { formatCompactCount, getSearchablePostText, matchesPostSearch, normalizeSearchText } from "./search-utils";
import { isPortalCategoryEnabled, getPortalCategoryForType } from "../../../config/features";
import "../../../styles/legacy/components/portal/saved/SavedPostsPage.css";
import "./SearchPage.css";

const copy = {
  en: {
    eyebrow: "SHIVANYAMS • SEARCH",
    title: "Search Results",
    description: "Search across every category and find posts by title, description, content, tags and detailed information.",
    results: "Search Results",
    for: "Results for",
    emptyTitle: "No exact matches found",
    emptyDescription: "Try a related search below, use fewer words, or check the spelling.",
    related: "Related searches",
    all: "Search all posts",
  },
  mr: {
    eyebrow: "SHIVANYAMS • शोध",
    title: "शोध परिणाम",
    description: "शीर्षक, वर्णन, संपूर्ण मजकूर, टॅग आणि इतर तपशीलांमध्ये सर्व श्रेणींमधील पोस्ट शोधा.",
    results: "शोध परिणाम",
    for: "यासाठी परिणाम",
    emptyTitle: "अचूक परिणाम सापडले नाहीत",
    emptyDescription: "खालील संबंधित शोध वापरून पहा, कमी शब्द टाका किंवा स्पेलिंग तपासा.",
    related: "संबंधित शोध",
    all: "सर्व पोस्ट शोधा",
  },
  hi: {
    eyebrow: "SHIVANYAMS • खोज",
    title: "खोज परिणाम",
    description: "शीर्षक, विवरण, पूरी सामग्री, टैग और अन्य जानकारी में सभी श्रेणियों की पोस्ट खोजें।",
    results: "खोज परिणाम",
    for: "इसके परिणाम",
    emptyTitle: "कोई सटीक परिणाम नहीं मिला",
    emptyDescription: "नीचे दिए गए संबंधित खोज आज़माएँ, कम शब्द लिखें या वर्तनी जाँचें।",
    related: "संबंधित खोजें",
    all: "सभी पोस्ट खोजें",
  },
};

function getSuggestions(items: Item[], query: string): string[] {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);
  const scored = items
    .map((item) => {
      const text = getSearchablePostText(item);
      const score = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const suggestions: string[] = [];
  const add = (value?: string | null) => {
    const label = value?.trim();
    if (!label || normalizeSearchText(label) === normalizeSearchText(query)) return;
    if (!suggestions.some((entry) => normalizeSearchText(entry) === normalizeSearchText(label))) {
      suggestions.push(label);
    }
  };

  scored.slice(0, 12).forEach(({ item }) => {
    add(item.category_en || item.category_mr || item.category_hi || item.category);
    item.tags?.forEach(add);
    add(item.title_en || item.title_mr || item.title_hi || item.title);
  });

  if (suggestions.length < 6) {
    const popular = new Map<string, number>();
    items.forEach((item) => {
      const category = item.category_en || item.category_mr || item.category_hi || item.category;
      if (category) popular.set(category, (popular.get(category) || 0) + 1);
      item.tags?.forEach((tag) => {
        if (tag?.trim()) popular.set(tag.trim(), (popular.get(tag.trim()) || 0) + 1);
      });
    });
    [...popular.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([value]) => add(value));
  }

  return suggestions.slice(0, 8);
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q")?.trim() || "";
  const { language } = usePortalLanguage();
  const { data } = usePortalData();
  const [activeCategory, setActiveCategory] = useState<ItemType | "all">("all");
  const text = copy[language];

  // Record every executed search, including related-search clicks and direct
  // visits to a search URL. The API scopes records to the verified account.
  useEffect(() => {
    if (!query) return;
    void authenticatedFetch(getPortalApiUrl("search/history/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }).catch(() => {
      // Public search remains available if the visitor is signed out.
    });
  }, [query]);

  const matchedItems = useMemo(
    () => query ? data.items.filter((item) => isPortalCategoryEnabled(getPortalCategoryForType(item.type)) && matchesPostSearch(item, query)) : [],
    [data.items, query],
  );
  const showNoResults = Boolean(query) && !data.loading && matchedItems.length === 0;
  const suggestions = useMemo(
    () => showNoResults ? getSuggestions(data.items, query) : [],
    [data.items, query, showNoResults],
  );

  const searchFor = (value: string) => {
    const nextQuery = value.trim();
    if (!nextQuery) return;
    setActiveCategory("all");
    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  return (
    <div className="saved-page related-saved-page search-results-page search-directory-page">
      <header className="portal-page-heading saved-page-heading">
        <span className="saved-eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </header>

      {query ? (
        <div className="search-query-summary">
          <span>{text.for}</span>
          <strong>“{query}”</strong>
          <span className="search-query-count">
            {data.loading ? "…" : formatCompactCount(matchedItems.length)} {language === "mr" ? "पोस्ट" : language === "hi" ? "पोस्ट" : "posts"}
          </span>
        </div>
      ) : (
        <div className="search-query-summary search-query-empty">
          <strong>{text.all}</strong>
          <span>{text.description}</span>
        </div>
      )}

      {showNoResults && (
        <section className="search-related-panel" aria-label={text.related}>
          <div>
            <h2>{text.emptyTitle}</h2>
            <p>{text.emptyDescription}</p>
          </div>
          {suggestions.length > 0 && <h3>{text.related}</h3>}
          {suggestions.length > 0 && <div className="search-suggestion-list">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} onClick={() => searchFor(suggestion)}>
                {suggestion}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>}
        </section>
      )}

      {!showNoResults && <UpdatesSection
        type={activeCategory}
        title={text.results}
        query={query}
        language={language}
        onTypeChange={setActiveCategory}
        showFilters
        showDateAndNewBadge={false}
        showNewBadge={false}
        limit={null}
        showViewAll={false}
        paginate
        searchAllFields
        showJobDeadlines
        showExtendedJobDeadlinesOnly
        showLoadingSkeleton
      />}
    </div>
  );
}
