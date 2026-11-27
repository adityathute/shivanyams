/* File Location: shivanyams/src/components/examination/ExaminationCharacters.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

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