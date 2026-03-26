"use client";

import { useState, useMemo } from "react";
import type { Cutoff } from "@/lib/types/database";

interface CutoffTableProps {
  cutoffs: Cutoff[];
}

export function CutoffTable({ cutoffs }: CutoffTableProps) {
  const years = useMemo(
    () => Array.from(new Set(cutoffs.map((c) => c.year))).sort((a, b) => b - a),
    [cutoffs]
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(
    years[0] ?? null
  );

  if (cutoffs.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Cut-off data is not yet available for this exam.
      </p>
    );
  }

  const filtered = selectedYear
    ? cutoffs.filter((c) => c.year === selectedYear)
    : cutoffs;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              selectedYear === year
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Cut-off Score</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Total Posts</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Applicants</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filtered.map((cutoff) => (
              <tr key={cutoff.id}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{cutoff.category}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{cutoff.cutoff_score ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{cutoff.total_posts ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{cutoff.total_applied ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
