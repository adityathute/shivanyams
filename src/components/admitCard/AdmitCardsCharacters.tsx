/* File Location: shivanyams/src/components/admitCard/AdmitCardsCharacters.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

// Cleanup Status: Cleanup Pending
// Cleanup Info: Audited illustration composition, Next.js Image usage, SDK icon reuse and legacy stylesheet dependency. Remaining page/illustration styles are still under legacy stylesheet paths and require dedicated CSS migration before this file can be marked Clean.



import Image from "next/image";
import {
  AdmitCardIcon,
} from "shivanya-ui";

import "./../../styles/legacy/components/admitCard/AdmitCardsCharacters.css";

export function AdmitCardsCharacters() {
  return (
    <div className="admit-characters">
      <div className="admit-character-circle" />

      <Image
        src="/images/admits-image007.png"
        alt="Students preparing for examinations"
        width={1600}
        height={1024}
        priority
        unoptimized
        decoding="sync"
        className="admit-characters-image"
      />

      <div className="admit-character-badge admit-badge-card">
        <AdmitCardIcon size={24} />
      </div>

      <div className="admit-character-sparkle">✦</div>
    </div>
  );
}