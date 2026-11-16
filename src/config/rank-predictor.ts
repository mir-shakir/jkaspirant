// Rank predictor configuration. One entry per exam.
// Operator sessions update these values and commit; no database change needed.
import type { CategorySeats, RankModel } from "@/lib/rank";

export interface RankExamConfig {
  /** URL slug: /tools/<toolSlug> */
  toolSlug: string;
  /** Key stored with every submission */
  examKey: string;
  examSlug: string; // links to /exams/<examSlug>
  name: string; // short display name
  fullName: string;
  board: "JKSSB" | "JKPSC";
  examDate: string; // ISO date
  totalQuestions: number;
  marksPerCorrect: number;
  negativePerWrong: number;
  posts: number;
  /** Candidates registered (from official / press figures). */
  registered: number;
  /** Best estimate of candidates who actually sat the paper. */
  appeared: number;
  categories: string[];
  /** Open-merit seats, filled by overall rank whatever the category. */
  openSeats: number;
  /** Reserved seats per category, with a rough share of candidates in each. */
  reserved: Record<string, CategorySeats>;
  /**
   * The starting assumptions for rank estimates. Tune as better information
   * arrives; once the official result is out, set anchorScore to the real
   * cut-off and uncertainty to ~1 so predictions lock on to it.
   */
  model: RankModel;
  /** Scores above this are kept off the public leaderboard (obvious fakes). */
  leaderboardMaxScore: number;
  answerKeyReleased: boolean;
  /** Link to the official answer key, shown on the tool once it is out. */
  answerKeyUrl?: string;
  /** Pattern confirmed against the official notification */
  patternVerified: boolean;
  /**
   * False before the exam: the tool page is a score calculator only and nothing
   * is saved. Flip to true on exam evening, after tuning `model` and `appeared`.
   */
  isOpen: boolean;
  /** Shown while closed, e.g. "29 Nov, after the exam". */
  opensOn?: string;
}

// J&K vertical reservation categories, as in Annexure-A of the FAA notification.
const JK_CATEGORIES = ["OM", "SC", "ST-1", "ST-2", "OBC", "ALC/IB", "RBA", "EWS"];

