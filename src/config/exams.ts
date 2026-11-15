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
}

export const liveExams: Record<string, LiveExam> = {
  "finance-accounts-assistant": {
    title: "Finance Accounts Assistant",
    board: "JKSSB",
    posts: 600,
    status: "Exam held 15 Nov · answer key awaited",
  },
  "sub-inspector": {
    title: "JK Police Sub-Inspector",
    board: "JKSSB",
    status: "Exam on 29 Nov",
  },
  "police-constable": {
    title: "JK Police Constable",
    board: "JKSSB",
    status: "Exams on 13, 20 and 27 Dec",
  },
  "class-iv-mts": {
    title: "Class-IV (MTS) & Sanitation Worker",
    board: "JKSSB",
    posts: 2863,
    status: "Applications closed 12 Nov · exam date awaited",
    awaited: true,
  },
  "advt-08-2026": {
    title: "Advertisement 08 of 2026 (various posts)",
    board: "JKSSB",
    posts: 518,
    status: "Applications closed · exam dates awaited",
    awaited: true,
  },
};

export const liveExamSlugs = Object.keys(liveExams);

export function isLiveExam(slug: string | null | undefined) {
  return !!slug && slug in liveExams;
}
