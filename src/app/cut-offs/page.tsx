import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/ui";
import { CutoffExplorer, type CutoffGroup } from "@/components/cutoffs/CutoffExplorer";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { CATEGORIES, examFacts } from "@/content/exams";

export const metadata = buildMetadata({
  title: "JKSSB Previous Cut-offs: Category-wise (OM, SC, ST, OBC, RBA, EWS)",
  description:
    "Past JKSSB cut-offs by category from official final selection lists: JK Police Constable (Executive, Armed/IRP, SDRF, Telecom) and Junior Engineer Civil. Pick your category.",
  canonicalPath: "/cut-offs",
});

export default function CutoffsPage() {
  const groups: CutoffGroup[] = Object.values(examFacts)
    .filter((f) => f.pastCutoffs)
    .map((f) => ({
      examSlug: f.slug,
      exam: f.title,
      source: f.pastCutoffs!.source,
      outOf: f.pastCutoffs!.outOf,
      rows: f.pastCutoffs!.tables.map((t) => ({
        label: t.label,
        byCat: Object.fromEntries(t.rows.map(([c, m, w]) => [c, [m, w]])) as Record<string, [number | null, number | null]>,
      })),
    }));
  const breadcrumbItems = [{ name: "Cut-offs", path: "/cut-offs" }];
  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Previous cut-offs"
        lede="The lowest marks selected in each category, read from JKSSB's official final selection lists. Women's lists had their own, lower cut-offs."
      />
      <div className="mt-5">
        <CutoffExplorer groups={groups} categories={[...CATEGORIES]} />
      </div>
      <p className="mt-6 text-[12.5px] leading-5 text-[hsl(var(--muted))]">
        Main lists only; disability, SPO, VHG and ex-servicemen sub-quotas are left out. Past cut-offs guide, they don&apos;t predict: post counts and paper difficulty change.
      </p>
    </div>
  );
}
