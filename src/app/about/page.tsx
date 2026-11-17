import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = buildMetadata({
  title: "About JK Aspirant: Why We Built It and Where Our Information Comes From",
  description:
    "Official JKSSB notices are hard to find and harder to read. JK Aspirant turns them into clear pages, using official notices only and linking every one so you can check it yourself.",
  canonicalPath: "/about",
});

export default function AboutPage() {
  const breadcrumbItems = [{ name: "About", path: "/about" }];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${siteConfig.url}/about`,
    mainEntity: { "@type": "Organization", name: siteConfig.name, url: `${siteConfig.url}/`, logo: `${siteConfig.url}/logo.png` },
  };

  return (
    <div className="page-shell max-w-2xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Why we built JK Aspirant" />

      <div className="mt-5 space-y-4 text-[16px] leading-[1.75]">
        <p>
          If you have ever tried to find one date on the JKSSB website, you know how it goes. The site is slow, and every notice is a PDF listed only by its
          advertisement number. To find out which one is about your post, you open them one by one, often on a weak connection, often to find a scanned page you can
          barely read.
        </p>
        <p>
          So most of us end up on websites and groups that copy the same notices, surrounded by ads and pop-ups, and not always correctly. When a date or a post count
          matters this much, that isn&apos;t good enough.
        </p>
        <p>
          We built JK Aspirant to make this simple. We read the official notices and put what you actually need on one clear page: which posts, how many seats in your
          category, who can apply, when the exam is, how the paper is marked, and what the cut-off was last time.
        </p>
      </div>

      <Section title="Why you can rely on it">
        <div className="space-y-4 text-[16px] leading-[1.75]">
          <p>
            A site like this is only useful if you can trust it, so we hold ourselves to one rule: <strong>everything comes from official JKSSB notices.</strong> Not
            from news sites, forwarded messages or guesswork.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Every update and exam page links the official notice it is based on, so you can check it yourself in one tap.</li>
            <li>If a notice doesn&apos;t say something, we don&apos;t fill the gap. You&apos;ll see &ldquo;not announced yet&rdquo; instead.</li>
            <li>Anything that is our estimate, like an expected cut-off or rank, is clearly marked as an estimate.</li>
            <li>Each exam page shows when it was last checked against the official documents, and we update it when JKSSB issues a change.</li>
          </ul>
          <p>
            If something here ever differs from the official notice, the notice is right, and we want to know so we can fix it.
          </p>
        </div>
      </Section>

      <Section title="Talk to us">
        <p className="mb-3 text-[16px] leading-[1.75]">Spotted a mistake, have a question or an idea for the site? Write to us. We read every message.</p>
        <GroupList>
          <Row href="/contact" title="Contact us" sub="Corrections, questions, suggestions" />
          {siteConfig.telegramUrl && <Row href={siteConfig.telegramUrl} external title="JKSSB updates on Telegram" sub="Exam dates, answer keys and results" />}
        </GroupList>
        <p className="mt-4 text-[13.5px] text-[hsl(var(--muted))]">JK Aspirant is independent and is not affiliated with JKSSB or the Government of Jammu and Kashmir.</p>
      </Section>
    </div>
  );
}