export const rankExams: RankExamConfig[] = [
  {
    toolSlug: "jkssb-faa-rank-predictor",
    examKey: "jkssb-faa-2026",
    examSlug: "finance-accounts-assistant",
    name: "FAA",
    fullName: "JKSSB Finance Accounts Assistant",
    board: "JKSSB",
    examDate: "2026-11-15",
    totalQuestions: 120,
    marksPerCorrect: 1,
    negativePerWrong: 0.25,
    posts: 600,
    registered: 161961,
    appeared: 150000, // no official attendance figure yet
    categories: JK_CATEGORIES,
    // Advertisement No. 10 of 2025, Annexure-A: 240 + 48 + 60 + 60 + 48 + 24 + 60 + 60 = 600.
    openSeats: 240,
    // `share` is our rough guess of each category's share of candidates (JKSSB
    // doesn't publish it). It is refined by the category mix of shared scores.
    // `gap` is how many marks lower the category tends to score on average,
    // judged from how far past JKSSB category cut-offs sit below open merit.
    // Both are estimates: replace them when real figures are available.
    // Last tuned 15 Nov 2026 from 469 saved scores (category mix and medians).
    reserved: {
      SC: { posts: 48, share: 0.07, gap: 9 },
      "ST-1": { posts: 60, share: 0.08, gap: 8 },
      "ST-2": { posts: 60, share: 0.07, gap: 4 },
      OBC: { posts: 48, share: 0.07, gap: 1 },
      "ALC/IB": { posts: 24, share: 0.04, gap: 6 },
      RBA: { posts: 60, share: 0.16, gap: 1 },
      EWS: { posts: 60, share: 0.08, gap: 4 },
    },
    model: {
      // Coaching estimates put the open-merit cut-off at 84–89, i.e. the score
      // of the candidate at overall rank 240 (the last open-merit seat).
      anchorScore: 86.5,
      anchorRank: 240,
      spread: 16.5,
      uncertainty: 5,
      // Until the answer key is out, people sharing scores are mostly strong
      // candidates from prep groups: the first 35 scores had a median near 86,
      // about where the cut-off is expected. So assume sharers sit far above
      // the average candidate and let them move the estimate only a little.
      // Revisit both once the answer key is out and the mix broadens.
      // 15 Nov evening: provisional key is out, so scores are now checked
      // against it and a wider mix will come in. Relaxed one step from
      // 2.75 / 0.7; relax further as the number of saved scores grows.
      selectionTilt: 2.25,
      sampleDoubt: 0.6,
      // With 100+ saved scores the cut-off is read from the top of the list.
      // 469 scores in, 60 of them at 90 or above: far too many for a cut-off
      // in the mid 80s unless we had reached a third of all top candidates.
      // Assuming top candidates are about 40x over-represented here puts the
      // open-merit cut-off in the low 90s. Lower this if results come in softer.
      topBoost: 40,
      // 115+ entries so far are 120/0-style fakes.
      ignoreScoresFrom: 115,
    },
    leaderboardMaxScore: 112,
    answerKeyReleased: true,
    answerKeyUrl: "/notices/jkssb-faa-provisional-answer-key-2026.pdf",
    patternVerified: false,
    isOpen: true,
  },
  {
    toolSlug: "jk-police-sub-inspector-rank-predictor",
    examKey: "jkp-si-2026",
    examSlug: "sub-inspector",
    name: "Sub-Inspector",
    fullName: "JK Police Sub-Inspector",
    board: "JKSSB",
    examDate: "2026-11-29",
    // Syllabus notice (26.12.2024): 100 questions x 2 marks, 0.5 off per wrong answer.
    totalQuestions: 100,
    marksPerCorrect: 2,
    negativePerWrong: 0.5,
    posts: 669,
    // PLACEHOLDER until exam day: no official applicant or attendance figure yet.
    registered: 0,
    appeared: 100000,
    categories: JK_CATEGORIES,
    // Advertisement 02 of 2024, Annexure-A, Item 07: 267 + 53 + 67 + 67 + 54 + 27 + 67 + 67 = 669.
    openSeats: 267,
    // Shares copied from FAA; gaps scaled to a 200-mark paper. Estimates to tune.
    reserved: {
      SC: { posts: 53, share: 0.07, gap: 15 },
      "ST-1": { posts: 67, share: 0.08, gap: 13 },
      "ST-2": { posts: 67, share: 0.07, gap: 7 },
      OBC: { posts: 54, share: 0.07, gap: 2 },
      "ALC/IB": { posts: 27, share: 0.04, gap: 10 },
      RBA: { posts: 67, share: 0.16, gap: 2 },
      EWS: { posts: 67, share: 0.08, gap: 7 },
    },
    // PLACEHOLDER model: there is no usable past SI cut-off (the 2021-22 exam was
    // cancelled). Before setting isOpen, set anchorScore from expert/coaching
    // estimates on exam evening; shared scores take over from 100 entries.
    model: {
      anchorScore: 130,
      anchorRank: 267,
      spread: 28,
      uncertainty: 12,
      selectionTilt: 2.25,
      sampleDoubt: 0.6,
      topBoost: 40,
      ignoreScoresFrom: 192,
    },
    leaderboardMaxScore: 190,
    answerKeyReleased: false,
    patternVerified: true,
    isOpen: false,
    opensOn: "29 Nov, after the exam",
  },
];

export function getRankExam(toolSlug: string) {
  return rankExams.find((e) => e.toolSlug === toolSlug) ?? null;
}

export function getRankExamByKey(examKey: string) {
  return rankExams.find((e) => e.examKey === examKey) ?? null;
}

export function getRankExamForExamSlug(examSlug: string) {
  return rankExams.find((e) => e.examSlug === examSlug && e.isOpen) ?? null;
}

/** Any tool for the exam, open or not yet open (score calculator only). */
export function getToolForExamSlug(examSlug: string) {
  return rankExams.find((e) => e.examSlug === examSlug) ?? null;
}
