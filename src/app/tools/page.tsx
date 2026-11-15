import { Breadcrumb } from "@/components/Breadcrumb";
import { ToolCard } from "@/components/ToolCard";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { tools } from "@/config/tools";

export const metadata = buildMetadata({
  title: "Tools — Score Calculator & Rank Predictor for JKSSB, JKPSC",
  description:
    "Free JKSSB and JKPSC tools: score calculator with negative marking, crowd-sourced rank predictor, and eligibility checks.",
  canonicalPath: "/tools",
  keywords: ["JKSSB rank predictor", "JKSSB score calculator", "JKSSB FAA rank predictor"],
});

const breadcrumbItems = [{ name: "Tools", path: "/tools" }];

export default function ToolsPage() {
  return (
    <div className="page-shell py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />
      <Breadcrumb items={breadcrumbItems} />
      <p className="section-kicker">Tools</p>
      <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">Calculators for J&amp;K aspirants</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-7 text-[hsl(var(--muted))]">
        Free, fast, no sign-up. Score calculators follow the official marking scheme; rank estimates
        come from scores shared by other aspirants.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard key={t.title} {...t} />
        ))}
      </div>
    </div>
  );
}
