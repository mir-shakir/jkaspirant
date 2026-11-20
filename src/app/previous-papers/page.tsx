import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { examFacts } from "@/content/exams";
import papersData from "@/content/papers.json";

// Every question paper JKSSB has published on its official "Previous Question Papers" page.
// We link the official PDFs and never re-host them. Refresh with scripts/sources/jkssb-papers.mjs.

const papers = papersData.papers as { title: string; year: number; url: string }[];
const years = Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a);
const first = Math.min(...years);
const last = Math.max(...years);

export const metadata = buildMetadata({
  title: `JKSSB Previous Year Question Papers ${first}–${last} (Official PDFs)`,
  description: `All ${papers.length} official JKSSB question papers from ${first} to ${last}: Patwari, Constable, Accounts Assistant, Sub-Inspector, JE and more. Each opens the PDF on jkssb.nic.in.`,
  canonicalPath: "/previous-papers",
  keywords: ["JKSSB previous year papers", "JKSSB question papers", "JKSSB old papers PDF", "JKSSB previous papers"],
});

export default function PreviousPapersPage() {
  const breadcrumbItems = [{ name: "Previous papers", path: "/previous-papers" }];
  // One row per paper, naming every exam on the site it helps with.
  const forOurExams = new Map<string, { title: string; exams: string[] }>();
  for (const e of Object.values(examFacts)) {
    for (const p of e.papers) {
      const row = forOurExams.get(p.url) ?? { title: p.title.replace(/ \(similar level\)$/, ""), exams: [] };
      row.exams.push(e.title);
      forOurExams.set(p.url, row);
    }
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "JKSSB previous year question papers",
    url: `${siteConfig.url}/previous-papers`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: papers.length,
      itemListElement: papers.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.title} ${p.year}`, url: p.url })),
    },
  };

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="JKSSB previous question papers"
        lede={`All ${papers.length} papers JKSSB has published, ${first} to ${last}. Each one opens the official PDF on jkssb.nic.in.`}
      />

      <nav aria-label="Jump to year" className="mt-5 flex flex-wrap gap-2">
        {years.map((y) => (
          <a key={y} href={`#y${y}`} className="chip">
            {y} · {papers.filter((p) => p.year === y).length}
          </a>
        ))}
      </nav>

      <Section title="For exams on this site">
        <GroupList>
          {Array.from(forOurExams, ([url, r]) => (
            <Row key={url} href={url} external title={r.title} sub={`For ${r.exams.join(", ")}`} />
          ))}
        </GroupList>
      </Section>

      {years.map((y) => (
        <Section key={y} title={`${y} papers`} id={`y${y}`}>
          <GroupList>
            {papers
              .filter((p) => p.year === y)
              .map((p) => (
                <Row key={p.url} href={p.url} external title={p.title} sub={`${y} · jkssb.nic.in`} />
              ))}
          </GroupList>
        </Section>
      ))}

      <p className="mt-6 text-[13px] leading-6 text-[hsl(var(--muted))]">
        Papers are listed as JKSSB names them on its official page and checked on{" "}
        {new Date(papersData.checked).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Most are Set A of the paper. JK Aspirant
        is independent and is not affiliated with JKSSB.
      </p>
    </div>
  );
}
