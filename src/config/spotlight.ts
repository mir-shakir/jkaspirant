// Homepage spotlight: the exam most aspirants care about right now.
// Operator sessions edit this when stages move (answer key out, result out) and commit.

export type StageStatus = "done" | "current" | "upcoming";

export interface Spotlight {
  kicker: string;
  title: string;
  facts: string[];
  stages: { label: string; date?: string; status: StageStatus }[];
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
}

export const spotlight: Spotlight | null = {
  kicker: "Exam in focus",
  title: "JKSSB Finance Accounts Assistant 2026",
  facts: ["Exam held 15 Nov", "600 posts", "~1.5 lakh appeared"],
  stages: [
    { label: "Exam", date: "15 Nov", status: "done" },
    { label: "Answer key", date: "Awaited", status: "current" },
    { label: "Objections", status: "upcoming" },
    { label: "Result", status: "upcoming" },
  ],
  primaryCta: { href: "/tools/jkssb-faa-rank-predictor", label: "Check your expected rank" },
  secondaryCta: { href: "/exams/finance-accounts-assistant", label: "FAA exam hub" },
};
