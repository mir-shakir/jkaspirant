import { createServerClient } from "@/lib/supabase/server";
import type {
  Exam,
  SyllabusSection,
  Paper,
  Cutoff,
  ExamDate,
} from "@/lib/types/database";
import { isLiveExam, liveExams, liveExamSlugs } from "@/config/exams";

/**
 * The exam list comes from src/config/exams.ts. A database row, when one exists,
 * only supplies the id that syllabus / papers / cut-offs hang off. Only confirmed
 * facts from the config are shown.
 */
function present(slug: string, row?: Partial<Exam>): Exam {
  const live = liveExams[slug];
  const now = new Date(0).toISOString();
  return {
    id: row?.id ?? `config:${slug}`,
    slug,
    title: live.title,
    department: live.board,
    vacancy_count: live.posts ?? null,
    description: null,
    pay_scale: null,
    eligibility: null,
    is_active: true,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    og_image_url: row?.og_image_url ?? null,
    focus_keyword: null,
    created_at: row?.created_at ?? now,
    updated_at: row?.updated_at ?? now,
  };
}

async function dbRows(): Promise<Map<string, Exam>> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("exams").select("*").in("slug", liveExamSlugs);
    return new Map(((data as Exam[]) || []).map((row) => [row.slug, row]));
  } catch {
    return new Map();
  }
}

export async function getAllExams(): Promise<Exam[]> {
  const rows = await dbRows();
  return liveExamSlugs.map((slug) => present(slug, rows.get(slug)));
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  if (!isLiveExam(slug)) return null;
  return present(slug, (await dbRows()).get(slug));
}

export async function getExamSlugs(): Promise<string[]> {
  return liveExamSlugs;
}

export interface ExamSections {
  syllabus: number;
  papers: number;
  cutoffs: number;
  dates: number;
}

/** How much content each section of an exam has, so empty sections can be hidden. */
export async function getExamSections(examId: string): Promise<ExamSections> {
  if (examId.startsWith("config:")) return { syllabus: 0, papers: 0, cutoffs: 0, dates: 0 };
  const [syllabus, papers, cutoffs, dates] = await Promise.all([
    getSyllabusSections(examId),
    getPapers(examId),
    getCutoffs(examId),
    getExamDates(examId),
  ]);
  return { syllabus: syllabus.length, papers: papers.length, cutoffs: cutoffs.length, dates: dates.length };
}

export async function getSyllabusSections(examId: string): Promise<SyllabusSection[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("syllabus_sections").select("*").eq("exam_id", examId).order("sort_order");
    return data || [];
  } catch { return []; }
}

export async function getPapers(examId: string): Promise<Paper[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("papers").select("*").eq("exam_id", examId).eq("is_published", true).order("year", { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function getLatestPapers(limit: number = 8): Promise<Paper[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("papers")
      .select("*, exam:exams(slug, title)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

export async function getCutoffs(examId: string): Promise<Cutoff[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("cutoffs").select("*").eq("exam_id", examId).order("year", { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function getExamDates(examId: string): Promise<ExamDate[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("exam_dates").select("*").eq("exam_id", examId).order("event_date");
    return data || [];
  } catch { return []; }
}
