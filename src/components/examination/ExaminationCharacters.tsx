"use client";

import Image from "next/image";
import {
  ExaminationIcon,
} from "shivanya-ui";
import "./ExaminationCharacters.css";

export function ExaminationCharacters() {
  return (
    <div className="examination-characters">
      <div className="examination-character-circle" />

      <Image
        src="/images/exam-image.png"
        alt="Students preparing for examinations"
        width={1536}
        height={1024}
        priority
        className="examination-characters-image"
      />

      <div className="examination-character-badge examination-badge-job">
        <ExaminationIcon size={24} />
      </div>

      {/* <div className="examination-character-sparkle">✦</div> */}
    </div>
  );
}