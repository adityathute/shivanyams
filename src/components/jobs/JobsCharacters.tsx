// File Location: shivanyams/src/components/jobs/JobsCharacters.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shivanya-ui icons and shivanya-i18n types reused where applicable); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Audited illustration composition, Next.js Image usage, SDK icon reuse and legacy stylesheet dependency. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.


"use client";

import Image from "next/image";
import {
  GovernmentJobIcon,
} from "shivanya-ui";
import "./../../styles/legacy/components/jobs/JobsCharacters.css";

export function JobsCharacters() {
  return (
    <div className="jobs-characters">
      <div className="jobs-character-circle" />

      <Image
        src="/images/jobs-image.png"
        alt="Students exploring government job opportunities"
        width={1728}
        height={832}
        priority
        unoptimized
        decoding="sync"
        className="jobs-characters-image"
      />

      <div className="jobs-character-badge jobs-badge-job">
        <GovernmentJobIcon size={24} />
      </div>

      <div className="jobs-character-sparkle">✦</div>
    </div>
  );
}
