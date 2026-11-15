"use client";

import { useState } from "react";
import type { SyllabusSection } from "@/lib/types/database";

interface SyllabusAccordionProps {
  sections: SyllabusSection[];
}

export function SyllabusAccordion({ sections }: SyllabusAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (sections.length === 0) {
    return (
      <p className="surface-card p-5 text-[hsl(var(--muted))]">
        Syllabus details are not yet available for this exam.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="surface-card overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            aria-expanded={openIndex === index}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {section.section_title}
              </span>
              {section.marks_weight && (
                <span className="rounded-full bg-[hsl(var(--panel-soft))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--accent-strong))]">
                  {section.marks_weight} marks
                </span>
              )}
            </div>
            <svg
              className={`h-5 w-5 text-[hsl(var(--muted))] transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          {openIndex === index && (
            <div className="border-t border-[hsl(var(--line))] px-5 py-4">
              <ul className="space-y-1">
                {section.topics.map((topic, topicIndex) => (
                  <li
                    key={topicIndex}
                    className="text-sm text-[hsl(var(--muted))]"
                  >
                    &bull; {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
