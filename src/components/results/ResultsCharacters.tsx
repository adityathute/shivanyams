"use client";

// File Location: shivanyams/src/components/results/ResultsCharacters.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shivanya-ui icons and shivanya-i18n types reused where applicable); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Audited illustration composition, Next.js Image usage, SDK icon reuse and legacy stylesheet dependency. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.



import Image from "next/image";
import {
  ResultIcon,
} from "shivanya-ui";

import "./../../styles/legacy/components/results/ResultsCharacters.css";

export function ResultsCharacters() {
  return (
    <div className="results-characters">
      <div className="results-character-circle" />

      <Image
        src="/images/result-image.png"
        alt="Students celebrating examination results"
        width={1536}
        height={1024}
        priority
        unoptimized
        decoding="sync"
        className="results-characters-image"
      />

      <div className="results-character-badge results-badge-job">
        <ResultIcon size={24} />
      </div>
    </div>
  );
}