import type { ExamDate } from "@/lib/types/database";
import { DateBlock, EmptyState } from "@/components/ui";
import { todayIST } from "@/content/calendar";

interface DateTimelineProps {
  dates: ExamDate[];
}

/** Past dates fade back; the next one is marked. */
export function DateTimeline({ dates }: DateTimelineProps) {
  if (dates.length === 0) {
    return <EmptyState>No dates announced for this exam yet.</EmptyState>;
  }
  const today = todayIST();
  const nextId = dates.find((d) => d.event_date && d.event_date >= today)?.id;

  return (
    <div className="group-list">
      {dates.map((date) => {
        const past = !!date.event_date && date.event_date < today;
        return (
          <div key={date.id} className={`row ${past ? "opacity-55" : ""}`}>
            <DateBlock iso={date.event_date} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium leading-snug">{date.event_name}</span>
              <span className="mt-0.5 block text-[13px] text-[hsl(var(--muted))]">
                {date.event_date
                  ? new Date(date.event_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })
                  : "To be announced"}
                {date.is_tentative && " · Tentative"}
              </span>
            </span>
            {date.id === nextId && <span className="tag tag-new">Next</span>}
            {past && <span className="tag">Done</span>}
          </div>
        );
      })}
    </div>
  );
}
