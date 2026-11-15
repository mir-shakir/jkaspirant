// The exams the site covers right now. Anything not listed here is hidden
// everywhere (lists, pages, search, updates), even if it exists in the database.
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
};

export const liveExamSlugs = Object.keys(liveExams);

export function isLiveExam(slug: string | null | undefined) {
  return !!slug && slug in liveExams;
}
