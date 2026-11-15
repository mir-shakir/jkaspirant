import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmptyState, GroupList, PageHeader, Row } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";
import { liveExams } from "@/config/exams";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Exams — JKSSB Updates, Dates and Tools",
  description: "The JKSSB exams JK Aspirant is covering right now, with the latest updates, dates and tools for each.",
  canonicalPath: "/exams",
});

export default async function ExamsPage() {
  const exams = await getAllExams();
  const breadcrumbItems = [{ name: "Exams", path: "/exams" }];

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Exams" lede="The exams we are covering right now. More are added as they come up." />

      <div className="mt-5">
        {exams.length > 0 ? (
          <GroupList>
            {exams.map((exam) => (
              <Row
                key={exam.id}
                href={`/exams/${exam.slug}`}
                title={exam.title}
                sub={liveExams[exam.slug]?.status}
                meta={exam.vacancy_count ? `${exam.vacancy_count.toLocaleString("en-IN")} posts` : undefined}
              />
            ))}
          </GroupList>
        ) : (
          <EmptyState>Exams are being added. Check back soon.</EmptyState>
        )}
      </div>

      <GroupList className="mt-6">
        <Row href="/calendar" title="Exam calendar" sub="Upcoming exam and admit card dates" />
      </GroupList>
    </div>
  );
}
