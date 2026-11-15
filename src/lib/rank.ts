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
  /**
   * How far off the shared scores could still be after that correction, as a
   * share of `spread`. Higher means shared scores move the estimate less.
   */
  sampleDoubt: number;
}

/** Seats for one reservation category, and our starting guess of its share of candidates. */
export interface CategorySeats {
  posts: number;
  /** Rough share of all candidates in this category (0..1). Refined by the mix of shared scores. */
  share: number;
  /** How many marks lower this category scores on average than candidates overall. */
  gap: number;
}

export interface PredictExam extends Marking {
  posts: number;
  appeared: number;
  model: RankModel;
  /** Open-merit seats: filled by overall rank, whatever the candidate's category. */
  openSeats: number;
  /** Reserved categories. Anything not listed here (e.g. "OM") competes for open seats only. */
  reserved: Record<string, CategorySeats>;
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
  /** Estimated open-merit cut-off: score of the candidate at rank = openSeats. */
  cutoff: { low: number; mid: number; high: number };
  /** Seats the overall rank is measured against (open merit). */
  openSeats: number;
  /**
   * For reserved-category candidates: rank among their own category after the
   * open-merit list has been filled, against that category's seats.
   */
  category: null | {
    name: string;
    seats: number;
    rank: { low: number; mid: number; high: number };
    cutoff: { low: number; high: number };
  };
  /** Which list the most likely rank lands in. */
  seat: "open" | "category" | null;
  verdict: Verdict;
  confidence: Confidence;
  /** 0..1, how much shared scores (vs past patterns) drive the estimate. */
  dataWeight: number;
  shared: number;
}

export function predict(exam: PredictExam, score: number, stats: ShareStats | null, categoryName = "OM"): Prediction {
  const { model, appeared, openSeats } = exam;
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
    const dataVar = (model.sampleDoubt * sd) ** 2 + (sd * sd) / (shared * EFFECTIVE_SAMPLE_FRACTION);
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

  const round1 = (x: number) => Math.round(x * 2) / 2;
  const scoreAtRank = (rank: number) => mean + normInv(1 - Math.min(rank, appeared - 1) / appeared) * sd;
  const cutoffMid = scoreAtRank(openSeats);

  // Reserved categories. The top `openSeats` overall take open-merit seats
  // whatever their category, so they don't use up reserved seats. Whoever is
  // left competes inside their own category for its seats.
  const res = exam.reserved[categoryName];
  let category: Prediction["category"] = null;
  if (res) {
    // Share of candidates in this category: our starting guess, pulled towards
    // the mix seen in shared scores as they accumulate.
    const PRIOR_STRENGTH = 200;
    const share = stats ? (res.share * PRIOR_STRENGTH + stats.catTotal) / (PRIOR_STRENGTH + stats.total) : res.share;
    // Candidates of this category expected above a score, for a given paper difficulty.
    const aheadInCategory = (x: number, centre: number) => share * appeared * (1 - normCdf((x - (centre - res.gap)) / sd));
    // Rank inside the category once those who made the open-merit list are set aside.
    const catRank = (centre: number) => {
      const openCut = centre + normInv(1 - openSeats / appeared) * sd;
      return Math.max(1, Math.round(1 + aheadInCategory(score, centre) - aheadInCategory(Math.max(score, openCut), centre)));
    };
    // Score of the last candidate to get a category seat.
    const catCutoff = (centre: number) => {
      const openCut = centre + normInv(1 - openSeats / appeared) * sd;
      const tail = (res.posts + aheadInCategory(openCut, centre)) / (share * appeared);
      return centre - res.gap + normInv(1 - Math.min(tail, 0.999)) * sd;
    };
    const ranks = [catRank(mean - tau), catRank(mean), catRank(mean + tau)];
    category = {
      name: categoryName,
      seats: res.posts,
      rank: { low: Math.min(...ranks), mid: ranks[1], high: Math.max(...ranks) },
      cutoff: { low: round1(catCutoff(mean - tau)), high: round1(catCutoff(mean + tau)) },
    };
  }

  const qualifies = (overall: number, cat: number | undefined) => overall <= openSeats || (cat !== undefined && category !== null && cat <= category.seats);
  let verdict: Verdict;
  if (qualifies(high, category?.rank.high)) verdict = "strong";
  else if (qualifies(mid, category?.rank.mid)) verdict = "likely";
  else if (qualifies(low, category?.rank.low)) verdict = "edge";
  else verdict = "unlikely";
  const seat: Prediction["seat"] = mid <= openSeats ? "open" : category && category.rank.mid <= category.seats ? "category" : null;

  const confidence: Confidence = dataWeight < 0.1 ? "early" : dataWeight < 0.3 ? "improving" : "solid";

  return {
    score,
    rank: { low, mid, high },
    shown: shownRange(mid, floor, appeared),
    topPercent: Math.max(0.01, Math.round(((mid - 1) / appeared) * 10000) / 100),
    cutoff: { low: round1(cutoffMid - tau), mid: round1(cutoffMid), high: round1(cutoffMid + tau) },
    openSeats,
    category,
    seat,
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

/** "Shakir Ahmad Mir" -> "Sh*** Ah*** Mi***": first two letters of up to three names. */
export function maskName(name: string) {
  const words = cleanName(name).split(" ").filter(Boolean).slice(0, 3);
  if (words.length === 0) return null;
  return words
    .map((w) => {
      const letters = Array.from(w);
      return `${letters[0].toUpperCase()}${(letters[1] ?? "").toLowerCase()}***`;
    })
    .join(" ");
}

/** Letters and single spaces only, trimmed to a sensible length. */
export function cleanName(name: string) {
  return name
    .normalize("NFKC")
    .split(/\s+/)
    .map((w) => w.replace(NOT_LETTER, ""))
    .filter(Boolean)
    .join(" ")
    .slice(0, 60);
}

/** Round a rank the way a person would say it: 37 -> 35, 1,943 -> 1,900. */
export function niceRank(rank: number) {
  if (rank < 20) return rank;
  if (rank < 100) return Math.round(rank / 5) * 5;
  const magnitude = 10 ** (Math.floor(Math.log10(rank)) - 1);
  return Math.round(rank / magnitude) * magnitude;
}
