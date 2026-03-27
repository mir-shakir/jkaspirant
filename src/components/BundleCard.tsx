import Link from "next/link";
import type { Bundle } from "@/lib/types/database";

interface BundleCardProps {
  bundle: Pick<Bundle, "slug" | "title" | "price_paise" | "cover_image_url"> & {
    exam?: { title: string } | null;
    files?: { id: string }[];
  };
}

export function BundleCard({ bundle }: BundleCardProps) {
  const priceRupees = bundle.price_paise / 100;
  const fileCount = bundle.files?.length || 0;

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {bundle.title}
      </h3>
      {bundle.exam && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {bundle.exam.title}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
          ₹{priceRupees}
        </span>
        {fileCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </span>
        )}
      </div>
    </Link>
  );
}
