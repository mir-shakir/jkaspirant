// The exams the site covers right now. Anything not listed here is hidden
// everywhere (lists, pages, search, updates), even if it exists in the database.
//
// An exam does not need a row in the database: without one it simply has no
// syllabus / papers / cut-offs tabs.
//
// Only facts we have confirmed are shown. Text fields from the database seed
// (pay scale, eligibility, description) are not displayed.
// Order here is the order on the site.

export interface LiveExam {
  title: string;
  board: "JKSSB" | "JKPSC";
  /** Confirmed number of posts. Leave out if not confirmed. */
  posts?: number;
  /** Where things stand, in a few words. Update when a stage moves. */
  status: string;
  /** True when the advertisement is out but no exam date has been announced. */
  awaited?: boolean;
  /** A hub page that groups other exams (shown as rows on its page). */
  parts?: string[];
  /** Keep the page but leave it out of exam lists (e.g. a hub whose parts are listed). */
  unlisted?: boolean;
}

export const liveExams: Record<string, LiveExam> = {
  "finance-accounts-assistant": {
    title: "Finance Accounts Assistant",
    board: "JKSSB",
    posts: 600,
    status: "Objections closed · final answer key awaited",
  },
  "sub-inspector": {
    title: "JK Police Sub-Inspector",
    board: "JKSSB",
    posts: 669,
    status: "Exam on 29 Nov",
  },
  "sub-inspector-telecom": {
    title: "JK Police Sub-Inspector (Telecommunication)",
    board: "JKSSB",
    posts: 104,
    status: "Exam on 23 Dec",
  },
  "constable-executive": {
    title: "JK Police Constable (Executive)",
    board: "JKSSB",
    posts: 1815,
    status: "Exam on 13 Dec",
  },
  "constable-armed-irp-sdrf": {
    title: "JK Police Constable (Armed/IRP & SDRF)",
    board: "JKSSB",
    posts: 487,
    status: "Exam on 20 Dec",
  },
  "constable-telecom-photographer": {
    title: "JK Police Constable (Telecom & Photographer)",
    board: "JKSSB",
    posts: 182,
    status: "Exams on 27 and 30 Dec",
  },
  "police-constable": {
    title: "JK Police Constable",
    board: "JKSSB",
    posts: 2484,
    status: "Three exams: 13, 20, 27 and 30 Dec",
    parts: ["constable-executive", "constable-armed-irp-sdrf", "constable-telecom-photographer"],
    unlisted: true,
  },
  "class-iv-mts": {
    title: "Class-IV (MTS) & Sanitation Worker",
    board: "JKSSB",
    posts: 2863,
    status: "Last date extended to 27 Nov · exam date awaited",
    awaited: true,
  },
  "advt-08-2026": {
    title: "Junior Pharmacist, Staff Nurse, Lab Assistant & more",
    board: "JKSSB",
    posts: 518,
    status: "Advt 08 of 2026 · form edit open till 20 Nov",
    awaited: true,
  },
  "junior-engineer-civil": {
    title: "Junior Engineer (Civil)",
    board: "JKSSB",
    posts: 458,
    status: "Apply 30 Nov – 29 Dec",
    awaited: true,
  },
  "junior-engineer-mechanical": {
    title: "Junior Engineer (Mechanical)",
    board: "JKSSB",
    posts: 127,
    status: "Apply 23 Nov – 22 Dec",
    awaited: true,
  },
};

export const liveExamSlugs = Object.keys(liveExams);

export function isLiveExam(slug: string | null | undefined) {
  return !!slug && slug in liveExams;
}
