// File Location: shivanyams/src/components/portal/utils/job-deadline.ts
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Shared application-deadline resolver and status formatter. Corrected strict calendar-date validation and timezone/DST-safe calendar-day comparison; invalid date values now format as empty. Unit tests still need to be added.

import type { Item } from "../data/portal-data";

export type JobDeadlineStatus = "urgent" | "soon" | "open" | "expired";

export function getJobApplicationDeadline(item: Item): string {
  const applicationEnd = item.important_dates?.find(
    (entry) => entry.date_type === "application_end",
  );

  if (applicationEnd) {
    if (
      applicationEnd.date_format === "revised" ||
      applicationEnd.date_format === "revised_with_time"
    ) {
      return applicationEnd.new_date || applicationEnd.date || applicationEnd.end_date || "";
    }
    if (applicationEnd.date_format === "range") {
      return applicationEnd.end_date || applicationEnd.date || "";
    }
    return applicationEnd.date || applicationEnd.end_date || "";
  }

  return item.end_date || "";
}

function parseCalendarDate(value: string): { year: number; month: number; day: number } | null {
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    !year ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;

  return { year, month, day };
}

export function getJobDeadlineStatus(dateValue: string): JobDeadlineStatus {
  const deadlineParts = parseCalendarDate(dateValue);
  if (!deadlineParts) return "expired";

  const today = new Date();
  const deadlineDay = Date.UTC(
    deadlineParts.year,
    deadlineParts.month - 1,
    deadlineParts.day,
  );
  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const daysRemaining = Math.round((deadlineDay - todayDay) / 86400000);

  if (daysRemaining === 0) return "urgent";
  if (daysRemaining >= 1 && daysRemaining <= 3) return "soon";
  if (daysRemaining >= 4) return "open";
  return "expired";
}

export function formatJobApplicationDeadline(dateValue: string): string {
  const date = parseCalendarDate(dateValue);
  if (!date) return "";

  return [
    String(date.day).padStart(2, "0"),
    String(date.month).padStart(2, "0"),
    String(date.year),
  ].join("/");
}
