import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getPortalApiUrl } from "./portal-api";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.shivanyams.com").replace(/\/+$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

type ApiPost = {
  slug?: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  meta_title_en?: string;
  meta_title_mr?: string;
  meta_title_hi?: string;
  meta_description_en?: string;
  meta_description_mr?: string;
  meta_description_hi?: string;
  featured_image_url?: string;
  published_at?: string | null;
  updated_at?: string;
  category?: { name_en?: string; slug?: string };
};

export async function getPublicPostMetadata(kind: string, slug: string, route = kind): Promise<Metadata> {
  const requestedCanonical = `${SITE_URL}/${route}/${encodeURIComponent(slug)}`;
  const languageValue = (await cookies()).get("shivanya-language")?.value;
  const language = languageValue === "mr" || languageValue === "hi" ? languageValue : "en";
  const fallback: Metadata = {
    title: "ShivanyaMS | Government Jobs, Schemes & Updates",
    description: "Official updates, government jobs, schemes, examinations and results.",
    alternates: { canonical: requestedCanonical },
    robots: { index: true, follow: true },
  };
  try {
    const response = await fetch(getPortalApiUrl(`content/${kind}/${encodeURIComponent(slug)}/`), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: [`public-content:${kind}:${slug}`] },
    });
    if (!response.ok) return { ...fallback, robots: { index: false, follow: false } };
    const payload = await response.json();
    const post = (payload?.data ?? payload) as ApiPost;
    const canonical = `${SITE_URL}/${route}/${encodeURIComponent(post.slug || slug)}`;
    const title = (language === "mr" ? post.meta_title_mr : language === "hi" ? post.meta_title_hi : post.meta_title_en)?.trim()
      || (language === "mr" ? post.title_mr : language === "hi" ? post.title_hi : post.title_en)?.trim()
      || post.meta_title_en?.trim() || post.title_en?.trim() || fallback.title as string;
    const description = (language === "mr" ? post.meta_description_mr : language === "hi" ? post.meta_description_hi : post.meta_description_en)?.trim()
      || (language === "mr" ? post.summary_mr : language === "hi" ? post.summary_hi : post.summary_en)?.trim()
      || post.meta_description_en?.trim() || post.summary_en?.trim() || fallback.description as string;
    const image = post.featured_image_url || DEFAULT_IMAGE;
    return {
      title,
      description,
      alternates: { canonical },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
      openGraph: {
        type: kind === "guides" || kind === "articles" ? "article" : "website",
        url: canonical,
        title,
        description,
        siteName: "ShivanyaMS",
        images: [{ url: image, alt: title }],
        ...(post.published_at ? { publishedTime: post.published_at } : {}),
      },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  } catch {
    return fallback;
  }
}

export function getSiteUrl() {
  return SITE_URL;
}
