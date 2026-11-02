"use client";
import "./VideosSection.css";

import { usePortalData } from "./portal-data";

export function VideosSection() {
  const { data } = usePortalData();

  return (
    <section className="video-section panel" id="videos">
      <div className="section-heading">
        <h2>
          <span className="youtube-icon">▶</span>
          YouTube व्हिडिओ – नवीन मार्गदर्शिका आणि अपडेट्स
        </h2>
        <a href="#videos">सर्व व्हिडिओ पहा →</a>
      </div>

      <div className="video-grid">
        {data.videos.map((video) => (
          <a
            className="video-card"
            key={video.id}
            href={video.url || "#videos"}
            target={video.url ? "_blank" : undefined}
            rel={video.url ? "noreferrer" : undefined}
            onClick={(event) => {
              if (!video.url) {
                event.preventDefault();
                window.alert("या व्हिडिओची YouTube लिंक Admin पॅनेलमधून जोडा.");
              }
            }}
          >
            <div
              className="video-thumb"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(4,20,45,.62), transparent 65%), url("${video.thumbnail}")`,
              }}
            >
              <span className="play-button">▶</span>
              <span className="video-time">Watch video</span>
            </div>
            <strong>{video.title}</strong>
            <div className="video-tags">
              <span>{video.language}</span>
              <span>Guide</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
