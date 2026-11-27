import { addDays, addMonths, differenceInCalendarDays, format, formatDistanceToNowStrict, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";

export { addDays, addMonths, startOfDay };

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "–";
  return format(new Date(d), "d MMM yyyy", { locale: tr });
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "–";
  return format(new Date(d), "d MMM yyyy HH:mm", { locale: tr });
}

const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

export function timeAgo(d: Date | string, now = new Date()): string {
  const diffSec = Math.round((new Date(d).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), "day");
  return formatDate(d);
}

export function daysUntil(d: Date | string, now = new Date()): number {
  return differenceInCalendarDays(new Date(d), now);
}

export function distanceFromNow(d: Date | string): string {
  return formatDistanceToNowStrict(new Date(d), { locale: tr });
}
