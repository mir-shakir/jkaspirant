import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
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
  const listed = exams.filter((exam) => !liveExams[exam.slug]?.unlisted);
  const dated = listed.filter((exam) => !liveExams[exam.slug]?.awaited);
  const awaited = listed.filter((exam) => liveExams[exam.slug]?.awaited);
  const row = (exam: (typeof exams)[number]) => (
    <Row
      key={exam.id}
      href={`/exams/${exam.slug}`}
      title={exam.title}
      sub={liveExams[exam.slug]?.status}
      meta={exam.vacancy_count ? `${exam.vacancy_count.toLocaleString("en-IN")} posts` : undefined}
    />
  );

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Exams" lede="Exams with a confirmed date, and advertisements still waiting for one." />

      <Section title="Exam dates announced" className="!mt-6">
        <GroupList>{dated.map(row)}</GroupList>
      </Section>

      {awaited.length > 0 && (
        <Section title="Date awaited">
          <GroupList>{awaited.map(row)}</GroupList>
        </Section>
      )}

      <GroupList className="mt-6">
        <Row href="/calendar" title="Exam calendar" sub="Upcoming exam and admit card dates" />
      </GroupList>
    </div>
  );
}
