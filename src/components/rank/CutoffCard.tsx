import type { ExpectedCutoff } from "@/lib/rank";

/**
 * Expected cut-off for every category, shown near the top of a rank tool.
 * Server-rendered so search engines can read it, and dated + branded so a
 * screenshot shared elsewhere still says when and where it came from.
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
  const open = cutoffs.find((c) => c.category === "OM");
  const rest = cutoffs.filter((c) => c.category !== "OM");
  const when = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(updatedAt);

  return (
    <section
      aria-labelledby="expected-cutoff"
      className="relative overflow-hidden rounded-3xl bg-[hsl(var(--focus))] p-5 text-[hsl(var(--focus-fg))] sm:p-6"
    >
      <h2 id="expected-cutoff" className="font-mono-num text-[11px] uppercase tracking-[0.16em] opacity-75">
        Expected cut-off · {examLabel}
      </h2>

      {open && (
        <p className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-[52px] font-semibold leading-none tracking-tight sm:text-[60px]">{open.cutoff}</span>
          <span className="text-[14px] leading-5 opacity-80">
            Open merit (OM)
            <br />
            <span className="opacity-75">{open.seats} seats</span>
          </span>
        </p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[hsl(var(--focus-fg)/0.15)] pt-4 sm:grid-cols-4">
        {rest.map((c) => (
          <div key={c.category}>
            <dt className="text-[12.5px] opacity-70">
              {c.category} <span className="opacity-70">· {c.seats}</span>
            </dt>
            <dd className="font-mono-num text-[22px] font-semibold leading-tight text-[hsl(var(--warm))]">{c.cutoff}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[12px] leading-[1.45] opacity-65">
        Marks out of {outOf}. Our estimate, not official, from past JKSSB papers{shared > 0 ? ` and ${shared.toLocaleString("en-IN")} shared scores` : ""} · {when} IST · jkaspirant.in
      </p>
    </section>
  );
}
