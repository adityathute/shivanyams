
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Language } from "shivanya-i18n";
import { VideosCharacters } from "./VideosCharacters";
import { SearchIcon, VideoIcon } from "shivanya-ui";
import { usePortalData } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";
import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";
import { getPortalApiUrl } from "../../lib/portal-api";
import { authenticatedFetch } from "../../lib/authenticated-fetch";

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

        if (
          ["embed", "shorts", "live"].includes(segments[0]) &&
          segments[1]
        ) {
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

type VideoCollectionItem = { id: number; slug: string; title_en: string; title_mr?: string; title_hi?: string; thumbnail_url?: string; sort_order: number };
type VideoCollection = { id: number; collection_type: "playlist" | "series" | "channel"; title_en: string; title_mr?: string; title_hi?: string; slug: string; description_en?: string; description_mr?: string; description_hi?: string; external_url?: string; thumbnail_url?: string; items: VideoCollectionItem[] };

export function VideosPage() {
  const [query, setQuery] = useState("");
  const [collections, setCollections] = useState<VideoCollection[]>([]);

  const { data } = usePortalData();

  useEffect(() => {
    const controller = new AbortController();
    authenticatedFetch(getPortalApiUrl("content/video-collections/"), { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Unable to load video collections."); return response.json(); })
      .then((payload) => setCollections(Array.isArray(payload.results) ? payload.results : []))
      .catch((error) => { if (!controller.signal.aborted) console.error("Video collections could not be loaded:", error); });
    return () => controller.abort();
  }, []);

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

        {collections.length > 0 ? <section className="videos-collections-panel">
          <header><div><span className="videos-eyebrow">WATCH BY COLLECTION</span><h2>Playlists, series & channels</h2><p>Explore curated YouTube playlists and video learning series.</p></div></header>
          <div className="videos-collections-grid">
            {collections.map((collection) => {
              const collectionTitle = language === "mr" ? collection.title_mr || collection.title_en : language === "hi" ? collection.title_hi || collection.title_en : collection.title_en;
              const collectionDescription = language === "mr" ? collection.description_mr || collection.description_en : language === "hi" ? collection.description_hi || collection.description_en : collection.description_en;
              return <article className="videos-collection-card" key={collection.id}>
                {collection.thumbnail_url ? <img src={collection.thumbnail_url} alt="" loading="lazy" /> : <div className="videos-collection-placeholder">{collection.collection_type === "channel" ? "▶" : "▤"}</div>}
                <div><span>{collection.collection_type === "playlist" ? "YouTube Playlist" : collection.collection_type === "series" ? "Video Series" : "YouTube Channel"}</span><h3>{collectionTitle}</h3>{collectionDescription ? <p>{collectionDescription}</p> : null}
                  {collection.items.length ? <div className="videos-collection-items">{collection.items.slice(0, 4).map((item) => <Link key={item.id} href={`/videos/${item.slug}`}>{language === "mr" ? item.title_mr || item.title_en : language === "hi" ? item.title_hi || item.title_en : item.title_en}</Link>)}</div> : null}
                  {collection.external_url ? <a className="videos-collection-external" href={collection.external_url} target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a> : null}
                </div></article>;
            })}
          </div>
        </section> : null}
        <section className="videos-panel">
          <header className="videos-panel-header">
            <h2>{t("latestVideosGuides")}</h2>

            <span>
              {videos.length} {t("videosCount")}
            </span>
          </header>

          {data.loading && (
            <div className="videos-empty">
              Loading...
            </div>
          )}

          {!data.loading && data.error && (
            <div className="videos-empty">
              {data.error}
            </div>
          )}

          {!data.loading && !data.error && videos.length > 0 && (
            <div className="videos-grid">
              {videos.map((video) => {
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
                        <span>{video.language}</span>
                        <span>{t("guide")}</span>
                      </div>

                      <h3>
                        <Link
                          href={`/videos/${video.slug || createPostSlug(video.title)}`}
                        >
                          {video.title}
                        </Link>
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!data.loading && !data.error && videos.length === 0 && (
            <div className="videos-empty">
              {hasVideos ? (
                <>
                  <h3>{t("noVideosFound")}</h3>
                  <p>{t("tryAnotherSearch")}</p>
                </>
              ) : (
                <h3>No videos available</h3>
              )}
            </div>
          )}
        </section>
      </main>

      <PortalFooter />
    </>
  );
}
