import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getNotificationBySlug, getNotificationSlugs } from "@/lib/queries/notifications";

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

  const formattedDate = notification.published_at
    ? new Date(notification.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const breadcrumbItems = [
    { name: "Notifications", path: "/notifications" },
    { name: notification.title, path: `/notifications/${notification.slug}` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {notification.category && (
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {categoryLabels[notification.category] || notification.category}
          </span>
        )}
        {formattedDate && <span>{formattedDate}</span>}
        {notification.exam && (
          <Link href={`/exams/${notification.exam.slug}`} className="text-teal-600 hover:text-teal-700 dark:text-teal-400">
            {notification.exam.title}
          </Link>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{notification.title}</h1>

      {notification.body && (
        <div className="prose prose-gray mt-6 max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: notification.body }} />
        </div>
      )}

      {notification.source_url && (
        <div className="mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Official source:{" "}
            <a href={notification.source_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-700 dark:text-teal-400">
              View on official website
            </a>
          </p>
        </div>
      )}

      <div className="mt-8">
        <Link href="/notifications" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400">
          &larr; All Notifications
        </Link>
      </div>
    </div>
  );
}
