import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ExamHeader, examBreadcrumbs } from "@/components/ExamHeader";
import { SyllabusAccordion } from "@/components/SyllabusAccordion";
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
    description: `Complete syllabus for ${exam.title}: section-wise topics and marks distribution.`,
    canonicalPath: `/exams/${exam.slug}/syllabus`,
    keywords: [`${exam.title} syllabus`, `JKSSB ${exam.title} syllabus`, `${exam.title} exam pattern`],
  });
}

export default async function SyllabusPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();
  const sections = await getSyllabusSections(exam.id);

  return (
    <div className="page-shell py-4 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(examBreadcrumbs(exam, "syllabus"))) }}
      />
      <ExamHeader exam={exam} tab="syllabus" />
      <div className="mt-5">
        <SyllabusAccordion sections={sections} />
      </div>
    </div>
  );
}
