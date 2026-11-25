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

const CONSTABLE_UPDATE = "/notifications/jkssb-police-constable-exam-dates-2026";
const SI_UPDATE = "/notifications/jkssb-sub-inspector-exam-date-2026";
const SI_ADMIT_UPDATE = "/notifications/jkssb-sub-inspector-admit-card-2026";

const MTS_UPDATE = "/notifications/jkssb-class-iv-mts-last-date-extended-2026";
const JE_MECH_UPDATE = "/notifications/jkssb-junior-engineer-mechanical-apply-dates-2026";
const JE_CIVIL_UPDATE = "/notifications/jkssb-junior-engineer-civil-notification-2026";
const ADVT04_UPDATE = "/notifications/jkssb-advt-04-2026-apply-dates";
const FAA_KEY_UPDATE = "/notifications/jkssb-faa-provisional-answer-key-2026";

export const calendarEvents: CalendarEvent[] = [
  { date: "2026-11-15", title: "Accounts Assistant (Finance) exam", board: "JKSSB", kind: "exam", examSlug: "finance-accounts-assistant", href: "/notifications/jkssb-faa-exam-held-answer-key-awaited-2026" },
  { date: "2026-11-16", title: "FAA answer key objections open", board: "JKSSB", kind: "deadline", note: "Three working days, in person", examSlug: "finance-accounts-assistant", href: FAA_KEY_UPDATE },
  { date: "2026-11-18", title: "FAA objections: last day", board: "JKSSB", kind: "deadline", note: "Third working day from 16 Nov", examSlug: "finance-accounts-assistant", tentative: true, href: FAA_KEY_UPDATE },
  { date: "2026-11-20", title: "Junior Pharmacist, Staff Nurse & more: last day to edit form", board: "JKSSB", kind: "deadline", note: "Advt 08 of 2026 · 11:59 PM", examSlug: "advt-08-2026", href: "/notifications/jkssb-advt-08-2026-edit-option" },
    { date: "2026-11-23", title: "Junior Engineer (Mechanical): applications open", board: "JKSSB", kind: "deadline", examSlug: "junior-engineer-mechanical", href: JE_MECH_UPDATE },
  { date: "2026-11-26", title: "Sub-Inspector admit card", board: "JKSSB", kind: "admit_card", note: "On jkssb.nic.in", examSlug: "sub-inspector", href: SI_ADMIT_UPDATE },
  { date: "2026-11-27", title: "Class-IV (MTS): last date to apply", board: "JKSSB", kind: "deadline", examSlug: "class-iv-mts", href: MTS_UPDATE },
  { date: "2026-11-29", title: "Sub-Inspector exam", board: "JKSSB", kind: "exam", examSlug: "sub-inspector", href: SI_UPDATE },
  { date: "2026-11-30", title: "Junior Engineer (Civil): applications open", board: "JKSSB", kind: "deadline", examSlug: "junior-engineer-civil", href: JE_CIVIL_UPDATE },
  { date: "2026-12-13", title: "Constable (Executive) exam", board: "JKSSB", kind: "exam", examSlug: "constable-executive", href: CONSTABLE_UPDATE },
  { date: "2026-12-16", title: "Machineman, Binder, Head Weaver & more: applications open", board: "JKSSB", kind: "deadline", note: "Advt 04 of 2026 · 130 posts", href: ADVT04_UPDATE },
  { date: "2026-12-20", title: "Constable (Armed / IRP / SDRF) exam", board: "JKSSB", kind: "exam", examSlug: "constable-armed-irp-sdrf", href: CONSTABLE_UPDATE },
  { date: "2026-12-22", title: "Junior Engineer (Mechanical): last date to apply", board: "JKSSB", kind: "deadline", note: "11:59 PM", examSlug: "junior-engineer-mechanical", href: JE_MECH_UPDATE },
  { date: "2026-12-23", title: "Sub-Inspector (Telecommunication) exam", board: "JKSSB", kind: "exam", examSlug: "sub-inspector-telecom", href: CONSTABLE_UPDATE },
  { date: "2026-12-27", title: "Constable (Telecommunication) exam", board: "JKSSB", kind: "exam", examSlug: "constable-telecom-photographer", href: CONSTABLE_UPDATE },
  { date: "2026-12-29", title: "Junior Engineer (Civil): last date to apply", board: "JKSSB", kind: "deadline", examSlug: "junior-engineer-civil", href: JE_CIVIL_UPDATE },
  { date: "2026-12-30", title: "Constable (Photographer) exam", board: "JKSSB", kind: "exam", examSlug: "constable-telecom-photographer", href: CONSTABLE_UPDATE },
  { date: "2027-01-14", title: "Machineman, Binder, Head Weaver & more: last date to apply", board: "JKSSB", kind: "deadline", note: "Advt 04 of 2026 · 11:59 PM", href: ADVT04_UPDATE },
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
