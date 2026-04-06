import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--line))] bg-[hsla(var(--background),0.9)]">
      <div className="page-shell py-10">
        <div className="surface-card grid gap-8 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              JK Aspirant
            </h3>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">
              Made for JKSSB & JKPSC aspirants. Free papers, syllabus, updates,
              and study packs — everything you need to prepare with confidence.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Explore
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  href="/exams"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  All Exams
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  Resources & Papers
                </Link>
              </li>
              <li>
                <Link
                  href="/bundles"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  Study Packs
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  Latest Updates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Quick Start
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  Download previous papers
                </Link>
              </li>
              <li>
                <Link
                  href="/exams"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  Check your exam syllabus
                </Link>
              </li>
              <li>
                <Link
                  href="/bundles"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  Get a study pack
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Official Sources
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="https://jkssb.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  JKSSB Official Website ↗
                </a>
              </li>
              <li>
                <a
                  href="https://jkpsc.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  JKPSC Official Website ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[hsl(var(--muted))]">
          &copy; {new Date().getFullYear()} JK Aspirant — Made with ❤️ for the aspirants of Jammu & Kashmir.
        </div>
      </div>
    </footer>
  );
}
