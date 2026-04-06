import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { DateTimeline } from "@/components/DateTimeline";
import { RelatedResources } from "@/components/RelatedResources";
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
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Timeline</p>
        <h1 className="mt-3 text-3xl font-semibold text-[hsl(var(--foreground))]">{exam.title} Important Dates</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--muted))]">
          Keep application, exam, admit card, and result dates visible while the rest of the resources remain one tap away.
        </p>
      </div>
      <div className="mt-8">
        <ExamSubNav examSlug={exam.slug} activeTab="important-dates" />
      </div>
      <div className="mt-6"><DateTimeline dates={dates} /></div>
      <div className="mt-10">
        <RelatedResources
          items={[
            {
              href: `/exams/${exam.slug}/previous-papers`,
              title: "Practice with papers",
              description: "Keep revising from the paper list while tracking the exam timeline.",
              label: "Paper",
            },
            {
              href: `/exams/${exam.slug}/syllabus`,
              title: "Review syllabus",
              description: "Open the syllabus again if the date timeline changes your preparation plan.",
              label: "Syllabus",
            },
            {
              href: `/exams/${exam.slug}`,
              title: "Back to exam hub",
              description: "Return to the full exam resource page.",
              label: "Hub",
            },
          ]}
        />
      </div>
    </div>
  );
}
