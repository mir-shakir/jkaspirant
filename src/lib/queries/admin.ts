import { supabase } from "@/lib/supabase/client";
import type {
  Exam,
  Notification,
  Paper,
  Cutoff,
  SyllabusSection,
  ExamDate,
} from "@/lib/types/database";

// --- Exams ---
export async function getAdminExams(): Promise<Exam[]> {
  const { data, error } = await supabase.from("exams").select("*").order("title");
  if (error) throw error;
  return data || [];
}

export async function upsertExam(exam: Partial<Exam> & { title: string; slug: string }): Promise<Exam> {
  const { data, error } = await supabase.from("exams").upsert(exam, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteExam(id: string): Promise<void> {
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw error;
}

// --- Notifications ---
export async function getAdminNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase.from("notifications").select("*, exam:exams(slug, title)").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertNotification(notification: Partial<Notification> & { title: string; slug: string }): Promise<Notification> {
  const { data, error } = await supabase.from("notifications").upsert(notification, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function approveNotification(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ is_published: true, published_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw error;
}

// --- Papers ---
export async function getAdminPapers(): Promise<(Paper & { exam?: Pick<Exam, "title"> })[]> {
  const { data, error } = await supabase.from("papers").select("*, exam:exams(title)").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertPaper(paper: Partial<Paper> & { title: string; exam_id: string }): Promise<Paper> {
  const { data, error } = await supabase.from("papers").upsert(paper, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deletePaper(id: string): Promise<void> {
  const { error } = await supabase.from("papers").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPaperFile(file: File, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage.from("papers").upload(fileName, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("papers").getPublicUrl(data.path);
  return publicUrl;
}

// --- Cutoffs ---
export async function getAdminCutoffs(): Promise<(Cutoff & { exam?: Pick<Exam, "title"> })[]> {
  const { data, error } = await supabase.from("cutoffs").select("*, exam:exams(title)").order("year", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertCutoff(cutoff: Partial<Cutoff> & { exam_id: string; year: number; category: string }): Promise<Cutoff> {
  const { data, error } = await supabase.from("cutoffs").upsert(cutoff, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCutoff(id: string): Promise<void> {
  const { error } = await supabase.from("cutoffs").delete().eq("id", id);
  if (error) throw error;
}

// --- Syllabus Sections ---
export async function getAdminSyllabusSections(): Promise<(SyllabusSection & { exam?: Pick<Exam, "title"> })[]> {
  const { data, error } = await supabase.from("syllabus_sections").select("*, exam:exams(title)").order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function upsertSyllabusSection(section: Partial<SyllabusSection> & { exam_id: string; section_title: string }): Promise<SyllabusSection> {
  const { data, error } = await supabase.from("syllabus_sections").upsert(section, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSyllabusSection(id: string): Promise<void> {
  const { error } = await supabase.from("syllabus_sections").delete().eq("id", id);
  if (error) throw error;
}

// --- Exam Dates ---
export async function getAdminExamDates(): Promise<(ExamDate & { exam?: Pick<Exam, "title"> })[]> {
  const { data, error } = await supabase.from("exam_dates").select("*, exam:exams(title)").order("event_date");
  if (error) throw error;
  return data || [];
}

export async function upsertExamDate(examDate: Partial<ExamDate> & { exam_id: string; event_name: string }): Promise<ExamDate> {
  const { data, error } = await supabase.from("exam_dates").upsert(examDate, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteExamDate(id: string): Promise<void> {
  const { error } = await supabase.from("exam_dates").delete().eq("id", id);
  if (error) throw error;
}

// --- Stats ---
export async function getAdminStats(): Promise<{ totalExams: number; totalNotifications: number; pendingNotifications: number; totalPapers: number }> {
  const [exams, notifs, pending, papers] = await Promise.all([
    supabase.from("exams").select("id", { count: "exact", head: true }),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_published", false),
    supabase.from("papers").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalExams: exams.count || 0,
    totalNotifications: notifs.count || 0,
    pendingNotifications: pending.count || 0,
    totalPapers: papers.count || 0,
  };
}
