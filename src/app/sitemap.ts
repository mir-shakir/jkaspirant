import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { rankExams } from "@/config/rank-predictor";
import { resultSheets } from "@/content/results";
import { getAllExams, getExamSections } from "@/lib/queries/exams";
import { getAllPublishedNotifications } from "@/lib/queries/notifications";

// Built from what the site actually shows: live exams, visible updates and
// rank tools. Exam tabs with no content are left out (those pages 404).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${siteConfig.url}${path}`;
  const now = new Date();

  const [exams, updates] = await Promise.all([getAllExams(), getAllPublishedNotifications()]);
  // Real "last changed" dates, so search engines can trust lastmod.
  const dateOf = (n: (typeof updates)[number]) => new Date(n.updated_at ?? n.published_at ?? 0);
  const newest = updates.reduce((d, n) => (dateOf(n) > d ? dateOf(n) : d), new Date(0));
  const contentChanged = newest.getTime() > 0 ? newest : now;
  const examChanged = (slug: string) =>
    updates.filter((n) => n.exam?.slug === slug).reduce((d, n) => (dateOf(n) > d ? dateOf(n) : d), new Date(0));

  const examTabs = await Promise.all(
    exams.map(async (exam) => {
      const s = await getExamSections(exam.id);
      const tabs: [string, number][] = [
        ["syllabus", s.syllabus],
        ["previous-papers", s.papers],
        ["cut-offs", s.cutoffs],
        ["important-dates", s.dates],
      ];
      return tabs.filter(([, n]) => n > 0).map(([tab]) => ({ url: url(`/exams/${exam.slug}/${tab}`) }));
    }),
  );

  return [
    { url: url("/"), lastModified: contentChanged, changeFrequency: "hourly", priority: 1 },
    { url: url("/notifications"), lastModified: contentChanged, changeFrequency: "hourly", priority: 0.9 },
    { url: url("/exams"), lastModified: contentChanged, changeFrequency: "daily", priority: 0.8 },
    { url: url("/calendar"), lastModified: contentChanged, changeFrequency: "daily", priority: 0.7 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.4 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/tools"), changeFrequency: "weekly", priority: 0.7 },
    ...rankExams.map((t) => ({ url: url(`/tools/${t.toolSlug}`), lastModified: now, changeFrequency: "hourly" as const, priority: 0.9 })),
    ...exams.map((e) => {
      const changed = examChanged(e.slug);
      return { url: url(`/exams/${e.slug}`), ...(changed.getTime() > 0 ? { lastModified: changed } : {}), changeFrequency: "daily" as const, priority: 0.8 };
    }),
    ...examTabs.flat(),
    { url: url("/tools/age-checker"), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: url("/cut-offs"), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: url("/results"), changeFrequency: "weekly" as const, priority: 0.6 },
    ...resultSheets.map((s) => ({ url: url(`/results/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...updates.map((n) => ({
      url: url(`/notifications/${n.slug}`),
      lastModified: new Date(n.updated_at ?? n.published_at ?? now),
      priority: 0.7,
    })),
  ];
}
