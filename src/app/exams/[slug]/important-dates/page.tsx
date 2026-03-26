import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
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
    description: `${exam.title} exam important dates — application start, last date, admit card, exam date, and result dates.`,
    canonicalPath: `/exams/${exam.slug}/important-dates`,
    keywords: [`${exam.title} exam date`, `JKSSB ${exam.title} important dates`],
  });
}

export default async function ImportantDatesPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const dates = await getExamDates(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Important Dates", path: `/exams/${exam.slug}/important-dates` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="important-dates" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{exam.title} — Important Dates</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Key dates for application, exam, admit card, and result.</p>
      <div className="mt-6"><DateTimeline dates={dates} /></div>
    </div>
  );
}
