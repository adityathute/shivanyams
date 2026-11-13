"use client";

import Image from "next/image";
import {
  GovernmentSchemeIcon,
  CheckIcon,
} from "shivanya-ui";
import "./SchemesCharacters.css";

export function SchemesCharacters() {
  return (
    <div className="schemes-characters">
      <div className="schemes-character-circle" />

      <Image
        src="/images/scheme-img.png"
        alt="Students exploring government schemes and benefits"
        width={1600}
        height={1024}
        priority
        className="schemes-characters-image"
      />

      {/* <div className="schemes-character-badge schemes-badge-government">
        <GovernmentSchemeIcon size={24} />
      </div> */}

      <div className="schemes-character-sparkle">✦</div>

      {/* <div className="schemes-character-badge schemes-badge-check">
        <CheckIcon size={24} />
      </div> */}

      {/* <div className="schemes-character-badge schemes-badge-money">
        ₹
      </div> */}
    </div>
  );
}