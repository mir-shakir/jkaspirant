import type { ExamDate } from "@/lib/types/database";

interface DateTimelineProps {
  dates: ExamDate[];
}

export function DateTimeline({ dates }: DateTimelineProps) {
  if (dates.length === 0) {
    return (
      <p className="surface-card p-5 text-[hsl(var(--muted))]">
        Important dates have not been announced yet.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute bottom-2 left-4 top-2 w-px bg-[hsl(var(--line))]" />

      {dates.map((date) => {
        const formattedDate = date.event_date
          ? new Date(date.event_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "TBA";

        return (
          <div key={date.id} className="surface-card relative flex items-start gap-4 p-4 pl-5">
            <div className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-[hsl(var(--accent-strong))] bg-[hsl(var(--panel))]" />

            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {date.event_name}
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted))]">
                {formattedDate}
                {date.is_tentative && (
                  <span className="ml-2 rounded-full bg-[hsla(var(--warm),0.14)] px-2 py-0.5 text-xs text-[hsl(var(--warm))]">
                    Tentative
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
