// Pure scoring / rank-estimation helpers shared by the API and the UI.
import type { RankExamConfig } from "@/config/rank-predictor";

type Marking = Pick<RankExamConfig, "marksPerCorrect" | "negativePerWrong" | "totalQuestions">;

export const MIN_SUBMISSIONS_FOR_ESTIMATE = 30;
export const MIN_SUBMISSIONS_FOR_CUTOFF = 200;

export function computeScore(exam: Marking, correct: number, wrong: number) {
  const raw = correct * exam.marksPerCorrect - wrong * exam.negativePerWrong;
  return Math.round(raw * 100) / 100;
}

export function validateCounts(exam: Marking, correct: unknown, wrong: unknown) {
  if (!Number.isInteger(correct) || !Number.isInteger(wrong)) return "Enter whole numbers";
  const c = correct as number;
  const w = wrong as number;
  if (c < 0 || w < 0) return "Numbers can't be negative";
  if (c + w > exam.totalQuestions) return `Correct + wrong can't exceed ${exam.totalQuestions}`;
  return null;
}

/** Wilson score interval for a proportion (95%). */
export function wilson(successes: number, n: number, z = 1.96) {
  if (n === 0) return { low: 0, high: 1 };
  const p = successes / n;
  const denom = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return {
    low: Math.max(0, (centre - margin) / denom),
    high: Math.min(1, (centre + margin) / denom),
  };
}

export interface RankStats {
  total: number;
  above: number;
  catTotal: number;
  catAbove: number;
  cutoffScore: number | null;
  histogram: { bucket: number; count: number }[];
}

export type Chance = "strong" | "borderline" | "tough";

export interface RankEstimate {
  score: number;
  rankAmongSubmissions: number;
  categoryRankAmongSubmissions: number;
  percentile: number; // % of submitters you beat
  estimatedRank: { low: number; high: number } | null;
  chance: Chance | null;
  projectedCutoff: number | null;
}

export function estimateRank(exam: RankExamConfig, score: number, s: RankStats): RankEstimate {
  const rankAmongSubmissions = s.above + 1;
  const percentile = s.total > 0 ? Math.round(((s.total - s.above - 1) / s.total) * 1000) / 10 : 0;

  let estimatedRank: RankEstimate["estimatedRank"] = null;
  let chance: Chance | null = null;
  if (s.total >= MIN_SUBMISSIONS_FOR_ESTIMATE) {
    // Share of candidates scoring above you, with a confidence band, scaled to all who appeared.
    const ci = wilson(s.above, s.total);
    estimatedRank = {
      low: Math.max(1, Math.round(ci.low * exam.appeared) + 1),
      high: Math.max(1, Math.round(ci.high * exam.appeared) + 1),
    };
    // Submitters skew towards high scorers, so the true rank is usually better than this band.
    if (estimatedRank.high <= exam.posts) chance = "strong";
    else if (estimatedRank.low <= exam.posts * 2) chance = "borderline";
    else chance = "tough";
  }

  return {
    score,
    rankAmongSubmissions,
    categoryRankAmongSubmissions: s.catAbove + 1,
    percentile,
    estimatedRank,
    chance,
    projectedCutoff: s.total >= MIN_SUBMISSIONS_FOR_CUTOFF ? s.cutoffScore : null,
  };
}

/** How many submissions correspond to "posts" ranks when scaled from all appeared candidates. */
export function cutoffIndex(exam: RankExamConfig, totalSubmissions: number) {
  return Math.max(0, Math.round((exam.posts / exam.appeared) * totalSubmissions) - 1);
}
