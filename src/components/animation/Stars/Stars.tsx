"use client";

import "./Stars.css";

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