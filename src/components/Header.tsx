import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { TelegramLink } from "./TelegramLink";
import { mainNav } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-[hsl(var(--background)/0.88)] backdrop-blur-md">
      <div className="page-shell flex h-14 items-center justify-between gap-4">
        <Link href="/" className="group flex items-baseline gap-2" aria-label="JK Aspirant home">
          <span className="font-display text-[22px] font-semibold leading-none tracking-tight">
            JK Aspirant
          </span>
          <span
            aria-hidden
            className="h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[hsl(var(--accent))]"
          />
          <span className="hidden font-mono-num text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--muted))] md:inline">
            JKSSB · JKPSC
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {mainNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted))] transition hover:text-[hsl(var(--foreground))]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <TelegramLink className="hidden sm:inline-flex" compact />
          <ThemeToggle />
          <MobileNav links={[...mainNav]} />
        </div>
      </div>
    </header>
  );
}
