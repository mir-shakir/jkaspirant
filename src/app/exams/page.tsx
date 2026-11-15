import { Metadata } from "next";
import { ExamCard } from "@/components/ExamCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchHero } from "@/components/SearchHero";
import { SectionHeader } from "@/components/SectionHeader";
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
  const searchItems = exams.flatMap((exam) => [
    {
      title: exam.title,
      description: "Open exam hub",
      href: `/exams/${exam.slug}`,
      tag: "Exam",
    },
    {
      title: `${exam.title} previous papers`,
      description: "Download papers",
      href: `/exams/${exam.slug}/previous-papers`,
      tag: "Paper",
    },
    {
      title: `${exam.title} syllabus`,
      description: "Section-wise syllabus",
      href: `/exams/${exam.slug}/syllabus`,
      tag: "Syllabus",
    },
  ]);

  return (
    <div className="page-shell py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />

      <SearchHero
        kicker="Your exams"
        title="Find your exam and start preparing — papers, syllabus, dates, all in one place."
        placeholder="Type your exam name..."
        items={searchItems}
        quickLinks={[
          { label: "All papers", href: "/resources" },
          { label: "Study packs", href: "/bundles" },
          { label: "Latest updates", href: "/notifications" },
        ]}
      />

      <section className="mt-10">
        <SectionHeader
          kicker="All exams"
          title="JKSSB & JKPSC exams we cover"
        />
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      {exams.length === 0 && (
        <p className="surface-card mt-8 p-5 text-center text-[hsl(var(--muted))]">
          No exams listed yet — we&apos;re working on adding them. Check back soon!
        </p>
      )}
    </div>
  );
}
