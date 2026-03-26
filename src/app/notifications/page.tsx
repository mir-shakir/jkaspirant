import { Metadata } from "next";
import { NotificationCard } from "@/components/NotificationCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllPublishedNotifications } from "@/lib/queries/notifications";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Notifications — JKSSB & JKPSC Updates",
  description:
    "Latest JKSSB and JKPSC notifications — results, admit cards, answer keys, and new recruitment updates.",
  canonicalPath: "/notifications",
  keywords: ["JKSSB notifications", "JKPSC notifications", "JKSSB results", "JKSSB admit card"],
});

export default async function NotificationsPage() {
  const notifications = await getAllPublishedNotifications();
  const breadcrumbItems = [{ name: "Notifications", path: "/notifications" }];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Notifications</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Latest updates from JKSSB and JKPSC — results, admit cards, answer keys, and new notifications.</p>
      <div className="mt-6 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => <NotificationCard key={n.id} notification={n} />)
        ) : (
          <p className="mt-8 text-center text-gray-500 dark:text-gray-400">No notifications yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
