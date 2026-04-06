import { Metadata } from "next";
import { BundleCard } from "@/components/BundleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SearchHero } from "@/components/SearchHero";
import { SectionHeader } from "@/components/SectionHeader";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllBundles } from "@/lib/queries/bundles";

export const metadata: Metadata = buildMetadata({
  title: "Study Packs — JKSSB & JKPSC",
  description: "Download JKSSB and JKPSC exam preparation packs — previous papers, notes, question banks, and more.",
  canonicalPath: "/bundles",
  keywords: ["JKSSB PDF", "JKPSC study material", "JKSSB previous papers download"],
});

export const revalidate = 1800;

export default async function BundlesPage() {
  const bundles = await getAllBundles();
  const breadcrumbItems = [{ name: "Study Packs", path: "/bundles" }];
  const searchItems = bundles.map((bundle) => ({
    title: bundle.title,
    description: bundle.exams?.length
      ? `Study pack for ${bundle.exams.map((e) => e.title).join(", ")}`
      : "Exam preparation pack",
    href: `/bundles/${bundle.slug}`,
    tag: "Pack",
  }));

  return (
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />

      <SearchHero
        kicker="Study packs"
        title="Ready-made PDF bundles to help you prepare faster."
        placeholder="Search for a study pack..."
        items={searchItems}
        quickLinks={[
          { label: "Free resources", href: "/resources" },
          { label: "Exam hubs", href: "/exams" },
          { label: "Latest updates", href: "/notifications" },
        ]}
      />

      <section className="mt-10">
        <SectionHeader
          kicker="All packs"
          title="Study packs available right now"
        />
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (<BundleCard key={bundle.id} bundle={bundle} />))}
      </div>
      {bundles.length === 0 && <p className="surface-card mt-8 p-5 text-center text-[hsl(var(--muted))]">No study packs yet — we&apos;re putting them together. Check back soon!</p>}
    </div>
  );
}
