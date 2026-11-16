import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ExamHeader, examBreadcrumbs } from "@/components/ExamHeader";
import { DateTimeline } from "@/components/DateTimeline";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getExamBySlug, getExamSlugs, getExamDates } from "@/lib/queries/exams";

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
    title: `${exam.title} Important Dates`,
    description: `Application, admit card, exam and result dates for ${exam.title}.`,
    canonicalPath: `/exams/${exam.slug}/important-dates`,
    keywords: [`${exam.title} exam date`, `${exam.title} admit card date`],
  });
}

export default async function ImportantDatesPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();
  const dates = await getExamDates(exam.id);
  // Empty sections have no tab and no page.
  if (dates.length === 0) notFound();

  return (
    <div className="page-shell py-4 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(examBreadcrumbs(exam, "important-dates"))) }}
      />
      <ExamHeader exam={exam} tab="important-dates" />
      <div className="mt-5">
        <DateTimeline dates={dates} />
      </div>
    </div>
  );
}
