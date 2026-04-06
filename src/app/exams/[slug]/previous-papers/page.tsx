import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { PapersList } from "@/components/PapersList";
import { RelatedResources } from "@/components/RelatedResources";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getExamBySlug, getExamSlugs, getPapers } from "@/lib/queries/exams";

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
    title: `${exam.title} Previous Year Papers`,
    description: `Download ${exam.title} previous year question papers PDF — year-wise and subject-wise.`,
    canonicalPath: `/exams/${exam.slug}/previous-papers`,
    keywords: [`${exam.title} previous papers`, `JKSSB ${exam.title} question papers PDF`],
  });
}

export default async function PreviousPapersPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const papers = await getPapers(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Previous Papers", path: `/exams/${exam.slug}/previous-papers` },
  ];

  return (
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Free resources</p>
        <h1 className="mt-3 text-3xl font-semibold text-[hsl(var(--foreground))]">{exam.title} Previous Year Papers</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--muted))]">
          Download question papers quickly and move to the syllabus or important dates without leaving the exam flow.
        </p>
      </div>
      <div className="mt-8">
        <ExamSubNav examSlug={exam.slug} activeTab="previous-papers" />
      </div>
      <div className="mt-6"><PapersList papers={papers} /></div>
      <div className="mt-10">
        <RelatedResources
          items={[
            {
              href: `/exams/${exam.slug}`,
              title: "Back to exam hub",
              description: "Open the full exam overview and resource summary.",
              label: "Hub",
            },
            {
              href: `/exams/${exam.slug}/syllabus`,
              title: "Open syllabus",
              description: "Use the paper list together with the syllabus to focus preparation.",
              label: "Syllabus",
            },
            {
              href: `/exams/${exam.slug}/important-dates`,
              title: "Check dates",
              description: "Review key dates without leaving the exam section.",
              label: "Timeline",
            },
          ]}
        />
      </div>
    </div>
  );
}
