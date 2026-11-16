"use client";

import { useEffect, useState } from "react";
import { FOLLOW_EVENT, getFollowed, toggleFollow } from "@/lib/follow";
import { track } from "@/lib/analytics";

/** Follow an exam: it moves to the front of the home page on this phone. */
export function FollowButton({ slug, tone = "light" }: { slug: string; tone?: "light" | "dark" }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(getFollowed().includes(slug));
    sync();
    window.addEventListener(FOLLOW_EVENT, sync);
    return () => window.removeEventListener(FOLLOW_EVENT, sync);
  }, [slug]);
  const base =
    tone === "dark"
      ? on
        ? "bg-[hsl(var(--focus-fg))] text-[hsl(var(--focus))]"
        : "border border-[hsl(var(--focus-fg)/0.35)] text-[hsl(var(--focus-fg))]"
      : on
        ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
        : "border text-[hsl(var(--foreground))]";
  return (
    <button
      type="button"
      onClick={() => {
        const now = toggleFollow(slug);
        setOn(now);
        track(now ? "exam_follow" : "exam_unfollow", { exam: slug });
      }}
      aria-pressed={on}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold transition-colors ${base}`}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
        <path d="m10 2.8 2.2 4.5 5 .7-3.6 3.5.9 4.9L10 14.1l-4.5 2.3.9-4.9L2.8 8l5-.7Z" />
      </svg>
      {on ? "Following" : "Follow"}
    </button>
  );
}
