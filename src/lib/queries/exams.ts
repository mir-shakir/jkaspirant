import { createServerClient } from "@/lib/supabase/server";
import type {
  Exam,
  SyllabusSection,
  Paper,
  Cutoff,
  ExamDate,
} from "@/lib/types/database";
import { isLiveExam, liveExams, liveExamSlugs } from "@/config/exams";

/** Keep only confirmed facts: config overrides the database for anything shown. */
function present(row: Exam): Exam {
  const live = liveExams[row.slug];
  return {
    ...row,
    title: live.title,
    department: live.board,
    vacancy_count: live.posts ?? null,
    description: null,
    pay_scale: null,
    eligibility: null,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
  };
}

export async function getAllExams(): Promise<Exam[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("exams").select("*").eq("is_active", true).in("slug", liveExamSlugs);
    if (error) return [];
    return ((data as Exam[]) || [])
      .map(present)
      .sort((a, b) => liveExamSlugs.indexOf(a.slug) - liveExamSlugs.indexOf(b.slug));
  } catch {
    return [];
  }
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  if (!isLiveExam(slug)) return null;
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("exams").select("*").eq("slug", slug).eq("is_active", true).single();
    if (error || !data) return null;
    return present(data as Exam);
  } catch {
    return null;
  }
}

export async function getExamSlugs(): Promise<string[]> {
  return (await getAllExams()).map((exam) => exam.slug);
}

export interface ExamSections {
  syllabus: number;
  papers: number;
  cutoffs: number;
  dates: number;
}

/** How much content each section of an exam has, so empty sections can be hidden. */
export async function getExamSections(examId: string): Promise<ExamSections> {
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
