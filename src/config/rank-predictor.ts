// Rank predictor configuration. One entry per exam.
// Operator sessions update these values (e.g. flip answerKeyReleased) and commit.

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
  /** Approximate number of candidates who appeared (for extrapolating rank) */
  appeared: number;
  categories: string[];
  answerKeyReleased: boolean;
  /** Pattern confirmed against the official notification */
  patternVerified: boolean;
  isOpen: boolean;
}

// J&K reservation categories (vertical). Verify against the exam notification.
const JK_CATEGORIES = ["OM", "SC", "ST-1", "ST-2", "RBA", "ALC/IOC", "EWS", "OSC", "PSP"];

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
    appeared: 150000,
    categories: JK_CATEGORIES,
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
