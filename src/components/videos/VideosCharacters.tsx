"use client";

import Image from "next/image";
import { VideoIcon } from "shivanya-ui";
import "./VideosCharacters.css";

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