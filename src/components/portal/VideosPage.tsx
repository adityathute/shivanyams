"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "shivanya-ui";
import { usePortalData } from "./portal-data";
import { PortalFooter } from "./PortalFooter";
import "./VideosPage.css";

export function VideosPage() {
  const [query, setQuery] = useState("");
  const { data } = usePortalData();

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
        {/* Hero Section */}
        <section className="videos-hero">
          <div className="videos-hero-content">
            <span className="videos-eyebrow">
              SHIVANYAMS · VIDEO LEARNING
            </span>

            <h1>
              व्हिडिओ पाहा,
              <br />
              सोप्या पद्धतीने शिका.
            </h1>

            <p>
              सरकारी योजना, ऑनलाइन सेवा आणि महत्त्वाच्या अपडेट्सची माहिती
              मराठी व्हिडिओमध्ये.
            </p>

            <form
              className="videos-search"
              onSubmit={(event) => event.preventDefault()}
            >
              <SearchIcon size={18} />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search videos..."
                aria-label="Search videos"
              />

              <button type="submit">Search</button>
            </form>

            <div className="videos-hero-tags">
              <span>मराठी मार्गदर्शिका</span>
              <span>Online Services</span>
              <span>Government Updates</span>
            </div>
          </div>

          <div className="videos-hero-art" aria-hidden="true">
            <div className="videos-art-circle">
              <div className="videos-art-play">▶</div>
            </div>

            <span className="videos-art-label">
              WATCH · LEARN · GROW
            </span>
          </div>
        </section>

        {/* Video Library Box */}
        <section className="videos-panel">
          <header className="videos-panel-header">
            <h2>Latest Videos & Guides</h2>
            <span>{videos.length} videos</span>
          </header>

          <div className="videos-library-heading">
            <div>
              <span className="videos-library-eyebrow">
                VIDEO LIBRARY
              </span>

              <h2>सर्व व्हिडिओ</h2>
            </div>
          </div>

          {videos.length ? (
            <div className="videos-grid">
              {videos.map((video) => {
                const content = (
                  <>
                    <div
                      className="videos-thumbnail"
                      style={{
                        backgroundImage: `linear-gradient(0deg, rgba(15, 20, 35, 0.55), transparent 65%), url("${video.thumbnail}")`,
                      }}
                    >
                      <span className="videos-play-button">▶</span>
                      <span className="videos-watch-label">
                        Watch video
                      </span>
                    </div>

                    <div className="videos-card-content">
                      <div className="videos-card-tags">
                        <span>{video.language}</span>
                        <span>Guide</span>
                      </div>

                      <h3>{video.title}</h3>
                    </div>
                  </>
                );

                return video.url ? (
                  <a
                    className="videos-card"
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="videos-card" key={video.id}>
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="videos-empty">
              <span>▶</span>
              <h3>व्हिडिओ सापडले नाहीत</h3>
              <p>दुसरा search शब्द वापरून पाहा.</p>
            </div>
          )}
        </section>
      </main>

      <PortalFooter />
    </>
  );
}