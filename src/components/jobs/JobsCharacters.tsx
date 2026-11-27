/* File Location: shivanyams/src/components/jobs/JobsCharacters.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
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
