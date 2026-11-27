// File Location: shivanyams/src/components/animation/Stars/Stars.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Decorative star field; marked the visual root aria-hidden. No matching SDK animation component. Paired legacy CSS contains 35 individually positioned stars and twinkle animation; reduced-motion handling remains pending. Automated test coverage is not yet added for this file; visual/accessibility verification remains pending.

"use client";

import "./../../../styles/legacy/components/animation/Stars/Stars.css";

export function Stars() {
  return (
    <div className="stars" aria-hidden="true">
      {Array.from({ length: 35 }, (_, i) => (
        <span key={i} className={`star star-${i + 1}`} />
      ))}

      <i className="shooting-star" />
    </div>
  );
}