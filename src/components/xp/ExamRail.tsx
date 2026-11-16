"use client";

import { useEffect, useState } from "react";
import { ExamTicket, type TicketData } from "./ExamTicket";
import { FOLLOW_EVENT, getFollowed } from "@/lib/follow";

/**
 * Swipeable row of exam tickets. Exams the visitor follows come first; the
 * rest are ordered by exam date, then the ones still waiting for a date.
 */
export function ExamRail({ tickets }: { tickets: TicketData[] }) {
  const [followed, setFollowed] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setFollowed(getFollowed());
    sync();
    window.addEventListener(FOLLOW_EVENT, sync);
    return () => window.removeEventListener(FOLLOW_EVENT, sync);
  }, []);
  const rank = (t: TicketData) => (followed.includes(t.slug) ? 0 : 1);
  const sorted = [...tickets].sort(
    (a, b) => rank(a) - rank(b) || (a.examDate ?? "9999").localeCompare(b.examDate ?? "9999")
  );
  const anyFollowed = sorted.some((t) => followed.includes(t.slug));
  return (
    <section aria-labelledby="rail-title" className="mt-7">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 id="rail-title" className="text-[21px] leading-tight">
          {anyFollowed ? "Your exams" : "Pick your exam"}
        </h2>
        <span className="text-[12.5px] text-[hsl(var(--muted))]">{anyFollowed ? "Followed first" : "Tap ☆ Follow on any exam"}</span>
      </div>
      <div className="rail">
        {sorted.map((t) => (
          <ExamTicket key={t.slug} t={t} followed={followed.includes(t.slug)} />
        ))}
      </div>
    </section>
  );
}
