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
    <nav className="mb-8 flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/exams/${examSlug}${tab.path}`}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
            activeTab === tab.key
              ? "border-transparent bg-[hsl(var(--accent-strong))] text-white shadow-sm"
              : "border-[hsl(var(--line))] bg-[hsl(var(--panel))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
