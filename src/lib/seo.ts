import { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface SEOParams {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  keywords,
  ogImage,
  canonicalPath,
  noIndex = false,
}: SEOParams): Metadata {
  const url = canonicalPath
    ? `${siteConfig.url}${canonicalPath}`
    : siteConfig.url;

  return {
    title,
    description,
    keywords: keywords || [...siteConfig.keywords],
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage || siteConfig.ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildExamJsonLd(exam: {
  title: string;
  description: string | null;
  slug: string;
  vacancy_count: number | null;
  department: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: exam.title,
    description: exam.description || `Details for ${exam.title} exam`,
    url: `${siteConfig.url}/exams/${exam.slug}`,
    provider: {
      "@type": "Organization",
      name: exam.department || "JKSSB",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
