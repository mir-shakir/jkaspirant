import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="syllabus" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{exam.title} — Syllabus</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Section-wise syllabus with topics and marks distribution.</p>
      <div className="mt-6"><SyllabusAccordion sections={sections} /></div>
    </div>
  );
}
