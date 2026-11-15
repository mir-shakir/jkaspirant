import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ExamHeader, examBreadcrumbs } from "@/components/ExamHeader";
import { UpdateRow } from "@/components/UpdateRow";
import { GroupList, Row, Section } from "@/components/ui";
import { buildMetadata, buildExamJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getCutoffs, getExamBySlug, getExamDates, getExamSlugs, getPapers, getSyllabusSections } from "@/lib/queries/exams";
import { getNotificationsForExam } from "@/lib/queries/notifications";
import { getRankExamForExamSlug } from "@/config/rank-predictor";
import { todayIST, relativeDay } from "@/content/calendar";

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
    title: exam.seo_title || `${exam.title} — Syllabus, Papers, Cut-offs & Dates`,
    description:
      exam.seo_description || `Everything for ${exam.title}: syllabus, previous papers, cut-offs, important dates and the latest updates.`,
    canonicalPath: `/exams/${exam.slug}`,
    keywords: exam.seo_keywords || undefined,
    ogImage: exam.og_image_url || undefined,
  });
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export default async function ExamOverviewPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const [papers, syllabusSections, dates, cutoffs, updates] = await Promise.all([
    getPapers(exam.id),
    getSyllabusSections(exam.id),
    getExamDates(exam.id),
    getCutoffs(exam.id),
    getNotificationsForExam(exam.slug, 3),
  ]);

  const rankTool = getRankExamForExamSlug(exam.slug);
  const today = todayIST();
  const nextDate = dates.find((d) => d.event_date && d.event_date >= today);
  const latestCutoffYear = cutoffs.length > 0 ? Math.max(...cutoffs.map((c) => c.year)) : null;

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

      {nextDate && (
        <p className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[hsl(var(--panel-soft))] px-4 py-3.5 text-[14.5px]">
          <span>
            <span className="text-[hsl(var(--muted))]">Next: </span>
            <strong className="font-semibold">{nextDate.event_name}</strong>
          </span>
          <span className="shrink-0 font-mono-num text-[13px] font-semibold text-[hsl(var(--accent))]">{relativeDay(nextDate.event_date!)}</span>
        </p>
      )}

      <Section title="Prepare" className="!mt-6">
        <GroupList>
          <Row
            href={`/exams/${exam.slug}/syllabus`}
            title="Syllabus"
            sub={syllabusSections.length > 0 ? `${plural(syllabusSections.length, "section")} with topics and marks` : "Not added yet"}
          />
          <Row
            href={`/exams/${exam.slug}/previous-papers`}
            title="Previous papers"
            sub={papers.length > 0 ? `${plural(papers.length, "paper")} to download` : "Not added yet"}
          />
          <Row
            href={`/exams/${exam.slug}/cut-offs`}
            title="Cut-offs"
            sub={latestCutoffYear ? `Category-wise, latest ${latestCutoffYear}` : "Added when results are declared"}
          />
          <Row
            href={`/exams/${exam.slug}/important-dates`}
            title="Important dates"
            sub={dates.length > 0 ? plural(dates.length, "date") : "None announced yet"}
          />
        </GroupList>
      </Section>

      {updates.length > 0 && (
        <Section title="Latest on this exam" action={{ href: "/notifications", label: "All updates" }}>
          <GroupList>
            {updates.map((n) => (
              <UpdateRow key={n.id} update={n} />
            ))}
          </GroupList>
        </Section>
      )}

      {(exam.pay_scale || exam.eligibility || exam.description) && (
        <Section title="About this post">
          <dl className="divide-y border-y text-[14.5px] leading-6">
            {exam.pay_scale && (
              <div className="flex justify-between gap-6 py-3">
                <dt className="shrink-0 text-[hsl(var(--muted))]">Pay</dt>
                <dd className="text-right">{exam.pay_scale}</dd>
              </div>
            )}
            {exam.eligibility && (
              <div className="py-3">
                <dt className="text-[hsl(var(--muted))]">Who can apply</dt>
                <dd className="mt-1">{exam.eligibility}</dd>
              </div>
            )}
          </dl>
          {exam.description && <p className="mt-3 text-[14.5px] leading-6 text-[hsl(var(--muted))]">{exam.description}</p>}
        </Section>
      )}
    </div>
  );
}
