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
  headline: "Exam done. Answer key awaited.",
  detail: "Held 15 Nov · 600 posts · 1.61 lakh registered",
  stages: [
    { label: "Exam", status: "done" },
    { label: "Answer key", status: "current" },
    { label: "Objections", status: "upcoming" },
    { label: "Result", status: "upcoming" },
  ],
  primaryCta: { href: "/tools/jkssb-faa-rank-predictor", label: "Predict my rank" },
  secondaryCta: { href: "/notifications/jkssb-faa-exam-held-answer-key-awaited-2026", label: "What happens next" },
};
