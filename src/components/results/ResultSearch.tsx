"use client";

import { useEffect, useRef, useState } from "react";
import type { ResultRow } from "@/content/results";

const fmt = (n: number) => n.toLocaleString("en-IN");

/** Type a roll number or name; results come back as a few rows from the server. */
export function ResultSearch({ slug, candidates, outOf }: { slug: string; candidates: number; outOf: number }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<ResultRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    const term = q.trim();
    if (term.length < 3) {
      setRows(null);
      return;
    }
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await fetch(`/api/results/${slug}?q=${encodeURIComponent(term)}`);
        const d = await r.json();
        setRows(d.rows ?? []);
        setTotal(d.total ?? 0);
      } catch {
        setRows([]);
      } finally {
        setBusy(false);
      }
    }, 300);
  }, [q, slug]);

  return (
    <div>
      <label htmlFor="result-q" className="mb-1.5 block text-[13px] font-medium">
        Roll number or name
      </label>
      <input
        id="result-q"
        type="search"
        inputMode="search"
        autoComplete="off"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="e.g. 2070237 or UMAR WANI"
        className="field"
      />
      <p className="mt-1.5 text-[12.5px] text-[hsl(var(--muted))]" aria-live="polite">
        {busy
          ? "Searching…"
          : rows === null
            ? `${fmt(candidates)} candidates. Type at least 3 characters.`
            : total === 0
              ? "No match. Check the spelling or try your roll number."
              : total > rows.length
                ? `${fmt(total)} matches; showing the first ${rows.length}. Add more of the name to narrow it down.`
                : `${fmt(total)} ${total === 1 ? "match" : "matches"}`}
      </p>

      {rows && rows.length > 0 && (
        <ul className="group-list mt-3">
          {rows.map(([rank, roll, name, marks]) => (
            <li key={roll} className="row">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium leading-snug">{name}</span>
                <span className="mt-0.5 block font-mono-num text-[12.5px] text-[hsl(var(--muted))]">
                  Roll {roll} · rank {fmt(rank)} of {fmt(candidates)} · top {Math.max(0.01, Math.round((rank / candidates) * 10000) / 100)}%
                </span>
              </span>
              <span className="shrink-0 text-right font-mono-num">
                <span className="block text-[20px] font-semibold leading-none">{marks}</span>
                <span className="text-[11px] text-[hsl(var(--muted))]">/ {outOf}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
