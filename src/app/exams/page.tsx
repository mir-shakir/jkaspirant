import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmptyState, GroupList, PageHeader, Row } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Exams — JKSSB & JKPSC Syllabus, Papers and Cut-offs",
  description: "Pick your JKSSB or JKPSC exam to see its syllabus, previous papers, cut-offs and important dates.",
  canonicalPath: "/exams",
});

export default async function ExamsPage() {
  const exams = await getAllExams();
  const breadcrumbItems = [{ name: "Exams", path: "/exams" }];

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Exams" lede="Pick yours. Syllabus, papers, cut-offs and dates are inside." />

      <div className="mt-5">
        {exams.length > 0 ? (
          <GroupList>
            {exams.map((exam) => (
              <Row
                key={exam.id}
                href={`/exams/${exam.slug}`}
                title={exam.title}
                sub={exam.department || undefined}
                meta={exam.vacancy_count ? `${exam.vacancy_count.toLocaleString("en-IN")} posts` : undefined}
              />
            ))}
          </GroupList>
        ) : (
          <EmptyState>Exams are being added. Check back soon.</EmptyState>
        )}
      </div>

      <GroupList className="mt-6">
        <Row href="/resources" title="All previous papers" sub="Every paper we have, across exams" />
        <Row href="/calendar" title="Exam calendar" sub="Upcoming exam and admit card dates" />
      </GroupList>
    </div>
  );
}
