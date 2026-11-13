"use client";

import Image from "next/image";
import {
  CheckIcon,
  GovernmentJobIcon,
} from "shivanya-ui";

import "./ResultsCharacters.css";

export function ResultsCharacters() {
  return (
    <div className="results-characters">
      <div className="results-character-circle" />

      <Image
        src="/images/result-img.png"
        alt="Students celebrating examination results"
        width={1536}
        height={1024}
        priority
        className="results-characters-image"
      />

      {/* <div className="results-character-badge results-badge-check">
        <CheckIcon size={24} />
      </div> */}

      {/* <div className="results-character-badge results-badge-job">
        <GovernmentJobIcon size={24} />
      </div> */}

      {/* <div className="results-character-sparkle">
        ✦
      </div> */}
    </div>
  );
}