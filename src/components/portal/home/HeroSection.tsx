"use client";

import "./HeroSection.css";

import { PortalClock } from "../../animation/Clock/PortalClock";
import { useEffect, useState } from "react";
import type { Language } from "shivanya-i18n";
import { usePortalLanguage } from "../context/PortalLanguageContext";
import { baseDictionary, getBaseText } from "../../../i18n/dictionaries/base";
import { LandscapeTerrain } from "../../animation/LandscapeTerrain/LandscapeTerrain";
import { BanyanTree } from "../../animation/BanyanTree/BanyanTree";
import { GovernmentBuilding } from "../../animation/GovernmentBuilding/GovernmentBuilding";
import { Stars } from "../../animation/Stars/Stars";
import { Sun } from "../../animation/Sun/Sun";
import { Moon } from "../../animation/Moon/Moon";
import { Clouds } from "../../animation/Clouds/Clouds";

type SceneTime = "dawn" | "day" | "sunset" | "night";
type PreviewTime = SceneTime | "auto";

function getSceneTime(): SceneTime {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 18) return "day";
  if (hour >= 18 && hour < 19) return "sunset";

  return "night";
}

const ENABLE_SCENE_TESTER = true; // Set to true to enable the scene tester dropdown for testing different scenes

export function HeroSection() {
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) =>
    getBaseText(key, language as Language);

  const [sceneTime, setSceneTime] = useState<SceneTime>(getSceneTime);
  const [preview, setPreview] = useState<PreviewTime>("auto");

  const activeScene = preview === "auto" ? sceneTime : preview;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSceneTime(getSceneTime());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className={`hero scene-${activeScene}`}>
      {ENABLE_SCENE_TESTER && (
        <div className="scene-tester">
          <select
            value={preview}
            onChange={(event) => setPreview(event.target.value as PreviewTime)}
            aria-label="Preview scene"
          >
            <option value="auto">Auto</option>
            <option value="dawn">Sunrise</option>
            <option value="day">Day</option>
            <option value="sunset">Sunset</option>
            <option value="night">Night</option>
          </select>
        </div>
      )}

      <div className="hero-copy">
        <span className="eyebrow">{t("heroEyebrow")}</span>

        <h1>
          {t("heroTitleLine1")}
          <br />
          {t("heroTitleLine2")}
        </h1>

        <p>{t("heroDescription")}</p>
        <PortalClock />
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="sky-glow" />
        <div className="sky-horizon" />

        <Sun />
        <Moon />
        <Stars />
        <Clouds />

        <div className="landscape">
          <LandscapeTerrain />

          <GovernmentBuilding />

          <div className="banyan-tree">
            <BanyanTree />
          </div>
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
