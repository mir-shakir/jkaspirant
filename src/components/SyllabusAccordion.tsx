import type { SyllabusSection } from "@/lib/types/database";
import { EmptyState } from "@/components/ui";

interface SyllabusAccordionProps {
  sections: SyllabusSection[];
}

/** Sections open one tap at a time. Native <details>, so it works without JavaScript. */
export function SyllabusAccordion({ sections }: SyllabusAccordionProps) {
  if (sections.length === 0) {
    return <EmptyState>The syllabus for this exam hasn&apos;t been added yet.</EmptyState>;
  }
  const totalMarks = sections.reduce((sum, s) => sum + (s.marks_weight ?? 0), 0);

  return (
    <>
      {totalMarks > 0 && (
        <p className="mb-3 text-[14px] text-[hsl(var(--muted))]">
          {sections.length} sections · {totalMarks} marks
        </p>
      )}
      <div className="group-list">
        {sections.map((section, index) => (
          <details key={section.id} className="group" open={index === 0}>
            <summary className="row cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1 text-[15px] font-medium">{section.section_title}</span>
              {section.marks_weight ? (
                <span className="shrink-0 font-mono-num text-[12px] text-[hsl(var(--muted))]">{section.marks_weight} marks</span>
              ) : null}
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[hsl(var(--muted))] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m4.5 7.5 5.5 5.5 5.5-5.5" />
              </svg>
            </summary>
            <ul className="space-y-2 px-4 pb-4 pt-1">
              {section.topics.map((topic, i) => (
                <li key={i} className="relative pl-4 text-[14.5px] leading-6 text-[hsl(var(--muted))]">
                  <span className="absolute left-0 top-[0.7em] h-1 w-1 rounded-full bg-[hsl(var(--muted))]" />
                  {topic}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </>
  );
}
