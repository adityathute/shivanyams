"use client";

// File Location: shivanyams/src/components/examination/ExaminationCharacters.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shivanya-ui icons and shivanya-i18n types reused where applicable); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Audited illustration composition, Next.js Image usage, SDK icon reuse and removed an obsolete commented-out sparkle element. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.



import Image from "next/image";
import {
  ExaminationIcon,
} from "shivanya-ui";
import "./../../styles/legacy/components/examination/ExaminationCharacters.css";

export function ExaminationCharacters() {
  return (
    <div className="examination-characters">
      <div className="examination-character-circle" />

      <Image
        src="/images/exam-image.png"
        alt="Students preparing for examinations"
        width={1536}
        height={1024}
        priority
        unoptimized
        decoding="sync"
        className="examination-characters-image"
      />

      <div className="examination-character-badge examination-badge-job">
        <ExaminationIcon size={24} />
      </div>

    </div>
  );
}