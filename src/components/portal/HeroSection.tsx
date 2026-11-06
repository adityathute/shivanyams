"use client";

import "./HeroSection.css";

import { useEffect, useState, type FormEvent } from "react";
import type { Language } from "shivanya-i18n";
import { usePortalLanguage } from "../portal/PortalLanguageContext";
import {
  baseDictionary,
  getBaseText,
} from "../../i18n/dictionaries/base";

type Props = {
  onSearch: (value: string) => void;
};

type SceneTime = "dawn" | "day" | "sunset" | "night";
type PreviewTime = SceneTime | "auto";

function getSceneTime(): SceneTime {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 18) return "day";
  if (hour >= 18 && hour < 19) return "sunset";

  return "night";
}

export function HeroSection({ onSearch }: Props) {
    const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const [value, setValue] = useState("");
  const [sceneTime, setSceneTime] = useState<SceneTime>(getSceneTime);
  const [preview, setPreview] = useState<PreviewTime>("auto");

  const activeScene = preview === "auto" ? sceneTime : preview;

  useEffect(() => {
    const updateScene = () => setSceneTime(getSceneTime());

    updateScene();

    const interval = window.setInterval(updateScene, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSearch(value);

    document.getElementById("updates")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const selectPreview = (scene: PreviewTime) => {
    setPreview(scene);
  };

  return (
    <section className={`hero scene-${activeScene}`}>
      <div className="hero-copy">
        <span className="eyebrow">{t("heroEyebrow")}</span>

        <h1>
          {t("heroTitleLine1")}
          <br />
          {t("heroTitleLine2")}
        </h1>

        <p>{t("heroDescription")}</p>

        <div className="scene-tester">
          <span className="scene-tester-label">Scene preview</span>

          {(
            [
              ["auto", "Auto"],
              ["dawn", "Sunrise"],
              ["day", "Day"],
              ["sunset", "Sunset"],
              ["night", "Night"],
            ] as const
          ).map(([scene, label]) => (
            <button
              key={scene}
              type="button"
              className={preview === scene ? "active" : ""}
              onClick={() => selectPreview(scene)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="sky-glow" />
        <div className="sky-horizon" />

        <div className="sun-orbit">
          <div className="sun-rays">
            <div className="sun" />
          </div>
        </div>

        <div className="moon">
          <div className="moon-crater crater-one" />
          <div className="moon-crater crater-two" />
          <div className="moon-crater crater-three" />
        </div>

        <div className="stars">
          {Array.from({ length: 35 }, (_, i) => (
            <i key={i} className={`star star-${i + 1}`} />
          ))}
        </div>

        <div className="cloud cloud-one">
          <span />
          <span />
          <span />
        </div>

        <div className="cloud cloud-two">
          <span />
          <span />
          <span />
        </div>

        <div className="cloud cloud-three">
          <span />
          <span />
          <span />
        </div>

        <div className="landscape">
          <div className="mountain mountain-back" />
          <div className="mountain mountain-middle" />

          <div className="building building-realistic">
            <svg
              className="government-building-svg"
              viewBox="0 0 800 480"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="gov-wall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8ead0" />
                  <stop offset="100%" stopColor="#c9aa7e" />
                </linearGradient>

                <linearGradient id="gov-column" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#b99a72" />
                  <stop offset="35%" stopColor="#fff0d6" />
                  <stop offset="70%" stopColor="#e5cba5" />
                  <stop offset="100%" stopColor="#ad8b62" />
                </linearGradient>

                <linearGradient id="gov-roof" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff3dc" />
                  <stop offset="100%" stopColor="#b99a72" />
                </linearGradient>

                <linearGradient id="gov-window" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3a596d" />
                  <stop offset="100%" stopColor="#172b3b" />
                </linearGradient>

                <linearGradient id="gov-step" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8d5b5" />
                  <stop offset="100%" stopColor="#a98a64" />
                </linearGradient>

                <filter id="gov-shadow">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
              </defs>

              {/* Foundation */}
              <rect x="90" y="385" width="620" height="25" fill="#a88b67" />
              <rect x="110" y="365" width="580" height="25" fill="#d5b891" />
              <rect x="130" y="345" width="540" height="25" fill="#e9d4b2" />

              {/* Main building body */}
              <rect
                x="155"
                y="205"
                width="510"
                height="145"
                fill="url(#gov-wall)"
              />

              {/* Side wings */}
              <rect x="75" y="250" width="110" height="100" fill="#d9bd95" />
              <rect x="635" y="250" width="110" height="100" fill="#d9bd95" />

              {/* Wing roof trim */}
              <rect x="65" y="238" width="130" height="15" fill="#f5e6cb" />
              <rect x="625" y="238" width="130" height="15" fill="#f5e6cb" />

              {/* Main roof */}
              <rect x="130" y="190" width="560" height="22" fill="#b99a72" />
              <rect
                x="115"
                y="177"
                width="590"
                height="15"
                fill="url(#gov-roof)"
              />

              {/* Roof decorative blocks */}
              {Array.from({ length: 18 }, (_, i) => (
                <rect
                  key={i}
                  x={155 + i * 28}
                  y="166"
                  width="13"
                  height="11"
                  fill="#ead5b4"
                />
              ))}

              {/* Central raised section */}
              <rect
                x="310"
                y="115"
                width="200"
                height="65"
                fill="url(#gov-wall)"
              />
              <rect x="295" y="105" width="230" height="12" fill="#b99a72" />
              <rect x="320" y="96" width="180" height="10" fill="#f5e6cb" />

              {/* Central dome */}
              <path
                d="M345 96 C345 48 380 20 410 12 C440 20 475 48 475 96 Z"
                fill="#d9bd94"
                stroke="#a98a62"
                strokeWidth="3"
              />

              <path
                d="M360 96 C360 58 385 35 410 28 C435 35 460 58 460 96"
                fill="none"
                stroke="#f5e6cb"
                strokeWidth="7"
              />

              <rect x="340" y="92" width="140" height="8" fill="#b99a72" />
              <rect x="406" y="7" width="8" height="12" fill="#8d704c" />
              <circle cx="410" cy="5" r="4" fill="#f1dfbd" />

              {/* Dome ribs */}
              {[-40, -25, -10, 10, 25, 40].map((offset) => (
                <path
                  key={offset}
                  d={`M410 28 Q${410 + offset} 60 ${410 + offset * 1.2} 94`}
                  fill="none"
                  stroke="#b99a72"
                  strokeWidth="2"
                />
              ))}

              {/* Upper windows */}
              {Array.from({ length: 5 }, (_, i) => (
                <g key={i}>
                  <rect
                    x={330 + i * 40}
                    y="125"
                    width="25"
                    height="48"
                    rx="12"
                    fill="url(#gov-window)"
                    stroke="#c8aa80"
                    strokeWidth="3"
                  />
                </g>
              ))}

              {/* Main facade windows */}
              {Array.from({ length: 9 }, (_, i) => (
                <g key={i}>
                  <rect
                    x={185 + i * 52}
                    y="220"
                    width="32"
                    height="83"
                    rx="15"
                    fill="url(#gov-window)"
                    stroke="#c1a17a"
                    strokeWidth="4"
                  />

                  <path
                    d={`M${201 + i * 52} 220 V303`}
                    stroke="#9fb4c0"
                    strokeWidth="2"
                    opacity=".6"
                  />

                  <rect
                    x={179 + i * 52}
                    y="303"
                    width="44"
                    height="7"
                    fill="#b99a72"
                  />
                </g>
              ))}

              {/* Entrance structure */}
              <rect x="355" y="250" width="110" height="110" fill="#b99a72" />

              <path
                d="M370 360 V300 A40 40 0 0 1 450 300 V360 Z"
                fill="url(#gov-window)"
                stroke="#f3dfbf"
                strokeWidth="6"
              />

              <path d="M410 260 V360" stroke="#d5b891" strokeWidth="3" />

              {/* Entrance pillars */}
              {[345, 465].map((x) => (
                <g key={x}>
                  <rect
                    x={x}
                    y="245"
                    width="15"
                    height="115"
                    fill="url(#gov-column)"
                  />
                  <rect
                    x={x - 4}
                    y="240"
                    width="23"
                    height="8"
                    fill="#f5e6cb"
                  />
                  <rect
                    x={x - 4}
                    y="358"
                    width="23"
                    height="8"
                    fill="#b99a72"
                  />
                </g>
              ))}

              {/* Front columns */}
              {[245, 295, 525, 575].map((x) => (
                <g key={x}>
                  <rect
                    x={x}
                    y="210"
                    width="13"
                    height="135"
                    fill="url(#gov-column)"
                  />
                  <rect
                    x={x - 4}
                    y="205"
                    width="21"
                    height="8"
                    fill="#f5e6cb"
                  />
                  <rect
                    x={x - 4}
                    y="343"
                    width="21"
                    height="8"
                    fill="#b99a72"
                  />
                </g>
              ))}

              {/* Entrance steps */}
              <path d="M330 360 H490 L510 380 H310 Z" fill="url(#gov-step)" />
              <path d="M305 380 H515 L535 400 H285 Z" fill="#c8a77e" />
              <path d="M280 400 H540 L560 420 H260 Z" fill="#e6d1ae" />
              <path d="M250 420 H570 L590 438 H230 Z" fill="#b99a72" />

              {/* Indian flag */}
              <rect x="550" y="65" width="4" height="100" fill="#8d704c" />
              <rect x="554" y="68" width="48" height="11" fill="#ff9933" />
              <rect x="554" y="79" width="48" height="11" fill="#ffffff" />
              <rect x="554" y="90" width="48" height="11" fill="#138808" />
              <circle cx="578" cy="84" r="3.5" fill="#000080" />

              {/* Wing windows */}
              {[100, 145, 655, 700].map((x) => (
                <g key={x}>
                  <rect
                    x={x}
                    y="270"
                    width="25"
                    height="58"
                    fill="url(#gov-window)"
                  />
                  <rect
                    x={x - 3}
                    y="266"
                    width="31"
                    height="5"
                    fill="#f5e6cb"
                  />
                </g>
              ))}
            </svg>
          </div>

          <div className="hill hill-back" />
          <div className="hill hill-front" />
        </div>

        <div className="scene-label">
          <span className="scene-label-dot" />
          {activeScene === "dawn" && "Good morning"}
          {activeScene === "day" && "Have a great day"}
          {activeScene === "sunset" && "Good evening"}
          {activeScene === "night" && "Good night"}
        </div>
      </div>
    </section>
  );
}
