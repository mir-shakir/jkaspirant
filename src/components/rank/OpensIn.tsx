"use client";

import { useEffect, useState } from "react";

function daysTo(iso: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return Math.round((Date.parse(iso) - Date.parse(today)) / 86_400_000);
}

/** "Opens in 12 days", worked out in the browser so it never goes stale. */
export function OpensIn({ iso }: { iso: string }) {
  const [d, setD] = useState(() => daysTo(iso));
  useEffect(() => setD(daysTo(iso)), [iso]);
  const text = d > 1 ? `Opens in ${d} days` : d === 1 ? "Opens tomorrow" : "Opens today, after the exam";
  return (
    <span suppressHydrationWarning className="font-mono-num">
      {text}
    </span>
  );
}
