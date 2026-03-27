import Link from "next/link";
import { ExamCard } from "@/components/ExamCard";
import { NotificationCard } from "@/components/NotificationCard";
import { BundleCard } from "@/components/BundleCard";
import { buildMetadata } from "@/lib/seo";
import { getAllExams } from "@/lib/queries/exams";
import { getLatestNotifications } from "@/lib/queries/notifications";
import { getAllBundles } from "@/lib/queries/bundles";

export const metadata = buildMetadata({
  title: "JK Aspirant — JKSSB & JKPSC Exam Hub",
  description:
    "Your one-stop resource for JKSSB and JKPSC exam notifications, syllabi, previous papers, cut-offs, and important dates.",
  canonicalPath: "/",
});

export default async function HomePage() {
  const [exams, notifications, bundles] = await Promise.all([
    getAllExams(),
    getLatestNotifications(5),
    getAllBundles(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <section className="py-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Your JKSSB &amp; JKPSC Exam Hub
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-gray-600 dark:text-gray-400">
          Notifications, syllabi, previous papers, cut-offs, and exam dates
          &mdash; all in one place. No ads. No clutter.
        </p>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Latest Notifications
          </h2>
          <Link
            href="/notifications"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No notifications yet. Check back soon.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exams
          </h2>
          <Link
            href="/exams"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </section>

      {bundles.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Study Resources
            </h2>
            <Link
              href="/bundles"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.slice(0, 3).map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
