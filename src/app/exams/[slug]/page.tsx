import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import {
  buildMetadata,
  buildExamJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { getExamBySlug, getExamSlugs } from "@/lib/queries/exams";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};

  return buildMetadata({
    title: exam.seo_title || `${exam.title} — Exam Details`,
    description:
      exam.seo_description ||
      `Complete details for ${exam.title} exam including syllabus, previous papers, cut-offs, and important dates.`,
    canonicalPath: `/exams/${exam.slug}`,
    keywords: exam.seo_keywords || undefined,
    ogImage: exam.og_image_url || undefined,
  });
}

export default async function ExamOverviewPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildExamJsonLd(exam)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />
      <ExamSubNav examSlug={exam.slug} activeTab="overview" />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {exam.title}
      </h1>

      {exam.description && (
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {exam.description}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exam.department && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Department</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{exam.department}</p>
          </div>
        )}
        {exam.vacancy_count && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Vacancies</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{exam.vacancy_count}</p>
          </div>
        )}
        {exam.pay_scale && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Pay Scale</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{exam.pay_scale}</p>
          </div>
        )}
      </div>

      {exam.eligibility && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Eligibility</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{exam.eligibility}</p>
        </div>
      )}
    </div>
  );
}
