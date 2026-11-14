
"use client";

import "./Birds.css";

type SceneTime = "dawn" | "day" | "sunset" | "night";

interface BirdsProps {
  scene: SceneTime;
}

function Parrot({ className }: { className: string }) {
  return (
    <div className={`parrot-flight ${className}`}>
      <svg
        className="parrot"
        viewBox="0 0 110 90"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="parrotBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8ce16a" />
            <stop offset="45%" stopColor="#35b95e" />
            <stop offset="100%" stopColor="#087341" />
          </linearGradient>

          <linearGradient id="parrotWing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#54c76b" />
            <stop offset="100%" stopColor="#08733d" />
          </linearGradient>

          <linearGradient id="parrotTail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#167a48" />
            <stop offset="50%" stopColor="#45c46a" />
            <stop offset="100%" stopColor="#087044" />
          </linearGradient>
        </defs>

        {/* Tail feathers */}
        <g className="parrot-tail">
          <path d="M38 48 Q23 65 10 87 Q31 76 47 53Z" fill="url(#parrotTail)" />
          <path d="M43 48 Q35 72 32 89 Q48 72 53 51Z" fill="#159453" />
          <path d="M47 48 Q47 69 51 84 Q60 65 55 48Z" fill="#79c94f" />
          <path d="M24 75 L42 53" stroke="#a2e17a" strokeWidth="1.2" opacity=".65" />
        </g>

        {/* Body */}
        <path
          d="M29 34 Q32 17 51 21 Q72 23 76 43
             Q79 60 58 66 Q36 67 29 49Z"
          fill="url(#parrotBody)"
        />

        {/* Chest */}
        <path
          d="M49 35 Q69 32 73 48 Q69 61 54 62
             Q43 56 49 35Z"
          fill="#a0d96c"
        />

        {/* Body feather details */}
        <path
          d="M49 47 Q57 43 66 47 M48 52 Q57 49 66 53"
          stroke="#d0ee91"
          strokeWidth="1.5"
          fill="none"
          opacity=".65"
          strokeLinecap="round"
        />

        {/* Main moving wing */}
        <g className="parrot-wing">
          <path
            d="M35 34 Q44 12 67 23
               Q83 31 75 48
               Q65 60 43 51Z"
            fill="url(#parrotWing)"
            stroke="#126c3d"
            strokeWidth="1.5"
          />

          {/* Individual flight feathers */}
          <g
            fill="none"
            stroke="#a2e17a"
            strokeWidth="2"
            strokeLinecap="round"
            opacity=".8"
          >
            <path d="M43 34 Q52 31 64 31" />
            <path d="M42 40 Q55 36 70 38" />
            <path d="M44 46 Q58 43 69 45" />
          </g>
        </g>

        {/* Neck ring */}
        <path
          d="M72 32 Q66 39 73 46"
          stroke="#e7d7a3"
          strokeWidth="2"
          fill="none"
          opacity=".9"
        />

        {/* Head */}
        <circle cx="77" cy="22" r="15" fill="#39ba5e" />

        {/* Head highlight */}
        <path
          d="M66 17 Q72 5 85 12"
          fill="none"
          stroke="#a4ed78"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Face patch */}
        <path
          d="M79 25 Q91 20 93 31 Q88 38 79 33Z"
          fill="#f3d85d"
        />

        {/* Beak */}
        <path
          d="M88 22 Q104 19 101 30
             Q97 39 87 33 Q91 28 88 22Z"
          fill="#e54b3c"
          stroke="#a72b25"
          strokeWidth="1"
        />

        <path
          d="M90 31 Q96 32 100 28"
          stroke="#86251f"
          strokeWidth="1"
          fill="none"
        />

        {/* Eye ring */}
        <circle cx="82" cy="18" r="4.4" fill="#f8edce" />
        <circle cx="83" cy="18" r="2.8" fill="#172b20" />
        <circle cx="84" cy="17" r="1" fill="white" />

        {/* Small feet */}
        <g
          fill="none"
          stroke="#9b6330"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M48 63 L47 69 L43 71 M47 69 L51 71" />
          <path d="M58 63 L58 69 L54 71 M58 69 L62 71" />
        </g>
      </svg>
    </div>
  );
}

function SmallBird({ className }: { className: string }) {
  return (
    <svg
      className={`small-bird ${className}`}
      viewBox="0 0 50 30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="small-bird-wing"
        d="M3 16 Q13 2 25 15 Q37 2 47 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Birds({ scene }: BirdsProps) {
  if (scene === "night") return null;

  return (
    <div className={`birds birds-${scene}`} aria-hidden="true">
      {scene === "dawn" && (
        <>
          <Parrot className="parrot-one" />
          <Parrot className="parrot-two" />
          <Parrot className="parrot-three" />
        </>
      )}

      {scene === "day" && (
        <div className="day-flock">
          <SmallBird className="day-bird-one" />
          <SmallBird className="day-bird-two" />
          <SmallBird className="day-bird-three" />
          <SmallBird className="day-bird-four" />
        </div>
      )}

      {scene === "sunset" && (
        <>
          <Parrot className="parrot-one" />
          <Parrot className="parrot-two" />
          <Parrot className="parrot-three" />
        </>
      )}
    </div>
  );
}
