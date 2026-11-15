import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { CutoffTable } from "@/components/CutoffTable";
import { RelatedResources } from "@/components/RelatedResources";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getExamBySlug, getExamSlugs, getCutoffs } from "@/lib/queries/exams";

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
    title: `${exam.title} Cut-off Marks — Category Wise`,
    description: `${exam.title} cut-off marks category wise — General, OBC, SC, ST, EWS. Year-wise cut-off history.`,
    canonicalPath: `/exams/${exam.slug}/cut-offs`,
    keywords: [`${exam.title} cut off`, `JKSSB ${exam.title} cut off category wise`],
  });
}

export default async function CutoffsPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const cutoffs = await getCutoffs(exam.id);

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
    { name: "Cut-offs", path: `/exams/${exam.slug}/cut-offs` },
  ];

  return (
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Reference point</p>
        <h1 className="mt-3 text-3xl font-semibold text-[hsl(var(--foreground))]">{exam.title} Cut-off Marks</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--muted))]">
          Use the year filter to compare competition trends, then move back into papers and syllabus from the same exam flow.
        </p>
      </div>
      <div className="mt-8">
        <ExamSubNav examSlug={exam.slug} activeTab="cut-offs" />
      </div>
      <div className="mt-6"><CutoffTable cutoffs={cutoffs} /></div>
      <div className="mt-10">
        <RelatedResources
          items={[
            {
              href: `/exams/${exam.slug}/previous-papers`,
              title: "Open papers",
              description: "Review paper trends alongside cut-offs to judge difficulty.",
              label: "Paper",
            },
            {
              href: `/exams/${exam.slug}/syllabus`,
              title: "Open syllabus",
              description: "Move back to the topic list after checking the cut-off trend.",
              label: "Syllabus",
            },
            {
              href: `/exams/${exam.slug}`,
              title: "Back to exam hub",
              description: "Return to the main resource summary for this exam.",
              label: "Hub",
            },
          ]}
        />
      </div>
    </div>
  );
}
