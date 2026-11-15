"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { EmptyState, GroupList, Row } from "@/components/ui";

export interface SearchItem {
  title: string;
  href: string;
  kind: string;
  keywords?: string;
}

/** Instant search over a small list sent with the page. No server round-trips. */
export function SearchBox({ items, suggestions }: { items: SearchItem[]; suggestions: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const words = deferred.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;
    return items
      .filter((item) => {
        const haystack = `${item.title} ${item.kind} ${item.keywords ?? ""}`.toLowerCase();
        return words.every((word) => haystack.includes(word));
      })
      .slice(0, 12);
  }, [deferred, items]);

  const list = results ?? suggestions;

  return (
    <div>
      <div className="relative">
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted))]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “FAA syllabus” or “constable”"
          aria-label="Search the site"
          className="field h-[52px] pl-11"
        />
      </div>

      <p className="mb-2 mt-5 text-[13px] font-medium text-[hsl(var(--muted))]">
        {results ? (results.length > 0 ? `${results.length} result${results.length === 1 ? "" : "s"}` : "") : "Popular"}
      </p>
      {list.length > 0 ? (
        <GroupList>
          {list.map((item) => (
            <Row key={item.href} href={item.href} title={item.title} sub={item.kind} />
          ))}
        </GroupList>
      ) : (
        <EmptyState>Nothing matches “{deferred}”. Try the exam name on its own.</EmptyState>
      )}
    </div>
  );
}
