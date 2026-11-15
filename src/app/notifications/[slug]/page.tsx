import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeader } from "@/components/SectionHeader";
import { RelatedResources } from "@/components/RelatedResources";
import { BundleCard } from "@/components/BundleCard";
import { ResourceCard } from "@/components/ResourceCard";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getNotificationBySlug, getNotificationSlugs } from "@/lib/queries/notifications";
import { getAllBundles } from "@/lib/queries/bundles";
import { getResourcesForExam } from "@/lib/queries/resources";

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getNotificationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const notification = await getNotificationBySlug(params.slug);
  if (!notification) return {};
  return buildMetadata({
    title: notification.seo_title || notification.title,
    description: notification.seo_description || `${notification.title} — Read the full notification details.`,
    canonicalPath: `/notifications/${notification.slug}`,
    keywords: notification.focus_keyword ? [notification.focus_keyword] : undefined,
  });
}

const categoryLabels: Record<string, string> = {
  result: "Result",
  admit_card: "Admit Card",
  notification: "Notification",
  answer_key: "Answer Key",
};

export default async function NotificationDetailPage({ params }: PageProps) {
  const notification = await getNotificationBySlug(params.slug);
  if (!notification) notFound();
  const bundles = await getAllBundles();
  const resources =
    notification.exam_id ? await getResourcesForExam(notification.exam_id, 4) : [];
  const relatedBundles = notification.exam
    ? bundles.filter((bundle) => bundle.exams?.some((e) => e.slug === notification.exam?.slug))
    : [];

  const formattedDate = notification.published_at
    ? new Date(notification.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const breadcrumbItems = [
    { name: "Notifications", path: "/notifications" },
    { name: notification.title, path: `/notifications/${notification.slug}` },
  ];
  const relatedResources = notification.exam
    ? [
        {
          href: `/exams/${notification.exam.slug}`,
          title: `${notification.exam.title} exam hub`,
          description: "Open the main resource hub for this exam.",
          label: "Hub",
        },
        {
          href: `/exams/${notification.exam.slug}/previous-papers`,
          title: "Previous year papers",
          description: "Go from this update directly into paper practice.",
          label: "Paper",
        },
        {
          href: `/exams/${notification.exam.slug}/syllabus`,
          title: "Section-wise syllabus",
          description: "Review the syllabus right after checking the update.",
          label: "Syllabus",
        },
        {
          href: `/exams/${notification.exam.slug}/important-dates`,
          title: "Important dates",
          description: "Check the exam timeline linked to this notification.",
          label: "Timeline",
        },
      ]
    : [];

  return (
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />

      <div className="surface-card p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[hsl(var(--muted))]">
          {notification.category && (
            <span className="rounded-full bg-[hsl(var(--panel-soft))] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-strong))]">
              {categoryLabels[notification.category] || notification.category}
            </span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
          {notification.exam && (
            <Link href={`/exams/${notification.exam.slug}`} className="pill-link-muted bg-[hsl(var(--panel))]">
              {notification.exam.title}
            </Link>
          )}
        </div>

        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))] sm:text-4xl">{notification.title}</h1>

        {notification.exam && (
          <div className="mt-5">
            <Link href={`/exams/${notification.exam.slug}`} className="pill-link">
              Open exam resource hub
            </Link>
          </div>
        )}
      </div>

      {notification.body && (
        <div className="surface-card mt-8 p-6 sm:p-8">
          <div className="text-sm leading-7 text-[hsl(var(--muted))] [&_a]:text-[hsl(var(--accent-strong))] [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[hsl(var(--foreground))] [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[hsl(var(--foreground))] [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3" dangerouslySetInnerHTML={{ __html: notification.body }} />
        </div>
      )}

      {notification.source_url && (
        <div className="surface-card mt-8 p-5">
          <p className="text-sm text-[hsl(var(--muted))]">
            Official source:{" "}
            <a href={notification.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[hsl(var(--accent-strong))] underline">
              View on official website
            </a>
          </p>
        </div>
      )}

      {relatedResources.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            kicker="Keep preparing"
            title="Helpful resources for this exam"
          />
          <div className="mt-6">
            <RelatedResources items={relatedResources} />
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            kicker="More to explore"
            title="Notes, guides & links for this exam"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
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
            title="Ready-made study pack"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {relatedBundles.slice(0, 2).map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Link href="/notifications" className="pill-link">
          All notifications
        </Link>
      </div>
    </div>
  );
}
