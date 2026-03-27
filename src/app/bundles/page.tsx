import { Metadata } from "next";
import { BundleCard } from "@/components/BundleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllBundles } from "@/lib/queries/bundles";

export const metadata: Metadata = buildMetadata({
  title: "Exam Resources — PDF Packs",
  description: "Download JKSSB and JKPSC exam preparation packs — previous papers, notes, question banks, and more.",
  canonicalPath: "/bundles",
  keywords: ["JKSSB PDF", "JKPSC study material", "JKSSB previous papers download"],
});

export default async function BundlesPage() {
  const bundles = await getAllBundles();
  const breadcrumbItems = [{ name: "Resources", path: "/bundles" }];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Exam Resources</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Curated PDF packs to help you prepare — previous papers, notes, and question banks.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (<BundleCard key={bundle.id} bundle={bundle} />))}
      </div>
      {bundles.length === 0 && <p className="mt-8 text-center text-gray-500 dark:text-gray-400">No resources available yet. Check back soon.</p>}
    </div>
  );
}
