import Link from "next/link";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/exams", label: "Exams" },
  { href: "/bundles", label: "Resources" },
  { href: "/notifications", label: "Notifications" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold text-gray-900 dark:text-white"
        >
          JK Aspirant
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        <MobileNav links={navLinks} />
      </div>
    </header>
  );
}
