"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { usePortalData } from "./portal-data";
import { usePortalLanguage } from "./PortalLanguageContext";
import { PortalFooter } from "./PortalFooter";
import { PortalContentNotFound } from "./PortalContentNotFound";
import "./PortalPostDetail.css";
import { CategoryGrid } from "./CategoryGrid";
import type { Language as CategoryLanguage } from "./CategoryGrid";

type CategorySlug =
  | "jobs"
  | "schemes"
  | "examination"
  | "results"
  | "admit-cards"
  | "guides"
  | "videos";

const categoryTypes: Record<Exclude<CategorySlug, "videos">, string> = {
  jobs: "job",
  schemes: "scheme",
  examination: "examination",
  results: "result",
  "admit-cards": "admit",
  guides: "guide",
};

const categoryLabels: Record<CategorySlug, Record<string, string>> = {
  jobs: { en: "Government Jobs", mr: "सरकारी नोकरी", hi: "सरकारी नौकरियां" },
  schemes: {
    en: "Government Schemes",
    mr: "सरकारी योजना",
    hi: "सरकारी योजनाएं",
  },
  examination: { en: "Examination", mr: "परीक्षा", hi: "परीक्षा" },
  results: { en: "Results", mr: "निकाल", hi: "परिणाम" },
  "admit-cards": { en: "Admit Cards", mr: "प्रवेशपत्र", hi: "प्रवेश पत्र" },
  guides: {
    en: "Articles & Guides",
    mr: "लेख आणि मार्गदर्शक",
    hi: "लेख और मार्गदर्शिकाएँ",
  },
  videos: { en: "Videos", mr: "व्हिडिओ", hi: "वीडियो" },
};

export function createPostSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(value: string, language: string) {
  if (!value) return "";
  const locale =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

function getVideoEmbedUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    const id =
      host === "youtu.be"
        ? segments[0]
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live"].includes(segments[0])
            ? segments[1]
            : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export function PortalPostDetail({ category }: { category: CategorySlug }) {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug ?? "");
  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const post = useMemo(() => {
    if (category === "videos") {
      const video = data.videos.find(
        (entry) => (entry.slug || createPostSlug(entry.title)) === slug || entry.id === slug,
      );
      return video
        ? {
            title: video.title,
            description: "",
            category: video.language,
            date: "",
            link: video.url,
            image: video.thumbnail,
            body: "",
          }
        : null;
    }

    const type = categoryTypes[category];
    const item = data.items.find(
      (entry) =>
        entry.type === type &&
        (createPostSlug(entry.title) === slug || entry.id === slug),
    );
    return item
      ? {
          title: item.title,
          description: item.description,
          category: item.category,
          date: item.date,
          link: item.link,
          image: "",
          body: "",
        }
      : null;
  }, [category, data.items, data.videos, slug]);

  const label =
    categoryLabels[category][language] ?? categoryLabels[category].en;
  const embedUrl = category === "videos" ? getVideoEmbedUrl(post?.link) : null;

  return (
    <>
      <main className="portal-post-detail">
        <div className="portal-post-detail-inner">
          {post ? (
            <article className="portal-post-card">
              <div className="portal-post-meta">
                <span>{post.category || label}</span>
                {post.date ? (
                  <time>{formatDate(post.date, language)}</time>
                ) : null}
              </div>

              <h1>{post.title}</h1>

              {post.image && !embedUrl ? (
                <img
                  className="portal-post-image"
                  src={post.image}
                  alt={post.title}
                />
              ) : null}

              {embedUrl ? (
                <div className="portal-post-video">
                  <iframe
                    src={embedUrl}
                    title={post.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : null}

              {post.description ? (
                <p className="portal-post-summary">{post.description}</p>
              ) : null}

              {post.link ? (
                <a
                  className="portal-post-action"
                  href={post.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {category === "videos"
                    ? "Watch video"
                    : "Visit official website"}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </article>
          ) : (
            <PortalContentNotFound
              categoryLabel={label}
              categoryHref={`/${category}`}
            />
          )}
        </div>
      </main>

      <div className="portal-post-category-grid">
        <CategoryGrid language={language as CategoryLanguage} />
      </div>

      <PortalFooter />
    </>
  );
}
