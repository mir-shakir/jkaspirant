import { Metadata } from "next";
import { NotificationCard } from "@/components/NotificationCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchHero } from "@/components/SearchHero";
import { SectionHeader } from "@/components/SectionHeader";
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
  const searchItems = notifications.map((notification) => ({
    title: notification.title,
    description: notification.exam?.title
      ? `Update for ${notification.exam.title}`
      : "Exam update",
    href: `/notifications/${notification.slug}`,
    tag: notification.category || "Update",
  }));

  return (
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />

      <SearchHero
        kicker="Stay informed"
        title="Latest JKSSB & JKPSC notifications — don't miss a thing."
        placeholder="Search for a result, admit card, or update..."
        items={searchItems}
        quickLinks={[
          { label: "Browse resources", href: "/resources" },
          { label: "Exam hubs", href: "/exams" },
          { label: "Study packs", href: "/bundles" },
        ]}
      />

      <section className="mt-10">
        <SectionHeader
          kicker="What's new"
          title="Recent notifications"
        />
      </section>

      <div className="mt-5 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => <NotificationCard key={n.id} notification={n} />)
        ) : (
          <p className="surface-card mt-8 p-5 text-center text-[hsl(var(--muted))]">No updates yet — we&apos;ll post here as soon as something important comes up.</p>
        )}
      </div>
    </div>
  );
}
