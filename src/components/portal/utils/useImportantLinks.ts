/*
 * File Location: shivanyams/src/components/portal/utils/useImportantLinks.ts
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 */
"use client";

import { useEffect, useState } from "react";
import type { Language } from "../category/CategoryGrid";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";

export interface ImportantLink {
  id: number;
  name_en: string;
  name_mr: string;
  name_hi: string;
  url: string;
  sort_order: number;
  is_active?: boolean;
  active?: boolean;
}

interface ImportantLinksResponse {
  results?: ImportantLink[];
}

interface ImportantLinksCache {
  links: ImportantLink[];
  cachedAt: number;
}

const CACHE_KEY = "shivanyams:important-links:v1";
const CACHE_TTL = 10 * 60 * 1000;

let memoryCache: ImportantLinksCache | null = null;
let requestInFlight: Promise<ImportantLink[]> | null = null;

function readStoredCache(): ImportantLinksCache | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ImportantLinksCache>;
    if (!Array.isArray(parsed.links) || typeof parsed.cachedAt !== "number") {
      window.sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return { links: parsed.links as ImportantLink[], cachedAt: parsed.cachedAt };
  } catch {
    return null;
  }
}

function writeCache(links: ImportantLink[]) {
  const cache = { links, cachedAt: Date.now() };
  memoryCache = cache;

  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // The in-memory cache still works when browser storage is unavailable.
  }
}

function getCachedLinks() {
  if (memoryCache) return memoryCache;
  memoryCache = readStoredCache();
  return memoryCache;
}

function fetchImportantLinks(): Promise<ImportantLink[]> {
  if (requestInFlight) return requestInFlight;

  requestInFlight = (async () => {
    try {
      const response = await authenticatedFetch(getPortalApiUrl("important-links/"));

      if (!response.ok) {
        throw new Error(`Failed to fetch important links: ${response.status}`);
      }

      const payload: ImportantLink[] | ImportantLinksResponse = await response.json();
      const data = Array.isArray(payload) ? payload : (payload.results ?? []);
      const activeLinks = data.filter((link) => link.is_active ?? link.active ?? false);

      writeCache(activeLinks);
      return activeLinks;
    } finally {
      requestInFlight = null;
    }
  })();

  return requestInFlight;
}

export function useImportantLinks() {
  const [links, setLinks] = useState<ImportantLink[]>(() => memoryCache?.links ?? []);

  useEffect(() => {
    let mounted = true;
    const cached = getCachedLinks();

    if (cached) {
      setLinks(cached.links);
    }

    const isFresh = cached && Date.now() - cached.cachedAt < CACHE_TTL;
    if (isFresh) {
      return () => {
        mounted = false;
      };
    }

    fetchImportantLinks()
      .then((nextLinks) => {
        if (mounted) setLinks(nextLinks);
      })
      .catch((error) => {
        console.error("Important links loading failed:", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function getLinkTitle(link: ImportantLink, language: Language) {
    return {
      en: link.name_en,
      mr: link.name_mr,
      hi: link.name_hi,
    }[language];
  }

  return { links, getLinkTitle };
}
