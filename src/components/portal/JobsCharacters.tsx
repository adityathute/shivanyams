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

      <div className="jobs-character girl">
        <Image
          src="/images/jobs/girl.png"
          alt="Student girl"
          width={420}
          height={500}
          priority
        />
      </div>

      <div className="jobs-character boy">
        <Image
          src="/images/jobs/boy.png"
          alt="Student boy holding job checklist"
          width={420}
          height={500}
          priority
        />
      </div>

      <div className="jobs-character-badge jobs-badge-job">
        <span>
          {" "}
          <GovernmentJobIcon size={24} />
        </span>
      </div>
      <div className="jobs-character-sparkle">✦</div>

      <div className="jobs-character-badge jobs-badge-check">
        <span>
          {" "}
          <CheckIcon size={24} />
        </span>
      </div>

      <div className="jobs-character-badge jobs-badge-building">
        <span>
          {" "}
          <GovernmentSchemeIcon size={24} />
        </span>
      </div>

    </div>
  );
}
