import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
import { ResultSearch } from "@/components/results/ResultSearch";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getResultSheet, resultSheets } from "@/content/results";
import { getExamFacts } from "@/content/exams";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return resultSheets.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export function generateMetadata({ params }: PageProps): Metadata {
  const s = getResultSheet(params.slug);
  if (!s) return {};
  return buildMetadata({
    title: `${s.title} Result: Search by Roll Number or Name`,
    description: `Find your ${s.title} marks and rank among ${s.rows.length.toLocaleString("en-IN")} candidates in seconds, without opening the large official PDF.${s.outOf ? ` Marks out of ${s.outOf}.` : ""}`,
    canonicalPath: `/results/${s.slug}`,
  });
}

const fmt = (n: number) => n.toLocaleString("en-IN");

export default function ResultPage({ params }: PageProps) {
  const s = getResultSheet(params.slug);
  if (!s) notFound();
  const n = s.rows.length;
  const marks = s.rows.map((r) => r[3]);
  const median = marks[Math.floor(n / 2)];
  const top = marks[0];
  // Spread of marks in 10-mark bands, highest first.
  const band = 10;
  const counts = new Map<number, number>();
  for (const m of marks) {
    const b = Math.max(0, Math.floor(m / band) * band);
    counts.set(b, (counts.get(b) ?? 0) + 1);
  }
  const bands = Array.from(counts.entries()).sort((a, b) => b[0] - a[0]);
  const maxCount = Math.max(...bands.map(([, c]) => c));
  const facts = s.examSlug ? getExamFacts(s.examSlug) : null;
  const cut = facts?.pastCutoffs?.tables.map((t) => [t.label, t.rows.find((r) => r[0] === "OM")?.[1]] as const) ?? [];
  const breadcrumbItems = [
    { name: "Results", path: "/results" },
    { name: s.title, path: `/results/${s.slug}` },
  ];

  return (
    <div className="page-shell max-w-xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader kicker={s.declared ? `Result declared ${s.declared}` : "JKSSB score sheet"} title={`${s.title} result`} lede={`Exam held ${s.examDate}. Find your marks and rank without opening the ${fmt(n)}-row PDF.`} />

      <div className="surface-card mt-5 p-4">
        <ResultSearch slug={s.slug} candidates={n} outOf={s.outOf} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Candidates", fmt(n)],
          ["Top score", `${top}`],
          ["Median", `${median}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-[hsl(var(--panel-soft))] px-3 py-2">
            <dt className="text-[11px] text-[hsl(var(--muted))]">{k}</dt>
            <dd className="font-mono-num text-[18px] font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      {cut.length > 0 && (
        <p className="mt-3 text-[13.5px] leading-5 text-[hsl(var(--muted))]">
          Lowest open-merit marks selected: {cut.map(([l, v]) => `${l} ${v}`).join(", ")}{s.outOf ? ` (out of ${s.outOf})` : ""}.
        </p>
      )}

      <Section title="How marks were spread">
        <div className="surface-card p-4">
          <ul className="space-y-1.5">
            {bands.map(([b, c]) => (
              <li key={b} className="flex items-center gap-3 text-[12.5px]">
                <span className="w-16 shrink-0 font-mono-num text-[hsl(var(--muted))]">
                  {b}–{b + band - 0.25}
                </span>
                <span className="h-3 rounded-sm bg-[hsl(var(--accent)/0.75)]" style={{ width: `${Math.max(1, (c / maxCount) * 70)}%` }} />
                <span className="font-mono-num">{fmt(c)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[hsl(var(--muted))]">Candidates in each 10-mark band. Negative scores are counted under 0.</p>
        </div>
      </Section>

      <GroupList className="mt-6">
        {s.examSlug && <Row href={`/exams/${s.examSlug}`} title="Past cut-offs and the next exam" sub="Category-wise cut-offs, pattern and dates" />}
        <Row href={s.pdf} external title="Official result (PDF)" sub="jkssb.nic.in" />
      </GroupList>
      <p className="mt-3 text-[12.5px] text-[hsl(var(--muted))]">
        Read from the official score sheet. If anything differs, the official PDF is correct.
      </p>
    </div>
  );
}
