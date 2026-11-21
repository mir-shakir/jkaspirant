// Frozen results of a rank predictor after it closes: what people shared, saved at
// closing time so the page stays fast and never changes underneath. Made from the
// score_submissions table (see CLAUDE.md, "Closing a rank tool").
import faa2026 from "./jkssb-faa-2026.json";

export interface RankSnapshot {
  examKey: string;
  closedOn: string;
  lastScoreAt: string;
  total: number;
  networks: number;
  fromAnswerKey: number;
  onLeaderboard: number;
  byDay: [string, number][];
  histogram: { bucket: number; count: number }[];
  catCounts: Record<string, number>;
  catMedian: Record<string, number>;
  median: number;
  p90: number;
  avgCorrect: number;
  avgWrong: number;
  excludedAsFake: number;
  board: { name: string; score: number; category: string }[];
}

const all = [faa2026] as unknown as RankSnapshot[];

export function getRankSnapshot(examKey: string): RankSnapshot | null {
  return all.find((s) => s.examKey === examKey) ?? null;
}
