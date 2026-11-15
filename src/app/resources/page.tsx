import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmptyState, GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllExams, getLatestPapers } from "@/lib/queries/exams";
import { getAllResources } from "@/lib/queries/resources";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Previous Papers & Study Resources — JKSSB, JKPSC",
  description: "Previous year question papers and trusted study resources for JKSSB and JKPSC exams, free to download.",
  canonicalPath: "/resources",
  keywords: ["JKSSB previous papers", "JKPSC previous papers", "JKSSB question paper pdf"],
});

export default async function ResourcesPage() {
  const [exams, papers, resources] = await Promise.all([getAllExams(), getLatestPapers(8), getAllResources(12)]);
  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: "Papers", path: "/resources" },
  ];
  const links = resources.filter((r) => !r.is_premium);

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Previous papers" lede="Free PDFs. Pick your exam to see every paper for it." />

      <Section title="By exam" className="!mt-6">
        {exams.length > 0 ? (
          <GroupList>
            {exams.map((exam) => (
              <Row key={exam.id} href={`/exams/${exam.slug}/previous-papers`} title={exam.title} sub={exam.department || undefined} />
            ))}
          </GroupList>
        ) : (
          <EmptyState>Papers are being added. Check back soon.</EmptyState>
        )}
      </Section>

      {papers.length > 0 && (
        <Section title="Recently added">
          <GroupList>
            {papers.map((paper) => (
              <Row
                key={paper.id}
                href={paper.exam?.slug ? `/exams/${paper.exam.slug}/previous-papers` : "/exams"}
                title={paper.title}
                sub={[paper.exam?.title, paper.year].filter(Boolean).join(" · ")}
              />
            ))}
          </GroupList>
        </Section>
      )}

      {links.length > 0 && (
        <Section title="Trusted resources">
          <GroupList>
            {links.map((resource) => (
              <Row
                key={resource.id}
                href={resource.url}
                external={resource.is_external}
                title={resource.title}
                sub={resource.source_label || resource.description || resource.exam?.title || undefined}
              />
            ))}
          </GroupList>
        </Section>
      )}
    </div>
  );
}
