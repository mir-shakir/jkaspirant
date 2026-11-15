import { createServerClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types/database";
import { contentNotifications, type ContentNotification } from "@/content/notifications";
import { isLiveExam } from "@/config/exams";

// Updates come from two places: the Supabase `notifications` table and the
// file-backed list in src/content/notifications.ts. Database rows win on slug.

export type NotificationWithExam = Omit<Notification, "exam"> & {
  exam?: { slug: string; title: string } | null;
  summary?: string;
};

function fromContent(item: ContentNotification): NotificationWithExam {
  return {
    id: `content:${item.slug}`,
    slug: item.slug,
    title: item.title,
    body: item.body,
    source_url: item.source_url,
    exam_id: null,
    category: item.category,
    published_at: item.published_at,
    is_published: true,
    seo_title: null,
    seo_description: item.summary,
    focus_keyword: null,
    auto_fetched: false,
    source_raw: null,
    created_at: item.published_at,
    updated_at: item.published_at,
    exam: item.exam ?? null,
    summary: item.summary,
  };
}

/** Updates tied to an exam we don't cover right now are hidden. */
const visible = (n: NotificationWithExam) => !n.exam || isLiveExam(n.exam.slug);

function merge(allRows: NotificationWithExam[]): NotificationWithExam[] {
  const dbRows = allRows.filter(visible);
  const seen = new Set(allRows.map((n) => n.slug));
  const extra = contentNotifications.filter((n) => !seen.has(n.slug)).map(fromContent);
  return [...dbRows, ...extra].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
}

export async function getAllPublishedNotifications(): Promise<NotificationWithExam[]> {
  let rows: NotificationWithExam[] = [];
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("notifications")
      .select("*, exam:exams(slug, title)")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    rows = (data as NotificationWithExam[] | null) || [];
  } catch {}
  return merge(rows);
}

export async function getLatestNotifications(limit: number = 5): Promise<NotificationWithExam[]> {
  return (await getAllPublishedNotifications()).slice(0, limit);
}

export async function getNotificationsForExam(examSlug: string, limit: number = 5): Promise<NotificationWithExam[]> {
  return (await getAllPublishedNotifications()).filter((n) => n.exam?.slug === examSlug).slice(0, limit);
}

export async function getNotificationBySlug(slug: string): Promise<NotificationWithExam | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("notifications")
      .select("*, exam:exams(slug, title)")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (data) return visible(data as NotificationWithExam) ? (data as NotificationWithExam) : null;
  } catch {}
  const item = contentNotifications.find((n) => n.slug === slug);
  return item ? fromContent(item) : null;
}

export async function getNotificationSlugs(): Promise<string[]> {
  return (await getAllPublishedNotifications()).map((n) => n.slug);
}
