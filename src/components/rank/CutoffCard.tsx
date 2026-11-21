import type { ExpectedCutoff } from "@/lib/rank";

/**
 * Expected cut-off for every category, shown under the calculator, above the
 * leaderboard. Server-rendered so search engines can read it; dated and
 * branded so a screenshot shared elsewhere still says when and where.
 */
export function CutoffCard({
  examLabel,
  cutoffs,
  shared,
  updatedAt,
  outOf,
}: {
  examLabel: string;
  cutoffs: ExpectedCutoff[];
  shared: number;
  updatedAt: Date;
  outOf: number;
}) {
  const when = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(updatedAt);

  return (
    <section id="expected-cutoff" aria-labelledby="expected-cutoff-title" className="surface-card scroll-mt-20 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="expected-cutoff-title" className="text-[17px] leading-tight">
          Expected cut-off
        </h2>
        <span className="font-mono-num text-[11px] text-[hsl(var(--muted))]">{examLabel}</span>
      </div>

      <dl className="mt-3 grid grid-cols-4 gap-1.5">
        {cutoffs.map((c) => {
          const open = c.category === "OM";
          return (
            <div
              key={c.category}
              className={`rounded-xl px-2 py-1.5 text-center ${
                open ? "bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent-strong))] dark:text-[hsl(var(--accent))]" : "bg-[hsl(var(--panel-soft))]"
              }`}
            >
              <dt className={`text-[11px] leading-tight ${open ? "font-semibold" : "text-[hsl(var(--muted))]"}`}>{c.category}</dt>
              <dd className="font-mono-num text-[17px] font-semibold leading-snug">{c.cutoff}</dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-2.5 text-[11.5px] leading-4 text-[hsl(var(--muted))]">
        Out of {outOf} · {shared > 0 ? `${shared.toLocaleString("en-IN")} scores · ` : ""}
        {when} IST · jkaspirant.in
      </p>
    </section>
  );
}
