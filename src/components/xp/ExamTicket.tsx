import Link from "next/link";
import { DaysLeft } from "./DaysLeft";

export interface TicketData {
  slug: string;
  title: string;
  board: string;
  status?: string;
  posts?: number;
  /** ISO date of the next exam, if one is scheduled */
  examDate?: string | null;
}

const short = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/** One exam as an admit-card stub: countdown up top, date and posts on the tear-off. */
export function ExamTicket({ t, followed = false, className = "" }: { t: TicketData; followed?: boolean; className?: string }) {
  return (
    <Link href={`/exams/${t.slug}`} className={`ticket flex w-[218px] shrink-0 snap-start flex-col transition-transform active:scale-[0.98] ${className}`}>
      <div className="flex flex-1 flex-col p-4 pb-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono-num text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--muted))]">{t.board}</span>
          {followed && (
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[hsl(var(--warm))]" fill="currentColor" aria-label="Following">
              <path d="m10 2.8 2.2 4.5 5 .7-3.6 3.5.9 4.9L10 14.1l-4.5 2.3.9-4.9L2.8 8l5-.7Z" />
            </svg>
          )}
        </div>
        <span className="mt-2 line-clamp-2 font-display text-[19px] font-semibold leading-[1.15]">{t.title.replace("JK Police ", "")}</span>
        {t.status && <span className="mt-1.5 line-clamp-1 text-[12.5px] leading-snug text-[hsl(var(--muted))]">{t.status}</span>}
      </div>
      <div className="ticket-stub flex items-end justify-between gap-2 px-4 py-3">
        {t.examDate ? (
          <span className="flex flex-col">
            <span className="text-[10.5px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">Exam {short(t.examDate)}</span>
            <DaysLeft iso={t.examDate} />
          </span>
        ) : (
          <span className="flex flex-col">
            <span className="text-[10.5px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">Exam date</span>
            <span className="text-[14px] font-semibold">Awaited</span>
          </span>
        )}
        {t.posts ? (
          <span className="text-right">
            <span className="block text-[10.5px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">Posts</span>
            <span className="font-mono-num text-[17px] font-semibold">{t.posts.toLocaleString("en-IN")}</span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}
