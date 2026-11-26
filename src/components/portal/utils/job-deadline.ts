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

export function getJobDeadlineStatus(dateValue: string): JobDeadlineStatus {
  const [year, month, day] = dateValue.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "expired";

  const deadline = new Date(year, month - 1, day);
  if (
    deadline.getFullYear() !== year ||
    deadline.getMonth() !== month - 1 ||
    deadline.getDate() !== day
  ) return "expired";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.round((deadline.getTime() - today.getTime()) / 86400000);

  if (daysRemaining === 0) return "urgent";
  if (daysRemaining >= 1 && daysRemaining <= 3) return "soon";
  if (daysRemaining >= 4) return "open";
  return "expired";
}

export function formatJobApplicationDeadline(dateValue: string): string {
  const [year, month, day] = dateValue.slice(0, 10).split("-");
  return year && month && day ? [day, month, year].join("/") : "";
}
