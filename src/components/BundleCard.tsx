import Link from "next/link";
import type { Bundle } from "@/lib/types/database";

interface BundleCardProps {
  bundle: Pick<Bundle, "slug" | "title" | "price_paise" | "cover_image_url"> & {
    exams?: { title: string }[];
    files?: { id: string }[];
  };
}

export function BundleCard({ bundle }: BundleCardProps) {
  const priceRupees = bundle.price_paise / 100;
  const fileCount = bundle.files?.length || 0;
  const examNames = bundle.exams?.map((e) => e.title).join(", ");

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="surface-card block overflow-hidden p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(15,23,42,0.1)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[hsla(var(--success),0.12)] px-3 py-1 text-xs font-semibold text-[hsl(var(--success))]">
          Study pack
        </span>
        <span className="text-lg font-bold text-[hsl(var(--accent-strong))]">
          ₹{priceRupees}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[hsl(var(--foreground))]">
        {bundle.title}
      </h3>
      {examNames && (
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          {examNames}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between">
        {fileCount > 0 && (
          <span className="rounded-full bg-[hsl(var(--panel-soft))] px-3 py-1 text-xs text-[hsl(var(--muted))]">
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </span>
        )}
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
          Get this pack →
        </span>
      </div>
    </Link>
  );
}
