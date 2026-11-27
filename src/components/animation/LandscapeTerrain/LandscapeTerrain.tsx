/* File Location: shivanyams/src/components/animation/LandscapeTerrain/LandscapeTerrain.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
"use client";

import "./../../../styles/legacy/components/animation/LandscapeTerrain/LandscapeTerrain.css";
// import { HillFlowers } from "../HillFlowers/HillFlowers";

export function LandscapeTerrain() {
  return (
    <>
      <div className="mountain mountain-back" />
      <div className="mountain mountain-middle" />

      <div className="hill hill-back" />

      <div className="hill hill-front">
        {/* <HillFlowers /> */}
      </div>
    </>
  );
}