"use client";

import Image from "next/image";
import { GuideIcon, CheckIcon } from "shivanya-ui";

import "./GuidesCharacters.css";

export function GuidesCharacters() {
  return (
    <div className="guides-characters">
      <div className="guides-character-circle" />

      <Image
        src="/images/guide-img.png"
        alt="Students learning through educational guides"
        width={1600}
        height={1024}
        priority
        className="guides-characters-image"
      />

      {/* <div className="guides-character-badge guides-badge-guide">
        <GuideIcon size={24} />
      </div> */}

      {/* <div className="guides-character-sparkle">✦</div> */}

      {/* <div className="guides-character-badge guides-badge-check">
        <CheckIcon size={24} />
      </div> */}

      {/* <div className="guides-character-badge guides-badge-book">
        📖
      </div> */}
    </div>
  );
}