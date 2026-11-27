/* File Location: shivanyams/src/components/animation/Stars/Stars.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

import "./../../../styles/legacy/components/animation/Stars/Stars.css";

export function Stars() {
  return (
    <div className="stars">
      {Array.from({ length: 35 }, (_, i) => (
        <span key={i} className={`star star-${i + 1}`} />
      ))}

      <i className="shooting-star" />
    </div>
  );
}