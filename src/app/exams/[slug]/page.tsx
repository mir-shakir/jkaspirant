import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import { SectionHeader } from "@/components/SectionHeader";
import { RelatedResources } from "@/components/RelatedResources";
import { BundleCard } from "@/components/BundleCard";
import { NotificationCard } from "@/components/NotificationCard";
import { ResourceCard } from "@/components/ResourceCard";
import {
  buildMetadata,
  buildExamJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import {
  getCutoffs,
  getExamBySlug,
  getExamDates,
  getExamSlugs,
  getPapers,
  getSyllabusSections,
} from "@/lib/queries/exams";
import { getAllBundles } from "@/lib/queries/bundles";
import { getAllPublishedNotifications } from "@/lib/queries/notifications";
import { getResourcesForExam } from "@/lib/queries/resources";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getExamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const exam = await getExamBySlug(params.slug);
  if (!exam) return {};

  return buildMetadata({
    title: exam.seo_title || `${exam.title} — Exam Details`,
    description:
      exam.seo_description ||
      `Complete details for ${exam.title} exam including syllabus, previous papers, cut-offs, and important dates.`,
    canonicalPath: `/exams/${exam.slug}`,
    keywords: exam.seo_keywords || undefined,
    ogImage: exam.og_image_url || undefined,
  });
}

export default async function ExamOverviewPage({ params }: PageProps) {
  const exam = await getExamBySlug(params.slug);
  if (!exam) notFound();

  const [papers, syllabusSections, dates, cutoffs, bundles, notifications, resources] =
    await Promise.all([
      getPapers(exam.id),
      getSyllabusSections(exam.id),
      getExamDates(exam.id),
      getCutoffs(exam.id),
      getAllBundles(),
      getAllPublishedNotifications(),
      getResourcesForExam(exam.id, 8),
    ]);

  const relatedBundles = bundles.filter((bundle) => bundle.exams?.some((e) => e.slug === exam.slug));
  const relatedNotifications = notifications.filter(
    (notification) => notification.exam_id === exam.id
  );
  const resourceItems = [
    ...resources.slice(0, 3).map((resource) => ({
      href: resource.url,
      title: resource.title,
      description:
        resource.description ||
        "Study material linked to this exam.",
      label: resource.is_premium ? "Premium" : "Resource",
      external: resource.is_external,
    })),
    {
      href: `/exams/${exam.slug}/previous-papers`,
      title: "Previous year papers",
      description:
        papers.length > 0
          ? `${papers.length} paper${papers.length === 1 ? "" : "s"} available for download.`
          : "Check the papers section for downloadable PDFs.",
      label: "Free",
    },
    {
      href: `/exams/${exam.slug}/syllabus`,
      title: "Section-wise syllabus",
      description:
        syllabusSections.length > 0
          ? `${syllabusSections.length} syllabus section${syllabusSections.length === 1 ? "" : "s"} ready to browse.`
          : "Browse the syllabus section for topics and marks.",
      label: "Study",
    },
    {
      href: `/exams/${exam.slug}/important-dates`,
      title: "Important dates",
      description:
        dates.length > 0
          ? `${dates.length} key date${dates.length === 1 ? "" : "s"} listed for this exam.`
          : "See upcoming dates, timelines, and tentative events.",
      label: "Timeline",
    },
    ...(cutoffs.length > 0
      ? [
          {
            href: `/exams/${exam.slug}/cut-offs`,
            title: "Cut-off trends",
            description: `See ${cutoffs.length} previous cut-off entries and track the trend.`,
            label: "Reference",
          },
        ]
      : []),
    ...(relatedBundles[0]
      ? [
          {
            href: `/bundles/${relatedBundles[0].slug}`,
            title: relatedBundles[0].title,
            description: "A ready-made study bundle for this exam.",
            label: "Premium",
          },
        ]
      : []),
  ];

  const breadcrumbItems = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
  ];

  return (
    <div className="page-shell py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildExamJsonLd(exam)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />

      <Breadcrumb items={breadcrumbItems} />
      <div className="surface-card overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="section-kicker">Your exam hub</p>
            <h1 className="mt-3 text-3xl font-semibold text-[hsl(var(--foreground))] sm:text-4xl">
              {exam.title}
            </h1>

            {exam.description && (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted))] sm:text-base">
                {exam.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`/exams/${exam.slug}/previous-papers`} className="pill-link">
                Get papers →
              </Link>
              <Link href={`/exams/${exam.slug}/syllabus`} className="pill-link">
                View syllabus →
              </Link>
              <Link href={`/exams/${exam.slug}/important-dates`} className="pill-link">
                Important dates →
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {exam.department && (
              <div className="surface-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
                  Department
                </p>
                <p className="mt-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                  {exam.department}
                </p>
              </div>
            )}
            {exam.vacancy_count && (
              <div className="surface-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
                  Vacancies
                </p>
                <p className="mt-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                  {exam.vacancy_count}
                </p>
              </div>
            )}
            {exam.pay_scale && (
              <div className="surface-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
                  Pay scale
                </p>
                <p className="mt-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                  {exam.pay_scale}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ExamSubNav examSlug={exam.slug} activeTab="overview" />
      </div>

      <section className="mt-10">
        <SectionHeader
          kicker="Get started"
          title="Everything you need for this exam"
        />
        <div className="mt-6">
          <RelatedResources items={resourceItems} />
        </div>
      </section>

      {resources.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            kicker="Extra resources"
            title="More notes, guides & links"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      {relatedBundles.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            kicker="Save time"
            title="Study packs for this exam"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedBundles.slice(0, 3).map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>
      )}

      {relatedNotifications.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            kicker="Stay updated"
            title="Recent notifications for this exam"
          />
          <div className="mt-6 space-y-3">
            {relatedNotifications.slice(0, 3).map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </section>
      )}

      {exam.eligibility && (
        <section className="mt-12">
          <SectionHeader
            kicker="Good to know"
            title="Who can apply"
          />
          <div className="surface-card mt-6 p-5 text-sm leading-7 text-[hsl(var(--muted))]">
            {exam.eligibility}
          </div>
        </section>
      )}
    </div>
  );
}
