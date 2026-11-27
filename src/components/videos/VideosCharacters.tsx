/**
 * File Location: shivanyams/src/components/videos/VideosCharacters.tsx
 * Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
 * Checked Repository: adityathute/shivanyams @ shiv-v2
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 21 audit; review complete, follow-up work remains tracked in PROJECT_STRUCTURE.md.
 */
"use client";

import Image from "next/image";
import { VideoIcon } from "shivanya-ui";
import "./../../styles/legacy/components/videos/VideosCharacters.css";

export function VideosCharacters() {
  return (
    <div className="videos-characters">
      <div className="videos-character-circle" />

      <Image
        src="/images/videos-image.png"
        alt="Students watching educational videos"
        width={1600}
        height={1024}
        priority
        className="videos-characters-image"
      />

      <div className="videos-character-badge videos-badge-video">
        <VideoIcon size={24} />
      </div>

      <div className="videos-character-sparkle">✦</div>
    </div>
  );
}