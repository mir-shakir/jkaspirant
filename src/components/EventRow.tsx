import { DateBlock, Row } from "@/components/ui";
import { relativeDay, daysUntil, type CalendarEvent } from "@/content/calendar";

export function EventRow({ event }: { event: CalendarEvent }) {
  const days = daysUntil(event.date);
  const soon = days >= 0 && days <= 7;
  const body = {
    leading: <DateBlock iso={event.date} muted={days < 0} />,
    title: event.title,
    sub: [event.board, event.note, event.tentative ? "Expected" : null].filter(Boolean).join(" · "),
    meta: (
      <span className={soon ? "font-semibold text-[hsl(var(--accent))]" : undefined}>{relativeDay(event.date)}</span>
    ),
  };
  if (event.href) return <Row href={event.href} {...body} />;
  return (
    <div className="row">
      {body.leading}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-snug">{body.title}</span>
        <span className="mt-0.5 block text-[13px] text-[hsl(var(--muted))]">{body.sub}</span>
      </span>
      <span className="shrink-0 font-mono-num text-[12px] text-[hsl(var(--muted))]">{body.meta}</span>
    </div>
  );
}
