import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { SyllabusAccordion } from "@/components/SyllabusAccordion";
import { RelatedResources } from "@/components/RelatedResources";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getExamBySlug, getExamSlugs, getSyllabusSections } from "@/lib/queries/exams";

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
    title: `${exam.title} Syllabus`,
    description: `Complete syllabus for ${exam.title} exam — section-wise topics, marks distribution, and preparation guide.`,
    canonicalPath: `/exams/${exam.slug}/syllabus`,
    keywords: [`${exam.title} syllabus`, `JKSSB ${exam.title} syllabus`, `${exam.title} exam pattern`],
  });
}

export default async function SyllabusPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const sections = await getSyllabusSections(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Syllabus", path: `/exams/${exam.slug}/syllabus` },
  ];

  return (
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Study map</p>
        <h1 className="mt-3 text-3xl font-semibold text-[hsl(var(--foreground))]">{exam.title} Syllabus</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--muted))]">
          Browse section-wise topics and marks so users can connect the syllabus with papers, dates, and bundles from the same exam hub.
        </p>
      </div>
      <div className="mt-8">
        <ExamSubNav examSlug={exam.slug} activeTab="syllabus" />
      </div>
      <div className="mt-6"><SyllabusAccordion sections={sections} /></div>
      <div className="mt-10">
        <RelatedResources
          items={[
            {
              href: `/exams/${exam.slug}/previous-papers`,
              title: "Practice with papers",
              description: "Pair the syllabus with previous papers for better revision.",
              label: "Paper",
            },
            {
              href: `/exams/${exam.slug}/important-dates`,
              title: "Check important dates",
              description: "Stay aligned with the timeline while planning study.",
              label: "Timeline",
            },
            {
              href: `/exams/${exam.slug}`,
              title: "Back to exam hub",
              description: "Return to the exam overview and linked resources.",
              label: "Hub",
            },
          ]}
        />
      </div>
    </div>
  );
}
