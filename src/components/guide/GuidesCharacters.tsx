"use client";

// File Location: shivanyams/src/components/guide/GuidesCharacters.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shivanya-ui icons and shivanya-i18n types reused where applicable); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Audited illustration composition, Next.js Image usage, SDK icon reuse and legacy stylesheet dependency. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.



import Image from "next/image";
import { GuideIcon } from "shivanya-ui";

import "./../../styles/legacy/components/guide/GuidesCharacters.css";

export function GuidesCharacters() {
  return (
    <div className="guides-characters">
      <div className="guides-character-circle" />

      <Image
        src="/images/guides-image.png"
        alt="Students learning through educational guides"
        width={1600}
        height={1024}
        priority
        unoptimized
        decoding="sync"
        className="guides-characters-image"
      />

      <div className="guides-character-badge guides-badge-guide">
        <GuideIcon size={24} />
      </div>

      {/* <div className="guides-character-sparkle">✦</div> */}
    </div>
  );
}