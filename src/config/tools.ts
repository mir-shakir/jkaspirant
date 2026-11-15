import { rankExams } from "./rank-predictor";

export interface ToolEntry {
  href?: string;
  kicker: string;
  title: string;
  description: string;
  soon?: boolean;
}

export const tools: ToolEntry[] = [
  ...rankExams
    .filter((e) => e.isOpen)
    .map((e) => ({
      href: `/tools/${e.toolSlug}`,
      kicker: `${e.board} · ${e.name}`,
      title: `${e.name} score & rank predictor`,
      description: `Work out your score with ${e.negativePerWrong} negative marking and see where you stand among other aspirants.`,
    })),
  {
    kicker: "Eligibility",
    title: "Age & eligibility checker",
    description: "Check your age on the notification cut-off date, with J&K category relaxations.",
    soon: true,
  },
];
