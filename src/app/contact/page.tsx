import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/ui";
import { ContactForm } from "@/components/feedback/ContactForm";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact JK Aspirant",
  description: "Write to JK Aspirant with a correction, a question, a suggestion or a complaint. We read every message.",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  const breadcrumbItems = [{ name: "Contact", path: "/contact" }];
  return (
    <div className="page-shell max-w-xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Contact us" lede="Corrections, questions, suggestions or complaints. We read every message." />
      <div className="mt-5">
        <ContactForm />
      </div>
    </div>
  );
}
