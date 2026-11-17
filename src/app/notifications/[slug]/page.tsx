import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TelegramNudge } from "@/components/TelegramNudge";
import { GroupList, Row, categoryLabels, formatLongDate } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getNotificationBySlug, getNotificationSlugs } from "@/lib/queries/notifications";
import { getRankExamForExamSlug } from "@/config/rank-predictor";
import { siteConfig } from "@/config/site";
import { liveExams } from "@/config/exams";

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
    description: notification.seo_description || `${notification.title} — full details and the official notice.`,
    canonicalPath: `/notifications/${notification.slug}`,
    keywords: notification.focus_keyword ? [notification.focus_keyword] : undefined,
  });
}

export default async function NotificationDetailPage({ params }: PageProps) {
  const notification = await getNotificationBySlug(params.slug);
  if (!notification) notFound();

  const breadcrumbItems = [
    { name: "Updates", path: "/notifications" },
    { name: notification.title, path: `/notifications/${notification.slug}` },
  ];
  const rankTool = notification.exam ? getRankExamForExamSlug(notification.exam.slug) : null;
  let sourceHost: string | null = null;
  try {
    if (notification.source_url) sourceHost = new URL(notification.source_url).hostname.replace(/^www\./, "");
  } catch {}

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: notification.title,
    datePublished: notification.published_at,
    dateModified: notification.updated_at,
    mainEntityOfPage: `${siteConfig.url}/notifications/${notification.slug}`,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <article className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />

      <p className="flex flex-wrap items-center gap-2 text-[13px] text-[hsl(var(--muted))]">
        {notification.category && <span className="tag">{categoryLabels[notification.category] || notification.category}</span>}
        {notification.published_at && <time dateTime={notification.published_at}>{formatLongDate(notification.published_at)}</time>}
      </p>
      <h1 className="mt-2 text-[28px] leading-[1.15] sm:text-[36px]">{notification.title}</h1>

      {notification.body && <div className="notice-body mt-4" dangerouslySetInnerHTML={{ __html: notification.body }} />}

      {notification.source_url && (
        <a href={notification.source_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-7 w-full sm:w-auto">
          Open official notice
          {sourceHost && <span className="font-normal opacity-80">· {sourceHost}</span>}
        </a>
      )}

      <GroupList className="mt-8">
        {rankTool && (
          <Row href={`/tools/${rankTool.toolSlug}`} title={`Predict your ${rankTool.name} rank`} sub="Score and expected rank in under a minute" />
        )}
        {notification.exam && (
          <Row href={`/exams/${notification.exam.slug}`} title={liveExams[notification.exam.slug]?.title ?? notification.exam.title} sub="All updates and dates for this exam" />
        )}
        <Row
          href={`/feedback?type=wrong_info&page=${encodeURIComponent(`/notifications/${notification.slug}`)}`}
          title="Report wrong information"
          sub="Something here doesn't match the notice?"
        />
      </GroupList>

      <TelegramNudge className="mt-6" />
    </article>
  );
}
