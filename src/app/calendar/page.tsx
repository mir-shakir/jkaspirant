import { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EventRow } from "@/components/EventRow";
import { EmptyState, GroupList, PageHeader, Section } from "@/components/ui";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { calendarEvents, todayIST, upcomingEvents } from "@/content/calendar";
import { siteConfig } from "@/config/site";

export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "JKSSB & JKPSC Exam Calendar — Upcoming Exam Dates",
  description: "Upcoming JKSSB and JKPSC exam dates and admit card dates in one list, kept current from official notices.",
  canonicalPath: "/calendar",
  keywords: ["JKSSB exam calendar", "JKSSB exam date", "JKSSB SI exam date", "JKSSB constable exam date"],
});

export default function CalendarPage() {
  const breadcrumbItems = [{ name: "Calendar", path: "/calendar" }];
  const upcoming = upcomingEvents();
  const today = todayIST();
  const past = calendarEvents.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const months = new Map<string, typeof upcoming>();
  for (const event of upcoming) {
    const key = new Date(event.date).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
    months.set(key, [...(months.get(key) ?? []), event]);
  }

  const eventsJsonLd = upcoming
    .filter((e) => e.kind === "exam")
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${e.board} ${e.title}`,
      startDate: e.date,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: "Jammu & Kashmir", address: "Jammu & Kashmir, India" },
      organizer: { "@type": "Organization", name: e.board },
      url: `${siteConfig.url}/calendar`,
    }));

  return (
    <div className="page-shell py-4 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      {eventsJsonLd.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd) }} />}
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Exam calendar" lede="Dates announced in official notices. Boards can reschedule, so check your admit card." />

      {upcoming.length === 0 && (
        <div className="mt-5">
          <EmptyState>No upcoming dates announced right now.</EmptyState>
        </div>
      )}

      {Array.from(months.entries()).map(([month, events], i) => (
        <Section key={month} title={month} className={i === 0 ? "!mt-6" : ""}>
          <GroupList>
            {events.map((event) => (
              <EventRow key={`${event.date}-${event.title}`} event={event} />
            ))}
          </GroupList>
        </Section>
      ))}

      {past.length > 0 && (
        <Section title="Recently held">
          <GroupList>
            {past.map((event) => (
              <EventRow key={`${event.date}-${event.title}`} event={event} />
            ))}
          </GroupList>
        </Section>
      )}
    </div>
  );
}
