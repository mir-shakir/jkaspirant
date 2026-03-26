import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
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
    title: `${exam.title} Previous Year Papers`,
    description: `Download ${exam.title} previous year question papers PDF — year-wise and subject-wise.`,
    canonicalPath: `/exams/${exam.slug}/previous-papers`,
    keywords: [`${exam.title} previous papers`, `JKSSB ${exam.title} question papers PDF`],
  });
}

export default async function PreviousPapersPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const papers = await getPapers(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Previous Papers", path: `/exams/${exam.slug}/previous-papers` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="previous-papers" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{exam.title} — Previous Year Papers</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Download question papers from previous years to prepare effectively.</p>
      <div className="mt-6"><PapersList papers={papers} /></div>
    </div>
  );
}
