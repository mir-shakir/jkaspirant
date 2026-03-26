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
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1">
            <span aria-hidden="true">/</span>
            {index === items.length - 1 ? (
              <span className="text-gray-900 dark:text-white">{item.name}</span>
            ) : (
              <Link
                href={item.path}
                className="hover:text-gray-900 dark:hover:text-white"
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
