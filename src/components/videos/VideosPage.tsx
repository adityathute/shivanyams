/*
 * File Location: shivanyams/src/components/videos/VideosPage.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 21 audit; review complete, follow-up work remains tracked in PROJECT_STRUCTURE.md.
 */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Language } from "shivanya-i18n";
import { VideosCharacters } from "./VideosCharacters";
import { VideoIcon } from "shivanya-ui";
import { getLocalizedPostTitle, usePortalData, useRefreshPortalDataOnMount } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { CategoryBadge, getLocalizedCategoryLabel } from "../portal/category/CategoryGrid";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";
import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";
import { PortalEmptyState } from "../portal/category/PortalEmptyState";

import "./../../styles/legacy/components/videos/VideosPage.css";

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      } else {
        const segments = parsedUrl.pathname.split("/").filter(Boolean);

        if (
          ["embed", "shorts", "live"].includes(segments[0]) &&
          segments[1]
        ) {
          videoId = segments[1];
        }
      }
    }

    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export function VideosPage() {
  useRefreshPortalDataOnMount();

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const videos = data.videos;

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    data.items
      .filter((item) => item.type === "video")
      .forEach((item) => {
        (Array.isArray(item.tags) ? item.tags : []).forEach((tag) => {
          const cleanTag = String(tag || "").trim();
          if (!cleanTag) return;
          const normalized = cleanTag.toLocaleLowerCase();
          counts.set(normalized, (counts.get(normalized) || 0) + 1);
        });
      });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [data.items]);

  const hasVideos = data.videos.length > 0;

  return (
    <>
      <main className="videos-page">
        <section className="videos-hero">
          <div className="videos-hero-content">
            <span className="videos-eyebrow">
              {t("videosEyebrow")}
            </span>

            <h1>
              {t("videosHeroTitleLine1")}
              <br />
              {t("videosHeroTitleLine2")}
            </h1>

            <p>{t("videosHeroDescription")}</p>

            {popularTags.length > 0 ? (
              <div className="videos-popular-tags portal-post-taxonomy" aria-label="Popular video tags">
                {popularTags.map((tag) => (
                  <Link className="portal-custom-tag" href={`/tags/${createPostSlug(tag)}`} key={tag}>{tag}</Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="videos-hero-art" aria-hidden="true">
            <VideosCharacters />
          </div>
        </section>

        <section className="videos-panel">
          <header className="videos-panel-header">
            <h2>{t("latestVideosGuides")}</h2>

            <span>
              {videos.length} {t("videosCount")}
            </span>
          </header>

          {data.loading && videos.length === 0 && (
            <div className="videos-grid videos-skeleton-grid" aria-label="Loading videos" aria-busy="true">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="videos-skeleton-card" key={index} aria-hidden="true">
                  <span className="videos-skeleton-thumbnail" />
                  <span className="videos-skeleton-line videos-skeleton-tag" />
                  <span className="videos-skeleton-line videos-skeleton-title" />
                  <span className="videos-skeleton-line videos-skeleton-title-short" />
                </div>
              ))}
            </div>
          )}

          {!data.loading && data.failedTypes?.includes("video") && data.error && (
            <div className="videos-empty">
              {data.error}
            </div>
          )}

          {videos.length > 0 && (
            <div className="videos-grid">
              {videos.map((video) => {
                const videoItem = data.items.find((item) => item.id === video.id);
                const youtubeEmbedUrl = getYouTubeEmbedUrl(video.url);

                return (
                  <div className="videos-card" key={video.id}>
                    <div
                      className="videos-thumbnail"
                      style={{
                        backgroundImage: youtubeEmbedUrl
                          ? undefined
                          : `linear-gradient(0deg, rgba(15, 20, 35, 0.55), transparent 65%), url("${video.thumbnail}")`,
                      }}
                    >
                      {youtubeEmbedUrl ? (
                        <iframe
                          className="videos-youtube-player"
                          src={youtubeEmbedUrl}
                          title={video.title}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <span className="videos-play-button">
                            <VideoIcon size={20} />
                          </span>

                          <span className="videos-watch-label">
                            {t("watchVideo")}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="videos-card-content">
                      <div className="videos-card-tags">
                        <CategoryBadge
                          category="videos"
                          label={
                            videoItem
                              ? getLocalizedCategoryLabel(videoItem, language)
                              : language === "mr"
                                ? "व्हिडिओ"
                                : language === "hi"
                                  ? "वीडियो"
                                  : "Videos"
                          }
                        />
                        {video.language && <span>{video.language}</span>}
                      </div>

                      <h3>
                        <Link
                          href={`/videos/${video.slug || createPostSlug(video.title_en || video.title)}`}
                        >
                          {getLocalizedPostTitle(video, language)}
                        </Link>
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!data.loading && videos.length === 0 && !data.failedTypes?.includes("video") && (
            <PortalEmptyState title={language === "mr" ? "व्हिडिओ उपलब्ध नाहीत" : language === "hi" ? "अभी वीडियो उपलब्ध नहीं हैं" : "No videos available"} description={language === "mr" ? "नवीन व्हिडिओ प्रकाशित झाल्यावर येथे दिसतील." : language === "hi" ? "नए वीडियो प्रकाशित होते ही यहाँ दिखाई देंगे।" : "New videos will appear here as soon as they are published."} icon="▶" />
          )}
        </section>
      </main>

      <PortalFooter />
    </>
  );
}
