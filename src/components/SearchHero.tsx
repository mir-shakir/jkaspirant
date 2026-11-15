"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

interface SearchItem {
  title: string;
  href: string;
  tag: string;
  description: string;
  external?: boolean;
}

interface QuickLink {
  label: string;
  href: string;
}

interface SearchHeroProps {
  kicker: string;
  title: string;
  placeholder: string;
  items: SearchItem[];
  quickLinks: QuickLink[];
}

export function SearchHero({
  kicker,
  title,
  placeholder,
  items,
  quickLinks,
}: SearchHeroProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    if (!normalized) return [];

    return items
      .filter((item) =>
        `${item.title} ${item.description} ${item.tag}`
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 6);
  }, [deferredQuery, items]);

  return (
    <section className="surface-card relative overflow-hidden px-5 py-5 sm:px-8 sm:py-6">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-amber-200/50 via-transparent to-sky-200/40" />
      <div className="relative">
        <p className="section-kicker">{kicker}</p>
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold text-[hsl(var(--foreground))] sm:text-4xl">
          {title}
        </h1>

        <div className="mt-4 rounded-[26px] border border-[hsl(var(--line))] bg-[hsla(var(--panel),0.85)] p-3 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-[20px] bg-transparent px-3 py-2.5 text-base text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))]"
            aria-label="Search resources"
          />

          {results.length > 0 && (
            <div className="mt-2 grid gap-2">
              {results.map((item) => (
                <SearchResultLink
                  key={`${item.href}-${item.tag}`}
                  item={item}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[hsl(var(--muted))]">
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[hsl(var(--panel))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--accent-strong))]">
                    {item.tag}
                  </span>
                </SearchResultLink>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="pill-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchResultLink({
  item,
  children,
}: {
  item: SearchItem;
  children: React.ReactNode;
}) {
  const className =
    "flex items-start justify-between gap-3 rounded-[20px] bg-[hsl(var(--panel-soft))] px-4 py-3 transition hover:bg-[hsl(var(--panel))]";

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {children}
    </Link>
  );
}
