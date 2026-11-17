import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = buildMetadata({
  title: "About JK Aspirant: Why This Site Exists",
  description:
    "JK Aspirant turns official JKSSB and JKPSC notices into clear, accurate pages: dates, posts, eligibility, past cut-offs and rank tools. Independent, no ads, every fact linked to its source.",
  canonicalPath: "/about",
});

const LINKEDIN = "https://www.linkedin.com/in/shakir-majeed-mir";

export default function AboutPage() {
  const breadcrumbItems = [{ name: "About", path: "/about" }];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${siteConfig.url}/about`,
    mainEntity: {
      "@type": "Organization",
      name: siteConfig.name,
      url: `${siteConfig.url}/`,
      logo: `${siteConfig.url}/logo.png`,
      founder: { "@type": "Person", name: "Shakir", sameAs: [LINKEDIN] },
    },
  };

  return (
    <div className="page-shell max-w-2xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Clear exam information, without the clutter" lede="JK Aspirant is a free site for people preparing for JKSSB and JKPSC exams." />

      <div className="mt-6 space-y-4 text-[15.5px] leading-7">
        <p>
          Official notices come out as PDFs, often scanned, and are listed only by advertisement number. To find out what a notice means for you, you have to open it, read
          it and work out which posts it covers. The sites that summarise them are crowded with ads and pop-ups, and their facts are not always right.
        </p>
        <p>
          JK Aspirant reads the official documents and puts what matters in plain words: which posts, how many seats in your category, who can apply, when the exam is,
          how the paper is marked, and what the cut-off was last time. Every page links the notice it came from.
        </p>
      </div>

      <Section title="How we keep it accurate">
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-6">
          <li>Facts come only from official JKSSB and JKPSC notices. If a notice doesn&apos;t say it, we leave it out.</li>
          <li>Each exam page shows the date it was last checked against the official documents.</li>
          <li>Estimates, like expected cut-offs and ranks, are always labelled as estimates.</li>
          <li>If something is wrong, tell us and we&apos;ll fix it. The official notice always wins.</li>
        </ul>
        <p className="mt-3 text-[14px] text-[hsl(var(--muted))]">JK Aspirant is independent. It is not affiliated with JKSSB, JKPSC or the Government of Jammu and Kashmir.</p>
      </Section>

      <Section title="Who runs it">
        <p className="text-[15.5px] leading-7">
          JK Aspirant is built and run by Shakir as an independent project, to give aspirants in J&amp;K a cleaner, more trustworthy place to follow their exams.
        </p>
        <GroupList className="mt-3">
          <Row href={LINKEDIN} external title="Shakir on LinkedIn" sub="Follow or say hello" />
        </GroupList>
      </Section>

      <Section title="Help make it better">
        <GroupList>
          <Row href="/feedback?type=wrong_info" title="Report wrong information" sub="A date, number or detail that doesn't match the notice" />
          <Row href="/feedback?type=feature" title="Suggest a feature" sub="A tool or page that would help you" />
          {siteConfig.telegramUrl && <Row href={siteConfig.telegramUrl} external title="JKSSB updates on Telegram" sub="Exam dates, answer keys and results" />}
        </GroupList>
        <p className="mt-3 text-[14px] text-[hsl(var(--muted))]">The simplest way to support the site is to share it with someone preparing for an exam.</p>
      </Section>
    </div>
  );
}
