// The one thing most aspirants care about right now. Shown at the top of the
// homepage. Operator sessions edit this when a stage moves and commit.
// Set to `null` when nothing is hot; the homepage then leads with updates.

export type StageStatus = "done" | "current" | "upcoming";

export interface Spotlight {
  /** Short label for the exam, e.g. "JKSSB FAA 2026" */
  exam: string;
  /** What is true right now, in a few words. This is the headline. */
  headline: string;
  /** One line of context under the headline. */
  detail: string;
  stages: { label: string; status: StageStatus }[];
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
}

export const spotlight: Spotlight | null = {
  exam: "JK Police SI 2026",
  headline: "Exam on 29 November.",
  detail: "669 posts · admit cards from 26 Nov · 200 marks, OMR",
  stages: [
    { label: "Applied", status: "done" },
    { label: "Admit card", status: "current" },
    { label: "Exam", status: "upcoming" },
    { label: "Answer key", status: "upcoming" },
    { label: "Result", status: "upcoming" },
  ],
  primaryCta: { href: "/exams/sub-inspector#syllabus", label: "Syllabus & pattern" },
  secondaryCta: { href: "/tools/jk-police-sub-inspector-rank-predictor", label: "Rank predictor · 29 Nov" },
};
