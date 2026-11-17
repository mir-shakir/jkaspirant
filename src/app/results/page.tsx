import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { resultSheets } from "@/content/results";

export const metadata = buildMetadata({
  title: "JKSSB Results: Search by Roll Number or Name",
  description: "Find your JKSSB marks and rank quickly without opening large result PDFs.",
  canonicalPath: "/results",
});

export default function ResultsPage() {
  const breadcrumbItems = [{ name: "Results", path: "/results" }];
  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Results" lede="Search a result by roll number or name. No 300-page PDFs." />
      <GroupList className="mt-6">
        {resultSheets.map((s) => (
          <Row key={s.slug} href={`/results/${s.slug}`} title={`${s.title} result`} sub={`${s.declared ? `Declared ${s.declared}` : `Exam ${s.examDate}`} · ${s.rows.length.toLocaleString("en-IN")} candidates`} />
        ))}
      </GroupList>
    </div>
  );
}
