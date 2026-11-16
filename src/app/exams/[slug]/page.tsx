import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ExamHeader, examBreadcrumbs } from "@/components/ExamHeader";
import { UpdateRow } from "@/components/UpdateRow";
import { GroupList, Row, Section } from "@/components/ui";
import { buildMetadata, buildExamJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getCutoffs, getExamBySlug, getExamSlugs, getExamSections } from "@/lib/queries/exams";
import { getNotificationsForExam } from "@/lib/queries/notifications";
import { getRankExamForExamSlug } from "@/config/rank-predictor";
import { nextEventForExam, relativeDay } from "@/content/calendar";
import { getExamFacts } from "@/content/exams";
import { AtAGlance, ExamFactsView } from "@/components/exam/ExamFactsView";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};
  return buildMetadata({
    title: exam.seo_title || `${exam.title} — Latest Updates & Exam Dates`,
    description:
      exam.seo_description || `${exam.title}: latest updates, exam dates and tools for J&K aspirants.`,
    canonicalPath: `/exams/${exam.slug}`,
    keywords: exam.seo_keywords || undefined,
    ogImage: exam.og_image_url || undefined,
  });
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export default async function ExamOverviewPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const [sections, cutoffs, updates] = await Promise.all([
    getExamSections(exam.id),
    getCutoffs(exam.id),
    getNotificationsForExam(exam.slug, 3),
  ]);

  const facts = getExamFacts(exam.slug);
  const rankTool = getRankExamForExamSlug(exam.slug);
  const nextEvent = nextEventForExam(exam.slug);
  const latestCutoffYear = cutoffs.length > 0 ? Math.max(...cutoffs.map((c) => c.year)) : null;
  const hasPrepare = sections.syllabus + sections.papers + sections.cutoffs + sections.dates > 0;

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildExamJsonLd(exam)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(examBreadcrumbs(exam, "overview"))) }} />
      <ExamHeader exam={exam} tab="overview" />

      {rankTool && (
        <Link
          href={`/tools/${rankTool.toolSlug}`}
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[hsl(var(--focus))] px-4 py-4 text-[hsl(var(--focus-fg))]"
        >
          <span>
            <span className="block text-[16px] font-semibold">Predict your {rankTool.name} rank</span>
            <span className="mt-0.5 block text-[13px] opacity-75">Score and expected rank in under a minute</span>
          </span>
          <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" />
          </svg>
        </Link>
      )}

      {nextEvent && (
        <p className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[hsl(var(--panel-soft))] px-4 py-3.5 text-[14.5px]">
          <span>
            <span className="text-[hsl(var(--muted))]">Next: </span>
            <strong className="font-semibold">{nextEvent.title}</strong>
            {nextEvent.tentative && <span className="text-[hsl(var(--muted))]"> (expected)</span>}
          </span>
          <span className="shrink-0 font-mono-num text-[13px] font-semibold text-[hsl(var(--accent))]">{relativeDay(nextEvent.date)}</span>
        </p>
      )}

      {facts && <AtAGlance facts={facts} />}

      {hasPrepare && (
        <Section title="Prepare" className="!mt-6">
          <GroupList>
            {sections.syllabus > 0 && (
              <Row href={`/exams/${exam.slug}/syllabus`} title="Syllabus" sub={`${plural(sections.syllabus, "section")} with topics and marks`} />
            )}
            {sections.papers > 0 && (
              <Row href={`/exams/${exam.slug}/previous-papers`} title="Previous papers" sub={`${plural(sections.papers, "paper")} to download`} />
            )}
            {sections.cutoffs > 0 && (
              <Row href={`/exams/${exam.slug}/cut-offs`} title="Cut-offs" sub={`Category-wise, latest ${latestCutoffYear}`} />
            )}
            {sections.dates > 0 && <Row href={`/exams/${exam.slug}/important-dates`} title="Important dates" sub={plural(sections.dates, "date")} />}
          </GroupList>
        </Section>
      )}

      {updates.length > 0 && (
        <Section title="Latest" action={{ href: "/notifications", label: "All updates" }} className={hasPrepare || facts ? "" : "!mt-6"}>
          <GroupList>
            {updates.map((n) => (
              <UpdateRow key={n.id} update={n} />
            ))}
          </GroupList>
        </Section>
      )}

      {facts && <ExamFactsView facts={facts} />}

    </div>
  );
}
