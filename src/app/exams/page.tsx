import { Metadata } from "next";
import { ExamCard } from "@/components/ExamCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";

export const metadata: Metadata = buildMetadata({
  title: "All Exams — JKSSB & JKPSC",
  description:
    "Browse all JKSSB and JKPSC exams with syllabus, previous papers, cut-offs, and important dates.",
  canonicalPath: "/exams",
  keywords: ["JKSSB exams", "JKPSC exams", "JK government exams list"],
});

export default async function ExamsPage() {
  const exams = await getAllExams();

  const breadcrumbItems = [{ name: "Exams", path: "/exams" }];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        All Exams
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Select an exam to view syllabus, previous papers, cut-offs, and
        important dates.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      {exams.length === 0 && (
        <p className="mt-8 text-center text-gray-500 dark:text-gray-400">
          No exams available yet. Check back soon.
        </p>
      )}
    </div>
  );
}
