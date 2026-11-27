/*
 * File Location: shivanyams/src/components/scheme/SchemesCharacters.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Batch 20 audit; review complete, follow-up work remains tracked in PROJECT_STRUCTURE.md.
 */
"use client";

import Image from "next/image";
import {
  GovernmentSchemeIcon,
} from "shivanya-ui";
import "./../../styles/legacy/components/scheme/SchemesCharacters.css";

export function SchemesCharacters() {
  return (
    <div className="schemes-characters">
      <div className="schemes-character-circle" />

      <Image
        src="/images/scheme-image.png"
        alt="Students exploring government schemes and benefits"
        width={1600}
        height={1024}
        priority
        className="schemes-characters-image"
      />

      <div className="schemes-character-badge schemes-badge-government">
        <GovernmentSchemeIcon size={24} />
      </div>

      <div className="schemes-character-sparkle">✦</div>
    </div>
  );
}