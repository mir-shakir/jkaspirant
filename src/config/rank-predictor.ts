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
  /** Pattern confirmed against the official notification */
  patternVerified: boolean;
  isOpen: boolean;
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
    reserved: {
      SC: { posts: 48, share: 0.07, gap: 8 },
      "ST-1": { posts: 60, share: 0.07, gap: 9 },
      "ST-2": { posts: 60, share: 0.07, gap: 6 },
      OBC: { posts: 48, share: 0.08, gap: 3 },
      "ALC/IB": { posts: 24, share: 0.03, gap: 5 },
      RBA: { posts: 60, share: 0.14, gap: 3 },
      EWS: { posts: 60, share: 0.12, gap: 2 },
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
      selectionTilt: 2.75,
      sampleDoubt: 0.7,
    },
    leaderboardMaxScore: 112,
    answerKeyReleased: false,
    patternVerified: false,
    isOpen: true,
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
