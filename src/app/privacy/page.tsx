import { Breadcrumb } from "@/components/Breadcrumb";
import { GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy and Disclaimer",
  description: "What JK Aspirant stores, why, and what it doesn't. Plus the disclaimer: we are independent and the official notice always wins.",
  canonicalPath: "/privacy",
});

const UPDATED = "17 November 2026";

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="text-[15px] font-semibold">{title}</p>
      <div className="mt-1 text-[14.5px] leading-6 text-[hsl(var(--muted))]">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  const breadcrumbItems = [{ name: "Privacy", path: "/privacy" }];
  return (
    <div className="page-shell max-w-2xl py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Privacy and disclaimer" lede={`In plain words. Last updated ${UPDATED}.`} />

      <Section title="What we store" className="!mt-6">
        <div className="surface-card divide-y p-4">
          <Item title="Visit counts (Google Analytics)">
            Which pages are read, roughly where visitors come from and what kind of device they use, so we know what helps. Google Analytics uses cookies for this. We
            never send names, scores or anything that identifies you to it.
          </Item>
          <Item title="Rank predictor">
            If you save a score: your right and wrong answers, score and category, linked to your phone by a cookie so each person counts once and you can see your rank
            again. If you join the leaderboard, your name too; others only ever see its first letters (like Sh*** Mi***). We don&apos;t ask for a phone number, roll number
            or email.
          </Item>
          <Item title="Contact form">Your name, your message, the page you wrote from and, only if you give it, your email or phone so we can reply.</Item>
          <Item title="Abuse protection">
            A one-way scrambled form of your network address, so one network can&apos;t flood the rank tool or the contact form. It can&apos;t be turned back into the
            address.
          </Item>
          <Item title="On your phone only">
            Your category on the cut-offs page and your date of birth on the age checker are remembered in your own browser so you don&apos;t retype them. They are never
            sent to us.
          </Item>
        </div>
        <p className="mt-3 text-[14px] leading-6 text-[hsl(var(--muted))]">
          We don&apos;t sell or share your data, and we don&apos;t show ads. Searches on the result pages aren&apos;t saved; the names and marks shown there come from
          JKSSB&apos;s own published score sheets. To have your saved score, leaderboard name or a message removed, write to us through the contact form.
        </p>
      </Section>

      <Section title="Disclaimer">
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-6">
          <li>JK Aspirant is an independent site. It is not affiliated with JKSSB or the Government of Jammu and Kashmir.</li>
          <li>We take facts from official notices and link each one, but mistakes can happen and notices change. The official notice always wins; check it before you act.</li>
          <li>Expected cut-offs and ranks are estimates, not predictions of your result.</li>
        </ul>
      </Section>

      <GroupList className="mt-8">
        <Row href="/contact" title="Questions or removal requests" sub="Use the contact form" />
        <Row href="/about" title="About JK Aspirant" sub="Why we built it and where our information comes from" />
      </GroupList>
    </div>
  );
}
