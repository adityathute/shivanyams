// File Location: shivanyams/src/components/animation/Clouds/Clouds.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: UI audit: three decorative custom CSS cloud elements; no SDK component is appropriate. Paired CSS has cloud positioning, scene variants and drift animation. Reduced-motion handling is added in paired CSS; legacy migration remains pending.

"use client";

import "./../../../styles/legacy/components/animation/Clouds/Clouds.css";

export function Clouds() {
  return (
    <>
      <div className="cloud cloud-one">
        <span />
        <span />
        <span />
      </div>

      <div className="cloud cloud-two">
        <span />
        <span />
        <span />
      </div>

      <div className="cloud cloud-three">
        <span />
        <span />
        <span />
      </div>
    </>
  );
}