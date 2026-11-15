import { Breadcrumb } from "@/components/Breadcrumb";
import { ExamSubNav } from "@/components/ExamSubNav";
import type { Exam } from "@/lib/types/database";
import { getExamSections } from "@/lib/queries/exams";
import { liveExams } from "@/config/exams";

type Tab = "overview" | "syllabus" | "previous-papers" | "cut-offs" | "important-dates";

const tabTitles: Record<Tab, string | null> = {
  overview: null,
  syllabus: "Syllabus",
  "previous-papers": "Previous Papers",
  "cut-offs": "Cut-offs",
  "important-dates": "Important Dates",
};

const tabPaths: Record<Tab, string> = {
  overview: "",
  syllabus: "/syllabus",
  "previous-papers": "/previous-papers",
  "cut-offs": "/cut-offs",
  "important-dates": "/important-dates",
};

export function examBreadcrumbs(exam: Pick<Exam, "slug" | "title">, tab: Tab) {
  const items = [
    { name: "Exams", path: "/exams" },
    { name: exam.title, path: `/exams/${exam.slug}` },
  ];
  const title = tabTitles[tab];
  if (title) items.push({ name: title, path: `/exams/${exam.slug}${tabPaths[tab]}` });
  return items;
}

/** Same header on every page of an exam, so the tabs never move. Empty sections get no tab. */
export async function ExamHeader({ exam, tab }: { exam: Pick<Exam, "id" | "slug" | "title" | "department" | "vacancy_count">; tab: Tab }) {
  const section = tabTitles[tab];
  const sections = await getExamSections(exam.id);
  const available: Tab[] = ["overview"];
  if (sections.syllabus > 0) available.push("syllabus");
  if (sections.papers > 0) available.push("previous-papers");
  if (sections.cutoffs > 0) available.push("cut-offs");
  if (sections.dates > 0) available.push("important-dates");

  const facts = [
    exam.department,
    exam.vacancy_count ? `${exam.vacancy_count.toLocaleString("en-IN")} posts` : null,
    tab === "overview" ? liveExams[exam.slug]?.status : null,
  ].filter(Boolean);

  return (
    <>
      <Breadcrumb items={examBreadcrumbs(exam, tab)} />
      <header>
        <h1 className="text-[28px] leading-[1.12] sm:text-[36px]">
          {exam.title}
          {section && <span className="text-[hsl(var(--muted))]"> {section}</span>}
        </h1>
        {facts.length > 0 && <p className="mt-1.5 text-[14px] text-[hsl(var(--muted))]">{facts.join(" · ")}</p>}
      </header>
      <ExamSubNav examSlug={exam.slug} activeTab={tab} available={available} />
    </>
  );
}
