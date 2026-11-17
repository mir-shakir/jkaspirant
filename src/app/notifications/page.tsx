import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { UpdatesList } from "@/components/UpdatesList";
import { EmptyState, PageHeader } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllPublishedNotifications } from "@/lib/queries/notifications";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Updates — JKSSB Notifications, Admit Cards, Answer Keys, Results",
  description: "Latest JKSSB updates: new notifications, admit cards, answer keys and results, each linked to the official notice.",
  canonicalPath: "/notifications",
  keywords: ["JKSSB notifications", "JKSSB results", "JKSSB admit card", "JKSSB answer key"],
});

export default async function NotificationsPage() {
  const notifications = await getAllPublishedNotifications();
  const breadcrumbItems = [{ name: "Updates", path: "/notifications" }];

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Updates" lede="Every item links to the official notice." />

      <div className="mt-5">
        {notifications.length > 0 ? (
          <UpdatesList
            updates={notifications.map((n) => ({ slug: n.slug, title: n.title, category: n.category, published_at: n.published_at }))}
          />
        ) : (
          <EmptyState>New JKSSB notices appear here the day they are published.</EmptyState>
        )}
      </div>
    </div>
  );
}
