import Link from "next/link";
import { TelegramLink } from "./TelegramLink";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/notifications", label: "Latest updates" },
      { href: "/tools", label: "Rank & score tools" },
      { href: "/exams", label: "Exam hubs" },
      { href: "/resources", label: "Previous papers" },
    ],
  },
  {
    title: "Official sources",
    links: [
      { href: "https://jkssb.nic.in", label: "JKSSB ↗", external: true },
      { href: "https://jkpsc.nic.in", label: "JKPSC ↗", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="page-shell py-10">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold">JK Aspirant</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted))]">
              Fast, clean exam updates and tools for JKSSB &amp; JKPSC aspirants. No ads, no
              popups. Every update links to the official notice.
            </p>
            <TelegramLink className="mt-4" />
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="section-kicker">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {"external" in l ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t pt-5 font-mono-num text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
          © {new Date().getFullYear()} JK Aspirant · Not affiliated with JKSSB or JKPSC
        </p>
      </div>
    </footer>
  );
}
