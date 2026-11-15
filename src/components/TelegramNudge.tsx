import { siteConfig } from "@/config/site";

/**
 * A quiet invitation to the partner Telegram channel. One per page at most,
 * placed after the thing the visitor came for, never before it.
 */
export function TelegramNudge({ className = "" }: { className?: string }) {
  if (!siteConfig.telegramUrl) return null;
  return (
    <a
      href={siteConfig.telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex min-h-[60px] items-center gap-3 rounded-2xl bg-[hsl(var(--panel-soft))] px-4 py-3 transition hover:brightness-[0.98] ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#229ED9] text-white" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
          <path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1.1-1 .2-1.5L20.5 2.7c.9-.3 1.7.2 1.4 1.6Z" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold leading-snug">Free notes and exam updates on Telegram</span>
        <span className="mt-0.5 block text-[13px] text-[hsl(var(--muted))]">{siteConfig.telegramName}</span>
      </span>
      <span className="shrink-0 text-[13.5px] font-semibold text-[#229ED9]">Join</span>
    </a>
  );
}
