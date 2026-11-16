"use client";

import { useEffect, useState } from "react";

/** Days from today (IST) to an ISO date. */
function daysTo(iso: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return Math.round((Date.parse(iso) - Date.parse(today)) / 86_400_000);
}

/**
 * Live countdown. Pages are built ahead of time, so the number is worked out
 * again in the browser and never goes stale.
 */
export function DaysLeft({ iso, size = "md" }: { iso: string; size?: "md" | "xl" }) {
  const [d, setD] = useState(() => daysTo(iso));
  useEffect(() => setD(daysTo(iso)), [iso]);
  const big = size === "xl";
  if (d < 0)
    return <span className={`font-mono-num ${big ? "text-[15px]" : "text-[12px]"} text-[hsl(var(--muted))]`}>Held</span>;
  if (d === 0)
    return <span className={`font-mono-num font-semibold text-[hsl(var(--accent))] ${big ? "text-[34px] leading-none" : "text-[15px]"}`}>Today</span>;
  return (
    <span className="inline-flex items-baseline gap-1 font-mono-num" suppressHydrationWarning>
      <span className={`font-semibold leading-none ${d <= 7 ? "text-[hsl(var(--accent))]" : ""} ${big ? "text-[44px] tracking-tight" : "text-[22px]"}`}>{d}</span>
      <span className={`${big ? "text-[13px]" : "text-[11px]"} uppercase tracking-[0.12em] text-[hsl(var(--muted))]`}>{d === 1 ? "day" : "days"}</span>
    </span>
  );
}
