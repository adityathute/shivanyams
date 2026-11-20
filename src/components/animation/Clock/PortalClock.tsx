"use client";

import "./PortalClock.css";

import { useEffect, useState } from "react";
import { usePortalLanguage } from "../../portal/context/PortalLanguageContext";

type ClockLanguage = "en" | "mr" | "hi";

const LOCALES: Record<ClockLanguage, string> = {
  en: "en-IN",
  mr: "mr-IN",
  hi: "hi-IN",
};

export function PortalClock() {
  const { language } = usePortalLanguage();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());

    update();

    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (!now) return null;

  const locale = LOCALES[language as ClockLanguage] ?? LOCALES.en;

  const hours = now.getHours();
  const hour12 = hours % 12 || 12;

  const hoursText = String(hour12).padStart(2, "0");
  const minutesText = String(now.getMinutes()).padStart(2, "0");
  const secondsText = String(now.getSeconds()).padStart(2, "0");

  const period = hours >= 12 ? "pm" : "am";

  const time = `${hoursText}:${minutesText}:${secondsText} ${period}`;

  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="portal-clock">
      <div className="portal-clock-time">{time}</div>
      <div className="portal-clock-date">{date}</div>
    </div>
  );
}
