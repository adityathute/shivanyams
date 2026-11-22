"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import "./VideoPlayer.css";

type CaptionTrack = { id: number; language: string; label: string; is_default?: boolean; url: string };
type VideoAttachment = { kind?: string; mime_type?: string; video_url?: string | null; optimized_video_mime_type?: string | null; optimized_video_url?: string | null; video_poster_url?: string | null; caption?: string; role?: string };
type VideoDetails = { provider?: string; video_url?: string; embed_url?: string; thumbnail_url?: string; duration_seconds?: number | null; caption_tracks?: CaptionTrack[] };
type RelatedVideo = { id: string | number; slug?: string; title: string; thumbnail?: string; language?: string };

export function VideoPlayer({ title, description, details, attachments = [], related = [] }: { title: string; description?: string; details?: VideoDetails | null; attachments?: VideoAttachment[]; related?: RelatedVideo[] }) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState("1");
  const source = attachments.find((item) => item.kind === "video" && (item.optimized_video_url || item.video_url));
  const sourceUrl = source?.optimized_video_url || source?.video_url || (details?.provider === "self_hosted" ? details.video_url : "");
  const poster = source?.video_poster_url || details?.thumbnail_url || "";
  const embedUrl = details?.embed_url || "";
  const tracks = details?.caption_tracks || [];
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org", "@type": "VideoObject", name: title, description: description || title,
    thumbnailUrl: poster ? [poster] : undefined, uploadDate: undefined, duration: details?.duration_seconds ? `PT${details.duration_seconds}S` : undefined,
    contentUrl: sourceUrl || undefined, embedUrl: embedUrl || undefined,
  }), [title, description, poster, details?.duration_seconds, sourceUrl, embedUrl]);
  const changeSpeed = (value: string) => { setSpeed(value); if (playerRef.current) playerRef.current.playbackRate = Number(value); };
  const relatedItems = related.filter((item) => item.slug || item.id).slice(0, 4);

  return (
    <section className="shiv-video-player-section" aria-label="Video player">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="shiv-video-player-frame">
        {sourceUrl ? (
          <video ref={playerRef} className="shiv-video-player" controls playsInline preload="metadata" poster={poster || undefined} controlsList="nodownload" aria-label={title}>
            <source src={sourceUrl} type={source?.optimized_video_url ? source.optimized_video_mime_type || "video/mp4" : source?.mime_type || "video/mp4"} />
            {tracks.map((track) => <track key={track.id} kind="captions" src={track.url} srcLang={track.language} label={track.label} default={Boolean(track.is_default)} />)}
            Your browser does not support HTML video.
          </video>
        ) : embedUrl ? (
          <iframe className="shiv-video-player-embed" src={embedUrl} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : (
          <div className="shiv-video-player-unavailable">
            {poster ? <img src={poster} alt="" /> : null}
            <p>Video playback is not available yet.</p>
          </div>
        )}
      </div>
      {sourceUrl ? (
        <div className="shiv-video-player-toolbar">
          <label>Playback speed <select value={speed} onChange={(event) => changeSpeed(event.target.value)}><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">Normal</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2×</option></select></label>
          <span>{tracks.length ? `${tracks.length} caption track${tracks.length === 1 ? "" : "s"} available — enable CC in player controls` : "Captions not available"}</span>
        </div>
      ) : null}
      {relatedItems.length ? (
        <nav className="shiv-video-related" aria-label="Related videos">
          <h2>Related videos</h2>
          <div className="shiv-video-related-grid">
            {relatedItems.map((item) => <Link key={item.id} href={`/videos/${item.slug || item.id}`} className="shiv-video-related-card">{item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : <span className="shiv-video-related-placeholder">▶</span>}<span><strong>{item.title}</strong>{item.language ? <small>{item.language}</small> : null}</span></Link>)}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
