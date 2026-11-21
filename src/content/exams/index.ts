// Verified facts per exam, read from official JKSSB PDFs (advertisement, addenda,
// syllabus, schedule notices, past selection lists). Generated from the research
// set in the workspace (research/jkssb, tools/export_site.py); edit there and
// re-export rather than editing the JSON by hand.
//
// Rules: only facts stated in an official PDF. Every page links the PDFs it used.

import subInspector from "./data/sub-inspector.json";
import subInspectorTelecom from "./data/sub-inspector-telecom.json";
import constableExecutive from "./data/constable-executive.json";
import constableArmed from "./data/constable-armed-irp-sdrf.json";
import constableTelecom from "./data/constable-telecom-photographer.json";
import faa from "./data/finance-accounts-assistant.json";
import mts from "./data/class-iv-mts.json";
import advt08 from "./data/advt-08-2026.json";
import jeCivil from "./data/junior-engineer-civil.json";
import jeMech from "./data/junior-engineer-mechanical.json";

/** Category order used in every table. */
export const CATEGORIES = ["OM", "SC", "ST-1", "ST-2", "OBC", "ALC/IB", "RBA", "EWS"] as const;

type Pair = [string, string];

export interface ExamFacts {
  slug: string;
  title: string;
  board: string;
  advert: { no: string; date: string; items?: string | null };
  postsTotal: number;
  postsNote?: string | null;
  /** Category-wise posts; counts follow CATEGORIES. */
  postTables: { label: string; counts: number[] }[];
  /** Plain post or department counts, e.g. [["Junior Pharmacist", 211]]. */
  postList?: [string, number][] | null;
  pay?: string | null;
  cadre?: string | null;
  qualification?: Pair[] | null;
  age?: { asOn: string; rows: Pair[] | null; min?: number | null; note?: string | null } | null;
  fee?: Pair[] | null;
  /** "What's official so far": dated official events, each linking its notice or our update about it. */
  timeline?: { items: { date: string; title: string; href: string }[]; next?: string | null } | null;
  dates: Pair[];
  status?: string | null;
  pattern?: {
    questions?: number | null;
    marksEach?: number | null;
    total: number;
    negative: number;
    durationMin?: number | null;
    sections: [string, number][];
    /** What the section numbers mean: question counts (1 mark each) or marks. */
    sectionUnit: "questions" | "marks";
  } | null;
  negativeText?: string | null;
  syllabusNote?: string | null;
  /** Topic-by-topic syllabus copied from the official syllabus notice (wording kept close to the notice). */
  syllabus?: {
    source: string;
    sections: { name: string; questions: number; marks: number; topics: [string | null, string][] }[];
    note?: string | null;
  } | null;
  selection?: string[] | null;
  physical?: Pair[] | null;
  extras: Pair[];
  weightage?: Pair[] | null;
  pastCutoffs?: {
    source: string;
    pdf: string;
    outOf: number | string;
    note?: string | null;
    /** rows: [category, main-list cut-off, women's cut-off or null] */
    tables: { label: string; rows: [string, number | null, number | null][] }[];
  } | null;
  papers: { title: string; url: string }[];
  docs: { label: string; url: string }[];
  notes: string[];
  checked: string;
}

const all = [subInspector, subInspectorTelecom, constableExecutive, constableArmed, constableTelecom, faa, mts, advt08, jeCivil, jeMech] as unknown as ExamFacts[];

export const examFacts: Record<string, ExamFacts> = Object.fromEntries(all.map((e) => [e.slug, e]));

export function getExamFacts(slug: string): ExamFacts | null {
  return examFacts[slug] ?? null;
}
