import type { MetadataRoute } from "next";
import { getPortalApiUrl } from "../lib/portal-api";
import { getSiteUrl } from "../lib/seo";

const contentKinds = [
  ["jobs", "jobs"], ["schemes", "schemes"], ["examination", "examination"],
  ["admit-card", "admit-cards"], ["results", "results"], ["articles", "guides"],
  ["videos", "videos"], ["tools", "tools"],
] as const;

type SitemapPost = { slug?: string; updated_at?: string; published_at?: string; status?: string; is_active?: boolean };

async function getKindEntries(apiKind: string, route: string, base: string): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= 100; page += 1) {
    try {
      const response = await fetch(getPortalApiUrl(`content/${apiKind}/?page=${page}`), {
        headers: { Accept: "application/json" },
        next: { revalidate: 900, tags: [`sitemap:${apiKind}`] },
      });
      if (!response.ok) break;
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.data?.results) ? payload.data.results : [];
      if (!rows.length) break;
      entries.push(...(rows as SitemapPost[])
        .filter((post) => post.slug && post.status === "published" && post.is_active !== false)
        .map((post) => ({
          url: `${base}/${route}/${encodeURIComponent(post.slug as string)}`,
          lastModified: post.updated_at || post.published_at || undefined,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })));
      if (!payload?.next && !payload?.data?.next && rows.length < 20) break;
    } catch {
      break;
    }
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticRoutes = ["", "/jobs", "/schemes", "/examination", "/admit-cards", "/results", "/guides", "/videos", "/tools", "/about", "/contact"];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
  const collections = await Promise.all(contentKinds.map(([apiKind, route]) => getKindEntries(apiKind, route, base)));
  return [...entries, ...collections.flat()];
}
