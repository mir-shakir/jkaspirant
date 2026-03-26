import type { ExamDate } from "@/lib/types/database";

interface DateTimelineProps {
  dates: ExamDate[];
}

export function DateTimeline({ dates }: DateTimelineProps) {
  if (dates.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Important dates have not been announced yet.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />

      {dates.map((date) => {
        const formattedDate = date.event_date
          ? new Date(date.event_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "TBA";

        return (
          <div key={date.id} className="relative flex items-start gap-4 py-3">
            <div className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-teal-600 bg-white dark:border-teal-400 dark:bg-gray-950" />

            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {date.event_name}
              </p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {formattedDate}
                {date.is_tentative && (
                  <span className="ml-2 rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
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
