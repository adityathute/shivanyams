"use client";

import Image from "next/image";
import {
  AdmitCardIcon,
  CheckIcon,
  DownloadIcon,
} from "shivanya-ui";

import "./AdmitCardsCharacters.css";

export function AdmitCardsCharacters() {
  return (
    <div className="admit-characters">
      <div className="admit-character-circle" />

      <Image
        src="/images/admit-card-image.png"
        alt="Students preparing for examinations"
        width={1600}
        height={1024}
        priority
        className="admit-characters-image"
      />

      <div className="admit-character-badge admit-badge-card">
        <AdmitCardIcon size={24} />
      </div>

      <div className="admit-character-sparkle">✦</div>

      {/* <div className="admit-character-badge admit-badge-check">
        <CheckIcon size={24} />
      </div> */}

      <div className="admit-character-badge admit-badge-download">
        <DownloadIcon size={24} />
      </div>
    </div>
  );
}