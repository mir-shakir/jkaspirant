import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BuyButton } from "@/components/BuyButton";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getBundleBySlug, getBundleSlugs } from "@/lib/queries/bundles";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getBundleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bundle = await getBundleBySlug(params.slug);
  if (!bundle) return {};
  return buildMetadata({
    title: bundle.seo_title || `${bundle.title} — ₹${bundle.price_paise / 100}`,
    description: bundle.seo_description || `Download ${bundle.title} — exam preparation pack for JKSSB/JKPSC candidates.`,
    canonicalPath: `/bundles/${bundle.slug}`,
    keywords: bundle.focus_keyword ? [bundle.focus_keyword] : undefined,
    ogImage: bundle.cover_image_url || undefined,
  });
}

export default async function BundleDetailPage({ params }: PageProps) {
  const bundle = await getBundleBySlug(params.slug);
  if (!bundle) notFound();

  const files = bundle.files || [];
  const totalSizeKb = files.reduce((sum, f) => sum + (f.file_size_kb || 0), 0);

  const breadcrumbItems = [
    { name: "Resources", path: "/bundles" },
    { name: bundle.title, path: `/bundles/${bundle.slug}` },
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
        <Breadcrumb items={breadcrumbItems} />

        {bundle.exam && (
          <Link href={`/exams/${bundle.exam.slug}`} className="mb-2 inline-block text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400">
            {bundle.exam.title} &rarr;
          </Link>
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{bundle.title}</h1>

        {bundle.description && (
          <div className="prose prose-gray mt-4 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: bundle.description }} />
        )}

        {files.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Included files ({files.length})</h2>
            <ul className="mt-2 space-y-1">
              {files.map((file) => (
                <li key={file.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {file.file_name}
                  {file.file_size_kb && (
                    <span className="text-xs text-gray-400">
                      ({file.file_size_kb > 1024 ? `${(file.file_size_kb / 1024).toFixed(1)} MB` : `${file.file_size_kb} KB`})
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {totalSizeKb > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                Total: {totalSizeKb > 1024 ? `${(totalSizeKb / 1024).toFixed(1)} MB` : `${totalSizeKb} KB`}
              </p>
            )}
          </div>
        )}

        <div className="mt-8">
          <BuyButton bundleId={bundle.id} bundleSlug={bundle.slug} bundleTitle={bundle.title} pricePaise={bundle.price_paise} />
        </div>
      </div>
    </>
  );
}
