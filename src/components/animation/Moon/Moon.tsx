// File Location: shivanyams/src/components/animation/Moon/Moon.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Decorative moon and crater artwork; marked the visual root aria-hidden. No matching SDK animation component. Paired legacy CSS contains repeated mobile overrides and needs consolidation. Automated test coverage is not yet added for this file; visual/accessibility verification remains pending.

"use client";

import "./../../../styles/legacy/components/animation/Moon/Moon.css";

export function Moon() {
  return (
    <div className="moon" aria-hidden="true">
      <div className="moon-crater crater-one" />
      <div className="moon-crater crater-two" />
      <div className="moon-crater crater-three" />
    </div>
  );
}