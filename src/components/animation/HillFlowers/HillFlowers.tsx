"use client";

import "./HillFlowers.css";

export function HillFlowers() {
  return (
    <div className="hill-flowers">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className={`hill-flower flower-${i + 1}`} />
      ))}
    </div>
  );
}