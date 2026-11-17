import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/ui";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Feedback: Report an Error or Suggest a Feature",
  description: "Spotted wrong information, want a feature, or have a complaint? Tell JK Aspirant. Every message is read.",
  canonicalPath: "/feedback",
});

export default function FeedbackPage() {
  const breadcrumbItems = [{ name: "Feedback", path: "/feedback" }];
  return (
    <div className="page-shell max-w-xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Tell us" lede="Wrong date or number, a feature you'd like, or a complaint. Every message is read." />
      <div className="mt-5">
        <FeedbackForm />
      </div>
    </div>
  );
}
