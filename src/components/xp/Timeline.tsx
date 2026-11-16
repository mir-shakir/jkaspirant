import Link from "next/link";
import { daysUntil, relativeDay, todayIST, type CalendarEvent } from "@/content/calendar";

const kindLabel: Record<CalendarEvent["kind"], string> = { exam: "Exam", admit_card: "Admit card", deadline: "Deadline", result: "Result" };

function bucket(date: string, today: string) {
  const d = daysUntil(date, today);
  if (d <= 6) return "This week";
  if (date.slice(0, 7) === today.slice(0, 7)) return "Later this month";
  return new Date(date).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}

/** Upcoming dates on one vertical line, grouped into weeks and months. */
export function Timeline({ events }: { events: CalendarEvent[] }) {
  const today = todayIST();
  const groups: { label: string; items: CalendarEvent[] }[] = [];
  for (const e of events) {
    const label = bucket(e.date, today);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(e);
    else groups.push({ label, items: [e] });
  }
  return (
    <ol className="relative">
      <span aria-hidden className="absolute bottom-3 left-[59px] top-3 w-px bg-[hsl(var(--line))]" />
      {groups.map((g) => (
        <li key={g.label}>
          <p className="mb-1 mt-4 pl-[76px] font-mono-num text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--accent-strong))] first:mt-0 dark:text-[hsl(var(--accent))]">{g.label}</p>
          <ul>
            {g.items.map((e) => {
              const d = daysUntil(e.date, today);
              const soon = d <= 7;
              const body = (
                <>
                  <span className="w-[46px] shrink-0 text-right font-mono-num leading-none">
                    <span className="block text-[18px] font-semibold">
                      {new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" })}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">
                      {new Date(e.date).toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`relative z-10 mt-1.5 h-3 w-3 shrink-0 self-start rounded-full border-2 ${
                      e.kind === "exam"
                        ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]"
                        : "border-[hsl(var(--muted))] bg-[hsl(var(--background))]"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-snug">{e.title}</span>
                    <span className="mt-0.5 block text-[12.5px] text-[hsl(var(--muted))]">
                      {[kindLabel[e.kind], e.tentative ? "Expected" : null].filter(Boolean).join(" · ")}
                      <span className={soon ? "font-semibold text-[hsl(var(--accent))]" : ""}> · {relativeDay(e.date)}</span>
                    </span>
                  </span>
                </>
              );
              return (
                <li key={`${e.date}-${e.title}`}>
                  {e.href ? (
                    <Link href={e.href} className="flex min-h-[56px] items-start gap-3 rounded-xl py-2.5 pr-2 transition-colors hover:bg-[hsl(var(--panel-soft)/0.6)]">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex min-h-[56px] items-start gap-3 py-2.5 pr-2">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
