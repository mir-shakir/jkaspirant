import Link from "next/link";
import { ExamCard } from "@/components/ExamCard";
import { NotificationCard } from "@/components/NotificationCard";
import { BundleCard } from "@/components/BundleCard";
import { SearchHero } from "@/components/SearchHero";
import { SectionHeader } from "@/components/SectionHeader";
import { RelatedResources } from "@/components/RelatedResources";
import { ResourceCard } from "@/components/ResourceCard";
import { buildMetadata } from "@/lib/seo";
import { getAllExams, getLatestPapers } from "@/lib/queries/exams";
import { getLatestNotifications } from "@/lib/queries/notifications";
import { getAllBundles } from "@/lib/queries/bundles";
import { getFeaturedResources } from "@/lib/queries/resources";

export const revalidate = 1800; // ISR: revalidate every 30 minutes

export const metadata = buildMetadata({
  title: "JK Aspirant — JKSSB & JKPSC Exam Hub",
  description:
    "Your one-stop resource for JKSSB and JKPSC exam notifications, syllabi, previous papers, cut-offs, and important dates.",
  canonicalPath: "/",
});

export default async function HomePage() {
  const [exams, notifications, bundles, papers, featuredResources] =
    await Promise.all([
    getAllExams(),
    getLatestNotifications(3),
    getAllBundles(),
    getLatestPapers(4),
    getFeaturedResources(4),
  ]);

  const searchItems = [
    ...exams.flatMap((exam) => [
      {
        title: `${exam.title} previous papers`,
        description: "Download papers and free resources",
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
    ...papers.map((paper) => ({
      title: paper.title,
      description: paper.exam?.title
        ? `Paper for ${paper.exam.title}`
        : "Previous paper",
      href: paper.exam?.slug
        ? `/exams/${paper.exam.slug}/previous-papers`
        : "/resources",
      tag: "Paper",
    })),
    ...notifications.map((notification) => ({
      title: notification.title,
      description: "Exam update",
      href: `/notifications/${notification.slug}`,
      tag: "Update",
    })),
    ...featuredResources.map((resource) => ({
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

  const recentPaperResources = papers.map((paper) => ({
    href: paper.exam?.slug
      ? `/exams/${paper.exam.slug}/previous-papers`
      : "/resources",
    title: paper.title,
    description: paper.exam?.title
      ? `Download papers for ${paper.exam.title}`
      : "Open previous paper",
    label: "Paper",
  }));

  return (
    <div className="page-shell py-8 sm:py-10">
      <SearchHero
        kicker="Start here"
        title="Everything you need for your JKSSB & JKPSC preparation, in one place."
        placeholder="Try 'Junior Assistant syllabus' or 'FAA papers'..."
        items={searchItems}
        quickLinks={[
          { label: "Previous papers", href: "/resources" },
          { label: "Exam hubs", href: "/exams" },
          { label: "Study packs", href: "/bundles" },
          { label: "Latest updates", href: "/notifications" },
        ]}
      />

      <section className="mt-10">
        <SectionHeader
          kicker="Your exams"
          title="Pick your exam, get everything you need"
          href="/exams"
          linkLabel="See all exams →"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exams.slice(0, 6).map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <SectionHeader
            kicker="Helpful reads"
            title="Notes, guides & useful links"
          />
          {featuredResources.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {featuredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="surface-card mt-5 p-5 text-sm text-[hsl(var(--muted))]">
              More resources coming soon — we&apos;re adding notes, books, and helpful links regularly.
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            kicker="Fresh papers"
            title="Recently added papers"
          />
          <div className="mt-5">
            <RelatedResources items={recentPaperResources} />
          </div>
        </div>
      </section>

      {bundles.length > 0 && (
        <section className="mt-10">
          <SectionHeader
            kicker="Study packs"
            title="Save time with ready-made bundles"
            href="/bundles"
            linkLabel="Browse all packs →"
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bundles.slice(0, 3).map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionHeader
          kicker="Stay updated"
          title="Don't miss important notices"
          href="/notifications"
          linkLabel="See all updates →"
        />
        <div className="mt-5 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="surface-card p-5 text-sm text-[hsl(var(--muted))]">
              No new updates right now. We&apos;ll post here as soon as something comes up.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="surface-card grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="section-kicker">You can trust us</p>
            <h2 className="mt-2 text-xl font-semibold text-[hsl(var(--foreground))]">
              Built by aspirants, for aspirants
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted))]">
              We keep free resources front and centre, label paid material clearly, and always link to official sources. No tricks, no clutter.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <a href="https://jkssb.nic.in" target="_blank" rel="noopener noreferrer" className="pill-link justify-center">
              Visit JKSSB ↗
            </a>
            <a href="https://jkpsc.nic.in" target="_blank" rel="noopener noreferrer" className="pill-link justify-center">
              Visit JKPSC ↗
            </a>
            <Link href="/resources" className="pill-link justify-center">
              Explore all resources →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
