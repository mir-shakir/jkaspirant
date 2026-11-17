"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface CutoffGroup {
  examSlug: string;
  exam: string;
  source: string;
  outOf: number | string;
  rows: { label: string; byCat: Record<string, [number | null, number | null]> }[];
}

const KEY = "jka_category";

/** Pick a category once; every past cut-off is shown for it. */
export function CutoffExplorer({ groups, categories }: { groups: CutoffGroup[]; categories: string[] }) {
  const [cat, setCat] = useState("OM");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved && categories.includes(saved)) setCat(saved);
    } catch {}
  }, [categories]);
  const choose = (c: string) => {
    setCat(c);
    try {
      window.localStorage.setItem(KEY, c);
    } catch {}
  };
  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 border-b bg-[hsl(var(--background)/0.95)] px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
        <p className="mb-1.5 text-[12px] text-[hsl(var(--muted))]">Your category</p>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => choose(c)}
              aria-pressed={cat === c}
              className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
                cat === c ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "bg-[hsl(var(--panel-soft))] text-[hsl(var(--muted))]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {groups.map((g) => (
          <section key={g.examSlug} className="surface-card overflow-hidden">
            <Link href={`/exams/${g.examSlug}#cut-offs`} className="row border-b">
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-semibold leading-snug">{g.exam}</span>
                <span className="mt-0.5 block text-[12.5px] text-[hsl(var(--muted))]">{g.source}</span>
              </span>
              <span className="shrink-0 font-mono-num text-[11px] text-[hsl(var(--muted))]">out of {g.outOf}</span>
            </Link>
            <ul className="divide-y">
              {g.rows.map((r) => {
                const [main, women] = r.byCat[cat] ?? [null, null];
                return (
                  <li key={r.label} className="flex items-center gap-3 px-4 py-3">
                    <span className="min-w-0 flex-1 text-[14.5px]">{r.label}</span>
                    {women !== null && (
                      <span className="shrink-0 text-right font-mono-num text-[12px] text-[hsl(var(--muted))]">
                        women {women}
                      </span>
                    )}
                    <span className="w-16 shrink-0 text-right font-mono-num text-[20px] font-semibold">{main ?? "–"}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
