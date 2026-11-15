"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-2 text-[hsl(var(--foreground))]"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-[hsl(var(--line))] bg-[hsla(var(--background),0.98)] px-4 py-4 shadow-[0_24px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="surface-card mx-auto max-w-xl p-4">
            <p className="section-kicker">Quick start</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              Jump straight to papers, syllabus, updates, and curated study packs.
            </p>
            <nav className="mt-4 flex flex-col gap-2">
              <Link
                href="/resources"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-[hsl(var(--accent-strong))] px-4 py-3 text-sm font-semibold text-white"
              >
                Search study resources
              </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-[hsl(var(--line))] bg-[hsl(var(--panel-soft))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))]"
              >
                {link.label}
              </Link>
            ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
