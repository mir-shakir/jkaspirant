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
      <p className="text-gray-500 dark:text-gray-400">
        Syllabus details are not yet available for this exam.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            aria-expanded={openIndex === index}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {section.section_title}
              </span>
              {section.marks_weight && (
                <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  {section.marks_weight} marks
                </span>
              )}
            </div>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
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
            <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
              <ul className="space-y-1">
                {section.topics.map((topic, topicIndex) => (
                  <li
                    key={topicIndex}
                    className="text-sm text-gray-600 dark:text-gray-400"
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
