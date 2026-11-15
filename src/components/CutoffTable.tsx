"use client";

import { useMemo, useState } from "react";
import type { Cutoff } from "@/lib/types/database";
import { EmptyState } from "@/components/ui";

interface CutoffTableProps {
  cutoffs: Cutoff[];
}

/** One year at a time. Category and score only; the rest is noise on a phone. */
export function CutoffTable({ cutoffs }: CutoffTableProps) {
  const years = useMemo(() => Array.from(new Set(cutoffs.map((c) => c.year))).sort((a, b) => b - a), [cutoffs]);
  const [selectedYear, setSelectedYear] = useState<number | null>(years[0] ?? null);

  if (cutoffs.length === 0) {
    return <EmptyState>No official cut-offs for this exam yet. They are added when the result is declared.</EmptyState>;
  }

  const rows = cutoffs.filter((c) => c.year === selectedYear);
  const posts = rows.find((r) => r.total_posts)?.total_posts;
  const applied = rows.find((r) => r.total_applied)?.total_applied;

  return (
    <div>
      {years.length > 1 && (
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto" role="group" aria-label="Year">
          {years.map((year) => (
            <button key={year} type="button" className="chip font-mono-num" aria-pressed={selectedYear === year} onClick={() => setSelectedYear(year)}>
              {year}
            </button>
          ))}
        </div>
      )}

      <div className="group-list">
        <div className="flex items-center justify-between px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--muted))]">
          <span>Category{years.length === 1 ? ` · ${years[0]}` : ""}</span>
          <span>Cut-off</span>
        </div>
        {rows.map((cutoff) => (
          <div key={cutoff.id} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] font-medium">{cutoff.category}</span>
            <span className="font-mono-num text-[16px] font-semibold">{cutoff.cutoff_score ?? "—"}</span>
          </div>
        ))}
      </div>

      {(posts || applied) && (
        <p className="mt-3 text-[13px] text-[hsl(var(--muted))]">
          {[posts ? `${posts.toLocaleString("en-IN")} posts` : null, applied ? `${applied.toLocaleString("en-IN")} applicants` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
