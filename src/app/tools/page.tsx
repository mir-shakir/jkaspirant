import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { rankExams } from "@/config/rank-predictor";

export const metadata = buildMetadata({
  title: "JKSSB Tools — Rank Predictor, Cut-offs, Result Search, Age Checker",
  description: "Tools for JKSSB aspirants: rank predictor, previous cut-offs by category, result search by roll number and an age limit checker. No sign-up.",
  canonicalPath: "/tools",
  keywords: ["JKSSB rank predictor", "JKSSB score calculator", "JKSSB FAA rank predictor"],
});

const breadcrumbItems = [{ name: "Tools", path: "/tools" }];

export default function ToolsPage() {
  const open = rankExams;
  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Tools" lede="Quick to use, no sign-up." />

      <Section title="Rank predictors" className="!mt-6">
        <GroupList>
          {open.map((e) => (
            <Row
              key={e.toolSlug}
              href={`/tools/${e.toolSlug}`}
              title={`${e.board} ${e.name} ${e.examDate.slice(0, 4)}`}
              sub={e.isOpen ? "Your score and expected rank in under a minute" : `Locked · opens ${e.opensOn ?? "after the exam"}`}
            />
          ))}
        </GroupList>
      </Section>

      <Section title="Check and look up">
        <GroupList>
          <Row href="/tools/age-checker" title="Age limit checker" sub="Which JKSSB advertisements your age allows" />
          <Row href="/cut-offs" title="Previous cut-offs" sub="Lowest marks selected, for your category" />
          <Row href="/previous-papers" title="Previous question papers" sub="Official JKSSB papers, 2023 to 2026" />
          <Row href="/results" title="Result search" sub="Find your marks by roll number or name" />
        </GroupList>
      </Section>

      <p className="mt-6 text-[13.5px] leading-6 text-[hsl(var(--muted))]">A predictor opens for each major exam on the day it is held.</p>
    </div>
  );
}
