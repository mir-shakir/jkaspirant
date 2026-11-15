import Link from "next/link";
import type { Exam } from "@/lib/types/database";

interface ExamCardProps {
  exam: Pick<Exam, "slug" | "title" | "department" | "vacancy_count">;
}

const links = [
  { suffix: "/syllabus", label: "Syllabus" },
  { suffix: "/previous-papers", label: "Papers" },
  { suffix: "/cut-offs", label: "Cut-offs" },
  { suffix: "/important-dates", label: "Dates" },
];

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <article className="surface-card flex flex-col p-4 transition hover:border-[hsl(var(--foreground)/0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
            {exam.department || "Exam"}
          </p>
          <h3 className="mt-1 text-lg leading-snug">
            <Link href={`/exams/${exam.slug}`} className="hover:text-[hsl(var(--accent))]">
              {exam.title}
            </Link>
          </h3>
        </div>
        {exam.vacancy_count ? (
          <div className="shrink-0 text-right font-mono-num leading-none">
            <span className="block text-lg font-semibold">
              {exam.vacancy_count.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">posts</span>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {links.map((l) => (
          <Link
            key={l.suffix}
            href={`/exams/${exam.slug}${l.suffix}`}
            className="rounded-md bg-[hsl(var(--panel-soft))] px-2.5 py-1.5 text-[13px] font-medium hover:text-[hsl(var(--accent))]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </article>
  );
}
