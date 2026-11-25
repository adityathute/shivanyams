
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
        unoptimized
        decoding="sync"
        className="tools-characters-image"
      />

      <div className="tools-character-sparkle">✦</div>
    </div>
  );
}
