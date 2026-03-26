import Link from "next/link";

interface ExamSubNavProps {
  examSlug: string;
  activeTab: "overview" | "syllabus" | "previous-papers" | "cut-offs" | "important-dates";
}

const tabs = [
  { key: "overview", label: "Overview", path: "" },
  { key: "syllabus", label: "Syllabus", path: "/syllabus" },
  { key: "previous-papers", label: "Papers", path: "/previous-papers" },
  { key: "cut-offs", label: "Cut-offs", path: "/cut-offs" },
  { key: "important-dates", label: "Dates", path: "/important-dates" },
] as const;

export function ExamSubNav({ examSlug, activeTab }: ExamSubNavProps) {
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/exams/${examSlug}${tab.path}`}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
