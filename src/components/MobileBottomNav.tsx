"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The four places on the site. Each tab also owns the pages underneath it,
// so the highlighted tab always answers "where am I?".
const tabs = [
  { href: "/", label: "Home", match: ["/calendar"], icon: "M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5V15h-6v5.5H4a.5.5 0 0 1-.5-.5v-9.5Z" },
  { href: "/notifications", label: "Updates", match: [], icon: "M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9Zm4.2 11.5a2 2 0 0 0 3.6 0" },
  { href: "/exams", label: "Exams", match: [], icon: "M5 4.5h11.5a2.5 2.5 0 0 1 2.5 2.5v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Zm0 12.5a2.5 2.5 0 0 1 2.5-2.5H19M9 8.5h6" },
  { href: "/tools", label: "Tools", match: [], icon: "M5 20V10m7 10V4m7 16v-7" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const isActive = (tab: (typeof tabs)[number]) =>
    tab.href === "/"
      ? pathname === "/" || tab.match.some((m) => pathname.startsWith(m))
      : pathname.startsWith(tab.href) || tab.match.some((m) => pathname.startsWith(m));

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-[hsl(var(--background)/0.96)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-[58px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                active ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted))]"
              }`}
            >
              <span className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${active ? "bg-[hsl(var(--accent)/0.12)]" : ""}`}>
                <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={tab.icon} />
                </svg>
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
