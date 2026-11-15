import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono-num text-[11px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">
        <li>
          <Link href="/" className="hover:text-[hsl(var(--foreground))]">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {index === items.length - 1 ? (
              <span className="text-[hsl(var(--foreground))]" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link href={item.path} className="hover:text-[hsl(var(--foreground))]">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
