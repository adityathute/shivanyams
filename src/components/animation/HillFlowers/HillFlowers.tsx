// File Location: shivanyams/src/components/animation/HillFlowers/HillFlowers.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: UI audit: four decorative spans using feature-scoped custom CSS; no matching SDK component. Paired CSS uses pseudo-elements, per-flower variables and responsive rules. Reduced-motion transition handling is added; legacy migration remains pending.

"use client";

import "./../../../styles/legacy/components/animation/HillFlowers/HillFlowers.css";

export function HillFlowers() {
  return (
    <div className="hill-flowers">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className={`hill-flower flower-${i + 1}`} />
      ))}
    </div>
  );
}