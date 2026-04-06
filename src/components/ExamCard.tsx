import Link from "next/link";
import type { Exam } from "@/lib/types/database";

interface ExamCardProps {
  exam: Pick<Exam, "slug" | "title" | "department" | "vacancy_count">;
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <article className="surface-card p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Exam hub</p>
          <h3 className="mt-2 text-xl font-semibold text-[hsl(var(--foreground))]">
            <Link href={`/exams/${exam.slug}`} className="hover:text-[hsl(var(--accent-strong))]">
              {exam.title}
            </Link>
          </h3>
          {exam.department && (
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              {exam.department}
            </p>
          )}
        </div>
        {exam.vacancy_count && (
          <span className="rounded-full bg-[hsla(var(--warm),0.14)] px-3 py-1 text-xs font-semibold text-[hsl(var(--warm))]">
            {exam.vacancy_count.toLocaleString("en-IN")} posts
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href={`/exams/${exam.slug}/previous-papers`} className="pill-link justify-center">
          Papers
        </Link>
        <Link href={`/exams/${exam.slug}/syllabus`} className="pill-link justify-center">
          Syllabus
        </Link>
        <Link href={`/exams/${exam.slug}/important-dates`} className="pill-link justify-center">
          Dates
        </Link>
        <Link href={`/exams/${exam.slug}`} className="pill-link justify-center">
          See all →
        </Link>
      </div>
    </article>
  );
}
