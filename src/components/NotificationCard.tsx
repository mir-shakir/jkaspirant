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
      className="surface-card flex items-start gap-4 p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(15,23,42,0.1)]"
    >
      <div className="mt-1 h-11 w-11 shrink-0 rounded-2xl bg-[hsla(var(--warm),0.14)] text-center text-xs font-semibold leading-[2.75rem] text-[hsl(var(--warm))]">
        {formattedDate ? formattedDate.split(" ")[0] : "New"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {notification.category && (
            <span className="rounded-full bg-[hsl(var(--panel-soft))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
              {categoryLabels[notification.category] || notification.category}
            </span>
          )}
          {formattedDate && (
            <span className="text-xs text-[hsl(var(--muted))]">{formattedDate}</span>
          )}
        </div>
        <p className="mt-3 text-base font-semibold text-[hsl(var(--foreground))]">
          {notification.title}
        </p>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Read more and start preparing →
        </p>
      </div>
      <div className="hidden self-center rounded-full bg-[hsl(var(--panel-soft))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] sm:block">
        Open
      </div>
    </Link>
  );
}
