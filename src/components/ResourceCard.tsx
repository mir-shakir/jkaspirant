import Link from "next/link";
import type { Resource } from "@/lib/types/database";

interface ResourceCardProps {
  resource: Resource;
}

const resourceTypeLabels: Record<Resource["resource_type"], string> = {
  notes: "Notes",
  book: "Book",
  official_link: "Official",
  external_link: "External",
  guide: "Guide",
  bundle: "Bundle",
  previous_paper: "Paper",
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const href = resource.url;
  const ctaLabel =
    resource.cta_label ||
    (resource.is_external ? "Open link" : "Open resource");
  const label = resourceTypeLabels[resource.resource_type];
  const card = (
    <article className="surface-card h-full p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(15,23,42,0.1)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[hsl(var(--panel-soft))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--accent-strong))]">
          {label}
        </span>
        {resource.is_premium && (
          <span className="rounded-full bg-[hsla(var(--warm),0.14)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--warm))]">
            Premium
          </span>
        )}
        {resource.is_featured && (
          <span className="rounded-full bg-[hsla(var(--success),0.12)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--success))]">
            Featured
          </span>
        )}
      </div>

      <h3 className="mt-4 text-xl font-semibold text-[hsl(var(--foreground))]">
        {resource.title}
      </h3>

      {resource.exam && (
        <p className="mt-2 text-sm font-medium text-[hsl(var(--foreground))]">
          {resource.exam.title}
        </p>
      )}

      {resource.description && (
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">
          {resource.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-[hsl(var(--muted))]">
          {resource.source_label || (resource.is_external ? "External source" : "Internal resource")}
        </span>
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {ctaLabel}
        </span>
      </div>
    </article>
  );

  if (resource.is_external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {card}
      </a>
    );
  }

  return (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  );
}
