"use client";

import "./LandscapeTerrain.css";
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