import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ExamHeader, examBreadcrumbs } from "@/components/ExamHeader";
import { PapersList } from "@/components/PapersList";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getExamBySlug, getExamSlugs, getPapers } from "@/lib/queries/exams";

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
    title: `${exam.title} Previous Papers`,
    description: `Download previous year question papers for ${exam.title} as PDF, free.`,
    canonicalPath: `/exams/${exam.slug}/previous-papers`,
    keywords: [`${exam.title} previous papers`, `${exam.title} question paper pdf`],
  });
}

export default async function PreviousPapersPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();
  const papers = await getPapers(exam.id);
  // Empty sections have no tab and no page.
  if (papers.length === 0) notFound();

  return (
    <div className="page-shell py-4 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(examBreadcrumbs(exam, "previous-papers"))) }}
      />
      <ExamHeader exam={exam} tab="previous-papers" />
      <div className="mt-5">
        <PapersList papers={papers} />
      </div>
    </div>
  );
}
