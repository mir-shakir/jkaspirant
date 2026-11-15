import Link from "next/link";

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({ kicker, title, description, href, linkLabel }: SectionHeaderProps) {
  return (
    <div className="rule-double pt-3">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {kicker && <p className="section-kicker">{kicker}</p>}
          <h2 className="mt-1 text-[22px] leading-tight sm:text-[26px]">{title}</h2>
        </div>
        {href && linkLabel && (
          <Link
            href={href}
            className="shrink-0 pb-1 text-sm font-medium text-[hsl(var(--accent))] hover:underline"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted))]">{description}</p>
      )}
    </div>
  );
}
