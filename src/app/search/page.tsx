import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchBox, type SearchItem } from "@/components/SearchBox";
import { PageHeader } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";
import { getAllPublishedNotifications } from "@/lib/queries/notifications";
import { rankExams } from "@/config/rank-predictor";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search JK Aspirant for an exam, syllabus, previous papers, updates or tools.",
  canonicalPath: "/search",
  noIndex: true,
});

export default async function SearchPage() {
  const [exams, notifications] = await Promise.all([getAllExams(), getAllPublishedNotifications()]);
  const breadcrumbItems = [{ name: "Search", path: "/search" }];

  const tools: SearchItem[] = rankExams
    .filter((e) => e.isOpen)
    .map((e) => ({ title: `${e.name} rank predictor`, href: `/tools/${e.toolSlug}`, kind: "Tool", keywords: `${e.fullName} score calculator cut off` }));

  const items: SearchItem[] = [
    ...tools,
    ...exams.flatMap((exam) => {
      const keywords = `${exam.department ?? ""} ${exam.slug.replace(/-/g, " ")}`;
      return [
        { title: exam.title, href: `/exams/${exam.slug}`, kind: "Exam", keywords },
        { title: `${exam.title} syllabus`, href: `/exams/${exam.slug}/syllabus`, kind: "Syllabus", keywords },
        { title: `${exam.title} previous papers`, href: `/exams/${exam.slug}/previous-papers`, kind: "Papers", keywords: `${keywords} question paper pdf` },
        { title: `${exam.title} cut-offs`, href: `/exams/${exam.slug}/cut-offs`, kind: "Cut-offs", keywords: `${keywords} cutoff cut off` },
        { title: `${exam.title} dates`, href: `/exams/${exam.slug}/important-dates`, kind: "Dates", keywords },
      ];
    }),
    ...notifications.map((n) => ({ title: n.title, href: `/notifications/${n.slug}`, kind: "Update", keywords: `${n.category ?? ""} ${n.exam?.title ?? ""}` })),
    { title: "Exam calendar", href: "/calendar", kind: "Calendar", keywords: "dates schedule admit card" },
  ];

  const suggestions: SearchItem[] = [
    ...tools,
    { title: "Exam calendar", href: "/calendar", kind: "Calendar" },
    ...notifications.slice(0, 2).map((n) => ({ title: n.title, href: `/notifications/${n.slug}`, kind: "Update" })),
    ...exams.slice(0, 3).map((exam) => ({ title: exam.title, href: `/exams/${exam.slug}`, kind: "Exam" })),
  ];

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Search" />
      <div className="mt-4">
        <SearchBox items={items} suggestions={suggestions} />
      </div>
    </div>
  );
}
