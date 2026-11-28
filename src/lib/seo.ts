import type { Metadata } from "next";
import { isPortalCategoryEnabled } from "../features/category-access";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://shivanyams.com"
).replace(/\/+$/, "");

type ContentKind =
  | "jobs"
  | "schemes"
  | "exams"
  | "admit-cards"
  | "results"
  | "guides"
  | "videos"
  | "tools";

type PublicPost = {
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
  meta_keywords?: unknown;
  featured_image_url?: string;
  published_at?: string;
  updated_at?: string;
};

const categoryDetails: Record<ContentKind, { title: string; description: string; path: string }> = {
  jobs: {
    title: "Latest Government Jobs in India",
    description: "Find the latest government job vacancies, eligibility, qualifications, application dates and official application links.",
    path: "/jobs",
  },
  schemes: {
    title: "Government Schemes in India",
    description: "Explore government schemes, eligibility criteria, benefits, required documents and official application links.",
    path: "/schemes",
  },
  exams: {
    title: "Government Exam Updates",
    description: "Get government examination notifications, exam dates, eligibility details and official updates.",
    path: "/exams",
  },
  "admit-cards": {
    title: "Admit Cards and Hall Tickets",
    description: "Find the latest examination admit cards, hall ticket updates and official download links.",
    path: "/admit-cards",
  },
  results: {
    title: "Government Exam Results",
    description: "Check the latest government examination results, merit lists and official result links.",
    path: "/results",
  },
  guides: {
    title: "Application and Government Service Guides",
    description: "Read practical guides for applications, documents, government services and online processes.",
    path: "/guides",
  },
  videos: {
    title: "Government Updates and Helpful Videos",
    description: "Watch useful videos explaining government jobs, schemes, exams and public services.",
    path: "/videos",
  },
  tools: {
    title: "Free Online Tools",
    description: "Use helpful online tools for everyday tasks, calculations and public-service workflows.",
    path: "/tools",
  },
};

const featureKey: Record<ContentKind, string> = {
  jobs: "jobs",
  schemes: "schemes",
  exams: "exams",
  "admit-cards": "admit-cards",
  results: "results",
  guides: "guides",
  videos: "videos",
  tools: "tools",
};

function metadataForDisabledCategory(path: string): Metadata {
  return {
    alternates: { canonical: path },
    robots: { index: false, follow: false },
  };
}

export function getStaticPageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName: "ShivanyaMS",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function getCategoryPageMetadata(kind: ContentKind): Metadata {
  const category = categoryDetails[kind];
  if (!isPortalCategoryEnabled(featureKey[kind])) {
    return metadataForDisabledCategory(category.path);
  }

  return {
    title: category.title,
    description: category.description,
    alternates: { canonical: category.path },
    openGraph: {
      type: "website",
      url: category.path,
      title: category.title,
      description: category.description,
      siteName: "ShivanyaMS",
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
    },
  };
}

function getText(...values: (string | undefined)[]): string {
  return values.find((value) => Boolean(value?.trim()))?.trim() || "";
}

function getKeywords(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const keywords = value.filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return keywords.length ? keywords : undefined;
}

async function fetchPublicPost(kind: ContentKind, slug: string): Promise<PublicPost | null> {
  const apiBase = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();
  if (!apiBase) return null;

  try {
    const url = `${apiBase.replace(/\/+$/, "")}/content/${kind}/${encodeURIComponent(slug)}/`;
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return null;
    return (await response.json()) as PublicPost;
  } catch {
    return null;
  }
}

export async function getPostPageMetadata(
  kind: ContentKind,
  slug: string,
): Promise<Metadata> {
  const path = `${categoryDetails[kind].path}/${encodeURIComponent(slug)}`;

  if (!isPortalCategoryEnabled(featureKey[kind])) {
    return metadataForDisabledCategory(path);
  }

  const post = await fetchPublicPost(kind, slug);
  if (!post?.slug) {
    return {
      title: "Content not found",
      robots: { index: false, follow: false },
      alternates: { canonical: path },
    };
  }

  const title = getText(
    post.meta_title_en,
    post.title_en,
    post.title_mr,
    post.title_hi,
    "ShivanyaMS",
  );
  const description = getText(
    post.meta_description_en,
    post.summary_en,
    post.summary_mr,
    post.summary_hi,
  ) || categoryDetails[kind].description;
  const keywords = getKeywords(post.meta_keywords);
  const image = post.featured_image_url
    ? new URL(post.featured_image_url, SITE_URL).toString()
    : undefined;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      siteName: "ShivanyaMS",
      ...(image ? { images: [{ url: image }] } : {}),
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(post.updated_at ? { modifiedTime: post.updated_at } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
