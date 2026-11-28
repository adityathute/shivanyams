import type { Item } from "../data/portal-data";

/** Normalize multilingual search input without changing Indic characters. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\p{P}\p{S}]+/gu, " ")
    .trim();
}

/**
 * Search every published field already loaded for a post, including nested
 * job details, dates, links, FAQs, document requirements and translations.
 */
export function getSearchablePostText(item: Item): string {
  // The original API payload is retained during mapping, so this covers every
  // API field (including fields not currently rendered by the UI) efficiently.
  if (item.search_index) return normalizeSearchText(item.search_index);

  const values: string[] = [];
  const visit = (value: unknown, depth = 0) => {
    if (value == null || depth > 7) return;
    if (typeof value === "string" || typeof value === "number") {
      values.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    if (typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach((entry) =>
        visit(entry, depth + 1),
      );
    }
  };

  visit(item);
  return normalizeSearchText(values.join(" "));
}

export function matchesPostSearch(item: Item, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const searchableText = getSearchablePostText(item);
  const terms = normalizedQuery.split(" ").filter(Boolean);
  return terms.every((term) => searchableText.includes(term));
}
