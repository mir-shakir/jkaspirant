import Link from "next/link";
import type { Spotlight } from "@/config/spotlight";

export function SpotlightCard({ spotlight }: { spotlight: Spotlight }) {
  return (
    <section className="reveal surface-card relative overflow-hidden p-5 sm:p-7">
      {/* chinar-leaf watermark */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-[hsl(var(--accent))] opacity-[0.07] sm:h-56 sm:w-56"
        fill="currentColor"
      >
        <path d="M50 4 58 26 76 14 72 36 94 34 78 50 96 62 72 64 78 86 58 74 50 96 42 74 22 86 28 64 4 62 22 50 6 34 28 36 24 14 42 26Z" />
      </svg>

      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--accent))] opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
        </span>
        <p className="section-kicker">{spotlight.kicker}</p>
      </div>

      <h1 className="mt-3 max-w-2xl text-[28px] leading-[1.1] sm:text-[40px]">{spotlight.title}</h1>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono-num text-[12px] text-[hsl(var(--muted))]">
        {spotlight.facts.map((f) => (
          <li key={f} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[hsl(var(--muted))]" />
            {f}
          </li>
        ))}
      </ul>

      {/* stage tracker */}
      <ol className="mt-6 grid grid-cols-4 gap-1.5" aria-label="Exam progress">
        {spotlight.stages.map((stage) => (
          <li key={stage.label} className="min-w-0">
            <div
              className={`h-1.5 rounded-full ${
                stage.status === "done"
                  ? "bg-[hsl(var(--success))]"
                  : stage.status === "current"
                    ? "bg-[repeating-linear-gradient(-45deg,hsl(var(--warm))_0_4px,hsl(var(--warm)/0.45)_4px_8px)]"
                    : "bg-[hsl(var(--line))]"
              }`}
            />
            <p
              className={`mt-2 truncate text-[12.5px] font-semibold ${
                stage.status === "upcoming" ? "text-[hsl(var(--muted))]" : ""
              }`}
            >
              {stage.label}
            </p>
            {stage.date && (
              <p className="truncate font-mono-num text-[11px] text-[hsl(var(--muted))]">{stage.date}</p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href={spotlight.primaryCta.href} className="btn-primary py-3 text-[15px]">
          {spotlight.primaryCta.label} →
        </Link>
        {spotlight.secondaryCta && (
          <Link href={spotlight.secondaryCta.href} className="pill-link justify-center py-3">
            {spotlight.secondaryCta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
