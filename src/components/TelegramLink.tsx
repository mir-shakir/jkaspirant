import { siteConfig } from "@/config/site";

interface TelegramLinkProps {
  className?: string;
  compact?: boolean;
  label?: string;
}

/** Renders nothing until NEXT_PUBLIC_TELEGRAM_URL is set. */
export function TelegramLink({ className = "", compact, label }: TelegramLinkProps) {
  if (!siteConfig.telegramUrl) return null;
  return (
    <a
      href={siteConfig.telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`items-center gap-2 rounded-lg bg-[#229ED9] font-semibold text-white transition hover:brightness-110 ${
        compact ? "px-3 py-1.5 text-xs" : "inline-flex px-4 py-2.5 text-sm"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} fill="currentColor" aria-hidden>
        <path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1.1-1 .2-1.5L20.5 2.7c.9-.3 1.7.2 1.4 1.6Z" />
      </svg>
      {label ?? (compact ? "Telegram" : "Get updates on Telegram")}
    </a>
  );
}
