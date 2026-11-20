"use client";

import Image from "next/image";
import {
  ResultIcon,
} from "shivanya-ui";

import "./ResultsCharacters.css";

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
        className="results-characters-image"
      />

      <div className="results-character-badge results-badge-job">
        <ResultIcon size={24} />
      </div>
    </div>
  );
}