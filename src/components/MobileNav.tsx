"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-[hsl(var(--panel))]"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" aria-hidden>
          {isOpen ? (
            <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-14 border-b bg-[hsl(var(--background))] shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
          <nav className="page-shell flex flex-col py-2" aria-label="Menu">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between border-b py-3.5 font-display text-xl last:border-0"
              >
                {link.label}
                <span className="text-[hsl(var(--muted))]">→</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
