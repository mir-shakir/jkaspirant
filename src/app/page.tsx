import { FocusCard } from "@/components/FocusCard";
import { ExamRail } from "@/components/xp/ExamRail";
import { Timeline } from "@/components/xp/Timeline";
import { UpdateRow } from "@/components/UpdateRow";
import { TelegramNudge } from "@/components/TelegramNudge";
import { EmptyState, GroupList, PageHeader, Section } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";
import { liveExams } from "@/config/exams";
import { getLatestNotifications } from "@/lib/queries/notifications";
import { spotlight } from "@/config/spotlight";
import { examDateFor, upcomingEvents } from "@/content/calendar";
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
  const events = upcomingEvents(7);
  const tickets = exams
    .filter((exam) => !liveExams[exam.slug]?.unlisted)
    .map((exam) => ({
      slug: exam.slug,
      title: exam.title,
      board: exam.department ?? "JKSSB",
      status: liveExams[exam.slug]?.status,
      posts: exam.vacancy_count ?? undefined,
      examDate: examDateFor(exam.slug, liveExams[exam.slug]?.parts),
    }));

  // Site name and logo for search results.
  const websiteJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      alternateName: ["JKAspirant", "jkaspirant.in"],
      url: `${siteConfig.url}/`,
      description: siteConfig.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: `${siteConfig.url}/`,
      logo: `${siteConfig.url}/logo.png`,
    },
  ];

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {spotlight ? (
        <FocusCard spotlight={spotlight} />
      ) : (
        <PageHeader kicker="JKSSB · JKPSC" title="Every exam update, the day it happens." />
      )}

      {tickets.length > 0 && <ExamRail tickets={tickets} />}

      {events.length > 0 && (
        <Section title="Coming up" action={{ href: "/calendar", label: "Calendar" }} id="coming-up">
          <Timeline events={events} />
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


      <TelegramNudge className="mt-9" />
    </div>
  );
}
