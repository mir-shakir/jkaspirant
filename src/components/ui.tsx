import Link from "next/link";

// Shared building blocks. The rule across the site: anything tappable is either
// a Row inside a grouped list, a button, or a chip. Nothing else is a link.

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-[hsl(var(--muted))] ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[hsl(var(--muted))]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 4.5H4.5v11h11V12M11.5 4.5h4v4M15.5 4.5 9 11" />
    </svg>
  );
}

interface RowProps {
  href: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  leading?: React.ReactNode;
  /** Small text shown before the chevron, e.g. a count */
  meta?: React.ReactNode;
  external?: boolean;
}

/** A full-width tappable line. Use inside <GroupList>. */
export function Row({ href, title, sub, leading, meta, external }: RowProps) {
  const inner = (
    <>
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-snug">{title}</span>
        {sub && <span className="mt-0.5 block text-[13px] leading-snug text-[hsl(var(--muted))]">{sub}</span>}
      </span>
      {meta && <span className="shrink-0 font-mono-num text-[12px] text-[hsl(var(--muted))]">{meta}</span>}
      {external ? <ExternalIcon /> : <Chevron />}
    </>
  );
  if (external || /^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="row">
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className="row">
      {inner}
    </Link>
  );
}

export function GroupList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`group-list ${className}`}>{children}</div>;
}

interface SectionProps {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ title, action, children, className = "", id }: SectionProps) {
  return (
    <section className={`mt-9 ${className}`} aria-labelledby={id}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id={id} className="text-[21px] leading-tight">
          {title}
        </h2>
        {action && (
          <Link href={action.href} className="text-link shrink-0">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ kicker, title, lede }: { kicker?: string; title: string; lede?: React.ReactNode }) {
  return (
    <header>
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h1 className="mt-1.5 text-[30px] leading-[1.12] sm:text-[38px]">{title}</h1>
      {lede && <p className="mt-2 max-w-xl text-[15px] leading-6 text-[hsl(var(--muted))]">{lede}</p>}
    </header>
  );
}

/** Calendar-style date used at the start of rows. */
export function DateBlock({ iso, muted }: { iso: string | null; muted?: boolean }) {
  const date = iso ? new Date(iso) : null;
  return (
    <span className={`w-10 shrink-0 text-center font-mono-num leading-none ${muted ? "opacity-60" : ""}`}>
      {date ? (
        <>
          <span className="block text-[19px] font-semibold">
            {date.toLocaleDateString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" })}
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">
            {date.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })}
          </span>
        </>
      ) : (
        <span className="text-[hsl(var(--muted))]">—</span>
      )}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm leading-6 text-[hsl(var(--muted))]">
      {children}
    </p>
  );
}

export const categoryLabels: Record<string, string> = {
  result: "Result",
  admit_card: "Admit card",
  notification: "Notice",
  answer_key: "Answer key",
};

export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}
