import Link from "next/link";

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  href,
  linkLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {kicker && <p className="section-kicker">{kicker}</p>}
        <h2 className="mt-2 text-xl font-semibold text-[hsl(var(--foreground))] sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">
            {description}
          </p>
        )}
      </div>

      {href && linkLabel && (
        <Link href={href} className="pill-link self-start">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
