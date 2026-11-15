import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/exams", label: "Exams" },
  { href: "/resources", label: "Resources" },
  { href: "/notifications", label: "Updates" },
  { href: "/bundles", label: "Study Packs" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--line))] bg-[hsla(var(--background),0.85)] backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="min-w-0 py-2">
          <span className="block text-lg font-semibold text-[hsl(var(--foreground))]">
            JK Aspirant
          </span>
          <span className="hidden text-xs text-[hsl(var(--muted))] sm:block">
            Your JKSSB & JKPSC preparation companion
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[hsl(var(--muted))] transition hover:bg-[hsl(var(--panel))] hover:text-[hsl(var(--foreground))]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/resources"
            className="ml-2 inline-flex items-center rounded-full bg-[hsl(var(--accent-strong))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[hsl(var(--accent))]"
          >
            Find resources
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
