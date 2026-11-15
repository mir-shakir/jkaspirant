// Rank predictor configuration. One entry per exam.
// Operator sessions update these values and commit; no database change needed.
import type { RankModel } from "@/lib/rank";

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

// J&K reservation categories (vertical). Verify against the exam notification.
const JK_CATEGORIES = ["OM", "SC", "ST-1", "ST-2", "OBC", "RBA", "ALC/IB", "EWS", "PSP"];

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
    model: {
      // Coaching estimates put the open-merit cut-off at 84–89. Open merit is
      // roughly half the posts, so that score sits near overall rank 300.
      anchorScore: 86.5,
      anchorRank: 300,
      spread: 16.5,
      uncertainty: 5,
      selectionTilt: 1,
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
