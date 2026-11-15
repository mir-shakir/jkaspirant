import { FocusCard } from "@/components/FocusCard";
import { EventRow } from "@/components/EventRow";
import { UpdateRow } from "@/components/UpdateRow";
import { TelegramLink } from "@/components/TelegramLink";
import { EmptyState, GroupList, PageHeader, Row, Section } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";
import { liveExams } from "@/config/exams";
import { getLatestNotifications } from "@/lib/queries/notifications";
import { spotlight } from "@/config/spotlight";
import { upcomingEvents } from "@/content/calendar";
import { siteConfig } from "@/config/site";

export const revalidate = 1800; // ISR: revalidate every 30 minutes

export const metadata = buildMetadata({
  title: "JK Aspirant — JKSSB & JKPSC Updates, Exam Dates & Rank Predictor",
  description:
    "Latest JKSSB updates, upcoming exam dates and a rank predictor for J&K aspirants. Fast, clean, no ads.",
  canonicalPath: "/",
});

// The homepage answers three questions in order, and nothing else:
// what is happening now, what is coming, and what just changed.
export default async function HomePage() {
  const [exams, notifications] = await Promise.all([getAllExams(), getLatestNotifications(4)]);
  const events = upcomingEvents(4);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {spotlight ? (
        <FocusCard spotlight={spotlight} />
      ) : (
        <PageHeader kicker="JKSSB · JKPSC" title="Every exam update, the day it happens." />
      )}

      {events.length > 0 && (
        <Section title="Coming up" action={{ href: "/calendar", label: "Calendar" }} id="coming-up">
          <GroupList>
            {events.map((event) => (
              <EventRow key={`${event.date}-${event.title}`} event={event} />
            ))}
          </GroupList>
        </Section>
      )}

      <Section title="Latest updates" action={{ href: "/notifications", label: "See all" }} id="latest-updates">
        {notifications.length > 0 ? (
          <GroupList>
            {notifications.map((n) => (
              <UpdateRow key={n.id} update={n} />
            ))}
          </GroupList>
        ) : (
          <EmptyState>New notices from JKSSB and JKPSC appear here the day they are published.</EmptyState>
        )}
      </Section>

      {exams.length > 0 && (
        <Section title="Exams" action={{ href: "/exams", label: "All exams" }} id="your-exam">
          <GroupList>
            {exams.filter((exam) => !liveExams[exam.slug]?.awaited).map((exam) => (
              <Row
                key={exam.id}
                href={`/exams/${exam.slug}`}
                title={exam.title}
                sub={liveExams[exam.slug]?.status}
                meta={exam.vacancy_count ? `${exam.vacancy_count.toLocaleString("en-IN")} posts` : undefined}
              />
            ))}
          </GroupList>
        </Section>
      )}

      {siteConfig.telegramUrl && (
        <section className="mt-9 flex items-center justify-between gap-4 rounded-2xl bg-[hsl(var(--panel-soft))] p-4">
          <p className="text-[14.5px] leading-snug">
            <strong className="font-semibold">Get updates the minute they&apos;re out.</strong>
            <span className="block text-[13px] text-[hsl(var(--muted))]">Official notices only. No spam.</span>
          </p>
          <TelegramLink compact className="inline-flex h-10 shrink-0 px-4" label="Join Telegram" />
        </section>
      )}
    </div>
  );
}
