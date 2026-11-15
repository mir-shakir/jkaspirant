import Link from "next/link";
import type { Notification } from "@/lib/types/database";

interface NotificationCardProps {
  notification: Pick<Notification, "slug" | "title" | "category" | "published_at">;
}

const categoryLabels: Record<string, string> = {
  result: "Result",
  admit_card: "Admit card",
  notification: "Notice",
  answer_key: "Answer key",
};

const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/** One row on the notice board. Render inside a bordered list (see UpdatesBoard). */
export function NotificationCard({ notification }: NotificationCardProps) {
  const date = notification.published_at ? new Date(notification.published_at) : null;
  const isNew = date ? Date.now() - date.getTime() < NEW_WINDOW_MS : false;

  return (
    <Link
      href={`/notifications/${notification.slug}`}
      className="group flex gap-4 px-4 py-3.5 transition hover:bg-[hsl(var(--panel-soft)/0.6)] sm:px-5"
    >
      <div className="w-11 shrink-0 pt-0.5 text-center font-mono-num leading-none">
        {date ? (
          <>
            <span className="block text-lg font-semibold">
              {date.toLocaleDateString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" })}
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted))]">
              {date.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })}
            </span>
          </>
        ) : (
          <span className="text-[10px] uppercase text-[hsl(var(--muted))]">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1 border-l pl-4">
        <div className="flex items-center gap-2">
          {notification.category && (
            <span className="tag">{categoryLabels[notification.category] || notification.category}</span>
          )}
          {isNew && <span className="stamp">New</span>}
        </div>
        <p className="mt-1.5 text-[15px] font-medium leading-snug group-hover:text-[hsl(var(--accent))]">
          {notification.title}
        </p>
      </div>
    </Link>
  );
}

export function UpdatesBoard({ children }: { children: React.ReactNode }) {
  return <div className="surface-card divide-y overflow-hidden">{children}</div>;
}
