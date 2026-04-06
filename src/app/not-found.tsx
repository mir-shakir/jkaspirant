import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="page-shell py-24">
      <div className="surface-card mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-6xl font-semibold text-[hsl(var(--foreground))]">404</h1>
        <p className="mt-4 max-w-xl text-lg text-[hsl(var(--muted))]">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="pill-link mt-6">
          Go home
        </Link>
      </div>
    </div>
  );
}
