import Link from "next/link";

type TabKey = "overview" | "syllabus" | "previous-papers" | "cut-offs" | "important-dates";

interface ExamSubNavProps {
  examSlug: string;
  activeTab: TabKey;
  /** Tabs to show. Sections with nothing in them are left out. */
  available: TabKey[];
}

const tabs = [
  { key: "overview", label: "Overview", path: "" },
  { key: "syllabus", label: "Syllabus", path: "/syllabus" },
  { key: "previous-papers", label: "Papers", path: "/previous-papers" },
  { key: "cut-offs", label: "Cut-offs", path: "/cut-offs" },
  { key: "important-dates", label: "Dates", path: "/important-dates" },
] as const;

/** Tabs for one exam. Sticks under the header so switching never needs a scroll. */
export function ExamSubNav({ examSlug, activeTab, available }: ExamSubNavProps) {
  const shown = tabs.filter((tab) => tab.key === activeTab || available.includes(tab.key));
  if (shown.length <= 1) return null;
  return (
    <nav
      aria-label="Exam sections"
      className="sticky top-14 z-40 -mx-4 mt-4 border-b bg-[hsl(var(--background)/0.95)] backdrop-blur-md sm:-mx-6"
    >
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 sm:px-6">
        {shown.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/exams/${examSlug}${tab.path}`}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-11 shrink-0 items-center px-3 text-sm font-medium transition-colors ${
                active ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {tab.label}
              {active && <span className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-t bg-[hsl(var(--accent))]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
