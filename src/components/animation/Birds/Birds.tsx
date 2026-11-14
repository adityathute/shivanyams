"use client";

import Image from "next/image";
import "./Birds.css";

type SceneTime = "dawn" | "day" | "sunset" | "night";

interface BirdsProps {
  scene: SceneTime;
}

function FlightParrot({
  className,
  priority = false,
}: {
  className: string;
  priority?: boolean;
}) {
  return (
    <div className={`bird-flight ${className}`}>
      <Image
        className="bird-flight-image"
        src="/images/birds/parrot-flight.png"
        alt=""
        width={180}
        height={130}
        sizes="(max-width: 760px) 52px, 86px"
        priority={priority}
        draggable={false}
      />
    </div>
  );
}

function BirdHome({ scene }: { scene: SceneTime }) {
  return (
    <div className={`bird-home bird-home-${scene}`}>
      <Image
        src="/images/birds/parrot-home.png"
        alt=""
        width={180}
        height={183}
        sizes="(max-width: 760px) 76px, 116px"
        priority={scene === "dawn" || scene === "night"}
        draggable={false}
      />
    </div>
  );
}

function PerchedParrot() {
  return (
    <div className="bird-perch">
      <Image
        src="/images/birds/parrot-perched.png"
        alt=""
        width={180}
        height={246}
        sizes="(max-width: 760px) 54px, 72px"
        draggable={false}
      />
    </div>
  );
}

export function Birds({ scene }: BirdsProps) {
  return (
    <div className={`birds birds-${scene}`} aria-hidden="true">
      <BirdHome scene={scene} />

      {scene === "day" && (
        <>
          <PerchedParrot />
          <FlightParrot className="day-parrot day-parrot-one" />
          <FlightParrot className="day-parrot day-parrot-two" />
        </>
      )}

      {scene === "dawn" && (
        <>
          <FlightParrot className="dawn-parrot dawn-parrot-one" priority />
          <FlightParrot className="dawn-parrot dawn-parrot-two" />
          <FlightParrot className="dawn-parrot dawn-parrot-three" />
        </>
      )}

      {scene === "sunset" && (
        <>
          <FlightParrot className="return-parrot return-parrot-one" />
          <FlightParrot className="return-parrot return-parrot-two" />
          <FlightParrot className="return-parrot return-parrot-three" />
        </>
      )}
    </div>
  );
}
