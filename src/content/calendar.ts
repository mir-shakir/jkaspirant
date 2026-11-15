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
  /** Exam this belongs to (a key of liveExams) */
  examSlug?: string;
  href?: string;
}

const SI_UPDATE = "/notifications/jkssb-sub-inspector-exam-date-2026";

export const calendarEvents: CalendarEvent[] = [
  { date: "2026-11-15", title: "Accounts Assistant (Finance) exam", board: "JKSSB", kind: "exam", examSlug: "finance-accounts-assistant", href: "/notifications/jkssb-faa-exam-held-answer-key-awaited-2026" },
  { date: "2026-11-22", title: "Sub-Inspector admit card", board: "JKSSB", kind: "admit_card", examSlug: "sub-inspector", tentative: true, href: SI_UPDATE },
  { date: "2026-11-29", title: "Sub-Inspector exam", board: "JKSSB", kind: "exam", examSlug: "sub-inspector", href: SI_UPDATE },
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

export function nextEventForExam(examSlug: string) {
  return upcomingEvents().find((e) => e.examSlug === examSlug) ?? null;
}

export function relativeDay(date: string) {
  const d = daysUntil(date);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d > 1) return `In ${d} days`;
  if (d === -1) return "Yesterday";
  return `${-d} days ago`;
}
