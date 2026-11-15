import Link from "next/link";
import { ExamCard } from "@/components/ExamCard";
import { NotificationCard, UpdatesBoard } from "@/components/NotificationCard";
import { SectionHeader } from "@/components/SectionHeader";
import { RelatedResources } from "@/components/RelatedResources";
import { SpotlightCard } from "@/components/SpotlightCard";
import { ToolCard } from "@/components/ToolCard";
import { TelegramLink } from "@/components/TelegramLink";
import { buildMetadata } from "@/lib/seo";
import { getAllExams, getLatestPapers } from "@/lib/queries/exams";
import { getLatestNotifications } from "@/lib/queries/notifications";
import { spotlight } from "@/config/spotlight";
import { tools } from "@/config/tools";

export const revalidate = 1800; // ISR: revalidate every 30 minutes

export const metadata = buildMetadata({
  title: "JK Aspirant — JKSSB & JKPSC Updates, Rank Predictor & Papers",
  description:
    "Latest JKSSB and JKPSC notifications, answer keys and results, score & rank predictors, syllabus and previous papers. Fast, clean, no ads.",
  canonicalPath: "/",
});

export default async function HomePage() {
  const [exams, notifications, papers] = await Promise.all([
    getAllExams(),
    getLatestNotifications(6),
    getLatestPapers(4),
  ]);

  const recentPaperResources = papers.map((paper) => ({
    href: paper.exam?.slug ? `/exams/${paper.exam.slug}/previous-papers` : "/resources",
    title: paper.title,
    description: paper.exam?.title ? `Paper for ${paper.exam.title}` : "Previous paper",
    label: "Paper",
  }));

  return (
    <div className="page-shell py-5 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        {spotlight ? (
          <SpotlightCard spotlight={spotlight} />
        ) : (
          <section className="py-4">
            <p className="section-kicker">JKSSB · JKPSC</p>
            <h1 className="mt-2 text-4xl leading-tight">
              Every exam update, the day it happens.
            </h1>
          </section>
        )}

        <section aria-labelledby="latest-updates">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="latest-updates" className="text-[22px]">
              Latest updates
            </h2>
            <Link href="/notifications" className="text-sm font-medium text-[hsl(var(--accent))] hover:underline">
              All updates →
            </Link>
          </div>
          {notifications.length > 0 ? (
            <UpdatesBoard>
              {notifications.map((n) => (
                <NotificationCard key={n.id} notification={n} />
              ))}
            </UpdatesBoard>
          ) : (
            <div className="surface-card p-5 text-sm text-[hsl(var(--muted))]">
              New notices from JKSSB and JKPSC appear here as soon as they&apos;re published.
            </div>
          )}
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-dashed p-3">
            <p className="text-[13px] leading-5 text-[hsl(var(--muted))]">
              Official sources only. Every update links to the original notice.
            </p>
            <TelegramLink compact className="inline-flex shrink-0" label="Join" />
          </div>
        </section>
      </div>

      <section className="mt-12">
        <SectionHeader kicker="Tools" title="Calculators that actually help" href="/tools" linkLabel="All tools →" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <ToolCard key={t.title} {...t} />
          ))}
        </div>
      </section>

      {exams.length > 0 && (
        <section className="mt-12">
          <SectionHeader kicker="Exam hubs" title="Syllabus, papers & cut-offs by exam" href="/exams" linkLabel="All exams →" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exams.slice(0, 6).map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </section>
      )}

      {recentPaperResources.length > 0 && (
        <section className="mt-12">
          <SectionHeader kicker="Archive" title="Recently added papers" href="/resources" linkLabel="All papers →" />
          <div className="mt-4">
            <RelatedResources items={recentPaperResources} />
          </div>
        </section>
      )}
    </div>
  );
}
