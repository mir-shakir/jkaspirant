// Scoring and rank estimation shared by the API and the UI. Pure functions, no I/O.
//
// How the estimate works
// ----------------------
// 1. PRIOR. Before anyone shares a score we already know roughly how JKSSB papers
//    behave: an expected score at a known rank (the "anchor", e.g. the likely
//    open-merit cut-off) and how spread out scores are. That gives a bell curve
//    of scores for everyone who appeared, so any score maps to a rank.
// 2. DATA. Shared scores tell us whether this paper ran easier or harder than
//    expected. They are a biased sample (people who did well share more), so we
//    correct for that and never trust them fully: the weight on data grows with
//    the number of scores but saturates.
// 3. FLOOR. If k people have shared a higher score, the rank cannot be better
//    than k + 1, whatever the curve says.
// The answer is always a range. It narrows as data arrives.

export interface Marking {
  totalQuestions: number;
  marksPerCorrect: number;
  negativePerWrong: number;
}

export interface RankModel {
  /** Expected score at `anchorRank` (e.g. likely open-merit cut-off). */
  anchorScore: number;
  anchorRank: number;
  /** Standard deviation of scores across everyone who appeared. */
  spread: number;
  /** How unsure we are about the anchor, in marks (1 sd). */
  uncertainty: number;
  /** How much higher sharers score than the average candidate, in sds. */
  selectionTilt: number;
}

export interface PredictExam extends Marking {
  posts: number;
  appeared: number;
  model: RankModel;
}

export interface ShareStats {
  total: number;
  above: number;
  catTotal: number;
  catAbove: number;
  histogram: { bucket: number; count: number }[];
}

export const BUCKET_WIDTH = 5;
/** Shared scores needed before they influence the estimate at all. */
export const MIN_SHARED_FOR_DATA = 10;
/** Self-reported scores are noisy: each counts as a fraction of a clean sample. */
const EFFECTIVE_SAMPLE_FRACTION = 0.25;
/** Bias we can never remove from a self-selected sample, as a share of spread. */
const SYSTEMATIC_ERROR = 0.35;

export function computeScore(exam: Marking, correct: number, wrong: number) {
  const raw = correct * exam.marksPerCorrect - wrong * exam.negativePerWrong;
  return Math.round(raw * 100) / 100;
}

export function validateCounts(exam: Marking, correct: unknown, wrong: unknown) {
  if (!Number.isInteger(correct) || !Number.isInteger(wrong)) return "Enter whole numbers";
  const c = correct as number;
  const w = wrong as number;
  if (c < 0 || w < 0) return "Numbers can't be negative";
  if (c + w > exam.totalQuestions) return `Correct + wrong can't be more than ${exam.totalQuestions}`;
  return null;
}

