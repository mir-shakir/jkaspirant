import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { rankExams } from "@/config/rank-predictor";

export const metadata = buildMetadata({
  title: "Tools — Rank Predictor & Score Calculator for JKSSB, JKPSC",
  description: "Free tools for J&K aspirants: score calculator with negative marking and rank predictor. No sign-up.",
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
      <PageHeader title="Tools" lede="Free, quick, no sign-up." />

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

      <p className="mt-6 text-[13.5px] leading-6 text-[hsl(var(--muted))]">
        A predictor opens for each major exam on the day it is held. Coming next: age and eligibility checker.
      </p>
    </div>
  );
}
