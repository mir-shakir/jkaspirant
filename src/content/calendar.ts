// Dated events shown under "Coming up" on the homepage and on /calendar.
// Past events drop off the homepage automatically. Only add dates that an
// official notice has announced; mark anything not final as tentative.

export interface CalendarEvent {
  /** ISO date (IST) */
  date: string;
  title: string;
  board: "JKSSB" | "JKPSC";
  kind: "exam" | "admit_card" | "deadline" | "result";
  /** Short qualifier shown under the title */
  note?: string;
  tentative?: boolean;
  href?: string;
}

const POLICE_UPDATE = "/notifications/jkssb-police-si-constable-exam-dates-2026";

export const calendarEvents: CalendarEvent[] = [
  { date: "2026-11-15", title: "Accounts Assistant (Finance) exam", board: "JKSSB", kind: "exam", note: "600 posts", href: "/notifications/jkssb-faa-exam-held-answer-key-awaited-2026" },
  { date: "2026-11-22", title: "Sub-Inspector admit card", board: "JKSSB", kind: "admit_card", note: "About 7 days before the exam", tentative: true, href: POLICE_UPDATE },
  { date: "2026-11-29", title: "Sub-Inspector exam", board: "JKSSB", kind: "exam", note: "Notification 02 of 2024", href: POLICE_UPDATE },
  { date: "2026-12-13", title: "Constable (Executive) exam", board: "JKSSB", kind: "exam", note: "Notification 12 of 2025", href: POLICE_UPDATE },
  { date: "2026-12-20", title: "Constable (Armed / IRP / SDRF) exam", board: "JKSSB", kind: "exam", note: "Notification 14 of 2025", href: POLICE_UPDATE },
  { date: "2026-12-23", title: "Sub-Inspector (Telecom) exam", board: "JKSSB", kind: "exam", note: "Notification 11 of 2025", href: POLICE_UPDATE },
  { date: "2026-12-27", title: "Constable (Telecom) exam", board: "JKSSB", kind: "exam", note: "Notification 15 of 2025", href: POLICE_UPDATE },
  { date: "2026-12-30", title: "Constable (Photographer) exam", board: "JKSSB", kind: "exam", note: "Notification 15 of 2025", href: POLICE_UPDATE },
];

/** Today's date in IST as YYYY-MM-DD. */
export function todayIST(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function daysUntil(date: string, today: string = todayIST()) {
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}

export function upcomingEvents(limit?: number) {
  const today = todayIST();
  const list = calendarEvents.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  return limit ? list.slice(0, limit) : list;
}

export function relativeDay(date: string) {
  const d = daysUntil(date);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d > 1) return `In ${d} days`;
  if (d === -1) return "Yesterday";
  return `${-d} days ago`;
}
