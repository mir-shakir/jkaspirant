"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/exams", label: "Exams" },
  { href: "/resources", label: "Resources" },
  { href: "/notifications", label: "Updates" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[hsl(var(--line))] bg-[hsla(var(--background),0.95)] px-3 py-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-3 py-3 text-center text-xs font-semibold transition ${
                isActive
                  ? "bg-[hsl(var(--accent-strong))] text-white"
                  : "bg-[hsl(var(--panel))] text-[hsl(var(--muted))]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
