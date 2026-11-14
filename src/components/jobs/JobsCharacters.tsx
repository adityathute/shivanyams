
"use client";

import Image from "next/image";
import {
  GovernmentJobIcon,
} from "shivanya-ui";
import "./JobsCharacters.css";

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
        className="jobs-characters-image"
      />

      <div className="jobs-character-badge jobs-badge-job">
        <GovernmentJobIcon size={24} />
      </div>

      <div className="jobs-character-sparkle">✦</div>
    </div>
  );
}
