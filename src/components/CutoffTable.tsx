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
      <p className="surface-card p-5 text-[hsl(var(--muted))]">
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
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedYear === year
                ? "bg-[hsl(var(--accent-strong))] text-white"
                : "border border-[hsl(var(--line))] bg-[hsl(var(--panel))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--panel-soft))]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[hsl(var(--foreground))]">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-[hsl(var(--foreground))]">Cut-off Score</th>
              <th className="px-4 py-3 text-left font-semibold text-[hsl(var(--foreground))]">Total Posts</th>
              <th className="px-4 py-3 text-left font-semibold text-[hsl(var(--foreground))]">Applicants</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--line))]">
            {filtered.map((cutoff) => (
              <tr key={cutoff.id}>
                <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{cutoff.category}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted))]">{cutoff.cutoff_score ?? "—"}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted))]">{cutoff.total_posts ?? "—"}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted))]">{cutoff.total_applied ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
