import type { MetadataRoute } from "next";
import { getPortalFeatureConfig } from "../features/category-access";
import { SITE_URL } from "../lib/seo";

export const revalidate = 3600;

const categories = [
  { feature: "jobs", kind: "jobs", path: "/jobs" },
  { feature: "schemes", kind: "schemes", path: "/schemes" },
  { feature: "exams", kind: "exams", path: "/exams" },
  { feature: "admitCards", kind: "admit-cards", path: "/admit-cards" },
  { feature: "results", kind: "results", path: "/results" },
  { feature: "guides", kind: "guides", path: "/guides" },
  { feature: "videos", kind: "videos", path: "/videos" },
  { feature: "tools", kind: "tools", path: "/tools" },
] as const;

type ApiPost = { slug?: string; updated_at?: string; published_at?: string };
type ApiPage = { results?: ApiPost[]; next?: string | null };

async function getPublishedPosts(kind: string): Promise<ApiPost[]> {
  const apiBase = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();
  if (!apiBase) return [];

  const firstUrl = `${apiBase.replace(/\/+$/, "")}/content/${kind}/`;
  const origin = new URL(firstUrl).origin;
  const posts: ApiPost[] = [];
  const visited = new Set<string>();
  let nextUrl: string | null = firstUrl;

  while (nextUrl && visited.size < 1000 && posts.length < 49000) {
    if (visited.has(nextUrl)) break;
    visited.add(nextUrl);

    try {
      const response = await fetch(nextUrl, { next: { revalidate: 3600 } });
      if (!response.ok) break;
      const payload = await response.json() as ApiPage | ApiPost[];
      if (Array.isArray(payload)) {
        posts.push(...payload);
        break;
      }

      posts.push(...(payload.results || []));
      if (!payload.next) break;

      const resolved = new URL(payload.next, firstUrl);
      if (resolved.origin !== origin) break;
      nextUrl = resolved.toString();
    } catch {
      break;
    }
  }

  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/feedback`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const enabled = getPortalFeatureConfig();
  const activeCategories = categories.filter((category) => enabled[category.feature]);

  for (const category of activeCategories) {
    entries.push({
      url: `${SITE_URL}${category.path}`,
      changeFrequency: "daily",
      priority: 0.8,
    });

    const posts = await getPublishedPosts(category.kind);
    for (const post of posts) {
      if (!post.slug) continue;
      entries.push({
        url: `${SITE_URL}${category.path}/${encodeURIComponent(post.slug)}`,
        ...(post.updated_at || post.published_at
          ? { lastModified: new Date(post.updated_at || post.published_at!) }
          : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
      if (entries.length >= 49990) return entries;
    }
  }

  return entries;
}
