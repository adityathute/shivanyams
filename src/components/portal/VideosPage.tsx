"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Language } from "shivanya-i18n";
import { VideosCharacters } from "./VideosCharacters";
import { SearchIcon, VideoIcon } from "shivanya-ui";
import { usePortalData } from "./portal-data";
import { createPostSlug } from "./PortalPostDetail";
import { usePortalLanguage } from "./PortalLanguageContext";
import { PortalFooter } from "./PortalFooter";

import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";

import "./VideosPage.css";

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

        if (["embed", "shorts", "live"].includes(segments[0]) && segments[1]) {
          videoId = segments[1];
        }
      }
    }

    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export function VideosPage() {
  const [query, setQuery] = useState("");

  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const videos = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.videos.filter(
      (video) =>
        !term ||
        [video.title, video.language].some((value) =>
          value.toLowerCase().includes(term),
        ),
    );
  }, [data.videos, query]);

  return (
    <>
      <main className="videos-page">
        <section className="videos-hero">
          <div className="videos-hero-content">
            <span className="videos-eyebrow">{t("videosEyebrow")}</span>

            <h1>
              {t("videosHeroTitleLine1")}
              <br />
              {t("videosHeroTitleLine2")}
            </h1>

            <p>{t("videosHeroDescription")}</p>

            <form
              className="videos-search"
              onSubmit={(event) => event.preventDefault()}
            >
              <SearchIcon size={18} />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("videosSearchPlaceholder")}
                aria-label={t("videosSearchPlaceholder")}
              />

              <button type="submit">{t("search")}</button>
            </form>
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

          <div className="videos-library-heading">
            <div>
              <span className="videos-library-eyebrow">
                {t("videoLibrary")}
              </span>

              <h2>{t("allVideos")}</h2>
            </div>
          </div>

          {videos.length ? (
            <div className="videos-grid">
              {videos.map((video) => {
                const youtubeEmbedUrl = getYouTubeEmbedUrl(video.url);

                const content = (
                  <>
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
                        <span>{video.language}</span>
                        <span>{t("guide")}</span>
                      </div>

                      <h3><Link href={`/videos/${createPostSlug(video.title)}`}>{video.title}</Link></h3>
                    </div>
                  </>
                );

                if (youtubeEmbedUrl) {
                  return (
                    <div className="videos-card" key={video.id}>
                      {content}
                    </div>
                  );
                }

                return (
                  <div className="videos-card" key={video.id}>
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="videos-empty">
              <span className="videos-empty-icon">
                <VideoIcon size={28} />
              </span>

              <h3>{t("noVideosFound")}</h3>
              <p>{t("tryAnotherSearch")}</p>
            </div>
          )}
        </section>
      </main>

      <PortalFooter />
    </>
  );
}
