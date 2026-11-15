import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchHero } from "@/components/SearchHero";
import { SectionHeader } from "@/components/SectionHeader";
import { ExamCard } from "@/components/ExamCard";
import { BundleCard } from "@/components/BundleCard";
import { NotificationCard } from "@/components/NotificationCard";
import { RelatedResources } from "@/components/RelatedResources";
import { ResourceCard } from "@/components/ResourceCard";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllExams, getLatestPapers } from "@/lib/queries/exams";
import { getLatestNotifications } from "@/lib/queries/notifications";
import { getAllBundles } from "@/lib/queries/bundles";
import { getAllResources, getFeaturedResources } from "@/lib/queries/resources";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Resources — Papers, Syllabus, Bundles",
  description:
    "Browse previous papers, syllabus, exam hubs, study packs, and useful updates in one place.",
  canonicalPath: "/resources",
  keywords: ["JKSSB resources", "JKPSC previous papers", "JK exam notes"],
});

export default async function ResourcesPage() {
  const [exams, bundles, papers, notifications, resources, featuredResources] =
    await Promise.all([
    getAllExams(),
    getAllBundles(),
    getLatestPapers(6),
    getLatestNotifications(3),
    getAllResources(),
    getFeaturedResources(6),
  ]);

  const breadcrumbItems = [{ name: "Resources", path: "/resources" }];
  const searchItems = [
    ...exams.flatMap((exam) => [
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
    ]),
    ...bundles.map((bundle) => ({
      title: bundle.title,
      description: bundle.exams?.length
        ? `Study pack for ${bundle.exams.map((e) => e.title).join(", ")}`
        : "Curated study pack",
      href: `/bundles/${bundle.slug}`,
      tag: "Pack",
    })),
    ...notifications.map((notification) => ({
      title: notification.title,
      description: "Exam update",
      href: `/notifications/${notification.slug}`,
      tag: "Update",
    })),
    ...resources.map((resource) => ({
      title: resource.title,
      description:
        resource.description ||
        (resource.exam?.title
          ? `Resource for ${resource.exam.title}`
          : "Study resource"),
      href: resource.url,
      tag: "Resource",
      external: resource.is_external,
    })),
  ];

  const paperItems = papers.map((paper) => ({
    href: paper.exam?.slug
      ? `/exams/${paper.exam.slug}/previous-papers`
      : "/resources",
    title: paper.title,
    description: paper.exam?.title
      ? `Papers for ${paper.exam.title}`
      : "Open paper list",
    label: "Paper",
  }));
  const nonFeaturedResources = resources.filter(
    (resource) => !featuredResources.some((item) => item.id === resource.id)
  );

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
        kicker="Resource library"
        title="Everything for your exam prep — papers, notes, packs, and links."
        placeholder="Try 'Junior Assistant papers' or 'FAA syllabus'..."
        items={searchItems}
        quickLinks={[
          { label: "Exam hubs", href: "/exams" },
          { label: "Study packs", href: "/bundles" },
          { label: "Latest updates", href: "/notifications" },
        ]}
      />

      {featuredResources.length > 0 && (
        <section className="mt-10">
          <SectionHeader
            kicker="Top picks"
            title="We recommend starting here"
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionHeader
          kicker="Fresh papers"
          title="Recently added previous year papers"
        />
        <div className="mt-5">
          <RelatedResources items={paperItems} />
        </div>
      </section>

      {nonFeaturedResources.length > 0 && (
        <section className="mt-10">
          <SectionHeader
            kicker="More to explore"
            title="Helpful notes, guides & links"
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nonFeaturedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionHeader
          kicker="By exam"
          title="Jump into a specific exam"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeader
            kicker="Study packs"
            title="Ready-made bundles to save time"
          />
          <div className="mt-5 grid gap-4">
            {bundles.slice(0, 4).map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            kicker="Stay updated"
            title="Recent exam notifications"
          />
          <div className="mt-5 space-y-3">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
