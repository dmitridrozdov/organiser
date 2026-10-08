export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Monday of the week containing `date`, at 00:00. */
export function getWeekStart(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(d, diffToMonday);
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
  const startLabel = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = weekEnd.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  const year = weekEnd.getFullYear();
  return `${startLabel} – ${endLabel}, ${year}`;
}

export function formatDayHeader(date: Date): { weekday: string; dayNum: string } {
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    dayNum: date.toLocaleDateString("en-US", { day: "numeric" }),
  };
}

export function formatHourLabel(hour: number): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric" });
}

export function formatTimeRange(startTime: number, durationMinutes: number): string {
  const start = new Date(startTime);
  const end = new Date(startTime + durationMinutes * 60_000);
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: d.getMinutes() ? "2-digit" : undefined });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function snap(minutes: number, step = 15): number {
  return Math.round(minutes / step) * step;
}

/** Combines a day (date part only) with a minutes-since-midnight offset into a timestamp. */
export function dayAndMinutesToTimestamp(day: Date, minutes: number): number {
  const d = startOfDay(day);
  const clamped = Math.max(0, Math.min(23 * 60 + 45, minutes));
  d.setMinutes(clamped);
  return d.getTime();
}

/** For <input type="date">. */
export function timestampToDateInput(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** For <input type="time">. */
export function timestampToTimeInput(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Combines a "YYYY-MM-DD" date input and "HH:MM" time input into a timestamp. */
export function dateAndTimeInputToTimestamp(dateValue: string, timeValue: string): number {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = (timeValue || "09:00").split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

export function isOverdue(startTime: number, durationMinutes: number, status: string): boolean {
  if (status === "done") return false;
  return startTime + durationMinutes * 60_000 < Date.now();
}
