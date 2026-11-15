export const revalidate = 1800; // ISR: revalidate every 30 minutes

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BuyButton } from "@/components/BuyButton";
import { RelatedResources } from "@/components/RelatedResources";
import { SectionHeader } from "@/components/SectionHeader";
import { ResourceCard } from "@/components/ResourceCard";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getBundleBySlug, getBundleSlugs } from "@/lib/queries/bundles";
import { getResourcesForExam } from "@/lib/queries/resources";

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

  // Fetch resources for all linked exams
  const linkedExams = bundle.exams || [];
  const examResourceArrays = await Promise.all(
    linkedExams.map((exam) =>
      getResourcesForExam(exam.id, 4).catch(() => [] as Awaited<ReturnType<typeof getResourcesForExam>>)
    )
  );
  const examResources = examResourceArrays.flat();

  const files = bundle.files || [];
  const totalSizeKb = files.reduce((sum, f) => sum + (f.file_size_kb || 0), 0);

  const breadcrumbItems = [
    { name: "Study Packs", path: "/bundles" },
    { name: bundle.title, path: `/bundles/${bundle.slug}` },
  ];
  const freeRoutes = linkedExams.flatMap((exam) => [
    {
      href: `/exams/${exam.slug}`,
      title: `${exam.title} exam hub`,
      description: "Browse syllabus, papers, dates, and more.",
      label: "Hub",
    },
    {
      href: `/exams/${exam.slug}/previous-papers`,
      title: `${exam.title} papers`,
      description: "Download free past papers for practice.",
      label: "Free",
    },
    {
      href: `/exams/${exam.slug}/syllabus`,
      title: `${exam.title} syllabus`,
      description: "Detailed topic breakdown with marks.",
      label: "Syllabus",
    },
  ]);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="page-shell py-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
        <Breadcrumb items={breadcrumbItems} />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="surface-card p-6 sm:p-8">
              {linkedExams.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {linkedExams.map((exam) => (
                    <Link key={exam.slug} href={`/exams/${exam.slug}`} className="pill-link-muted bg-[hsl(var(--panel))]">
                      {exam.title}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="mt-4 text-3xl font-semibold text-[hsl(var(--foreground))] sm:text-4xl">{bundle.title}</h1>

              {bundle.description && (
                <div className="mt-5 text-sm leading-7 text-[hsl(var(--muted))] [&_a]:text-[hsl(var(--accent-strong))] [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[hsl(var(--foreground))] [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3" dangerouslySetInnerHTML={{ __html: bundle.description }} />
              )}
            </div>

            {files.length > 0 && (
              <div className="surface-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    Included files ({files.length})
                  </h2>
                  {totalSizeKb > 0 && (
                    <span className="rounded-full bg-[hsl(var(--panel-soft))] px-3 py-1 text-xs font-medium text-[hsl(var(--muted))]">
                      Total {totalSizeKb > 1024 ? `${(totalSizeKb / 1024).toFixed(1)} MB` : `${totalSizeKb} KB`}
                    </span>
                  )}
                </div>
                <ul className="mt-4 space-y-3">
                  {files.map((file) => (
                    <li key={file.id} className="surface-soft flex items-center justify-between gap-3 p-4 text-sm">
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {file.file_name}
                      </span>
                      {file.file_size_kb && (
                        <span className="text-xs text-[hsl(var(--muted))]">
                          {file.file_size_kb > 1024
                            ? `${(file.file_size_kb / 1024).toFixed(1)} MB`
                            : `${file.file_size_kb} KB`}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="surface-card h-fit p-6">
            <p className="section-kicker">Study pack</p>
            <p className="mt-3 text-4xl font-semibold text-[hsl(var(--foreground))]">
              ₹{bundle.price_paise / 100}
            </p>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted))]">
              All the study material you need, in one download. Free resources are always available too.
            </p>
            <div className="mt-6">
              <BuyButton bundleId={bundle.id} bundleSlug={bundle.slug} bundleTitle={bundle.title} pricePaise={bundle.price_paise} />
            </div>
          </div>
        </div>

        {freeRoutes.length > 0 && (
          <section className="mt-12">
            <SectionHeader
              kicker="Also helpful"
              title="Free resources for this exam"
            />
            <div className="mt-6">
              <RelatedResources items={freeRoutes} />
            </div>
          </section>
        )}

        {examResources.length > 0 && (
          <section className="mt-12">
            <SectionHeader
              kicker="More to explore"
              title="Extra notes & guides"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {examResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
