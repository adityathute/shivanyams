/* File Location: shivanyams/src/components/animation/Sun/Sun.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

import "./../../../styles/legacy/components/animation/Sun/Sun.css";

export function Sun() {
  return (
    <div className="sun-orbit">
      <div className="sun-rays">
        <div className="sun" />
      </div>
    </div>
  );
}