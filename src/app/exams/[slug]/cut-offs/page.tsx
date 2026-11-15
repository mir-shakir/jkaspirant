import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ExamHeader, examBreadcrumbs } from "@/components/ExamHeader";
import { CutoffTable } from "@/components/CutoffTable";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getExamBySlug, getExamSlugs, getCutoffs } from "@/lib/queries/exams";

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
    title: `${exam.title} Cut-offs`,
    description: `Category-wise cut-off marks for ${exam.title} from previous years.`,
    canonicalPath: `/exams/${exam.slug}/cut-offs`,
    keywords: [`${exam.title} cut off`, `${exam.title} cut off marks`],
  });
}

export default async function CutoffsPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();
  const cutoffs = await getCutoffs(exam.id);

  return (
    <div className="page-shell py-4 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(examBreadcrumbs(exam, "cut-offs"))) }}
      />
      <ExamHeader exam={exam} tab="cut-offs" />
      <div className="mt-5">
        <CutoffTable cutoffs={cutoffs} />
      </div>
    </div>
  );
}
