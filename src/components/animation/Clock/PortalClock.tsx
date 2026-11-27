// File Location: shivanyams/src/components/animation/Clock/PortalClock.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: UI audit: custom live clock using React state/effect and PortalLanguageContext; no suitable SDK clock component. Paired CSS has responsive desktop/mobile date selectors. Added semantic time element; browser interval/locale verification remains pending.

"use client";

import "./../../../styles/legacy/components/animation/Clock/PortalClock.css";

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

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    year: "numeric",
  };
  const fullDate = new Intl.DateTimeFormat(locale, {
    ...dateOptions,
    weekday: "long",
    month: "long",
  }).format(now);
  const shortDate = new Intl.DateTimeFormat(locale, {
    ...dateOptions,
    weekday: language === "en" ? "short" : "long",
    month: language === "en" ? "short" : "long",
  }).format(now);

  return (
    <div className="portal-clock">
      <time className="portal-clock-time" dateTime={now.toISOString()} aria-label={time}>{time}</time>
      <div className="portal-clock-date portal-clock-date-desktop">{fullDate}</div>
      <div className="portal-clock-date portal-clock-date-mobile">{shortDate}</div>
    </div>
  );
}
