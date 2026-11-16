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
  exam: "JKSSB FAA 2026",
  headline: "Answer key is out.",
  detail: "Provisional key, all four series · objections 16–18 Nov, in person",
  stages: [
    { label: "Exam", status: "done" },
    { label: "Answer key", status: "done" },
    { label: "Objections", status: "current" },
    { label: "Result", status: "upcoming" },
  ],
  primaryCta: { href: "/tools/jkssb-faa-rank-predictor", label: "Predict my rank" },
  secondaryCta: { href: "/notifications/jkssb-faa-provisional-answer-key-2026", label: "Answer key & objections" },
};
