/* File Location: shivanyams/src/components/animation/Moon/Moon.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

import "./../../../styles/legacy/components/animation/Moon/Moon.css";

export function Moon() {
  return (
    <div className="moon">
      <div className="moon-crater crater-one" />
      <div className="moon-crater crater-two" />
      <div className="moon-crater crater-three" />
    </div>
  );
}