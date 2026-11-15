import { Metadata } from "next";
import { BundleCard } from "@/components/BundleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/ui";
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
  return (
    <div className="page-shell py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="Study packs" lede="Ready-made PDF bundles to help you prepare faster." />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (<BundleCard key={bundle.id} bundle={bundle} />))}
      </div>
      {bundles.length === 0 && <p className="surface-card mt-8 p-5 text-center text-[hsl(var(--muted))]">No study packs yet — we&apos;re putting them together. Check back soon!</p>}
    </div>
  );
}
