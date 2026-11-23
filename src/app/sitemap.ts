import type { MetadataRoute } from "next";
import { getPortalApiUrl } from "../lib/portal-api";
import { getSiteUrl } from "../lib/seo";

const contentKinds = [
  ["jobs", "jobs"], ["schemes", "schemes"], ["examination", "examination"],
  ["admit-card", "admit-cards"], ["results", "results"], ["articles", "guides"],
  ["videos", "videos"], ["tools", "tools"],
] as const;

type SitemapPost = { slug?: string; updated_at?: string; published_at?: string; status?: string; is_active?: boolean };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticRoutes = ["", "/jobs", "/schemes", "/examination", "/admit-cards", "/results", "/guides", "/videos", "/tools", "/about", "/contact"];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
  const collections = await Promise.all(contentKinds.map(async ([apiKind, route]) => {
    try {
      const response = await fetch(getPortalApiUrl(`content/${apiKind}/?page_size=100`), {
        headers: { Accept: "application/json" },
        next: { revalidate: 900, tags: [`sitemap:${apiKind}`] },
      });
      if (!response.ok) return [];
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.data?.results) ? payload.data.results : [];
      return (rows as SitemapPost[])
        .filter((post) => post.slug && post.status === "published" && post.is_active !== false)
        .map((post) => ({
          url: `${base}/${route}/${encodeURIComponent(post.slug as string)}`,
          lastModified: post.updated_at || post.published_at || undefined,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    } catch {
      return [];
    }
  }));
  return [...entries, ...collections.flat()];
}
