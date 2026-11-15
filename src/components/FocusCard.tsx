import Link from "next/link";
import type { Spotlight } from "@/config/spotlight";

/** The single loudest thing on the homepage: what is happening now, and one action. */
export function FocusCard({ spotlight }: { spotlight: Spotlight }) {
  return (
    <section className="reveal relative overflow-hidden rounded-3xl bg-[hsl(var(--focus))] p-5 text-[hsl(var(--focus-fg))] sm:p-7">
      {/* chinar leaf, barely there */}
      <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rotate-12 opacity-[0.07]" fill="currentColor">
        <path d="M50 4 58 26 76 14 72 36 94 34 78 50 96 62 72 64 78 86 58 74 50 96 42 74 22 86 28 64 4 62 22 50 6 34 28 36 24 14 42 26Z" />
      </svg>

      <p className="flex items-center gap-2 font-mono-num text-[11px] uppercase tracking-[0.16em] opacity-75">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--warm))] opacity-70 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--warm))]" />
        </span>
        {spotlight.exam}
      </p>

      <h1 className="mt-3 text-[30px] leading-[1.1] sm:text-[38px]">{spotlight.headline}</h1>
      <p className="mt-2 text-[14px] opacity-75">{spotlight.detail}</p>

      <ol className="mt-5 flex gap-1.5" aria-label="Where this exam stands">
        {spotlight.stages.map((stage) => (
          <li key={stage.label} className="min-w-0 flex-1">
            <span
              className={`block h-1 rounded-full ${
                stage.status === "done"
                  ? "bg-[hsl(var(--focus-fg))]"
                  : stage.status === "current"
                    ? "bg-[hsl(var(--warm))]"
                    : "bg-[hsl(var(--focus-fg)/0.22)]"
              }`}
            />
            <span
              className={`mt-1.5 block truncate text-[11.5px] ${
                stage.status === "current" ? "font-semibold text-[hsl(var(--warm))]" : stage.status === "done" ? "opacity-90" : "opacity-50"
              }`}
            >
              {stage.label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href={spotlight.primaryCta.href} className="btn sm:flex-1 bg-[hsl(var(--focus-fg))] text-[hsl(var(--focus))] hover:opacity-90">
          {spotlight.primaryCta.label}
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" />
          </svg>
        </Link>
        {spotlight.secondaryCta && (
          <Link href={spotlight.secondaryCta.href} className="btn sm:flex-1 border border-[hsl(var(--focus-fg)/0.3)] hover:bg-[hsl(var(--focus-fg)/0.08)]">
            {spotlight.secondaryCta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
