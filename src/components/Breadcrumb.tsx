import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Phones get a single "back to parent" link (what people actually use).
 * Wider screens get the full trail. Structured data is emitted by each page.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const parent = items.length >= 2 ? items[items.length - 2] : { name: "Home", path: "/" };

  return (
    <nav aria-label="Breadcrumb" className="-ml-1 mb-3">
      <Link
        href={parent.path}
        className="inline-flex min-h-[40px] items-center gap-1 pr-3 text-sm font-medium text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] sm:hidden"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12.5 4.5 7 10l5.5 5.5" />
        </svg>
        <span className="max-w-[60vw] truncate">{parent.name}</span>
      </Link>

      <ol className="hidden min-h-[40px] flex-wrap items-center gap-1.5 pl-1 text-[13px] text-[hsl(var(--muted))] sm:flex">
        <li>
          <Link href="/" className="hover:text-[hsl(var(--foreground))]">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {index === items.length - 1 ? (
              <span className="max-w-[28ch] truncate text-[hsl(var(--foreground))]" aria-current="page">
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
