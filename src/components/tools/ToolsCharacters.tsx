
"use client";

import Image from "next/image";
import "./ToolsCharacters.css";

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
