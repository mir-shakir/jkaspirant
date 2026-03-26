import Link from "next/link";
import type { Notification } from "@/lib/types/database";

interface NotificationCardProps {
  notification: Pick<
    Notification,
    "slug" | "title" | "category" | "published_at"
  >;
}

const categoryLabels: Record<string, string> = {
  result: "Result",
  admit_card: "Admit Card",
  notification: "Notification",
  answer_key: "Answer Key",
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const formattedDate = notification.published_at
    ? new Date(notification.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/notifications/${notification.slug}`}
      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {notification.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {notification.category && (
            <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {categoryLabels[notification.category] || notification.category}
            </span>
          )}
          {formattedDate && (
            <span className="text-xs text-gray-400">{formattedDate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
