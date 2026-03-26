import { createServerClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types/database";

export async function getLatestNotifications(limit: number = 5): Promise<Notification[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("notifications").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(limit);
    return data || [];
  } catch { return []; }
}

export async function getAllPublishedNotifications(): Promise<Notification[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("notifications").select("*, exam:exams(slug, title)").eq("is_published", true).order("published_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function getNotificationBySlug(slug: string): Promise<Notification | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("notifications").select("*, exam:exams(slug, title)").eq("slug", slug).eq("is_published", true).single();
    return data;
  } catch { return null; }
}

export async function getNotificationSlugs(): Promise<string[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("notifications").select("slug").eq("is_published", true);
    return (data || []).map((row) => row.slug);
  } catch { return []; }
}
