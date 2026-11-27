/*
 * File Location: shivanyams/src/components/tools/ToolsCharacters.tsx
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
import "./../../styles/legacy/components/tools/ToolsCharacters.css";

export function ToolsCharacters() {
  return (
    <div className="tools-characters">
      <div className="tools-character-circle" />

      <Image
        src="/images/tools-image.png"
        alt="Students exploring useful online tools and calculators"
        width={1728}
        height={832}
        priority
        className="tools-characters-image"
      />

      <div className="tools-character-sparkle">✦</div>
    </div>
  );
}
