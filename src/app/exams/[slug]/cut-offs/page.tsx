import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
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
    title: `${exam.title} Cut-off Marks — Category Wise`,
    description: `${exam.title} cut-off marks category wise — General, OBC, SC, ST, EWS. Year-wise cut-off history.`,
    canonicalPath: `/exams/${exam.slug}/cut-offs`,
    keywords: [`${exam.title} cut off`, `JKSSB ${exam.title} cut off category wise`],
  });
}

export default async function CutoffsPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const cutoffs = await getCutoffs(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Cut-offs", path: `/exams/${exam.slug}/cut-offs` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="cut-offs" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{exam.title} — Cut-off Marks</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Category-wise cut-off history. Use the year filter to compare across years.</p>
      <div className="mt-6"><CutoffTable cutoffs={cutoffs} /></div>
    </div>
  );
}
