import Link from "next/link";
import { DownloadFileList } from "@/components/DownloadFileList";
import { getOrderByToken, getBundleFiles, createSignedDownloadUrls } from "@/lib/queries/bundles";

interface PageProps {
  params: { slug: string };
  searchParams: { token?: string };
}

export default async function DownloadPage({ searchParams }: PageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="page-shell py-24">
        <div className="surface-card mx-auto max-w-3xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Invalid link</h1>
          <p className="mt-2 text-[hsl(var(--muted))]">This download link is not valid.</p>
          <Link href="/bundles" className="pill-link mt-5">
            Browse resources
          </Link>
        </div>
      </div>
    );
  }

  const order = await getOrderByToken(token);

  if (!order) {
    return (
      <div className="page-shell py-24">
        <div className="surface-card mx-auto max-w-3xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Download not found</h1>
          <p className="mt-2 text-[hsl(var(--muted))]">This download link is invalid or the order is still being processed. Please check your email or try again in a moment.</p>
        </div>
      </div>
    );
  }

  if (new Date(order.token_expires_at) < new Date()) {
    return (
      <div className="page-shell py-24">
        <div className="surface-card mx-auto max-w-3xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Link expired</h1>
          <p className="mt-2 text-[hsl(var(--muted))]">This download link has expired. Contact us for help.</p>
          <a href="https://t.me/jkaspirant" target="_blank" rel="noopener noreferrer" className="pill-link mt-5">
            Contact on Telegram
          </a>
        </div>
      </div>
    );
  }

  const files = await getBundleFiles(order.bundle_id!);
  const downloadFiles = await createSignedDownloadUrls(files);

  return (
    <div className="page-shell py-8">
      <div className="surface-card max-w-3xl p-6">
        <div className="mb-6 rounded-2xl bg-[hsla(var(--success),0.12)] p-4">
          <p className="text-sm font-medium text-[hsl(var(--success))]">Your download is ready. Signed links stay valid for 1 hour.</p>
        </div>

        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">{order.bundle?.title || "Your Downloads"}</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted))]">Sent to {order.buyer_email}</p>

        <div className="mt-6">
          <DownloadFileList files={downloadFiles} />
        </div>

        <p className="mt-6 text-xs text-[hsl(var(--muted))]">
          Download link expires {new Date(order.token_expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}. Check your email for a backup link.
        </p>
      </div>
    </div>
  );
}
