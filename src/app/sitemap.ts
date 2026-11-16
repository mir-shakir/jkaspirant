import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { rankExams } from "@/config/rank-predictor";
import { getAllExams, getExamSections } from "@/lib/queries/exams";
import { getAllPublishedNotifications } from "@/lib/queries/notifications";

// Built from what the site actually shows: live exams, visible updates and
// rank tools. Exam tabs with no content are left out (those pages 404).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${siteConfig.url}${path}`;
  const now = new Date();

  const [exams, updates] = await Promise.all([getAllExams(), getAllPublishedNotifications()]);

  const examTabs = await Promise.all(
    exams.map(async (exam) => {
      const s = await getExamSections(exam.id);
      const tabs: [string, number][] = [
        ["syllabus", s.syllabus],
        ["previous-papers", s.papers],
        ["cut-offs", s.cutoffs],
        ["important-dates", s.dates],
      ];
      return tabs.filter(([, n]) => n > 0).map(([tab]) => ({ url: url(`/exams/${exam.slug}/${tab}`), lastModified: now }));
    }),
  );

  return [
    { url: url("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: url("/notifications"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: url("/exams"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: url("/calendar"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: url("/tools"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...rankExams.map((t) => ({ url: url(`/tools/${t.toolSlug}`), lastModified: now, changeFrequency: "hourly" as const, priority: 0.9 })),
    ...exams.map((e) => ({ url: url(`/exams/${e.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...examTabs.flat(),
    ...updates.map((n) => ({
      url: url(`/notifications/${n.slug}`),
      lastModified: new Date(n.updated_at ?? n.published_at ?? now),
      priority: 0.7,
    })),
  ];
}
