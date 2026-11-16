import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LogoMark } from "./LogoMark";
import { mainNav } from "@/config/site";

// Phones navigate with the bottom tab bar, so the header stays quiet there:
// brand and theme. Desktop gets the same four destinations as text links.
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-[hsl(var(--background)/0.9)] backdrop-blur-md">
      <div className="page-shell flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="JK Aspirant home">
          <LogoMark className="h-7 w-7 shrink-0" />
          <span className="font-display text-[22px] font-semibold leading-none tracking-tight">JK Aspirant</span>
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Main">
          {mainNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--muted))] transition hover:text-[hsl(var(--foreground))]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
