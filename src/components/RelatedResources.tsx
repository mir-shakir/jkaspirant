import Link from "next/link";

interface RelatedResource {
  href: string;
  title: string;
  description: string;
  label: string;
  external?: boolean;
}

interface RelatedResourcesProps {
  items: RelatedResource[];
}

export function RelatedResources({ items }: RelatedResourcesProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <RelatedResourceLink
          key={`${item.href}-${item.label}`}
          item={item}
        >
          <span className="rounded-full bg-[hsl(var(--panel-soft))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--accent-strong))]">
            {item.label}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-[hsl(var(--foreground))]">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">
            {item.description}
          </p>
        </RelatedResourceLink>
      ))}
    </div>
  );
}

function RelatedResourceLink({
  item,
  children,
}: {
  item: RelatedResource;
  children: React.ReactNode;
}) {
  const className =
    "surface-card p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(15,23,42,0.1)]";

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {children}
    </Link>
  );
}
