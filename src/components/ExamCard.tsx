import Link from "next/link";
import type { Exam } from "@/lib/types/database";

interface ExamCardProps {
  exam: Pick<Exam, "slug" | "title" | "department" | "vacancy_count">;
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link
      href={`/exams/${exam.slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {exam.title}
      </h3>
      {exam.department && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {exam.department}
        </p>
      )}
      {exam.vacancy_count && (
        <p className="mt-2 text-xs font-medium text-teal-700 dark:text-teal-400">
          {exam.vacancy_count} vacancies
        </p>
      )}
    </Link>
  );
}
