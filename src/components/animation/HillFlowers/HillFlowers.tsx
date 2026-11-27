// File Location: shivanyams/src/components/animation/HillFlowers/HillFlowers.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
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