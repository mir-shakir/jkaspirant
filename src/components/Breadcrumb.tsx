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
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[hsl(var(--muted))]">
        <li>
          <Link href="/" className="pill-link-muted hover:bg-[hsl(var(--panel))]">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-[hsl(var(--line))]">
              /
            </span>
            {index === items.length - 1 ? (
              <span className="pill-link-muted bg-[hsl(var(--panel))] text-[hsl(var(--foreground))]">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.path}
                className="pill-link-muted hover:bg-[hsl(var(--panel))]"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
