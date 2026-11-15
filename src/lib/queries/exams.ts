import { createServerClient } from "@/lib/supabase/server";
import type {
  Exam,
  SyllabusSection,
  Paper,
  Cutoff,
  ExamDate,
} from "@/lib/types/database";

export async function getAllExams(): Promise<Exam[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("is_active", true)
      .order("title");

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getExamSlugs(): Promise<string[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("exams")
      .select("slug")
      .eq("is_active", true);

    if (error) return [];
    return (data || []).map((row) => row.slug);
  } catch {
    return [];
  }
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
