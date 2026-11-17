import Link from "next/link";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/notifications", label: "Updates" },
  { href: "/exams", label: "Exams" },
  { href: "/calendar", label: "Calendar" },
  { href: "/tools", label: "Tools" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="mt-14 border-t">
      <div className="page-shell py-8">
        <p className="font-display text-xl font-semibold">JK Aspirant</p>
        <p className="mt-1.5 max-w-sm text-[13.5px] leading-6 text-[hsl(var(--muted))]">
          JKSSB exam updates and tools for J&amp;K aspirants. Every update links to the official notice.
        </p>

        <nav aria-label="Footer" className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex min-h-[40px] items-center text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
              {l.label}
            </Link>
          ))}
          {siteConfig.telegramUrl && (
            <a href={siteConfig.telegramUrl} target="_blank" rel="noopener noreferrer" data-event="telegram_join_click" data-event-label="footer" className="inline-flex min-h-[40px] items-center text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
              Telegram ↗
            </a>
          )}
          <a href="https://jkssb.nic.in" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
            JKSSB ↗
          </a>
        </nav>

        <p className="mt-5 text-[12px] text-[hsl(var(--muted))]">
          © {new Date().getFullYear()} JK Aspirant. Independent; not affiliated with JKSSB. The official notice always wins.
        </p>
      </div>
    </footer>
  );
}
