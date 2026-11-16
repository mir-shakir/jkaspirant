import { Breadcrumb } from "@/components/Breadcrumb";
import { examBreadcrumbs } from "@/components/ExamHeader";
import { DaysLeft } from "./DaysLeft";
import { FollowButton } from "./FollowButton";
import type { ExamFacts } from "@/content/exams";

/**
 * Exam page header as a dark admit-card ticket: title, live countdown, and the
 * three numbers people check first. Follow sits on the tear-off stub.
 */
export function ExamHero({
  exam,
  facts,
  status,
  examDate,
}: {
  exam: { slug: string; title: string; department: string | null; vacancy_count: number | null };
  facts: ExamFacts | null;
  status?: string;
  examDate: string | null;
}) {
  const tiles: [string, string][] = [];
  const posts = facts?.postsTotal ?? exam.vacancy_count;
  if (posts) tiles.push(["Posts", posts.toLocaleString("en-IN")]);
  if (facts?.pattern) {
    tiles.push(["Marks", String(facts.pattern.total)]);
    tiles.push(["Wrong", `−${facts.pattern.negative}`]);
  } else if (facts?.pay) {
    tiles.push(["Pay", facts.pay.split(" ")[0]]);
  }
  const dateText = examDate
    ? new Date(examDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })
    : null;
  return (
    <>
      <Breadcrumb items={examBreadcrumbs(exam, "overview")} />
      <header className="ticket ticket-dark reveal overflow-visible">
        <div className="p-5 pb-4">
          <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] opacity-70">
            {exam.department ?? "JKSSB"}
            {facts ? ` · Advt ${facts.advert.no}` : ""}
          </p>
          <h1 className="mt-2 text-[28px] leading-[1.1] sm:text-[34px]">{exam.title}</h1>
          {status && <p className="mt-1.5 text-[14px] opacity-75">{status}</p>}
          {tiles.length > 0 && (
            <dl className="mt-4 grid grid-cols-3 gap-2">
              {tiles.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-[hsl(var(--focus-fg)/0.08)] px-3 py-2">
                  <dt className="text-[10.5px] uppercase tracking-[0.12em] opacity-65">{k}</dt>
                  <dd className="mt-0.5 truncate font-mono-num text-[18px] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="ticket-stub flex items-center justify-between gap-3 px-5 py-4">
          {examDate ? (
            <span className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.12em] opacity-65">Exam · {dateText}</span>
              <span className="[&_*]:!text-[hsl(var(--focus-fg))]">
                <DaysLeft iso={examDate} size="xl" />
              </span>
            </span>
          ) : (
            <span className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.12em] opacity-65">Exam date</span>
              <span className="text-[18px] font-semibold">Not announced yet</span>
            </span>
          )}
          <FollowButton slug={exam.slug} tone="dark" />
        </div>
      </header>
    </>
  );
}
