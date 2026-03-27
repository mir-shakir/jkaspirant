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
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invalid link</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">This download link is not valid.</p>
        <Link href="/bundles" className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400">Browse resources &rarr;</Link>
      </div>
    );
  }

  const order = await getOrderByToken(token);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Download not found</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">This download link is invalid or the order is still being processed. Please check your email or try again in a moment.</p>
      </div>
    );
  }

  if (new Date(order.token_expires_at) < new Date()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Link expired</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">This download link has expired. Contact us for help.</p>
        <a href="https://t.me/jkaspirant" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Contact on Telegram</a>
      </div>
    );
  }

  const files = await getBundleFiles(order.bundle_id!);
  const downloadFiles = await createSignedDownloadUrls(files);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
        <p className="text-sm font-medium text-green-800 dark:text-green-300">Your download is ready! Links are valid for 1 hour.</p>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.bundle?.title || "Your Downloads"}</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sent to {order.buyer_email}</p>

      <div className="mt-6">
        <DownloadFileList files={downloadFiles} />
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Download link expires {new Date(order.token_expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}. Check your email for a backup link.
      </p>
    </div>
  );
}
