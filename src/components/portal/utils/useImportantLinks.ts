"use client";

import { useEffect, useState } from "react";
import type { Language } from "../category/CategoryGrid";
import { getPortalApiUrl } from "../category/CategoryGrid";

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

export function useImportantLinks() {
  const [links, setLinks] = useState<ImportantLink[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLinks() {
      try {
        const response = await fetch(getPortalApiUrl("important-links/"), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch important links: ${response.status}`);
        }

        const payload: ImportantLink[] | ImportantLinksResponse =
          await response.json();

        const data = Array.isArray(payload) ? payload : (payload.results ?? []);
        setLinks(data.filter((link) => link.is_active ?? link.active ?? false));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Important links loading failed:", error);
        }
      }
    }

    fetchLinks();

    return () => controller.abort();
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
