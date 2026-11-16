import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/ui";
import { AgeChecker, type AgeRule } from "@/components/eligibility/AgeChecker";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { examFacts } from "@/content/exams";
import { liveExams } from "@/config/exams";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "JKSSB Age Limit Checker: Which Exams Can You Apply For?",
  description: "Enter your date of birth and category to check the JKSSB age limit for every open advertisement: JE Civil, MTS, JK Police and more. Free, nothing saved on our side.",
  canonicalPath: "/tools/age-checker",
});

/** Last "d Mon yyyy" date in a text (e.g. an extended deadline), or null. */
function lastDate(text: string) {
  const all = text.match(/\d{1,2} [A-Z][a-z]{2} \d{4}/g);
  return all ? new Date(all[all.length - 1]) : null;
}

export default function AgeCheckerPage() {
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()));
  const rules: AgeRule[] = Object.values(examFacts)
    .filter((f) => f.age?.rows?.length)
    .map((f) => {
      const close = f.dates.find(([k]) => k === "Last date to apply")?.[1] ?? "";
      const opens = f.dates.find(([k]) => k === "Applications open")?.[1] ?? "";
      const closeDate = lastDate(close);
      const openDate = lastDate(opens);
      let applyStatus: AgeRule["applyStatus"] = "closed";
      let applyText = "Applications closed";
      if (closeDate && closeDate >= today) {
        if (openDate && openDate > today) {
          applyStatus = "soon";
          applyText = `Applications open ${opens}, close ${closeDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
        } else {
          applyStatus = "open";
          applyText = `Apply by ${closeDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
        }
      } else if (/postponed|awaited/i.test(opens + close)) {
        applyStatus = "soon";
        applyText = "Application dates awaited";
      }
      return {
        slug: f.slug,
        title: liveExams[f.slug]?.title ?? f.title,
        asOn: f.age!.asOn,
        min: f.age!.min ?? 18,
        rows: f.age!.rows!,
        applyStatus,
        applyText,
      };
    });
  const breadcrumbItems = [
    { name: "Tools", path: "/tools" },
    { name: "Age checker", path: "/tools/age-checker" },
  ];
  return (
    <div className="page-shell max-w-xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Can you apply?" lede="Check your age against each JKSSB advertisement's limit, as on the date the advertisement fixes." />
      <div className="mt-5">
        <AgeChecker rules={rules} />
      </div>
      <p className="mt-5 text-[12.5px] leading-5 text-[hsl(var(--muted))]">
        Age only. Qualification, domicile and the exact relaxation rules (ex-servicemen, SPOs, casual workers) are in each advertisement. When the minimum isn&apos;t stated separately we use 18.
      </p>
    </div>
  );
}
