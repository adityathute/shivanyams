// File Location: shivanyams/src/components/animation/Sun/Sun.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Decorative sun and ray artwork; marked the visual root aria-hidden. No matching SDK animation component. Paired legacy CSS includes pulsing animation and responsive scene rules; reduced-motion handling remains pending. Automated test coverage is not yet added for this file; visual/accessibility verification remains pending.

"use client";

import "./../../../styles/legacy/components/animation/Sun/Sun.css";

export function Sun() {
  return (
    <div className="sun-orbit" aria-hidden="true">
      <div className="sun-rays">
        <div className="sun" />
      </div>
    </div>
  );
}