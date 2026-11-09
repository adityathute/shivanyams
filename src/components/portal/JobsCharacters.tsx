"use client";

import Image from "next/image";
import {
  GovernmentJobIcon,
  GovernmentSchemeIcon,
  CheckIcon,
} from "shivanya-ui";
import "./JobsCharacters.css";

export function JobsCharacters() {
  return (
    <div className="jobs-characters">
      <div className="jobs-character-circle" />

      <Image
        src="/images/job-image.png"
        alt="Students preparing for government jobs and examinations"
        width={1600}
        height={920}
        priority
        className="jobs-characters-image"
      />

      <div className="jobs-character-badge jobs-badge-job">
        <GovernmentJobIcon size={24} />
      </div>

      <div className="jobs-character-sparkle">✦</div>

      <div className="jobs-character-badge jobs-badge-check">
        <CheckIcon size={24} />
      </div>

      <div className="jobs-character-badge jobs-badge-building">
        <GovernmentSchemeIcon size={24} />
      </div>
    </div>
  );
}