/** Standard normal CDF (Abramowitz–Stegun 7.1.26, |error| < 1.5e-7). */
export function normCdf(z: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Inverse standard normal CDF (Acklam's approximation). */
export function normInv(p: number) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const q = Math.min(Math.max(p, 1e-12), 1 - 1e-12);
  if (q < 0.02425) {
    const r = Math.sqrt(-2 * Math.log(q));
    return (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  }
  if (q > 1 - 0.02425) {
    const r = Math.sqrt(-2 * Math.log(1 - q));
    return -(((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  }
  const r = q - 0.5;
  const s = r * r;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
}

/** Median of binned scores, interpolating inside the bucket. Robust to junk entries. */
export function histogramMedian(histogram: ShareStats["histogram"]) {
  const sorted = [...histogram].sort((x, y) => x.bucket - y.bucket);
  const n = sorted.reduce((sum, h) => sum + h.count, 0);
  if (n === 0) return null;
  let seen = 0;
  for (const h of sorted) {
    if (seen + h.count >= n / 2) {
      return h.bucket + ((n / 2 - seen) / h.count) * BUCKET_WIDTH;
    }
    seen += h.count;
  }
  return null;
}

export type Verdict = "strong" | "likely" | "edge" | "unlikely";
export type Confidence = "early" | "improving" | "solid";

export interface Prediction {
  score: number;
  /** Honest uncertainty band: best case, most likely, worst case. Drives the verdict. */
  rank: { low: number; mid: number; high: number };
  /** The tight range shown to the user, centred on the most likely rank. */
  shown: { low: number; high: number };
  /** Share of candidates expected to score higher, in percent. */
  topPercent: number;
  /** Estimated score of the candidate at rank = posts. */
  cutoff: { low: number; mid: number; high: number };
  verdict: Verdict;
  confidence: Confidence;
  /** 0..1, how much shared scores (vs past patterns) drive the estimate. */
  dataWeight: number;
  shared: number;
}

export function predict(exam: PredictExam, score: number, stats: ShareStats | null): Prediction {
  const { model, appeared, posts } = exam;
  const sd = model.spread;

  // Prior: place the bell curve so that `anchorRank` lands on `anchorScore`.
  const zAnchor = normInv(1 - model.anchorRank / appeared);
  const priorMean = model.anchorScore - zAnchor * sd;
  const priorVar = model.uncertainty ** 2;

  // Data: where the shared scores say the centre is, after undoing selection bias.
  const shared = stats?.total ?? 0;
  const median = stats ? histogramMedian(stats.histogram) : null;
  let mean = priorMean;
  let variance = priorVar;
  let dataWeight = 0;
  if (median !== null && shared >= MIN_SHARED_FOR_DATA) {
    const dataMean = median - model.selectionTilt * sd;
    const dataVar = (SYSTEMATIC_ERROR * sd) ** 2 + (sd * sd) / (shared * EFFECTIVE_SAMPLE_FRACTION);
    // Precision-weighted blend of the two sources.
    dataWeight = (1 / dataVar) / (1 / priorVar + 1 / dataVar);
    mean = (1 - dataWeight) * priorMean + dataWeight * dataMean;
    variance = 1 / (1 / priorVar + 1 / dataVar);
  }
  const tau = Math.sqrt(variance);

  const rankAt = (centre: number) => 1 + appeared * (1 - normCdf((score - centre) / sd));
  const floor = (stats?.above ?? 0) + 1;
  const clamp = (r: number) => Math.min(appeared, Math.max(floor, Math.round(r)));
  const mid = clamp(rankAt(mean));
  // A harder paper (lower centre) means a better rank for the same score.
  const low = Math.min(mid, clamp(rankAt(mean - tau)));
  const high = Math.max(mid, clamp(rankAt(mean + tau)));

  const zPosts = normInv(1 - posts / appeared);
  const cutoffMid = mean + zPosts * sd;
  const round1 = (x: number) => Math.round(x * 2) / 2;

  let verdict: Verdict;
  if (high <= posts) verdict = "strong";
  else if (mid <= posts) verdict = "likely";
  else if (low <= posts) verdict = "edge";
  else verdict = "unlikely";

  const confidence: Confidence = dataWeight < 0.1 ? "early" : dataWeight < 0.3 ? "improving" : "solid";

  return {
    score,
    rank: { low, mid, high },
    shown: shownRange(mid, floor, appeared),
    topPercent: Math.max(0.01, Math.round(((mid - 1) / appeared) * 10000) / 100),
    cutoff: { low: round1(cutoffMid - tau), mid: round1(cutoffMid), high: round1(cutoffMid + tau) },
    verdict,
    confidence,
    dataWeight,
    shared,
  };
}

/**
 * The range people see: about 100 ranks wide near the top, where it matters,
 * and about 2% of the rank further down so it never claims silly precision.
 */
export function shownRange(mid: number, floor: number, appeared: number) {
  const width = mid <= 5000 ? 100 : Math.max(100, Math.round((mid * 0.02) / 100) * 100);
  const step = width > 100 ? 100 : 10;
  const low = Math.max(1, floor, Math.round((mid - width / 2) / step) * step);
  const high = Math.min(appeared, low === 1 ? width : low + width);
  return { low, high };
}

// Built at runtime because the project's TypeScript target predates the "u" flag.
const NOT_LETTER = new RegExp("[^\\p{L}]", "gu");

/** "Shakir Ahmad Mir" -> "S*** A***". Only this masked form is ever stored or shown. */
export function maskName(name: string) {
  const words = name
    .normalize("NFKC")
    .split(/\s+/)
    .map((w) => w.replace(NOT_LETTER, ""))
    .filter(Boolean)
    .slice(0, 2);
  if (words.length === 0) return null;
  return words.map((w) => `${Array.from(w)[0].toUpperCase()}***`).join(" ");
}

/** Round a rank the way a person would say it: 37 -> 35, 1,943 -> 1,900. */
export function niceRank(rank: number) {
  if (rank < 20) return rank;
  if (rank < 100) return Math.round(rank / 5) * 5;
  const magnitude = 10 ** (Math.floor(Math.log10(rank)) - 1);
  return Math.round(rank / magnitude) * magnitude;
}
