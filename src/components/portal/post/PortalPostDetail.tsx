"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePortalData } from "../data/portal-data";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { PortalFooter } from "../layout/footer/PortalFooter";
import { PortalContentNotFound } from "./PortalContentNotFound";
import "./PortalPostDetail.css";
import {
  CategoryGrid,
  getPortalApiUrl,
  getCategoryTitle,
  type Category,
  type Language as CategoryLanguage,
} from "../category/CategoryGrid";

type CategorySlug =
  | "jobs"
  | "schemes"
  | "examination"
  | "results"
  | "admit-cards"
  | "guides"
  | "videos"
  | "tools";

const categoryTypes: Record<Exclude<CategorySlug, "videos">, string> = {
  jobs: "job",
  schemes: "scheme",
  examination: "examination",
  results: "result",
  "admit-cards": "admit",
  guides: "guide",
  tools: "tool",
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
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(getPortalApiUrl("categories/"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load categories.");
        return response.json();
      })
      .then((payload) => {
        const list: Category[] = Array.isArray(payload)
          ? payload
          : (payload.results ?? []);
        setCategories(list.filter((entry) => entry.is_active ?? entry.active ?? false));
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          console.error("Category loading failed:", error);
      });
    return () => controller.abort();
  }, []);

  const post = useMemo(() => {
    if (category === "videos") {
      const video = data.videos.find(
        (entry) =>
          (entry.slug || createPostSlug(entry.title)) === slug ||
          entry.id === slug,
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
            organization: "",
            location: "",
            startDate: "",
            endDate: "",
            eventDate: "",
            jobDetails: undefined,
          }
        : null;
    }

    const type = categoryTypes[category];
    const item = data.items.find(
      (entry) =>
        entry.type === type &&
        ((entry.slug || createPostSlug(entry.title)) === slug ||
          entry.id === slug),
    );
    return item
      ? {
          title: item.title,
          description: item.description,
          category: item.category,
          date: item.date,
          link: item.link,
          image: item.image || "",
          body: item.body || "",
          organization: item.organization || "",
          location: item.location || "",
          startDate: item.start_date || "",
          endDate: item.end_date || "",
          eventDate: item.event_date || "",
          jobDetails: item.job_details
            ? { ...item.job_details, location: item.job_details.location || "" }
            : undefined,
        }
      : null;
  }, [category, data.items, data.videos, slug]);

  const categoryApiSlug = category === "guides" ? "articles-guides" : category;
  const categoryRecord = categories.find(
    (entry) => entry.slug === categoryApiSlug,
  );
  const label = categoryRecord
    ? getCategoryTitle(categoryRecord, language as CategoryLanguage)
    : "";
  const embedUrl = category === "videos" ? getVideoEmbedUrl(post?.link) : null;

  return (
    <>
      <main className="portal-post-detail">
        <div className="portal-post-detail-inner">
          {data.loading ? (
            <div className="portal-post-loading">Loading...</div>
          ) : post ? (
            <article className="portal-post-card">
              <div className="portal-post-meta">
                <span>{post.category || label}</span>
                {post.date ? (
                  <time>{formatDate(post.date, language)}</time>
                ) : null}
              </div>

              <h1>{post.title}</h1>

              {post.organization || post.location ? (
                <div className="portal-post-context">
                  {post.organization ? <span>{post.organization}</span> : null}
                  {post.location ? <span>{post.location}</span> : null}
                </div>
              ) : null}

              {post.eventDate || post.startDate || post.endDate ? (
                <div className="portal-post-context">
                  {post.eventDate ? (
                    <span>
                      Event date: {formatDate(post.eventDate, language)}
                    </span>
                  ) : null}
                  {post.startDate ? (
                    <span>Start: {formatDate(post.startDate, language)}</span>
                  ) : null}
                  {post.endDate ? (
                    <span>End: {formatDate(post.endDate, language)}</span>
                  ) : null}
                </div>
              ) : null}

              {post.image && !embedUrl ? (
                <Image
                  className="portal-post-image"
                  src={post.image}
                  alt={post.title}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 1200px"
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

              {post.jobDetails ? (
                <section className="portal-job-details">
                  {[
                    ["Advertisement No.", post.jobDetails.advertisement_no],
                    ["Total", post.jobDetails.total_posts],
                    [
                      "Name of the Examination",
                      post.jobDetails.examination_name,
                    ],
                    [
                      "Name of the Post & Details",
                      post.jobDetails.post_details,
                    ],
                    [
                      "Educational Qualification",
                      post.jobDetails.educational_qualification,
                    ],
                    ["Job location", post.jobDetails.location],
                    ["Age Limit", post.jobDetails.age_limit],
                    ["Fee", post.jobDetails.application_fee],
                    ["Application Mode", post.jobDetails.application_mode],
                    ["Venue of Interview", post.jobDetails.interview_venue],
                  ]
                    .filter(([, value]) => Boolean(value))
                    .map(([name, value]) => (
                      <div
                        className="portal-job-detail-row"
                        key={name as string}
                      >
                        <strong>{name}</strong>
                        <span>{value}</span>
                      </div>
                    ))}

                  {post.jobDetails.important_dates.length ? (
                    <div className="portal-job-detail-group">
                      <h2>Important Dates</h2>
                      {post.jobDetails.important_dates.map((entry, index) => (
                        <div className="portal-job-detail-row" key={index}>
                          <strong>{entry.label}</strong>
                          <span>{entry.date}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {post.jobDetails.important_links.length ? (
                    <div className="portal-job-detail-group">
                      <h2>Important Links</h2>
                      {post.jobDetails.important_links.map((entry, index) => (
                        <div className="portal-job-detail-row" key={index}>
                          <strong>{entry.label}</strong>
                          <a href={entry.url} target="_blank" rel="noreferrer">
                            {entry.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {post.description ? (
                <p className="portal-post-summary">{post.description}</p>
              ) : null}

              {post.body ? (
                <div className="portal-post-summary">{post.body}</div>
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
              categoryLabel={label || category}
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
